import { tableExists, fetchTableColumns } from './dbSchemaUtils.js';

async function columnExists(conn, table, column) {
    const cols = await fetchTableColumns(conn, table);
    return cols.has(column);
}

export async function applyMaterialRequestFixes(conn, log = console.log) {
    if (!(await tableExists(conn, 'material_requests'))) {
        log('SKIP material_requests: tabla no existe (ejecuta migración create_material_requests)');
        return;
    }

    if (
        (await columnExists(conn, 'material_requests', 'request_area')) &&
        !(await columnExists(conn, 'material_requests', 'addressee_addressing_text'))
    ) {
        await conn.query(
            `ALTER TABLE material_requests
             CHANGE COLUMN request_area addressee_addressing_text TEXT NOT NULL`
        );
        log('OK material_requests: request_area → addressee_addressing_text');
    } else if (await columnExists(conn, 'material_requests', 'addressee_addressing_text')) {
        log('SKIP material_requests: addressee_addressing_text ya existe');
    }

    if (await columnExists(conn, 'material_requests', 'addressed_to')) {
        await conn.query('ALTER TABLE material_requests DROP COLUMN addressed_to');
        log('OK material_requests: eliminada addressed_to');
    }

    if (
        !(await columnExists(conn, 'material_requests', 'addressee_name')) &&
        (await columnExists(conn, 'material_requests', 'addressed_to'))
    ) {
        log(
            'WARN material_requests: faltan addressee_name/title; ejecuta migration_2026-04-29_19-15-00_add_addressee_name_and_title.sql'
        );
    }
}

export async function applyMaterialRequestItemsFixes(conn, log = console.log) {
    if (!(await tableExists(conn, 'material_request_items'))) return;

    if (!(await columnExists(conn, 'material_request_items', 'source_mode'))) {
        await conn.query(`
            ALTER TABLE material_request_items
            ADD COLUMN source_mode ENUM('catalog', 'manual') NOT NULL DEFAULT 'catalog' AFTER material_type,
            ADD COLUMN custom_material_name VARCHAR(255) NULL AFTER reference_id,
            ADD COLUMN custom_material_description TEXT NULL AFTER custom_material_name
        `);
        log('OK material_request_items: columnas manual (source_mode, custom_*)');
    } else {
        log('SKIP material_request_items: source_mode ya existe');
    }
}

export async function applyEquipmentLoanFixes(conn, log = console.log) {
    if (!(await tableExists(conn, 'equipment_loans'))) {
        log('SKIP equipment_loans: tabla no existe (ejecuta migration_2026-04-28_09-45-00_create_equipment_loans.sql)');
        return;
    }

    if (!(await columnExists(conn, 'equipment_loans', 'target_incident_area_id'))) {
        await conn.query(`
            ALTER TABLE equipment_loans
            ADD COLUMN target_incident_area_id INT NULL AFTER requester_user_id,
            ADD INDEX idx_equipment_loans_target_incident_area (target_incident_area_id),
            ADD CONSTRAINT fk_equipment_loans_target_incident_area
                FOREIGN KEY (target_incident_area_id) REFERENCES incident_areas(id) ON DELETE SET NULL
        `);
        log('OK equipment_loans: target_incident_area_id');
    } else {
        log('SKIP equipment_loans: target_incident_area_id ya existe');
    }

    if (!(await columnExists(conn, 'equipment_loans', 'pending_physical_condition'))) {
        await conn.query(`
            ALTER TABLE equipment_loans
            ADD COLUMN pending_physical_condition ENUM('new', 'good', 'worn', 'damaged') NULL AFTER request_notes,
            ADD COLUMN pending_battery_level TINYINT NULL AFTER pending_physical_condition,
            ADD COLUMN pending_observations TEXT NULL AFTER pending_battery_level,
            ADD CONSTRAINT chk_equipment_loans_pending_battery
                CHECK (pending_battery_level IS NULL OR (pending_battery_level >= 0 AND pending_battery_level <= 100))
        `);
        log('OK equipment_loans: columnas pending_* (checklist)');
    } else {
        log('SKIP equipment_loans: pending_physical_condition ya existe');
    }
}

export async function applyUsersSecurityFixes(conn, log = console.log) {
    if (!(await tableExists(conn, 'users'))) return;

    const pairs = [
        ['security_question_1', 'VARCHAR(255) NULL'],
        ['security_answer_1', 'VARCHAR(255) NULL'],
        ['security_question_2', 'VARCHAR(255) NULL'],
        ['security_answer_2', 'VARCHAR(255) NULL'],
    ];

    let added = 0;
    for (const [name, def] of pairs) {
        if (!(await columnExists(conn, 'users', name))) {
            await conn.query(`ALTER TABLE users ADD COLUMN ${name} ${def}`);
            log(`OK users: columna ${name}`);
            added++;
        }
    }
    if (added === 0) {
        log('SKIP users: columnas de preguntas de seguridad ya existen');
    }
}

export async function applyAllKnownFixes(conn, log = console.log) {
    log('Aplicando correcciones automáticas de esquema conocidas...\n');
    await applyUsersSecurityFixes(conn, log);
    await applyMaterialRequestFixes(conn, log);
    await applyMaterialRequestItemsFixes(conn, log);
    await applyEquipmentLoanFixes(conn, log);
    log('\nListo. Vuelve a ejecutar: node scripts/check-db-schema.js');
}
