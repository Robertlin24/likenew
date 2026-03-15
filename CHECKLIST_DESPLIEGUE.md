# ✅ Checklist de Despliegue - LikeNew

## Estado Actual

- ✅ Supabase configurado (Proyecto #2 - nuevo)
- ✅ Credenciales verificadas localmente
- ✅ `.env` protegido (no en Git)
- ✅ Código listo para desplegar

## Próximos Pasos

### 1. Commit y Push a GitHub

```bash
# Agregar cambios pendientes
git add .

# Commit
git commit -m "Actualizar a nuevo proyecto Supabase y proteger credenciales"

# Push
git push origin main
```

### 2. Configurar en DigitalOcean

#### Paso 1: Crear/Actualizar App
1. Ve a [cloud.digitalocean.com/apps](https://cloud.digitalocean.com/apps)
2. Si ya existe la app "likenew", edítala
3. Si no existe, crea nueva app desde GitHub → `Robertlin24/likenew`

#### Paso 2: Configurar Variables de Entorno

**Backend:**
- Variable: `DATABASE_URL`
- Valor: `postgresql://postgres.xeylqfkatbuedzpadbej:eK4ZICNj12xGnzqg@aws-1-us-east-1.pooler.supabase.com:6543/postgres`
- Tipo: **SECRET** (marca como secreto)
- Scope: RUN_AND_BUILD_TIME

- Variable: `ENVIRONMENT`
- Valor: `prod`
- Tipo: GENERAL

**Frontend (después del primer deploy del backend):**
- Variable: `VITE_API_BASE_URL`
- Valor: URL del backend (ej: `https://backend-xxxxx.ondigitalocean.app`)
- Tipo: GENERAL
- Scope: BUILD_TIME

#### Paso 3: Verificar Configuración
- Backend source: `app/app/backend`
- Frontend source: `app/app/frontend`
- Build commands correctos
- Run commands correctos

### 3. Desplegar

1. Si usas `.do/app.yaml`:
   - DigitalOcean debería detectarlo automáticamente
   - O importa el archivo manualmente

2. Si configuras manualmente:
   - Backend: Python, `pip install -r requirements.txt`, `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Frontend: Node.js, `npm install && npm run build`, `npm run preview -- --host 0.0.0.0 --port $PORT`

3. Click en **Deploy** o **Force Rebuild and Deploy**

### 4. Verificación Post-Deploy

#### Backend Health Check
```bash
curl https://[backend-url]/health
```
**Esperado:** `{"status":"healthy"}`

#### Database Health Check
```bash
curl https://[backend-url]/database/health
```
**Esperado:** `{"status":"healthy","service":"database"}`

#### Frontend
- Abrir URL del frontend en navegador
- Verificar que carga correctamente

#### Funcionalidad
- [ ] Login funciona
- [ ] Crear cita desde frontend
- [ ] Cita aparece en panel admin
- [ ] Horarios se muestran correctamente
- [ ] Cancelaciones funcionan

### 5. Actualizar Entregables

Llenar **[ENTREGABLES.md](ENTREGABLES.md)** con:
- URL pública del backend
- URL pública del frontend
- Confirmar variables configuradas

## Troubleshooting

### Error: "DATABASE_URL not found"
- Verificar que la variable esté configurada en DigitalOcean
- Verificar que esté marcada como SECRET pero disponible en RUN_AND_BUILD_TIME

### Error: "Connection refused" o timeout
- Verificar que la URL de Supabase sea correcta
- Verificar que uses el puerto 6543 (Connection Pooler)
- Verificar que el proyecto Supabase esté activo

### Frontend no se conecta al backend
- Verificar que `VITE_API_BASE_URL` esté configurada
- Verificar que sea la URL correcta del backend
- Verificar que el backend esté desplegado y funcionando

## Contacto y Soporte

Si encuentras problemas:
1. Revisar logs en DigitalOcean (Settings → Runtime Logs)
2. Verificar variables de entorno
3. Verificar que el código esté actualizado en GitHub
