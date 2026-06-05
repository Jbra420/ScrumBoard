// ============================================================
// ScrumBoard Pro — Application Entrypoint & Orchestrator
// ============================================================

import './styles/global.css';
import { initDatabase, isSeeded, projectStore } from './store/storage';
import { seedData } from './data/seed';
import { seedPabloProject } from './data/seedPablo';
import { seedDefaultSmUsers } from './store/smUsers';
import { renderTopbar } from './components/topbar';
import { initToast } from './components/modal';
import { initQuantumPortal } from './components/quantumPortal';
import { registerRoute, initRouter } from './router/index';
import { renderDashboard } from './pages/dashboard';
import { renderSprints } from './pages/sprints';
import { renderBacklog } from './pages/backlog';
import { renderTeam } from './pages/team';
import { renderMeetings } from './pages/meetings';
import { renderBurndown } from './pages/burndown';
import { renderProjects } from './pages/projects';
import { renderLanding } from './pages/landing';

async function startApp() {
  // 1. Initialize IndexedDB database cache
  await initDatabase();

  // 2. Force re-seed if palette version has changed (v3 = Production state)
  const PALETTE_VERSION = 'v3-realdata';
  const storedVersion = localStorage.getItem('scrumboard_palette_version');
  
  if (!isSeeded() || storedVersion !== PALETTE_VERSION) {
    if (storedVersion !== PALETTE_VERSION) {
      [
        'scrumboard_projects', 'scrumboard_members', 'scrumboard_sprints', 
        'scrumboard_epics', 'scrumboard_stories', 'scrumboard_tasks', 
        'scrumboard_meetings', 'scrumboard_state', 'scrumboard_seeded'
      ].forEach(k => localStorage.removeItem(k));
    }
    
    // Seed initial data (populates memory directly, stores locally, and syncs to Supabase)
    seedData();
    localStorage.setItem('scrumboard_palette_version', PALETTE_VERSION);
  }

  // Failsafe: if projects database is completely empty (e.g. initial empty Supabase sync occurred), 
  // auto-seed GAD Cañar workspace instantly so the user has immediate access to their project.
  if (projectStore.getAll().length === 0) {
    console.log('Failsafe: No projects found in database. Seeding default GAD workspace...');
    seedData();
  }

  // Always ensure default SM users exist (PABLO, etc.)
  seedDefaultSmUsers();

  // Seed Pablo's rehabilitation project if not already present
  seedPabloProject();

  // 3. Register all pages in the routing table
  registerRoute('landing', renderLanding);
  registerRoute('dashboard', renderDashboard);
  registerRoute('sprints', renderSprints);
  registerRoute('backlog', renderBacklog);
  registerRoute('team', renderTeam);
  registerRoute('meetings', renderMeetings);
  registerRoute('burndown', renderBurndown);
  registerRoute('projects', renderProjects);

  // 4. Initialize global visual elements
  initToast();
  initQuantumPortal();

  // 5. Build full-width Topbar App Shell
  const app = document.getElementById('app')!;
  app.innerHTML = '';

  const mainContent = document.createElement('div');
  mainContent.className = 'main-content';

  // Render Horizontal Elegant Navigation Topbar
  const topbar = renderTopbar();

  // Content render target
  const pageContent = document.createElement('div');
  pageContent.className = 'page-content';
  pageContent.id = 'page-content';

  mainContent.appendChild(topbar);
  mainContent.appendChild(pageContent);
  app.appendChild(mainContent);

  // Dynamic topbar visibility: hide on landing page
  const updateTopbarVisibility = () => {
    const page = window.location.hash.replace('#', '') || 'landing';
    topbar.style.display = page === 'landing' ? 'none' : 'flex';
  };
  
  window.addEventListener('hashchange', updateTopbarVisibility);
  updateTopbarVisibility(); // Initial visibility check

  // 6. Start the Router
  initRouter();
}

// Boot up!
startApp().catch(err => {
  console.error('Critical ScrumBoard Pro startup failure:', err);
});
