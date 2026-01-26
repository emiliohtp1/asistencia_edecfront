document.addEventListener('DOMContentLoaded', () => {
    // Verificar si existe el indicador de sesión
    const isLoggedIn = localStorage.getItem('isLoggedInAdmin');

    if (isLoggedIn !== 'true') {
        // Si no está logueado, redirigir al login
        window.location.href = 'administradorlogin.html';
        // Detener la carga de la página
    }
    
    // Si la sesión existe, la ejecución continúa y la página administrador.html se muestra.
});
