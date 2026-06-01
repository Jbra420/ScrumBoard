// ============================================================
// ScrumBoard Pro — Unified User Story Editor Modal
// ============================================================

import type { UserStory, Task, Priority, StoryStatus, TaskStatus } from '../types/index';
import { storyStore, taskStore, memberStore, epicStore, sprintStore, generateId } from '../store/storage';
import { showToast } from './modal';

export function openStoryEditorModal(storyId: string, onSave: () => void) {
  const story = storyStore.getById(storyId);
  if (!story) {
    showToast('Historia no encontrada', 'error');
    return;
  }
  
  renderEditorModal(story, false, onSave);
}

export function openNewStoryModal(projectId: string, activeSprintId: string | null, onSave: () => void) {
  const sprints = sprintStore.getByProject(projectId);
  const epics = epicStore.getByProject(projectId);
  
  const blankStory: UserStory = {
    id: '',
    projectId,
    sprintId: activeSprintId || sprints[0]?.id || '',
    epicId: epics[0]?.id || '',
    title: '',
    description: '',
    assignees: [],
    priority: 'medium',
    storyPoints: 5,
    status: 'todo',
    acceptanceCriteria: [],
    createdAt: new Date().toISOString().split('T')[0]
  };

  renderEditorModal(blankStory, true, onSave);
}

function renderEditorModal(baseStory: UserStory, isNew: boolean, onSave: () => void) {
  // Deep copy/clone arrays so changes are atomic upon confirmation
  let localCriteria = [...baseStory.acceptanceCriteria];
  let localAssignees = [...baseStory.assignees];
  let localTasks: Task[] = isNew ? [] : [...taskStore.getByStory(baseStory.id)];
  
  const projectId = baseStory.projectId;
  const epics = epicStore.getByProject(projectId);
  const sprints = sprintStore.getByProject(projectId);
  const members = memberStore.getByProject(projectId);

  // Modal Container Overlay
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.style.animation = 'fadeIn 0.2s ease';
  
  const title = isNew ? 'Nueva Historia de Usuario' : `Editar: ${baseStory.id}`;
  
  overlay.innerHTML = `
    <div class="modal" id="modal-box" style="max-width: 900px; width: 95%;">
      <div class="modal-header">
        <div class="modal-title">${title}</div>
        <button class="modal-close btn btn-icon" id="modal-close-btn">✕</button>
      </div>
      <div class="modal-body" style="padding: 20px 24px;">
        <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 24px;" class="grid-2-col">
          
          <!-- LEFT SIDE: Story Details Form -->
          <div style="display: flex; flex-direction: column; gap: 14px;">
            <div class="form-group" style="margin-bottom:0">
              <label class="form-label">Título de la Historia</label>
              <input class="form-input" id="story-title" type="text" placeholder="Como... quiero... para..." value="${baseStory.title}">
            </div>
            
            <div class="form-group" style="margin-bottom:0">
              <label class="form-label">Descripción</label>
              <textarea class="form-textarea" id="story-desc" style="min-height: 80px;" placeholder="Detalles de la historia de usuario...">${baseStory.description}</textarea>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group" style="margin-bottom:0">
                <label class="form-label">Épica</label>
                <select class="form-select" id="story-epic">
                  ${epics.map(e => `<option value="${e.id}" ${baseStory.epicId === e.id ? 'selected' : ''}>${e.name}</option>`).join('')}
                </select>
              </div>
              <div class="form-group" style="margin-bottom:0">
                <label class="form-label">Sprint</label>
                <select class="form-select" id="story-sprint">
                  ${sprints.map(s => `<option value="${s.id}" ${baseStory.sprintId === s.id ? 'selected' : ''}>Sprint ${s.number}: ${s.name}</option>`).join('')}
                </select>
              </div>
              <div class="form-group" style="margin-bottom:0">
                <label class="form-label">Prioridad</label>
                <select class="form-select" id="story-priority">
                  <option value="low" ${baseStory.priority === 'low' ? 'selected' : ''}>Baja</option>
                  <option value="medium" ${baseStory.priority === 'medium' ? 'selected' : ''}>Media</option>
                  <option value="high" ${baseStory.priority === 'high' ? 'selected' : ''}>Alta</option>
                  <option value="critical" ${baseStory.priority === 'critical' ? 'selected' : ''}>Crítica</option>
                </select>
              </div>
              <div class="form-group" style="margin-bottom:0">
                <label class="form-label">Story Points</label>
                <input class="form-input" id="story-points" type="number" min="1" max="40" value="${baseStory.storyPoints}">
              </div>
              <div class="form-group" style="grid-column: span 2; margin-bottom:0">
                <label class="form-label">Estado de la Historia</label>
                <select class="form-select" id="story-status">
                  <option value="todo" ${baseStory.status === 'todo' ? 'selected' : ''}>📋 Por hacer</option>
                  <option value="in-progress" ${baseStory.status === 'in-progress' ? 'selected' : ''}>🔄 En progreso</option>
                  <option value="review" ${baseStory.status === 'review' ? 'selected' : ''}>👁 Revisión</option>
                  <option value="done" ${baseStory.status === 'done' ? 'selected' : ''}>✅ Hecho</option>
                </select>
              </div>
            </div>
            
            <div class="form-group" style="margin-bottom:0">
              <label class="form-label">Asignados</label>
              <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; background: rgba(168,85,247,0.03); padding: 10px; border-radius: var(--radius-sm); border: 1px solid var(--border);" id="members-list">
                ${members.map(m => `
                  <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 12px; color: var(--text-primary);">
                    <input type="checkbox" class="member-checkbox" value="${m.id}" ${localAssignees.includes(m.id) ? 'checked' : ''} style="cursor:pointer">
                    <span class="avatar" style="background:${m.color}; width:20px; height:20px; font-size:9px; border:none">${m.name[0]}</span>
                    <span>${m.name} <span style="font-size: 9px; color: var(--text-muted);">(${m.role.split(' ')[0]})</span></span>
                  </label>
                `).join('')}
              </div>
            </div>
          </div>
          
          <!-- RIGHT SIDE: Criteria + Activities & Progress -->
          <div style="display: flex; flex-direction: column; gap: 20px; border-left: 1px solid var(--border); padding-left: 20px;" class="right-panel">
            
            <!-- SECTION A: Criterios de Aceptación -->
            <div>
              <label class="form-label">Criterios de Aceptación</label>
              <div id="criteria-container" style="max-height: 110px; overflow-y: auto; display: flex; flex-direction: column; gap: 4px; margin-bottom: 8px;">
                <!-- Dynamically Rendered -->
              </div>
              <div style="display: flex; gap: 6px;">
                <input class="form-input" id="new-criteria" type="text" placeholder="Nuevo criterio..." style="padding: 6px 12px; font-size: 12px;">
                <button class="btn btn-secondary btn-sm" id="btn-add-criteria" style="white-space: nowrap;">+ Agregar</button>
              </div>
            </div>
            
            <!-- SECTION B: Actividades (Tareas) & Progreso -->
            <div style="display: flex; flex-direction: column; gap: 10px;">
              <div class="flex items-center justify-between">
                <label class="form-label" style="margin-bottom:0">Actividades / Tareas</label>
                <span id="tasks-percentage" style="font-size: 12px; font-weight: 700; color: var(--green);">0% completado</span>
              </div>
              
              <!-- Progress bar -->
              <div class="progress-bar" style="margin-bottom: 6px;">
                <div class="progress-fill" id="tasks-progress-bar" style="width: 0%; background: var(--green);"></div>
              </div>
              
              <div id="tasks-container" style="max-height: 180px; overflow-y: auto; display: flex; flex-direction: column; gap: 6px; padding: 2px;">
                <!-- Dynamically Rendered -->
              </div>
              
              <!-- Quick Task Creator -->
              <div style="display: grid; grid-template-columns: 1.2fr 1fr 50px 38px; gap: 6px; align-items: center;">
                <input class="form-input" id="new-task-title" type="text" placeholder="Nueva actividad..." style="padding: 6px 10px; font-size: 11px;">
                <select class="form-select" id="new-task-assignee" style="padding: 6px 10px; font-size: 11px;">
                  ${members.map(m => `<option value="${m.id}">${m.name}</option>`).join('')}
                </select>
                <input class="form-input" id="new-task-hours" type="number" min="1" max="100" value="4" style="padding: 6px 6px; font-size: 11px; text-align: center;" placeholder="Horas">
                <button class="btn btn-primary btn-sm btn-icon" id="btn-add-task" style="padding: 7px; height: 32px; justify-content: center;">+</button>
              </div>
            </div>
          </div>
          
        </div>
      </div>
      
      <!-- Footer actions -->
      <div class="modal-footer" style="padding: 16px 24px 20px; border-top: 1px solid var(--border);">
        <button class="btn btn-secondary" id="modal-cancel">Cancelar</button>
        <button class="btn btn-primary" id="story-save-btn">Guardar Cambios</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Render Functions
  const renderCriteriaList = () => {
    const listEl = overlay.querySelector('#criteria-container')!;
    if (localCriteria.length === 0) {
      listEl.innerHTML = `<span style="font-size: 11px; color: var(--text-muted); font-style: italic;">No hay criterios de aceptación añadidos.</span>`;
      return;
    }
    listEl.innerHTML = localCriteria.map((c, i) => `
      <div style="display: flex; align-items: center; justify-between; gap: 8px; background: rgba(255,255,255,0.02); padding: 4px 10px; border-radius: 6px; border: 1px solid var(--border);">
        <span style="color: var(--green); font-size: 12px;">✓</span>
        <span style="flex: 1; font-size: 12px; color: var(--text-secondary); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;" title="${c}">${c}</span>
        <button class="btn-delete-crit btn btn-secondary btn-icon btn-sm" data-index="${i}" style="padding: 2px 4px; font-size: 10px; border:none; background:none;">✕</button>
      </div>
    `).join('');

    // Bind delete listeners
    listEl.querySelectorAll<HTMLButtonElement>('.btn-delete-crit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const index = parseInt(btn.dataset.index!);
        localCriteria.splice(index, 1);
        renderCriteriaList();
      });
    });
  };

  const renderTaskList = () => {
    const containerEl = overlay.querySelector('#tasks-container')!;
    const pctEl = overlay.querySelector('#tasks-percentage')!;
    const barEl = overlay.querySelector('#tasks-progress-bar') as HTMLElement;
    
    // Calculate progress
    const total = localTasks.length;
    const completed = localTasks.filter(t => t.status === 'done').length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    pctEl.textContent = `${progress}% completado`;
    barEl.style.width = `${progress}%`;

    if (total === 0) {
      containerEl.innerHTML = `<span style="font-size: 11px; color: var(--text-muted); font-style: italic;">No hay actividades creadas.</span>`;
      return;
    }

    containerEl.innerHTML = localTasks.map((t) => {
      const assigned = members.find(m => m.id === t.assigneeId);
      const isChecked = t.status === 'done' ? 'checked' : '';
      const textStyle = t.status === 'done' ? 'text-decoration: line-through; color: var(--text-muted);' : 'color: var(--text-primary);';
      return `
        <div style="display: flex; align-items: center; gap: 8px; background: rgba(168,85,247,0.04); border: 1px solid var(--border); border-radius: 8px; padding: 6px 10px;">
          <input type="checkbox" class="task-checkbox" data-task-id="${t.id}" ${isChecked} style="cursor:pointer">
          <span style="flex: 1; font-size: 11px; font-weight: 500; ${textStyle}" class="truncate">${t.title}</span>
          ${assigned ? `<div class="avatar" style="background:${assigned.color}; width:18px; height:18px; font-size:8px; border:none;" title="${assigned.name}">${assigned.name[0]}</div>` : ''}
          <span style="font-size: 10px; color: var(--text-muted);">${t.estimatedHours}h</span>
          <button class="btn-delete-task btn btn-danger btn-sm" data-task-id="${t.id}" style="padding: 2px 5px; font-size: 9px;">🗑</button>
        </div>
      `;
    }).join('');

    // Bind checkbox listeners
    containerEl.querySelectorAll<HTMLInputElement>('.task-checkbox').forEach(cb => {
      cb.addEventListener('change', () => {
        const id = cb.dataset.taskId!;
        localTasks = localTasks.map(t => t.id === id ? { ...t, status: cb.checked ? 'done' as TaskStatus : 'todo' as TaskStatus } : t);
        renderTaskList();
      });
    });

    // Bind delete task listeners
    containerEl.querySelectorAll<HTMLButtonElement>('.btn-delete-task').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.taskId!;
        localTasks = localTasks.filter(t => t.id !== id);
        renderTaskList();
      });
    });
  };

  // Initial renders
  renderCriteriaList();
  renderTaskList();

  // Add Criteria Event
  overlay.querySelector('#btn-add-criteria')?.addEventListener('click', () => {
    const input = overlay.querySelector('#new-criteria') as HTMLInputElement;
    const value = input.value.trim();
    if (value) {
      localCriteria.push(value);
      input.value = '';
      renderCriteriaList();
    }
  });

  // Add Task Event
  overlay.querySelector('#btn-add-task')?.addEventListener('click', () => {
    const titleEl = overlay.querySelector('#new-task-title') as HTMLInputElement;
    const assigneeEl = overlay.querySelector('#new-task-assignee') as HTMLSelectElement;
    const hoursEl = overlay.querySelector('#new-task-hours') as HTMLInputElement;
    
    const title = titleEl.value.trim();
    const assigneeId = assigneeEl.value;
    const hours = parseInt(hoursEl.value) || 4;
    
    if (!title) {
      showToast('Por favor escribe un título para la actividad', 'error');
      return;
    }

    const newTask: Task = {
      id: generateId(),
      userStoryId: isNew ? 'HU-TEMP' : baseStory.id,
      sprintId: (overlay.querySelector('#story-sprint') as HTMLSelectElement).value,
      projectId: baseStory.projectId,
      title,
      assigneeId,
      status: 'todo',
      estimatedHours: hours,
      loggedHours: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };

    localTasks.push(newTask);
    titleEl.value = '';
    renderTaskList();
    showToast('Actividad agregada', 'success');
  });

  // Checkbox Assignees logic
  overlay.querySelectorAll<HTMLInputElement>('.member-checkbox').forEach(cb => {
    cb.addEventListener('change', () => {
      const id = cb.value;
      if (cb.checked) {
        if (!localAssignees.includes(id)) localAssignees.push(id);
      } else {
        localAssignees = localAssignees.filter(x => x !== id);
      }
    });
  });

  // Save Event
  overlay.querySelector('#story-save-btn')?.addEventListener('click', () => {
    const getVal = (id: string) => (overlay.querySelector(id) as HTMLInputElement | HTMLSelectElement).value.trim();
    
    const titleVal = getVal('#story-title');
    const descVal = getVal('#story-desc');
    const epicVal = getVal('#story-epic');
    const sprintVal = getVal('#story-sprint');
    const priorityVal = getVal('#story-priority') as Priority;
    const pointsVal = parseInt(getVal('#story-points')) || 5;
    const statusVal = getVal('#story-status') as StoryStatus;
    
    if (!titleVal) {
      showToast('El título de la historia es requerido', 'error');
      return;
    }

    let savedStoryId = baseStory.id;

    if (isNew) {
      const allStories = storyStore.getAll();
      const existingIds = allStories.map(s => s.id);
      let num = existingIds.filter(id => id.startsWith('HU-')).length + 1;
      savedStoryId = `HU-${String(num).padStart(2, '0')}`;
      
      const newStory: UserStory = {
        ...baseStory,
        id: savedStoryId,
        title: titleVal,
        description: descVal,
        epicId: epicVal,
        sprintId: sprintVal,
        priority: priorityVal,
        storyPoints: pointsVal,
        status: statusVal,
        assignees: localAssignees,
        acceptanceCriteria: localCriteria
      };

      // Add to storyStore
      storyStore.add(newStory);
      showToast(`${savedStoryId} creada exitosamente`, 'success');
    } else {
      const updatedStory: UserStory = {
        ...baseStory,
        title: titleVal,
        description: descVal,
        epicId: epicVal,
        sprintId: sprintVal,
        priority: priorityVal,
        storyPoints: pointsVal,
        status: statusVal,
        assignees: localAssignees,
        acceptanceCriteria: localCriteria
      };

      // Update storyStore
      storyStore.update(updatedStory);
      showToast(`${savedStoryId} actualizada exitosamente`, 'success');
    }

    // Save tasks associated
    if (isNew) {
      // Re-link temporary userStoryId for tasks
      localTasks.forEach(t => {
        t.userStoryId = savedStoryId;
        t.sprintId = sprintVal;
        taskStore.add(t);
      });
    } else {
      // Delete old tasks for this story and insert the local copy
      const allTasks = taskStore.getAll().filter(t => t.userStoryId !== baseStory.id);
      
      // Update sprintId in tasks in case story was moved to another sprint
      localTasks.forEach(t => {
        t.sprintId = sprintVal;
      });
      
      const newTasksList = [...allTasks, ...localTasks];
      taskStore.save(newTasksList);
    }

    overlay.remove();
    onSave();
  });

  // Cancel & Close
  const close = () => overlay.remove();
  overlay.querySelector('#modal-close-btn')?.addEventListener('click', close);
  overlay.querySelector('#modal-cancel')?.addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
}
