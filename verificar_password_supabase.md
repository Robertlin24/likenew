# Verificación de Contraseña en Supabase

## El error persiste: "password authentication failed"

Esto significa que la contraseña en `DATABASE_URL` no coincide con la contraseña real de tu proyecto Supabase.

## Pasos para Verificar/Resetear la Contraseña

### Opción 1: Verificar la Contraseña Actual

1. Ve a [supabase.com](https://supabase.com)
2. Inicia sesión
3. Selecciona tu proyecto en Supabase
4. Ve a **Project Settings** (icono de engranaje)
5. Click en **Database** en el menú lateral
6. Busca la sección **Database Password**
7. Si puedes verla o la acabas de resetear, úsala en `DATABASE_URL`
8. Si es diferente, esa es la contraseña correcta que debes usar

### Opción 2: Resetear la Contraseña

Si no recuerdas la contraseña o quieres cambiarla:

1. En **Project Settings** → **Database**
2. Busca **Database Password**
3. Click en **Reset Database Password** o **Change Password**
4. Genera una nueva contraseña (guárdala bien)
5. Actualiza `DATABASE_URL` en DigitalOcean con la nueva contraseña

### Opción 3: Obtener la URL Completa desde Supabase

1. En **Project Settings** → **Database**
2. Ve a la sección **Connection string**
3. Selecciona **URI** (no Session)
4. Selecciona **Connection pooling** → **Transaction** (puerto 6543)
5. Copia la URL completa que aparece
6. Reemplaza `[YOUR-PASSWORD]` con tu contraseña real
7. Usa esa URL completa en DigitalOcean

## Formato Correcto

La URL debe verse así:
```
postgresql://postgres.TU_REF:TU_CONTRASEÑA@HOST_POOLER:6543/postgres
```

## Después de Corregir

1. Actualiza `DATABASE_URL` en DigitalOcean con la contraseña correcta
2. Guarda los cambios
3. Force Rebuild and Deploy
4. Espera 2-3 minutos
5. Verifica que el backend inicie correctamente
