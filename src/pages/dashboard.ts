import { getActiveProject } from '../router/index';
import { sprintStore, storyStore, taskStore, memberStore, meetingStore } from '../store/storage';
import type { Sprint } from '../types/index';

function avatarColor(color: string, name: string): string {
  return `<div class="avatar" style="background:${color}">${name.charAt(0)}</div>`;
}

function progressBar(value: number, color: string = 'var(--accent)'): string {
  return `<div class="progress-bar"><div class="progress-fill" style="width:${Math.min(100,value)}%;background:${color}"></div></div>`;
}

export function renderDashboard(): HTMLElement {
  const wrap = document.createElement('div');
  const project = getActiveProject();
  if (!project) {
    wrap.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📂</div><h3>No hay proyectos</h3><p>Crea un proyecto para comenzar</p></div>`;
    return wrap;
  }

  const sprints = sprintStore.getByProject(project.id);
  const stories = storyStore.getByProject(project.id);
  const tasks = taskStore.getByProject(project.id);
  const members = memberStore.getByProject(project.id);
  const meetings = meetingStore.getByProject(project.id);

  const activeSprint = sprints.find(s => s.status === 'active') || sprints[0];
  const completedSprints = sprints.filter(s => s.status === 'completed').length;
  const totalStories = stories.length;
  const doneStories = stories.filter(s => s.status === 'done').length;
  const inProgressStories = stories.filter(s => s.status === 'in-progress').length;
  const doneTasks = tasks.filter(t => t.status === 'done').length;
  const totalPoints = stories.reduce((s, h) => s + h.storyPoints, 0);
  const donePoints = stories.filter(h => h.status === 'done').reduce((s, h) => s + h.storyPoints, 0);
  const progress = totalPoints > 0 ? Math.round((donePoints / totalPoints) * 100) : 0;

  const activeSprintStories = activeSprint ? storyStore.getBySprint(activeSprint.id) : [];
  const sprintDone = activeSprintStories.filter(s => s.status === 'done').length;
  const sprintTotal = activeSprintStories.length;

  const recentMeetings = meetings.slice(-3).reverse();

  const statusColor: Record<string, string> = { 'todo': 'var(--text-muted)', 'in-progress': 'var(--accent-light)', 'review': 'var(--yellow)', 'done': 'var(--green)' };
  const statusLabel: Record<string, string> = { 'todo': 'Por hacer', 'in-progress': 'En progreso', 'review': 'Revisión', 'done': 'Hecho' };
  const meetingLabel: Record<string, string> = { planning: '📋 Sprint Planning', daily: '☀️ Daily Scrum', review: '✅ Sprint Review', retrospective: '🔄 Retrospectiva' };

  function sprintStatusBadge(s: Sprint) {
    if (s.status === 'active') return `<span class="badge badge-progress">Activo</span>`;
    if (s.status === 'completed') return `<span class="badge badge-done">Completado</span>`;
    return `<span class="badge badge-todo">Pendiente</span>`;
  }

  wrap.innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">${project.name}</div>
        <div class="page-subtitle">${project.description.substring(0, 80)}...</div>
      </div>
      <div style="display:flex;align-items:center;gap:10px">
        <span class="badge badge-progress">● Activo</span>
        <span style="font-size:12px;color:var(--text-muted)">${project.totalWeeks} semanas · ${members.length} integrantes</span>
      </div>
    </div>

    <!-- KPI Stats -->
    <div class="grid-4 mb-20">
      <div class="card stat-card">
        <div class="stat-value" style="color:var(--accent-light)">${progress}%</div>
        <div class="stat-label">Progreso General</div>
        <div style="margin-top:8px">${progressBar(progress)}</div>
      </div>
      <div class="card stat-card">
        <div class="stat-value" style="color:var(--cyan)">${doneStories}/${totalStories}</div>
        <div class="stat-label">Historias Completadas</div>
        <div class="stat-delta stat-up">↑ ${inProgressStories} en progreso</div>
      </div>
      <div class="card stat-card">
        <div class="stat-value" style="color:var(--green)">${donePoints}</div>
        <div class="stat-label">Story Points Completados</div>
        <div class="stat-delta text-muted">de ${totalPoints} totales</div>
      </div>
      <div class="card stat-card">
        <div class="stat-value" style="color:var(--yellow)">${completedSprints}/${sprints.length}</div>
        <div class="stat-label">Sprints Completados</div>
        <div class="stat-delta text-muted">${doneTasks} tareas listas</div>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
      <!-- Sprint Activo -->
      <div class="card">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
          <div>
            <div style="font-size:11px;color:var(--text-muted);font-weight:600;text-transform:uppercase;letter-spacing:.06em">Sprint Activo</div>
            <div style="font-size:16px;font-weight:700;margin-top:2px">${activeSprint ? `Sprint ${activeSprint.number}: ${activeSprint.name}` : 'Sin sprint activo'}</div>
          </div>
          ${activeSprint ? sprintStatusBadge(activeSprint) : ''}
        </div>
        ${activeSprint ? `
          <div style="font-size:12px;color:var(--text-secondary);margin-bottom:12px;line-height:1.5">${activeSprint.goal}</div>
          <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-muted);margin-bottom:6px">
            <span>Progreso del sprint</span><span>${sprintDone}/${sprintTotal} historias</span>
          </div>
          ${progressBar(sprintTotal > 0 ? (sprintDone/sprintTotal)*100 : 0, 'var(--cyan)')}
          <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-muted);margin-top:10px">
            <span>📅 ${activeSprint.startDate}</span><span>→ ${activeSprint.endDate}</span>
          </div>
        ` : '<div class="empty-state" style="padding:20px"><p>No hay sprint activo</p></div>'}
      </div>

      <!-- Equipo -->
      <div class="card">
        <div style="font-size:11px;color:var(--text-muted);font-weight:600;text-transform:uppercase;letter-spacing:.06em;margin-bottom:12px">Equipo (${members.length})</div>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${members.map(m => {
            const memberTasks = tasks.filter(t => t.assigneeId === m.id);
            const memberDone = memberTasks.filter(t => t.status === 'done').length;
            return `
              <div style="display:flex;align-items:center;gap:10px">
                ${avatarColor(m.color, m.name)}
                <div style="flex:1;min-width:0">
                  <div style="font-size:12px;font-weight:600">${m.name} <span style="color:var(--text-muted);font-weight:400">(${m.role})</span></div>
                  <div style="font-size:10px;color:var(--text-muted)">${m.specialty}</div>
                </div>
                <div style="text-align:right;font-size:11px;color:var(--green)">${memberDone} tareas ✓</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
      <!-- Sprints Overview -->
      <div class="card">
        <div style="font-size:11px;color:var(--text-muted);font-weight:600;text-transform:uppercase;letter-spacing:.06em;margin-bottom:12px">Cronograma de Sprints</div>
        <div style="display:flex;flex-direction:column;gap:10px">
          ${sprints.map(s => {
            const sp = storyStore.getBySprint(s.id);
            const spDone = sp.filter(x => x.status === 'done').length;
            const pct = sp.length > 0 ? (spDone/sp.length)*100 : 0;
            return `
              <div>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
                  <div style="font-size:12px;font-weight:600">Sprint ${s.number}: ${s.name}</div>
                  ${sprintStatusBadge(s)}
                </div>
                ${progressBar(pct, s.status==='completed'?'var(--green)':s.status==='active'?'var(--accent)':'var(--text-muted)')}
                <div style="font-size:10px;color:var(--text-muted);margin-top:3px">${s.startDate} → ${s.endDate}</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Reuniones recientes + Stories por estado -->
      <div class="card">
        <div style="font-size:11px;color:var(--text-muted);font-weight:600;text-transform:uppercase;letter-spacing:.06em;margin-bottom:12px">Estado del Backlog</div>
        ${(['todo','in-progress','review','done'] as const).map(st => {
          const count = stories.filter(s => s.status === st).length;
          const pct = totalStories > 0 ? (count/totalStories)*100 : 0;
          return `
            <div style="margin-bottom:10px">
              <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px">
                <span style="color:${statusColor[st]}">${statusLabel[st]}</span>
                <span style="color:var(--text-muted)">${count} historias</span>
              </div>
              ${progressBar(pct, statusColor[st])}
            </div>
          `;
        }).join('')}
        <div class="sep"></div>
        <div style="font-size:11px;color:var(--text-muted);font-weight:600;text-transform:uppercase;letter-spacing:.06em;margin-bottom:10px">Últimas Reuniones</div>
        ${recentMeetings.length > 0 ? recentMeetings.map(m => `
          <div style="display:flex;gap:8px;align-items:center;padding:6px 0;border-bottom:1px solid var(--border)">
            <span style="font-size:13px">${meetingLabel[m.type]?.split(' ')[0]}</span>
            <div style="flex:1">
              <div style="font-size:12px;font-weight:500">${meetingLabel[m.type]?.substring(2)}</div>
              <div style="font-size:10px;color:var(--text-muted)">${m.date} · ${m.duration} min</div>
            </div>
          </div>
        `).join('') : '<div style="font-size:12px;color:var(--text-muted)">Sin reuniones registradas</div>'}
      </div>
    </div>
  `;

  return wrap;
}
