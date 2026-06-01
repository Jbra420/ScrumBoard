// ============================================================
// ScrumBoard Pro — Horizontal Elegant Topbar Navigation with Supabase Settings
// ============================================================

import { navigate, getActiveProject } from '../router/index';
import { stateStore, projectStore, sprintStore, epicStore, databaseManager, resetDatabaseToSeed, generateId } from '../store/storage';
import { seedData } from '../data/seed';
import { showToast, showModal } from './modal';
import { supabaseConfig, testSupabaseConnection, uploadLocalToSupabase, downloadCloudToLocal, syncCloudBidirectional } from '../store/supabase';

const ICONS: Record<string, string> = {
  dashboard: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>`,
  sprints: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>`,
  backlog: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`,
  team: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>`,
  meetings: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  burndown: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
  projects: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M2 7l10-5 10 5-10 5z"/><path d="M6 9.5v7l6 3 6-3v-7"/></svg>`,
  database: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22c5.523 0 10-2.239 10-5V7c0-2.761-4.477-5-10-5S2 4.239 2 7v10c0 2.761 4.477 5 10 5z"/><path d="M22 7c0 2.761-4.477 5-10 5S2 9.761 2 7"/><path d="M2 12c0 2.761 4.477 5 10 5s10-2.239 10-5"/></svg>`,
  cloudSync: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="display: block; min-width: 15px; min-height: 15px;"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l.56-.56"/></svg>`,
};

export function renderTopbar(): HTMLElement {
  const topbar = document.createElement('div');
  topbar.className = 'topbar-new';
  topbar.id = 'topbar-new';

  const activeProject = getActiveProject();
  const allProjects = projectStore.getAll();
  const state = stateStore.get();
  
  const navItems = [
    { page: 'dashboard', label: 'Dashboard' },
    { page: 'sprints', label: 'Sprints / Kanban' },
    { page: 'backlog', label: 'Backlog' },
    { page: 'meetings', label: 'Reuniones' },
    { page: 'burndown', label: 'Métricas' },
    { page: 'team', label: 'Equipo' },
  ];

  const currentPage = state.currentPage || 'landing';

  // Supabase dynamic sync status indicator
  const sbEnabled = supabaseConfig.isEnabled();
  const dbStatusHTML = sbEnabled 
    ? `<span style="display:inline-block; width:6px; height:6px; background:#C084FC; border-radius:50%; margin-right:4px;"></span> <span style="font-size:10px; color: var(--accent-light); font-weight:700;">Nube Supabase Sincronizada</span>` 
    : `<span style="display:inline-block; width:6px; height:6px; background:#34D399; border-radius:50%; margin-right:4px;"></span> <span style="font-size:10px; color: var(--green); font-weight:700;">IndexedDB Local Activa</span>`;

  const syncBtnHTML = sbEnabled 
    ? `
      <!-- Quick Cloud Sync Button -->
      <button class="btn btn-secondary btn-sm sync-cloud-btn enabled" id="topbar-sync-btn" title="Sincronizar Cambios con Supabase (Subir y Actualizar)" style="gap: 6px; padding: 6px 14px; border-radius: 20px; font-size: 11px; font-weight: 700; border-color: rgba(168, 85, 247, 0.3); background: rgba(168, 85, 247, 0.05); color: var(--accent-light);">
        <span class="sync-icon-wrapper" style="display: inline-flex; align-items: center; justify-content: center;">${ICONS.cloudSync}</span>
        <span class="sync-label-text">Sincronizar Nube</span>
      </button>
    `
    : `
      <!-- Quick Cloud Sync Button -->
      <button class="btn btn-secondary btn-sm sync-cloud-btn disabled" id="topbar-sync-btn" title="Configurar y Conectar Supabase" style="gap: 6px; padding: 6px 14px; border-radius: 20px; font-size: 11px; font-weight: 700; color: var(--text-muted); border-color: var(--border); background: rgba(255, 255, 255, 0.02); opacity: 0.85;">
        <span class="sync-icon-wrapper" style="display: inline-flex; align-items: center; justify-content: center; color: var(--yellow);">${ICONS.cloudSync}</span>
        <span class="sync-label-text">Conectar Nube</span>
      </button>
    `;

  const drawerSyncBtnHTML = sbEnabled 
    ? `
      <!-- Quick Drawer Sync Button -->
      <button class="btn btn-primary btn-sm drawer-sync-btn enabled" id="drawer-sync-btn" style="margin-bottom: 12px; justify-content: center; font-size:11px; padding: 8px 12px; gap: 8px; border-radius: 12px; width: 100%;">
        <span class="sync-icon-wrapper" style="display:inline-flex; align-items: center; justify-content: center;">${ICONS.cloudSync}</span>
        <span>Sincronizar Nube</span>
      </button>
    `
    : `
      <!-- Quick Drawer Sync Button -->
      <button class="btn btn-secondary btn-sm drawer-sync-btn disabled" id="drawer-sync-btn" style="margin-bottom: 12px; justify-content: center; font-size:11px; padding: 8px 12px; gap: 8px; border-radius: 12px; width: 100%;">
        <span class="sync-icon-wrapper" style="display:inline-flex; align-items: center; justify-content: center; color: var(--yellow);">${ICONS.cloudSync}</span>
        <span>Conectar Nube</span>
      </button>
    `;

  topbar.innerHTML = `
    <!-- Glowing micro loading progress bar -->
    <div class="topbar-loading-bar" id="topbar-loader" style="position: absolute; top: 0; left: 0; height: 3px; background: linear-gradient(90deg, var(--accent), var(--cyan), var(--yellow)); width: 0%; transition: width 0.4s cubic-bezier(0.1, 0.8, 0.3, 1); box-shadow: 0 0 10px rgba(168,85,247,0.8); pointer-events: none; z-index: 1000;"></div>

    <!-- Topbar Inner Layout -->
    <div class="topbar-left">
      <a href="#landing" class="topbar-logo" id="logo-link">
        <span class="logo-lightning">⚡</span> ScrumBoard Pro
      </a>
      
      <!-- Project Switcher Dropdown -->
      <div class="project-selector-wrap">
        <div class="project-selector" id="project-dropdown-btn">
          <span class="proj-name">${activeProject?.name || 'Selecciona Proyecto'}</span>
          <span class="proj-arrow">▼</span>
        </div>
        <div class="project-dropdown-menu" id="project-dropdown-menu">
          <div class="dropdown-header">Cambiar Proyecto</div>
          ${allProjects.map(p => `
            <div class="dropdown-item ${activeProject?.id === p.id ? 'active' : ''}" data-pid="${p.id}">
              <div style="font-weight: 600;">${p.name}</div>
              <div style="font-size: 10px; color: var(--text-muted);">${p.description.substring(0, 45)}...</div>
            </div>
          `).join('')}
          <div class="dropdown-divider"></div>
          <div class="dropdown-item add-proj-action" style="color: var(--accent-light); text-align: center; font-weight:600;">
            + Crear Nuevo Proyecto
          </div>
        </div>
      </div>
    </div>
    
    <!-- Central Menu Links -->
    <nav class="topbar-nav-links">
      ${navItems.map(({ page, label }) => `
        <a class="nav-link-item ${currentPage === page ? 'active' : ''}" data-page="${page}" href="#${page}">
          ${ICONS[page]} <span>${label}</span>
        </a>
      `).join('')}
    </nav>
    
    <!-- Right Actions / Clock / User -->
    <div class="topbar-right">
      ${syncBtnHTML}

      <!-- Database Management Hub Dropdown -->
      <div class="db-manager-wrap">
        <button class="btn btn-secondary btn-icon btn-sm topbar-btn" id="db-dropdown-btn" title="Base de Datos y Nube">
          ${ICONS.database}
        </button>
        <div class="db-dropdown-menu" id="db-dropdown-menu">
          <div class="dropdown-header">💾 Datos y Nube</div>
          <div class="db-status-bar">
            ${dbStatusHTML}
          </div>
          <div class="dropdown-item" id="db-backup-btn">
            📤 Exportar Respaldos (.json)
          </div>
          <div class="dropdown-item" id="db-import-btn-trigger">
            📥 Importar Respaldos (.json)
            <input type="file" id="db-file-input" accept=".json" style="display:none">
          </div>
          <div class="dropdown-item" id="db-supabase-btn" style="color: var(--accent-light); font-weight: 700;">
            ☁️ Conectar Supabase
          </div>
          <div class="dropdown-divider"></div>
          <div class="dropdown-item reset-db-action" id="db-reset-btn" style="color: var(--red); font-weight: 600;">
            ⚠️ Restablecer Semilla
          </div>
        </div>
      </div>
      
      <!-- Time -->
      <div class="topbar-clock">
        <span class="clock-flag">EC</span> <span id="time-display">--:--</span>
      </div>
      
      <div class="topbar-divider"></div>
      
      <!-- User Profile Dropdown -->
      <div class="profile-selector-wrap" style="position:relative;">
        <div class="topbar-profile" id="profile-dropdown-btn" title="Menú de Perfil" style="cursor:pointer;">
          <div class="avatar" style="background:var(--accent)">J</div>
          <div class="profile-info">
            <div class="profile-name">Juan (SM)</div>
            <div class="profile-role">Scrum Master</div>
          </div>
        </div>
        <div class="profile-dropdown-menu" id="profile-dropdown-menu" style="position:absolute; top:calc(100% + 8px); right:0; background:rgba(15,10,25,0.92); backdrop-filter:blur(20px); border:1px solid var(--border); border-radius:var(--radius-md); padding:8px 0; width:180px; display:none; flex-direction:column; box-shadow:0 12px 30px rgba(0,0,0,0.5); z-index:1000;">
          <div class="dropdown-item" id="prof-team-btn" style="color:var(--text-primary); padding:10px 16px; font-size:12px; cursor:pointer; font-weight:500; display:flex; align-items:center; gap:8px;">
            👥 Ver Equipo
          </div>
          <div class="dropdown-divider" style="height:1px; background:var(--border); margin:6px 0;"></div>
          <div class="dropdown-item" id="prof-logout-btn" style="color:var(--red); padding:10px 16px; font-size:12px; cursor:pointer; font-weight:600; display:flex; align-items:center; gap:8px;">
            🚪 Cerrar Sesión (Landing)
          </div>
        </div>
      </div>

      <!-- Hamburger Menu Button -->
      <button class="topbar-btn hamburger-btn" id="mobile-menu-toggle" aria-label="Menú" style="display: none; border-radius: 50% !important; width: 34px; height: 34px; align-items: center; justify-content: center; margin-left: 8px;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>
    </div>

    <!-- Mobile Drawer Menu Overlay -->
    <div class="mobile-drawer" id="mobile-drawer-menu">
      <div class="drawer-overlay" id="drawer-overlay"></div>
      <div class="drawer-content">
        <div class="drawer-header">
          <span class="topbar-logo" style="margin-left:0;"><span class="logo-lightning">⚡</span> ScrumBoard Pro</span>
          <button class="topbar-btn close-drawer-btn" id="close-drawer-btn" style="border-radius: 50% !important; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div class="drawer-body">
          <!-- Active Project Section -->
          <div class="drawer-section">
            <div class="drawer-section-title">Proyecto Activo</div>
            <div class="drawer-project-btn" id="drawer-project-btn">
              <span class="proj-name">${activeProject?.name || 'Selecciona Proyecto'}</span>
              <span class="proj-arrow">▼</span>
            </div>
            <div class="drawer-project-list" id="drawer-project-list">
              ${allProjects.map(p => `
                <div class="dropdown-item ${activeProject?.id === p.id ? 'active' : ''}" data-pid="${p.id}">
                  <div style="font-weight: 600;">${p.name}</div>
                </div>
              `).join('')}
              <div class="dropdown-item add-proj-action" style="color: var(--accent-light); font-weight:600;">
                + Crear Nuevo Proyecto
              </div>
            </div>
          </div>
 
          <!-- Navigation Links Section -->
          <div class="drawer-section">
            <div class="drawer-section-title">Navegación</div>
            <nav class="drawer-nav-links" style="display:flex; flex-direction:column; gap:8px;">
              ${navItems.map(({ page, label }) => `
                <a class="nav-link-item ${currentPage === page ? 'active' : ''}" data-page="${page}" href="#${page}">
                  ${ICONS[page]} <span>${label}</span>
                </a>
              `).join('')}
            </nav>
          </div>
 
          <!-- Cloud / DB Sync Section -->
          <div class="drawer-section">
            <div class="drawer-section-title">Datos y Nube</div>
            <div class="db-status-bar" style="border:none; padding:0; margin-bottom:12px;">
              ${dbStatusHTML}
            </div>
            ${drawerSyncBtnHTML}
            <div style="display:flex; flex-direction:column; gap:6px;">
              <div class="dropdown-item drawer-db-action" id="drawer-db-backup-btn">
                📤 Exportar Respaldos (.json)
              </div>
              <div class="dropdown-item drawer-db-action" id="drawer-db-import-btn-trigger">
                📥 Importar Respaldos (.json)
              </div>
              <div class="dropdown-item drawer-db-action" id="drawer-db-supabase-btn" style="color: var(--accent-light); font-weight: 700;">
                ☁️ Conectar Supabase
              </div>
              <div class="dropdown-item drawer-db-action" id="drawer-db-reset-btn" style="color: var(--red); font-weight: 600;">
                ⚠️ Restablecer Semilla
              </div>
            </div>
          </div>
 
          <!-- Profile and Logout Section -->
          <div class="drawer-section" style="margin-top: 16px; padding-top:20px; border-top:1px solid var(--border);">
            <div class="topbar-profile" style="cursor:default; pointer-events:none; display:flex; align-items:center; gap:10px;">
              <div class="avatar" style="background:var(--accent)">J</div>
              <div class="profile-info">
                <div class="profile-name" style="font-size:12px; font-weight:700; color:var(--text-primary);">Juan (SM)</div>
                <div class="profile-role" style="font-size:9.5px; color:var(--text-muted);">Scrum Master</div>
              </div>
            </div>
            <div style="display:flex; flex-direction:column; gap:6px; margin-top:16px;">
              <div class="dropdown-item drawer-db-action" id="drawer-prof-team-btn">
                👥 Ver Equipo
              </div>
              <div class="dropdown-item drawer-db-action" id="drawer-prof-logout-btn" style="color: var(--red); font-weight: 600;">
                🚪 Cerrar Sesión (Landing)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Bind Navigation Links
  topbar.querySelectorAll('.nav-link-item').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const page = (el as HTMLElement).dataset.page!;
      navigate(page);
    });
  });
  
  topbar.querySelector('#logo-link')?.addEventListener('click', (e) => {
    e.preventDefault();
    navigate('landing');
  });

  // ============================================================
  // MOBILE DRAWER EVENT LISTENERS (TOUCH + CLICK HYBRID COMPATIBLE)
  // ============================================================
  const drawer = topbar.querySelector('#mobile-drawer-menu') as HTMLElement;
  const drawerProjList = topbar.querySelector('#drawer-project-list') as HTMLElement;

  const openDrawer = () => drawer?.classList.add('open');
  const closeDrawer = () => drawer?.classList.remove('open');

  // Helper to bind touch + click events seamlessly without double triggers
  const bindDrawerEvent = (selector: string, handler: (e: Event) => void) => {
    const el = topbar.querySelector(selector) as HTMLElement;
    if (!el) return;
    let touchTriggered = false;
    el.addEventListener('touchstart', (e) => {
      touchTriggered = true;
      handler(e);
    }, { passive: true });
    el.addEventListener('click', (e) => {
      if (touchTriggered) {
        touchTriggered = false;
        return;
      }
      handler(e);
    });
  };

  bindDrawerEvent('#mobile-menu-toggle', (e) => {
    e.stopPropagation();
    openDrawer();
  });
  bindDrawerEvent('#drawer-overlay', () => closeDrawer());
  bindDrawerEvent('#close-drawer-btn', () => closeDrawer());

  // Project selector toggle inside drawer
  bindDrawerEvent('#drawer-project-btn', (e) => {
    e.stopPropagation();
    const isOpen = drawerProjList.style.display === 'flex';
    drawerProjList.style.display = isOpen ? 'none' : 'flex';
  });

  // Project item switch inside drawer
  drawerProjList?.querySelectorAll('.dropdown-item[data-pid]').forEach(item => {
    let touchTriggered = false;
    const selectHandler = () => {
      const pid = (item as HTMLElement).dataset.pid!;
      const state = stateStore.get();
      stateStore.set({ ...state, activeProjectId: pid, activeSprintId: null });
      showToast('Proyecto cambiado exitosamente', 'success');
      closeDrawer();
      const current = window.location.hash.replace('#', '') || 'dashboard';
      navigate(current);
    };
    item.addEventListener('touchstart', () => {
      touchTriggered = true;
      selectHandler();
    }, { passive: true });
    item.addEventListener('click', () => {
      if (touchTriggered) {
        touchTriggered = false;
        return;
      }
      selectHandler();
    });
  });

  // Create project from drawer
  const addProjEl = drawerProjList?.querySelector('.add-proj-action') as HTMLElement;
  if (addProjEl) {
    let touchTriggered = false;
    const addProjHandler = () => {
      closeDrawer();
      openNewProjectModal(() => {
        const current = window.location.hash.replace('#', '') || 'dashboard';
        navigate(current);
      });
    };
    addProjEl.addEventListener('touchstart', () => {
      touchTriggered = true;
      addProjHandler();
    }, { passive: true });
    addProjEl.addEventListener('click', () => {
      if (touchTriggered) {
        touchTriggered = false;
        return;
      }
      addProjHandler();
    });
  }

  // Navigation Links inside drawer
  drawer?.querySelectorAll('.drawer-nav-links .nav-link-item').forEach(el => {
    let touchTriggered = false;
    const navHandler = (e: Event) => {
      e.preventDefault();
      const page = (el as HTMLElement).dataset.page!;
      closeDrawer();
      navigate(page);
    };
    el.addEventListener('touchstart', (e) => {
      touchTriggered = true;
      navHandler(e);
    }, { passive: false });
    el.addEventListener('click', (e) => {
      if (touchTriggered) {
        touchTriggered = false;
        return;
      }
      navHandler(e);
    });
  });

  // DBSync export in drawer
  bindDrawerEvent('#drawer-db-backup-btn', () => {
    closeDrawer();
    databaseManager.exportBackup();
    showToast('Respaldo descargado con éxito', 'success');
  });

  // DBSync import in drawer
  bindDrawerEvent('#drawer-db-import-btn-trigger', () => {
    closeDrawer();
    const fileInput = topbar.querySelector('#db-file-input') as HTMLInputElement;
    fileInput?.click();
  });

  // Connect Supabase in drawer
  bindDrawerEvent('#drawer-db-supabase-btn', () => {
    closeDrawer();
    openSupabaseModal();
  });

  // Reset database seed in drawer
  bindDrawerEvent('#drawer-db-reset-btn', async () => {
    closeDrawer();
    if (confirm('⚠️ ¿Estás seguro de restablecer la base de datos? Se borrarán todos los cambios locales y remotos en Supabase, re-sembrando los datos por defecto.')) {
      await resetDatabaseToSeed(seedData);
      showToast('Base de datos restablecida exitosamente', 'success');
      setTimeout(() => window.location.reload(), 800);
    }
  });

  // Team Page inside drawer
  bindDrawerEvent('#drawer-prof-team-btn', () => {
    closeDrawer();
    navigate('team');
  });

  // Logout inside drawer
  bindDrawerEvent('#drawer-prof-logout-btn', () => {
    closeDrawer();
    navigate('landing');
    showToast('Sesión cerrada correctamente', 'success');
  });

  // Profile Dropdown Toggle Logic (Desktop)
  const profBtn = topbar.querySelector('#profile-dropdown-btn') as HTMLElement;
  const profMenu = topbar.querySelector('#profile-dropdown-menu') as HTMLElement;

  profBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    profMenu.style.display = profMenu.style.display === 'flex' ? 'none' : 'flex';
    projMenu.classList.remove('open');
    dbMenu.classList.remove('open');
  });

  // Profile Team Action
  topbar.querySelector('#prof-team-btn')?.addEventListener('click', () => {
    profMenu.style.display = 'none';
    navigate('team');
  });

  // Profile Logout Action
  topbar.querySelector('#prof-logout-btn')?.addEventListener('click', () => {
    profMenu.style.display = 'none';
    navigate('landing');
    showToast('Sesión cerrada correctamente', 'success');
  });

  // Project Dropdown Toggle Logic
  const projBtn = topbar.querySelector('#project-dropdown-btn') as HTMLElement;
  const projMenu = topbar.querySelector('#project-dropdown-menu') as HTMLElement;
  
  projBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    projMenu.classList.toggle('open');
    dbMenu.classList.remove('open'); // Close db dropdown
    profMenu.style.display = 'none';
  });

  // Project Switch Logic
  projMenu.querySelectorAll('.dropdown-item[data-pid]').forEach(item => {
    item.addEventListener('click', () => {
      const pid = (item as HTMLElement).dataset.pid!;
      const state = stateStore.get();
      stateStore.set({ ...state, activeProjectId: pid, activeSprintId: null });
      showToast('Proyecto cambiado exitosamente', 'success');
      projMenu.classList.remove('open');
      
      // Reload current page to refresh all lists
      const current = window.location.hash.replace('#', '') || 'dashboard';
      navigate(current);
    });
  });

  // Create project modal in dropdown
  projMenu.querySelector('.add-proj-action')?.addEventListener('click', () => {
    projMenu.classList.remove('open');
    openNewProjectModal(() => {
      const current = window.location.hash.replace('#', '') || 'dashboard';
      navigate(current);
    });
  });

  // DB Dropdown Toggle Logic
  const dbBtn = topbar.querySelector('#db-dropdown-btn') as HTMLElement;
  const dbMenu = topbar.querySelector('#db-dropdown-menu') as HTMLElement;
  
  dbBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    dbMenu.classList.toggle('open');
    projMenu.classList.remove('open'); // Close project dropdown
    profMenu.style.display = 'none';
  });

  // DB Backup Action
  dbMenu.querySelector('#db-backup-btn')?.addEventListener('click', () => {
    dbMenu.classList.remove('open');
    databaseManager.exportBackup();
    showToast('Respaldo descargado con éxito', 'success');
  });

  // DB Import Action
  const fileInput = dbMenu.querySelector('#db-file-input') as HTMLInputElement;
  dbMenu.querySelector('#db-import-btn-trigger')?.addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', async () => {
    const file = fileInput.files?.[0];
    if (file) {
      dbMenu.classList.remove('open');
      const success = await databaseManager.importBackup(file);
      if (success) {
        showToast('Base de datos restaurada ✅', 'success');
        setTimeout(() => window.location.reload(), 800);
      } else {
        showToast('Error al importar archivo. Verifica el formato JSON.', 'error');
      }
    }
  });

  // DB Reset Action
  dbMenu.querySelector('#db-reset-btn')?.addEventListener('click', async () => {
    dbMenu.classList.remove('open');
    if (confirm('⚠️ ¿Estás seguro de restablecer la base de datos? Se borrarán todos los cambios locales y remotos en Supabase, re-sembrando los datos por defecto.')) {
      await resetDatabaseToSeed(seedData);
      showToast('Base de datos restablecida exitosamente', 'success');
      setTimeout(() => window.location.reload(), 800);
    }
  });

  // Supabase Config Modal Trigger
  dbMenu.querySelector('#db-supabase-btn')?.addEventListener('click', () => {
    dbMenu.classList.remove('open');
    openSupabaseModal();
  });

  // Document Click to Close Dropdowns
  document.addEventListener('click', () => {
    projMenu.classList.remove('open');
    dbMenu.classList.remove('open');
    profMenu.style.display = 'none';
  });

  // Real-time Clock EC Time
  const timeEl = topbar.querySelector('#time-display') as HTMLElement;
  const updateTime = () => {
    const now = new Date();
    timeEl.textContent = now.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };
  updateTime();
  setInterval(updateTime, 1000);

  // ============================================================
  // CLOUD SYNC FLOW & EVENT BINDINGS (Upload & Download Sync)
  // ============================================================
  const handleSyncFlow = async () => {
    if (!supabaseConfig.isEnabled()) {
      showToast('Sincronización inactiva. Configura Supabase para conectar tus dispositivos.', 'info');
      openSupabaseModal();
      return;
    }

    const syncBtns = topbar.querySelectorAll('#topbar-sync-btn, #drawer-sync-btn');
    const icons = topbar.querySelectorAll('.sync-icon-wrapper');
    const topLoader = topbar.querySelector('#topbar-loader') as HTMLElement;

    // Disable buttons and trigger spinning animation
    syncBtns.forEach(btn => (btn as HTMLButtonElement).disabled = true);
    icons.forEach(icon => icon.classList.add('spinning'));
    if (topLoader) {
      topLoader.style.width = '40%';
      topLoader.style.background = 'linear-gradient(90deg, var(--accent), var(--cyan))';
    }

    showToast('Sincronizando con la nube (Subiendo y Actualizando)...', 'info');

    const result = await syncCloudBidirectional();

    if (result.success) {
      if (topLoader) {
        topLoader.style.width = '100%';
        topLoader.style.background = 'linear-gradient(90deg, var(--green), var(--teal))';
      }
      showToast('¡Sincronización exitosa! Todos tus dispositivos están al día. 🚀', 'success');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } else {
      if (topLoader) {
        topLoader.style.width = '0%';
      }
      syncBtns.forEach(btn => (btn as HTMLButtonElement).disabled = false);
      icons.forEach(icon => icon.classList.remove('spinning'));
      showToast(`Error al sincronizar: ${result.error}`, 'error');
    }
  };

  // Bind desktop sync button click
  topbar.querySelector('#topbar-sync-btn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    handleSyncFlow();
  });

  // Bind mobile drawer sync button (touch + click hybrid)
  const drawerSyncBtn = topbar.querySelector('#drawer-sync-btn') as HTMLElement;
  if (drawerSyncBtn) {
    let touchTriggered = false;
    drawerSyncBtn.addEventListener('touchstart', (e) => {
      touchTriggered = true;
      e.stopPropagation();
      closeDrawer();
      handleSyncFlow();
    }, { passive: true });
    
    drawerSyncBtn.addEventListener('click', (e) => {
      if (touchTriggered) {
        touchTriggered = false;
        return;
      }
      e.stopPropagation();
      closeDrawer();
      handleSyncFlow();
    });
  }

  return topbar;
}

// Modal creation helper for new project
function openNewProjectModal(onDone: () => void) {
  const body = `
    <div class="form-group">
      <label class="form-label">Nombre del Proyecto</label>
      <input class="form-input" id="new-proj-name" type="text" placeholder="e.g. Sistema de Facturación Blockchain">
    </div>
    <div class="form-group">
      <label class="form-label">Descripción</label>
      <textarea class="form-textarea" id="new-proj-desc" placeholder="Resumen del alcance del proyecto..."></textarea>
    </div>
    <div class="form-group">
      <label class="form-label">Semanas de Duración</label>
      <input class="form-input" id="new-proj-weeks" type="number" min="2" max="52" value="10">
    </div>
  `;

  const overlay = showModal('Crear Nuevo Proyecto', body, () => {});
  overlay.querySelector('#modal-confirm')?.addEventListener('click', () => {
    const getVal = (id: string) => (overlay.querySelector(id) as HTMLInputElement).value.trim();
    const name = getVal('#new-proj-name');
    const desc = getVal('#new-proj-desc');
    const weeks = parseInt(getVal('#new-proj-weeks')) || 10;

    if (!name) {
      showToast('El nombre del proyecto es requerido', 'error');
      return;
    }

    const pid = 'proj-' + generateId();
    const newProj = {
      id: pid,
      name,
      description: desc || 'Sin descripción',
      status: 'active' as const,
      createdAt: new Date().toISOString().split('T')[0],
      totalWeeks: weeks,
      color: '#A855F7'
    };

    projectStore.add(newProj);
    
    // Auto-create initial Sprint 1 for this project
    const initialSprint = {
      id: 'sprint-' + generateId(),
      projectId: pid,
      number: 1,
      name: 'Análisis y Planificación',
      goal: 'Establecer los requerimientos iniciales del proyecto.',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'active' as const,
      plannedPoints: 0
    };
    sprintStore.add(initialSprint);
    
    // Auto-create initial Epic 1
    const initialEpic = {
      id: 'epic-' + generateId(),
      projectId: pid,
      name: 'Planificación Core',
      color: '#A855F7',
      description: 'Requerimientos y análisis'
    };
    epicStore.add(initialEpic);

    const state = stateStore.get();
    stateStore.set({ ...state, activeProjectId: pid, activeSprintId: initialSprint.id });
    
    showToast(`Proyecto "${name}" creado exitosamente ✅`, 'success');
    overlay.remove();
    onDone();
  });
}

// Modal creation helper for Supabase Cloud Sync settings
function openSupabaseModal() {
  const isEnabled = supabaseConfig.isEnabled();
  const currentUrl = supabaseConfig.getUrl();
  const currentKey = supabaseConfig.getKey();
  
  const statusLabel = isEnabled 
    ? '<span style="color: #C084FC; font-weight: 800;">Activo (Nube Habilitada)</span>' 
    : '<span style="color: var(--text-muted); font-weight: 700;">Inactivo (Modo Local Offline)</span>';

  const body = `
    <div style="font-size: 11.5px; color: var(--text-secondary); margin-bottom: 16px; line-height: 1.45;">
      Sincroniza tus proyectos, sprints e historias en tiempo real en la nube de Supabase. El sistema seguirá funcionando de forma resiliente y ultrarrápida sin conexión mediante IndexedDB.
    </div>
    
    <div class="form-group">
      <label class="form-label">Estado de la Sincronización</label>
      <div style="background: rgba(255,255,255,0.02); padding: 8px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border); font-size:12px;">
        Conexión: ${statusLabel}
      </div>
    </div>
    
    <div class="form-group">
      <label class="form-label">Supabase URL</label>
      <input class="form-input" id="sb-url" type="text" placeholder="https://xxxxxxxxxxxxxx.supabase.co" value="${currentUrl}" style="font-family: monospace; font-size:11px;">
    </div>
    
    <div class="form-group">
      <label class="form-label">Supabase Anon Key (API Key pública)</label>
      <textarea class="form-textarea" id="sb-key" placeholder="eyJhbGciOi..." style="font-family: monospace; font-size: 10px; min-height: 70px;">${currentKey}</textarea>
    </div>

    <!-- Migration actions section -->
    ${isEnabled ? `
      <div style="margin-top: 14px; padding: 12px; background: rgba(168,85,247,0.04); border: 1px solid var(--border); border-radius: var(--radius-sm);">
        <div style="font-size: 10.5px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px;">Migración de Datos:</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
          <button class="btn btn-secondary btn-sm" id="sb-upload-btn" style="font-size:10px; padding: 6px 4px;">📤 Subir Datos Locales</button>
          <button class="btn btn-secondary btn-sm" id="sb-download-btn" style="font-size:10px; padding: 6px 4px; color: var(--yellow);">📥 Descargar Datos Nube</button>
        </div>
      </div>
    ` : ''}
  `;

  const overlay = showModal('Configuración de Supabase Cloud', body, () => {});
  
  // Custom button layout for Supabase modal footer
  const footer = overlay.querySelector('.modal-footer') as HTMLElement;
  footer.innerHTML = `
    <button class="btn btn-secondary" id="sb-close-btn">Cerrar</button>
    ${isEnabled ? `<button class="btn btn-danger" id="sb-disconnect-btn">Desconectar</button>` : ''}
    <button class="btn btn-primary" id="sb-connect-btn">Guardar y Conectar</button>
  `;

  // Action listeners
  overlay.querySelector('#sb-close-btn')?.addEventListener('click', () => overlay.remove());

  // Connection Test + Enable Save Action
  overlay.querySelector('#sb-connect-btn')?.addEventListener('click', async () => {
    const url = (overlay.querySelector('#sb-url') as HTMLInputElement).value.trim();
    const key = (overlay.querySelector('#sb-key') as HTMLTextAreaElement).value.trim();
    
    if (!url || !key) {
      showToast('Por favor introduce la URL y el Anon Key de tu Supabase', 'error');
      return;
    }
    
    showToast('Probando conexión con Supabase...', 'info');
    const connectBtn = overlay.querySelector('#sb-connect-btn') as HTMLButtonElement;
    connectBtn.disabled = true;
    connectBtn.textContent = 'Conectando...';

    const connected = await testSupabaseConnection(url, key);
    
    if (connected) {
      supabaseConfig.set(url, key, true);
      showToast('¡Conexión exitosa! Sincronización habilitada ✅', 'success');
      
      // Auto-upload local data to the newly connected database immediately!
      showToast('Subiendo base de datos local a la nube de Supabase...', 'info');
      const uploadRes = await uploadLocalToSupabase();
      if (uploadRes.success) {
        showToast('¡Datos locales migrados con éxito a la nube! 🚀', 'success');
      } else {
        showToast(`Conectado, pero no se pudieron subir los datos locales automáticamente: ${uploadRes.error}. Recuerda configurar RLS en Supabase e intenta sincronizar manualmente.`, 'info');
      }
      
      overlay.remove();
      
      // Automatic reload to pull data
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } else {
      showToast('No se pudo establecer conexión. Verifica tus credenciales.', 'error');
      connectBtn.disabled = false;
      connectBtn.textContent = 'Guardar y Conectar';
    }
  });

  // Disconnect Action
  overlay.querySelector('#sb-disconnect-btn')?.addEventListener('click', () => {
    if (confirm('¿Estás seguro de desconectar la sincronización de Supabase? Los datos seguirán estando en tu IndexedDB local.')) {
      supabaseConfig.clear();
      showToast('Sincronización deshabilitada. Volviendo a local.', 'success');
      overlay.remove();
      setTimeout(() => window.location.reload(), 800);
    }
  });

  // Push Local Data to Cloud
  overlay.querySelector('#sb-upload-btn')?.addEventListener('click', async () => {
    const uploadBtn = overlay.querySelector('#sb-upload-btn') as HTMLButtonElement;
    uploadBtn.disabled = true;
    uploadBtn.textContent = 'Subiendo...';
    showToast('Subiendo base de datos local a la nube...', 'info');

    const result = await uploadLocalToSupabase();
    if (result.success) {
      showToast('¡Datos locales subidos exitosamente a Supabase! 🚀', 'success');
    } else {
      showToast(`Error al subir datos: ${result.error}`, 'error');
    }
    uploadBtn.disabled = false;
    uploadBtn.textContent = '📤 Subir Datos Locales';
  });

  // Pull Cloud Data to Local
  overlay.querySelector('#sb-download-btn')?.addEventListener('click', async () => {
    if (confirm('⚠️ ¿Estás seguro de descargar todos los datos de la nube? Esto SOBRESCRIBIRÁ tu base de datos local actual en IndexedDB.')) {
      const downloadBtn = overlay.querySelector('#sb-download-btn') as HTMLButtonElement;
      downloadBtn.disabled = true;
      downloadBtn.textContent = 'Descargando...';
      showToast('Descargando datos desde la nube...', 'info');

      const result = await downloadCloudToLocal();
      if (result.success) {
        showToast('Base de datos local sincronizada con la nube ✅', 'success');
        overlay.remove();
        setTimeout(() => window.location.reload(), 1000);
      } else {
        showToast(`Error al descargar: ${result.error}`, 'error');
        downloadBtn.disabled = false;
        downloadBtn.textContent = '📥 Descargar Datos Nube';
      }
    }
  });
}
