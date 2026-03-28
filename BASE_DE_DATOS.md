# Base de datos de LikeNew

**En producción LikeNew está pensado para PostgreSQL gestionado en DigitalOcean** (Managed Database), no para Supabase.

- Configuración oficial del despliegue: **[DEPLOY_DIGITALOCEAN.md](DEPLOY_DIGITALOCEAN.md)**  
- Variable de entorno: **`DATABASE_URL`** en el componente **backend** de App Platform (típicamente `doadmin`, puerto `25060`, base `defaultdb`, `?sslmode=require`). El código convierte `sslmode` para **asyncpg** automáticamente.

Los archivos que mencionan **Supabase** (`SUPABASE_SETUP.md`, `test_supabase_connection.py`, notas antiguas) son **históricos u opcionales**: cualquier Postgres compatible sirve si la `DATABASE_URL` es correcta.
