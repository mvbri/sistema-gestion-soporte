import SystemSetting, {
    DEFAULT_TICKET_REOPEN_WINDOW_HOURS,
    MAX_TICKET_REOPEN_WINDOW_HOURS,
    MIN_TICKET_REOPEN_WINDOW_HOURS,
    TICKET_REOPEN_WINDOW_HOURS_KEY
} from '../models/SystemSetting.js';

export {
    MIN_TICKET_REOPEN_WINDOW_HOURS,
    MAX_TICKET_REOPEN_WINDOW_HOURS,
    DEFAULT_TICKET_REOPEN_WINDOW_HOURS
} from '../models/SystemSetting.js';

/**
 * Obtiene las horas configuradas para la ventana de reapertura de tickets resueltos.
 */
export async function getTicketReopenWindowHours() {
    const hours = await SystemSetting.getInt(
        TICKET_REOPEN_WINDOW_HOURS_KEY,
        DEFAULT_TICKET_REOPEN_WINDOW_HOURS
    );
    return clampReopenWindowHours(hours);
}

/**
 * Valida y acota el valor de horas permitido para la ventana de reapertura.
 */
export function clampReopenWindowHours(hours) {
    const parsed = typeof hours === 'number' ? hours : parseInt(hours, 10);
    if (Number.isNaN(parsed)) {
        return DEFAULT_TICKET_REOPEN_WINDOW_HOURS;
    }
    return Math.min(MAX_TICKET_REOPEN_WINDOW_HOURS, Math.max(MIN_TICKET_REOPEN_WINDOW_HOURS, parsed));
}

/**
 * Calcula metadatos de la ventana de reapertura a partir de resolved_at.
 */
export function computeReopenWindowInfo(resolvedAt, windowHours) {
    const hours = clampReopenWindowHours(windowHours);

    if (!resolvedAt) {
        return {
            reopen_window_hours: hours,
            reopen_window_expires_at: null,
            is_within_reopen_window: false,
            reopen_window_remaining_hours: 0
        };
    }

    const resolvedDate = new Date(resolvedAt);
    if (Number.isNaN(resolvedDate.getTime())) {
        return {
            reopen_window_hours: hours,
            reopen_window_expires_at: null,
            is_within_reopen_window: false,
            reopen_window_remaining_hours: 0
        };
    }

    const expiresAt = new Date(resolvedDate.getTime() + hours * 60 * 60 * 1000);
    const now = Date.now();
    const isWithin = now < expiresAt.getTime();
    const remainingMs = Math.max(0, expiresAt.getTime() - now);

    return {
        reopen_window_hours: hours,
        reopen_window_expires_at: expiresAt.toISOString(),
        is_within_reopen_window: isWithin,
        reopen_window_remaining_hours: isWithin ? Math.ceil(remainingMs / (60 * 60 * 1000)) : 0
    };
}

/**
 * Enriquece un ticket resuelto con datos de la ventana de reapertura.
 */
export async function enrichTicketWithReopenInfo(ticket, windowHours = null) {
    if (!ticket || ticket.state_id !== 4) {
        return ticket;
    }

    const hours = windowHours ?? await getTicketReopenWindowHours();
    return {
        ...ticket,
        ...computeReopenWindowInfo(ticket.resolved_at, hours)
    };
}

/**
 * Enriquece una lista de tickets resueltos reutilizando una sola lectura de configuración.
 */
export async function enrichTicketsWithReopenInfo(tickets) {
    if (!Array.isArray(tickets) || tickets.length === 0) {
        return tickets;
    }

    const windowHours = await getTicketReopenWindowHours();
    return tickets.map((ticket) => {
        if (ticket.state_id !== 4) {
            return ticket;
        }
        return {
            ...ticket,
            ...computeReopenWindowInfo(ticket.resolved_at, windowHours)
        };
    });
}

/**
 * Persiste la duración de la ventana de reapertura (solo administrador).
 */
export async function updateTicketReopenWindowHours(hours) {
    const clamped = clampReopenWindowHours(hours);
    await SystemSetting.set(
        TICKET_REOPEN_WINDOW_HOURS_KEY,
        clamped,
        'Hours after resolution during which the ticket creator can request reopening'
    );
    return clamped;
}

/**
 * Valida si el usuario puede reabrir un ticket resuelto (solo botón explícito, no por comentario).
 */
export async function validateTicketReopenRequest(ticket, { role, userId }, reason) {
    if (!ticket) {
        return { ok: false, message: 'Ticket no encontrado', status: 404 };
    }

    if (ticket.state_id !== 4) {
        return {
            ok: false,
            message: 'Solo se pueden reabrir tickets en estado Resuelto',
            status: 400
        };
    }

    if (role === 'end_user') {
        if (ticket.created_by_user_id !== userId) {
            return {
                ok: false,
                message: 'Solo puedes reabrir tickets que creaste',
                status: 403
            };
        }

        const windowHours = await getTicketReopenWindowHours();
        const windowInfo = computeReopenWindowInfo(ticket.resolved_at, windowHours);
        if (!windowInfo.is_within_reopen_window) {
            return {
                ok: false,
                message: 'La ventana de reapertura ha expirado',
                status: 400
            };
        }

        const trimmedReason = reason?.trim() || '';
        if (trimmedReason.length < 5) {
            return {
                ok: false,
                message: 'Debes indicar un motivo de al menos 5 caracteres',
                status: 400
            };
        }
    } else if (role === 'administrator') {
        if (reason?.trim() && reason.trim().length < 5) {
            return {
                ok: false,
                message: 'El motivo debe tener al menos 5 caracteres',
                status: 400
            };
        }
    } else {
        return {
            ok: false,
            message: 'No tienes permiso para reabrir este ticket',
            status: 403
        };
    }

    return { ok: true };
}
