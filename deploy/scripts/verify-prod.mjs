#!/usr/bin/env node
/**
 * Verifica /api/health y variables críticas de server/.env
 * Uso: API_URL=https://tu-dominio node deploy/scripts/verify-prod.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_DIR = process.env.APP_DIR || path.join(__dirname, '../..');
const SERVER_DIR = path.join(APP_DIR, 'server');
const API_URL = (process.env.API_URL || 'http://127.0.0.1:5000').replace(/\/$/, '');
const HEALTH_URL = `${API_URL}/api/health`;

console.log(`==> Verificando producción: ${HEALTH_URL}`);

let response;
try {
  response = await fetch(HEALTH_URL);
} catch (err) {
  console.error(`ERROR: No se pudo conectar a ${HEALTH_URL}: ${err.message}`);
  process.exit(1);
}

const body = await response.json().catch(() => null);

if (response.status !== 200) {
  console.error(`ERROR: /api/health respondió HTTP ${response.status}`);
  console.error(body);
  process.exit(1);
}

if (!body?.success) {
  console.error('ERROR: success=false en /api/health');
  console.error(body);
  process.exit(1);
}

if (!body.schema?.ready) {
  console.error('ERROR: esquema no listo', body.schema);
  process.exit(1);
}

console.log('OK: API activa, esquema listo');
console.log(`    pendingMigrations: ${body.schema.pendingMigrations?.length ?? 0}`);

function readEnvValue(envText, name) {
  const match = envText.match(new RegExp(`^${name}=(.*)$`, 'm'));
  return match?.[1]?.trim() ?? '';
}

const envPath = path.join(SERVER_DIR, '.env');
if (fs.existsSync(envPath)) {
  const envText = fs.readFileSync(envPath, 'utf8');
  const emailProvider = readEnvValue(envText, 'EMAIL_PROVIDER') || 'smtp';
  const uploadProvider = readEnvValue(envText, 'UPLOAD_PROVIDER') || 'disk';

  const baseVars = ['JWT_SECRET', 'DB_PASSWORD', 'FRONTEND_URL'];
  for (const name of baseVars) {
    const value = readEnvValue(envText, name);
    if (!value || value.includes('CAMBIAR') || value.startsWith('your_')) {
      console.warn(`ADVERTENCIA: Revisar ${name} en server/.env`);
    }
  }

  if (emailProvider === 'sendgrid') {
    for (const name of ['SENDGRID_API_KEY', 'EMAIL_FROM']) {
      const value = readEnvValue(envText, name);
      if (!value || value.includes('CAMBIAR')) {
        console.warn(`ADVERTENCIA: Revisar ${name} (EMAIL_PROVIDER=sendgrid)`);
      } else {
        console.log(`OK: ${name} configurado (SendGrid)`);
      }
    }
  } else {
    console.log('INFO: email local/SMTP (desarrollo)');
  }

  if (uploadProvider === 'cloudinary') {
    const cloudUrl = readEnvValue(envText, 'CLOUDINARY_URL');
    if (!cloudUrl || cloudUrl.includes('CAMBIAR')) {
      console.warn('ADVERTENCIA: Revisar CLOUDINARY_URL (UPLOAD_PROVIDER=cloudinary)');
    } else {
      console.log('OK: CLOUDINARY_URL configurado');
    }
  } else {
    const uploadsDir = path.join(SERVER_DIR, 'uploads');
    if (fs.existsSync(uploadsDir)) {
      console.log('OK: uploads en disco (desarrollo / servidor propio)');
    }
  }

  const turnstileSecret = readEnvValue(envText, 'TURNSTILE_SECRET_KEY');
  const turnstileSiteKey = readEnvValue(envText, 'TURNSTILE_SITE_KEY');
  if (!turnstileSecret || turnstileSecret.includes('CAMBIAR') || turnstileSecret.startsWith('1x')) {
    console.warn('ADVERTENCIA: Revisar TURNSTILE_SECRET_KEY (usar Secret Key real de Cloudflare en producción)');
  } else {
    console.log('OK: TURNSTILE_SECRET_KEY configurado');
  }
  if (!turnstileSiteKey || turnstileSiteKey.includes('CAMBIAR') || turnstileSiteKey.startsWith('1x')) {
    console.warn('ADVERTENCIA: Revisar TURNSTILE_SITE_KEY (Site Key real de Cloudflare en producción)');
  } else {
    console.log('OK: TURNSTILE_SITE_KEY configurado');
  }
}

console.log('');
console.log('Verificación completada. Prueba manual recomendada:');
console.log('  - Registro con widget Turnstile (VITE_TURNSTILE_SITE_KEY en Vercel + redeploy)');
console.log('  - Login y correo de verificación (SendGrid en producción)');
console.log('  - Crear ticket con imagen (Cloudinary en producción)');
console.log('  - Frontend Vercel con VITE_API_URL apuntando al API');
