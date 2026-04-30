import type { ManualSection, ManualUserRole } from './types';

const endUserSections: ManualSection[] = [
  {
    id: 'intro',
    title: 'Introducción',
    paragraphs: [
      'Como usuario final usás el sistema para reportar incidencias, solicitar materiales, gestionar préstamos y consultar el estado de tus pedidos. Abrí el menú lateral (icono de menú arriba a la izquierda) para moverte entre las secciones.',
      'Tu perfil y datos de contacto se actualizan desde el menú de usuario (arriba a la derecha) → Mi perfil.',
    ],
  },
  {
    id: 'dashboard',
    title: 'Dashboard',
    paragraphs: [
      'En Dashboard (/dashboard) ves un resumen orientado a tu rol: accesos rápidos y estado general. Desde ahí podés ir a tickets, crear un nuevo ticket o a otras áreas según lo que te muestre la pantalla.',
    ],
  },
  {
    id: 'tickets',
    title: 'Tickets',
    paragraphs: [
      'En Tickets (/tickets) aparece el listado de tus solicitudes de soporte. Podés filtrar y abrir un ticket para ver el detalle, los comentarios y el seguimiento.',
      'En Crear ticket (/tickets/crear) completás el formulario con título, descripción, prioridad y datos que pida el sistema. Enviá el ticket y quedará registrado para que el equipo de soporte lo atienda.',
    ],
  },
  {
    id: 'material-requests',
    title: 'Solicitudes de materiales',
    paragraphs: [
      'En el menú Solicitudes de materiales tenés Nueva solicitud (/material-requests/create) para armar un pedido con ítems del catálogo o descripciones manuales según las reglas del formulario.',
      'En Mis solicitudes (/material-requests) ves el listado de tus solicitudes; al abrir una (/material-requests/:id) revisás el estado, ítems y comentarios.',
    ],
  },
  {
    id: 'loans',
    title: 'Préstamos',
    paragraphs: [
      'En Solicitar préstamo (/loans/create) pedís el préstamo de equipos u otros recursos según el flujo de la pantalla.',
      'En Historial de préstamos (/loans/history) consultás préstamos anteriores y el estado de los actuales. Si un préstamo requiere acción desde una pantalla de entrega o devolución, seguí el enlace que te indique el sistema desde el listado o el detalle.',
    ],
  },
  {
    id: 'inventory-conditional',
    title: 'Inventario (si tenés acceso)',
    paragraphs: [
      'El menú Inventario solo aparece si tenés asignaciones de inventario (equipo/herramienta asignados o consumibles vinculados a solicitudes aprobadas) o si la organización te habilitó ese acceso.',
      'Si ves Inventario, podés entrar a Equipos (/equipment), Consumibles (/consumables) y Herramientas (/tools) para consultar (y en algunos casos interactuar según permisos) con los ítems que te correspondan.',
    ],
  },
  {
    id: 'profile-account',
    title: 'Perfil y cuenta',
    paragraphs: [
      'En Mi perfil (/perfil) actualizás nombre, teléfono y área de incidencias, y podés configurar preguntas de seguridad si el sistema lo ofrece.',
      'Si olvidaste la contraseña, usá el enlace de recuperación en la pantalla de inicio de sesión (fuera del área autenticada) y seguí el flujo de correo o preguntas de seguridad según corresponda.',
    ],
  },
];

const technicianSections: ManualSection[] = [
  {
    id: 'intro',
    title: 'Introducción',
    paragraphs: [
      'Como técnico gestionás tickets asignados, inventario, estadísticas y préstamos en la medida en que la aplicación te lo permita. El menú lateral agrupa Dashboard, Panel del técnico, Tickets, Solicitudes de materiales, Préstamos, Inventario y Estadísticas.',
      'Las opciones exactas dependen de tu usuario; este manual describe las pantallas habituales del rol técnico.',
    ],
  },
  {
    id: 'dashboard',
    title: 'Dashboard y panel del técnico',
    paragraphs: [
      'Dashboard (/dashboard) ofrece una vista general de accesos y resúmenes.',
      'Panel del técnico (/tecnico/dashboard) concentra la información operativa para priorizar y atender el trabajo diario de soporte.',
    ],
  },
  {
    id: 'tickets',
    title: 'Tickets',
    paragraphs: [
      'En Tickets (/tickets) ves el listado; podés abrir un ticket (/tickets/:id) para ver detalle, comentar y actualizar estados o campos según tus permisos y si sos el técnico asignado.',
      'Las acciones de edición dependen de la asignación y de las reglas del ticket; revisá siempre los mensajes de la interfaz al guardar cambios.',
    ],
  },
  {
    id: 'material-requests',
    title: 'Solicitudes de materiales',
    paragraphs: [
      'Podés crear solicitudes desde Nueva solicitud (/material-requests/create) y revisar el listado en /material-requests. En el detalle de una solicitud actualizás o consultás el estado según el flujo definido en tu organización.',
    ],
  },
  {
    id: 'loans',
    title: 'Préstamos',
    paragraphs: [
      'Solicitar préstamo (/loans/create) e Historial de préstamos (/loans/history) funcionan igual que para el usuario final.',
      'En la ficha de un préstamo (/loans/:id) podés registrar entregas, devoluciones u observaciones cuando el flujo lo requiera.',
      'Reporte préstamos (/loans/reports) muestra información agregada para seguimiento y reportes del área.',
    ],
  },
  {
    id: 'inventory',
    title: 'Inventario',
    paragraphs: [
      'Inventario incluye Equipos (/equipment), Consumibles (/consumables) y Herramientas (/tools). Consultá listados y fichas; la creación y edición fuerte puede estar limitada a administradores según pantalla.',
      'Las rutas de alta suelen ser /equipment/crear, /consumables/crear y /tools/crear si tu rol las tiene habilitadas.',
    ],
  },
  {
    id: 'analytics',
    title: 'Estadísticas',
    paragraphs: [
      'En el grupo Estadísticas accedés a Estadísticas de tickets (/analytics), Estadísticas de equipos (/equipment/analytics), de consumibles (/consumables/analytics) y de herramientas (/tools/analytics) para gráficos y métricas de gestión.',
    ],
  },
  {
    id: 'profile',
    title: 'Perfil',
    paragraphs: [
      'Mi perfil (/perfil) permite mantener tus datos actualizados para que el sistema y los usuarios te identifiquen correctamente.',
    ],
  },
];

const administratorSections: ManualSection[] = [
  {
    id: 'intro',
    title: 'Introducción',
    paragraphs: [
      'Como administrador tenés acceso a la configuración del sistema, usuarios, reportes, respaldos y a las mismas áreas operativas (tickets, inventario, préstamos, etc.) que el resto de roles cuando las rutas no están restringidas.',
      'Usá el menú lateral para navegar; las secciones restringidas solo a administrador aparecen con tu sesión.',
    ],
  },
  {
    id: 'users-frequent',
    title: 'Usuarios y fallas frecuentes',
    paragraphs: [
      'Gestión de usuarios (/admin/users) permite dar de alta, editar, desactivar o verificar usuarios según las acciones disponibles en pantalla.',
      'Fallas frecuentes (/admin/frequent-issues) administra el catálogo de problemas recurrentes que ayudan al registro y clasificación de tickets.',
    ],
  },
  {
    id: 'tickets-analytics',
    title: 'Tickets y estadísticas',
    paragraphs: [
      'Tickets (/tickets) y el detalle de un ticket ofrecen visibilidad y edición ampliada (por ejemplo reasignación o ajustes que solo el administrador puede hacer).',
      'Estadísticas de tickets (/analytics) y las estadísticas de inventario en /equipment/analytics, /consumables/analytics y /tools/analytics permiten supervisar el uso del sistema.',
    ],
  },
  {
    id: 'material-loans',
    title: 'Solicitudes de materiales y préstamos',
    paragraphs: [
      'Solicitudes de materiales: listado completo en /material-requests y detalle en /material-requests/:id para gestionar el flujo de aprobación o seguimiento según vuestra política.',
      'En Préstamos, además de solicitar y ver historial, tenés Aprobar préstamos (/loans/approval) para revisar y resolver solicitudes pendientes.',
      'Reporte préstamos (/loans/reports) centraliza información para auditoría y gestión.',
    ],
  },
  {
    id: 'inventory',
    title: 'Inventario',
    paragraphs: [
      'Gestioná equipos, consumibles y herramientas desde /equipment, /consumables y /tools, incluyendo altas (/equipment/crear, etc.) y edición en las fichas cuando el sistema lo permita.',
    ],
  },
  {
    id: 'reports-backup-config',
    title: 'Reportes, respaldo y configuración',
    paragraphs: [
      'Reportes (/admin/reports) concentra exportaciones o informes administrativos definidos en la aplicación.',
      'Respaldo y restauración (/admin/backup) permite operaciones de copia de seguridad según lo implementado en el módulo.',
      'Configuración (/admin/config) ajusta parámetros globales del sistema (categorías, prioridades, estados, áreas u otros datos que exponga la pantalla).',
    ],
  },
  {
    id: 'other-roles',
    title: 'Qué ven los otros roles',
    paragraphs: [
      'Usuario final: crea tickets desde Crear ticket, ve sus solicitudes de materiales y préstamos, y puede tener inventario limitado si tiene asignaciones.',
      'Técnico: usa el panel del técnico, atiende tickets asignados, inventario y estadísticas, y participa en préstamos y reportes de préstamos sin necesidad de permisos de administrador.',
      'Usá las pestañas de este manual para leer las guías detalladas de cada rol si necesitás capacitar o documentar procesos cruzados.',
    ],
  },
  {
    id: 'profile',
    title: 'Perfil',
    paragraphs: [
      'Mi perfil (/perfil) mantiene tus datos personales y de contacto al día.',
    ],
  },
];

export const manualSectionsByRole: Record<ManualUserRole, ManualSection[]> = {
  end_user: endUserSections,
  technician: technicianSections,
  administrator: administratorSections,
};

export const manualRoleLabels: Record<ManualUserRole, string> = {
  end_user: 'Usuario final',
  technician: 'Técnico',
  administrator: 'Administrador',
};

export const manualRolesOrdered: ManualUserRole[] = ['end_user', 'technician', 'administrator'];
