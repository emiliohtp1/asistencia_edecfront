document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('error-message');

    // Nuevo endpoint POST de login
    const API_LOGIN_URL = 'https://asistencia-edec.onrender.com/api/usuarios/apodaca/login';

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Evita el envío tradicional del formulario

        const correoInput = document.getElementById('correo').value;
        const contraseñaInput = document.getElementById('contraseña').value;

        // Ocultar mensaje de error al intentar logear
        errorMessage.style.display = 'none';
        
        try {
            // --- 1. Enviar credenciales al backend ---
            const response = await fetch(API_LOGIN_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    correo: correoInput,
                    contraseña: contraseñaInput
                })
            });

            // --- 2. Validar respuesta del backend ---
            if (response.status === 401) {
                // Credenciales incorrectas
                errorMessage.textContent = 'Las credenciales no son correctas.';
                errorMessage.style.display = 'block';
                return;
            }

            if (!response.ok) {
                throw new Error('Error en el servidor.');
            }

            const data = await response.json();

            console.log('Login exitoso:', data);

            // --- 3. Obtener información del usuario para verificar rol ---
            try {
                const userResponse = await fetch(`https://asistencia-edec.onrender.com/api/usuarios/apodaca/${correoInput}`);
                if (userResponse.ok) {
                    const usuario = await userResponse.json();
                    
                    // Verificar si el usuario está autorizado
                    if (!usuario.autorizado) {
                        errorMessage.textContent = 'Usuario no aprobado todavía.';
                        errorMessage.style.display = 'block';
                        errorMessage.style.color = 'red';
                        return;
                    }
                    
                    // Roles permitidos: administrador, director, coordinador, servicio social
                    const rolesPermitidos = ['administrador', 'director', 'coordinador', 'servicio social'];
                    
                    // Verificar que el usuario tenga un rol permitido
                    if (!rolesPermitidos.includes(usuario.rol)) {
                        errorMessage.textContent = 'No tienes permisos para acceder a esta página.';
                        errorMessage.style.display = 'block';
                        return;
                    }
                    
                    // Guardar información del usuario
                    localStorage.setItem('buscadorCorreo', correoInput);
                    localStorage.setItem('buscadorRol', usuario.rol);
                    localStorage.setItem('isLoggedInBuscadorAlumnos', 'true');
                    window.location.href = 'buscador.html';
                } else {
                    throw new Error('Error al obtener información del usuario.');
                }
            } catch (error) {
                console.error('Error al verificar rol:', error);
                errorMessage.textContent = 'Error al verificar permisos del usuario.';
                errorMessage.style.display = 'block';
            }

        } catch (error) {
            console.error('Error durante el login:', error.message);
            errorMessage.textContent = 'Error de conexión o del servidor.';
            errorMessage.style.display = 'block';
        }
    });
});
