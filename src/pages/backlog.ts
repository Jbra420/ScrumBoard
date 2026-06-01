// ============================================================
// ScrumBoard Pro — Product Backlog Page
// ============================================================

import { getActiveProject } from '../router/index';
import { storyStore, epicStore, sprintStore, memberStore, stateStore } from '../store/storage';
import { showToast } from '../components/modal';
import { openStoryEditorModal, openNewStoryModal } from '../components/storyEditor';

const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
const priorityLabel: Record<string, string> = { critical: 'Crítico', high: 'Alto', medium: 'Medio', low: 'Bajo' };
const statusLabel: Record<string, string> = { todo: 'Por hacer', 'in-progress': 'En progreso', review: 'Revisión', done: 'Hecho' };

export function renderBacklog(): HTMLElement {
  const wrap = document.createElement('div');
  const project = getActiveProject();
  if (!project) {
    wrap.innerHTML = '<div class="empty-state"><h3>Sin proyecto activo</h3></div>';
    return wrap;
  }

  const render = () => {
    const isGuest = stateStore.get().userRole === 'invitado';
    const stories = storyStore.getByProject(project.id).sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    const epics = epicStore.getByProject(project.id);
    const sprints = sprintStore.getByProject(project.id);
    const members = memberStore.getByProject(project.id);

    const totalPts = stories.reduce((a, s) => a + s.storyPoints, 0);
    const donePts = stories.filter(s => s.status === 'done').reduce((a, s) => a + s.storyPoints, 0);

    wrap.innerHTML = `
      <div class="page-header">
        <div>
          <div class="page-title">Product Backlog</div>
          <div class="page-subtitle">${stories.length} historias · ${totalPts} story points totales · ${donePts} completados</div>
        </div>
        ${isGuest ? '' : '<button class="btn btn-primary" id="add-story-btn">+ Nueva Historia</button>'}
      </div>
      
      ${epics.map(epic => {
        const epicStories = stories.filter(s => s.epicId === epic.id);
        if (epicStories.length === 0) return '';
        const epicDone = epicStories.filter(s => s.status === 'done').length;
        
        return `
          <div class="card mb-16">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
              <div style="width:12px;height:12px;border-radius:3px;background:${epic.color}"></div>
              <div style="font-size:14px;font-weight:700">${epic.name}</div>
              <span class="badge" style="background:${epic.color}22;color:${epic.color}">${epicStories.length} historias</span>
              <span style="margin-left:auto;font-size:12px;color:var(--text-muted)">${epicDone}/${epicStories.length} completas</span>
            </div>
            
            <div style="display:flex;flex-direction:column;gap:6px">
              ${epicStories.map(s => {
                const sprint = sprints.find(sp => sp.id === s.sprintId);
                const assigneeMembers = s.assignees.map(id => members.find(m => m.id === id)).filter(Boolean);
                return `
                  <div class="story-row" data-id="${s.id}" style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--bg-card);border:1px solid var(--border);border-radius:8px;cursor:pointer;transition:all .2s">
                    <span class="priority-dot ${s.priority}"></span>
                    <span style="font-size:11px;color:var(--text-muted);font-weight:600;width:52px;flex-shrink:0">${s.id}</span>
                    <span style="flex:1;font-size:13px;font-weight:500">${s.title}</span>
                    <div style="display:flex;gap:-6px">
                      ${assigneeMembers.map(m => `<div class="avatar" style="background:${m!.color};width:22px;height:22px;font-size:9px;margin-left:-4px;border:2px solid var(--bg-secondary)">${m!.name[0]}</div>`).join('')}
                    </div>
                    <span class="badge badge-${s.status === 'todo' ? 'todo' : s.status === 'in-progress' ? 'progress' : s.status === 'review' ? 'review' : 'done'}">${statusLabel[s.status]}</span>
                    <span class="badge badge-${s.priority === 'critical' ? 'critical' : s.priority === 'high' ? 'high' : s.priority === 'medium' ? 'medium' : 'low'}">${priorityLabel[s.priority]}</span>
                    <span style="font-size:11px;color:var(--accent-light);font-weight:700;background:rgba(124,58,237,.15);padding:2px 7px;border-radius:4px">${s.storyPoints}pt</span>
                    <span style="font-size:11px;color:var(--text-muted)">${sprint ? `Sprint ${sprint.number}` : '-'}</span>
                    ${isGuest ? '' : `
                      <button class="btn btn-secondary btn-sm edit-story" data-id="${s.id}" style="padding:3px 8px">✏️</button>
                      <button class="btn btn-danger btn-sm del-story" data-id="${s.id}" style="padding:3px 8px">🗑</button>
                    `}
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `;
      }).join('')}
    `;

    // Row Click: Open Unified Story Editor Modal
    wrap.querySelectorAll<HTMLElement>('.story-row').forEach(row => {
      row.addEventListener('click', (e) => {
        if ((e.target as HTMLElement).closest('button')) return;
        openStoryEditorModal(row.dataset.id!, () => render());
      });
    });

    // Pencil Click: Open Unified Story Editor Modal
    wrap.querySelectorAll<HTMLElement>('.edit-story').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        openStoryEditorModal(btn.dataset.id!, () => render());
      });
    });

    // Trash Click: Delete User Story
    wrap.querySelectorAll<HTMLElement>('.del-story').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm('¿Eliminar esta historia y todas sus tareas asociadas?')) {
          storyStore.delete(btn.dataset.id!);
          showToast('Historia eliminada', 'success');
          render();
        }
      });
    });

    // New Story Click: Open Unified Story Editor in creation mode
    wrap.querySelector('#add-story-btn')?.addEventListener('click', () => {
      // Find active sprint if any
      const activeSprint = sprints.find(s => s.status === 'active')?.id || sprints[0]?.id || null;
      openNewStoryModal(project.id, activeSprint, () => render());
    });
  };

  render();
  return wrap;
}
