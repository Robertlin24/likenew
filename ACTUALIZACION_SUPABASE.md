# Actualización de Credenciales de Supabase

## ⚠️ IMPORTANTE: Credenciales Nuevas

Este proyecto ahora usa un **nuevo proyecto de Supabase** porque el anterior ya tenía 2 bases de datos (límite por proyecto).

## Nueva Configuración

### Credenciales del Nuevo Proyecto Supabase:
- **Project Ref**: `xeylqfkatbuedzpadbej`
- **Password**: `eK4ZICNj12xGnzqg`
- **Connection URL**: 
  ```
  postgresql://postgres.xeylqfkatbuedzpadbej:eK4ZICNj12xGnzqg@aws-1-us-east-1.pooler.supabase.com:6543/postgres
  ```

## Configuración Local

1. Copia `.env.example` a `.env` en `app/app/backend/`
2. Reemplaza `[PROJECT_REF]` y `[YOUR_PASSWORD]` con las credenciales de arriba

## Configuración en DigitalOcean

**IMPORTANTE**: Las credenciales deben configurarse como **variable secreta** en DigitalOcean:

1. Ve a tu App en DigitalOcean
2. Settings → Environment Variables
3. Agrega/actualiza `DATABASE_URL` con el valor completo de arriba
4. Marca como **SECRET** (no visible en logs)

## Verificación

Ejecuta el script de verificación:
```bash
python test_supabase_connection.py
```

## Seguridad

- ✅ El archivo `.env` está en `.gitignore` y **NO** se sube al repositorio
- ✅ Las credenciales solo deben estar en:
  - Archivo `.env` local (para desarrollo)
  - Variables de entorno en DigitalOcean (para producción)
- ❌ **NUNCA** subas credenciales al código fuente
