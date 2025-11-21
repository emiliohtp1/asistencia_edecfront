// server.js

// ... imports (require) y configuración de variables de entorno ...

const path = require('path'); // ¡Asegúrate de importar el módulo 'path'!

// ... middlewares (app.use(express.json()), app.use(cors()), etc.) ...

// 1. Servir los archivos estáticos (CSS, JS, images)
// Esto permite que el navegador encuentre /css/style.css, /js/login.js, etc.
app.use(express.static(path.join(__dirname)));


// 2. Ruta Raíz (GET /)
// Esta ruta es la que responde cuando acceden a la URL principal.
app.get('/', (req, res) => {
    // __dirname es la carpeta donde está server.js.
    // path.join construye la ruta segura hacia el archivo index.html.
    res.sendFile(path.join(__dirname, 'html', 'index.html'));
});


// 3. Ruta de Login (POST /api/login)
app.post('/api/login', async (req, res) => {
    // ... tu lógica de autenticación ...
});


// ... app.listen() ...