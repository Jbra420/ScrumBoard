// ============================================================
// ScrumBoard Pro — SM Manager Modal (DJBRA Only)
// Premium modal for creating and deleting Scrum Master accounts
// ============================================================

import { smUsersStore } from '../store/smUsers';
import { showToast } from './modal';

const AVATAR_COLORS = [
  '#A855F7', '#6366F1', '#38BDF8', '#34D399',
  '#FBBF24', '#FB923C', '#F472B6', '#2DD4BF',
  '#EF4444', '#8B5CF6',
];

export function openSmManagerModal(): void {
  // Remove any existing modal
  document.getElementById('sm-manager-overlay')?.remove();

  const overlay = document.createElement('div');
  overlay.id = 'sm-manager-overlay';
  overlay.style.cssText = `
    position:fixed;inset:0;background:rgba(0,0,0,0.7);backdrop-filter:blur(8px);
    display:flex;align-items:center;justify-content:center;z-index:9999;padding:20px;
    animation:fadeInOverlay 0.2s ease;
  `;

  const renderContent = () => {
    const smUsers = smUsersStore.getAll();

    overlay.innerHTML = `
      <style>
        @keyframes fadeInOverlay { from{opacity:0} to{opacity:1} }
        @keyframes slideInModal { from{opacity:0;transform:translateY(-20px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes smRowIn { from{opacity:0;transform:translateX(-12px)} to{opacity:1;transform:translateX(0)} }
        #sm-manager-modal {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 20px;
          width: 100%;
          max-width: 620px;
          max-height: 90vh;
          overflow-y: auto;
          animation: slideInModal 0.25s cubic-bezier(.4,0,.2,1);
          box-shadow: 0 0 60px rgba(168,85,247,0.2), 0 20px 60px rgba(0,0,0,0.5);
        }
        .sm-modal-header {
          padding: 24px 24px 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .sm-modal-title {
          font-size: 20px;
          font-weight: 800;
          background: linear-gradient(135deg, #C084FC, #38BDF8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .sm-close-btn {
          width: 32px; height: 32px; border-radius: 50%;
          border: 1px solid var(--border);
          background: var(--bg-secondary);
          color: var(--text-muted);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; font-size: 16px; transition: all .2s;
        }
        .sm-close-btn:hover { background: rgba(239,68,68,0.1); color: var(--red); border-color: rgba(239,68,68,0.3); }
        .sm-user-list { display: flex; flex-direction: column; gap: 10px; }
        .sm-user-row {
          display: flex; align-items: center; gap: 14px;
          background: rgba(255,255,255,0.02);
          border: 1px solid var(--border);
          border-radius: 12px; padding: 12px 14px;
          animation: smRowIn 0.3s ease;
        }
        .sm-user-row:hover { border-color: rgba(168,85,247,0.3); background: rgba(168,85,247,0.04); }
        .sm-avatar {
          width: 40px; height: 40px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; font-weight: 800; color: #fff; flex-shrink: 0;
          box-shadow: 0 0 12px rgba(168,85,247,0.3);
        }
        .sm-del-btn {
          margin-left: auto; width: 30px; height: 30px; border-radius: 50%;
          border: 1px solid rgba(239,68,68,0.25); background: rgba(239,68,68,0.05);
          color: var(--red); display: flex; align-items: center; justify-content: center;
          cursor: pointer; font-size: 14px; transition: all .2s; flex-shrink: 0;
        }
        .sm-del-btn:hover { background: rgba(239,68,68,0.15); border-color: var(--red); transform: scale(1.1); }
        .sm-color-grid { display: flex; flex-wrap: wrap; gap: 8px; }
        .sm-color-chip {
          width: 28px; height: 28px; border-radius: 50%; cursor: pointer;
          border: 3px solid transparent; transition: all .2s; flex-shrink: 0;
        }
        .sm-color-chip.selected { border-color: #fff; transform: scale(1.15); box-shadow: 0 0 10px rgba(255,255,255,0.4); }
        .sm-create-form {
          background: rgba(168,85,247,0.04);
          border: 1px solid rgba(168,85,247,0.15);
          border-radius: 14px; padding: 20px;
          display: flex; flex-direction: column; gap: 14px;
        }
        .sm-input {
          width: 100%; padding: 10px 14px; border-radius: 10px;
          background: rgba(255,255,255,0.04); border: 1px solid var(--border);
          color: var(--text-primary); font-size: 13px; outline: none;
          transition: border-color .2s; box-sizing: border-box;
        }
        .sm-input:focus { border-color: rgba(168,85,247,0.5); box-shadow: 0 0 0 3px rgba(168,85,247,0.1); }
        .sm-form-label { font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; }
        .sm-create-btn {
          background: linear-gradient(135deg, #A855F7, #6366F1);
          color: #fff; border: none; border-radius: 10px; padding: 11px 20px;
          font-size: 13px; font-weight: 700; cursor: pointer;
          transition: all .2s; letter-spacing: 0.3px;
        }
        .sm-create-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 20px rgba(168,85,247,0.4); }
        .sm-error { font-size: 11px; color: var(--red); background: rgba(239,68,68,0.06); border: 1px solid rgba(239,68,68,0.2); padding: 8px 12px; border-radius: 8px; display: none; }
        .super-badge {
          font-size: 9px; font-weight: 700; padding: 2px 7px; border-radius: 20px;
          background: rgba(168,85,247,0.15); color: #C084FC; border: 1px solid rgba(168,85,247,0.25);
          letter-spacing: 0.05em;
        }
      </style>

      <div id="sm-manager-modal">
        <div class="sm-modal-header">
          <div>
            <div class="sm-modal-title">👥 Gestionar Scrum Masters</div>
            <div style="font-size:12px;color:var(--text-muted);margin-top:4px">Administra las cuentas con acceso SM</div>
          </div>
          <button class="sm-close-btn" id="sm-close-btn">✕</button>
        </div>

        <div style="padding:20px 24px 24px;display:flex;flex-direction:column;gap:24px">

          <!-- User List -->
          <div>
            <div style="font-size:12px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:12px">
              Cuentas registradas (${smUsers.length})
            </div>
            <div class="sm-user-list">
              ${smUsers.map(u => `
                <div class="sm-user-row">
                  <div class="sm-avatar" style="background:${u.avatarColor}">${u.displayName[0].toUpperCase()}</div>
                  <div style="flex:1;min-width:0">
                    <div style="display:flex;align-items:center;gap:8px;margin-bottom:2px">
                      <span style="font-size:14px;font-weight:700;color:var(--text-primary)">${u.displayName}</span>
                      ${u.isSuperAdmin ? '<span class="super-badge">⭐ SUPER ADMIN</span>' : ''}
                    </div>
                    <div style="font-size:11px;color:var(--text-muted)">
                      @${u.username} · ${u.isSuperAdmin ? 'Cuenta principal' : `Creado: ${u.createdAt}`}
                    </div>
                  </div>
                  ${u.isSuperAdmin ? '' : `
                    <button class="sm-del-btn" data-uid="${u.id}" title="Eliminar cuenta">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                        <path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                      </svg>
                    </button>
                  `}
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Divider -->
          <div style="height:1px;background:var(--border)"></div>

          <!-- Create New SM -->
          <div>
            <div style="font-size:12px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:14px">
              ✨ Crear nuevo Scrum Master
            </div>
            <div class="sm-create-form">
              <div id="sm-create-error" class="sm-error"></div>

              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
                <div>
                  <div class="sm-form-label">Nombre para mostrar</div>
                  <input class="sm-input" id="sm-displayname" type="text" placeholder="Ej: Carlos López" maxlength="30">
                </div>
                <div>
                  <div class="sm-form-label">Usuario (login)</div>
                  <input class="sm-input" id="sm-username-input" type="text" placeholder="Ej: CARLOS" maxlength="20">
                </div>
              </div>

              <div>
                <div class="sm-form-label">Contraseña</div>
                <input class="sm-input" id="sm-password-input" type="password" placeholder="Mínimo 4 caracteres" maxlength="40">
              </div>

              <div>
                <div class="sm-form-label">Color de avatar</div>
                <div class="sm-color-grid" id="sm-color-grid">
                  ${AVATAR_COLORS.map((c, i) => `
                    <div class="sm-color-chip ${i === 1 ? 'selected' : ''}" data-color="${c}" style="background:${c}" title="${c}"></div>
                  `).join('')}
                </div>
              </div>

              <button class="sm-create-btn" id="sm-create-btn">
                ✨ Crear cuenta Scrum Master
              </button>
            </div>
          </div>

        </div>
      </div>
    `;

    // --- Close button ---
    overlay.querySelector('#sm-close-btn')?.addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

    // --- Delete buttons ---
    overlay.querySelectorAll<HTMLElement>('.sm-del-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const uid = btn.dataset.uid!;
        const user = smUsersStore.getAll().find(u => u.id === uid);
        if (!user) return;
        if (confirm(`¿Eliminar la cuenta de "${user.displayName}" (@${user.username})? Esta acción no se puede deshacer.`)) {
          smUsersStore.delete(uid);
          showToast(`Cuenta @${user.username} eliminada`, 'success');
          renderContent(); // Re-render list
        }
      });
    });

    // --- Color chip selection ---
    let selectedColor = AVATAR_COLORS[1];
    overlay.querySelectorAll<HTMLElement>('.sm-color-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        overlay.querySelectorAll('.sm-color-chip').forEach(c => c.classList.remove('selected'));
        chip.classList.add('selected');
        selectedColor = chip.dataset.color!;
      });
    });

    // --- Create new SM ---
    overlay.querySelector('#sm-create-btn')?.addEventListener('click', () => {
      const displayName = (overlay.querySelector('#sm-displayname') as HTMLInputElement).value;
      const username = (overlay.querySelector('#sm-username-input') as HTMLInputElement).value;
      const password = (overlay.querySelector('#sm-password-input') as HTMLInputElement).value;
      const errorEl = overlay.querySelector('#sm-create-error') as HTMLElement;

      const err = smUsersStore.add({ username, password, displayName, avatarColor: selectedColor });
      if (err) {
        errorEl.textContent = `❌ ${err}`;
        errorEl.style.display = 'block';
        return;
      }

      errorEl.style.display = 'none';
      showToast(`✅ Cuenta @${username.toUpperCase()} creada exitosamente`, 'success');
      renderContent(); // Refresh list
    });
  };

  renderContent();
  document.body.appendChild(overlay);
}
