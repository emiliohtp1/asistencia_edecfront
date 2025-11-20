# 🚀 Guía para Desplegar Frontend en Render.com

## 📋 Opción 1: Static Site en Render.com (Recomendado)

### Paso 1: Actualizar render.yaml

El archivo `backend/render.yaml` ya está configurado con el frontend. Solo necesitas desplegarlo.

### Paso 2: Desplegar en Render.com

1. Ve a https://dashboard.render.com
2. Haz clic en "New +" → "Blueprint"
3. Conecta tu repositorio de GitHub
4. Render detectará automáticamente el `render.yaml` con ambos servicios
5. Revisa la configuración y haz clic en "Apply"

### Paso 3: Configuración Manual (Si no usas Blueprint)

1. Ve a https://dashboard.render.com
2. Haz clic en "New +" → "Static Site"
3. Conecta tu repositorio de GitHub
4. Configura:
   - **Name**: `asistencia-edec-frontend`
   - **Root Directory**: `frontend/html`
   - **Build Command**: (dejar vacío o `echo "No build needed"`)
   - **Publish Directory**: `.` (punto)

5. Haz clic en "Create Static Site"

### Paso 4: Actualizar la URL de la API

Una vez que tengas la URL del backend (ej: `https://asistencia-edec-api.onrender.com`):

1. Edita `frontend/js/config.js`
2. Actualiza `BASE_URL` con la URL de tu API:

```javascript
const API_CONFIG = {
    BASE_URL: 'https://asistencia-edec-api.onrender.com',  // Tu URL del backend
    ENDPOINTS: {
        USUARIO: '/api/usuarios',
        ASISTENCIA: '/api/asistencias'
    }
};
```

3. Haz commit y push a GitHub
4. Render actualizará automáticamente el frontend

## 📋 Opción 2: Servir desde el Backend (Alternativa)

Si prefieres servir el frontend desde el mismo servidor del backend:

### Modificar backend/app/main.py

```python
from fastapi.staticfiles import StaticFiles

# Al final del archivo, antes de if __name__ == "__main__":
app.mount("/", StaticFiles(directory="../frontend/html", html=True), name="static")
```

**Ventajas:**
- Un solo servicio
- Mismo dominio para frontend y backend
- No hay problemas de CORS

**Desventajas:**
- El backend debe servir archivos estáticos
- Más carga en el servidor

## 🔗 URLs después del despliegue

Después de desplegar, tendrás:

- **Backend API**: `https://asistencia-edec-api.onrender.com`
- **Frontend**: `https://asistencia-edec-frontend.onrender.com`

## ⚙️ Configuración de CORS

Si usas servicios separados, asegúrate de que el backend permita el origen del frontend:

En `backend/app/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://asistencia-edec-frontend.onrender.com",
        "http://localhost:8080"  # Para desarrollo local
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 📝 Estructura de Archivos

Asegúrate de que la estructura sea:

```
frontend/
├── html/
│   └── index.html  (punto de entrada)
├── css/
│   └── styles.css
├── js/
│   ├── config.js
│   ├── api.js
│   └── keyboard.js
└── images/
    └── logo.png
```

## ✅ Verificación

1. Visita la URL del frontend en Render
2. Abre la consola del navegador (F12)
3. Verifica que no haya errores de CORS
4. Prueba ingresar una matrícula y registrar asistencia

## 🐛 Solución de Problemas

### Error 404 en archivos CSS/JS
- Verifica que las rutas en `index.html` sean relativas: `../css/styles.css`
- Asegúrate de que el "Root Directory" sea `frontend/html`

### Error de CORS
- Verifica que la URL en `config.js` sea correcta
- Asegúrate de que el backend permita el origen del frontend

### Archivos no se cargan
- Verifica que todos los archivos estén en GitHub
- Revisa los logs en Render → "Logs"

## 💡 Recomendación

**Usa la Opción 1 (Static Site separado)** porque:
- Mejor separación de responsabilidades
- Escalabilidad independiente
- Más fácil de mantener
- Render optimiza automáticamente los archivos estáticos

