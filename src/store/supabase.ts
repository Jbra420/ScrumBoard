// ============================================================
// ScrumBoard Pro — Supabase Cloud Sync Engine (Offline-First Sync)
// ============================================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const KEYS = {
  url: 'scrumboard_supabase_url',
  key: 'scrumboard_supabase_anon_key',
  enabled: 'scrumboard_supabase_enabled',
};

// Configuration cache & persistence manager
export const supabaseConfig = {
  getUrl: (): string => localStorage.getItem(KEYS.url) || '',
  getKey: (): string => localStorage.getItem(KEYS.key) || '',
  isEnabled: (): boolean => localStorage.getItem(KEYS.enabled) === 'true',
  set: (url: string, key: string, enabled: boolean) => {
    localStorage.setItem(KEYS.url, url);
    localStorage.setItem(KEYS.key, key);
    localStorage.setItem(KEYS.enabled, String(enabled));
    // Clear dynamic client cache to force re-instantiation
    supabaseClient = null;
  },
  clear: () => {
    localStorage.removeItem(KEYS.url);
    localStorage.removeItem(KEYS.key);
    localStorage.removeItem(KEYS.enabled);
    supabaseClient = null;
  }
};

let supabaseClient: SupabaseClient | null = null;

/**
 * Returns an instantiated Supabase client if enabled and credentials exist.
 */
export function getSupabase(): SupabaseClient | null {
  if (!supabaseConfig.isEnabled()) return null;
  if (supabaseClient) return supabaseClient;

  const url = supabaseConfig.getUrl();
  const key = supabaseConfig.getKey();
  
  if (!url || !key) return null;
  
  try {
    supabaseClient = createClient(url, key);
    return supabaseClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client instance:', err);
    return null;
  }
}

/**
 * Performs a live request to test if the remote Supabase URL and Anon Key are valid.
 */
export async function testSupabaseConnection(url: string, key: string): Promise<boolean> {
  try {
    const client = createClient(url, key);
    // Execute a simple limit(0) query on projects.
    // If the table doesn't exist, we'll get a PgREST error (indicator of successful connect but no schema yet).
    // If credentials are bad, we'll get an authentication/network error.
    const { error } = await client.from('projects').select('id').limit(0);
    
    if (error) {
      // PGRST116 (No rows) or 42P01 (Table doesn't exist) indicate that the connection succeeded and talked to PostgREST,
      // but the user hasn't created the database tables yet. We consider this a valid connection!
      if (error.code === 'PGRST116' || error.code === '42P01') {
        return true;
      }
      console.warn('Supabase connection diagnostics returned warning:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase connection test failed with exception:', err);
    return false;
  }
}

/**
 * Syncs all local IndexedDB data up to the Supabase Cloud.
 * Uses upserts for transactional safety.
 */
export async function uploadLocalToSupabase(): Promise<{ success: boolean; error?: string }> {
  const sb = getSupabase();
  if (!sb) return { success: false, error: 'Supabase no está configurado o habilitado.' };

  try {
    // Dynamically import local stores to avoid circular dependency
    const { 
      projectStore, memberStore, sprintStore, epicStore, storyStore, taskStore, meetingStore 
    } = await import('./storage');

    const projects = projectStore.getAll();
    const members = memberStore.getAll();
    const sprints = sprintStore.getAll();
    const epics = epicStore.getAll();
    const stories = storyStore.getAll();
    const tasks = taskStore.getAll();
    const meetings = meetingStore.getAll();

    // 1. Projects
    if (projects.length > 0) {
      const { error } = await sb.from('projects').upsert(projects);
      if (error) return { success: false, error: `Error en tabla Proyectos: ${error.message}` };
    }

    // 2. Members
    if (members.length > 0) {
      const { error } = await sb.from('members').upsert(members);
      if (error) return { success: false, error: `Error en tabla Miembros: ${error.message}` };
    }

    // 3. Sprints
    if (sprints.length > 0) {
      const { error } = await sb.from('sprints').upsert(sprints);
      if (error) return { success: false, error: `Error en tabla Sprints: ${error.message}` };
    }

    // 4. Epics
    if (epics.length > 0) {
      const { error } = await sb.from('epics').upsert(epics);
      if (error) return { success: false, error: `Error en tabla Épicas: ${error.message}` };
    }

    // 5. Stories
    if (stories.length > 0) {
      const { error } = await sb.from('stories').upsert(stories);
      if (error) return { success: false, error: `Error en tabla Historias: ${error.message}` };
    }

    // 6. Tasks
    if (tasks.length > 0) {
      const { error } = await sb.from('tasks').upsert(tasks);
      if (error) return { success: false, error: `Error en tabla Tareas: ${error.message}` };
    }

    // 7. Meetings
    if (meetings.length > 0) {
      // Map meetings to Supabase structure, placing dailyEntries and retroNotes into JSON fields
      const formattedMeetings = meetings.map(m => ({
        id: m.id,
        projectId: m.projectId,
        sprintId: m.sprintId || null,
        type: m.type,
        date: m.date,
        duration: m.duration,
        attendees: m.attendees,
        notes: m.notes,
        dailyEntries: m.dailyEntries ? JSON.stringify(m.dailyEntries) : null,
        retroNotes: m.retroNotes ? JSON.stringify(m.retroNotes) : null,
        reviewItems: m.reviewItems || []
      }));
      
      const { error } = await sb.from('meetings').upsert(formattedMeetings);
      if (error) return { success: false, error: `Error en tabla Reuniones: ${error.message}` };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Failed to execute local -> cloud database upload sync:', err);
    return { success: false, error: err.message || 'Error inesperado de red.' };
  }
}

/**
 * Downloads all data from the Supabase Cloud and overwrites the local IndexedDB mirror.
 */
export async function downloadCloudToLocal(): Promise<{ success: boolean; error?: string }> {
  const sb = getSupabase();
  if (!sb) return { success: false, error: 'Supabase no está configurado o habilitado.' };

  try {
    // 1. Download all records in parallel
    const [pRes, mRes, sRes, eRes, stRes, tRes, mtRes] = await Promise.all([
      sb.from('projects').select('*'),
      sb.from('members').select('*'),
      sb.from('sprints').select('*'),
      sb.from('epics').select('*'),
      sb.from('stories').select('*'),
      sb.from('tasks').select('*'),
      sb.from('meetings').select('*'),
    ]);

    if (pRes.error) return { success: false, error: `Proyectos: ${pRes.error.message}` };
    if (mRes.error) return { success: false, error: `Miembros: ${mRes.error.message}` };
    if (sRes.error) return { success: false, error: `Sprints: ${sRes.error.message}` };
    if (eRes.error) return { success: false, error: `Épicas: ${eRes.error.message}` };
    if (stRes.error) return { success: false, error: `Historias: ${stRes.error.message}` };
    if (tRes.error) return { success: false, error: `Tareas: ${tRes.error.message}` };
    if (mtRes.error) return { success: false, error: `Reuniones: ${mtRes.error.message}` };

    const { dbService } = await import('./indexedDB');
    const { initDatabase } = await import('./storage');

    // 2. Format meetings JSON strings back into objects
    const parsedMeetings = (mtRes.data || []).map(m => ({
      id: m.id,
      projectId: m.projectId,
      sprintId: m.sprintId,
      type: m.type,
      date: m.date,
      duration: m.duration,
      attendees: m.attendees,
      notes: m.notes,
      dailyEntries: typeof m.dailyEntries === 'string' ? JSON.parse(m.dailyEntries) : m.dailyEntries || undefined,
      retroNotes: typeof m.retroNotes === 'string' ? JSON.parse(m.retroNotes) : m.retroNotes || undefined,
      reviewItems: m.reviewItems || undefined
    }));

    // 3. Clear IndexedDB and overwrite local stores
    await dbService.clearAll();
    
    await dbService.saveAll('projects', pRes.data || []);
    await dbService.saveAll('members', mRes.data || []);
    await dbService.saveAll('sprints', sRes.data || []);
    await dbService.saveAll('epics', eRes.data || []);
    await dbService.saveAll('stories', stRes.data || []);
    await dbService.saveAll('tasks', tRes.data || []);
    await dbService.saveAll('meetings', parsedMeetings);

    // 4. Overwrite localStorage copies as mirror
    localStorage.setItem('scrumboard_projects', JSON.stringify(pRes.data || []));
    localStorage.setItem('scrumboard_members', JSON.stringify(mRes.data || []));
    localStorage.setItem('scrumboard_sprints', JSON.stringify(sRes.data || []));
    localStorage.setItem('scrumboard_epics', JSON.stringify(eRes.data || []));
    localStorage.setItem('scrumboard_stories', JSON.stringify(stRes.data || []));
    localStorage.setItem('scrumboard_tasks', JSON.stringify(tRes.data || []));
    localStorage.setItem('scrumboard_meetings', JSON.stringify(parsedMeetings));
    
    // Set seed flag so we don't overwrite on startup
    localStorage.setItem('scrumboard_seeded', 'true');

    // 5. Reload into store memory caches
    await initDatabase();

    return { success: true };
  } catch (err: any) {
    console.error('Failed to download Cloud data to local database:', err);
    return { success: false, error: err.message || 'Error de sincronización de red.' };
  }
}
