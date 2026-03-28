# Verificar contraseña y URI de PostgreSQL (LikeNew)

LikeNew en producción usa **PostgreSQL en DigitalOcean** (`DATABASE_URL`). Si el error dice *password authentication failed*, la contraseña en la URI no es la del usuario de la base.

## DigitalOcean Managed Database (lo habitual)

1. **Databases** → tu cluster → **Users & Databases**.
2. Usuario **`doadmin`** → **show** / reset de contraseña si no la tienes.
3. **Overview** → **Connection details** → copia host, puerto, base y monta:

   `postgresql://doadmin:CONTRASEÑA@HOST:25060/defaultdb?sslmode=require`

4. Pega eso en **App Platform → backend → `DATABASE_URL`** y redespliega.

## Solo si tu base está en Supabase (opcional)

1. [supabase.com](https://supabase.com) → tu proyecto → **Settings → Database**.
2. **Database password** o **Reset**; copia la URI de **Connection pooling** si usas pooler.
3. Misma regla: una sola línea en `DATABASE_URL`.

## Formato

- Sin comillas alrededor de toda la cadena.
- Sin espacios al inicio o al final.
- Contraseña con símbolos conflictivos → codificar en URL.
