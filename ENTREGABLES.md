# Entregables - Despliegue LikeNew en DigitalOcean

## URLs públicas (rellenar tras el deploy)

| Componente | URL | Estado |
|------------|-----|--------|
| **Backend** | `https://[tu-backend].ondigitalocean.app` | Pendiente |
| **Frontend** | `https://[tu-frontend].ondigitalocean.app` | Pendiente |

## Variables de entorno configuradas

### Backend
- [ ] `DATABASE_URL` – URI PostgreSQL (en producción: **DigitalOcean Managed DB**, p. ej. puerto `25060`)
- [ ] `ENVIRONMENT` = `prod`

### Frontend (build time)
- [ ] Con **ingress** en `.do/app.yaml` suele **no** hacer falta `VITE_API_BASE_URL`. Solo si el front llama a otro dominio para la API.

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
