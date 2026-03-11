# Verificación post-deploy - LikeNew

## Comandos de verificación

Reemplaza `[BACKEND_URL]` por la URL real del backend (ej: `https://backend-xxxxx.ondigitalocean.app`).

### Health del backend
```bash
curl https://[BACKEND_URL]/health
```
**Esperado**: `{"status":"healthy"}`

### Health de la base de datos
```bash
curl https://[BACKEND_URL]/database/health
```
**Esperado**: `{"status":"healthy","service":"database"}` (o "unhealthy" si hay problemas de conexión)

### Root del backend
```bash
curl https://[BACKEND_URL]/
```
**Esperado**: `{"message":"FastAPI Modular Template is running"}`

## Checklist funcional (manual)

1. **Login**: Iniciar sesión en el frontend
2. **Crear cita**: Crear una cita desde el formulario público
3. **Admin**: Entrar al panel admin y confirmar que la cita aparece
4. **Horarios**: Validar que los horarios se muestran y se pueden gestionar
5. **Cancelaciones**: Probar cancelar cita desde frontend y desde admin
