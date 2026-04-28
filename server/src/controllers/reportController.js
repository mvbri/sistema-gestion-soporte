import Ticket from '../models/Ticket.js';
import { sendError, sendSuccess } from '../utils/responseHandler.js';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function parseLocalDateOnly(value) {
    if (!value || typeof value !== 'string' || !ISO_DATE.test(value)) {
        return null;
    }
    const [y, m, d] = value.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) {
        return null;
    }
    return { y, m, d, value };
}

function daysBetweenInclusive(a, b) {
    const start = new Date(a.y, a.m - 1, a.d);
    const end = new Date(b.y, b.m - 1, b.d);
    return Math.floor((end - start) / (86400000)) + 1;
}

export const getTicketsPeriodReport = async (req, res) => {
    try {
        if (req.user.role !== 'administrator') {
            return sendError(res, 'Solo los administradores pueden ver reportes', null, 403);
        }

        const fromRaw = req.query.date_from ?? req.query.from;
        const toRaw = req.query.date_to ?? req.query.to;

        const today = new Date();
        const defaultTo = {
            y: today.getFullYear(),
            m: today.getMonth() + 1,
            d: today.getDate(),
            value: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
        };
        const defaultFromDate = new Date(today);
        defaultFromDate.setDate(defaultFromDate.getDate() - 29);
        const defaultFrom = {
            y: defaultFromDate.getFullYear(),
            m: defaultFromDate.getMonth() + 1,
            d: defaultFromDate.getDate(),
            value: `${defaultFromDate.getFullYear()}-${String(defaultFromDate.getMonth() + 1).padStart(2, '0')}-${String(defaultFromDate.getDate()).padStart(2, '0')}`
        };

        const parsedFrom = fromRaw ? parseLocalDateOnly(String(fromRaw)) : defaultFrom;
        const parsedTo = toRaw ? parseLocalDateOnly(String(toRaw)) : defaultTo;

        if (!parsedFrom || !parsedTo) {
            return sendError(res, 'Las fechas deben tener formato YYYY-MM-DD', null, 400);
        }

        if (parsedFrom.value > parsedTo.value) {
            return sendError(res, 'La fecha inicial no puede ser posterior a la fecha final', null, 400);
        }

        const span = daysBetweenInclusive(parsedFrom, parsedTo);
        if (span > 366) {
            return sendError(res, 'El rango máximo permitido es de 366 días', null, 400);
        }

        const raw = await Ticket.getPeriodReport(parsedFrom.value, parsedTo.value);

        const porEstado = raw.by_state.map((row) => ({
            estado_id: row.state_id,
            estado_nombre: row.state_name,
            estado_color: row.state_color,
            cantidad: typeof row.count === 'bigint' ? Number(row.count) : row.count || 0
        }));

        const porCategoria = raw.by_category.map((row) => ({
            id: row.id,
            nombre: row.name,
            cantidad: typeof row.count === 'bigint' ? Number(row.count) : row.count || 0
        }));

        const porPrioridad = raw.by_priority.map((row) => ({
            id: row.id,
            nombre: row.name,
            color: row.color,
            cantidad: typeof row.count === 'bigint' ? Number(row.count) : row.count || 0
        }));

        const porArea = raw.by_incident_area.map((row) => ({
            id: row.id,
            nombre: row.name,
            cantidad: typeof row.count === 'bigint' ? Number(row.count) : row.count || 0
        }));

        const cierresPorTecnico = raw.closed_by_technician.map((row) => ({
            tecnico_id: row.technician_user_id,
            tecnico_nombre: row.technician_name,
            cantidad: typeof row.count === 'bigint' ? Number(row.count) : row.count || 0
        }));

        sendSuccess(res, 'Reporte generado correctamente', {
            period: {
                date_from: parsedFrom.value,
                date_to: parsedTo.value
            },
            tickets_creados: raw.tickets_created_total,
            tickets_cerrados: raw.tickets_closed_total,
            promedio_horas_resolucion: raw.avg_resolution_hours,
            porEstado,
            porCategoria,
            porPrioridad,
            porArea,
            cierresPorTecnico
        });
    } catch (error) {
        console.error('Error al generar reporte de tickets:', error);
        sendError(res, 'Error al generar el reporte', null, 500);
    }
};
