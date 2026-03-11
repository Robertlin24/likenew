# Configuración de Supabase para LikeNew

## Paso 1: Crear proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) e inicia sesión.
2. Clic en **New Project**.
3. Completa:
   - **Name**: likenew (o el nombre que prefieras)
   - **Database Password**: guarda esta contraseña de forma segura
   - **Region**: selecciona la más cercana a tus usuarios
4. Espera 2-3 minutos a que el proyecto se provisione.

## Paso 2: Obtener DATABASE_URL

1. En tu proyecto Supabase, ve a **Project Settings** (icono engranaje).
2. En el menú lateral, haz clic en **Database**.
3. Baja hasta **Connection string**.
4. Selecciona **URI** y el modo **Connection pooling** (Transaction).
5. Usa el **Connection string** con puerto **6543**.
6. Formato esperado:
   ```
   postgresql://postgres.[PROJECT_REF]:[YOUR_PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```
7. Sustituye `[YOUR_PASSWORD]` por la contraseña de la base de datos que guardaste.

## Paso 3: Usar en el backend

- **Local**: copia la URL en `app/app/backend/.env` como `DATABASE_URL`.
- **DigitalOcean**: añade `DATABASE_URL` como variable secreta en **Settings > App > Environment Variables** del componente backend.

## Verificación

El backend de LikeNew usa `DATABASE_URL` y lo normaliza internamente a `postgresql+asyncpg` para SQLAlchemy. No requiere cambios adicionales en el código.
