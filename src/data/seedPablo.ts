import type { Project, TeamMember, Sprint, Epic, UserStory } from '../types/index';
import { projectStore, memberStore, sprintStore, epicStore, storyStore } from '../store/storage';

const PID = 'pablo-rehab-knee-001';

export function isPabloProjectSeeded(): boolean {
  return localStorage.getItem('pablo_rehab_seeded') === 'true';
}

export function seedPabloProject(): void {
  if (isPabloProjectSeeded()) return;
  // Guard: don't duplicate if project already exists
  if (projectStore.getAll().find(p => p.id === PID)) {
    localStorage.setItem('pablo_rehab_seeded', 'true');
    return;
  }

  const project: Project = {
    id: PID,
    name: 'Plataforma de Monitoreo Terapéutico — Rodilla',
    description: 'Plataforma de monitoreo terapéutico para rehabilitación de rodilla en adultos mayores. Integra sensores IMU, MQTT/EMQX, NestJS, PostgreSQL y dashboard React para seguimiento en tiempo real.',
    status: 'active',
    createdAt: '2026-06-01',
    totalWeeks: 11,
    color: '#38BDF8',
  };

  const members: TeamMember[] = [
    { id: 'pablo-ortega', projectId: PID, name: 'Pablo Ortega', role: 'Scrum Master / Full Stack Developer', specialty: 'React, NestJS, PostgreSQL, MQTT, coordinación de proyecto', color: '#38BDF8', sprintFocus: [1,2,3,4,5,6,7,8,9,10,11] },
    { id: 'andres-gutierrez', projectId: PID, name: 'Andrés Gutiérrez', role: 'Backend & IoT Developer', specialty: 'NestJS, PostgreSQL, MQTT, EMQX, Simulación IMU, WebSocket', color: '#A855F7', sprintFocus: [2,3,4,5,6,7,8,9,10] },
  ];

  const sprints: Sprint[] = [
    { id: `${PID}-s1`,  projectId: PID, number: 1,  name: 'Requerimientos y alcance',    goal: 'Definir el alcance del sistema y sus requerimientos funcionales.',         startDate: '2026-06-01', endDate: '2026-06-07',  status: 'completed', plannedPoints: 8  },
    { id: `${PID}-s2`,  projectId: PID, number: 2,  name: 'Arquitectura y flujo MQTT',   goal: 'Diseñar la arquitectura del sistema y el flujo MQTT.',                    startDate: '2026-06-08', endDate: '2026-06-14',  status: 'completed', plannedPoints: 8  },
    { id: `${PID}-s3`,  projectId: PID, number: 3,  name: 'Base de datos PostgreSQL',    goal: 'Diseñar e implementar el modelo de base de datos relacional.',             startDate: '2026-06-15', endDate: '2026-06-21',  status: 'active',    plannedPoints: 8  },
    { id: `${PID}-s4`,  projectId: PID, number: 4,  name: 'Backend NestJS',              goal: 'Configurar el proyecto NestJS con estructura modular.',                   startDate: '2026-06-22', endDate: '2026-06-28',  status: 'pending',   plannedPoints: 8  },
    { id: `${PID}-s5`,  projectId: PID, number: 5,  name: 'Integración PostgreSQL',      goal: 'Conectar el backend NestJS con la base de datos PostgreSQL.',             startDate: '2026-06-29', endDate: '2026-07-05',  status: 'pending',   plannedPoints: 8  },
    { id: `${PID}-s6`,  projectId: PID, number: 6,  name: 'API REST',                   goal: 'Desarrollar los endpoints CRUD de usuarios y pacientes.',                 startDate: '2026-07-06', endDate: '2026-07-12',  status: 'pending',   plannedPoints: 13 },
    { id: `${PID}-s7`,  projectId: PID, number: 7,  name: 'Simulador IMU',               goal: 'Implementar el simulador de métricas de sensores IMU.',                   startDate: '2026-07-13', endDate: '2026-07-19',  status: 'pending',   plannedPoints: 13 },
    { id: `${PID}-s8`,  projectId: PID, number: 8,  name: 'MQTT y EMQX',                goal: 'Integrar el broker EMQX y el protocolo MQTT en el sistema.',              startDate: '2026-07-20', endDate: '2026-07-26',  status: 'pending',   plannedPoints: 13 },
    { id: `${PID}-s9`,  projectId: PID, number: 9,  name: 'Frontend React',              goal: 'Desarrollar el dashboard de visualización con React.',                    startDate: '2026-07-27', endDate: '2026-08-02',  status: 'pending',   plannedPoints: 13 },
    { id: `${PID}-s10`, projectId: PID, number: 10, name: 'Integración y WebSocket',     goal: 'Conectar frontend con backend en tiempo real mediante WebSocket.',        startDate: '2026-08-03', endDate: '2026-08-09',  status: 'pending',   plannedPoints: 8  },
    { id: `${PID}-s11`, projectId: PID, number: 11, name: 'Documentación y defensa',     goal: 'Completar manual técnico, documentación final y preparar la defensa.',    startDate: '2026-08-10', endDate: '2026-08-16',  status: 'pending',   plannedPoints: 8  },
  ];

  const epics: Epic[] = [
    { id: `${PID}-e1`, projectId: PID, name: 'Análisis y Arquitectura',     color: '#A855F7', description: 'Definición de requerimientos y diseño del sistema' },
    { id: `${PID}-e2`, projectId: PID, name: 'Base de Datos y Backend',     color: '#38BDF8', description: 'Persistencia, API REST y lógica de negocio' },
    { id: `${PID}-e3`, projectId: PID, name: 'Integración IoT / MQTT',      color: '#34D399', description: 'Sensores IMU, EMQX y comunicación en tiempo real' },
    { id: `${PID}-e4`, projectId: PID, name: 'Frontend y Visualización',    color: '#FB923C', description: 'Dashboard React y experiencia de usuario' },
    { id: `${PID}-e5`, projectId: PID, name: 'Documentación y Entrega',     color: '#FBBF24', description: 'Manual técnico, documentación y defensa final' },
  ];

  const stories: UserStory[] = [
    {
      id: 'PB-01', projectId: PID, sprintId: `${PID}-s1`, epicId: `${PID}-e1`,
      title: 'Análisis y definición del proyecto',
      description: 'Como equipo quiero documentar el análisis y requerimientos del sistema de monitoreo para establecer una base sólida de desarrollo.',
      assignees: ['pablo-ortega', 'andres-gutierrez'], priority: 'critical', storyPoints: 8, status: 'done',
      acceptanceCriteria: ['Documento de análisis completo', 'Requerimientos funcionales definidos', 'Alcance del sistema delimitado', 'Stakeholders identificados'],
      createdAt: '2026-06-01',
    },
    {
      id: 'PB-02', projectId: PID, sprintId: `${PID}-s2`, epicId: `${PID}-e1`,
      title: 'Diseño de arquitectura del sistema',
      description: 'Como arquitecto quiero definir la arquitectura general del sistema incluyendo el flujo MQTT para asegurar escalabilidad.',
      assignees: ['pablo-ortega', 'andres-gutierrez'], priority: 'critical', storyPoints: 8, status: 'done',
      acceptanceCriteria: ['Diagrama de arquitectura creado', 'Flujo MQTT documentado', 'Tecnologías seleccionadas', 'Componentes del sistema definidos'],
      createdAt: '2026-06-08',
    },
    {
      id: 'PB-03', projectId: PID, sprintId: `${PID}-s3`, epicId: `${PID}-e2`,
      title: 'Diseño de base de datos',
      description: 'Como desarrollador backend quiero diseñar el modelo de base de datos para almacenar los datos de pacientes y métricas.',
      assignees: ['andres-gutierrez'], priority: 'high', storyPoints: 8, status: 'in-progress',
      acceptanceCriteria: ['Modelo entidad-relación creado', 'Script SQL generado', 'Tablas normalizadas', 'Relaciones definidas correctamente'],
      createdAt: '2026-06-15',
    },
    {
      id: 'PB-04', projectId: PID, sprintId: `${PID}-s4`, epicId: `${PID}-e2`,
      title: 'Configuración del backend NestJS',
      description: 'Como desarrollador quiero configurar el proyecto NestJS con estructura modular para el desarrollo del API.',
      assignees: ['andres-gutierrez'], priority: 'high', storyPoints: 8, status: 'todo',
      acceptanceCriteria: ['Proyecto NestJS funcional', 'Módulos base configurados', 'Variables de entorno establecidas', 'Dockerfile creado'],
      createdAt: '2026-06-22',
    },
    {
      id: 'PB-05', projectId: PID, sprintId: `${PID}-s5`, epicId: `${PID}-e2`,
      title: 'Integración PostgreSQL con NestJS',
      description: 'Como desarrollador quiero conectar el backend NestJS con PostgreSQL usando TypeORM para la persistencia de datos.',
      assignees: ['andres-gutierrez'], priority: 'high', storyPoints: 8, status: 'todo',
      acceptanceCriteria: ['Conexión Backend ↔ PostgreSQL establecida', 'TypeORM configurado', 'Migraciones funcionando', 'Repositorios base creados'],
      createdAt: '2026-06-29',
    },
    {
      id: 'PB-06', projectId: PID, sprintId: `${PID}-s6`, epicId: `${PID}-e2`,
      title: 'Desarrollo API REST',
      description: 'Como desarrollador quiero implementar los endpoints CRUD de usuarios y pacientes para gestionar los datos del sistema.',
      assignees: ['pablo-ortega', 'andres-gutierrez'], priority: 'high', storyPoints: 13, status: 'todo',
      acceptanceCriteria: ['CRUD de usuarios implementado', 'CRUD de pacientes implementado', 'Autenticación JWT integrada', 'Validaciones de datos aplicadas', 'Documentación Swagger generada'],
      createdAt: '2026-07-06',
    },
    {
      id: 'PB-07', projectId: PID, sprintId: `${PID}-s7`, epicId: `${PID}-e3`,
      title: 'Simulación de sensores IMU',
      description: 'Como desarrollador IoT quiero crear un simulador de métricas IMU para validar el sistema sin hardware físico.',
      assignees: ['andres-gutierrez'], priority: 'high', storyPoints: 13, status: 'todo',
      acceptanceCriteria: ['Simulador de métricas IMU funcional', 'Datos de ángulo y aceleración generados', 'Frecuencia de muestreo configurable', 'Integración con pipeline de datos'],
      createdAt: '2026-07-13',
    },
    {
      id: 'PB-08', projectId: PID, sprintId: `${PID}-s8`, epicId: `${PID}-e3`,
      title: 'Integración MQTT y EMQX',
      description: 'Como arquitecto IoT quiero integrar el broker EMQX con el backend para recibir datos de sensores en tiempo real.',
      assignees: ['andres-gutierrez'], priority: 'critical', storyPoints: 13, status: 'todo',
      acceptanceCriteria: ['Broker EMQX configurado y funcionando', 'NestJS conectado al broker', 'Tópicos MQTT definidos', 'Mensajes recibidos y procesados correctamente'],
      createdAt: '2026-07-20',
    },
    {
      id: 'PB-09', projectId: PID, sprintId: `${PID}-s9`, epicId: `${PID}-e4`,
      title: 'Desarrollo Frontend React',
      description: 'Como usuario médico quiero un dashboard React que visualice las métricas de rehabilitación de forma clara e intuitiva.',
      assignees: ['pablo-ortega'], priority: 'high', storyPoints: 13, status: 'todo',
      acceptanceCriteria: ['Dashboard React implementado', 'Gráficas de métricas IMU visibles', 'Lista de pacientes funcional', 'Diseño responsivo aplicado', 'Conexión con API REST establecida'],
      createdAt: '2026-07-27',
    },
    {
      id: 'PB-10', projectId: PID, sprintId: `${PID}-s10`, epicId: `${PID}-e4`,
      title: 'Integración en tiempo real con WebSocket',
      description: 'Como usuario quiero ver las métricas del paciente actualizarse en tiempo real para monitoreo continuo.',
      assignees: ['pablo-ortega', 'andres-gutierrez'], priority: 'critical', storyPoints: 8, status: 'todo',
      acceptanceCriteria: ['WebSocket funcional entre frontend y backend', 'Datos actualizados sin recargar página', 'Latencia < 500ms', 'Reconexión automática implementada'],
      createdAt: '2026-08-03',
    },
    {
      id: 'PB-11', projectId: PID, sprintId: `${PID}-s11`, epicId: `${PID}-e5`,
      title: 'Documentación y cierre del proyecto',
      description: 'Como equipo quiero completar el manual técnico y la documentación final para la entrega y defensa del proyecto.',
      assignees: ['pablo-ortega', 'andres-gutierrez'], priority: 'medium', storyPoints: 8, status: 'todo',
      acceptanceCriteria: ['Manual de usuario completo', 'Documentación técnica final entregada', 'Video demo grabado', 'Presentación de defensa preparada'],
      createdAt: '2026-08-10',
    },
  ];

  projectStore.add(project);
  members.forEach(m => memberStore.add(m));
  sprints.forEach(s => sprintStore.add(s));
  epics.forEach(e => epicStore.add(e));
  stories.forEach(s => storyStore.add(s));

  localStorage.setItem('pablo_rehab_seeded', 'true');
  console.log('ScrumBoard Pro — Proyecto Plataforma Rehabilitación (PABLO) sembrado correctamente.');
}
