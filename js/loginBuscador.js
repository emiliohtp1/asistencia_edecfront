document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('error-message');

    // Nuevo endpoint POST de login
    const API_LOGIN_URL = 'https://asistencia-edec.onrender.com/api/usuarios/login';

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Evita el envío tradicional del formulario

        const usernameInput = document.getElementById('username').value;
        const passwordInput = document.getElementById('password').value;

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
                    username: usernameInput,
                    password: passwordInput
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

            // --- 3. Redirigir si todo fue correcto ---
            localStorage.setItem('isLoggedInBuscador', 'true');
            window.location.href = 'asistencias.html';

        } catch (error) {
            console.error('Error durante el login:', error.message);
            errorMessage.textContent = 'Error de conexión o del servidor.';
            errorMessage.style.display = 'block';
        }
    });
});
