// Servicio de API para comunicación con el backend

/**
 * Obtiene la información de un usuario por su matrícula
 * @param {string} matricula - Matrícula del usuario
 * @returns {Promise<Object>} Datos del usuario
 */
async function obtenerUsuario(matricula) {
    try {
        const response = await fetch(getApiUrl(`${API_CONFIG.ENDPOINTS.USUARIO}/${matricula}`));
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Usuario no encontrado');
            }
            throw new Error(`Error al obtener usuario: ${response.statusText}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error en obtenerUsuario:', error);
        throw error;
    }
}

/**
 * Registra una asistencia (entrada o salida)
 * @param {string} matricula - Matrícula del usuario
 * @param {string} tipoRegistro - 'entrada' o 'salida'
 * @returns {Promise<Object>} Resultado del registro
 */
async function registrarAsistencia(matricula, tipoRegistro) {
    try {
        const response = await fetch(getApiUrl(`${API_CONFIG.ENDPOINTS.ASISTENCIA}/registrar`), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                matricula: matricula,
                tipo_registro: tipoRegistro
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `Error al registrar asistencia: ${response.statusText}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error en registrarAsistencia:', error);
        throw error;
    }
}

