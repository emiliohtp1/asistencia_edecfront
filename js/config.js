// Configuración de la API
const API_CONFIG = {
    BASE_URL: 'http://localhost:8000',
    ENDPOINTS: {
        USUARIO: '/api/usuarios',
        ASISTENCIA: '/api/asistencias'
    }
};

// Función para obtener la URL completa del endpoint
function getApiUrl(endpoint) {
    return `${API_CONFIG.BASE_URL}${endpoint}`;
}

