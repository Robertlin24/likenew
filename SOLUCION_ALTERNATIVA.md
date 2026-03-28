# Solución Alternativa: Variable en Component-Level

## El Problema

Si resetear la contraseña varias veces no funciona, el problema NO es la contraseña sino cómo DigitalOcean está leyendo la variable.

## Solución: Agregar DATABASE_URL en el Component Backend

En lugar de App-Level, agreguemos la variable directamente en el componente del backend:

### Paso 1: Ir al Component Backend

1. Ve a **Components** → Click en **`likenew-app-app-backend`**
2. Ve a **Settings** del componente (no App-Level)
3. Busca **"Environment Variables"** del componente

### Paso 2: Agregar Variable en Component-Level

1. Click en **"+ Add environment variable"** (del componente, no app-level)
2. Agrega:
   - **Key**: `DATABASE_URL`
   - **Value**: tu URI completa de Postgres (ej. DigitalOcean Managed DB o Supabase), sin pegar secretos en el repo
   - **Scope**: **Run and build time**
3. **Save**

### Paso 3: Verificar que NO esté en App-Level

1. Ve a **Settings** (App-Level)
2. Ve a **App-Level Environment Variables**
3. Si `DATABASE_URL` está ahí, **BÓRRALA** (solo déjala en component-level)
4. Esto evita conflictos

### Paso 4: Redesplegar

1. **Force Rebuild and Deploy**
2. Espera 2-3 minutos
3. Revisa los logs

## Alternativa 2: Verificar los Logs

Antes de redesplegar, agrega logging temporal para ver qué está recibiendo:

El código ya tiene logging en línea 43 de `database.py`:
```python
logger.info("DATABASE_URL len=%s preview=%s", len(raw_url or ""), (_masked or "")[:90])
```

Revisa los logs en DigitalOcean para ver:
- Si `DATABASE_URL` tiene valor
- Cuál es la longitud
- El preview (enmascarado)

## Alternativa 3: Probar con URL Codificada

Si la contraseña tiene caracteres especiales, prueba codificarla:

1. Ve a [urlencoder.org](https://www.urlencoder.org/)
2. Codifica solo la parte de la contraseña si tiene `@`, `#`, `%`, etc.
3. Reemplaza la contraseña en la URL con la versión codificada

## Verificación Final

Después de agregar en component-level:

1. Ve a **Runtime Logs** en DigitalOcean
2. Busca el mensaje: `"DATABASE_URL len=..."`
3. Verifica que tenga un valor (no 0)
4. Si sigue fallando, comparte ese log
