## Despliegue a producción (Vercel + nube, Venezuela)

Arquitectura gratuita sin servidor propio:

- **Frontend:** [Vercel](https://vercel.com) — [`deploy/vercel.md`](deploy/vercel.md)
- **Backend:** [Render](https://render.com) — [`deploy/render.md`](deploy/render.md)
- **BD:** [TiDB Cloud](https://tidbcloud.com) — [`deploy/tidb.md`](deploy/tidb.md)
- **Email:** SendGrid API en producción (`EMAIL_PROVIDER=sendgrid`); Gmail SMTP (nodemailer) en desarrollo local
- **Imágenes:** Cloudinary en producción (`UPLOAD_PROVIDER=cloudinary`); disco local en desarrollo

Guía completa de despliegue: [`deploy/README.md`](deploy/README.md). Decisiones de arquitectura: [`deploy/HOSTING.md`](deploy/HOSTING.md).

```bash
# Variables: server/.env.production.example
cd server && npm run deploy:prepare

# Verificar API desplegada
API_URL=https://tu-api.onrender.com npm run deploy:verify
```

Vercel: configurar `VITE_API_URL=https://tu-api.onrender.com/api`.
