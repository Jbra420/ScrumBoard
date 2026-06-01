import { getActiveProject } from '../router/index';
import { memberStore, taskStore, storyStore, sprintStore, generateId, stateStore } from '../store/storage';
import { showModal, showToast } from '../components/modal';
import type { TeamMember } from '../types/index';

const ROLES = ['Scrum Master','Developer','Designer','QA','DevOps','Documentation','Tester'];

export function renderTeam(): HTMLElement {
  const wrap = document.createElement('div');
  const project = getActiveProject();
  if (!project) { wrap.innerHTML = '<div class="empty-state"><h3>Sin proyecto activo</h3></div>'; return wrap; }

  const render = () => {
    const isGuest = stateStore.get().userRole === 'invitado';
    const members = memberStore.getByProject(project.id);
    const sprints = sprintStore.getByProject(project.id);
    const allTasks = taskStore.getByProject(project.id);
    const allStories = storyStore.getByProject(project.id);

    wrap.innerHTML = `
      <div class="page-header">
        <div>
          <div class="page-title">Equipo del Proyecto</div>
          <div class="page-subtitle">${members.length} integrantes · ${project.name}</div>
        </div>
        ${isGuest ? '' : '<button class="btn btn-primary" id="add-member-btn">+ Agregar Integrante</button>'}
      </div>
      <div class="grid-3">
        ${members.map(m => {
          const tasks = allTasks.filter(t => t.assigneeId === m.id);
          const done = tasks.filter(t => t.status === 'done').length;
          const inProg = tasks.filter(t => t.status === 'in-progress').length;
          const assignedStories = allStories.filter(s => s.assignees.includes(m.id));
          const totalHours = tasks.reduce((a, t) => a + t.estimatedHours, 0);
          const loggedHours = tasks.reduce((a, t) => a + t.loggedHours, 0);
          const sprintNames = m.sprintFocus.map(n => `S${n}`).join(', ');
          return `
            <div class="card member-card" style="position:relative;overflow:hidden">
              <div style="position:absolute;inset:0;background:${m.color};opacity:.04;pointer-events:none"></div>
              <div style="position:relative">
                <div style="display:flex;align-items:flex-start;gap:14px;margin-bottom:16px">
                  <div class="avatar avatar-xl" style="background:${m.color}">${m.name.charAt(0)}</div>
                  <div style="flex:1;min-width:0">
                    <div style="font-size:16px;font-weight:700">${m.name}</div>
                    <div style="font-size:12px;color:var(--text-secondary);margin:2px 0">${m.role}</div>
                    <div style="font-size:11px;color:${m.color};font-weight:600">${m.specialty}</div>
                    <div style="font-size:10px;color:var(--text-muted);margin-top:4px">Sprints: ${sprintNames}</div>
                  </div>
                  ${isGuest ? '' : `
                    <div style="display:flex;gap:4px">
                      <button class="btn btn-secondary btn-icon edit-member" data-id="${m.id}" style="padding:5px">✏️</button>
                      <button class="btn btn-danger btn-icon del-member" data-id="${m.id}" style="padding:5px">🗑</button>
                    </div>
                  `}
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px">
                  <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:8px;padding:10px;text-align:center">
                    <div style="font-size:20px;font-weight:800;color:var(--green)">${done}</div>
                    <div style="font-size:10px;color:var(--text-muted)">Tareas Completadas</div>
                  </div>
                  <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:8px;padding:10px;text-align:center">
                    <div style="font-size:20px;font-weight:800;color:var(--accent-light)">${inProg}</div>
                    <div style="font-size:10px;color:var(--text-muted)">En Progreso</div>
                  </div>
                  <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:8px;padding:10px;text-align:center">
                    <div style="font-size:20px;font-weight:800;color:var(--cyan)">${assignedStories.length}</div>
                    <div style="font-size:10px;color:var(--text-muted)">Historias Asignadas</div>
                  </div>
                  <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:8px;padding:10px;text-align:center">
                    <div style="font-size:20px;font-weight:800;color:var(--yellow)">${loggedHours}h</div>
                    <div style="font-size:10px;color:var(--text-muted)">Horas Registradas</div>
                  </div>
                </div>
                ${tasks.length > 0 ? `
                  <div style="font-size:11px;font-weight:600;color:var(--text-muted);margin-bottom:6px">CARGA DE TRABAJO</div>
                  <div style="height:6px;background:rgba(255,255,255,.08);border-radius:3px">
                    <div style="height:100%;width:${Math.min(100,tasks.length>0?done/tasks.length*100:0)}%;background:${m.color};border-radius:3px;transition:width .5s"></div>
                  </div>
                  <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text-muted);margin-top:4px">
                    <span>${done} completadas de ${tasks.length}</span>
                    <span>${totalHours}h estimadas</span>
                  </div>
                ` : '<div style="font-size:12px;color:var(--text-muted);text-align:center;padding:8px">Sin tareas asignadas</div>'}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    wrap.querySelector('#add-member-btn')?.addEventListener('click', () => openMemberModal(null, project.id, sprints, () => render()));

    wrap.querySelectorAll<HTMLElement>('.edit-member').forEach(btn => {
      btn.addEventListener('click', () => {
        const m = memberStore.getById(btn.dataset.id!);
        if (m) openMemberModal(m, project.id, sprints, () => render());
      });
    });

    wrap.querySelectorAll<HTMLElement>('.del-member').forEach(btn => {
      btn.addEventListener('click', () => {
        if (confirm('¿Eliminar integrante?')) {
          memberStore.delete(btn.dataset.id!);
          showToast('Integrante eliminado', 'success');
          render();
        }
      });
    });
  };

  render();
  return wrap;
}

function openMemberModal(m: TeamMember | null, projectId: string, sprints: any[], onDone: () => void) {
  const isNew = !m;
  const colors = ['#7C3AED','#06B6D4','#10B981','#F59E0B','#EF4444','#8B5CF6','#EC4899','#3B82F6'];
  const body = `
    <div class="form-group">
      <label class="form-label">Nombre completo</label>
      <input class="form-input" name="name" value="${m?.name||''}" placeholder="Nombre del integrante">
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
      <div class="form-group">
        <label class="form-label">Rol</label>
        <select class="form-select" name="role">
          ${ROLES.map(r => `<option value="${r}" ${m?.role===r?'selected':''}>${r}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Color</label>
        <select class="form-select" name="color">
          ${colors.map(c => `<option value="${c}" ${m?.color===c?'selected':''}>${c}</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Especialidad</label>
      <input class="form-input" name="specialty" value="${m?.specialty||''}" placeholder="Ej: Blockchain + IPFS">
    </div>
    <div class="form-group">
      <label class="form-label">Sprints principales (selecciona múltiples)</label>
      <select class="form-select" name="sprintFocus" multiple style="height:80px">
        ${sprints.map(s => `<option value="${s.number}" ${m?.sprintFocus.includes(s.number)?'selected':''}>Sprint ${s.number}: ${s.name}</option>`).join('')}
      </select>
    </div>
  `;

  const overlay = showModal(isNew ? 'Agregar Integrante' : `Editar: ${m!.name}`, body, () => {});
  overlay.querySelector('#modal-confirm')?.addEventListener('click', () => {
    const name = (overlay.querySelector<HTMLInputElement>('[name="name"]')?.value||'').trim();
    if (!name) { showToast('El nombre es requerido', 'error'); return; }
    const role = overlay.querySelector<HTMLSelectElement>('[name="role"]')?.value || 'Developer';
    const color = overlay.querySelector<HTMLSelectElement>('[name="color"]')?.value || '#7C3AED';
    const specialty = overlay.querySelector<HTMLInputElement>('[name="specialty"]')?.value || '';
    const spEl = overlay.querySelector<HTMLSelectElement>('[name="sprintFocus"]');
    const sprintFocus = spEl ? Array.from(spEl.selectedOptions).map(o => parseInt(o.value)) : [];

    if (isNew) {
      memberStore.add({ id: generateId(), projectId, name, role, specialty, color, sprintFocus });
      showToast(`${name} agregado al equipo ✅`, 'success');
    } else {
      memberStore.update({ ...m!, name, role, specialty, color, sprintFocus });
      showToast(`${name} actualizado ✅`, 'success');
    }
    overlay.remove();
    onDone();
  });
}
