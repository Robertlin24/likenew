# Checklist de despliegue — LikeNew

**Base de datos:** PostgreSQL en **DigitalOcean Managed Database** (ver [BASE_DE_DATOS.md](BASE_DE_DATOS.md)). No es obligatorio usar Supabase.

## Estado recomendado

- [ ] Cluster PostgreSQL creado en DigitalOcean (misma región que la app si es posible)
- [ ] `DATABASE_URL` copiada desde **Connection details** (`doadmin`, puerto `25060`, `defaultdb`, `?sslmode=require`)
- [ ] **Network Access** del cluster permite la App Platform
- [ ] `.env` local en `app/app/backend/` (no en Git) con la misma URI para pruebas
- [ ] Código en `main` en GitHub

## Pasos en DigitalOcean App Platform

### 1. App desde GitHub

1. [Apps](https://cloud.digitalocean.com/apps) → crear o editar app → repo `Robertlin24/likenew` (o el tuyo).
2. Con **`.do/app.yaml`**, DO suele tomar `app/app/backend` y `app/app/frontend` automáticamente.

### 2. Variables del backend

| Variable       | Valor |
|----------------|--------|
| `DATABASE_URL` | URI completa `postgresql://doadmin:...@HOST:25060/defaultdb?sslmode=require` |
| `ENVIRONMENT`  | `prod` |

- `DATABASE_URL` como **SECRET**, scope **Run and build time** (o al menos Run).

### 3. Frontend e ingress

Si usas el **ingress** del `.do/app.yaml` ( `/` → frontend, `/api` → backend ), **no** hace falta `VITE_API_BASE_URL` en el frontend.

### 4. Desplegar

**Deploy** o **Force Rebuild and Deploy** y revisar **Runtime logs** del backend.

## Verificación

- `GET https://TU_DOMINIO/health` → `{"status":"healthy"}`
- Frontend carga y las llamadas a `/api/...` responden

## Si falla la base

- Revisa **Trusted sources** / red del cluster.
- Revisa que `DATABASE_URL` sea **una línea** y la contraseña correcta (o codificada en URL si tiene `@`, `#`, etc.).
- Guía detallada: [DEPLOY_DIGITALOCEAN.md](DEPLOY_DIGITALOCEAN.md), [SOLUCION_FINAL_DATABASE.md](SOLUCION_FINAL_DATABASE.md).
