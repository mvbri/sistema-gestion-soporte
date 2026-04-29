// Validaciones comunes usando express-validator
import { body, validationResult } from 'express-validator';

// Middleware para manejar errores de validación
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((error) => ({
      type: 'field',
      field: error.path,
      value: error.value || '',
      message: error.msg,
    }));

    const errorMessages = formattedErrors.map((err) => err.message);
    const mainMessage =
      formattedErrors.length === 1
        ? formattedErrors[0].message
        : `Se encontraron ${formattedErrors.length} errores de validación`;

    return res.status(400).json({
      success: false,
      message: mainMessage,
      errors: formattedErrors,
    });
  }
  next();
};

export const validateRegistro = [
  body('full_name')
    .trim()
    .notEmpty()
    .withMessage('El nombre completo es requerido')
    .isLength({ min: 3, max: 255 })
    .withMessage('El nombre debe tener entre 3 y 255 caracteres')
    .matches(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras, números y espacios'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('El email es requerido')
    .isEmail()
    .withMessage('El email no es válido')
    .customSanitizer((value) => (typeof value === 'string' ? value.toLowerCase() : value)),

  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La contraseña debe contener al menos una mayúscula, una minúscula y un número'),

  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .custom((value) => {
      if (!value || value === '') return true;
      if (!/^[0-9+\-\s()]+$/.test(value)) {
        throw new Error('El teléfono no es válido');
      }
      if (value.length < 10 || value.length > 20) {
        throw new Error('El teléfono debe tener entre 10 y 20 caracteres');
      }
      return true;
    }),

  body('incident_area_id')
    .notEmpty()
    .withMessage('La dirección es requerida')
    .isInt({ min: 1 })
    .withMessage('La dirección seleccionada no es válida'),

  handleValidationErrors,
];

// Validaciones para login
export const validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('El email es requerido')
    .isEmail()
    .withMessage('El email no es válido')
    .customSanitizer((value) => (typeof value === 'string' ? value.toLowerCase() : value)),

  body('password').notEmpty().withMessage('La contraseña es requerida'),

  handleValidationErrors,
];

// Validaciones para recuperación de contraseña
export const validateRecuperacionPassword = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('El email es requerido')
    .isEmail()
    .withMessage('El email no es válido')
    .customSanitizer((value) => (typeof value === 'string' ? value.toLowerCase() : value)),

  handleValidationErrors,
];

// Validaciones para restablecer contraseña
export const validateRestablecerPassword = [
  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La contraseña debe contener al menos una mayúscula, una minúscula y un número'),

  handleValidationErrors,
];

export const validateUpdateProfile = [
  body('full_name')
    .trim()
    .notEmpty()
    .withMessage('El nombre completo es requerido')
    .isLength({ min: 3, max: 255 })
    .withMessage('El nombre debe tener entre 3 y 255 caracteres')
    .matches(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras, números y espacios'),

  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .custom((value) => {
      if (!value || value === '') return true;
      if (!/^[0-9+\-\s()]+$/.test(value)) {
        throw new Error('El teléfono no es válido');
      }
      if (value.length < 10 || value.length > 20) {
        throw new Error('El teléfono debe tener entre 10 y 20 caracteres');
      }
      return true;
    }),

  body('incident_area_id')
    .custom((value) => {
      if (value === undefined || value === null || value === '' || value === 0) {
        throw new Error('La dirección es requerida');
      }
      const numValue = typeof value === 'string' ? parseInt(value, 10) : Number(value);
      if (isNaN(numValue) || numValue < 1) {
        throw new Error('La dirección seleccionada no es válida');
      }
      return true;
    })
    .toInt(),

  handleValidationErrors,
];

// Validaciones para crear ticket (sin validar imagen_url si hay archivo)
export const validateCreateTicket = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Por favor, ingresa un título para el ticket')
    .isLength({ min: 5, max: 255 })
    .withMessage(
      'El título debe tener entre 5 y 255 caracteres. Actualmente tiene menos de 5 caracteres'
    ),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Por favor, proporciona una descripción detallada del problema')
    .isLength({ min: 20 })
    .withMessage(
      'La descripción debe tener al menos 20 caracteres para poder entender mejor el problema'
    ),

  body('category_id')
    .notEmpty()
    .withMessage('Debes seleccionar una categoría para el ticket')
    .isInt({ min: 1 })
    .withMessage('La categoría seleccionada no es válida'),

  body('priority_id')
    .notEmpty()
    .withMessage('Debes seleccionar la prioridad del ticket')
    .isInt({ min: 1 })
    .withMessage('La prioridad seleccionada no es válida'),

  handleValidationErrors,
];

// Validaciones para actualizar ticket
export const validateUpdateTicket = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 255 })
    .withMessage('El título debe tener entre 5 y 255 caracteres'),

  body('description')
    .optional()
    .trim()
    .isLength({ min: 20 })
    .withMessage('La descripción debe tener al menos 20 caracteres'),

  body('incident_area_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La dirección debe ser un número válido'),

  body('category_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La categoría debe ser un número válido'),

  body('priority_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La prioridad debe ser un número válido'),

  body('state_id').optional().isInt({ min: 1 }).withMessage('El estado debe ser un número válido'),

  body('assigned_technician_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El técnico asignado debe ser un número válido'),

  handleValidationErrors,
];

// Validaciones para comentarios
export const validateComment = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Por favor, escribe un comentario antes de enviarlo')
    .isLength({ min: 5 })
    .withMessage('El comentario debe tener al menos 5 caracteres para ser válido'),

  handleValidationErrors,
];

// Validaciones para obtener preguntas de seguridad
export const validateGetSecurityQuestions = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('El email es requerido')
    .isEmail()
    .withMessage('El email no es válido')
    .customSanitizer((value) => (typeof value === 'string' ? value.toLowerCase() : value)),

  handleValidationErrors,
];

// Validaciones para verificar respuestas de seguridad
export const validateVerifySecurityAnswers = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('El email es requerido')
    .isEmail()
    .withMessage('El email no es válido')
    .customSanitizer((value) => (typeof value === 'string' ? value.toLowerCase() : value)),

  body('answer1')
    .trim()
    .notEmpty()
    .withMessage('La primera respuesta es requerida')
    .isLength({ min: 3 })
    .withMessage('La respuesta debe tener al menos 3 caracteres'),

  body('answer2')
    .trim()
    .notEmpty()
    .withMessage('La segunda respuesta es requerida')
    .isLength({ min: 3 })
    .withMessage('La respuesta debe tener al menos 3 caracteres'),

  handleValidationErrors,
];

// Validaciones para configurar preguntas de seguridad
export const validateSetSecurityQuestions = [
  body('question1')
    .trim()
    .notEmpty()
    .withMessage('La primera pregunta es requerida')
    .isLength({ min: 10 })
    .withMessage('La pregunta debe tener al menos 10 caracteres'),

  body('answer1')
    .trim()
    .notEmpty()
    .withMessage('La primera respuesta es requerida')
    .isLength({ min: 3 })
    .withMessage('La respuesta debe tener al menos 3 caracteres'),

  body('question2')
    .trim()
    .notEmpty()
    .withMessage('La segunda pregunta es requerida')
    .isLength({ min: 10 })
    .withMessage('La pregunta debe tener al menos 10 caracteres'),

  body('answer2')
    .trim()
    .notEmpty()
    .withMessage('La segunda respuesta es requerida')
    .isLength({ min: 3 })
    .withMessage('La respuesta debe tener al menos 3 caracteres'),

  handleValidationErrors,
];

export const validateSetSecurityQuestionsPublic = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('El email es requerido')
    .isEmail()
    .withMessage('El email no es válido')
    .customSanitizer((value) => (typeof value === 'string' ? value.toLowerCase() : value)),

  body('question1')
    .trim()
    .notEmpty()
    .withMessage('La primera pregunta es requerida')
    .isLength({ min: 10 })
    .withMessage('La pregunta debe tener al menos 10 caracteres'),

  body('answer1')
    .trim()
    .notEmpty()
    .withMessage('La primera respuesta es requerida')
    .isLength({ min: 3 })
    .withMessage('La respuesta debe tener al menos 3 caracteres'),

  body('question2')
    .trim()
    .notEmpty()
    .withMessage('La segunda pregunta es requerida')
    .isLength({ min: 10 })
    .withMessage('La pregunta debe tener al menos 10 caracteres'),

  body('answer2')
    .trim()
    .notEmpty()
    .withMessage('La segunda respuesta es requerida')
    .isLength({ min: 3 })
    .withMessage('La respuesta debe tener al menos 3 caracteres'),

  handleValidationErrors,
];

// Validaciones para crear equipo
export const validateCreateEquipment = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('El nombre del equipo es requerido')
    .isLength({ min: 3, max: 255 })
    .withMessage('El nombre debe tener entre 3 y 255 caracteres'),

  body('brand')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('La marca no puede exceder 100 caracteres'),

  body('model')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('El modelo no puede exceder 100 caracteres'),

  body('serial_number')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('El número de serie no puede exceder 100 caracteres'),

  body('type')
    .optional()
    .isIn(['laptop', 'desktop', 'monitor', 'printer', 'network_device', 'other'])
    .withMessage('El tipo de equipo no es válido'),

  body('status')
    .optional()
    .isIn(['available', 'assigned', 'maintenance', 'retired'])
    .withMessage('El estado del equipo no es válido'),

  body('assigned_to_user_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El ID del usuario asignado debe ser un número válido'),

  body('description').optional({ checkFalsy: true }).trim(),

  body('purchase_date')
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage('La fecha de compra debe ser una fecha válida'),

  body('warranty_expires_at')
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage('La fecha de expiración de garantía debe ser una fecha válida'),

  handleValidationErrors,
];

// Validaciones para actualizar equipo
export const validateUpdateEquipment = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('El nombre debe tener entre 3 y 255 caracteres'),

  body('brand')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('La marca no puede exceder 100 caracteres'),

  body('model')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('El modelo no puede exceder 100 caracteres'),

  body('serial_number')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('El número de serie no puede exceder 100 caracteres'),

  body('type')
    .optional()
    .isIn(['laptop', 'desktop', 'monitor', 'printer', 'network_device', 'other'])
    .withMessage('El tipo de equipo no es válido'),

  body('status')
    .optional()
    .isIn(['available', 'assigned', 'maintenance', 'retired'])
    .withMessage('El estado del equipo no es válido'),

  body('assigned_to_user_id')
    .optional()
    .custom((value) => {
      if (value === null || value === undefined || value === '') return true;
      return Number.isInteger(Number(value)) && Number(value) >= 1;
    })
    .withMessage('El ID del usuario asignado debe ser un número válido o null'),

  body('description').optional({ checkFalsy: true }).trim(),

  body('purchase_date')
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage('La fecha de compra debe ser una fecha válida'),

  body('warranty_expires_at')
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage('La fecha de expiración de garantía debe ser una fecha válida'),

  handleValidationErrors,
];

// Validaciones para asignar equipo
export const validateAssignEquipment = [
  body('user_id')
    .notEmpty()
    .withMessage('El ID del usuario es requerido')
    .isInt({ min: 1 })
    .withMessage('El ID del usuario debe ser un número válido'),

  handleValidationErrors,
];

// Validaciones para crear consumible
export const validateCreateConsumable = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('El nombre del consumible es requerido')
    .isLength({ min: 3, max: 255 })
    .withMessage('El nombre debe tener entre 3 y 255 caracteres'),

  body('type_id')
    .notEmpty()
    .withMessage('El tipo de consumible es requerido')
    .isInt({ min: 1 })
    .withMessage('El tipo de consumible no es válido'),

  body('unit')
    .trim()
    .notEmpty()
    .withMessage('La unidad es requerida')
    .isLength({ max: 50 })
    .withMessage('La unidad no puede exceder 50 caracteres'),

  body('quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('La cantidad debe ser un número entero mayor o igual a 0'),

  body('minimum_quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('La cantidad mínima debe ser un número entero mayor o igual a 0'),

  body('status')
    .optional()
    .isIn(['available', 'low_stock', 'out_of_stock', 'inactive'])
    .withMessage('El estado del consumible no es válido'),

  body('location')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 255 })
    .withMessage('La ubicación no puede exceder 255 caracteres'),

  body('description').optional({ checkFalsy: true }).trim(),

  handleValidationErrors,
];

// Validaciones para actualizar consumible
export const validateUpdateConsumable = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('El nombre debe tener entre 3 y 255 caracteres'),

  body('type_id').optional().isInt({ min: 1 }).withMessage('El tipo de consumible no es válido'),

  body('unit')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('La unidad no puede exceder 50 caracteres'),

  body('quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('La cantidad debe ser un número entero mayor o igual a 0'),

  body('minimum_quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('La cantidad mínima debe ser un número entero mayor o igual a 0'),

  body('status')
    .optional()
    .isIn(['available', 'low_stock', 'out_of_stock', 'inactive'])
    .withMessage('El estado del consumible no es válido'),

  body('location')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 255 })
    .withMessage('La ubicación no puede exceder 255 caracteres'),

  body('description').optional({ checkFalsy: true }).trim(),

  handleValidationErrors,
];

// Validaciones para crear herramienta
export const validateCreateTool = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('El nombre de la herramienta es requerido')
    .isLength({ min: 3, max: 255 })
    .withMessage('El nombre debe tener entre 3 y 255 caracteres'),

  body('code')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('El código no puede exceder 100 caracteres'),

  body('type_id')
    .notEmpty()
    .withMessage('El tipo de herramienta es requerido')
    .isInt({ min: 1 })
    .withMessage('El tipo de herramienta no es válido'),

  body('status')
    .optional()
    .isIn(['available', 'assigned', 'maintenance', 'lost', 'retired'])
    .withMessage('El estado de la herramienta no es válido'),

  body('condition')
    .optional()
    .isIn(['new', 'good', 'worn', 'broken'])
    .withMessage('La condición de la herramienta no es válida'),

  body('location')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 255 })
    .withMessage('La ubicación no puede exceder 255 caracteres'),

  body('assigned_to_user_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El ID del usuario asignado debe ser un número válido'),

  body('description').optional({ checkFalsy: true }).trim(),

  handleValidationErrors,
];

// Validaciones para actualizar herramienta
export const validateUpdateTool = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('El nombre debe tener entre 3 y 255 caracteres'),

  body('code')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('El código no puede exceder 100 caracteres'),

  body('type_id').optional().isInt({ min: 1 }).withMessage('El tipo de herramienta no es válido'),

  body('status')
    .optional()
    .isIn(['available', 'assigned', 'maintenance', 'lost', 'retired'])
    .withMessage('El estado de la herramienta no es válido'),

  body('condition')
    .optional()
    .isIn(['new', 'good', 'worn', 'broken'])
    .withMessage('La condición de la herramienta no es válida'),

  body('location')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 255 })
    .withMessage('La ubicación no puede exceder 255 caracteres'),

  body('assigned_to_user_id')
    .optional()
    .custom((value) => {
      if (value === null || value === undefined || value === '') return true;
      return Number.isInteger(Number(value)) && Number(value) >= 1;
    })
    .withMessage('El ID del usuario asignado debe ser un número válido o null'),

  body('description').optional({ checkFalsy: true }).trim(),

  handleValidationErrors,
];

// Validaciones para asignar herramienta
export const validateAssignTool = [
  body('user_id')
    .notEmpty()
    .withMessage('El ID del usuario es requerido')
    .isInt({ min: 1 })
    .withMessage('El ID del usuario debe ser un número válido'),

  handleValidationErrors,
];

// Validaciones para Fallas Frecuentes (FAQ)
export const validateFrequentIssue = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('El título es requerido')
    .isLength({ min: 5, max: 255 })
    .withMessage('El título debe tener entre 5 y 255 caracteres'),

  body('possible_solution')
    .trim()
    .notEmpty()
    .withMessage('La solución posible es requerida')
    .isLength({ min: 10 })
    .withMessage('La solución debe ser más descriptiva (mínimo 10 caracteres)'),

  body('category_id')
    .optional({ checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage('La categoría seleccionada no es válida'),

  handleValidationErrors,
];

export const validateCreateEquipmentLoan = [
  body('target_incident_area_id')
    .notEmpty()
    .withMessage('El área destino es requerida')
    .isInt({ min: 1 })
    .withMessage('El área destino seleccionada no es válida'),
  body('start_date')
    .notEmpty()
    .withMessage('La fecha de inicio es requerida')
    .isISO8601()
    .withMessage('La fecha de inicio no es válida'),
  body('expected_return_date')
    .notEmpty()
    .withMessage('La fecha de devolución estimada es requerida')
    .isISO8601()
    .withMessage('La fecha de devolución estimada no es válida'),
  body('request_notes')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Las notas no pueden exceder 1000 caracteres'),
  body('items')
    .isArray({ min: 1, max: 1 })
    .withMessage('Cada solicitud admite exactamente un equipo'),
  body('items.*.equipment_id')
    .notEmpty()
    .withMessage('Cada ítem debe incluir un equipo')
    .isInt({ min: 1 })
    .withMessage('El ID del equipo debe ser válido'),
  body('items.*.quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La cantidad debe ser mayor a 0'),
  body('items').custom((items) => {
    for (const item of items) {
      if (item.pool_id !== undefined && item.pool_id !== null && item.pool_id !== '') {
        throw new Error('Las solicitudes nuevas solo admiten equipos por serial, no pool');
      }
      if (item.quantity != null && Number(item.quantity) !== 1) {
        throw new Error('Cada ítem por equipo debe tener cantidad 1');
      }
    }
    return true;
  }),
  handleValidationErrors,
];

export const validateApproveEquipmentLoan = [
  body('notes')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Las notas no pueden exceder 1000 caracteres'),
  handleValidationErrors,
];

export const validateRevokeEquipmentLoanApproval = [
  body('notes')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Las notas no pueden exceder 1000 caracteres'),
  handleValidationErrors,
];

export const validateEquipmentLoanComment = [
  body('comment_text')
    .trim()
    .notEmpty()
    .withMessage('El comentario es requerido')
    .isLength({ min: 2, max: 2000 })
    .withMessage('El comentario debe tener entre 2 y 2000 caracteres'),
  handleValidationErrors,
];

export const validateRejectEquipmentLoan = [
  body('reason')
    .notEmpty()
    .withMessage('La razón de rechazo es requerida')
    .trim()
    .isLength({ min: 5, max: 1000 })
    .withMessage('La razón de rechazo debe tener entre 5 y 1000 caracteres'),
  handleValidationErrors,
];

const checklistPhysicalConditions = ['new', 'good', 'worn', 'damaged'];

export const validateDeliverEquipmentLoan = [
  body('physical_condition')
    .optional()
    .isIn(checklistPhysicalConditions)
    .withMessage('La condición física no es válida'),
  body('battery_level')
    .optional({ nullable: true })
    .isInt({ min: 0, max: 100 })
    .withMessage('La batería debe estar entre 0 y 100'),
  body('accessories')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Los accesorios no pueden exceder 1000 caracteres'),
  body('observations')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Las observaciones no pueden exceder 1000 caracteres'),
  body('notes')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Las notas no pueden exceder 1000 caracteres'),
  handleValidationErrors,
];

export const validateReturnEquipmentLoan = [
  body('physical_condition')
    .optional()
    .isIn(checklistPhysicalConditions)
    .withMessage('La condición física no es válida'),
  body('battery_level')
    .optional({ nullable: true })
    .isInt({ min: 0, max: 100 })
    .withMessage('La batería debe estar entre 0 y 100'),
  body('accessories')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Los accesorios no pueden exceder 1000 caracteres'),
  body('observations')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Las observaciones no pueden exceder 1000 caracteres'),
  body('notes')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Las notas no pueden exceder 1000 caracteres'),
  body('incidents')
    .optional()
    .isArray()
    .withMessage('Los incidentes deben enviarse como un arreglo'),
  body('incidents.*.loan_item_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El loan_item_id del incidente no es válido'),
  body('incidents.*.incident_type')
    .optional()
    .isIn(['damage', 'loss', 'missing_accessory', 'other'])
    .withMessage('El tipo de incidente no es válido'),
  body('incidents.*.description')
    .optional()
    .trim()
    .isLength({ min: 3, max: 1000 })
    .withMessage('La descripción del incidente debe tener entre 3 y 1000 caracteres'),
  body('incidents.*.estimated_cost')
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage('El costo estimado debe ser positivo'),
  handleValidationErrors,
];

export const validateUpdatePendingLoanChecklist = [
  body('physical_condition')
    .optional({ nullable: true })
    .isIn(checklistPhysicalConditions)
    .withMessage('La condición física no es válida'),
  body('battery_level')
    .optional({ nullable: true })
    .isInt({ min: 0, max: 100 })
    .withMessage('La batería debe estar entre 0 y 100'),
  body('observations')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Las observaciones no pueden exceder 1000 caracteres'),
  handleValidationErrors,
];

export const validateCreateMaterialRequest = [
  body('addressee_name')
    .trim()
    .notEmpty()
    .withMessage('Debes indicar el nombre de la persona a quien va dirigida la solicitud')
    .isLength({ min: 2, max: 255 })
    .withMessage('El nombre del destinatario debe tener entre 2 y 255 caracteres'),
  body('addressee_title')
    .trim()
    .notEmpty()
    .withMessage('Debes indicar el cargo del destinatario')
    .isLength({ min: 2, max: 255 })
    .withMessage('El cargo del destinatario debe tener entre 2 y 255 caracteres'),
  body('addressee_addressing_text')
    .trim()
    .notEmpty()
    .withMessage(
      'Debes redactar el texto dirigido al destinatario (dependencia de su cargo y motivo de la solicitud)'
    )
    .isLength({ min: 20, max: 4000 })
    .withMessage('El texto dirigido al destinatario debe tener entre 20 y 4000 caracteres'),
  body('request_notes')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 1500 })
    .withMessage('Las notas no pueden exceder 1500 caracteres'),
  body('items')
    .isArray({ min: 1 })
    .withMessage('Debes enviar al menos un material en la solicitud'),
  body('items.*.source_mode')
    .optional()
    .isIn(['catalog', 'manual'])
    .withMessage('El modo de item no es válido'),
  body('items.*.material_type')
    .optional()
    .isIn(['equipment', 'consumable', 'tool', 'manual'])
    .withMessage('El tipo de material no es válido'),
  body('items.*.reference_id')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('La referencia del material no es válida'),
  body('items.*.custom_material_name')
    .optional({ nullable: true })
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('El nombre del material manual debe tener entre 2 y 255 caracteres'),
  body('items.*.custom_material_description')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 1000 })
    .withMessage('La descripción del material manual no puede exceder 1000 caracteres'),
  body('items.*.quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La cantidad debe ser mayor a 0'),
  body('items').custom((items) => {
    for (const item of items) {
      const sourceMode = item?.source_mode || 'catalog';
      if (sourceMode === 'manual') {
        const materialType = item?.material_type;
        if (!materialType || !['equipment', 'consumable', 'tool'].includes(materialType)) {
          throw new Error(
            'Cada material manual debe indicar si es equipo, consumible o herramienta'
          );
        }
        if (!item?.custom_material_name || String(item.custom_material_name).trim().length < 2) {
          throw new Error('Cada material manual debe incluir un nombre válido');
        }
        const qty = Number(item?.quantity || 1);
        if (!Number.isInteger(qty) || qty < 1) {
          throw new Error('La cantidad debe ser un entero mayor a 0');
        }
        continue;
      }

      const materialType = item?.material_type;
      const quantity = Number(item?.quantity || 1);
      if (!materialType || !['equipment', 'consumable', 'tool'].includes(materialType)) {
        throw new Error('Cada item de catálogo debe indicar un tipo de material válido');
      }
      if (!item?.reference_id) {
        throw new Error('Cada item de catálogo debe tener una referencia válida');
      }
      if ((materialType === 'equipment' || materialType === 'tool') && quantity !== 1) {
        throw new Error('Equipos y herramientas deben tener cantidad 1 por item');
      }
    }
    return true;
  }),
  handleValidationErrors,
];

export const validateApproveMaterialRequest = [
  body('notes')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Las notas no pueden exceder 1000 caracteres'),
  handleValidationErrors,
];

export const validateRejectMaterialRequest = [
  body('reason')
    .notEmpty()
    .withMessage('La razón de rechazo es requerida')
    .trim()
    .isLength({ min: 5, max: 1000 })
    .withMessage('La razón de rechazo debe tener entre 5 y 1000 caracteres'),
  handleValidationErrors,
];

export const validateMaterialRequestComment = [
  body('comment_text')
    .trim()
    .notEmpty()
    .withMessage('El comentario es requerido')
    .isLength({ min: 2, max: 2000 })
    .withMessage('El comentario debe tener entre 2 y 2000 caracteres'),
  handleValidationErrors,
];
