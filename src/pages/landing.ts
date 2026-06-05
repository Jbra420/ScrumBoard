import { projectStore, storyStore, sprintStore, memberStore, stateStore } from '../store/storage';
import { navigate } from '../router/index';
import { renderTopbar } from '../components/topbar';
import { showToast } from '../components/modal';
import { smUsersStore } from '../store/smUsers';

export function renderLanding(): HTMLElement {
  const wrap = document.createElement('div');
  const state = stateStore.get();

  // ============================================================
  // CASE A: NOT LOGGED IN — Render Premium Login Portal
  // ============================================================
  if (!state.userRole) {
    wrap.innerHTML = `
      <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;padding:24px">
        <!-- Cosmic drift background orbs -->
        <div style="position:absolute;top:-10%;left:30%;width:600px;height:600px;background:radial-gradient(circle,rgba(168,85,247,0.12) 0%,rgba(99,102,241,0.06) 40%,transparent 65%);pointer-events:none;animation:cosmicDrift 20s ease-in-out infinite alternate;z-index:0"></div>
        <div style="position:absolute;bottom:-10%;right:10%;width:500px;height:500px;background:radial-gradient(circle,rgba(56,189,248,0.1) 0%,transparent 60%);pointer-events:none;animation:cosmicDrift 25s ease-in-out infinite alternate-reverse;z-index:0"></div>
        
        <div class="card login-card-portal">
          
          <!-- LEFT SIDE: Branding & Alex Grey Sacred Agile Geometry -->
          <div class="login-left-panel">
            <div style="font-size:56px;margin-bottom:18px;filter:drop-shadow(0 0 20px rgba(168,85,247,0.4))">⚡</div>
            <h1 style="font-size:38px;font-weight:900;letter-spacing:-1px;margin-bottom:12px;background:linear-gradient(135deg,#C084FC,#38BDF8,#FB923C,#C084FC);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;background-size:300% 300%;animation:sacredGlow 6s ease-in-out infinite">
              ScrumBoard Pro
            </h1>
            <p style="font-size:14px;color:var(--text-secondary);line-height:1.6;margin-bottom:24px">
              Bienvenido al portal de control ágil. Gestiona sprints, product backlog, reuniones de equipo y métricas de rendimiento en un entorno visual de alta fidelidad.
            </p>
            
            <div style="display:flex;flex-direction:column;gap:14px">
              <div style="display:flex;align-items:flex-start;gap:12px">
                <div style="font-size:20px;background:rgba(168,85,247,0.15);width:34px;height:34px;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#C084FC">🏃</div>
                <div>
                  <div style="font-size:12.5px;font-weight:700;color:var(--text-primary)">Tableros Kanban Interactivos</div>
                  <div style="font-size:11px;color:var(--text-muted)">Visualiza el estado de las tareas de tu sprint en tiempo real.</div>
                </div>
              </div>
              <div style="display:flex;align-items:flex-start;gap:12px">
                <div style="font-size:20px;background:rgba(56,189,248,0.15);width:34px;height:34px;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#38BDF8">📅</div>
                <div>
                  <div style="font-size:12.5px;font-weight:700;color:var(--text-primary)">Ceremonias Scrum de Equipo</div>
                  <div style="font-size:11px;color:var(--text-muted)">Daily scrums, reviews, plannings y retrospectivas integradas.</div>
                </div>
              </div>
              <div style="display:flex;align-items:flex-start;gap:12px">
                <div style="font-size:20px;background:rgba(52,211,153,0.15);width:34px;height:34px;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#34D399">🔒</div>
                <div>
                  <div style="font-size:12.5px;font-weight:700;color:var(--text-primary)">Trazabilidad Blockchain & Resiliencia</div>
                  <div style="font-size:11px;color:var(--text-muted)">Respaldos locales encriptados y sincronización en la nube.</div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- RIGHT SIDE: Elegant Login Tabs -->
          <div style="display:flex;flex-direction:column;justify-content:center">
            <h2 style="font-size:20px;font-weight:800;margin-bottom:6px;color:var(--text-primary)">Acceso al Espacio</h2>
            <p style="font-size:12px;color:var(--text-muted);margin-bottom:24px">Selecciona tu perfil de usuario para ingresar.</p>
            
            <!-- Login Tabs -->
            <div style="display:flex;background:rgba(255,255,255,0.02);padding:4px;border-radius:10px;border:1px solid var(--border);margin-bottom:20px">
              <button class="login-tab-btn active" id="tab-guest-btn" style="flex:1;padding:8px 12px;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;transition:all 0.2s;background:rgba(255,255,255,0.06);color:var(--text-primary)">👤 Invitado (Lector)</button>
              <button class="login-tab-btn" id="tab-sm-btn" style="flex:1;padding:8px 12px;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;transition:all 0.2s;background:transparent;color:var(--text-muted)">✨ Scrum Master</button>
            </div>
            
            <!-- Tab Panel: Guest -->
            <div id="panel-guest" class="login-panel" style="display:flex;flex-direction:column;gap:16px">
              <div style="background:rgba(56,189,248,0.05);border:1px solid rgba(56,189,248,0.15);border-radius:10px;padding:16px">
                <div style="font-size:13px;font-weight:700;color:var(--cyan);margin-bottom:4px">⚡ Modo Visualización</div>
                <div style="font-size:11.5px;color:var(--text-secondary);line-height:1.5">
                  Ideal para revisión de avances, consultas de métricas e historias de usuario. Podrás navegar libremente pero no tendrás permisos para agregar, editar o eliminar datos.
                </div>
              </div>
              
              <button class="btn btn-primary" id="login-guest-btn" style="width:100%;height:44px;justify-content:center;background:linear-gradient(135deg,#38BDF8,#3b82f6);font-size:13px;font-weight:800;letter-spacing:0.5px;box-shadow:0 0 15px rgba(56,189,248,0.3);border-radius:8px">
                🚀 Entrar como Invitado
              </button>
            </div>
            
            <!-- Tab Panel: Scrum Master -->
            <div id="panel-sm" class="login-panel" style="display:none;flex-direction:column;gap:14px">
              <div class="form-group" style="margin-bottom:0">
                <label class="form-label" style="font-size:11px">Usuario Scrum Master</label>
                <input class="form-input" id="sm-username" type="text" placeholder="Ingresa tu usuario (e.g. DJBRA)" style="height:38px;font-size:12.5px">
              </div>
              
              <div class="form-group" style="margin-bottom:0">
                <label class="form-label" style="font-size:11px">Contraseña</label>
                <input class="form-input" id="sm-password" type="password" placeholder="••••••••" style="height:38px;font-size:12.5px">
              </div>
              
              <!-- Error message box -->
              <div id="login-error-box" style="display:none;font-size:11px;color:var(--red);background:rgba(239,68,68,0.06);border:1px solid rgba(239,68,68,0.2);padding:8px 12px;border-radius:8px">
                ❌ Credenciales incorrectas. Verifica el usuario y la contraseña.
              </div>
              
              <button class="btn btn-primary" id="login-sm-btn" style="width:100%;height:44px;justify-content:center;background:linear-gradient(135deg,#C084FC,#A855F7);font-size:13px;font-weight:800;letter-spacing:0.5px;box-shadow:0 0 15px rgba(168,85,247,0.3);border-radius:8px">
                🔑 Iniciar Sesión (SM)
              </button>
            </div>
            
          </div>
          
        </div>
      </div>
    `;
    
    // Bind Panel Tabs
    const tabGuest = wrap.querySelector('#tab-guest-btn') as HTMLElement;
    const tabSM = wrap.querySelector('#tab-sm-btn') as HTMLElement;
    const panelGuest = wrap.querySelector('#panel-guest') as HTMLElement;
    const panelSM = wrap.querySelector('#panel-sm') as HTMLElement;
    const errorBox = wrap.querySelector('#login-error-box') as HTMLElement;
    
    tabGuest.addEventListener('click', () => {
      tabGuest.style.background = 'rgba(255,255,255,0.06)';
      tabGuest.style.color = 'var(--text-primary)';
      tabSM.style.background = 'transparent';
      tabSM.style.color = 'var(--text-muted)';
      panelGuest.style.display = 'flex';
      panelSM.style.display = 'none';
      errorBox.style.display = 'none';
    });
    
    tabSM.addEventListener('click', () => {
      tabSM.style.background = 'rgba(255,255,255,0.06)';
      tabSM.style.color = 'var(--text-primary)';
      tabGuest.style.background = 'transparent';
      tabGuest.style.color = 'var(--text-muted)';
      panelSM.style.display = 'flex';
      panelGuest.style.display = 'none';
      errorBox.style.display = 'none';
    });
    
    // Bind Guest Login Trigger
    wrap.querySelector('#login-guest-btn')?.addEventListener('click', () => {
      const stateStoreObj = stateStore.get();
      stateStore.set({ ...stateStoreObj, userRole: 'invitado' });
      
      // Update topbar visuals dynamically
      const topbarEl = document.getElementById('topbar-new');
      if (topbarEl) {
        const newTopbar = renderTopbar();
        topbarEl.replaceWith(newTopbar);
        const page = window.location.hash.replace('#', '') || 'landing';
        newTopbar.style.display = page === 'landing' ? 'none' : 'flex';
      }
      
      // Refresh landing to show project selection
      const page = renderLanding();
      wrap.replaceWith(page);
    });
    
    // Bind SM Login Trigger (dynamic multi-user validation)
    wrap.querySelector('#login-sm-btn')?.addEventListener('click', () => {
      const user = (wrap.querySelector('#sm-username') as HTMLInputElement).value.trim();
      const pass = (wrap.querySelector('#sm-password') as HTMLInputElement).value;

      const matchedUser = smUsersStore.validate(user, pass);
      if (matchedUser) {
        errorBox.style.display = 'none';
        const stateStoreObj = stateStore.get();
        stateStore.set({ ...stateStoreObj, userRole: 'scrum-master', activeUsername: matchedUser.username });

        // Update topbar visuals
        const topbarEl = document.getElementById('topbar-new');
        if (topbarEl) {
          const newTopbar = renderTopbar();
          topbarEl.replaceWith(newTopbar);
          const page = window.location.hash.replace('#', '') || 'landing';
          newTopbar.style.display = page === 'landing' ? 'none' : 'flex';
        }

        // Refresh landing to show project selection
        const page = renderLanding();
        wrap.replaceWith(page);
      } else {
        errorBox.style.display = 'block';
      }
    });
    
    return wrap;
  }

  // ============================================================
  // CASE B: LOGGED IN — Render Standard Project Selector Page
  // ============================================================
  const projects = projectStore.getAll();
  const isGuest = state.userRole === 'invitado';

  wrap.innerHTML = `
    <div style="min-height:100vh;display:flex;flex-direction:column;position:relative;overflow:hidden">
      <!-- Cosmic orbs -->
      <div style="position:absolute;top:-120px;left:50%;width:600px;height:600px;transform:translateX(-50%);background:radial-gradient(circle,rgba(168,85,247,0.12) 0%,rgba(99,102,241,0.06) 40%,transparent 65%);pointer-events:none;animation:cosmicDrift 20s ease-in-out infinite alternate;z-index:0"></div>
      <div style="position:absolute;bottom:-100px;right:-100px;width:400px;height:400px;background:radial-gradient(circle,rgba(251,191,36,0.08) 0%,transparent 60%);pointer-events:none;animation:cosmicDrift 25s ease-in-out infinite alternate-reverse;z-index:0"></div>

      <!-- Hero -->
      <div style="position:relative;z-index:1;text-align:center;padding:80px 32px 40px">
        <div style="font-size:48px;margin-bottom:12px;filter:drop-shadow(0 0 20px rgba(168,85,247,0.4))">⚡</div>
        <h1 style="font-size:42px;font-weight:900;letter-spacing:-1.5px;margin-bottom:10px;background:linear-gradient(135deg,#C084FC,#FBBF24,#FB923C,#C084FC);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;background-size:300% 300%;animation:sacredGlow 6s ease-in-out infinite">
          ScrumBoard Pro
        </h1>
        <p style="font-size:16px;color:var(--text-secondary);max-width:520px;margin:0 auto 8px;line-height:1.6">
          Plataforma de gestión ágil para proyectos Scrum. Administra sprints, backlogs, equipo y reuniones con una experiencia visual inmersiva.
        </p>
        <p style="font-size:13px;color:var(--text-muted);margin-bottom:40px">
          Construido para equipos que buscan claridad, trazabilidad y control total.
        </p>

        <!-- Features -->
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;max-width:860px;margin:0 auto 48px" class="grid-4">
          ${[
            { icon:'🏃', title:'Sprints & Kanban', desc:'Tablero drag & drop con 4 columnas. Visualiza el flujo de trabajo en tiempo real.' },
            { icon:'📋', title:'Product Backlog', desc:'Gestiona historias de usuario, épicas y criterios de aceptación por prioridad.' },
            { icon:'📅', title:'Reuniones Scrum', desc:'Daily Scrum, Planning, Review y Retrospectiva con plantillas integradas.' },
            { icon:'📊', title:'Burndown Charts', desc:'Gráficas de velocidad, burndown interactivo y métricas de rendimiento.' },
          ].map(f => `
            <div class="card" style="text-align:center;padding:24px 16px;transition:all .3s cubic-bezier(.4,0,.2,1);cursor:default">
              <div style="font-size:32px;margin-bottom:10px;filter:drop-shadow(0 0 8px rgba(168,85,247,0.3))">${f.icon}</div>
              <div style="font-size:13px;font-weight:700;margin-bottom:6px;color:var(--text-primary)">${f.title}</div>
              <div style="font-size:11px;color:var(--text-muted);line-height:1.5">${f.desc}</div>
            </div>
          `).join('')}
        </div>

        <!-- Additional features row -->
        <div style="display:flex;justify-content:center;gap:28px;margin-bottom:56px;flex-wrap:wrap">
          ${[
            { icon:'👥', text:'Gestión de Equipo' },
            { icon:'🔄', text:'Multi-Proyecto' },
            { icon:'💾', text:'Datos Locales' },
            { icon:'🚀', text:'Deploy en Vercel' },
            { icon:'🎨', text:'Tema Alex Grey' },
          ].map(f => `
            <div style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text-secondary)">
              <span style="font-size:16px">${f.icon}</span>${f.text}
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Projects Section -->
      <div style="position:relative;z-index:1;max-width:960px;margin:0 auto;padding:0 32px 80px;width:100%">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px">
          <div>
            <h2 style="font-size:22px;font-weight:800;background:linear-gradient(135deg,var(--text-primary),var(--accent-light));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">
              Selecciona un Proyecto
            </h2>
            <p style="font-size:12px;color:var(--text-muted);margin-top:2px">${projects.length} proyecto${projects.length !== 1 ? 's' : ''} disponible${projects.length !== 1 ? 's' : ''}</p>
          </div>
          ${isGuest 
            ? '<button class="btn btn-secondary logout-btn" id="landing-logout-btn" style="border-radius:20px; font-size:11px; font-weight:700; padding: 6px 16px; border-color:rgba(239,68,68,0.4); color:var(--red); background:rgba(239,68,68,0.05); gap:6px; display:inline-flex; align-items:center;">🚪 Cerrar Sesión</button>' 
            : '<button class="btn btn-primary" id="landing-new-proj">+ Nuevo Proyecto</button>'
          }
        </div>

        ${projects.length > 0 ? `
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px" class="grid-3">
            ${projects.map(p => {
              const members = memberStore.getByProject(p.id);
              const sprints = sprintStore.getByProject(p.id);
              const stories = storyStore.getByProject(p.id);
              const done = stories.filter(s => s.status === 'done').length;
              const pct = stories.length > 0 ? Math.round(done / stories.length * 100) : 0;
              const activeSprint = sprints.find(s => s.status === 'active');
              const totalPts = stories.reduce((a, s) => a + s.storyPoints, 0);
              const donePts = stories.filter(s => s.status === 'done').reduce((a, s) => a + s.storyPoints, 0);

              return `
                <div class="project-select-card card" data-pid="${p.id}" style="cursor:pointer;padding:0;overflow:hidden;transition:all .3s cubic-bezier(.4,0,.2,1)">
                  <!-- Top accent bar -->
                  <div style="height:4px;background:linear-gradient(90deg,${p.color},${p.color}88,transparent)"></div>
                  <div style="padding:20px">
                    <!-- Header -->
                    <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:14px">
                      <div style="width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,${p.color}25,${p.color}10);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;border:1px solid ${p.color}30">
                        ⚡
                      </div>
                      <div style="flex:1;min-width:0">
                        <div style="font-size:15px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${p.name}</div>
                        <div style="font-size:11px;color:var(--text-muted);margin-top:2px;display:flex;align-items:center;gap:4px">
                          <span style="width:6px;height:6px;border-radius:50%;background:${p.status === 'active' ? 'var(--green)' : 'var(--text-muted)'};${p.status === 'active' ? 'box-shadow:0 0 6px var(--green)' : ''}"></span>
                          ${p.status === 'active' ? 'Activo' : p.status === 'completed' ? 'Completado' : 'Pausado'}
                          · ${p.totalWeeks} semanas
                        </div>
                      </div>
                    </div>

                    <!-- Description -->
                    <div style="font-size:11px;color:var(--text-secondary);line-height:1.5;margin-bottom:14px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">
                      ${p.description}
                    </div>

                    <!-- Stats grid -->
                    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px">
                      <div style="text-align:center;padding:8px;background:rgba(168,85,247,0.06);border-radius:8px;border:1px solid rgba(168,85,247,0.1)">
                        <div style="font-size:18px;font-weight:800;color:var(--accent-light)">${members.length}</div>
                        <div style="font-size:9px;color:var(--text-muted)">Miembros</div>
                      </div>
                      <div style="text-align:center;padding:8px;background:rgba(56,189,248,0.06);border-radius:8px;border:1px solid rgba(56,189,248,0.1)">
                        <div style="font-size:18px;font-weight:800;color:var(--cyan)">${sprints.length}</div>
                        <div style="font-size:9px;color:var(--text-muted)">Sprints</div>
                      </div>
                      <div style="text-align:center;padding:8px;background:rgba(251,191,36,0.06);border-radius:8px;border:1px solid rgba(251,191,36,0.1)">
                        <div style="font-size:18px;font-weight:800;color:var(--yellow)">${donePts}<span style="font-size:10px;color:var(--text-muted)">/${totalPts}</span></div>
                        <div style="font-size:9px;color:var(--text-muted)">Story Pts</div>
                      </div>
                    </div>

                    <!-- Progress -->
                    <div style="display:flex;justify-content:space-between;align-items:center;font-size:10px;color:var(--text-muted);margin-bottom:6px">
                      <span>Progreso general</span>
                      <span style="font-weight:700;color:${p.color}">${pct}%</span>
                    </div>
                    <div style="height:6px;background:rgba(168,85,247,0.08);border-radius:3px;overflow:hidden">
                      <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,${p.color},${p.color}aa);border-radius:3px;transition:width .8s cubic-bezier(.4,0,.2,1)"></div>
                    </div>

                    <!-- Sprint & Team -->
                    <div style="display:flex;align-items:center;justify-content:space-between;margin-top:12px">
                      ${activeSprint ? `<div style="font-size:10px;color:var(--text-secondary)">🏃 Sprint ${activeSprint.number}: <span style="color:var(--accent-light)">${activeSprint.name}</span></div>` : '<div style="font-size:10px;color:var(--text-muted)">Sin sprint activo</div>'}
                      <div style="display:flex">
                        ${members.slice(0, 4).map(m => `<div class="avatar" style="background:${m.color};width:22px;height:22px;font-size:9px;margin-left:-6px;border:2px solid var(--bg-primary)">${m.name[0]}</div>`).join('')}
                        ${members.length > 4 ? `<div class="avatar" style="background:var(--bg-card);width:22px;height:22px;font-size:8px;margin-left:-6px;border:2px solid var(--bg-primary);color:var(--text-muted)">+${members.length - 4}</div>` : ''}
                      </div>
                    </div>

                    <!-- Action button -->
                    <button class="btn btn-primary btn-sm select-proj-btn" data-pid="${p.id}" style="width:100%;margin-top:14px;justify-content:center;background:linear-gradient(135deg,${p.color},${p.color}cc)">
                      ⚡ Abrir Proyecto
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        ` : `
          <div class="card" style="text-align:center;padding:60px 20px">
            <div style="font-size:56px;margin-bottom:16px;filter:drop-shadow(0 0 16px rgba(168,85,247,0.3))">🚀</div>
            <div style="font-size:18px;font-weight:700;margin-bottom:8px">Comienza tu primer proyecto</div>
            <div style="font-size:13px;color:var(--text-muted);margin-bottom:24px;max-width:360px;margin-left:auto;margin-right:auto">
              ${isGuest ? 'Actualmente estás en el modo de Invitado de solo lectura. Pídele al Scrum Master que cree tu primer proyecto.' : 'Crea un nuevo proyecto Scrum o carga el proyecto GAD Municipal & Blockchain para comenzar.'}
            </div>
            ${isGuest ? '' : `
              <div style="display:flex;gap:10px;justify-content:center">
                <button class="btn btn-primary" id="landing-new-proj2">+ Nuevo Proyecto</button>
              </div>
            `}
          </div>
        `}

        <!-- Footer -->
        <div style="text-align:center;margin-top:48px;padding-top:24px;border-top:1px solid var(--border)">
          <div style="font-size:11px;color:var(--text-muted)">ScrumBoard Pro v1.0 — Gestión Ágil · Inspirado en el arte de Alex Grey</div>
        </div>
      </div>
    </div>
  `;

  // Event bindings
  wrap.querySelectorAll<HTMLElement>('.select-proj-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      selectProject(btn.dataset.pid!);
    });
  });

  wrap.querySelectorAll<HTMLElement>('.project-select-card').forEach(card => {
    card.addEventListener('click', () => selectProject(card.dataset.pid!));
  });

  if (!isGuest) {
    wrap.querySelector('#landing-new-proj')?.addEventListener('click', () => navigate('projects'));
    wrap.querySelector('#landing-new-proj2')?.addEventListener('click', () => navigate('projects'));
  } else {
    wrap.querySelector('#landing-logout-btn')?.addEventListener('click', () => {
      const stateObj = stateStore.get();
      stateStore.set({ ...stateObj, userRole: null, activeProjectId: null, activeSprintId: null });
      navigate('landing');
      showToast('Sesión cerrada correctamente', 'success');
      
      // Update topbar visuals dynamically to hide it
      const topbarEl = document.getElementById('topbar-new');
      if (topbarEl) {
        topbarEl.style.display = 'none';
      }
      
      // Refresh landing page to show standard login portal
      const page = renderLanding();
      wrap.replaceWith(page);
    });
  }

  return wrap;
}

function selectProject(pid: string) {
  const state = stateStore.get();
  stateStore.set({ ...state, activeProjectId: pid, activeSprintId: null });

  // Re-render the topbar to show the selected project
  const topbarEl = document.getElementById('topbar-new');
  if (topbarEl) {
    const newTopbar = renderTopbar();
    topbarEl.replaceWith(newTopbar);
    newTopbar.style.display = 'flex';
  }

  navigate('dashboard');

  // Update sidebar project name
  const sidebar = document.getElementById('sidebar');
  if (sidebar) {
    const p = projectStore.getById(pid);
    const nameEl = sidebar.querySelector('.proj-name');
    if (nameEl && p) nameEl.textContent = p.name;
  }
}
