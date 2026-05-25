/**
 * Esquema esperado por formulario (según modelos e INSERT del backend).
 * Sirve para diagnosticar desfases BD ↔ código sin abrir Workbench.
 */
export const FORM_SCHEMA_CHECKS = [
    {
        id: 'register',
        label: 'Registro de usuario',
        route: '/register',
        tables: [
            {
                table: 'users',
                requiredColumns: [
                    'full_name',
                    'email',
                    'password',
                    'incident_area_id',
                    'role_id',
                    'active',
                ],
                migrations: ['migration_2026-02-25_22-02-00_create_users.sql'],
            },
        ],
    },
    {
        id: 'security-questions',
        label: 'Preguntas de seguridad',
        route: '/set-security-questions',
        tables: [
            {
                table: 'users',
                requiredColumns: [
                    'security_question_1',
                    'security_answer_1',
                    'security_question_2',
                    'security_answer_2',
                ],
                migrations: ['migration_2026-02-25_17-19-57_add_security_questions_columns.sql'],
            },
        ],
    },
    {
        id: 'create-ticket',
        label: 'Nuevo ticket',
        route: '/tickets/create',
        tables: [
            {
                table: 'tickets',
                requiredColumns: [
                    'id',
                    'title',
                    'description',
                    'incident_area_id',
                    'category_id',
                    'priority_id',
                    'state_id',
                    'created_by_user_id',
                    'image_url',
                ],
                migrations: ['migration_2026-02-25_22-07-00_create_tickets.sql'],
            },
            {
                table: 'ticket_equipment',
                requiredColumns: ['ticket_id', 'equipment_id'],
                optional: true,
                migrations: ['migration_2026-02-24_21-10-00_add_ticket_equipment.sql'],
            },
        ],
    },
    {
        id: 'create-material-request',
        label: 'Nueva solicitud de materiales',
        route: '/material-requests/create',
        tables: [
            {
                table: 'material_requests',
                requiredColumns: [
                    'requester_user_id',
                    'addressee_name',
                    'addressee_title',
                    'addressee_addressing_text',
                ],
                deprecatedColumns: ['request_area', 'addressed_to'],
                migrations: [
                    'migration_2026-04-29_14-02-00_create_material_requests.sql',
                    'migration_2026-04-29_19-15-00_add_addressee_name_and_title.sql',
                    'migration_2026-04-29_20-30-00_rename_request_area_to_addressee_addressing_text.sql',
                ],
            },
            {
                table: 'material_request_items',
                requiredColumns: [
                    'material_request_id',
                    'material_type',
                    'source_mode',
                    'custom_material_name',
                    'quantity',
                ],
                migrations: ['migration_2026-04-29_15-35-00_allow_manual_material_items.sql'],
            },
        ],
    },
    {
        id: 'create-loan',
        label: 'Nueva solicitud de préstamo',
        route: '/loans/create',
        tables: [
            {
                table: 'equipment_loans',
                requiredColumns: [
                    'requester_user_id',
                    'target_incident_area_id',
                    'start_date',
                    'expected_return_date',
                    'status',
                ],
                migrations: [
                    'migration_2026-04-28_09-45-00_create_equipment_loans.sql',
                    'migration_2026-04-28_10-59-00_add_target_incident_area_to_equipment_loans.sql',
                ],
            },
            {
                table: 'equipment_loan_items',
                requiredColumns: ['loan_id', 'equipment_id', 'quantity'],
                migrations: ['migration_2026-04-28_09-45-00_create_equipment_loans.sql'],
            },
            {
                table: 'equipment_loan_history',
                requiredColumns: ['loan_id', 'changed_by_user_id', 'new_status'],
                migrations: ['migration_2026-04-28_09-45-00_create_equipment_loans.sql'],
            },
            {
                table: 'equipment_loan_comments',
                requiredColumns: ['equipment_loan_id', 'comment_text', 'created_by_user_id'],
                optional: true,
                migrations: ['migration_2026-04-29_20-30-00_equipment_loan_comments.sql'],
            },
        ],
    },
    {
        id: 'loan-handover',
        label: 'Entrega / devolución de préstamo',
        route: '/loans/handover',
        tables: [
            {
                table: 'equipment_loans',
                requiredColumns: [
                    'pending_physical_condition',
                    'pending_battery_level',
                    'pending_observations',
                ],
                migrations: ['migration_2026-04-28_11-32-00_add_pending_checklist_to_equipment_loans.sql'],
            },
            {
                table: 'equipment_loan_checklists',
                requiredColumns: ['loan_item_id', 'checklist_type'],
                migrations: ['migration_2026-04-28_09-45-00_create_equipment_loans.sql'],
            },
        ],
    },
    {
        id: 'create-equipment',
        label: 'Nuevo equipo',
        route: '/equipment/create',
        tables: [
            {
                table: 'equipment',
                requiredColumns: [
                    'name',
                    'type_id',
                    'status',
                    'serial_number',
                    'assigned_to_user_id',
                ],
                migrations: [
                    'migration_2026-02-24_20-38-56_add_equipment_types.sql',
                    'migration_2026-02-24_20-38-56_add_equipment.sql',
                ],
            },
        ],
    },
    {
        id: 'create-consumable',
        label: 'Nuevo consumible',
        route: '/consumables/create',
        tables: [
            {
                table: 'consumables',
                requiredColumns: [
                    'name',
                    'type_id',
                    'unit',
                    'quantity',
                    'minimum_quantity',
                    'status',
                ],
                migrations: ['migration_2026-02-25_21-00-00_add_consumables.sql'],
            },
        ],
    },
    {
        id: 'create-tool',
        label: 'Nueva herramienta',
        route: '/tools/create',
        tables: [
            {
                table: 'tools',
                requiredColumns: [
                    'name',
                    'code',
                    'type_id',
                    'status',
                    'tool_condition',
                ],
                migrations: ['migration_2026-02-25_21-20-00_add_tools.sql'],
            },
        ],
    },
    {
        id: 'frequent-issues',
        label: 'Fallas frecuentes (admin)',
        route: '/admin/frequent-issues',
        tables: [
            {
                table: 'frequent_issues',
                requiredColumns: [
                    'title',
                    'symptoms',
                    'possible_solution',
                    'category_id',
                    'active',
                ],
                migrations: ['migration_2026-03-26_12-00-00_add_frequent_issues.sql'],
            },
        ],
    },
];

export function getFormById(formId) {
    if (!formId) return null;
    return FORM_SCHEMA_CHECKS.find((f) => f.id === formId) ?? null;
}

export function listFormIds() {
    return FORM_SCHEMA_CHECKS.map((f) => f.id);
}
