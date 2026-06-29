import { query } from '../config/database.js';

export const TICKET_REOPEN_WINDOW_HOURS_KEY = 'ticket_reopen_window_hours';
export const DEFAULT_TICKET_REOPEN_WINDOW_HOURS = 48;
export const MIN_TICKET_REOPEN_WINDOW_HOURS = 1;
export const MAX_TICKET_REOPEN_WINDOW_HOURS = 720;

class SystemSetting {
    /**
     * Obtiene el valor textual de un ajuste del sistema por clave.
     */
    static async get(key) {
        const rows = await query(
            'SELECT setting_value FROM system_settings WHERE setting_key = ? LIMIT 1',
            [key]
        );
        return rows[0]?.setting_value ?? null;
    }

    /**
     * Obtiene un ajuste numérico entero con valor por defecto si no existe o es inválido.
     */
    static async getInt(key, defaultValue) {
        const raw = await this.get(key);
        if (raw === null || raw === undefined || raw === '') {
            return defaultValue;
        }
        const parsed = parseInt(raw, 10);
        return Number.isNaN(parsed) ? defaultValue : parsed;
    }

    /**
     * Crea o actualiza un ajuste del sistema.
     */
    static async set(key, value, description = null) {
        const sql = `
            INSERT INTO system_settings (setting_key, setting_value, description)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE
                setting_value = VALUES(setting_value),
                description = COALESCE(VALUES(description), description)
        `;
        await query(sql, [key, String(value), description]);
        return this.get(key);
    }
}

export default SystemSetting;
