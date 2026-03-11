# Entregables - Despliegue LikeNew en DigitalOcean

## URLs públicas (rellenar tras el deploy)

| Componente | URL | Estado |
|------------|-----|--------|
| **Backend** | `https://[tu-backend].ondigitalocean.app` | Pendiente |
| **Frontend** | `https://[tu-frontend].ondigitalocean.app` | Pendiente |

## Variables de entorno configuradas

### Backend
- [ ] `DATABASE_URL` – URL de Supabase (Connection Pooler, puerto 6543)
- [ ] `ENVIRONMENT` = `prod`

### Frontend (build time)
- [ ] `VITE_API_BASE_URL` – URL del backend (ej: `https://backend-xxxxx.ondigitalocean.app`)

## Checklist de verificación post-deploy

Ver comandos detallados en **[VERIFICACION.md](VERIFICACION.md)**.

- [ ] **Backend health**: `GET https://[backend-url]/health` → `{"status":"healthy"}`
- [ ] **Database health**: `GET https://[backend-url]/database/health` → `{"status":"healthy"}`
- [ ] **Frontend**: carga correctamente en el navegador
- [ ] **Login**: inicio de sesión funciona
- [ ] **Crear cita**: crear una cita desde el frontend
- [ ] **Admin**: la cita aparece en el panel admin
- [ ] **Horarios**: validar visualización y gestión de horarios
- [ ] **Cancelaciones**: probar cancelar desde frontend y admin
