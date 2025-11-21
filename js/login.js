document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('error-message');

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Evita el envío tradicional del formulario

        // Obtener los valores del formulario
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Ocultar el mensaje de error antes de cada intento
        errorMessage.style.display = 'none';

        try {
            // 🚨 Importante: La URL debe apuntar al endpoint de tu servidor backend
            // Si el backend está en el mismo dominio, usa una ruta relativa: '/api/login'
            const response = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Credenciales correctas
                console.log('Login exitoso:', data.message);
                // Redirigir a home.html
                window.location.href = 'home.html';
            } else {
                // Credenciales incorrectas
                console.error('Error de login:', data.message);
                errorMessage.textContent = data.message || 'Las credenciales no son correctas.';
                errorMessage.style.display = 'block';
            }
        } catch (error) {
            console.error('Error de conexión con el servidor:', error);
            errorMessage.textContent = 'Error al intentar conectar. Inténtalo de nuevo.';
            errorMessage.style.display = 'block';
        }
    });
});