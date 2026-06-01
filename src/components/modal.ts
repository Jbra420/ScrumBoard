let container: HTMLElement | null = null;

export function initToast() {
  container = document.createElement('div');
  container.className = 'toast-container';
  document.body.appendChild(container);
}

export function showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
  if (!container) return;
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type]}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    toast.style.transition = 'all 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

export function showModal(title: string, bodyHTML: string, onConfirm?: () => void): HTMLElement {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal" id="modal-box">
      <div class="modal-header">
        <div class="modal-title">${title}</div>
        <button class="modal-close btn btn-icon" id="modal-close-btn">✕</button>
      </div>
      <div class="modal-body">${bodyHTML}</div>
      ${onConfirm ? `<div class="modal-footer">
        <button class="btn btn-secondary" id="modal-cancel">Cancelar</button>
        <button class="btn btn-primary" id="modal-confirm">Confirmar</button>
      </div>` : ''}
    </div>
  `;
  document.body.appendChild(overlay);

  const close = () => overlay.remove();
  overlay.querySelector('#modal-close-btn')?.addEventListener('click', close);
  overlay.querySelector('#modal-cancel')?.addEventListener('click', close);
  overlay.querySelector('#modal-confirm')?.addEventListener('click', () => { onConfirm?.(); close(); });
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

  return overlay;
}

export function getModalFormData(overlay: HTMLElement): Record<string, string> {
  const data: Record<string, string> = {};
  overlay.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('[name]').forEach(el => {
    data[el.name] = el.value;
  });
  return data;
}
