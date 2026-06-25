import type { Project, TeamMember, Sprint, Epic, UserStory } from '../types/index';
import { projectStore, memberStore, sprintStore, epicStore, storyStore, taskStore, markSeeded } from '../store/storage';

const PID = 'gad-municipal-001';

const project: Project = {
  id: PID,
  name: 'GAD Municipal & Blockchain',
  color: '#A855F7',
  description: 'Sistema de almacenamiento y trazabilidad blockchain para el GAD Municipal de Cañar. Gestión de trámites con IPFS, firma electrónica y verificación QR.',
  status: 'active',
  createdAt: '2025-03-01',
  totalWeeks: 20
};

const members: TeamMember[] = [
  {
    "id": "juan",
    "projectId": "gad-municipal-001",
    "name": "Juan",
    "role": "Scrum Master",
    "specialty": "Gestión de proyecto",
    "color": "#A855F7",
    "sprintFocus": [
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10
    ]
  },
  {
    "id": "alexis",
    "projectId": "gad-municipal-001",
    "name": "Alexis",
    "role": "Blockchain Developer",
    "specialty": "NestJS, IPFS, SHA-256, Hash Chain, Audit Logs",
    "color": "#38BDF8",
    "sprintFocus": [
      6,
      7,
      9,
      10
    ]
  },
  {
    "id": "telmo",
    "projectId": "gad-municipal-001",
    "name": "Telmo",
    "role": "Documentation & Process Lead",
    "specialty": "SRS, T&C, manuales, casos de uso",
    "color": "#FBBF24",
    "sprintFocus": [
      1,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10
    ]
  },
  {
    "id": "carlos",
    "projectId": "gad-municipal-001",
    "name": "Carlos",
    "role": "QA & Process Reviewer",
    "specialty": "Revisa y valida todo lo que redacta Telmo",
    "color": "#34D399",
    "sprintFocus": [
      1,
      3,
      4,
      9,
      10
    ]
  },
  {
    "id": "gabriel",
    "projectId": "gad-municipal-001",
    "name": "Gabriel",
    "role": "Frontend Developer",
    "specialty": "React, Vite, Tailwind CSS, Zustand",
    "color": "#FB923C",
    "sprintFocus": [
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10
    ]
  },
  {
    "id": "josu",
    "projectId": "gad-municipal-001",
    "name": "Josué",
    "role": "Backend Developer",
    "specialty": "NestJS, PostgreSQL, Prisma ORM, JWT, REST API",
    "color": "#6366F1",
    "sprintFocus": [
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10
    ]
  }
];
const sprints: Sprint[] = [
  {
    "id": "gad-municipal-001-s1",
    "projectId": "gad-municipal-001",
    "number": 1,
    "name": "Fundamentos y Configuración Base",
    "goal": "Establecer arquitectura base, repositorio, entornos y BD inicial.",
    "startDate": "2025-03-03",
    "endDate": "2025-03-14",
    "status": "completed",
    "plannedPoints": 39
  },
  {
    "id": "gad-municipal-001-s2",
    "projectId": "gad-municipal-001",
    "number": 2,
    "name": "Autenticación y Gestión de Usuarios",
    "goal": "Sistema completo de autenticación JWT con roles y gestión de usuarios.",
    "startDate": "2025-03-17",
    "endDate": "2025-03-28",
    "status": "active",
    "plannedPoints": 52
  },
  {
    "id": "gad-municipal-001-s3",
    "projectId": "gad-municipal-001",
    "number": 3,
    "name": "Gestión de Expedientes y Trámites",
    "goal": "Módulo core de creación de expedientes para los 3 tipos de trámite.",
    "startDate": "2025-03-31",
    "endDate": "2025-04-11",
    "status": "pending",
    "plannedPoints": 49
  },
  {
    "id": "gad-municipal-001-s4",
    "projectId": "gad-municipal-001",
    "number": 4,
    "name": "Workflow Administrativo y Estados",
    "goal": "Máquina de estados y flujos de revisión de secretaría y técnico.",
    "startDate": "2025-04-14",
    "endDate": "2025-04-25",
    "status": "pending",
    "plannedPoints": 59
  },
  {
    "id": "gad-municipal-001-s5",
    "projectId": "gad-municipal-001",
    "number": 5,
    "name": "Cálculo de Tasas y Módulo Financiero",
    "goal": "Cálculo automático de tasas municipales y módulo de cobros.",
    "startDate": "2025-04-28",
    "endDate": "2025-05-09",
    "status": "pending",
    "plannedPoints": 47
  },
  {
    "id": "gad-municipal-001-s6",
    "projectId": "gad-municipal-001",
    "number": 6,
    "name": "Gestión Documental y Almacenamiento IPFS",
    "goal": "Gestión de adjuntos por carpeta e integración con IPFS.",
    "startDate": "2025-05-12",
    "endDate": "2025-05-23",
    "status": "pending",
    "plannedPoints": 53
  },
  {
    "id": "gad-municipal-001-s7",
    "projectId": "gad-municipal-001",
    "number": 7,
    "name": "Blockchain, Auditoría y Trazabilidad",
    "goal": "Anclaje en blockchain y sistema completo de auditoría.",
    "startDate": "2025-05-26",
    "endDate": "2025-06-06",
    "status": "pending",
    "plannedPoints": 68
  },
  {
    "id": "gad-municipal-001-s8",
    "projectId": "gad-municipal-001",
    "number": 8,
    "name": "Dashboards, Reportes y Consulta Pública",
    "goal": "Dashboards por rol, reportes y landing de consulta ciudadana.",
    "startDate": "2025-06-09",
    "endDate": "2025-06-20",
    "status": "pending",
    "plannedPoints": 49
  },
  {
    "id": "gad-municipal-001-s9",
    "projectId": "gad-municipal-001",
    "number": 9,
    "name": "Términos y Condiciones, Seguridad y QA",
    "goal": "Finalizar T&C, reforzar seguridad y ejecutar pruebas integrales.",
    "startDate": "2025-06-23",
    "endDate": "2025-07-04",
    "status": "pending",
    "plannedPoints": 50
  },
  {
    "id": "gad-municipal-001-s10",
    "projectId": "gad-municipal-001",
    "number": 10,
    "name": "Cierre, Documentación Final y Entrega",
    "goal": "Consolidar documentación, corregir bugs y entrega formal al GAD.",
    "startDate": "2025-07-07",
    "endDate": "2025-07-18",
    "status": "pending",
    "plannedPoints": 45
  }
];
const epics: Epic[] = [
  {
    "id": "gad-municipal-001-e1",
    "projectId": "gad-municipal-001",
    "name": "Infraestructura",
    "color": "#10B981",
    "description": "Infraestructura base"
  },
  {
    "id": "gad-municipal-001-e2",
    "projectId": "gad-municipal-001",
    "name": "Autenticación",
    "color": "#3B82F6",
    "description": "Auth & JWT"
  },
  {
    "id": "gad-municipal-001-e3",
    "projectId": "gad-municipal-001",
    "name": "Usuarios",
    "color": "#6366F1",
    "description": "Gestión de roles"
  },
  {
    "id": "gad-municipal-001-e4",
    "projectId": "gad-municipal-001",
    "name": "Expedientes",
    "color": "#8B5CF6",
    "description": "Módulo de trámites"
  },
  {
    "id": "gad-municipal-001-e5",
    "projectId": "gad-municipal-001",
    "name": "Reglas de Negocio",
    "color": "#EC4899",
    "description": "Reglas lógicas"
  },
  {
    "id": "gad-municipal-001-e6",
    "projectId": "gad-municipal-001",
    "name": "Workflow",
    "color": "#F43F5E",
    "description": "Estados y workflow"
  },
  {
    "id": "gad-municipal-001-e7",
    "projectId": "gad-municipal-001",
    "name": "Financiero",
    "color": "#F59E0B",
    "description": "Cobros y tasas"
  },
  {
    "id": "gad-municipal-001-e8",
    "projectId": "gad-municipal-001",
    "name": "Gestión Documental",
    "color": "#14B8A6",
    "description": "Adjuntos"
  },
  {
    "id": "gad-municipal-001-e9",
    "projectId": "gad-municipal-001",
    "name": "Blockchain/IPFS",
    "color": "#06B6D4",
    "description": "IPFS & Blockchain"
  },
  {
    "id": "gad-municipal-001-e10",
    "projectId": "gad-municipal-001",
    "name": "Auditoría",
    "color": "#84CC16",
    "description": "Logs de auditoría"
  },
  {
    "id": "gad-municipal-001-e11",
    "projectId": "gad-municipal-001",
    "name": "Trazabilidad",
    "color": "#EAB308",
    "description": "Hash chains"
  },
  {
    "id": "gad-municipal-001-e12",
    "projectId": "gad-municipal-001",
    "name": "Dashboard",
    "color": "#F97316",
    "description": "Paneles de usuario"
  },
  {
    "id": "gad-municipal-001-e13",
    "projectId": "gad-municipal-001",
    "name": "Consulta Pública",
    "color": "#64748B",
    "description": "Landing ciudadana"
  },
  {
    "id": "gad-municipal-001-e14",
    "projectId": "gad-municipal-001",
    "name": "Reportes",
    "color": "#737373",
    "description": "Exportables"
  },
  {
    "id": "gad-municipal-001-e15",
    "projectId": "gad-municipal-001",
    "name": "T&C",
    "color": "#A8A29E",
    "description": "Legal"
  },
  {
    "id": "gad-municipal-001-e16",
    "projectId": "gad-municipal-001",
    "name": "Seguridad",
    "color": "#DC2626",
    "description": "HTTPS y hardening"
  },
  {
    "id": "gad-municipal-001-e17",
    "projectId": "gad-municipal-001",
    "name": "QA",
    "color": "#059669",
    "description": "Testing integral"
  },
  {
    "id": "gad-municipal-001-e18",
    "projectId": "gad-municipal-001",
    "name": "Documentación",
    "color": "#4F46E5",
    "description": "Manuales y SRS"
  },
  {
    "id": "gad-municipal-001-e19",
    "projectId": "gad-municipal-001",
    "name": "Config. Producción",
    "color": "#9333EA",
    "description": "Despliegue final"
  },
  {
    "id": "gad-municipal-001-e20",
    "projectId": "gad-municipal-001",
    "name": "Entrega",
    "color": "#C026D3",
    "description": "Cierre del proyecto"
  }
];
const stories: UserStory[] = [
  {
    "id": "US-01",
    "projectId": "gad-municipal-001",
    "sprintId": "gad-municipal-001-s1",
    "epicId": "gad-municipal-001-e1",
    "title": "Configuración repositorio GitHub con GitFlow",
    "description": "Configuración repositorio GitHub con GitFlow",
    "assignees": [
      "juan"
    ],
    "priority": "high",
    "storyPoints": 8,
    "status": "done",
    "acceptanceCriteria": [
      "Criterio de aceptación 1",
      "Criterio de aceptación 2"
    ],
    "createdAt": "2025-03-01"
  },
  {
    "id": "US-02",
    "projectId": "gad-municipal-001",
    "sprintId": "gad-municipal-001-s1",
    "epicId": "gad-municipal-001-e1",
    "title": "Setup backend NestJS + Prisma ORM",
    "description": "Setup backend NestJS + Prisma ORM",
    "assignees": [
      "josu"
    ],
    "priority": "high",
    "storyPoints": 8,
    "status": "done",
    "acceptanceCriteria": [
      "Criterio de aceptación 1",
      "Criterio de aceptación 2"
    ],
    "createdAt": "2025-03-01"
  },
  {
    "id": "US-03",
    "projectId": "gad-municipal-001",
    "sprintId": "gad-municipal-001-s1",
    "epicId": "gad-municipal-001-e1",
    "title": "Setup frontend React + Vite + Tailwind",
    "description": "Setup frontend React + Vite + Tailwind",
    "assignees": [
      "gabriel"
    ],
    "priority": "high",
    "storyPoints": 5,
    "status": "done",
    "acceptanceCriteria": [
      "Criterio de aceptación 1",
      "Criterio de aceptación 2"
    ],
    "createdAt": "2025-03-01"
  },
  {
    "id": "US-04",
    "projectId": "gad-municipal-001",
    "sprintId": "gad-municipal-001-s1",
    "epicId": "gad-municipal-001-e1",
    "title": "Esquema inicial PostgreSQL y migraciones",
    "description": "Esquema inicial PostgreSQL y migraciones",
    "assignees": [
      "josu"
    ],
    "priority": "high",
    "storyPoints": 8,
    "status": "done",
    "acceptanceCriteria": [
      "Criterio de aceptación 1",
      "Criterio de aceptación 2"
    ],
    "createdAt": "2025-03-01"
  },
  {
    "id": "US-05",
    "projectId": "gad-municipal-001",
    "sprintId": "gad-municipal-001-s1",
    "epicId": "gad-municipal-001-e15",
    "title": "Borrador Términos y Condiciones v1",
    "description": "Borrador Términos y Condiciones v1",
    "assignees": [
      "telmo"
    ],
    "priority": "high",
    "storyPoints": 5,
    "status": "done",
    "acceptanceCriteria": [
      "Criterio de aceptación 1",
      "Criterio de aceptación 2"
    ],
    "createdAt": "2025-03-01"
  },
  {
    "id": "US-06",
    "projectId": "gad-municipal-001",
    "sprintId": "gad-municipal-001-s1",
    "epicId": "gad-municipal-001-e18",
    "title": "SRS inicial IEEE 830",
    "description": "SRS inicial IEEE 830",
    "assignees": [
      "telmo"
    ],
    "priority": "high",
    "storyPoints": 5,
    "status": "done",
    "acceptanceCriteria": [
      "Criterio de aceptación 1",
      "Criterio de aceptación 2"
    ],
    "createdAt": "2025-03-01"
  },
  {
    "id": "US-07",
    "projectId": "gad-municipal-001",
    "sprintId": "gad-municipal-001-s2",
    "epicId": "gad-municipal-001-e2",
    "title": "Registro de usuario con email y contraseña",
    "description": "Registro de usuario con email y contraseña",
    "assignees": [
      "josu"
    ],
    "priority": "high",
    "storyPoints": 8,
    "status": "in-progress",
    "acceptanceCriteria": [
      "Criterio de aceptación 1",
      "Criterio de aceptación 2"
    ],
    "createdAt": "2025-03-01"
  },
  {
    "id": "US-08",
    "projectId": "gad-municipal-001",
    "sprintId": "gad-municipal-001-s2",
    "epicId": "gad-municipal-001-e2",
    "title": "Login con JWT access + refresh token",
    "description": "Login con JWT access + refresh token",
    "assignees": [
      "josu"
    ],
    "priority": "high",
    "storyPoints": 8,
    "status": "in-progress",
    "acceptanceCriteria": [
      "Criterio de aceptación 1",
      "Criterio de aceptación 2"
    ],
    "createdAt": "2025-03-01"
  },
  {
    "id": "US-09",
    "projectId": "gad-municipal-001",
    "sprintId": "gad-municipal-001-s2",
    "epicId": "gad-municipal-001-e2",
    "title": "Renovación automática de token en error 401",
    "description": "Renovación automática de token en error 401",
    "assignees": [
      "josu"
    ],
    "priority": "high",
    "storyPoints": 5,
    "status": "in-progress",
    "acceptanceCriteria": [
      "Criterio de aceptación 1",
      "Criterio de aceptación 2"
    ],
    "createdAt": "2025-03-01"
  },
  {
    "id": "US-10",
    "projectId": "gad-municipal-001",
    "sprintId": "gad-municipal-001-s2",
    "epicId": "gad-municipal-001-e3",
    "title": "Registro de arquitecto con N° SENESCYT",
    "description": "Registro de arquitecto con N° SENESCYT",
    "assignees": [
      "josu",
      "gabriel"
    ],
    "priority": "high",
    "storyPoints": 5,
    "status": "in-progress",
    "acceptanceCriteria": [
      "Criterio de aceptación 1",
      "Criterio de aceptación 2"
    ],
    "createdAt": "2025-03-01"
  },
  {
    "id": "US-11",
    "projectId": "gad-municipal-001",
    "sprintId": "gad-municipal-001-s2",
    "epicId": "gad-municipal-001-e3",
    "title": "Habilitación/deshabilitación de arquitectos SUPERADMIN",
    "description": "Habilitación/deshabilitación de arquitectos SUPERADMIN",
    "assignees": [
      "josu",
      "gabriel"
    ],
    "priority": "high",
    "storyPoints": 8,
    "status": "in-progress",
    "acceptanceCriteria": [
      "Criterio de aceptación 1",
      "Criterio de aceptación 2"
    ],
    "createdAt": "2025-03-01"
  },
  {
    "id": "US-12",
    "projectId": "gad-municipal-001",
    "sprintId": "gad-municipal-001-s2",
    "epicId": "gad-municipal-001-e3",
    "title": "Guards de roles para 6 perfiles",
    "description": "Guards de roles para 6 perfiles",
    "assignees": [
      "josu"
    ],
    "priority": "high",
    "storyPoints": 8,
    "status": "in-progress",
    "acceptanceCriteria": [
      "Criterio de aceptación 1",
      "Criterio de aceptación 2"
    ],
    "createdAt": "2025-03-01"
  },
  {
    "id": "US-13",
    "projectId": "gad-municipal-001",
    "sprintId": "gad-municipal-001-s2",
    "epicId": "gad-municipal-001-e2",
    "title": "Formulario de login en frontend",
    "description": "Formulario de login en frontend",
    "assignees": [
      "gabriel"
    ],
    "priority": "high",
    "storyPoints": 5,
    "status": "in-progress",
    "acceptanceCriteria": [
      "Criterio de aceptación 1",
      "Criterio de aceptación 2"
    ],
    "createdAt": "2025-03-01"
  },
  {
    "id": "US-14",
    "projectId": "gad-municipal-001",
    "sprintId": "gad-municipal-001-s2",
    "epicId": "gad-municipal-001-e3",
    "title": "Panel de gestión de usuarios institucionales",
    "description": "Panel de gestión de usuarios institucionales",
    "assignees": [
      "gabriel",
      "josu"
    ],
    "priority": "high",
    "storyPoints": 5,
    "status": "in-progress",
    "acceptanceCriteria": [
      "Criterio de aceptación 1",
      "Criterio de aceptación 2"
    ],
    "createdAt": "2025-03-01"
  },
  {
    "id": "US-15",
    "projectId": "gad-municipal-001",
    "sprintId": "gad-municipal-001-s3",
    "epicId": "gad-municipal-001-e4",
    "title": "Crear expediente Línea de Fábrica",
    "description": "Crear expediente Línea de Fábrica",
    "assignees": [
      "josu"
    ],
    "priority": "high",
    "storyPoints": 8,
    "status": "todo",
    "acceptanceCriteria": [
      "Criterio de aceptación 1",
      "Criterio de aceptación 2"
    ],
    "createdAt": "2025-03-01"
  },
  {
    "id": "US-16",
    "projectId": "gad-municipal-001",
    "sprintId": "gad-municipal-001-s3",
    "epicId": "gad-municipal-001-e4",
    "title": "Crear expediente Aprobación de Planos con prerequisito",
    "description": "Crear expediente Aprobación de Planos con prerequisito",
    "assignees": [
      "josu"
    ],
    "priority": "high",
    "storyPoints": 8,
    "status": "todo",
    "acceptanceCriteria": [
      "Criterio de aceptación 1",
      "Criterio de aceptación 2"
    ],
    "createdAt": "2025-03-01"
  },
  {
    "id": "US-17",
    "projectId": "gad-municipal-001",
    "sprintId": "gad-municipal-001-s3",
    "epicId": "gad-municipal-001-e4",
    "title": "Crear expediente Permiso de Construcción",
    "description": "Crear expediente Permiso de Construcción",
    "assignees": [
      "josu"
    ],
    "priority": "high",
    "storyPoints": 5,
    "status": "todo",
    "acceptanceCriteria": [
      "Criterio de aceptación 1",
      "Criterio de aceptación 2"
    ],
    "createdAt": "2025-03-01"
  },
  {
    "id": "US-18",
    "projectId": "gad-municipal-001",
    "sprintId": "gad-municipal-001-s3",
    "epicId": "gad-municipal-001-e5",
    "title": "Bloqueo de arquitecto no habilitado — ForbiddenException",
    "description": "Bloqueo de arquitecto no habilitado — ForbiddenException",
    "assignees": [
      "josu"
    ],
    "priority": "high",
    "storyPoints": 5,
    "status": "todo",
    "acceptanceCriteria": [
      "Criterio de aceptación 1",
      "Criterio de aceptación 2"
    ],
    "createdAt": "2025-03-01"
  },
  {
    "id": "US-19",
    "projectId": "gad-municipal-001",
    "sprintId": "gad-municipal-001-s3",
    "epicId": "gad-municipal-001-e4",
    "title": "Lista de trámites del arquitecto con filtros",
    "description": "Lista de trámites del arquitecto con filtros",
    "assignees": [
      "gabriel"
    ],
    "priority": "high",
    "storyPoints": 5,
    "status": "todo",
    "acceptanceCriteria": [
      "Criterio de aceptación 1",
      "Criterio de aceptación 2"
    ],
    "createdAt": "2025-03-01"
  },
  {
    "id": "US-20",
    "projectId": "gad-municipal-001",
    "sprintId": "gad-municipal-001-s3",
    "epicId": "gad-municipal-001-e4",
    "title": "Vista de expedientes del ciudadano",
    "description": "Vista de expedientes del ciudadano",
    "assignees": [
      "gabriel"
    ],
    "priority": "high",
    "storyPoints": 5,
    "status": "todo",
    "acceptanceCriteria": [
      "Criterio de aceptación 1",
      "Criterio de aceptación 2"
    ],
    "createdAt": "2025-03-01"
  },
  {
    "id": "US-21",
    "projectId": "gad-municipal-001",
    "sprintId": "gad-municipal-001-s3",
    "epicId": "gad-municipal-001-e4",
    "title": "Bandeja de secretaría con expedientes pendientes",
    "description": "Bandeja de secretaría con expedientes pendientes",
    "assignees": [
      "gabriel"
    ],
    "priority": "high",
    "storyPoints": 8,
    "status": "todo",
    "acceptanceCriteria": [
      "Criterio de aceptación 1",
      "Criterio de aceptación 2"
    ],
    "createdAt": "2025-03-01"
  },
  {
    "id": "US-22",
    "projectId": "gad-municipal-001",
    "sprintId": "gad-municipal-001-s3",
    "epicId": "gad-municipal-001-e18",
    "title": "Documentación flujos administrativos completos",
    "description": "Documentación flujos administrativos completos",
    "assignees": [
      "telmo"
    ],
    "priority": "high",
    "storyPoints": 5,
    "status": "todo",
    "acceptanceCriteria": [
      "Criterio de aceptación 1",
      "Criterio de aceptación 2"
    ],
    "createdAt": "2025-03-01"
  },
  {
    "id": "US-23",
    "projectId": "gad-municipal-001",
    "sprintId": "gad-municipal-001-s4",
    "epicId": "gad-municipal-001-e6",
    "title": "Dictamen de secretaría — validar firma y aprobar/observar",
    "description": "Dictamen de secretaría — validar firma y aprobar/observar",
    "assignees": [
      "josu"
    ],
    "priority": "high",
    "storyPoints": 8,
    "status": "todo",
    "acceptanceCriteria": [
      "Criterio de aceptación 1",
      "Criterio de aceptación 2"
    ],
    "createdAt": "2025-03-01"
  },
  {
    "id": "US-24",
    "projectId": "gad-municipal-001",
    "sprintId": "gad-municipal-001-s4",
    "epicId": "gad-municipal-001-e5",
    "title": "Bloqueo de aprobación sin firma validada — error 422",
    "description": "Bloqueo de aprobación sin firma validada — error 422",
    "assignees": [
      "josu"
    ],
    "priority": "high",
    "storyPoints": 5,
    "status": "todo",
    "acceptanceCriteria": [
      "Criterio de aceptación 1",
      "Criterio de aceptación 2"
    ],
    "createdAt": "2025-03-01"
  },
  {
    "id": "US-25",
    "projectId": "gad-municipal-001",
    "sprintId": "gad-municipal-001-s4",
    "epicId": "gad-municipal-001-e6",
    "title": "Programar inspección técnica",
    "description": "Programar inspección técnica",
    "assignees": [
      "josu"
    ],
    "priority": "high",
    "storyPoints": 5,
    "status": "todo",
    "acceptanceCriteria": [
      "Criterio de aceptación 1",
      "Criterio de aceptación 2"
    ],
    "createdAt": "2025-03-01"
  },
  {
    "id": "US-26",
    "projectId": "gad-municipal-001",
    "sprintId": "gad-municipal-001-s4",
    "epicId": "gad-municipal-001-e6",
    "title": "Subir informe fotográfico multipart/form-data",
    "description": "Subir informe fotográfico multipart/form-data",
    "assignees": [
      "josu"
    ],
    "priority": "high",
    "storyPoints": 8,
    "status": "todo",
    "acceptanceCriteria": [
      "Criterio de aceptación 1",
      "Criterio de aceptación 2"
    ],
    "createdAt": "2025-03-01"
  },
  {
    "id": "US-27",
    "projectId": "gad-municipal-001",
    "sprintId": "gad-municipal-001-s4",
    "epicId": "gad-municipal-001-e6",
    "title": "Emitir resolución con monto calculado automáticamente",
    "description": "Emitir resolución con monto calculado automáticamente",
    "assignees": [
      "josu"
    ],
    "priority": "high",
    "storyPoints": 8,
    "status": "todo",
    "acceptanceCriteria": [
      "Criterio de aceptación 1",
      "Criterio de aceptación 2"
    ],
    "createdAt": "2025-03-01"
  },
  {
    "id": "US-28",
    "projectId": "gad-municipal-001",
    "sprintId": "gad-municipal-001-s4",
    "epicId": "gad-municipal-001-e6",
    "title": "Timeline de estados del expediente en frontend",
    "description": "Timeline de estados del expediente en frontend",
    "assignees": [
      "gabriel"
    ],
    "priority": "high",
    "storyPoints": 8,
    "status": "todo",
    "acceptanceCriteria": [
      "Criterio de aceptación 1",
      "Criterio de aceptación 2"
    ],
    "createdAt": "2025-03-01"
  },
  {
    "id": "US-29",
    "projectId": "gad-municipal-001",
    "sprintId": "gad-municipal-001-s4",
    "epicId": "gad-municipal-001-e6",
    "title": "Panel de dictamen completo para secretaría",
    "description": "Panel de dictamen completo para secretaría",
    "assignees": [
      "gabriel"
    ],
    "priority": "high",
    "storyPoints": 8,
    "status": "todo",
    "acceptanceCriteria": [
      "Criterio de aceptación 1",
      "Criterio de aceptación 2"
    ],
    "createdAt": "2025-03-01"
  },
  {
    "id": "US-30",
    "projectId": "gad-municipal-001",
    "sprintId": "gad-municipal-001-s4",
    "epicId": "gad-municipal-001-e18",
    "title": "Documentar reglas de negocio del workflow",
    "description": "Documentar reglas de negocio del workflow",
    "assignees": [
      "telmo",
      "carlos"
    ],
    "priority": "high",
    "storyPoints": 5,
    "status": "todo",
    "acceptanceCriteria": [
      "Criterio de aceptación 1",
      "Criterio de aceptación 2"
    ],
    "createdAt": "2025-03-01"
  },
  {
    "id": "US-31",
    "projectId": "gad-municipal-001",
    "sprintId": "gad-municipal-001-s5",
    "epicId": "gad-municipal-001-e7",
    "title": "Cálculo automático base_fee + (area_m2 × rate_per_m2)",
    "description": "Cálculo automático base_fee + (area_m2 × rate_per_m2)",
    "assignees": [
      "josu"
    ],
    "priority": "high",
    "storyPoints": 8,
    "status": "todo",
    "acceptanceCriteria": [
      "Criterio de aceptación 1",
      "Criterio de aceptación 2"
    ],
    "createdAt": "2025-03-01"
  },
  {
    "id": "US-32",
    "projectId": "gad-municipal-001",
    "sprintId": "gad-municipal-001-s5",
    "epicId": "gad-municipal-001-e7",
    "title": "Gestión de fee_rules por SUPERADMIN",
    "description": "Gestión de fee_rules por SUPERADMIN",
    "assignees": [
      "josu",
      "gabriel"
    ],
    "priority": "high",
    "storyPoints": 5,
    "status": "todo",
    "acceptanceCriteria": [
      "Criterio de aceptación 1",
      "Criterio de aceptación 2"
    ],
    "createdAt": "2025-03-01"
  },
  {
    "id": "US-33",
    "projectId": "gad-municipal-001",
    "sprintId": "gad-municipal-001-s5",
    "epicId": "gad-municipal-001-e7",
    "title": "Desglose del monto en la resolución frontend",
    "description": "Desglose del monto en la resolución frontend",
    "assignees": [
      "gabriel"
    ],
    "priority": "high",
    "storyPoints": 5,
    "status": "todo",
    "acceptanceCriteria": [
      "Criterio de aceptación 1",
      "Criterio de aceptación 2"
    ],
    "createdAt": "2025-03-01"
  },
  {
    "id": "US-34",
    "projectId": "gad-municipal-001",
    "sprintId": "gad-municipal-001-s5",
    "epicId": "gad-municipal-001-e7",
    "title": "Registro de pago presencial por financiero",
    "description": "Registro de pago presencial por financiero",
    "assignees": [
      "josu"
    ],
    "priority": "high",
    "storyPoints": 8,
    "status": "todo",
    "acceptanceCriteria": [
      "Criterio de aceptación 1",
      "Criterio de aceptación 2"
    ],
    "createdAt": "2025-03-01"
  },
  {
    "id": "US-35",
    "projectId": "gad-municipal-001",
    "sprintId": "gad-municipal-001-s5",
    "epicId": "gad-municipal-001-e7",
    "title": "Cola de expedientes en PENDING_PAYMENT",
    "description": "Cola de expedientes en PENDING_PAYMENT",
    "assignees": [
      "gabriel"
    ],
    "priority": "high",
    "storyPoints": 5,
    "status": "todo",
    "acceptanceCriteria": [
      "Criterio de aceptación 1",
      "Criterio de aceptación 2"
    ],
    "createdAt": "2025-03-01"
  },
  {
    "id": "US-36",
    "projectId": "gad-municipal-001",
    "sprintId": "gad-municipal-001-s5",
    "epicId": "gad-municipal-001-e6",
    "title": "Transición automática PAID → APPROVED",
    "description": "Transición automática PAID → APPROVED",
    "assignees": [
      "josu"
    ],
    "priority": "high",
    "storyPoints": 8,
    "status": "todo",
    "acceptanceCriteria": [
      "Criterio de aceptación 1",
      "Criterio de aceptación 2"
    ],
    "createdAt": "2025-03-01"
  },
  {
    "id": "US-37",
    "projectId": "gad-municipal-001",
    "sprintId": "gad-municipal-001-s5",
    "epicId": "gad-municipal-001-e6",
    "title": "Actualización manual de estado por SUPERADMIN",
    "description": "Actualización manual de estado por SUPERADMIN",
    "assignees": [
      "josu"
    ],
    "priority": "high",
    "storyPoints": 5,
    "status": "todo",
    "acceptanceCriteria": [
      "Criterio de aceptación 1",
      "Criterio de aceptación 2"
    ],
    "createdAt": "2025-03-01"
  },
  {
    "id": "US-38",
    "projectId": "gad-municipal-001",
    "sprintId": "gad-municipal-001-s5",
    "epicId": "gad-municipal-001-e18",
    "title": "Documentar lógica de cálculo de tasas",
    "description": "Documentar lógica de cálculo de tasas",
    "assignees": [
      "telmo"
    ],
    "priority": "high",
    "storyPoints": 3,
    "status": "todo",
    "acceptanceCriteria": [
      "Criterio de aceptación 1",
      "Criterio de aceptación 2"
    ],
    "createdAt": "2025-03-01"
  },
  {
    "id": "US-39",
    "projectId": "gad-municipal-001",
    "sprintId": "gad-municipal-001-s6",
    "epicId": "gad-municipal-001-e8",
    "title": "Subida de adjuntos por carpetas del expediente",
    "description": "Subida de adjuntos por carpetas del expediente",
    "assignees": [
      "josu"
    ],
    "priority": "high",
    "storyPoints": 8,
    "status": "todo",
    "acceptanceCriteria": [
      "Criterio de aceptación 1",
      "Criterio de aceptación 2"
    ],
    "createdAt": "2025-03-01"
  },
  {
    "id": "US-40",
    "projectId": "gad-municipal-001",
    "sprintId": "gad-municipal-001-s6",
    "epicId": "gad-municipal-001-e8",
    "title": "Listado y filtro de adjuntos por carpeta",
    "description": "Listado y filtro de adjuntos por carpeta",
    "assignees": [
      "josu"
    ],
    "priority": "high",
    "storyPoints": 5,
    "status": "todo",
    "acceptanceCriteria": [
      "Criterio de aceptación 1",
      "Criterio de aceptación 2"
    ],
    "createdAt": "2025-03-01"
  },
  {
    "id": "US-41",
    "projectId": "gad-municipal-001",
    "sprintId": "gad-municipal-001-s6",
    "epicId": "gad-municipal-001-e8",
    "title": "Eliminar documento del expediente",
    "description": "Eliminar documento del expediente",
    "assignees": [
      "josu"
    ],
    "priority": "high",
    "storyPoints": 3,
    "status": "todo",
    "acceptanceCriteria": [
      "Criterio de aceptación 1",
      "Criterio de aceptación 2"
    ],
    "createdAt": "2025-03-01"
  },
  {
    "id": "US-42",
    "projectId": "gad-municipal-001",
    "sprintId": "gad-municipal-001-s6",
    "epicId": "gad-municipal-001-e9",
    "title": "Integración IPFS — subida de archivos y almacenamiento de CID",
    "description": "Integración IPFS — subida de archivos y almacenamiento de CID",
    "assignees": [
      "alexis"
    ],
    "priority": "high",
    "storyPoints": 13,
    "status": "todo",
    "acceptanceCriteria": [
      "Criterio de aceptación 1",
      "Criterio de aceptación 2"
    ],
    "createdAt": "2025-03-01"
  },
  {
    "id": "US-43",
    "projectId": "gad-municipal-001",
    "sprintId": "gad-municipal-001-s6",
    "epicId": "gad-municipal-001-e9",
    "title": "Hash SHA-256 de archivos antes de subir a IPFS",
    "description": "Hash SHA-256 de archivos antes de subir a IPFS",
    "assignees": [
      "alexis"
    ],
    "priority": "high",
    "storyPoints": 8,
    "status": "todo",
    "acceptanceCriteria": [
      "Criterio de aceptación 1",
      "Criterio de aceptación 2"
    ],
    "createdAt": "2025-03-01"
  },
  {
    "id": "US-44",
    "projectId": "gad-municipal-001",
    "sprintId": "gad-municipal-001-s6",
    "epicId": "gad-municipal-001-e11",
    "title": "Verificación de integridad comparando hash almacenado",
    "description": "Verificación de integridad comparando hash almacenado",
    "assignees": [
      "alexis"
    ],
    "priority": "high",
    "storyPoints": 8,
    "status": "todo",
    "acceptanceCriteria": [
      "Criterio de aceptación 1",
      "Criterio de aceptación 2"
    ],
    "createdAt": "2025-03-01"
  },
  {
    "id": "US-45",
    "projectId": "gad-municipal-001",
    "sprintId": "gad-municipal-001-s6",
    "epicId": "gad-municipal-001-e9",
    "title": "Vista del CID de IPFS en panel de auditoría",
    "description": "Vista del CID de IPFS en panel de auditoría",
    "assignees": [
      "alexis",
      "gabriel"
    ],
    "priority": "high",
    "storyPoints": 5,
    "status": "todo",
    "acceptanceCriteria": [
      "Criterio de aceptación 1",
      "Criterio de aceptación 2"
    ],
    "createdAt": "2025-03-01"
  },
  {
    "id": "US-46",
    "projectId": "gad-municipal-001",
    "sprintId": "gad-municipal-001-s6",
    "epicId": "gad-municipal-001-e18",
    "title": "Documentar integración IPFS",
    "description": "Documentar integración IPFS",
    "assignees": [
      "telmo"
    ],
    "priority": "high",
    "storyPoints": 3,
    "status": "todo",
    "acceptanceCriteria": [
      "Criterio de aceptación 1",
      "Criterio de aceptación 2"
    ],
    "createdAt": "2025-03-01"
  },
  {
    "id": "US-47",
    "projectId": "gad-municipal-001",
    "sprintId": "gad-municipal-001-s7",
    "epicId": "gad-municipal-001-e9",
    "title": "Anclaje de hash de resolución en blockchain",
    "description": "Anclaje de hash de resolución en blockchain",
    "assignees": [
      "alexis"
    ],
    "priority": "high",
    "storyPoints": 13,
    "status": "todo",
    "acceptanceCriteria": [
      "Criterio de aceptación 1",
      "Criterio de aceptación 2"
    ],
    "createdAt": "2025-03-01"
  },
  {
    "id": "US-48",
    "projectId": "gad-municipal-001",
    "sprintId": "gad-municipal-001-s7",
    "epicId": "gad-municipal-001-e11",
    "title": "Hash Chain vinculando entradas de auditoría",
    "description": "Hash Chain vinculando entradas de auditoría",
    "assignees": [
      "alexis"
    ],
    "priority": "high",
    "storyPoints": 13,
    "status": "todo",
    "acceptanceCriteria": [
      "Criterio de aceptación 1",
      "Criterio de aceptación 2"
    ],
    "createdAt": "2025-03-01"
  },
  {
    "id": "US-49",
    "projectId": "gad-municipal-001",
    "sprintId": "gad-municipal-001-s7",
    "epicId": "gad-municipal-001-e10",
    "title": "AuditService.logAction() en todas las acciones críticas",
    "description": "AuditService.logAction() en todas las acciones críticas",
    "assignees": [
      "alexis",
      "josu"
    ],
    "priority": "high",
    "storyPoints": 8,
    "status": "todo",
    "acceptanceCriteria": [
      "Criterio de aceptación 1",
      "Criterio de aceptación 2"
    ],
    "createdAt": "2025-03-01"
  },
  {
    "id": "US-50",
    "projectId": "gad-municipal-001",
    "sprintId": "gad-municipal-001-s7",
    "epicId": "gad-municipal-001-e10",
    "title": "Verificación semanal de integridad del log SUPERADMIN",
    "description": "Verificación semanal de integridad del log SUPERADMIN",
    "assignees": [
      "alexis",
      "gabriel"
    ],
    "priority": "high",
    "storyPoints": 8,
    "status": "todo",
    "acceptanceCriteria": [
      "Criterio de aceptación 1",
      "Criterio de aceptación 2"
    ],
    "createdAt": "2025-03-01"
  },
  {
    "id": "US-51",
    "projectId": "gad-municipal-001",
    "sprintId": "gad-municipal-001-s7",
    "epicId": "gad-municipal-001-e10",
    "title": "Detección automática de alteraciones en documentos",
    "description": "Detección automática de alteraciones en documentos",
    "assignees": [
      "alexis"
    ],
    "priority": "high",
    "storyPoints": 8,
    "status": "todo",
    "acceptanceCriteria": [
      "Criterio de aceptación 1",
      "Criterio de aceptación 2"
    ],
    "createdAt": "2025-03-01"
  },
  {
    "id": "US-52",
    "projectId": "gad-municipal-001",
    "sprintId": "gad-municipal-001-s7",
    "epicId": "gad-municipal-001-e10",
    "title": "Historial completo del expediente con responsables",
    "description": "Historial completo del expediente con responsables",
    "assignees": [
      "gabriel"
    ],
    "priority": "high",
    "storyPoints": 5,
    "status": "todo",
    "acceptanceCriteria": [
      "Criterio de aceptación 1",
      "Criterio de aceptación 2"
    ],
    "createdAt": "2025-03-01"
  },
  {
    "id": "US-53",
    "projectId": "gad-municipal-001",
    "sprintId": "gad-municipal-001-s7",
    "epicId": "gad-municipal-001-e18",
    "title": "Documentar arquitectura blockchain y auditoría",
    "description": "Documentar arquitectura blockchain y auditoría",
    "assignees": [
      "telmo"
    ],
    "priority": "high",
    "storyPoints": 5,
    "status": "todo",
    "acceptanceCriteria": [
      "Criterio de aceptación 1",
      "Criterio de aceptación 2"
    ],
    "createdAt": "2025-03-01"
  },
  {
    "id": "US-54",
    "projectId": "gad-municipal-001",
    "sprintId": "gad-municipal-001-s8",
    "epicId": "gad-municipal-001-e12",
    "title": "Dashboard del arquitecto con estadísticas",
    "description": "Dashboard del arquitecto con estadísticas",
    "assignees": [
      "gabriel"
    ],
    "priority": "high",
    "storyPoints": 5,
    "status": "todo",
    "acceptanceCriteria": [
      "Criterio de aceptación 1",
      "Criterio de aceptación 2"
    ],
    "createdAt": "2025-03-01"
  },
  {
    "id": "US-55",
    "projectId": "gad-municipal-001",
    "sprintId": "gad-municipal-001-s8",
    "epicId": "gad-municipal-001-e12",
    "title": "Dashboard de secretaría con cola y métricas",
    "description": "Dashboard de secretaría con cola y métricas",
    "assignees": [
      "gabriel"
    ],
    "priority": "high",
    "storyPoints": 5,
    "status": "todo",
    "acceptanceCriteria": [
      "Criterio de aceptación 1",
      "Criterio de aceptación 2"
    ],
    "createdAt": "2025-03-01"
  },
  {
    "id": "US-56",
    "projectId": "gad-municipal-001",
    "sprintId": "gad-municipal-001-s8",
    "epicId": "gad-municipal-001-e12",
    "title": "Dashboard SUPERADMIN con KPIs globales",
    "description": "Dashboard SUPERADMIN con KPIs globales",
    "assignees": [
      "gabriel"
    ],
    "priority": "high",
    "storyPoints": 8,
    "status": "todo",
    "acceptanceCriteria": [
      "Criterio de aceptación 1",
      "Criterio de aceptación 2"
    ],
    "createdAt": "2025-03-01"
  },
  {
    "id": "US-57",
    "projectId": "gad-municipal-001",
    "sprintId": "gad-municipal-001-s8",
    "epicId": "gad-municipal-001-e13",
    "title": "Consulta pública por cédula o código de expediente",
    "description": "Consulta pública por cédula o código de expediente",
    "assignees": [
      "gabriel"
    ],
    "priority": "high",
    "storyPoints": 8,
    "status": "todo",
    "acceptanceCriteria": [
      "Criterio de aceptación 1",
      "Criterio de aceptación 2"
    ],
    "createdAt": "2025-03-01"
  },
  {
    "id": "US-58",
    "projectId": "gad-municipal-001",
    "sprintId": "gad-municipal-001-s8",
    "epicId": "gad-municipal-001-e14",
    "title": "Reportes de expedientes por estado, tipo y período",
    "description": "Reportes de expedientes por estado, tipo y período",
    "assignees": [
      "gabriel",
      "josu"
    ],
    "priority": "high",
    "storyPoints": 8,
    "status": "todo",
    "acceptanceCriteria": [
      "Criterio de aceptación 1",
      "Criterio de aceptación 2"
    ],
    "createdAt": "2025-03-01"
  },
  {
    "id": "US-59",
    "projectId": "gad-municipal-001",
    "sprintId": "gad-municipal-001-s8",
    "epicId": "gad-municipal-001-e14",
    "title": "Reporte de cobros por período — financiero",
    "description": "Reporte de cobros por período — financiero",
    "assignees": [
      "gabriel",
      "josu"
    ],
    "priority": "high",
    "storyPoints": 5,
    "status": "todo",
    "acceptanceCriteria": [
      "Criterio de aceptación 1",
      "Criterio de aceptación 2"
    ],
    "createdAt": "2025-03-01"
  },
  {
    "id": "US-60",
    "projectId": "gad-municipal-001",
    "sprintId": "gad-municipal-001-s8",
    "epicId": "gad-municipal-001-e14",
    "title": "Agenda de inspecciones con calendario — técnico",
    "description": "Agenda de inspecciones con calendario — técnico",
    "assignees": [
      "gabriel"
    ],
    "priority": "high",
    "storyPoints": 5,
    "status": "todo",
    "acceptanceCriteria": [
      "Criterio de aceptación 1",
      "Criterio de aceptación 2"
    ],
    "createdAt": "2025-03-01"
  },
  {
    "id": "US-61",
    "projectId": "gad-municipal-001",
    "sprintId": "gad-municipal-001-s8",
    "epicId": "gad-municipal-001-e18",
    "title": "Manual de usuario por rol",
    "description": "Manual de usuario por rol",
    "assignees": [
      "telmo"
    ],
    "priority": "high",
    "storyPoints": 8,
    "status": "todo",
    "acceptanceCriteria": [
      "Criterio de aceptación 1",
      "Criterio de aceptación 2"
    ],
    "createdAt": "2025-03-01"
  },
  {
    "id": "US-62",
    "projectId": "gad-municipal-001",
    "sprintId": "gad-municipal-001-s9",
    "epicId": "gad-municipal-001-e15",
    "title": "T&C requeridos en el registro del ciudadano",
    "description": "T&C requeridos en el registro del ciudadano",
    "assignees": [
      "gabriel",
      "josu"
    ],
    "priority": "high",
    "storyPoints": 5,
    "status": "todo",
    "acceptanceCriteria": [
      "Criterio de aceptación 1",
      "Criterio de aceptación 2"
    ],
    "createdAt": "2025-03-01"
  },
  {
    "id": "US-63",
    "projectId": "gad-municipal-001",
    "sprintId": "gad-municipal-001-s9",
    "epicId": "gad-municipal-001-e15",
    "title": "T&C finales para ciudadanos — Telmo redacta, Carlos revisa",
    "description": "T&C finales para ciudadanos — Telmo redacta, Carlos revisa",
    "assignees": [
      "telmo",
      "carlos"
    ],
    "priority": "high",
    "storyPoints": 8,
    "status": "todo",
    "acceptanceCriteria": [
      "Criterio de aceptación 1",
      "Criterio de aceptación 2"
    ],
    "createdAt": "2025-03-01"
  },
  {
    "id": "US-64",
    "projectId": "gad-municipal-001",
    "sprintId": "gad-municipal-001-s9",
    "epicId": "gad-municipal-001-e15",
    "title": "T&C finales para arquitectos habilitados",
    "description": "T&C finales para arquitectos habilitados",
    "assignees": [
      "telmo",
      "carlos"
    ],
    "priority": "high",
    "storyPoints": 5,
    "status": "todo",
    "acceptanceCriteria": [
      "Criterio de aceptación 1",
      "Criterio de aceptación 2"
    ],
    "createdAt": "2025-03-01"
  },
  {
    "id": "US-65",
    "projectId": "gad-municipal-001",
    "sprintId": "gad-municipal-001-s9",
    "epicId": "gad-municipal-001-e15",
    "title": "T&C finales para funcionarios municipales",
    "description": "T&C finales para funcionarios municipales",
    "assignees": [
      "telmo",
      "carlos"
    ],
    "priority": "high",
    "storyPoints": 5,
    "status": "todo",
    "acceptanceCriteria": [
      "Criterio de aceptación 1",
      "Criterio de aceptación 2"
    ],
    "createdAt": "2025-03-01"
  },
  {
    "id": "US-66",
    "projectId": "gad-municipal-001",
    "sprintId": "gad-municipal-001-s9",
    "epicId": "gad-municipal-001-e16",
    "title": "HTTPS + SSL + restricción de red interna del GAD",
    "description": "HTTPS + SSL + restricción de red interna del GAD",
    "assignees": [
      "josu",
      "alexis"
    ],
    "priority": "high",
    "storyPoints": 8,
    "status": "todo",
    "acceptanceCriteria": [
      "Criterio de aceptación 1",
      "Criterio de aceptación 2"
    ],
    "createdAt": "2025-03-01"
  },
  {
    "id": "US-67",
    "projectId": "gad-municipal-001",
    "sprintId": "gad-municipal-001-s9",
    "epicId": "gad-municipal-001-e16",
    "title": "Rotación periódica de JWT_SECRET",
    "description": "Rotación periódica de JWT_SECRET",
    "assignees": [
      "josu"
    ],
    "priority": "high",
    "storyPoints": 3,
    "status": "todo",
    "acceptanceCriteria": [
      "Criterio de aceptación 1",
      "Criterio de aceptación 2"
    ],
    "createdAt": "2025-03-01"
  },
  {
    "id": "US-68",
    "projectId": "gad-municipal-001",
    "sprintId": "gad-municipal-001-s9",
    "epicId": "gad-municipal-001-e17",
    "title": "Pruebas funcionales integrales de todos los módulos",
    "description": "Pruebas funcionales integrales de todos los módulos",
    "assignees": [
      "telmo",
      "carlos"
    ],
    "priority": "high",
    "storyPoints": 8,
    "status": "todo",
    "acceptanceCriteria": [
      "Criterio de aceptación 1",
      "Criterio de aceptación 2"
    ],
    "createdAt": "2025-03-01"
  },
  {
    "id": "US-69",
    "projectId": "gad-municipal-001",
    "sprintId": "gad-municipal-001-s9",
    "epicId": "gad-municipal-001-e17",
    "title": "Pruebas de seguridad y penetración básica",
    "description": "Pruebas de seguridad y penetración básica",
    "assignees": [
      "alexis"
    ],
    "priority": "high",
    "storyPoints": 8,
    "status": "todo",
    "acceptanceCriteria": [
      "Criterio de aceptación 1",
      "Criterio de aceptación 2"
    ],
    "createdAt": "2025-03-01"
  },
  {
    "id": "US-70",
    "projectId": "gad-municipal-001",
    "sprintId": "gad-municipal-001-s10",
    "epicId": "gad-municipal-001-e17",
    "title": "Corrección de bugs del Sprint 9",
    "description": "Corrección de bugs del Sprint 9",
    "assignees": [
      "josu",
      "gabriel",
      "alexis"
    ],
    "priority": "high",
    "storyPoints": 13,
    "status": "todo",
    "acceptanceCriteria": [
      "Criterio de aceptación 1",
      "Criterio de aceptación 2"
    ],
    "createdAt": "2025-03-01"
  },
  {
    "id": "US-71",
    "projectId": "gad-municipal-001",
    "sprintId": "gad-municipal-001-s10",
    "epicId": "gad-municipal-001-e19",
    "title": "Scripts de backup diario de BD y uploads",
    "description": "Scripts de backup diario de BD y uploads",
    "assignees": [
      "josu"
    ],
    "priority": "high",
    "storyPoints": 3,
    "status": "todo",
    "acceptanceCriteria": [
      "Criterio de aceptación 1",
      "Criterio de aceptación 2"
    ],
    "createdAt": "2025-03-01"
  },
  {
    "id": "US-72",
    "projectId": "gad-municipal-001",
    "sprintId": "gad-municipal-001-s10",
    "epicId": "gad-municipal-001-e19",
    "title": "Poblar fee_rules con tarifas reales del GAD Cañar",
    "description": "Poblar fee_rules con tarifas reales del GAD Cañar",
    "assignees": [
      "carlos",
      "josu"
    ],
    "priority": "high",
    "storyPoints": 5,
    "status": "todo",
    "acceptanceCriteria": [
      "Criterio de aceptación 1",
      "Criterio de aceptación 2"
    ],
    "createdAt": "2025-03-01"
  },
  {
    "id": "US-73",
    "projectId": "gad-municipal-001",
    "sprintId": "gad-municipal-001-s10",
    "epicId": "gad-municipal-001-e19",
    "title": "Crear usuarios institucionales iniciales",
    "description": "Crear usuarios institucionales iniciales",
    "assignees": [
      "josu"
    ],
    "priority": "high",
    "storyPoints": 3,
    "status": "todo",
    "acceptanceCriteria": [
      "Criterio de aceptación 1",
      "Criterio de aceptación 2"
    ],
    "createdAt": "2025-03-01"
  },
  {
    "id": "US-74",
    "projectId": "gad-municipal-001",
    "sprintId": "gad-municipal-001-s10",
    "epicId": "gad-municipal-001-e18",
    "title": "Documentación técnica final consolidada",
    "description": "Documentación técnica final consolidada",
    "assignees": [
      "telmo"
    ],
    "priority": "high",
    "storyPoints": 8,
    "status": "todo",
    "acceptanceCriteria": [
      "Criterio de aceptación 1",
      "Criterio de aceptación 2"
    ],
    "createdAt": "2025-03-01"
  },
  {
    "id": "US-75",
    "projectId": "gad-municipal-001",
    "sprintId": "gad-municipal-001-s10",
    "epicId": "gad-municipal-001-e20",
    "title": "Informe ejecutivo final y presentación",
    "description": "Informe ejecutivo final y presentación",
    "assignees": [
      "telmo",
      "juan"
    ],
    "priority": "high",
    "storyPoints": 5,
    "status": "todo",
    "acceptanceCriteria": [
      "Criterio de aceptación 1",
      "Criterio de aceptación 2"
    ],
    "createdAt": "2025-03-01"
  },
  {
    "id": "US-76",
    "projectId": "gad-municipal-001",
    "sprintId": "gad-municipal-001-s10",
    "epicId": "gad-municipal-001-e20",
    "title": "Revisión y aprobación documental final por Carlos",
    "description": "Revisión y aprobación documental final por Carlos",
    "assignees": [
      "carlos"
    ],
    "priority": "high",
    "storyPoints": 5,
    "status": "todo",
    "acceptanceCriteria": [
      "Criterio de aceptación 1",
      "Criterio de aceptación 2"
    ],
    "createdAt": "2025-03-01"
  },
  {
    "id": "US-77",
    "projectId": "gad-municipal-001",
    "sprintId": "gad-municipal-001-s10",
    "epicId": "gad-municipal-001-e20",
    "title": "Entrega formal al GAD Municipal de Cañar",
    "description": "Entrega formal al GAD Municipal de Cañar",
    "assignees": [
      "juan"
    ],
    "priority": "high",
    "storyPoints": 3,
    "status": "todo",
    "acceptanceCriteria": [
      "Criterio de aceptación 1",
      "Criterio de aceptación 2"
    ],
    "createdAt": "2025-03-01"
  }
];

export function seedData() {
  // No simulated meetings — user registers real ones
  projectStore.add(project);
  members.forEach(m => memberStore.add(m));
  sprints.forEach(s => sprintStore.add(s));
  epics.forEach(e => epicStore.add(e));
  stories.forEach(s => storyStore.add(s));
  // No tasks added by default anymore.
  markSeeded();
}

/**
 * Migration function to update the Gad Cañar project without touching meetings.
 */
export function updateGadCanarProject() {
  const allProjects = projectStore.getAll();
  const exists = allProjects.find(p => p.id === PID);
  if (!exists) return; // Only update if it exists

  // Remove old entities for this project
  const oldMembers = memberStore.getAll().filter(m => m.projectId !== PID);
  const oldSprints = sprintStore.getAll().filter(s => s.projectId !== PID);
  const oldEpics = epicStore.getAll().filter(e => e.projectId !== PID);
  const oldStories = storyStore.getAll().filter(s => s.projectId !== PID);
  const oldTasks = taskStore.getAll().filter(t => t.projectId !== PID);

  // Add new entities
  memberStore.save([...oldMembers, ...members]);
  sprintStore.save([...oldSprints, ...sprints]);
  epicStore.save([...oldEpics, ...epics]);
  storyStore.save([...oldStories, ...stories]);
  taskStore.save([...oldTasks]); // Clear the tasks for this project
  
  // Also update project info in case description/weeks changed
  projectStore.update(project);
  
  console.log('Gad Cañar Project correctly updated with 77 user stories, 20 epics, 10 sprints without modifying meetings.');
}
