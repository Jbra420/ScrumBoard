import { projectStore, memberStore, sprintStore, epicStore, storyStore, taskStore, meetingStore, stateStore, generateId, isSeeded } from '../store/storage';
import { showToast } from '../components/modal';
import { seedData } from '../data/seed';
import type { Project } from '../types/index';
import { renderProjectManual } from '../components/projectManual';

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
  openProjectWizard(p, onDone);
}

const PROJECT_ICONS = ['⚡','🚀','🧩','🌐','🔒','📊','🛠️','💡','🎯','🏗️','🤖','🌿','🔗','📱','🏆'];

function openProjectWizard(p: Project | null, onDone: () => void) {
  const isNew = !p;
  document.getElementById('proj-wizard-overlay')?.remove();

  const overlay = document.createElement('div');
  overlay.id = 'proj-wizard-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.75);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;z-index:9999;padding:20px;';

  let step = 1;
  let selectedColor = p?.color || PROJECT_COLORS[0];
  let selectedIcon = '⚡';
  let projName = p?.name || '';
  let projDesc = p?.description || '';
  let projStatus: 'active'|'paused'|'completed' = p?.status || 'active';
  let projWeeks = p?.totalWeeks || 10;

  const WZ_CSS = `
    <style>
      @keyframes wzIn{from{opacity:0;transform:translateY(-16px) scale(.97)}to{opacity:1;transform:none}}
      #proj-wizard{background:var(--bg-card);border:1px solid var(--border);border-radius:22px;width:100%;max-width:560px;max-height:92vh;overflow-y:auto;animation:wzIn .25s cubic-bezier(.4,0,.2,1);box-shadow:0 0 60px rgba(168,85,247,.25),0 20px 60px rgba(0,0,0,.5);}
      .wz-dot{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;transition:all .3s;flex-shrink:0;}
      .wz-dot.done{background:linear-gradient(135deg,#A855F7,#6366F1);color:#fff;box-shadow:0 0 12px rgba(168,85,247,.4);}
      .wz-dot.active{background:linear-gradient(135deg,#A855F7,#6366F1);color:#fff;box-shadow:0 0 16px rgba(168,85,247,.5);}
      .wz-dot.pending{background:rgba(255,255,255,.06);color:var(--text-muted);border:1px solid var(--border);}
      .wz-line{height:2px;flex:1;margin:0 8px;transition:background .3s;background:var(--border);}
      .wz-line.done{background:linear-gradient(90deg,#A855F7,#6366F1);}
      .wz-lbl{font-size:10px;font-weight:700;color:var(--text-muted);}
      .wz-lbl.act{color:var(--accent-light);}
      .wz-input{width:100%;padding:11px 14px;border-radius:10px;background:rgba(255,255,255,.04);border:1px solid var(--border);color:var(--text-primary);font-size:13px;outline:none;transition:border-color .2s;box-sizing:border-box;}
      .wz-input:focus{border-color:rgba(168,85,247,.5);box-shadow:0 0 0 3px rgba(168,85,247,.1);}
      .lbl-sm{font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px;display:block;}
      .color-chip{width:30px;height:30px;border-radius:50%;cursor:pointer;border:3px solid transparent;transition:all .2s;}
      .color-chip.sel{border-color:#fff;transform:scale(1.18);box-shadow:0 0 12px rgba(255,255,255,.35);}
      .icon-chip{width:36px;height:36px;border-radius:10px;cursor:pointer;border:2px solid var(--border);background:rgba(255,255,255,.03);display:flex;align-items:center;justify-content:center;font-size:16px;transition:all .2s;}
      .icon-chip.sel,.icon-chip:hover{border-color:rgba(168,85,247,.6);background:rgba(168,85,247,.1);transform:scale(1.1);}
      .wz-nav{display:flex;gap:10px;margin-top:20px;}
      .wz-back{flex:1;padding:11px;border-radius:10px;background:rgba(255,255,255,.04);border:1px solid var(--border);color:var(--text-muted);font-size:13px;font-weight:700;cursor:pointer;transition:all .2s;}
      .wz-next{flex:2;padding:11px;border-radius:10px;background:linear-gradient(135deg,#A855F7,#6366F1);color:#fff;border:none;font-size:13px;font-weight:800;cursor:pointer;transition:all .2s;}
      .wz-next:hover{transform:translateY(-1px);box-shadow:0 4px 20px rgba(168,85,247,.4);}
      .wz-back:hover{background:rgba(255,255,255,.07);}
      .man-wrap{border:1px solid rgba(168,85,247,.2);border-radius:12px;overflow:hidden;margin-top:16px;}
      .man-toggle{display:flex;align-items:center;gap:10px;padding:12px 14px;cursor:pointer;background:rgba(168,85,247,.06);font-size:12px;font-weight:700;color:#C084FC;user-select:none;}
      .man-body{display:none;}
      .man-body.open{display:block;}
    </style>
  `;

  const stepIndicator = () => `
    <div style="display:flex;align-items:center;gap:0;padding:24px 24px 0;">
      <div style="display:flex;align-items:center;gap:8px;flex:1">
        <div class="wz-dot ${step>=1?(step===1?'active':'done'):'pending'}">${step>1?'✓':'1'}</div>
        <div class="wz-lbl ${step===1?'act':''}">Identidad</div>
      </div>
      <div class="wz-line ${step>1?'done':''}"></div>
      <div style="display:flex;align-items:center;gap:8px;flex:1">
        <div class="wz-dot ${step>=2?(step===2?'active':'done'):'pending'}">${step>2?'✓':'2'}</div>
        <div class="wz-lbl ${step===2?'act':''}">Detalles</div>
      </div>
      <div class="wz-line ${step>2?'done':''}"></div>
      <div style="display:flex;align-items:center;gap:8px;">
        <div class="wz-dot ${step===3?'active':'pending'}">3</div>
        <div class="wz-lbl ${step===3?'act':''}">Confirmar</div>
      </div>
    </div>
  `;

  const render = () => {
    let bodyHTML = '';

    if (step === 1) {
      bodyHTML = `
        <div style="margin-bottom:14px">
          <span class="lbl-sm">Nombre del proyecto *</span>
          <input class="wz-input" id="wz-name" type="text" placeholder="Ej: Sistema de Facturación Blockchain" value="${projName}" maxlength="60">
        </div>
        <div style="margin-bottom:14px">
          <span class="lbl-sm">Color del proyecto</span>
          <div style="display:flex;flex-wrap:wrap;gap:8px">
            ${PROJECT_COLORS.map(c=>`<div class="color-chip ${c===selectedColor?'sel':''}" data-color="${c}" style="background:${c}"></div>`).join('')}
          </div>
        </div>
        <div style="margin-bottom:16px">
          <span class="lbl-sm">Ícono del proyecto</span>
          <div style="display:flex;flex-wrap:wrap;gap:6px">
            ${PROJECT_ICONS.map(ic=>`<div class="icon-chip ${ic===selectedIcon?'sel':''}" data-icon="${ic}">${ic}</div>`).join('')}
          </div>
        </div>
        <div style="padding:14px;border-radius:12px;background:rgba(255,255,255,.03);border:1px solid var(--border);display:flex;align-items:center;gap:12px">
          <div id="prev-icon" style="width:46px;height:46px;border-radius:12px;background:${selectedColor}22;border:1px solid ${selectedColor}44;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0">${selectedIcon}</div>
          <div>
            <div id="prev-name" style="font-size:14px;font-weight:700">${projName||'Nombre del proyecto'}</div>
            <div id="prev-dot" style="font-size:11px;margin-top:2px;font-weight:700;color:${selectedColor}">● Activo</div>
          </div>
        </div>
        <div class="wz-nav">
          <button class="wz-back" id="wz-cancel">✕ Cancelar</button>
          <button class="wz-next" id="wz-s1-next">Detalles →</button>
        </div>
      `;
    } else if (step === 2) {
      bodyHTML = `
        <div style="margin-bottom:14px">
          <span class="lbl-sm">Descripción</span>
          <textarea class="wz-input" id="wz-desc" style="min-height:88px;resize:vertical" placeholder="¿Qué va a resolver este proyecto? Describe el alcance brevemente...">${projDesc}</textarea>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:4px">
          <div>
            <span class="lbl-sm">Estado inicial</span>
            <select class="wz-input" id="wz-status" style="cursor:pointer">
              <option value="active" ${projStatus==='active'?'selected':''}>🟢 Activo</option>
              <option value="paused" ${projStatus==='paused'?'selected':''}>🟡 Pausado</option>
              <option value="completed" ${projStatus==='completed'?'selected':''}>⚪ Completado</option>
            </select>
          </div>
          <div>
            <span class="lbl-sm">Duración (semanas)</span>
            <input type="range" id="wz-range" min="2" max="52" value="${projWeeks}" style="width:100%;accent-color:#A855F7;margin-bottom:6px">
            <div style="display:flex;align-items:center;gap:8px">
              <input class="wz-input" type="number" id="wz-weeks" min="2" max="52" value="${projWeeks}" style="height:34px;font-size:12px">
              <div style="padding:4px 10px;background:rgba(168,85,247,.12);border-radius:8px;font-size:13px;font-weight:800;color:#C084FC;white-space:nowrap" id="wz-wbadge">${projWeeks}s</div>
            </div>
          </div>
        </div>
        <div class="wz-nav">
          <button class="wz-back" id="wz-s2-back">← Atrás</button>
          <button class="wz-next" id="wz-s2-next">Vista Previa →</button>
        </div>
      `;
    } else {
      bodyHTML = `
        <div style="border-radius:14px;overflow:hidden;border:1px solid var(--border);background:var(--bg-secondary)">
          <div style="height:4px;background:linear-gradient(90deg,${selectedColor},${selectedColor}88,transparent)"></div>
          <div style="padding:16px">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">
              <div style="width:42px;height:42px;border-radius:12px;background:${selectedColor}22;border:1px solid ${selectedColor}40;display:flex;align-items:center;justify-content:center;font-size:18px">${selectedIcon}</div>
              <div>
                <div style="font-size:15px;font-weight:700">${projName}</div>
                <div style="font-size:11px;color:var(--text-muted);margin-top:2px">● Activo · ${projWeeks} semanas</div>
              </div>
            </div>
            <div style="font-size:11px;color:var(--text-secondary);line-height:1.5;margin-bottom:12px">${projDesc||'Sin descripción'}</div>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
              <div style="text-align:center;padding:8px;background:rgba(168,85,247,.06);border-radius:8px;border:1px solid rgba(168,85,247,.1)"><div style="font-size:16px;font-weight:800;color:#C084FC">0</div><div style="font-size:9px;color:var(--text-muted)">Miembros</div></div>
              <div style="text-align:center;padding:8px;background:rgba(56,189,248,.06);border-radius:8px;border:1px solid rgba(56,189,248,.1)"><div style="font-size:16px;font-weight:800;color:var(--cyan)">1</div><div style="font-size:9px;color:var(--text-muted)">Sprint</div></div>
              <div style="text-align:center;padding:8px;background:rgba(251,191,36,.06);border-radius:8px;border:1px solid rgba(251,191,36,.1)"><div style="font-size:16px;font-weight:800;color:var(--yellow)">0</div><div style="font-size:9px;color:var(--text-muted)">Story Pts</div></div>
            </div>
          </div>
        </div>
        <div class="man-wrap">
          <div class="man-toggle" id="man-toggle">
            <span>📘</span>
            <span style="flex:1">Manual — Creación de Proyectos Scrum</span>
            <span id="man-arrow" style="transition:transform .25s;font-size:11px">▼</span>
          </div>
          <div class="man-body" id="man-body"></div>
        </div>
        <div class="wz-nav">
          <button class="wz-back" id="wz-s3-back">← Atrás</button>
          <button class="wz-next" id="wz-confirm" style="background:linear-gradient(135deg,#34D399,#059669)">${isNew?'🚀 Crear Proyecto':'💾 Guardar Cambios'}</button>
        </div>
      `;
    }

    overlay.innerHTML = `
      ${WZ_CSS}
      <div id="proj-wizard">
        ${stepIndicator()}
        <div style="padding:20px 24px 24px">
          <div style="font-size:19px;font-weight:800;margin-bottom:3px;background:linear-gradient(135deg,#C084FC,#38BDF8);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">${['','🎯 Identidad del Proyecto','📋 Detalles del Proyecto','✅ Confirmar Proyecto'][step]}</div>
          <div style="font-size:12px;color:var(--text-muted);margin-bottom:18px">${['','Dale nombre, color e ícono a tu proyecto','Describe el alcance y duración','Revisa el resumen y consulta el manual'][step]}</div>
          ${bodyHTML}
        </div>
      </div>
    `;

    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

    if (step === 1) {
      const nameIn = overlay.querySelector('#wz-name') as HTMLInputElement;
      nameIn.addEventListener('input', () => {
        projName = nameIn.value;
        (overlay.querySelector('#prev-name') as HTMLElement).textContent = projName || 'Nombre del proyecto';
      });
      nameIn.focus();
      overlay.querySelectorAll<HTMLElement>('.color-chip').forEach(ch => {
        ch.addEventListener('click', () => {
          selectedColor = ch.dataset.color!;
          overlay.querySelectorAll('.color-chip').forEach(c=>c.classList.remove('sel'));
          ch.classList.add('sel');
          const pi = overlay.querySelector('#prev-icon') as HTMLElement;
          pi.style.background = selectedColor+'22'; pi.style.borderColor = selectedColor+'44';
          (overlay.querySelector('#prev-dot') as HTMLElement).style.color = selectedColor;
        });
      });
      overlay.querySelectorAll<HTMLElement>('.icon-chip').forEach(ch => {
        ch.addEventListener('click', () => {
          selectedIcon = ch.dataset.icon!;
          overlay.querySelectorAll('.icon-chip').forEach(c=>c.classList.remove('sel'));
          ch.classList.add('sel');
          (overlay.querySelector('#prev-icon') as HTMLElement).textContent = selectedIcon;
        });
      });
      overlay.querySelector('#wz-cancel')?.addEventListener('click', () => overlay.remove());
      overlay.querySelector('#wz-s1-next')?.addEventListener('click', () => {
        projName = nameIn.value.trim();
        if (!projName) { showToast('El nombre es requerido','error'); nameIn.focus(); return; }
        step = 2; render();
      });
    }

    if (step === 2) {
      const rangeEl = overlay.querySelector('#wz-range') as HTMLInputElement;
      const numEl   = overlay.querySelector('#wz-weeks') as HTMLInputElement;
      const badge   = overlay.querySelector('#wz-wbadge') as HTMLElement;
      rangeEl.addEventListener('input', () => { projWeeks=+rangeEl.value; numEl.value=String(projWeeks); badge.textContent=projWeeks+'s'; });
      numEl.addEventListener('input',   () => { projWeeks=Math.max(2,Math.min(52,+numEl.value||10)); rangeEl.value=String(projWeeks); badge.textContent=projWeeks+'s'; });
      overlay.querySelector('#wz-s2-back')?.addEventListener('click', () => { step=1; render(); });
      overlay.querySelector('#wz-s2-next')?.addEventListener('click', () => {
        projDesc   = (overlay.querySelector('#wz-desc') as HTMLTextAreaElement).value.trim();
        projStatus = (overlay.querySelector('#wz-status') as HTMLSelectElement).value as any;
        projWeeks  = +(overlay.querySelector('#wz-weeks') as HTMLInputElement).value || 10;
        step=3; render();
      });
    }

    if (step === 3) {
      const manBody   = overlay.querySelector('#man-body') as HTMLElement;
      const manArrow  = overlay.querySelector('#man-arrow') as HTMLElement;
      manBody.appendChild(renderProjectManual());
      overlay.querySelector('#man-toggle')?.addEventListener('click', () => {
        const isOpen = manBody.classList.toggle('open');
        manArrow.style.transform = isOpen ? 'rotate(180deg)' : '';
      });
      overlay.querySelector('#wz-s3-back')?.addEventListener('click', () => { step=2; render(); });
      overlay.querySelector('#wz-confirm')?.addEventListener('click', () => {
        const proj: Project = {
          id: p?.id || generateId(),
          name: projName,
          description: projDesc || 'Sin descripción',
          status: projStatus,
          totalWeeks: projWeeks,
          color: selectedColor,
          createdAt: p?.createdAt || new Date().toISOString().split('T')[0]
        };
        if (isNew) {
          projectStore.add(proj);
          const sp = { id:'sprint-'+generateId(), projectId:proj.id, number:1, name:'Análisis y Planificación', goal:'Establecer requerimientos iniciales.', startDate:new Date().toISOString().split('T')[0], endDate:new Date(Date.now()+14*864e5).toISOString().split('T')[0], status:'active' as const, plannedPoints:0 };
          sprintStore.add(sp);
          epicStore.add({ id:'epic-'+generateId(), projectId:proj.id, name:'Planificación Core', color:selectedColor, description:'Requerimientos y análisis' });
          const s = stateStore.get();
          stateStore.set({ ...s, activeProjectId:proj.id, activeSprintId:sp.id });
          showToast(`🚀 Proyecto "${proj.name}" creado exitosamente`,'success');
        } else {
          projectStore.update(proj);
          showToast('Proyecto actualizado ✅','success');
        }
        overlay.remove();
        onDone();
      });
    }
  };

  render();
  document.body.appendChild(overlay);
}

