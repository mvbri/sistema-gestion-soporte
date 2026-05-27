/**
 * Orígenes permitidos para CORS (Vercel producción + previews).
 */
export function getCorsOrigins() {
    const raw = [
        process.env.FRONTEND_URL,
        process.env.CORS_ORIGINS,
    ]
        .filter(Boolean)
        .join(',');

    const origins = raw
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean);

    if (origins.length === 0) {
        return ['http://localhost:5173'];
    }

    return [...new Set(origins)];
}

export function createCorsOriginValidator(allowedOrigins) {
    return (origin, callback) => {
        if (!origin) {
            callback(null, true);
            return;
        }

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
            return;
        }

        const vercelPreviewPattern = /^https:\/\/[a-z0-9-]+\.vercel\.app$/i;
        const allowVercelPreviews = process.env.CORS_ALLOW_VERCEL_PREVIEWS === 'true';

        if (allowVercelPreviews && vercelPreviewPattern.test(origin)) {
            callback(null, true);
            return;
        }

        callback(null, false);
    };
}
