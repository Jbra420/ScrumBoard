// ============================================================
// ScrumBoard Pro — Sprints & Kanban Board Page
// ============================================================

import { getActiveProject, setActiveSprint } from '../router/index';
import { sprintStore, storyStore, taskStore, memberStore, stateStore, generateId } from '../store/storage';
import { showToast, showModal } from '../components/modal';
import type { UserStory, Sprint } from '../types/index';
import { openStoryEditorModal } from '../components/storyEditor';

const statusCols = ['todo', 'in-progress', 'review', 'done'] as const;
const colLabel: Record<string, string> = { 'todo': '📋 Por Hacer', 'in-progress': '🔄 En Progreso', 'review': '👁 Revisión', 'done': '✅ Hecho' };
const colColor: Record<string, string> = { 'todo': 'var(--text-muted)', 'in-progress': 'var(--accent-light)', 'review': 'var(--yellow)', 'done': 'var(--green)' };
const priorityLabel: Record<string, string> = { critical: 'Crítico', high: 'Alto', medium: 'Medio', low: 'Bajo' };

let draggedId: string | null = null;
let currentSprintId: string | null = null;

function memberAvatar(id: string) {
  const m = memberStore.getById(id);
  if (!m) return '';
  return `<div class="avatar" style="background:${m.color};width:22px;height:22px;font-size:10px" title="${m.name}">${m.name.charAt(0)}</div>`;
}

function storyCard(story: UserStory): string {
  const epicColors: Record<string, string> = { e1: '#A855F7', e2: '#38BDF8', e3: '#34D399', e4: '#FBBF24', e5: '#FB923C', e6: '#6366F1', e7: '#F472B6' };
  const color = epicColors[story.epicId] || 'var(--accent)';
  const tasks = taskStore.getByStory(story.id);
  const taskDone = tasks.filter(t => t.status === 'done').length;
  
  return `
    <div class="kanban-card" draggable="true" data-id="${story.id}" id="card-${story.id}">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
        <span class="kanban-card-id">${story.id}</span>
        <span class="priority-dot ${story.priority}"></span>
        <span style="font-size:9px;color:var(--text-muted)">${priorityLabel[story.priority]}</span>
      </div>
      <div class="kanban-card-title">${story.title}</div>
      <div style="width:100%;height:3px;background:rgba(255,255,255,0.06);border-radius:1.5px;margin-bottom:8px;overflow:hidden">
        <div style="height:100%;width:${tasks.length > 0 ? (taskDone / tasks.length * 100) : 0}%;background:${color};border-radius:1.5px;transition:width .4s"></div>
      </div>
      <div class="kanban-card-footer">
        <div style="display:flex;gap:-4px">${story.assignees.map(memberAvatar).join('')}</div>
        <div style="display:flex;align-items:center;gap:6px">
          ${tasks.length > 0 ? `<span style="font-size:10px;color:var(--text-muted)">${taskDone}/${tasks.length} act</span>` : ''}
          <span class="kanban-card-points">${story.storyPoints}pt</span>
        </div>
      </div>
    </div>
  `;
}

function bindDragDrop(container: HTMLElement, wrap: HTMLElement) {
  const isGuest = stateStore.get().userRole === 'invitado';
  
  if (isGuest) {
    container.querySelectorAll<HTMLElement>('.kanban-card').forEach(card => {
      card.removeAttribute('draggable');
      card.addEventListener('click', () => {
        openStoryEditorModal(card.dataset.id!, () => {
          const page = renderSprints();
          wrap.replaceWith(page);
        });
      });
    });
    return;
  }

  container.querySelectorAll<HTMLElement>('.kanban-card').forEach(card => {
    card.addEventListener('dragstart', () => { draggedId = card.dataset.id!; card.classList.add('dragging'); });
    card.addEventListener('dragend', () => { card.classList.remove('dragging'); draggedId = null; });
    
    // Clicking Card opens Unified User Story Editor!
    card.addEventListener('click', () => {
      openStoryEditorModal(card.dataset.id!, () => {
        // Re-render full board on save
        const page = renderSprints();
        wrap.replaceWith(page);
      });
    });
  });

  container.querySelectorAll<HTMLElement>('.kanban-col-body').forEach(col => {
    col.addEventListener('dragover', (e) => { e.preventDefault(); col.closest('.kanban-col')!.classList.add('drag-over'); });
    col.addEventListener('dragleave', () => col.closest('.kanban-col')!.classList.remove('drag-over'));
    col.addEventListener('drop', (e) => {
      e.preventDefault();
      col.closest('.kanban-col')!.classList.remove('drag-over');
      if (!draggedId) return;
      const newStatus = col.dataset.status as UserStory['status'];
      const story = storyStore.getById(draggedId);
      if (story && story.status !== newStatus) {
        storyStore.update({ ...story, status: newStatus });
        showToast(`${story.id} → ${colLabel[newStatus]}`, 'success');
        refreshBoard(wrap);
      }
    });
  });
}

function refreshBoard(wrap: HTMLElement) {
  const board = wrap.querySelector('#kanban-board');
  if (!board) return;
  
  if (!currentSprintId) {
    board.innerHTML = `<div style="grid-column: span 4; display:flex; align-items:center; justify-content:center; padding: 40px; color: var(--text-muted); font-style: italic;">
      No hay ningún sprint seleccionado o activo. Crea un nuevo sprint para empezar.
    </div>`;
    return;
  }
  
  const stories = storyStore.getBySprint(currentSprintId);
  board.innerHTML = statusCols.map(status => {
    const cols = stories.filter(s => s.status === status);
    return `
      <div class="kanban-col">
        <div class="kanban-col-header">
          <div class="kanban-col-title"><span style="color:${colColor[status]}">${colLabel[status]}</span></div>
          <span class="kanban-col-count">${cols.length}</span>
        </div>
        <div class="kanban-col-body" data-status="${status}">
          ${cols.map(storyCard).join('')}
          <div class="kanban-drop-zone" style="height:60px;border:1px dashed var(--border);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:11px;color:var(--text-muted)">+ Soltar aquí</div>
        </div>
      </div>
    `;
  }).join('');
  
  bindDragDrop(board as HTMLElement, wrap);
}

export function renderSprints(): HTMLElement {
  const wrap = document.createElement('div');
  wrap.id = 'kanban-wrap';
  const project = getActiveProject();
  if (!project) {
    wrap.innerHTML = '<div class="empty-state"><h3>Sin proyecto activo</h3></div>';
    return wrap;
  }

  const sprints = sprintStore.getByProject(project.id);
  const state = stateStore.get();
  const isGuest = state.userRole === 'invitado';
  
  // Set default currentSprintId if none is active
  currentSprintId = state.activeSprintId || sprints.find(s => s.status === 'active')?.id || sprints[0]?.id || null;
  if (currentSprintId && !state.activeSprintId) {
    setActiveSprint(currentSprintId);
  }

  const activeSprint = sprints.find(s => s.id === currentSprintId);
  const stories = currentSprintId ? storyStore.getBySprint(currentSprintId) : [];
  const doneCount = stories.filter(s => s.status === 'done').length;
  const totalPts = stories.reduce((a, s) => a + s.storyPoints, 0);
  const donePts = stories.filter(s => s.status === 'done').reduce((a, s) => a + s.storyPoints, 0);

  wrap.innerHTML = `
    <div class="page-header" style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap: 14px;">
      <div>
        <div class="page-title">Sprints / Tablero Kanban</div>
        <div class="page-subtitle">${activeSprint ? `Sprint ${activeSprint.number}: ${activeSprint.goal}` : 'Selecciona o crea un sprint'}</div>
      </div>
      <div style="display:flex; gap:8px;">
        ${isGuest ? '' : `
          <button class="btn btn-secondary btn-sm" id="btn-add-sprint" style="background: rgba(168,85,247,0.12); color: var(--accent-light);">+ Nuevo Sprint</button>
          ${activeSprint ? `
            <button class="btn btn-secondary btn-sm" id="btn-edit-sprint">✏️ Editar Sprint</button>
            <button class="btn btn-danger btn-sm" id="btn-delete-sprint">🗑️ Eliminar Sprint</button>
          ` : ''}
        `}
      </div>
    </div>
    
    <div class="sprint-tabs">
      ${sprints.map(s => `
        <div class="sprint-tab${s.id === currentSprintId ? ' active' : ''}${s.status === 'completed' ? ' completed' : ''}" data-sid="${s.id}">
          Sprint ${s.number} ${s.status === 'completed' ? '✓' : s.status === 'active' ? '●' : ''}
        </div>
      `).join('')}
      ${sprints.length === 0 ? `<span style="font-size: 12px; color: var(--text-muted); font-style: italic;">No hay sprints creados en este proyecto.</span>` : ''}
    </div>
    
    ${activeSprint ? `
      <div style="display:flex;gap:16px;margin-bottom:16px;flex-wrap:wrap">
        <div class="card" style="flex:1;min-width:160px;padding:14px">
          <div style="font-size:11px;color:var(--text-muted)">Story Points</div>
          <div style="font-size:22px;font-weight:800;color:var(--accent-light)">${donePts}<span style="font-size:13px;color:var(--text-muted)">/${totalPts}</span></div>
        </div>
        <div class="card" style="flex:1;min-width:160px;padding:14px">
          <div style="font-size:11px;color:var(--text-muted)">Historias</div>
          <div style="font-size:22px;font-weight:800;color:var(--cyan)">${doneCount}<span style="font-size:13px;color:var(--text-muted)">/${stories.length}</span></div>
        </div>
        <div class="card" style="flex:2;min-width:200px;padding:14px">
          <div style="font-size:11px;color:var(--text-muted);margin-bottom:8px">📅 ${activeSprint.startDate} → ${activeSprint.endDate} <span style="margin-left: 6px; font-weight: 700; color: ${activeSprint.status === 'completed' ? 'var(--green)' : activeSprint.status === 'active' ? 'var(--cyan)' : 'var(--text-muted)'};">${activeSprint.status === 'completed' ? 'Completado' : activeSprint.status === 'active' ? 'Activo' : 'Pendiente'}</span></div>
          <div style="height:6px;background:rgba(255,255,255,.08);border-radius:3px">
            <div style="height:100%;width:${stories.length > 0 ? Math.round(doneCount / stories.length * 100) : 0}%;background:var(--cyan);border-radius:3px;transition:width .5s"></div>
          </div>
        </div>
      </div>
    ` : ''}
    
    <div id="kanban-board" class="kanban-board"></div>
  `;

  // Bind Sprint selection tabs
  wrap.querySelectorAll<HTMLElement>('.sprint-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const sid = tab.dataset.sid!;
      setActiveSprint(sid);
      currentSprintId = sid;
      const page = renderSprints();
      wrap.replaceWith(page);
    });
  });

  // Bind Action: Add Sprint
  wrap.querySelector('#btn-add-sprint')?.addEventListener('click', () => {
    openNewSprintModal(project.id, () => {
      // Re-render
      const page = renderSprints();
      wrap.replaceWith(page);
    });
  });

  // Bind Action: Edit active Sprint
  wrap.querySelector('#btn-edit-sprint')?.addEventListener('click', () => {
    if (activeSprint) {
      openEditSprintModal(activeSprint, () => {
        // Re-render
        const page = renderSprints();
        wrap.replaceWith(page);
      });
    }
  });

  // Bind Action: Delete active Sprint
  wrap.querySelector('#btn-delete-sprint')?.addEventListener('click', () => {
    if (activeSprint) {
      if (confirm(`¿Estás seguro de eliminar el Sprint ${activeSprint.number}? Sus historias de usuario asignadas volverán al backlog.`)) {
        // Move stories back to backlog
        const sprintStories = storyStore.getBySprint(activeSprint.id);
        sprintStories.forEach(s => {
          storyStore.update({ ...s, sprintId: '' });
        });
        
        // Delete sprint
        sprintStore.delete(activeSprint.id);
        showToast('Sprint eliminado', 'success');
        
        // Find next active sprint or fallback
        const allSprints = sprintStore.getByProject(project.id);
        const nextSprint = allSprints[0]?.id || null;
        setActiveSprint(nextSprint || '');
        currentSprintId = nextSprint;
        
        // Re-render
        const page = renderSprints();
        wrap.replaceWith(page);
      }
    }
  });

  refreshBoard(wrap);
  return wrap;
}

// ---- HELPER MODALS FOR SPRINTS ----

function openNewSprintModal(projectId: string, onDone: () => void) {
  const allSprints = sprintStore.getByProject(projectId);
  const nextNum = allSprints.length + 1;
  const today = new Date().toISOString().split('T')[0];
  const twoWeeksLater = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  const body = `
    <div class="form-group">
      <label class="form-label">Número del Sprint</label>
      <input class="form-input" id="sprint-num" type="number" value="${nextNum}">
    </div>
    <div class="form-group">
      <label class="form-label">Nombre del Sprint</label>
      <input class="form-input" id="sprint-name" type="text" placeholder="e.g. Sprint ${nextNum}" value="Sprint ${nextNum}">
    </div>
    <div class="form-group">
      <label class="form-label">Objetivo del Sprint</label>
      <textarea class="form-textarea" id="sprint-goal" placeholder="e.g. Desarrollar base de datos y autenticación de usuarios..." style="min-height: 70px;"></textarea>
    </div>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
      <div class="form-group">
        <label class="form-label">Fecha de Inicio</label>
        <input class="form-input" id="sprint-start" type="date" value="${today}">
      </div>
      <div class="form-group">
        <label class="form-label">Fecha de Fin</label>
        <input class="form-input" id="sprint-end" type="date" value="${twoWeeksLater}">
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Estado</label>
      <select class="form-select" id="sprint-status">
        <option value="pending" selected>Pendiente (Pending)</option>
        <option value="active">Activo (Active)</option>
        <option value="completed">Completado (Completed)</option>
      </select>
    </div>
  `;

  const overlay = showModal('Crear Nuevo Sprint', body, () => {});
  
  overlay.querySelector('#modal-confirm')?.addEventListener('click', () => {
    const getVal = (id: string) => (overlay.querySelector(id) as HTMLInputElement | HTMLSelectElement).value.trim();
    
    const num = parseInt(getVal('#sprint-num')) || nextNum;
    const name = getVal('#sprint-name');
    const goal = getVal('#sprint-goal') || 'Sin objetivo';
    const start = getVal('#sprint-start');
    const end = getVal('#sprint-end');
    const status = getVal('#sprint-status') as any;

    const newSprint: Sprint = {
      id: generateId(),
      projectId,
      number: num,
      name,
      goal,
      startDate: start,
      endDate: end,
      status,
      plannedPoints: 0
    };

    sprintStore.add(newSprint);
    showToast(`Sprint ${num} creado exitosamente ✅`, 'success');
    overlay.remove();
    onDone();
  });
}

function openEditSprintModal(sprint: Sprint, onDone: () => void) {
  const body = `
    <div class="form-group">
      <label class="form-label">Número del Sprint</label>
      <input class="form-input" id="sprint-num" type="number" value="${sprint.number}">
    </div>
    <div class="form-group">
      <label class="form-label">Nombre del Sprint</label>
      <input class="form-input" id="sprint-name" type="text" value="${sprint.name}">
    </div>
    <div class="form-group">
      <label class="form-label">Objetivo del Sprint</label>
      <textarea class="form-textarea" id="sprint-goal" style="min-height: 70px;">${sprint.goal}</textarea>
    </div>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
      <div class="form-group">
        <label class="form-label">Fecha de Inicio</label>
        <input class="form-input" id="sprint-start" type="date" value="${sprint.startDate}">
      </div>
      <div class="form-group">
        <label class="form-label">Fecha de Fin</label>
        <input class="form-input" id="sprint-end" type="date" value="${sprint.endDate}">
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Estado</label>
      <select class="form-select" id="sprint-status">
        <option value="pending" ${sprint.status === 'pending' ? 'selected' : ''}>Pendiente (Pending)</option>
        <option value="active" ${sprint.status === 'active' ? 'selected' : ''}>Activo (Active)</option>
        <option value="completed" ${sprint.status === 'completed' ? 'selected' : ''}>Completado (Completed)</option>
      </select>
    </div>
  `;

  const overlay = showModal(`Editar Sprint ${sprint.number}`, body, () => {});
  
  overlay.querySelector('#modal-confirm')?.addEventListener('click', () => {
    const getVal = (id: string) => (overlay.querySelector(id) as HTMLInputElement | HTMLSelectElement).value.trim();
    
    const num = parseInt(getVal('#sprint-num')) || sprint.number;
    const name = getVal('#sprint-name');
    const goal = getVal('#sprint-goal') || 'Sin objetivo';
    const start = getVal('#sprint-start');
    const end = getVal('#sprint-end');
    const status = getVal('#sprint-status') as any;

    const updatedSprint: Sprint = {
      ...sprint,
      number: num,
      name,
      goal,
      startDate: start,
      endDate: end,
      status
    };

    sprintStore.update(updatedSprint);
    showToast(`Sprint ${num} actualizado exitosamente ✅`, 'success');
    overlay.remove();
    onDone();
  });
}
