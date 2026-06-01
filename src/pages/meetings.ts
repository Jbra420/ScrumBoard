import { getActiveProject } from '../router/index';
import { meetingStore, sprintStore, memberStore, storyStore, generateId, stateStore } from '../store/storage';
import { showModal, showToast } from '../components/modal';
import type { Meeting, MeetingType, DailyEntry } from '../types/index';

const typeLabel: Record<MeetingType,string> = { planning:'📋 Sprint Planning', daily:'☀️ Daily Scrum', review:'✅ Sprint Review', retrospective:'🔄 Retrospectiva' };
const typeClass: Record<MeetingType,string> = { planning:'meeting-planning', daily:'meeting-daily', review:'meeting-review', retrospective:'meeting-retrospective' };

export function renderMeetings(): HTMLElement {
  const wrap = document.createElement('div');
  const project = getActiveProject();
  if (!project) { wrap.innerHTML = '<div class="empty-state"><h3>Sin proyecto activo</h3></div>'; return wrap; }

  let activeTab: MeetingType | 'all' = 'all';

  const render = () => {
    const isGuest = stateStore.get().userRole === 'invitado';
    const meetings = meetingStore.getByProject(project.id);
    const sprints = sprintStore.getByProject(project.id);
    const members = memberStore.getByProject(project.id);
    const filtered = activeTab === 'all' ? meetings : meetings.filter(m => m.type === activeTab);
    const sorted = [...filtered].sort((a, b) => b.date.localeCompare(a.date));

    wrap.innerHTML = `
      <div class="page-header">
        <div>
          <div class="page-title">Reuniones Scrum</div>
          <div class="page-subtitle">${meetings.length} reuniones registradas</div>
        </div>
        ${isGuest ? '' : `
          <div style="display:flex;gap:8px">
            <button class="btn btn-primary" id="new-daily-btn">☀️ Registrar Daily Scrum</button>
            <button class="btn btn-secondary" id="new-other-btn">+ Otra Reunión</button>
          </div>
        `}
      </div>

      <!-- Stats -->
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px">
        ${([['planning','var(--accent)'],['daily','var(--cyan)'],['review','var(--green)'],['retrospective','var(--yellow)']] as const).map(([t,c]) => {
          const cnt = meetings.filter(m => m.type === t).length;
          return `<div class="card" style="border-left:3px solid ${c};padding:14px;cursor:pointer" data-tf="${t}">
            <div style="font-size:11px;color:var(--text-muted)">${typeLabel[t]}</div>
            <div style="font-size:28px;font-weight:800;color:${c}">${cnt}</div>
          </div>`;
        }).join('')}
      </div>

      <div class="tabs">
        ${['all','planning','daily','review','retrospective'].map(t => `<button class="tab-btn${activeTab===t?' active':''}" data-tab="${t}">${t==='all'?'Todas':t==='daily'?'Daily':t==='planning'?'Planning':t==='review'?'Review':'Retro'}</button>`).join('')}
      </div>

      ${sorted.length === 0 ? '<div class="empty-state"><div class="empty-state-icon">📅</div><h3>Sin reuniones registradas</h3><p>Registra tu primera Daily Scrum</p></div>' :
        `<div style="display:flex;flex-direction:column;gap:10px">${sorted.map(m => {
          const sprint = sprints.find(s => s.id === m.sprintId);
          const att = m.attendees.map(id => members.find(x => x.id === id)).filter(Boolean);
          return `<div class="card ${typeClass[m.type]}" style="cursor:pointer" data-mid="${m.id}">
            <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px">
              <div style="flex:1">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;flex-wrap:wrap">
                  <span style="font-size:14px;font-weight:700">${typeLabel[m.type]}</span>
                  ${sprint?`<span class="badge badge-todo">Sprint ${sprint.number}</span>`:''}
                  <span style="font-size:11px;color:var(--text-muted)">📅 ${m.date} · ⏱ ${m.duration} min</span>
                </div>
                ${m.notes?`<div style="font-size:12px;color:var(--text-secondary);line-height:1.5;margin-bottom:8px">${m.notes.substring(0,120)}${m.notes.length>120?'...':''}</div>`:''}
                ${m.type==='daily'&&m.dailyEntries?.length?`<div style="display:flex;gap:8px;flex-wrap:wrap">${m.dailyEntries.map(de => {
                  const mem = members.find(x => x.id === de.memberId);
                  return mem?`<div style="display:flex;align-items:center;gap:4px;background:rgba(168,85,247,0.06);padding:4px 8px;border-radius:6px;border:1px solid var(--border)">
                    <div class="avatar" style="background:${mem.color};width:18px;height:18px;font-size:8px">${mem.name[0]}</div>
                    <span style="font-size:10px;color:var(--text-secondary)">${mem.name}</span>
                  </div>`:'';
                }).join('')}</div>`:''}
                ${m.type==='retrospective'&&m.retroNotes?`<div style="display:flex;gap:8px;font-size:11px">
                  <span style="color:var(--green)">✅ ${m.retroNotes.wentWell.length}</span>
                  <span style="color:var(--red)">❌ ${m.retroNotes.wentBad.length}</span>
                  <span style="color:var(--yellow)">💡 ${m.retroNotes.improvements.length}</span>
                </div>`:''}
              </div>
              <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px">
                <div style="display:flex">${att.slice(0,5).map(mem => `<div class="avatar" style="background:${mem!.color};width:24px;height:24px;font-size:10px;margin-left:-6px;border:2px solid var(--bg-secondary)">${mem!.name[0]}</div>`).join('')}</div>
                <div style="display:flex;gap:4px">
                  <button class="btn btn-secondary btn-sm view-m" data-id="${m.id}" style="font-size:11px">👁 Ver</button>
                  ${isGuest ? '' : `<button class="btn btn-danger btn-sm del-m" data-id="${m.id}" style="font-size:11px">🗑</button>`}
                </div>
              </div>
            </div>
          </div>`;
        }).join('')}</div>`}
    `;

    // Bindings
    wrap.querySelectorAll<HTMLElement>('[data-tab]').forEach(b => b.addEventListener('click', () => { activeTab = b.dataset.tab as any; render(); }));
    wrap.querySelectorAll<HTMLElement>('[data-tf]').forEach(c => c.addEventListener('click', () => { activeTab = c.dataset.tf as MeetingType; render(); }));
    wrap.querySelector('#new-daily-btn')?.addEventListener('click', () => openDailyModal(project.id, sprints, members, () => render()));
    wrap.querySelector('#new-other-btn')?.addEventListener('click', () => openOtherMeetingModal(project.id, sprints, members, () => render()));
    wrap.querySelectorAll<HTMLElement>('.view-m').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); viewMeeting(b.dataset.id!, members, sprints); }));
    wrap.querySelectorAll<HTMLElement>('.del-m').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); if(confirm('¿Eliminar?')){ meetingStore.delete(b.dataset.id!); showToast('Eliminada','success'); render(); } }));
  };

  render();
  return wrap;
}

function openDailyModal(projectId: string, sprints: any[], members: any[], onDone: () => void) {
  const today = new Date().toISOString().split('T')[0];
  const activeSprint = sprints.find((s: any) => s.status === 'active') || sprints[0];
  const stories = activeSprint ? storyStore.getBySprint(activeSprint.id) : [];
  const activeStories = stories.filter(s => s.status === 'in-progress' || s.status === 'todo' || s.status === 'review');

  let selectedMembers: string[] = [];

  const buildMemberSelector = () => members.map((m: any) => `
    <div class="member-toggle" data-mid="${m.id}" style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:${selectedMembers.includes(m.id) ? m.color + '15' : 'var(--bg-card)'};border:1px solid ${selectedMembers.includes(m.id) ? m.color + '40' : 'var(--border)'};border-radius:10px;cursor:pointer;transition:all .2s">
      <div class="avatar" style="background:${m.color};width:32px;height:32px;font-size:13px">${m.name[0]}</div>
      <div style="flex:1">
        <div style="font-size:12px;font-weight:600">${m.name}</div>
        <div style="font-size:10px;color:var(--text-muted)">${m.role}</div>
      </div>
      <div style="width:20px;height:20px;border-radius:50%;border:2px solid ${selectedMembers.includes(m.id) ? m.color : 'var(--border)'};display:flex;align-items:center;justify-content:center;font-size:12px;transition:all .2s">
        ${selectedMembers.includes(m.id) ? '✓' : ''}
      </div>
    </div>
  `).join('');

  const buildEntryForms = () => selectedMembers.map(mid => {
    const m = members.find((x: any) => x.id === mid);
    if (!m) return '';
    // Get stories assigned to this member in active sprint
    const memberStories = activeStories.filter(s => s.assignees.includes(mid));
    const storyOpts = memberStories.map(s => `<option value="${s.id}">${s.id}: ${s.title}</option>`).join('');

    return `
      <div style="background:linear-gradient(145deg,${m.color}08,${m.color}04);border:1px solid ${m.color}25;border-radius:12px;padding:16px;margin-bottom:12px">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
          <div class="avatar" style="background:${m.color};width:36px;height:36px;font-size:14px">${m.name[0]}</div>
          <div>
            <div style="font-size:14px;font-weight:700">${m.name}</div>
            <div style="font-size:10px;color:${m.color}">${m.specialty.split(',')[0]}</div>
          </div>
        </div>

        ${memberStories.length > 0 ? `
          <div class="form-group">
            <label class="form-label">📋 Historia de usuario relacionada</label>
            <select class="form-select" name="story-${mid}">
              <option value="">— Sin historia específica —</option>
              ${storyOpts}
            </select>
          </div>
        ` : ''}

        <div class="form-group">
          <label class="form-label" style="color:var(--green)">✅ ¿Qué se realizó? (clase anterior)</label>
          <textarea class="form-textarea" name="yesterday-${mid}" placeholder="Describe lo que completaste en la clase/sesión anterior..." style="min-height:60px"></textarea>
        </div>
        <div class="form-group">
          <label class="form-label" style="color:var(--cyan)">🔄 ¿Qué está haciendo ahora?</label>
          <textarea class="form-textarea" name="today-${mid}" placeholder="Describe en qué estás trabajando actualmente..." style="min-height:60px"></textarea>
        </div>
        <div class="form-group">
          <label class="form-label" style="color:var(--yellow)">📅 ¿Qué se espera para la siguiente clase?</label>
          <textarea class="form-textarea" name="blockers-${mid}" placeholder="Describe lo que planeas entregar o avanzar para la próxima sesión..." style="min-height:60px"></textarea>
        </div>
      </div>
    `;
  }).join('');

  const body = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
      <div class="form-group">
        <label class="form-label">📅 Fecha de la reunión</label>
        <input class="form-input" name="date" type="date" value="${today}">
      </div>
      <div class="form-group">
        <label class="form-label">🏃 Sprint</label>
        <select class="form-select" name="sprintId">
          ${sprints.map((s: any) => `<option value="${s.id}" ${s.id === activeSprint?.id ? 'selected' : ''}>Sprint ${s.number}: ${s.name}</option>`).join('')}
        </select>
      </div>
    </div>

    ${activeStories.length > 0 ? `
      <div style="background:rgba(168,85,247,0.05);border:1px solid var(--border);border-radius:10px;padding:12px;margin-bottom:16px">
        <div style="font-size:11px;font-weight:700;color:var(--accent-light);margin-bottom:6px">📋 BACKLOG DEL SPRINT ACTIVO</div>
        <div style="display:flex;flex-direction:column;gap:4px;max-height:120px;overflow-y:auto">
          ${activeStories.map(s => {
            const badge = s.status === 'in-progress' ? 'badge-progress' : s.status === 'review' ? 'badge-review' : 'badge-todo';
            const label = s.status === 'in-progress' ? 'En progreso' : s.status === 'review' ? 'Revisión' : 'Por hacer';
            return `<div style="display:flex;align-items:center;gap:6px;font-size:11px">
              <span style="color:var(--text-muted);font-weight:600;width:42px">${s.id}</span>
              <span style="flex:1;color:var(--text-secondary)">${s.title}</span>
              <span class="badge ${badge}" style="font-size:9px">${label}</span>
              <span style="font-size:9px;color:var(--accent-light)">${s.storyPoints}pt</span>
            </div>`;
          }).join('')}
        </div>
      </div>
    ` : ''}

    <div style="font-size:12px;font-weight:700;color:var(--text-primary);margin-bottom:10px">👥 Selecciona los integrantes presentes</div>
    <div id="member-selector" style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px">
      ${buildMemberSelector()}
    </div>

    <div id="entry-forms"></div>

    <div class="form-group">
      <label class="form-label">📝 Notas generales de la reunión</label>
      <textarea class="form-textarea" name="notes" placeholder="Observaciones adicionales, decisiones tomadas..."></textarea>
    </div>
  `;

  const overlay = showModal('☀️ Registrar Daily Scrum', body, () => {});

  // Make modal wider
  const modalBox = overlay.querySelector('.modal') as HTMLElement;
  if (modalBox) modalBox.style.maxWidth = '720px';

  // Member toggle logic
  const updateToggles = () => {
    const sel = overlay.querySelector('#member-selector')!;
    sel.innerHTML = buildMemberSelector();
    sel.querySelectorAll<HTMLElement>('.member-toggle').forEach(el => {
      el.addEventListener('click', () => {
        const mid = el.dataset.mid!;
        if (selectedMembers.includes(mid)) selectedMembers = selectedMembers.filter(x => x !== mid);
        else selectedMembers.push(mid);
        updateToggles();
        overlay.querySelector('#entry-forms')!.innerHTML = buildEntryForms();
      });
    });
  };
  updateToggles();

  overlay.querySelector('#modal-confirm')?.addEventListener('click', () => {
    if (selectedMembers.length === 0) { showToast('Selecciona al menos un integrante', 'error'); return; }
    const g = (n: string) => (overlay.querySelector<HTMLInputElement>(`[name="${n}"]`)?.value || '').trim();

    const dailyEntries: DailyEntry[] = selectedMembers.map(mid => ({
      memberId: mid,
      yesterday: g(`yesterday-${mid}`),
      today: g(`today-${mid}`),
      blockers: g(`blockers-${mid}`),
    }));

    const meeting: Meeting = {
      id: generateId(), projectId, sprintId: g('sprintId'), type: 'daily',
      date: g('date'), duration: 15, attendees: selectedMembers,
      notes: g('notes'), dailyEntries,
    };

    meetingStore.add(meeting);
    showToast('Daily Scrum registrada ✅', 'success');
    overlay.remove();
    onDone();
  });
}

function openOtherMeetingModal(projectId: string, sprints: any[], members: any[], onDone: () => void) {
  const today = new Date().toISOString().split('T')[0];
  const body = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px">
      <div class="form-group">
        <label class="form-label">Tipo</label>
        <select class="form-select" name="type" id="mt-type">
          <option value="planning">📋 Sprint Planning</option>
          <option value="review">✅ Sprint Review</option>
          <option value="retrospective">🔄 Retrospectiva</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Sprint</label>
        <select class="form-select" name="sprintId">
          ${sprints.map((s: any) => `<option value="${s.id}">Sprint ${s.number}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Fecha</label>
        <input class="form-input" name="date" type="date" value="${today}">
      </div>
      <div class="form-group">
        <label class="form-label">Duración (min)</label>
        <input class="form-input" name="duration" type="number" value="60">
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Asistentes</label>
      <select class="form-select" name="attendees" multiple style="height:80px">
        ${members.map((m: any) => `<option value="${m.id}" selected>${m.name} — ${m.role}</option>`).join('')}
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Notas</label>
      <textarea class="form-textarea" name="notes" placeholder="Resumen de la reunión..."></textarea>
    </div>
    <div id="extra-fields"></div>
  `;

  const overlay = showModal('Nueva Reunión', body, () => {});

  const updateExtra = () => {
    const t = (overlay.querySelector<HTMLSelectElement>('[name="type"]')?.value || 'planning') as MeetingType;
    const extra = overlay.querySelector('#extra-fields')!;
    if (t === 'retrospective') {
      extra.innerHTML = `
        <div class="form-group"><label class="form-label" style="color:var(--green)">✅ ¿Qué salió bien?</label><textarea class="form-textarea" name="retro-well" style="min-height:60px"></textarea></div>
        <div class="form-group"><label class="form-label" style="color:var(--red)">❌ ¿Qué salió mal?</label><textarea class="form-textarea" name="retro-bad" style="min-height:60px"></textarea></div>
        <div class="form-group"><label class="form-label" style="color:var(--yellow)">💡 ¿Qué podemos mejorar?</label><textarea class="form-textarea" name="retro-improve" style="min-height:60px"></textarea></div>`;
    } else if (t === 'review') {
      extra.innerHTML = `<div class="form-group"><label class="form-label">📦 Entregables demostrados (uno por línea)</label><textarea class="form-textarea" name="review-items" style="min-height:80px"></textarea></div>`;
    } else extra.innerHTML = '';
  };
  overlay.querySelector('#mt-type')?.addEventListener('change', updateExtra);
  updateExtra();

  overlay.querySelector('#modal-confirm')?.addEventListener('click', () => {
    const g = (n: string) => (overlay.querySelector<HTMLInputElement>(`[name="${n}"]`)?.value || '').trim();
    const type = g('type') as MeetingType;
    const attEl = overlay.querySelector<HTMLSelectElement>('[name="attendees"]');
    const attendees = attEl ? Array.from(attEl.selectedOptions).map(o => o.value) : [];
    let retroNotes, reviewItems;
    if (type === 'retrospective') retroNotes = { wentWell: g('retro-well').split('\n').filter(Boolean), wentBad: g('retro-bad').split('\n').filter(Boolean), improvements: g('retro-improve').split('\n').filter(Boolean) };
    if (type === 'review') reviewItems = g('review-items').split('\n').filter(Boolean);

    meetingStore.add({ id: generateId(), projectId, sprintId: g('sprintId'), type, date: g('date'), duration: parseInt(g('duration')) || 60, attendees, notes: g('notes'), retroNotes, reviewItems });
    showToast('Reunión registrada ✅', 'success');
    overlay.remove(); onDone();
  });
}

function viewMeeting(id: string, members: any[], sprints: any[]) {
  const m = meetingStore.getById(id);
  if (!m) return;
  const sprint = sprints.find((s: any) => s.id === m.sprintId);
  let body = `<div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap">
    <span class="badge badge-todo">${sprint ? `Sprint ${sprint.number}` : ''}</span>
    <span style="font-size:12px;color:var(--text-muted)">📅 ${m.date} · ⏱ ${m.duration} min</span>
  </div>
  ${m.notes ? `<p style="font-size:13px;color:var(--text-secondary);line-height:1.6;margin-bottom:14px">${m.notes}</p>` : ''}`;

  if (m.type === 'daily' && m.dailyEntries?.length) {
    body += `<div style="font-size:11px;font-weight:700;color:var(--accent-light);margin-bottom:10px">DAILY SCRUM — REGISTRO POR INTEGRANTE</div>`;
    m.dailyEntries.forEach(de => {
      const mem = members.find((x: any) => x.id === de.memberId);
      if (!mem) return;
      body += `<div style="background:linear-gradient(145deg,${mem.color}08,${mem.color}04);border:1px solid ${mem.color}25;border-radius:10px;padding:14px;margin-bottom:10px">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
          <div class="avatar" style="background:${mem.color};width:30px;height:30px;font-size:12px">${mem.name[0]}</div>
          <div><div style="font-size:13px;font-weight:700">${mem.name}</div><div style="font-size:10px;color:${mem.color}">${mem.role}</div></div>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;font-size:12px;line-height:1.5">
          ${de.yesterday ? `<div><span style="color:var(--green);font-weight:600">✅ Lo que se realizó:</span><br><span style="color:var(--text-secondary)">${de.yesterday}</span></div>` : ''}
          ${de.today ? `<div><span style="color:var(--cyan);font-weight:600">🔄 Lo que está haciendo:</span><br><span style="color:var(--text-secondary)">${de.today}</span></div>` : ''}
          ${de.blockers ? `<div><span style="color:var(--yellow);font-weight:600">📅 Para la siguiente clase:</span><br><span style="color:var(--text-secondary)">${de.blockers}</span></div>` : ''}
        </div>
      </div>`;
    });
  }

  if (m.type === 'retrospective' && m.retroNotes) {
    const { wentWell, wentBad, improvements } = m.retroNotes;
    body += `<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px">
      <div style="background:rgba(52,211,153,.08);border:1px solid rgba(52,211,153,.2);border-radius:10px;padding:12px">
        <div style="font-size:11px;font-weight:700;color:var(--green);margin-bottom:8px">✅ ¿Qué salió bien?</div>
        ${wentWell.map(w => `<div style="font-size:11px;margin-bottom:4px">• ${w}</div>`).join('')}
      </div>
      <div style="background:rgba(248,113,113,.08);border:1px solid rgba(248,113,113,.2);border-radius:10px;padding:12px">
        <div style="font-size:11px;font-weight:700;color:var(--red);margin-bottom:8px">❌ ¿Qué salió mal?</div>
        ${wentBad.map(w => `<div style="font-size:11px;margin-bottom:4px">• ${w}</div>`).join('')}
      </div>
      <div style="background:rgba(251,191,36,.08);border:1px solid rgba(251,191,36,.2);border-radius:10px;padding:12px">
        <div style="font-size:11px;font-weight:700;color:var(--yellow);margin-bottom:8px">💡 Mejoras</div>
        ${improvements.map(w => `<div style="font-size:11px;margin-bottom:4px">• ${w}</div>`).join('')}
      </div>
    </div>`;
  }

  if (m.type === 'review' && m.reviewItems?.length) {
    body += `<div style="font-size:11px;font-weight:700;color:var(--green);margin-bottom:8px">📦 ENTREGABLES</div>
    ${m.reviewItems.map(i => `<div style="font-size:12px;padding:6px 0;border-bottom:1px solid var(--border)">✓ ${i}</div>`).join('')}`;
  }

  const overlay = showModal(typeLabel[m.type], body);
  const modalBox = overlay.querySelector('.modal') as HTMLElement;
  if (modalBox) modalBox.style.maxWidth = '700px';
}
