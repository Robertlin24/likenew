# Despliegue LikeNew en DigitalOcean App Platform

## 1. Base de datos (Supabase)

Ver guía detallada en **[SUPABASE_SETUP.md](SUPABASE_SETUP.md)**.

1. Ve a [supabase.com](https://supabase.com) y crea un proyecto.
2. En **Project Settings > Database** obtén la cadena de conexión.
3. Usa **Connection pooling** (Transaction, puerto 6543).
4. Formato: `postgresql://postgres.[ref]:[PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres`
5. El backend usa `DATABASE_URL` y lo normaliza a `postgresql+asyncpg`.

## 2. DigitalOcean App Platform

1. Ve a [cloud.digitalocean.com/apps](https://cloud.digitalocean.com/apps).
2. **Create App** > **GitHub** y conecta tu repositorio LikeNew.
3. Si usas `.do/app.yaml`:
   - Edita `.do/app.yaml` y reemplaza `TU_OWNER/TU_REPO` por tu repo (ej: `usuario/likenew`).
   - Si backend y frontend están en la raíz, usa `source_dir: backend` y `source_dir: frontend`.
4. Si configuras manualmente, crea dos componentes:

### Backend (FastAPI)
- **Source**: directorio `app/app/backend` (o `backend` si está en raíz)
- **Environment**: Python
- **Build**: `pip install -r requirements.txt`
- **Run**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- **HTTP Port**: 8080

### Frontend (Vite)
- **Source**: directorio `app/app/frontend` (o `frontend` si está en raíz)
- **Environment**: Node.js
- **Build**: `npm install && npm run build`
- **Run**: `npm run preview -- --host 0.0.0.0 --port $PORT`
- **HTTP Port**: 4173

## 3. Variables de entorno

### Backend
| Variable       | Valor                       | Tipo   |
|----------------|-----------------------------|--------|
| DATABASE_URL   | URL de Supabase (pooler)    | SECRET |
| ENVIRONMENT    | prod                        | GENERAL |

### Frontend (build time)
| Variable         | Valor                     |
|------------------|---------------------------|
| VITE_API_BASE_URL | URL del backend tras deploy |

**Importante**: Despliega primero el backend, obtén su URL pública (ej: `https://backend-xxx.ondigitalocean.app`) y configura `VITE_API_BASE_URL` en el frontend antes de su build.

## 4. Verificación

### Checklist de verificación

- [ ] **Backend health**: `GET https://[tu-backend].ondigitalocean.app/health` → `{"status":"healthy"}`
- [ ] **Frontend**: Abrir la URL del frontend en el navegador
- [ ] **Login**: Probar inicio de sesión
- [ ] **Crear cita**: Crear una cita desde el frontend
- [ ] **Admin**: Confirmar que la cita aparece en el panel admin
- [ ] **Horarios**: Validar visualización y gestión de horarios
- [ ] **Cancelaciones**: Probar cancelar desde frontend y admin

### Comandos de verificación

```bash
# Health del backend
curl https://[tu-backend-url]/health

# Health de la base de datos
curl https://[tu-backend-url]/database/health
```

## Entregables

Rellena **[ENTREGABLES.md](ENTREGABLES.md)** tras el deploy con:

- URL pública del frontend
- URL pública del backend
- Variables de entorno configuradas en DigitalOcean
