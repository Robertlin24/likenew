# Despliegue LikeNew en DigitalOcean App Platform

> **LikeNew usa PostgreSQL en DigitalOcean (Managed Database).** No hace falta Supabase. Resumen: [BASE_DE_DATOS.md](BASE_DE_DATOS.md).

## 1. Base de datos (recomendado: PostgreSQL en DigitalOcean)

1. En [DigitalOcean](https://cloud.digitalocean.com/databases) crea un **Managed Database** → **PostgreSQL** (misma región que la App si puedes).
2. Tras el aprovisionamiento, abre el cluster → **Connection details**.
3. Copia la **Connection string** (modo **Public network** o **VPC** según cómo despliegues la App; la App Platform suele usar red pública o Peering según tu configuración).
4. El usuario suele ser `doadmin`, el puerto típico **25060**, y la URL incluye `?sslmode=require`.
5. Formato habitual: `postgresql://doadmin:[PASSWORD]@[HOST]:25060/defaultdb?sslmode=require`
6. El backend usa `DATABASE_URL` y lo normaliza a `postgresql+asyncpg`.

**Otro proveedor:** Cualquier PostgreSQL con URI `postgresql://` válida sirve; misma variable `DATABASE_URL` en el backend. Guía opcional solo si usas Supabase: [SUPABASE_SETUP.md](SUPABASE_SETUP.md).

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
| DATABASE_URL   | URL PostgreSQL (ej. DO Managed DB o pooler externo) | SECRET |
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
