// ============================================================
// ScrumBoard Pro — Project Creation Manual
// Interactive guide visible only to Scrum Masters
// ============================================================

export function renderProjectManual(): HTMLElement {
  const container = document.createElement('div');
  container.style.cssText = 'display:flex;flex-direction:column;gap:0;';

  const sections = [
    {
      icon: '🧭',
      title: '¿Qué es un Proyecto Scrum?',
      color: '#A855F7',
      content: `
        <p>Un <strong>Proyecto Scrum</strong> es la unidad principal de trabajo. Agrupa todos los elementos del proceso ágil: sprints, historias de usuario, equipo y reuniones.</p>
        <ul>
          <li>🎯 Define el <strong>objetivo global</strong> del desarrollo</li>
          <li>📅 Tiene una <strong>duración estimada</strong> (en semanas)</li>
          <li>👥 Involucra a <strong>un equipo multidisciplinario</strong></li>
          <li>🔄 Se ejecuta en iteraciones llamadas <strong>Sprints</strong></li>
        </ul>
      `,
    },
    {
      icon: '🏃',
      title: 'Estructura de Sprints',
      color: '#38BDF8',
      content: `
        <p>Los <strong>Sprints</strong> son ciclos cortos (1–4 semanas) donde el equipo entrega valor incremental.</p>
        <ul>
          <li>📋 Cada sprint tiene un <strong>objetivo claro</strong> y un conjunto de historias de usuario</li>
          <li>🎯 Sprint 1: Siempre empieza con <strong>análisis y arquitectura</strong></li>
          <li>⚡ Los sprints se crean desde la sección <strong>Sprints / Kanban</strong></li>
          <li>📊 Visualiza el progreso con el <strong>Burndown Chart</strong></li>
        </ul>
        <div style="background:rgba(56,189,248,0.08);border:1px solid rgba(56,189,248,0.2);border-radius:8px;padding:10px;margin-top:8px;font-size:11px;color:var(--text-secondary)">
          💡 <strong>Tip:</strong> Se recomienda sprints de 2 semanas (14 días) para mantener el ritmo y la retroalimentación frecuente.
        </div>
      `,
    },
    {
      icon: '📚',
      title: 'Épicas e Historias de Usuario',
      color: '#34D399',
      content: `
        <p>Las <strong>Épicas</strong> son grandes bloques de funcionalidad. Cada épica agrupa varias <strong>Historias de Usuario</strong> relacionadas.</p>
        <ul>
          <li>🏷️ Ejemplo de épica: "Gestión de Usuarios", "Módulo de Pagos"</li>
          <li>📝 Las historias siguen el formato: <em>"Como [rol] quiero [función] para [beneficio]"</em></li>
          <li>⭐ Cada historia tiene <strong>puntos de historia</strong> (1, 2, 3, 5, 8, 13)</li>
          <li>✅ Define los <strong>criterios de aceptación</strong> para validar cada historia</li>
        </ul>
        <div style="background:rgba(52,211,153,0.08);border:1px solid rgba(52,211,153,0.2);border-radius:8px;padding:10px;margin-top:8px;font-size:11px;color:var(--text-secondary)">
          💡 <strong>Tip:</strong> Comienza con 3–5 épicas máximo. Puedes agregar más a medida que el proyecto crece.
        </div>
      `,
    },
    {
      icon: '👥',
      title: 'Gestión del Equipo',
      color: '#FBBF24',
      content: `
        <p>Agrega los <strong>miembros del equipo</strong> con sus roles y especialidades desde la sección <strong>Equipo</strong>.</p>
        <ul>
          <li>🧑‍💻 Define el rol de cada miembro: Developer, Designer, QA, etc.</li>
          <li>🎯 Asigna historias de usuario y tareas a los miembros</li>
          <li>📊 Cada miembro tiene un color de identificación único</li>
          <li>🏃 Configura en qué sprints se enfoca cada miembro</li>
        </ul>
        <div style="background:rgba(251,191,36,0.08);border:1px solid rgba(251,191,36,0.2);border-radius:8px;padding:10px;margin-top:8px;font-size:11px;color:var(--text-secondary)">
          💡 <strong>Tip:</strong> El Scrum Master coordina pero no asigna trabajo — el equipo se autoorganiza.
        </div>
      `,
    },
    {
      icon: '🎨',
      title: 'Nomenclatura y Buenas Prácticas',
      color: '#FB923C',
      content: `
        <p>Un buen nombre de proyecto comunica el <strong>contexto y propósito</strong> de inmediato.</p>
        <ul>
          <li>✅ <strong>Bueno:</strong> "Sistema de Facturación Electrónica v2", "App Móvil de Delivery"</li>
          <li>❌ <strong>Malo:</strong> "Proyecto1", "Sistema nuevo", "App"</li>
          <li>🎨 Usa colores consistentes: <span style="color:#A855F7">■</span> Violeta para tech, <span style="color:#38BDF8">■</span> Azul para SaaS, <span style="color:#34D399">■</span> Verde para datos</li>
          <li>📋 La descripción debe resumir el <strong>alcance en 1–2 oraciones</strong></li>
        </ul>
        <div style="background:rgba(251,146,60,0.08);border:1px solid rgba(251,146,60,0.2);border-radius:8px;padding:10px;margin-top:8px;font-size:11px;color:var(--text-secondary)">
          💡 <strong>Tip Duración:</strong> Proyectos académicos: 8–12 semanas. Proyectos profesionales: 12–24 semanas.
        </div>
      `,
    },
  ];

  sections.forEach((section, idx) => {
    const item = document.createElement('div');
    item.style.cssText = `border-bottom: 1px solid var(--border); overflow:hidden;`;

    const header = document.createElement('div');
    header.style.cssText = `
      display:flex;align-items:center;gap:12px;padding:14px 16px;cursor:pointer;
      transition:background 0.2s;user-select:none;
    `;
    header.innerHTML = `
      <div style="width:32px;height:32px;border-radius:8px;background:${section.color}18;
        border:1px solid ${section.color}30;display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0">
        ${section.icon}
      </div>
      <div style="flex:1;font-size:13px;font-weight:700;color:var(--text-primary)">${section.title}</div>
      <div class="manual-chevron" style="color:var(--text-muted);font-size:11px;transition:transform 0.25s">▼</div>
    `;

    const body = document.createElement('div');
    body.style.cssText = `
      padding:0 16px;max-height:0;overflow:hidden;
      transition:max-height 0.35s cubic-bezier(.4,0,.2,1),padding 0.25s;
      font-size:12.5px;color:var(--text-secondary);line-height:1.7;
    `;
    body.innerHTML = `<div style="padding-bottom:16px">${section.content}</div>`;

    // Add base UL/LI styles
    const style = document.createElement('style');
    style.textContent = `
      .manual-body ul { margin:8px 0;padding-left:20px;display:flex;flex-direction:column;gap:4px; }
      .manual-body li { list-style:none;padding-left:0; }
      .manual-body strong { color:var(--text-primary);font-weight:700; }
      .manual-body em { color:var(--accent-light);font-style:italic; }
      .manual-body p { margin:0 0 8px; }
    `;
    body.classList.add('manual-body');
    body.appendChild(style);

    let open = idx === 0; // First section starts open

    const toggle = () => {
      open = !open;
      const chevron = header.querySelector('.manual-chevron') as HTMLElement;
      if (open) {
        body.style.maxHeight = '500px';
        body.style.padding = '0 16px';
        chevron.style.transform = 'rotate(180deg)';
        header.style.background = `${section.color}08`;
      } else {
        body.style.maxHeight = '0';
        chevron.style.transform = 'rotate(0deg)';
        header.style.background = 'transparent';
      }
    };

    // Set initial state
    if (open) {
      body.style.maxHeight = '500px';
      header.style.background = `${section.color}08`;
      const chevron = header.querySelector('.manual-chevron') as HTMLElement;
      if (chevron) chevron.style.transform = 'rotate(180deg)';
    }

    header.addEventListener('click', toggle);
    header.addEventListener('mouseenter', () => {
      if (!open) header.style.background = 'rgba(255,255,255,0.02)';
    });
    header.addEventListener('mouseleave', () => {
      if (!open) header.style.background = 'transparent';
    });

    item.appendChild(header);
    item.appendChild(body);
    container.appendChild(item);
  });

  return container;
}
