const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

/**
 * Verifica un token de Cloudflare Turnstile contra la API de siteverify.
 * @param {string} token - Token generado por el widget Turnstile en el cliente.
 * @param {string|undefined} remoteIp - IP del cliente para validación adicional.
 * @returns {Promise<{ success: boolean; 'error-codes'?: string[] }>}
 */
export async function verifyTurnstileToken(token, remoteIp) {
    const secret = process.env.TURNSTILE_SECRET_KEY;

    if (!secret) {
        throw new Error('TURNSTILE_SECRET_KEY no configurada');
    }

    const formData = new URLSearchParams();
    formData.append('secret', secret);
    formData.append('response', token);

    if (remoteIp) {
        formData.append('remoteip', remoteIp);
    }

    const response = await fetch(TURNSTILE_VERIFY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
    });

    if (!response.ok) {
        throw new Error(`Turnstile API respondió con estado ${response.status}`);
    }

    return response.json();
}
