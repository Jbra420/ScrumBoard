// ============================================================
// Quantum Navigation Portal Component (Alex Grey Inspired)
// ============================================================

import { navigate } from '../router/index';

const ICONS: Record<string, string> = {
  dashboard: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>`,
  sprints: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>`,
  backlog: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>`,
  meetings: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`,
  burndown: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>`,
  team: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
};

const navItems = [
  { page: 'dashboard', label: 'Tablero' },
  { page: 'sprints', label: 'Sprints' },
  { page: 'backlog', label: 'Backlog' },
  { page: 'meetings', label: 'Reuniones' },
  { page: 'burndown', label: 'Métricas' },
  { page: 'team', label: 'Equipo' }
];

export function initQuantumPortal() {
  // Create FAB
  const fab = document.createElement('div');
  fab.className = 'quantum-fab';
  fab.id = 'quantum-fab';
  fab.title = 'Portal de Navegación Ágil';
  fab.style.display = 'none'; // Hidden initially (shown dynamically)
  
  // Sacred geometry mandala inside FAB
  fab.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
      <polyline points="2 17 12 22 22 17"></polyline>
      <polyline points="2 12 12 17 22 12"></polyline>
    </svg>
  `;

  // Create Overlay Portal
  const overlay = document.createElement('div');
  overlay.className = 'quantum-portal-overlay';
  overlay.id = 'quantum-portal-overlay';

  document.body.appendChild(fab);
  document.body.appendChild(overlay);

  const updatePortalContent = () => {
    const currentPage = window.location.hash.replace('#', '') || 'landing';
    overlay.innerHTML = `
      <div class="quantum-portal-content">
        <button class="portal-close-btn" id="portal-close-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <div class="portal-title">🌌 Portal de Navegación Ágil</div>
        <div class="portal-subtitle">Acceso instantáneo y adaptativo a todo tu espacio de trabajo</div>
        
        <div class="portal-grid">
          ${navItems.map(({ page, label }) => `
            <div class="portal-card ${currentPage === page ? 'active' : ''}" data-page="${page}">
              ${ICONS[page]}
              <span>${label}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // Bind card events
    overlay.querySelectorAll('.portal-grid .portal-card').forEach(card => {
      let touchTriggered = false;
      const navigateHandler = (e: Event) => {
        e.preventDefault();
        const page = (card as HTMLElement).dataset.page!;
        closePortal();
        navigate(page);
      };
      card.addEventListener('touchstart', (e) => {
        touchTriggered = true;
        navigateHandler(e);
      }, { passive: false });
      card.addEventListener('click', (e) => {
        if (touchTriggered) {
          touchTriggered = false;
          return;
        }
        navigateHandler(e);
      });
    });

    // Bind close button
    const closeBtn = overlay.querySelector('#portal-close-btn');
    if (closeBtn) {
      let touchTriggered = false;
      closeBtn.addEventListener('touchstart', (e) => {
        touchTriggered = true;
        e.preventDefault();
        closePortal();
      }, { passive: false });
      closeBtn.addEventListener('click', () => {
        if (touchTriggered) {
          touchTriggered = false;
          return;
        }
        closePortal();
      });
    }
  };

  const openPortal = () => {
    updatePortalContent();
    overlay.style.display = 'flex';
    overlay.offsetHeight; // Force reflow
    overlay.classList.add('open');
  };

  const closePortal = () => {
    overlay.classList.remove('open');
    setTimeout(() => {
      if (!overlay.classList.contains('open')) {
        overlay.style.display = 'none';
      }
    }, 350);
  };

  // Bind FAB events with touch/click hybrid model
  let fabTouchTriggered = false;
  fab.addEventListener('touchstart', (e) => {
    fabTouchTriggered = true;
    e.preventDefault();
    openPortal();
  }, { passive: false });
  
  fab.addEventListener('click', () => {
    if (fabTouchTriggered) {
      fabTouchTriggered = false;
      return;
    }
    openPortal();
  });

  // Dynamic visibility based on route
  const updateVisibility = () => {
    const page = window.location.hash.replace('#', '') || 'landing';
    fab.style.display = page === 'landing' ? 'none' : 'flex';
    // If open and rotated, recalculate content dynamically
    if (overlay.classList.contains('open')) {
      updatePortalContent();
    }
  };

  window.addEventListener('hashchange', updateVisibility);
  window.addEventListener('resize', () => {
    if (overlay.classList.contains('open')) {
      updatePortalContent();
    }
  });
  
  updateVisibility(); // Initial check
}
