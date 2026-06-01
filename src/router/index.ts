import { stateStore, projectStore } from '../store/storage';
import type { AppState } from '../types/index';

type RouteHandler = () => HTMLElement;
const routes: Record<string, RouteHandler> = {};

export function registerRoute(path: string, handler: RouteHandler) {
  routes[path] = handler;
}

export function navigate(path: string) {
  const state = stateStore.get();
  stateStore.set({ ...state, currentPage: path });
  window.location.hash = path;

  // Trigger premium topbar loading progress bar
  const loader = document.getElementById('topbar-loader') as HTMLElement;
  if (loader) {
    loader.style.transition = 'none';
    loader.style.width = '0%';
    loader.offsetHeight; // Force reflow
    loader.style.transition = 'width 0.4s cubic-bezier(0.08, 0.82, 0.17, 1)';
    loader.style.width = '70%';
    setTimeout(() => {
      loader.style.width = '100%';
      setTimeout(() => {
        loader.style.width = '0%';
      }, 200);
    }, 250);
  }

  renderPage(path);
  updateNav(path);
}

function renderPage(path: string) {
  const content = document.getElementById('page-content');
  if (!content) return;
  const handler = routes[path] || routes['landing'];
  content.innerHTML = '';
  const el = handler();
  el.classList.add('fade-in');
  content.appendChild(el);
  // Toggle sidebar/topbar visibility on landing
  const sidebar = document.getElementById('sidebar');
  const mainEl = document.querySelector('.main-content') as HTMLElement;
  if (sidebar && mainEl) {
    if (path === 'landing') {
      sidebar.style.display = 'none';
      mainEl.style.marginLeft = '0';
    } else {
      sidebar.style.display = '';
      mainEl.style.marginLeft = '';
    }
  }
}

function updateNav(path: string) {
  document.querySelectorAll('.nav-item, .nav-link-item').forEach(el => {
    const href = el.getAttribute('data-page');
    el.classList.toggle('active', href === path);
  });
}

export function initRouter() {
  const hash = window.location.hash.replace('#', '') || 'landing';
  renderPage(hash);
  updateNav(hash);
  window.addEventListener('hashchange', () => {
    const page = window.location.hash.replace('#', '') || 'dashboard';
    renderPage(page);
    updateNav(page);
  });
}

export function getActiveProject() {
  const state = stateStore.get();
  if (!state.activeProjectId) {
    const projects = projectStore.getAll();
    if (projects.length > 0) {
      const newState: AppState = { ...state, activeProjectId: projects[0].id };
      stateStore.set(newState);
      return projects[0];
    }
    return null;
  }
  return projectStore.getById(state.activeProjectId) || null;
}

export function getActiveSprint() {
  const state = stateStore.get();
  return state.activeSprintId;
}

export function setActiveSprint(sprintId: string) {
  const state = stateStore.get();
  stateStore.set({ ...state, activeSprintId: sprintId });
}
