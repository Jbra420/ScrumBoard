import { projectStore, memberStore, sprintStore, epicStore, storyStore, taskStore, meetingStore, stateStore, generateId, isSeeded } from '../store/storage';
import { showModal, showToast } from '../components/modal';
import { seedData } from '../data/seed';
import type { Project } from '../types/index';

const STATUS_COLORS: Record<string, string> = { active:'var(--green)', completed:'var(--text-muted)', paused:'var(--yellow)' };
const STATUS_LABEL: Record<string, string> = { active:'Activo', completed:'Completado', paused:'Pausado' };
const PROJECT_COLORS = ['#A855F7','#6366F1','#FBBF24','#FB923C','#34D399','#38BDF8','#F472B6','#2DD4BF'];

export function renderProjects(): HTMLElement {
  const wrap = document.createElement('div');

  const render = () => {
    const projects = projectStore.getAll();
    const state = stateStore.get();

    wrap.innerHTML = `
      <div class="page-header">
        <div>
          <div class="page-title">Mis Proyectos</div>
          <div class="page-subtitle">${projects.length} proyecto${projects.length !== 1 ? 's' : ''} registrado${projects.length !== 1 ? 's' : ''}</div>
        </div>
        <div style="display:flex;gap:8px">
          <button class="btn btn-secondary" id="load-demo-btn">📦 Cargar Proyecto GAD Municipal</button>
          <button class="btn btn-primary" id="new-project-btn">+ Nuevo Proyecto</button>
        </div>
      </div>
      <div class="grid-3">
        ${projects.map(p => {
          const members = memberStore.getByProject(p.id);
          const sprints = sprintStore.getByProject(p.id);
          const stories = storyStore.getByProject(p.id);
          const done = stories.filter(s => s.status === 'done').length;
          const pct = stories.length > 0 ? Math.round(done / stories.length * 100) : 0;
          const isActive = state.activeProjectId === p.id;
          return `
            <div class="card" style="border:1px solid ${isActive ? p.color : 'var(--border)'};position:relative;overflow:hidden;${isActive ? `box-shadow:0 0 30px ${p.color}30` : ''}">
              <div style="position:absolute;top:0;left:0;right:0;height:3px;background:${p.color}"></div>
              ${isActive ? `<div style="position:absolute;top:12px;right:12px"><span class="badge badge-progress" style="background:${p.color}22;color:${p.color}">● Activo</span></div>` : ''}
              <div style="margin-top:8px">
                <div style="font-size:16px;font-weight:700;margin-bottom:4px;padding-right:${isActive?'70px':'0'}">${p.name}</div>
                <div style="font-size:12px;color:var(--text-secondary);line-height:1.5;margin-bottom:14px">${p.description.substring(0,100)}...</div>
                <div style="display:flex;gap:10px;margin-bottom:14px;flex-wrap:wrap">
                  <span style="font-size:11px;color:var(--text-muted)">👥 ${members.length} miembros</span>
                  <span style="font-size:11px;color:var(--text-muted)">🏃 ${sprints.length} sprints</span>
                  <span style="font-size:11px;color:var(--text-muted)">📋 ${stories.length} historias</span>
                  <span style="font-size:11px;color:${STATUS_COLORS[p.status]}">${STATUS_LABEL[p.status]}</span>
                </div>
                <div style="font-size:10px;color:var(--text-muted);margin-bottom:6px">Progreso general: ${pct}%</div>
                <div style="height:6px;background:rgba(255,255,255,.08);border-radius:3px;margin-bottom:14px">
                  <div style="height:100%;width:${pct}%;background:${p.color};border-radius:3px;transition:width .5s"></div>
                </div>
                <div style="display:flex;gap:6px;flex-wrap:wrap">
                  ${!isActive ? `<button class="btn btn-primary btn-sm activate-proj" data-id="${p.id}" style="background:${p.color}">● Activar</button>` : `<button class="btn btn-secondary btn-sm" disabled>✓ Proyecto activo</button>`}
                  <button class="btn btn-secondary btn-sm edit-proj" data-id="${p.id}">✏️ Editar</button>
                  <button class="btn btn-danger btn-sm del-proj" data-id="${p.id}">🗑 Eliminar</button>
                </div>
              </div>
            </div>
          `;
        }).join('')}
        ${projects.length === 0 ? `
          <div class="card" style="grid-column:1/-1;text-align:center;padding:60px 20px">
            <div style="font-size:48px;margin-bottom:16px">📂</div>
            <div style="font-size:18px;font-weight:700;margin-bottom:8px">No hay proyectos</div>
            <div style="font-size:13px;color:var(--text-muted);margin-bottom:20px">Crea tu primer proyecto Scrum o carga el proyecto GAD Municipal & Blockchain</div>
            <div style="display:flex;gap:10px;justify-content:center">
              <button class="btn btn-secondary" id="load-demo-btn2">📦 Cargar Proyecto GAD Municipal</button>
              <button class="btn btn-primary" id="new-project-btn2">+ Nuevo Proyecto</button>
            </div>
          </div>
        ` : ''}
      </div>
    `;

    const openNewModal = () => openProjectModal(null, () => { render(); updateSidebar(); });
    const loadDemo = () => {
      if (!isSeeded()) { seedData(); showToast('Proyecto GAD Municipal cargado ✅', 'success'); }
      else showToast('El proyecto GAD Municipal ya está registrado', 'info');
      render(); updateSidebar();
    };

    wrap.querySelector('#new-project-btn')?.addEventListener('click', openNewModal);
    wrap.querySelector('#new-project-btn2')?.addEventListener('click', openNewModal);
    wrap.querySelector('#load-demo-btn')?.addEventListener('click', loadDemo);
    wrap.querySelector('#load-demo-btn2')?.addEventListener('click', loadDemo);

    wrap.querySelectorAll<HTMLElement>('.activate-proj').forEach(btn => {
      btn.addEventListener('click', () => {
        const s = stateStore.get();
        stateStore.set({ ...s, activeProjectId: btn.dataset.id!, activeSprintId: null });
        showToast('Proyecto activado ✅', 'success');
        render(); updateSidebar();
      });
    });

    wrap.querySelectorAll<HTMLElement>('.edit-proj').forEach(btn => {
      btn.addEventListener('click', () => {
        const p = projectStore.getById(btn.dataset.id!);
        if (p) openProjectModal(p, () => { render(); updateSidebar(); });
      });
    });

    wrap.querySelectorAll<HTMLElement>('.del-proj').forEach(btn => {
      btn.addEventListener('click', () => {
        if (confirm('¿Eliminar este proyecto y todos sus datos?')) {
          const id = btn.dataset.id!;
          projectStore.delete(id);
          memberStore.save(memberStore.getAll().filter(m => m.projectId !== id));
          sprintStore.save(sprintStore.getAll().filter(s => s.projectId !== id));
          epicStore.save(epicStore.getAll().filter(e => e.projectId !== id));
          storyStore.save(storyStore.getAll().filter(s => s.projectId !== id));
          taskStore.save(taskStore.getAll().filter(t => t.projectId !== id));
          meetingStore.save(meetingStore.getAll().filter(m => m.projectId !== id));
          const s = stateStore.get();
          if (s.activeProjectId === id) stateStore.set({ ...s, activeProjectId: null, activeSprintId: null });
          showToast('Proyecto eliminado', 'success');
          render(); updateSidebar();
        }
      });
    });
  };

  render();
  return wrap;
}

function updateSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (sidebar) {
    const s = stateStore.get();
    const p = projectStore.getById(s.activeProjectId || '') || projectStore.getAll()[0];
    const nameEl = sidebar.querySelector('.proj-name');
    if (nameEl && p) nameEl.textContent = p.name;
  }
}

function openProjectModal(p: Project | null, onDone: () => void) {
  const isNew = !p;
  const body = `
    <div class="form-group">
      <label class="form-label">Nombre del Proyecto</label>
      <input class="form-input" name="name" value="${p?.name||''}" placeholder="Ej: GAD Municipal & Blockchain">
    </div>
    <div class="form-group">
      <label class="form-label">Descripción</label>
      <textarea class="form-textarea" name="description" style="min-height:80px">${p?.description||''}</textarea>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
      <div class="form-group">
        <label class="form-label">Estado</label>
        <select class="form-select" name="status">
          <option value="active" ${p?.status==='active'?'selected':''}>Activo</option>
          <option value="paused" ${p?.status==='paused'?'selected':''}>Pausado</option>
          <option value="completed" ${p?.status==='completed'?'selected':''}>Completado</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Duración (semanas)</label>
        <input class="form-input" name="totalWeeks" type="number" min="1" value="${p?.totalWeeks||10}">
      </div>
      <div class="form-group">
        <label class="form-label">Color del proyecto</label>
        <select class="form-select" name="color">
          ${PROJECT_COLORS.map(c => `<option value="${c}" ${p?.color===c?'selected':''}>${c}</option>`).join('')}
        </select>
      </div>
    </div>
  `;

  const overlay = showModal(isNew ? 'Nuevo Proyecto' : `Editar: ${p!.name}`, body, () => {});
  overlay.querySelector('#modal-confirm')?.addEventListener('click', () => {
    const g = (n: string) => (overlay.querySelector<HTMLInputElement>(`[name="${n}"]`)?.value || '').trim();
    const name = g('name');
    if (!name) { showToast('El nombre es requerido', 'error'); return; }
    const project: Project = {
      id: p?.id || generateId(), name, description: g('description'),
      status: g('status') as any, totalWeeks: parseInt(g('totalWeeks')) || 10,
      color: g('color') || '#7C3AED', createdAt: p?.createdAt || new Date().toISOString().split('T')[0]
    };
    if (isNew) {
      projectStore.add(project);
      const s = stateStore.get();
      stateStore.set({ ...s, activeProjectId: project.id });
      showToast(`Proyecto "${name}" creado ✅`, 'success');
    } else {
      projectStore.update(project);
      showToast(`Proyecto actualizado ✅`, 'success');
    }
    overlay.remove();
    onDone();
  });
}
