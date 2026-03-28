# Instrucciones para Configurar en DigitalOcean

## Opción 1: Usar archivo `.do/app.yaml` (RECOMENDADO)

1. **Deja el campo "Source directories" VACÍO**
2. DigitalOcean detectará automáticamente el archivo `.do/app.yaml` en la raíz
3. Ese archivo ya tiene configurados:
   - Backend: `app/app/backend`
   - Frontend: `app/app/frontend`

## Opción 2: Configuración Manual

Si DigitalOcean no detecta el `.do/app.yaml`, configura manualmente:

### Para el Backend:
- **Source directory**: `app/app/backend`
- **Build command**: `pip install -r requirements.txt`
- **Run command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- **HTTP Port**: `8080`

### Para el Frontend:
- **Source directory**: `app/app/frontend`
- **Build command**: `npm install && npm run build`
- **Run command**: `npm run preview -- --host 0.0.0.0 --port $PORT`
- **HTTP Port**: `4173`

## ⚠️ IMPORTANTE

**NO pongas** `app/app/likenew` - ese directorio no existe.

Los directorios correctos son:
- ✅ `app/app/backend` (para el backend Python)
- ✅ `app/app/frontend` (para el frontend React/Vite)

## Estructura del Repositorio

```
likenew/
├── .do/
│   └── app.yaml          ← DigitalOcean lee esto automáticamente
├── app/
│   └── app/
│       ├── backend/      ← Código Python/FastAPI
│       └── frontend/     ← Código React/Vite
└── ...
```

## Pasos en DigitalOcean

1. Selecciona GitHub como fuente
2. Repositorio: `Robertlin24/likenew`
3. Branch: `main`
4. **Source directories**: **DEJAR VACÍO** (si usas app.yaml)
5. Marca "Autodeploy"
6. Click "Next"
7. DigitalOcean detectará automáticamente los 2 componentes (backend y frontend)
