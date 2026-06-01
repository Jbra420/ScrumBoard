import type { Project, TeamMember, Sprint, Epic, UserStory, Task } from '../types/index';
import { projectStore, memberStore, sprintStore, epicStore, storyStore, taskStore, markSeeded, generateId } from '../store/storage';

export function seedData() {
  const pid = 'gad-municipal-001';

  const project: Project = {
    id: pid, name: 'GAD Municipal & Blockchain', color: '#A855F7',
    description: 'Sistema de almacenamiento y trazabilidad blockchain para el GAD Municipal de Cañar. Gestión de trámites con IPFS, firma electrónica y verificación QR.',
    status: 'active', createdAt: '2026-01-06', totalWeeks: 10
  };

  const members: TeamMember[] = [
    { id: 'juan', projectId: pid, name: 'Juan', role: 'Scrum Master', specialty: 'Gestión de proyecto, coordinación y seguimiento de sprints', color: '#A855F7', sprintFocus: [1,2,3,4,5] },
    { id: 'alexis', projectId: pid, name: 'Alexis', role: 'Blockchain Developer', specialty: 'Smart Contracts Solidity, Ethers.js, IPFS, Pinata, Hardhat, SHA-256, NestJS Blockchain Services', color: '#38BDF8', sprintFocus: [1,3,4,5] },
    { id: 'carlos', projectId: pid, name: 'Carlos', role: 'Security & Digital Signature Developer', specialty: 'Firma electrónica, certificados digitales XAdES-BES, validación criptográfica, integridad documental', color: '#34D399', sprintFocus: [1,4,5] },
    { id: 'telmo', projectId: pid, name: 'Telmo', role: 'Documentation & Legal Process Analyst', specialty: 'Términos y condiciones, documentación técnica, manuales de usuario, políticas de privacidad, auditoría', color: '#FBBF24', sprintFocus: [1,5] },
    { id: 'gabriel', projectId: pid, name: 'Gabriel', role: 'Frontend Developer / UI Developer', specialty: 'React, Vite, Zustand, Tailwind CSS, React Hook Form, dashboards, integración QR', color: '#FB923C', sprintFocus: [2,3,5] },
    { id: 'josu', projectId: pid, name: 'Josu', role: 'Backend Developer / Auth Engineer', specialty: 'NestJS, Prisma ORM, PostgreSQL, JWT, API REST, roles y permisos, gestión de estados', color: '#6366F1', sprintFocus: [2,3,4,5] },
  ];

  const sprints: Sprint[] = [
    { id: 's1', projectId: pid, number: 1, name: 'Análisis y Arquitectura', goal: 'Definir la base del proyecto y preparar el entorno de desarrollo.', startDate: '2026-01-06', endDate: '2026-01-20', status: 'completed', plannedPoints: 40 },
    { id: 's2', projectId: pid, number: 2, name: 'Gestión de Usuarios y Autenticación', goal: 'Permitir acceso seguro al sistema.', startDate: '2026-01-21', endDate: '2026-02-03', status: 'active', plannedPoints: 35 },
    { id: 's3', projectId: pid, number: 3, name: 'Trámites Municipales e IPFS', goal: 'Permitir crear solicitudes y almacenar documentos en IPFS.', startDate: '2026-02-04', endDate: '2026-02-17', status: 'pending', plannedPoints: 45 },
    { id: 's4', projectId: pid, number: 4, name: 'Blockchain y Firma Electrónica', goal: 'Registrar la trazabilidad de documentos en Blockchain.', startDate: '2026-02-18', endDate: '2026-03-03', status: 'pending', plannedPoints: 50 },
    { id: 's5', projectId: pid, number: 5, name: 'QR, Auditoría y Despliegue', goal: 'Completar el sistema y preparar la entrega final.', startDate: '2026-03-04', endDate: '2026-03-17', status: 'pending', plannedPoints: 40 },
  ];

  const epics: Epic[] = [
    { id: 'e1', projectId: pid, name: 'Gestión de Usuarios', color: '#A855F7', description: 'Autenticación y roles' },
    { id: 'e2', projectId: pid, name: 'Gestión de Trámites', color: '#38BDF8', description: 'Solicitudes municipales' },
    { id: 'e3', projectId: pid, name: 'Almacenamiento IPFS', color: '#34D399', description: 'Almacenamiento descentralizado' },
    { id: 'e4', projectId: pid, name: 'Blockchain y Trazabilidad', color: '#FBBF24', description: 'Registro inmutable' },
    { id: 'e5', projectId: pid, name: 'Firma Electrónica', color: '#FB923C', description: 'Autenticidad documental' },
    { id: 'e6', projectId: pid, name: 'Verificación QR', color: '#6366F1', description: 'Consulta pública' },
    { id: 'e7', projectId: pid, name: 'Auditoría y Reportes', color: '#F472B6', description: 'Control institucional' },
  ];

  const stories: UserStory[] = [
    { id: 'HU-01', projectId: pid, sprintId: 's2', epicId: 'e1', title: 'Registro de usuarios', description: 'Como administrador quiero registrar usuarios con información personal y rol asignado para controlar el acceso.', assignees: ['gabriel','josu'], priority: 'high', storyPoints: 8, status: 'in-progress', acceptanceCriteria: ['Registrar nombre, correo y contraseña','Asignar rol','Validar correo único','Almacenar en base de datos'], createdAt: '2026-01-21' },
    { id: 'HU-02', projectId: pid, sprintId: 's2', epicId: 'e1', title: 'Inicio de sesión', description: 'Como usuario registrado quiero iniciar sesión mediante correo y contraseña para acceder a las funciones autorizadas.', assignees: ['gabriel','josu'], priority: 'critical', storyPoints: 5, status: 'done', acceptanceCriteria: ['Validar credenciales','Generar token JWT','Mostrar error en credenciales incorrectas'], createdAt: '2026-01-21' },
    { id: 'HU-03', projectId: pid, sprintId: 's2', epicId: 'e1', title: 'Gestión de roles', description: 'Como administrador quiero asignar roles a los usuarios para controlar los permisos del sistema.', assignees: ['josu'], priority: 'high', storyPoints: 5, status: 'in-progress', acceptanceCriteria: ['Rol Ciudadano','Rol Secretaría','Rol Técnico','Rol Financiero','Rol Administrador'], createdAt: '2026-01-21' },
    { id: 'HU-04', projectId: pid, sprintId: 's3', epicId: 'e2', title: 'Crear solicitud', description: 'Como ciudadano quiero registrar una nueva solicitud de trámite para iniciar el proceso municipal.', assignees: ['gabriel','josu'], priority: 'high', storyPoints: 8, status: 'todo', acceptanceCriteria: ['Seleccionar tipo de trámite','Registrar datos del predio','Registrar información del solicitante'], createdAt: '2026-01-21' },
    { id: 'HU-05', projectId: pid, sprintId: 's3', epicId: 'e2', title: 'Adjuntar documentos', description: 'Como ciudadano quiero subir documentos y planos digitales para respaldar mi solicitud.', assignees: ['gabriel'], priority: 'high', storyPoints: 5, status: 'todo', acceptanceCriteria: ['Permitir PDF','Permitir DWG','Validar tamaño máximo','Mostrar confirmación'], createdAt: '2026-01-21' },
    { id: 'HU-06', projectId: pid, sprintId: 's3', epicId: 'e2', title: 'Revisión documental', description: 'Como secretaria municipal quiero revisar los documentos cargados para verificar que cumplan requisitos.', assignees: ['josu'], priority: 'medium', storyPoints: 5, status: 'todo', acceptanceCriteria: ['Aprobar documentos','Solicitar correcciones','Registrar observaciones'], createdAt: '2026-01-21' },
    { id: 'HU-07', projectId: pid, sprintId: 's3', epicId: 'e2', title: 'Evaluación técnica', description: 'Como técnico municipal quiero evaluar solicitudes y planos para determinar si cumplen la normativa.', assignees: ['josu'], priority: 'medium', storyPoints: 5, status: 'todo', acceptanceCriteria: ['Aprobar','Rechazar','Registrar observaciones técnicas'], createdAt: '2026-01-21' },
    { id: 'HU-08', projectId: pid, sprintId: 's3', epicId: 'e3', title: 'Almacenar documentos en IPFS', description: 'Como sistema quiero almacenar los documentos en IPFS para garantizar almacenamiento descentralizado.', assignees: ['alexis'], priority: 'high', storyPoints: 8, status: 'todo', acceptanceCriteria: ['Generar CID','Guardar CID en BD','Confirmar almacenamiento exitoso'], createdAt: '2026-01-21' },
    { id: 'HU-09', projectId: pid, sprintId: 's3', epicId: 'e3', title: 'Generar identificador único (CID)', description: 'Como sistema quiero generar un CID único para cada archivo para identificar documentos de forma segura.', assignees: ['alexis'], priority: 'high', storyPoints: 5, status: 'todo', acceptanceCriteria: ['Generación automática','Asociación con expediente','Persistencia del identificador'], createdAt: '2026-01-21' },
    { id: 'HU-10', projectId: pid, sprintId: 's4', epicId: 'e3', title: 'Verificar integridad documental', description: 'Como administrador quiero comparar hashes de documentos para detectar alteraciones.', assignees: ['alexis'], priority: 'high', storyPoints: 8, status: 'todo', acceptanceCriteria: ['Calcular SHA-256','Comparar hashes','Mostrar resultado de validación'], createdAt: '2026-01-21' },
    { id: 'HU-11', projectId: pid, sprintId: 's4', epicId: 'e4', title: 'Registrar hash en Blockchain', description: 'Como sistema quiero registrar hashes de documentos en blockchain para garantizar inmutabilidad.', assignees: ['alexis'], priority: 'critical', storyPoints: 13, status: 'todo', acceptanceCriteria: ['Registrar transacción','Obtener hash de transacción','Confirmar registro exitoso'], createdAt: '2026-01-21' },
    { id: 'HU-12', projectId: pid, sprintId: 's4', epicId: 'e4', title: 'Registrar estados del trámite', description: 'Como técnico quiero registrar cambios de estado en blockchain para mantener trazabilidad permanente.', assignees: ['alexis','josu'], priority: 'high', storyPoints: 8, status: 'todo', acceptanceCriteria: ['Estado Pendiente','Estado Observado','Estado En revisión','Estado Aprobado','Estado Rechazado','Estado Pagado'], createdAt: '2026-01-21' },
    { id: 'HU-13', projectId: pid, sprintId: 's4', epicId: 'e4', title: 'Consultar historial blockchain', description: 'Como auditor quiero consultar el historial de transacciones para verificar el recorrido completo del trámite.', assignees: ['alexis'], priority: 'medium', storyPoints: 5, status: 'todo', acceptanceCriteria: ['Mostrar fecha','Mostrar usuario responsable','Mostrar estado','Mostrar hash blockchain'], createdAt: '2026-01-21' },
    { id: 'HU-14', projectId: pid, sprintId: 's4', epicId: 'e5', title: 'Firma digital de documentos', description: 'Como técnico municipal quiero firmar digitalmente documentos aprobados para garantizar autenticidad.', assignees: ['carlos','telmo'], priority: 'high', storyPoints: 13, status: 'todo', acceptanceCriteria: ['Validar certificado','Registrar firma','Vincular firma al expediente'], createdAt: '2026-01-21' },
    { id: 'HU-15', projectId: pid, sprintId: 's4', epicId: 'e5', title: 'Validar firma electrónica', description: 'Como ciudadano o auditor quiero verificar una firma electrónica para comprobar que el documento es auténtico.', assignees: ['carlos','telmo'], priority: 'medium', storyPoints: 5, status: 'todo', acceptanceCriteria: ['Mostrar estado de firma','Mostrar firmante','Mostrar fecha de firma'], createdAt: '2026-01-21' },
    { id: 'HU-16', projectId: pid, sprintId: 's5', epicId: 'e6', title: 'Generación de QR', description: 'Como sistema quiero generar un código QR para cada certificado emitido para facilitar su validación pública.', assignees: ['gabriel'], priority: 'high', storyPoints: 5, status: 'todo', acceptanceCriteria: ['Generación automática','Asociación con expediente','Impresión en PDF'], createdAt: '2026-01-21' },
    { id: 'HU-17', projectId: pid, sprintId: 's5', epicId: 'e6', title: 'Consulta pública por QR', description: 'Como ciudadano quiero escanear un QR y consultar el expediente para verificar su autenticidad.', assignees: ['gabriel','alexis'], priority: 'high', storyPoints: 5, status: 'todo', acceptanceCriteria: ['Mostrar estado actual','Mostrar hash','Mostrar CID','Mostrar fecha de emisión'], createdAt: '2026-01-21' },
    { id: 'HU-18', projectId: pid, sprintId: 's5', epicId: 'e7', title: 'Auditoría de actividades', description: 'Como administrador quiero visualizar todas las acciones realizadas en el sistema para supervisar la operación.', assignees: ['telmo'], priority: 'medium', storyPoints: 8, status: 'todo', acceptanceCriteria: ['Registrar usuario','Registrar fecha','Registrar acción ejecutada'], createdAt: '2026-01-21' },
    { id: 'HU-19', projectId: pid, sprintId: 's5', epicId: 'e7', title: 'Generación de reportes', description: 'Como administrador quiero generar reportes de trámites y auditorías para facilitar el control institucional.', assignees: ['telmo'], priority: 'medium', storyPoints: 5, status: 'todo', acceptanceCriteria: ['Exportar PDF','Filtrar por fecha','Filtrar por estado'], createdAt: '2026-01-21' },
    { id: 'HU-20', projectId: pid, sprintId: 's5', epicId: 'e7', title: 'Dashboard institucional', description: 'Como administrador quiero visualizar estadísticas generales del sistema para monitorear el desempeño.', assignees: ['gabriel'], priority: 'high', storyPoints: 8, status: 'todo', acceptanceCriteria: ['Mostrar trámites registrados','Mostrar aprobados','Mostrar rechazados','Mostrar actividad reciente'], createdAt: '2026-01-21' },
  ];

  const tasks: Task[] = [
    { id: generateId(), userStoryId: 'HU-01', sprintId: 's2', projectId: pid, title: 'Pantalla de registro de usuarios (React + Tailwind)', assigneeId: 'gabriel', status: 'in-progress', estimatedHours: 6, loggedHours: 4, createdAt: '2026-01-21' },
    { id: generateId(), userStoryId: 'HU-01', sprintId: 's2', projectId: pid, title: 'API REST de registro con validación (NestJS + Prisma)', assigneeId: 'josu', status: 'done', estimatedHours: 8, loggedHours: 8, createdAt: '2026-01-21' },
    { id: generateId(), userStoryId: 'HU-02', sprintId: 's2', projectId: pid, title: 'Pantalla de login (React + React Hook Form)', assigneeId: 'gabriel', status: 'done', estimatedHours: 4, loggedHours: 4, createdAt: '2026-01-21' },
    { id: generateId(), userStoryId: 'HU-02', sprintId: 's2', projectId: pid, title: 'JWT y autenticación backend (NestJS + PostgreSQL)', assigneeId: 'josu', status: 'done', estimatedHours: 8, loggedHours: 9, createdAt: '2026-01-21' },
    { id: generateId(), userStoryId: 'HU-03', sprintId: 's2', projectId: pid, title: 'CRUD de roles y permisos (NestJS + Prisma ORM)', assigneeId: 'josu', status: 'in-progress', estimatedHours: 6, loggedHours: 3, createdAt: '2026-01-22' },
    { id: generateId(), userStoryId: 'HU-03', sprintId: 's2', projectId: pid, title: 'Dashboard inicial post-login (React + Zustand)', assigneeId: 'gabriel', status: 'todo', estimatedHours: 5, loggedHours: 0, createdAt: '2026-01-22' },
  ];

  // No simulated meetings — user registers real ones
  projectStore.add(project);
  members.forEach(m => memberStore.add(m));
  sprints.forEach(s => sprintStore.add(s));
  epics.forEach(e => epicStore.add(e));
  stories.forEach(s => storyStore.add(s));
  tasks.forEach(t => taskStore.add(t));
  markSeeded();
}
