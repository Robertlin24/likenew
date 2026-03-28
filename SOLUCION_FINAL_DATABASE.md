# Error de contraseña / conexión a la base (LikeNew)

## Producción: DigitalOcean Managed PostgreSQL

Si ves `InvalidPasswordError` o fallos al arrancar el backend, la causa habitual es que **`DATABASE_URL` no coincide** con usuario/contraseña/host de tu cluster en DigitalOcean.

### 1. Obtener la URI en DigitalOcean

1. [DigitalOcean → Databases](https://cloud.digitalocean.com/databases) → tu cluster PostgreSQL.
2. **Connection details** (red pública o la que uses con App Platform).
3. Usuario suele ser **`doadmin`**, puerto **`25060`**, base **`defaultdb`**.
4. Monta una sola línea (o copia la que ofrece el panel):

   `postgresql://doadmin:TU_PASSWORD@TU_HOST:25060/defaultdb?sslmode=require`

5. Si la contraseña tiene caracteres especiales (`@`, `#`, `%`, etc.), [codifícala en URL](https://docs.python.org/3/library/urllib.parse.html#urllib.parse.quote) solo en la parte de la contraseña.

### 2. Ponerla en App Platform

1. App → componente **backend** → **Environment** → **`DATABASE_URL`** (SECRET).
2. Una línea, sin comillas ni saltos de línea.
3. **Save** → **Redeploy** del backend.

### 3. Red y SSL

- En el cluster: **Network Access** / fuentes confiables: permite conexiones desde **App Platform** (o la opción equivalente).
- El backend ya adapta `sslmode` para **asyncpg**; puedes dejar `?sslmode=require` en la URI.

### Si usas otro proveedor (Neon, Railway, Supabase, etc.)

Cualquier Postgres con URI válida sirve; el mismo campo `DATABASE_URL` y las mismas reglas (una línea, contraseña codificada si hace falta).
