// ============================================================
// ScrumBoard Pro — Persistent Storage Engine (Hybrid Memory + DB + Cloud Sync)
// ============================================================

import type { Project, TeamMember, Sprint, Epic, UserStory, Task, Meeting, AppState } from '../types/index';
import { dbService } from './indexedDB';
import { getSupabase } from './supabase';

const KEYS = {
  projects: 'scrumboard_projects',
  members: 'scrumboard_members',
  sprints: 'scrumboard_sprints',
  epics: 'scrumboard_epics',
  stories: 'scrumboard_stories',
  tasks: 'scrumboard_tasks',
  meetings: 'scrumboard_meetings',
  state: 'scrumboard_state',
  seeded: 'scrumboard_seeded',
};

// In-Memory cache variables
let _projects: Project[] = [];
let _members: TeamMember[] = [];
let _sprints: Sprint[] = [];
let _epics: Epic[] = [];
let _stories: UserStory[] = [];
let _tasks: Task[] = [];
let _meetings: Meeting[] = [];
let _state: AppState = { activeProjectId: null, activeSprintId: null, currentPage: 'landing' };

/**
 * Initializes the database, loading data from Supabase Cloud (if enabled) or local DB
 */
export async function initDatabase(): Promise<void> {
  try {
    // 1. Try to sync and load from Supabase Cloud if enabled
    const sb = getSupabase();
    if (sb) {
      try {
        console.log('ScrumBoard Pro — Syncing data from Supabase Cloud...');
        const [pRes, mRes, sRes, eRes, stRes, tRes, mtRes] = await Promise.all([
          sb.from('projects').select('*'),
          sb.from('members').select('*'),
          sb.from('sprints').select('*'),
          sb.from('epics').select('*'),
          sb.from('stories').select('*'),
          sb.from('tasks').select('*'),
          sb.from('meetings').select('*'),
        ]);

        if (!pRes.error && !mRes.error && !sRes.error && !eRes.error && !stRes.error && !tRes.error && !mtRes.error) {
          _projects = pRes.data || [];
          _members = mRes.data || [];
          _sprints = sRes.data || [];
          _epics = eRes.data || [];
          _stories = stRes.data || [];
          _tasks = tRes.data || [];
          
          // Deserialize JSON strings or objects back into Meeting models
          _meetings = (mtRes.data || []).map(m => ({
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

          // Mirror into Local IndexedDB as offline-first backup cache
          await dbService.saveAll('projects', _projects);
          await dbService.saveAll('members', _members);
          await dbService.saveAll('sprints', _sprints);
          await dbService.saveAll('epics', _epics);
          await dbService.saveAll('stories', _stories);
          await dbService.saveAll('tasks', _tasks);
          await dbService.saveAll('meetings', _meetings);
          
          // Mirror to LocalStorage
          localStorage.setItem(KEYS.projects, JSON.stringify(_projects));
          localStorage.setItem(KEYS.members, JSON.stringify(_members));
          localStorage.setItem(KEYS.sprints, JSON.stringify(_sprints));
          localStorage.setItem(KEYS.epics, JSON.stringify(_epics));
          localStorage.setItem(KEYS.stories, JSON.stringify(_stories));
          localStorage.setItem(KEYS.tasks, JSON.stringify(_tasks));
          localStorage.setItem(KEYS.meetings, JSON.stringify(_meetings));

          // Load active state from IndexedDB
          const stateArr = await dbService.getAll<any>('state');
          const dbState = stateArr.find(s => s.id === 'app_state');
          if (dbState) {
            _state = {
              activeProjectId: dbState.activeProjectId,
              activeSprintId: dbState.activeSprintId,
              currentPage: dbState.currentPage
            };
          } else {
            const localState = localStorage.getItem(KEYS.state);
            _state = localState ? JSON.parse(localState) : { activeProjectId: null, activeSprintId: null, currentPage: 'landing' };
          }

          console.log('ScrumBoard Pro — Sincronización exitosa con la nube.');
          return;
        } else {
          console.warn('Failed to load Supabase tables, falling back to local database caches:', {
            p: pRes.error, m: mRes.error, s: sRes.error, e: eRes.error, st: stRes.error, t: tRes.error, mt: mtRes.error
          });
        }
      } catch (sbErr) {
        console.error('Supabase fetch query encountered exception, falling back to local DB:', sbErr);
      }
    }

    // 2. Load from IndexedDB
    _projects = await dbService.getAll<Project>('projects');
    _members = await dbService.getAll<TeamMember>('members');
    _sprints = await dbService.getAll<Sprint>('sprints');
    _epics = await dbService.getAll<Epic>('epics');
    _stories = await dbService.getAll<UserStory>('stories');
    _tasks = await dbService.getAll<Task>('tasks');
    _meetings = await dbService.getAll<Meeting>('meetings');
    
    const stateArr = await dbService.getAll<any>('state');
    const dbState = stateArr.find(s => s.id === 'app_state');
    if (dbState) {
      _state = {
        activeProjectId: dbState.activeProjectId,
        activeSprintId: dbState.activeSprintId,
        currentPage: dbState.currentPage
      };
    } else {
      const localState = localStorage.getItem(KEYS.state);
      _state = localState ? JSON.parse(localState) : { activeProjectId: null, activeSprintId: null, currentPage: 'landing' };
    }

    // 3. Recovery fallback to LocalStorage
    if (_projects.length === 0) {
      const getLocal = <T>(key: string): T[] => {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : [];
      };
      
      _projects = getLocal<Project>(KEYS.projects);
      _members = getLocal<TeamMember>(KEYS.members);
      _sprints = getLocal<Sprint>(KEYS.sprints);
      _epics = getLocal<Epic>(KEYS.epics);
      _stories = getLocal<UserStory>(KEYS.stories);
      _tasks = getLocal<Task>(KEYS.tasks);
      _meetings = getLocal<Meeting>(KEYS.meetings);

      if (_projects.length > 0) {
        await dbService.saveAll('projects', _projects);
        await dbService.saveAll('members', _members);
        await dbService.saveAll('sprints', _sprints);
        await dbService.saveAll('epics', _epics);
        await dbService.saveAll('stories', _stories);
        await dbService.saveAll('tasks', _tasks);
        await dbService.saveAll('meetings', _meetings);
      }
    }
  } catch (err) {
    console.error('Failed to initialize database, falling back to LocalStorage', err);
    const getLocal = <T>(key: string): T[] => {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    };
    _projects = getLocal(KEYS.projects);
    _members = getLocal(KEYS.members);
    _sprints = getLocal(KEYS.sprints);
    _epics = getLocal(KEYS.epics);
    _stories = getLocal(KEYS.stories);
    _tasks = getLocal(KEYS.tasks);
    _meetings = getLocal(KEYS.meetings);
    const localState = localStorage.getItem(KEYS.state);
    _state = localState ? JSON.parse(localState) : { activeProjectId: null, activeSprintId: null, currentPage: 'landing' };
  }
}

/**
 * Resets the entire database, clearing Local DBs and remote Supabase tables, and re-seeds.
 */
export async function resetDatabaseToSeed(seedFunc: () => void): Promise<void> {
  // Clear local DBs
  await dbService.clearAll();
  Object.values(KEYS).forEach(k => localStorage.removeItem(k));
  
  // Truncate Supabase Cloud using cascading deletes
  const sb = getSupabase();
  if (sb) {
    try {
      // Deleting all projects cascades down to empty all other tables!
      await sb.from('projects').delete().neq('id', '_none_');
      console.log('Supabase Cloud database truncated successfully.');
    } catch (err) {
      console.error('Failed to truncate Supabase Cloud database:', err);
    }
  }

  _projects = [];
  _members = [];
  _sprints = [];
  _epics = [];
  _stories = [];
  _tasks = [];
  _meetings = [];
  _state = { activeProjectId: null, activeSprintId: null, currentPage: 'landing' };
  
  seedFunc();
  await initDatabase();
}

// ---- Projects Store ----
export const projectStore = {
  getAll: (): Project[] => _projects,
  save: (items: Project[]) => {
    const oldItems = [..._projects];
    _projects = items;
    localStorage.setItem(KEYS.projects, JSON.stringify(items));
    dbService.saveAll('projects', items);

    // Sync to Supabase
    const sb = getSupabase();
    if (sb) {
      const newIds = new Set(items.map(i => i.id));
      const deletedIds = oldItems.filter(i => !newIds.has(i.id)).map(i => i.id);
      
      if (deletedIds.length > 0) {
        sb.from('projects').delete().in('id', deletedIds).then(({ error }) => {
          if (error) console.error('Failed to sync project deletions to Supabase', error);
        });
      }
      if (items.length > 0) {
        sb.from('projects').upsert(items).then(({ error }) => {
          if (error) console.error('Failed to sync project upserts to Supabase', error);
        });
      }
    }
  },
  add: (p: Project) => {
    const all = projectStore.getAll();
    all.push(p);
    projectStore.save(all);
  },
  update: (p: Project) => {
    const all = projectStore.getAll().map(x => x.id === p.id ? p : x);
    projectStore.save(all);
  },
  delete: (id: string) => {
    const all = projectStore.getAll().filter(x => x.id !== id);
    projectStore.save(all);
  },
  getById: (id: string): Project | undefined => projectStore.getAll().find(x => x.id === id),
};

// ---- Members Store ----
export const memberStore = {
  getAll: (): TeamMember[] => _members,
  getByProject: (pid: string): TeamMember[] => _members.filter(m => m.projectId === pid),
  save: (items: TeamMember[]) => {
    const oldItems = [..._members];
    _members = items;
    localStorage.setItem(KEYS.members, JSON.stringify(items));
    dbService.saveAll('members', items);

    // Sync to Supabase
    const sb = getSupabase();
    if (sb) {
      const newIds = new Set(items.map(i => i.id));
      const deletedIds = oldItems.filter(i => !newIds.has(i.id)).map(i => i.id);
      
      if (deletedIds.length > 0) {
        sb.from('members').delete().in('id', deletedIds).then(({ error }) => {
          if (error) console.error('Failed to sync member deletions to Supabase', error);
        });
      }
      if (items.length > 0) {
        sb.from('members').upsert(items).then(({ error }) => {
          if (error) console.error('Failed to sync member upserts to Supabase', error);
        });
      }
    }
  },
  add: (m: TeamMember) => {
    const all = memberStore.getAll();
    all.push(m);
    memberStore.save(all);
  },
  update: (m: TeamMember) => {
    const all = memberStore.getAll().map(x => x.id === m.id ? m : x);
    memberStore.save(all);
  },
  delete: (id: string) => {
    const all = memberStore.getAll().filter(x => x.id !== id);
    memberStore.save(all);
  },
  getById: (id: string): TeamMember | undefined => memberStore.getAll().find(x => x.id === id),
};

// ---- Sprints Store ----
export const sprintStore = {
  getAll: (): Sprint[] => _sprints,
  getByProject: (pid: string): Sprint[] => _sprints.filter(s => s.projectId === pid),
  save: (items: Sprint[]) => {
    const oldItems = [..._sprints];
    _sprints = items;
    localStorage.setItem(KEYS.sprints, JSON.stringify(items));
    dbService.saveAll('sprints', items);

    // Sync to Supabase
    const sb = getSupabase();
    if (sb) {
      const newIds = new Set(items.map(i => i.id));
      const deletedIds = oldItems.filter(i => !newIds.has(i.id)).map(i => i.id);
      
      if (deletedIds.length > 0) {
        sb.from('sprints').delete().in('id', deletedIds).then(({ error }) => {
          if (error) console.error('Failed to sync sprint deletions to Supabase', error);
        });
      }
      if (items.length > 0) {
        sb.from('sprints').upsert(items).then(({ error }) => {
          if (error) console.error('Failed to sync sprint upserts to Supabase', error);
        });
      }
    }
  },
  add: (s: Sprint) => {
    const all = sprintStore.getAll();
    all.push(s);
    sprintStore.save(all);
  },
  update: (s: Sprint) => {
    const all = sprintStore.getAll().map(x => x.id === s.id ? s : x);
    sprintStore.save(all);
  },
  delete: (id: string) => {
    const all = sprintStore.getAll().filter(x => x.id !== id);
    sprintStore.save(all);
  },
  getById: (id: string): Sprint | undefined => sprintStore.getAll().find(x => x.id === id),
};

// ---- Epics Store ----
export const epicStore = {
  getAll: (): Epic[] => _epics,
  getByProject: (pid: string): Epic[] => _epics.filter(e => e.projectId === pid),
  save: (items: Epic[]) => {
    const oldItems = [..._epics];
    _epics = items;
    localStorage.setItem(KEYS.epics, JSON.stringify(items));
    dbService.saveAll('epics', items);

    // Sync to Supabase
    const sb = getSupabase();
    if (sb) {
      const newIds = new Set(items.map(i => i.id));
      const deletedIds = oldItems.filter(i => !newIds.has(i.id)).map(i => i.id);
      
      if (deletedIds.length > 0) {
        sb.from('epics').delete().in('id', deletedIds).then(({ error }) => {
          if (error) console.error('Failed to sync epic deletions to Supabase', error);
        });
      }
      if (items.length > 0) {
        sb.from('epics').upsert(items).then(({ error }) => {
          if (error) console.error('Failed to sync epic upserts to Supabase', error);
        });
      }
    }
  },
  add: (e: Epic) => {
    const all = epicStore.getAll();
    all.push(e);
    epicStore.save(all);
  },
  update: (e: Epic) => {
    const all = epicStore.getAll().map(x => x.id === e.id ? e : x);
    epicStore.save(all);
  },
  delete: (id: string) => {
    const all = epicStore.getAll().filter(x => x.id !== id);
    epicStore.save(all);
  },
  getById: (id: string): Epic | undefined => epicStore.getAll().find(x => x.id === id),
};

// ---- User Stories Store ----
export const storyStore = {
  getAll: (): UserStory[] => _stories,
  getByProject: (pid: string): UserStory[] => _stories.filter(s => s.projectId === pid),
  getBySprint: (sid: string): UserStory[] => _stories.filter(s => s.sprintId === sid),
  save: (items: UserStory[]) => {
    const oldItems = [..._stories];
    _stories = items;
    localStorage.setItem(KEYS.stories, JSON.stringify(items));
    dbService.saveAll('stories', items);

    // Sync to Supabase
    const sb = getSupabase();
    if (sb) {
      const newIds = new Set(items.map(i => i.id));
      const deletedIds = oldItems.filter(i => !newIds.has(i.id)).map(i => i.id);
      
      if (deletedIds.length > 0) {
        sb.from('stories').delete().in('id', deletedIds).then(({ error }) => {
          if (error) console.error('Failed to sync story deletions to Supabase', error);
        });
      }
      if (items.length > 0) {
        sb.from('stories').upsert(items).then(({ error }) => {
          if (error) console.error('Failed to sync story upserts to Supabase', error);
        });
      }
    }
  },
  add: (s: UserStory) => {
    const all = storyStore.getAll();
    all.push(s);
    storyStore.save(all);
  },
  update: (s: UserStory) => {
    const all = storyStore.getAll().map(x => x.id === s.id ? s : x);
    storyStore.save(all);
  },
  delete: (id: string) => {
    const all = storyStore.getAll().filter(x => x.id !== id);
    storyStore.save(all);
  },
  getById: (id: string): UserStory | undefined => storyStore.getAll().find(x => x.id === id),
};

// ---- Tasks Store ----
export const taskStore = {
  getAll: (): Task[] => _tasks,
  getByProject: (pid: string): Task[] => _tasks.filter(t => t.projectId === pid),
  getBySprint: (sid: string): Task[] => _tasks.filter(t => t.sprintId === sid),
  getByStory: (sid: string): Task[] => _tasks.filter(t => t.userStoryId === sid),
  save: (items: Task[]) => {
    const oldItems = [..._tasks];
    _tasks = items;
    localStorage.setItem(KEYS.tasks, JSON.stringify(items));
    dbService.saveAll('tasks', items);

    // Sync to Supabase
    const sb = getSupabase();
    if (sb) {
      const newIds = new Set(items.map(i => i.id));
      const deletedIds = oldItems.filter(i => !newIds.has(i.id)).map(i => i.id);
      
      if (deletedIds.length > 0) {
        sb.from('tasks').delete().in('id', deletedIds).then(({ error }) => {
          if (error) console.error('Failed to sync task deletions to Supabase', error);
        });
      }
      if (items.length > 0) {
        sb.from('tasks').upsert(items).then(({ error }) => {
          if (error) console.error('Failed to sync task upserts to Supabase', error);
        });
      }
    }
  },
  add: (t: Task) => {
    const all = taskStore.getAll();
    all.push(t);
    taskStore.save(all);
  },
  update: (t: Task) => {
    const all = taskStore.getAll().map(x => x.id === t.id ? t : x);
    taskStore.save(all);
  },
  delete: (id: string) => {
    const all = taskStore.getAll().filter(x => x.id !== id);
    taskStore.save(all);
  },
  getById: (id: string): Task | undefined => taskStore.getAll().find(x => x.id === id),
};

// ---- Meetings Store ----
export const meetingStore = {
  getAll: (): Meeting[] => _meetings,
  getByProject: (pid: string): Meeting[] => _meetings.filter(m => m.projectId === pid),
  getBySprint: (sid: string): Meeting[] => _meetings.filter(m => m.sprintId === sid),
  save: (items: Meeting[]) => {
    const oldItems = [..._meetings];
    _meetings = items;
    localStorage.setItem(KEYS.meetings, JSON.stringify(items));
    dbService.saveAll('meetings', items);

    // Sync to Supabase
    const sb = getSupabase();
    if (sb) {
      const newIds = new Set(items.map(i => i.id));
      const deletedIds = oldItems.filter(i => !newIds.has(i.id)).map(i => i.id);
      
      if (deletedIds.length > 0) {
        sb.from('meetings').delete().in('id', deletedIds).then(({ error }) => {
          if (error) console.error('Failed to sync meeting deletions to Supabase', error);
        });
      }
      
      if (items.length > 0) {
        // Map elements to standard structures
        const formatted = items.map(m => ({
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
        
        sb.from('meetings').upsert(formatted).then(({ error }) => {
          if (error) console.error('Failed to sync meeting upserts to Supabase', error);
        });
      }
    }
  },
  add: (m: Meeting) => {
    const all = meetingStore.getAll();
    all.push(m);
    meetingStore.save(all);
  },
  update: (m: Meeting) => {
    const all = meetingStore.getAll().map(x => x.id === m.id ? m : x);
    meetingStore.save(all);
  },
  delete: (id: string) => {
    const all = meetingStore.getAll().filter(x => x.id !== id);
    meetingStore.save(all);
  },
  getById: (id: string): Meeting | undefined => meetingStore.getAll().find(x => x.id === id),
};

// ---- App State Store ----
export const stateStore = {
  get: (): AppState => _state,
  set: (s: AppState) => {
    _state = s;
    localStorage.setItem(KEYS.state, JSON.stringify(s));
    dbService.saveOne('state', { id: 'app_state', ...s });
  },
};

// ---- Seed Flag ----
export const isSeeded = (): boolean => localStorage.getItem(KEYS.seeded) === 'true';
export const markSeeded = () => localStorage.setItem(KEYS.seeded, 'true');

// ---- Database Management Utilities ----
export const databaseManager = {
  exportBackup: async () => {
    const data = await dbService.exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scrumboard_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },
  importBackup: async (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const json = JSON.parse(e.target?.result as string);
          await dbService.importData(json);
          await initDatabase(); // Refresh memory
          resolve(true);
        } catch {
          resolve(false);
        }
      };
      reader.onerror = () => resolve(false);
      reader.readAsText(file);
    });
  }
};

// ---- Utils ----
export const generateId = (): string => Math.random().toString(36).slice(2, 11) + Date.now().toString(36);
