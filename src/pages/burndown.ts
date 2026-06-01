// ============================================================
// ScrumBoard Pro — Burndown & Metrics Responsive Page
// ============================================================

import { getActiveProject } from '../router/index';
import { sprintStore, storyStore } from '../store/storage';

export function renderBurndown(): HTMLElement {
  const wrap = document.createElement('div');
  wrap.id = 'burndown-page-wrap';
  const project = getActiveProject();
  if (!project) { 
    wrap.innerHTML = '<div class="empty-state"><h3>Sin proyecto activo</h3></div>'; 
    return wrap; 
  }

  const sprints = sprintStore.getByProject(project.id);
  const allStories = storyStore.getByProject(project.id);
  let selectedSprint: string | null = null;

  const velocityData = sprints.map(s => {
    const stories = storyStore.getBySprint(s.id);
    const planned = stories.reduce((a, st) => a + st.storyPoints, 0);
    const done = stories.filter(st => st.status === 'done').reduce((a, st) => a + st.storyPoints, 0);
    const inProg = stories.filter(st => st.status === 'in-progress').reduce((a, st) => a + st.storyPoints, 0);
    return { sprint: s, planned, done, inProg, total: stories.length, doneCount: stories.filter(st => st.status === 'done').length };
  });

  const totalPoints = allStories.reduce((a, s) => a + s.storyPoints, 0);
  const donePoints = allStories.filter(s => s.status === 'done').reduce((a, s) => a + s.storyPoints, 0);
  const inProgPoints = allStories.filter(s => s.status === 'in-progress').reduce((a, s) => a + s.storyPoints, 0);
  const completedSprints = sprints.filter(s => s.status !== 'pending').length;
  const avgVelocity = completedSprints > 0 ? Math.round(velocityData.filter(v => v.sprint.status !== 'pending').reduce((a, v) => a + v.done, 0) / completedSprints) : 0;
  const pct = totalPoints > 0 ? Math.round(donePoints / totalPoints * 100) : 0;
  const eta = avgVelocity > 0 ? Math.ceil((totalPoints - donePoints) / avgVelocity) : '∞';

  const render = () => {
    wrap.innerHTML = `
      <div class="page-header">
        <div>
          <div class="page-title">Burndown & Métricas</div>
          <div class="page-subtitle">Velocidad, rendimiento y proyecciones del proyecto</div>
        </div>
      </div>

      <!-- KPI Ring + Stats Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 20px;">
        <div class="card" style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px 16px; min-height: 180px;">
          <canvas id="ring-canvas" style="width:130px; height:130px; max-width:130px; max-height:130px;"></canvas>
          <div style="font-size:11px;color:var(--text-muted);margin-top:12px; font-weight:700;">Progreso General</div>
        </div>
        
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(130px, 1fr)); gap:12px; grid-column: span 3;" class="kpis-grid">
          ${[
            { val: totalPoints, label: 'Story Points Totales', color: 'var(--accent-light)', icon: '🎯' },
            { val: donePoints, label: 'Completados', color: 'var(--green)', icon: '✅' },
            { val: inProgPoints, label: 'En Progreso', color: 'var(--yellow)', icon: '🔄' },
            { val: totalPoints - donePoints - inProgPoints, label: 'Pendientes', color: 'var(--red)', icon: '📋' },
            { val: avgVelocity, label: 'Velocidad Promedio', color: 'var(--cyan)', icon: '⚡' },
            { val: completedSprints + '/' + sprints.length, label: 'Sprints Completados', color: 'var(--accent-light)', icon: '🏃' },
            { val: eta, label: 'Sprints Restantes (est.)', color: 'var(--yellow)', icon: '📅' },
            { val: pct + '%', label: 'Eficiencia Global', color: pct >= 70 ? 'var(--green)' : pct >= 40 ? 'var(--yellow)' : 'var(--red)', icon: '📈' },
          ].map(s => `
            <div class="card" style="padding:14px; position:relative; overflow:hidden; display:flex; flex-direction:column; justify-content:center;">
              <div style="position:absolute;top:8px;right:10px;font-size:14px;opacity:.3">${s.icon}</div>
              <div style="font-size:24px;font-weight:800;color:${s.color};letter-spacing:-1px">${s.val}</div>
              <div style="font-size:9.5px;color:var(--text-muted);margin-top:4px; line-height:1.2;">${s.label}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Charts Responsive Row -->
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(350px, 1fr)); gap:16px; margin-bottom:20px;" class="charts-row">
        <div class="card" style="padding:20px; display:flex; flex-direction:column;" id="burndown-container">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
            <div style="font-size:14px;font-weight:700">Burndown Chart</div>
            <div style="display:flex;gap:12px;font-size:10px;color:var(--text-muted)">
              <span style="display:flex;align-items:center;gap:4px"><span style="width:16px;height:3px;background:var(--accent-light);border-radius:2px;display:inline-block"></span>Real</span>
              <span style="display:flex;align-items:center;gap:4px"><span style="width:16px;height:3px;background:var(--cyan);border-radius:2px;display:inline-block;opacity:.5;border:none;outline:1px dashed var(--cyan)"></span>Ideal</span>
            </div>
          </div>
          <div style="flex: 1; min-height: 250px; position: relative;">
            <canvas id="burndown-canvas" style="position:absolute; width:100%; height:100%; top:0; left:0;"></canvas>
          </div>
        </div>
        
        <div class="card" style="padding:20px; display:flex; flex-direction:column;" id="velocity-container">
          <div style="font-size:14px;font-weight:700;margin-bottom:16px">Velocidad por Sprint</div>
          <div style="flex: 1; min-height: 250px; position: relative;">
            <canvas id="velocity-canvas" style="position:absolute; width:100%; height:100%; top:0; left:0;"></canvas>
          </div>
        </div>
      </div>

      <!-- Sprint selector for distribution -->
      <div class="card" style="margin-bottom:20px;padding:20px; display:flex; flex-direction:column;" id="distribution-container">
        <div style="font-size:14px;font-weight:700;margin-bottom:14px">Distribución por Sprint</div>
        <div class="sprint-tabs" style="margin-bottom:16px; overflow-x:auto;">
          <div class="sprint-tab${!selectedSprint ? ' active' : ''}" data-filter="all">Todos</div>
          ${sprints.map(s => `<div class="sprint-tab${selectedSprint === s.id ? ' active' : ''}" data-filter="${s.id}">Sprint ${s.number}</div>`).join('')}
        </div>
        <div style="flex:1; min-height:120px; position:relative;">
          <canvas id="distribution-canvas" style="position:absolute; width:100%; height:100%; top:0; left:0;"></canvas>
        </div>
      </div>

      <!-- Sprint detail table -->
      <div class="card" style="padding:20px">
        <div style="font-size:14px;font-weight:700;margin-bottom:14px">Detalle por Sprint</div>
        <div style="overflow-x:auto">
          <table style="width:100%;border-collapse:collapse;font-size:12px">
            <thead>
              <tr style="border-bottom:1px solid var(--border)">
                ${['Sprint','Objetivo','Estado','Planificado','Completado','En Progreso','Velocidad','Progreso'].map(h => `<th style="text-align:left;padding:10px 12px;color:var(--text-muted);font-weight:600;font-size:11px">${h}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${velocityData.map(({ sprint: s, planned, done, inProg, doneCount, total }) => {
                const vel = planned > 0 ? Math.round(done / planned * 100) : 0;
                const badge = s.status === 'completed' ? 'badge-done' : s.status === 'active' ? 'badge-progress' : 'badge-todo';
                const label = s.status === 'completed' ? 'Completado' : s.status === 'active' ? 'Activo' : 'Pendiente';
                return `
                  <tr style="border-bottom:1px solid var(--border);transition:background .2s" onmouseenter="this.style.background='rgba(168,85,247,0.04)'" onmouseleave="this.style.background='transparent'">
                    <td style="padding:12px"><span style="font-weight:700">Sprint ${s.number}</span><br><span style="font-size:10px;color:var(--text-muted)">${s.startDate} → ${s.endDate}</span></td>
                    <td style="padding:12px;color:var(--text-secondary);max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${s.goal}">${s.goal}</td>
                    <td style="padding:12px"><span class="badge ${badge}">${label}</span></td>
                    <td style="padding:12px;font-weight:700;color:var(--text-secondary)">${planned} pts</td>
                    <td style="padding:12px;font-weight:700;color:var(--green)">${done} pts</td>
                    <td style="padding:12px;font-weight:700;color:var(--yellow)">${inProg} pts</td>
                    <td style="padding:12px"><span style="font-size:16px;font-weight:800;color:${vel >= 80 ? 'var(--green)' : vel >= 50 ? 'var(--yellow)' : vel > 0 ? 'var(--red)' : 'var(--text-muted)'}">${vel}%</span></td>
                    <td style="padding:12px;min-width:110px">
                      <div style="height:8px;background:rgba(168,85,247,0.08);border-radius:4px;overflow:hidden;display:flex">
                        <div style="height:100%;width:${planned > 0 ? done/planned*100 : 0}%;background:var(--green);transition:width .6s"></div>
                        <div style="height:100%;width:${planned > 0 ? inProg/planned*100 : 0}%;background:var(--yellow);transition:width .6s"></div>
                      </div>
                      <div style="font-size:9px;color:var(--text-muted);margin-top:2px">${doneCount}/${total} historias</div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    // Tab filters
    wrap.querySelectorAll<HTMLElement>('.sprint-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        selectedSprint = tab.dataset.filter === 'all' ? null : tab.dataset.filter!;
        render();
      });
    });

    // Start a ResizeObserver to automatically draw/redraw canvases when they exist and have a layout width
    const resizeObserver = new ResizeObserver(() => {
      drawRing(wrap, pct);
      drawBurndown(wrap, velocityData, totalPoints);
      drawVelocity(wrap, velocityData);
      drawDistribution(wrap, velocityData, selectedSprint);
    });

    // We observe the main wrapper: once attached, it will trigger an immediate high-definition paint!
    resizeObserver.observe(wrap);
  };

  render();
  return wrap;
}

// ============================================================
// DRAWING ENGINE FUNCTIONS WITH TOOL-STYLE NEON GLOWS
// ============================================================

function drawRing(wrap: HTMLElement, pct: number) {
  const c = wrap.querySelector<HTMLCanvasElement>('#ring-canvas');
  if (!c) return;
  const ctx = c.getContext('2d')!;
  const dpr = window.devicePixelRatio || 1;
  const rect = c.getBoundingClientRect();
  
  c.width = rect.width * dpr;
  c.height = rect.height * dpr;
  ctx.scale(dpr, dpr);
  
  const W = rect.width;
  const H = rect.height;
  const cx = W / 2, cy = H / 2, r = Math.min(W, H) / 2 - 10, lw = 9;

  ctx.clearRect(0, 0, W, H);

  // BG ring
  ctx.beginPath(); 
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(168,85,247,0.08)'; 
  ctx.lineWidth = lw; 
  ctx.stroke();

  // Progress ring with neon Tool glow
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, '#C084FC'); 
  grad.addColorStop(0.5, '#38BDF8'); 
  grad.addColorStop(1, '#34D399');
  
  ctx.beginPath();
  ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * pct / 100));
  
  ctx.shadowColor = 'rgba(192, 132, 252, 0.45)';
  ctx.shadowBlur = 12;
  ctx.strokeStyle = grad; 
  ctx.lineWidth = lw; 
  ctx.lineCap = 'round'; 
  ctx.stroke();
  
  // Reset shadow
  ctx.shadowBlur = 0;

  // Center text
  ctx.fillStyle = '#EDE9FE'; 
  ctx.font = 'bold 24px Inter,sans-serif'; 
  ctx.textAlign = 'center'; 
  ctx.textBaseline = 'middle';
  ctx.fillText(`${pct}%`, cx, cy - 3);
  
  ctx.fillStyle = '#6D5B95'; 
  ctx.font = '700 9.5px Inter,sans-serif';
  ctx.fillText('COMPLETADO', cx, cy + 16);
}

function drawBurndown(wrap: HTMLElement, data: any[], totalPoints: number) {
  const c = wrap.querySelector<HTMLCanvasElement>('#burndown-canvas');
  if (!c) return;
  const ctx = c.getContext('2d')!;
  const dpr = window.devicePixelRatio || 1;
  const rect = c.getBoundingClientRect();
  
  c.width = rect.width * dpr;
  c.height = rect.height * dpr;
  ctx.scale(dpr, dpr);
  
  const W = rect.width;
  const H = rect.height;
  
  ctx.clearRect(0, 0, W, H);

  const pad = { top: 24, right: 24, bottom: 36, left: 40 };
  const cW = W - pad.left - pad.right, cH = H - pad.top - pad.bottom;

  if (cW <= 0 || cH <= 0) return;

  const labels = ['Inicio', ...data.map(d => `S${d.sprint.number}`)];
  const ideal: number[] = [totalPoints];
  const actual: number[] = [totalPoints];
  const step = totalPoints / data.length;
  data.forEach((d, i) => {
    ideal.push(Math.max(0, Math.round(totalPoints - step * (i + 1))));
    actual.push(d.sprint.status !== 'pending' ? Math.max(0, actual[actual.length - 1] - d.done) : actual[actual.length - 1]);
  });

  const maxY = Math.max(totalPoints, 10);
  const xStep = cW / (labels.length - 1);
  const yScale = (v: number) => pad.top + cH - (v / maxY) * cH;

  // Grid
  ctx.strokeStyle = 'rgba(168,85,247,0.06)'; 
  ctx.lineWidth = 1;
  for (let i = 0; i <= 5; i++) {
    const y = pad.top + (cH / 5) * i;
    ctx.beginPath(); 
    ctx.moveTo(pad.left, y); 
    ctx.lineTo(pad.left + cW, y); 
    ctx.stroke();
    
    ctx.fillStyle = 'rgba(109,91,149,0.7)'; 
    ctx.font = '600 10px Inter,sans-serif'; 
    ctx.textAlign = 'right';
    ctx.fillText(String(Math.round(maxY - (maxY / 5) * i)), pad.left - 10, y + 3);
  }
  
  labels.forEach((l, i) => {
    ctx.fillStyle = 'rgba(109,91,149,0.7)'; 
    ctx.font = '600 10px Inter,sans-serif'; 
    ctx.textAlign = 'center';
    ctx.fillText(l, pad.left + i * xStep, H - 10);
  });

  // Ideal line dashed
  ctx.setLineDash([5, 4]); 
  ctx.strokeStyle = 'rgba(56,189,248,0.4)'; 
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ideal.forEach((v, i) => { 
    const x = pad.left + i * xStep; 
    i === 0 ? ctx.moveTo(x, yScale(v)) : ctx.lineTo(x, yScale(v)); 
  });
  ctx.stroke(); 
  ctx.setLineDash([]);

  // Actual area fill
  ctx.beginPath();
  actual.forEach((v, i) => { 
    const x = pad.left + i * xStep; 
    i === 0 ? ctx.moveTo(x, yScale(v)) : ctx.lineTo(x, yScale(v)); 
  });
  ctx.lineTo(pad.left + (actual.length - 1) * xStep, yScale(0)); 
  ctx.lineTo(pad.left, yScale(0));
  
  const fillGrad = ctx.createLinearGradient(0, pad.top, 0, pad.top + cH);
  fillGrad.addColorStop(0, 'rgba(168,85,247,0.2)'); 
  fillGrad.addColorStop(1, 'rgba(168,85,247,0.005)');
  ctx.fillStyle = fillGrad; 
  ctx.fill();

  // Actual line with glow
  ctx.beginPath(); 
  ctx.strokeStyle = '#C084FC'; 
  ctx.lineWidth = 2.5;
  actual.forEach((v, i) => { 
    const x = pad.left + i * xStep; 
    i === 0 ? ctx.moveTo(x, yScale(v)) : ctx.lineTo(x, yScale(v)); 
  });
  
  ctx.shadowColor = 'rgba(192, 132, 252, 0.4)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 3;
  ctx.stroke();
  
  ctx.shadowBlur = 0; // Reset shadow

  // Dots
  actual.forEach((v, i) => {
    const x = pad.left + i * xStep, y = yScale(v);
    ctx.beginPath(); 
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(192,132,252,0.2)'; 
    ctx.fill();
    
    ctx.beginPath(); 
    ctx.arc(x, y, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#C084FC'; 
    ctx.fill();
    
    // Value label
    ctx.fillStyle = '#EDE9FE'; 
    ctx.font = 'bold 9px Inter,sans-serif'; 
    ctx.textAlign = 'center';
    ctx.fillText(String(v), x, y - 10);
  });
}

function drawVelocity(wrap: HTMLElement, data: any[]) {
  const c = wrap.querySelector<HTMLCanvasElement>('#velocity-canvas');
  if (!c) return;
  const ctx = c.getContext('2d')!;
  const dpr = window.devicePixelRatio || 1;
  const rect = c.getBoundingClientRect();
  
  c.width = rect.width * dpr;
  c.height = rect.height * dpr;
  ctx.scale(dpr, dpr);
  
  const W = rect.width;
  const H = rect.height;
  
  ctx.clearRect(0, 0, W, H);

  const pad = { top: 24, right: 16, bottom: 36, left: 36 };
  const cW = W - pad.left - pad.right, cH = H - pad.top - pad.bottom;

  if (cW <= 0 || cH <= 0 || data.length === 0) return;

  const maxY = Math.max(...data.map(d => Math.max(d.planned, d.done)), 10);
  const gap = cW / data.length;
  const barW = Math.max(gap * 0.28, 12);

  data.forEach((d, i) => {
    const x = pad.left + i * gap + (gap - barW * 2 - 4) / 2;
    const hP = (d.planned / maxY) * cH, hD = (d.done / maxY) * cH;

    // Planned bar
    const gP = ctx.createLinearGradient(x, pad.top + cH - hP, x, pad.top + cH);
    gP.addColorStop(0, 'rgba(168,85,247,0.3)'); 
    gP.addColorStop(1, 'rgba(168,85,247,0.06)');
    ctx.fillStyle = gP;
    roundRect(ctx, x, pad.top + cH - hP, barW, hP, 4);

    // Done bar
    const gD = ctx.createLinearGradient(x + barW + 4, pad.top + cH - hD, x + barW + 4, pad.top + cH);
    gD.addColorStop(0, d.sprint.status === 'pending' ? 'rgba(109,91,149,0.3)' : '#34D399');
    gD.addColorStop(1, d.sprint.status === 'pending' ? 'rgba(109,91,149,0.06)' : 'rgba(52,211,153,0.3)');
    ctx.fillStyle = gD;
    
    if (d.sprint.status !== 'pending') {
      ctx.shadowColor = 'rgba(52, 211, 153, 0.25)';
      ctx.shadowBlur = 8;
    }
    roundRect(ctx, x + barW + 4, pad.top + cH - hD, barW, hD, 4);
    ctx.shadowBlur = 0; // Reset

    // Labels
    ctx.fillStyle = 'rgba(109,91,149,0.7)'; 
    ctx.font = '600 10px Inter,sans-serif'; 
    ctx.textAlign = 'center';
    ctx.fillText(`S${d.sprint.number}`, x + barW + 2, H - 10);

    if (d.done > 0) {
      ctx.fillStyle = '#34D399'; 
      ctx.font = 'bold 9.5px Inter,sans-serif';
      ctx.fillText(String(d.done), x + barW + 4 + barW / 2, pad.top + cH - hD - 6);
    }
    if (d.planned > 0) {
      ctx.fillStyle = 'rgba(168,85,247,0.65)'; 
      ctx.font = 'bold 9px Inter,sans-serif';
      ctx.fillText(String(d.planned), x + barW / 2, pad.top + cH - hP - 6);
    }
  });

  // Grid
  ctx.strokeStyle = 'rgba(168,85,247,0.05)'; 
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = pad.top + (cH / 4) * i;
    ctx.beginPath(); 
    ctx.moveTo(pad.left, y); 
    ctx.lineTo(pad.left + cW, y); 
    ctx.stroke();
  }
}

function drawDistribution(wrap: HTMLElement, data: any[], filterId: string | null) {
  const c = wrap.querySelector<HTMLCanvasElement>('#distribution-canvas');
  if (!c) return;
  const ctx = c.getContext('2d')!;
  const dpr = window.devicePixelRatio || 1;
  const rect = c.getBoundingClientRect();
  
  c.width = rect.width * dpr;
  c.height = rect.height * dpr;
  ctx.scale(dpr, dpr);
  
  const W = rect.width;
  const H = rect.height;
  
  ctx.clearRect(0, 0, W, H);

  const pad = { left: 10, right: 10, top: 16, bottom: 28 };
  const cW = W - pad.left - pad.right;

  if (cW <= 0 || data.length === 0) return;

  const filtered = filterId ? data.filter(d => d.sprint.id === filterId) : data;
  const totalPlanned = filtered.reduce((a, d) => a + d.planned, 0) || 1;

  let xOff = pad.left;
  const colors = ['#A855F7', '#38BDF8', '#34D399', '#FBBF24', '#FB923C'];

  filtered.forEach((d, i) => {
    const w = (d.planned / totalPlanned) * cW;
    if (w <= 0) return;
    
    const doneW = d.planned > 0 ? (d.done / d.planned) * w : 0;
    const progW = d.planned > 0 ? (d.inProg / d.planned) * w : 0;
    const barH = H - pad.top - pad.bottom;
    const y = pad.top;
    const color = colors[i % colors.length];

    // Background bar track
    ctx.fillStyle = 'rgba(168,85,247,0.06)';
    roundRect(ctx, xOff, y, w - 4, barH, 5);

    // Done portion
    if (doneW > 0) {
      const g = ctx.createLinearGradient(xOff, y, xOff, y + barH);
      g.addColorStop(0, color); 
      g.addColorStop(1, color + '77');
      ctx.fillStyle = g;
      roundRect(ctx, xOff, y, Math.max(doneW - 2, 0), barH, 5);
    }

    // In progress portion
    if (progW > 0) {
      ctx.fillStyle = 'rgba(251,191,36,0.35)';
      roundRect(ctx, xOff + doneW, y, Math.max(progW - 2, 0), barH, 0);
    }

    // Labels
    ctx.fillStyle = '#EDE9FE'; 
    ctx.font = 'bold 9.5px Inter,sans-serif'; 
    ctx.textAlign = 'center';
    ctx.fillText(`Sprint ${d.sprint.number}`, xOff + w / 2, H - 8);
    
    ctx.fillStyle = 'rgba(168,85,247,0.85)'; 
    ctx.font = '700 8.5px Inter,sans-serif';
    ctx.fillText(`${d.done}/${d.planned} pt`, xOff + w / 2, y + barH / 2 + 3);

    xOff += w;
  });
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  if (w <= 0 || h <= 0) return;
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y); 
  ctx.lineTo(x + w - r, y); 
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r); 
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h); 
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r); 
  ctx.quadraticCurveTo(x, y, x + r, y); 
  ctx.closePath(); 
  ctx.fill();
}
