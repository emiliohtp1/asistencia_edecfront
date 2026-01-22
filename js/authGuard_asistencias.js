document.addEventListener('DOMContentLoaded', () => {
    // Verificar si existe el indicador de sesión del buscador
    const isLoggedIn = localStorage.getItem('isLoggedInBuscador');

    if (isLoggedIn !== 'true') {
        // Si no está logueado, redirigir al login del buscador
        window.location.href = 'asistenciaslogin.html';
    }
    
    // Si la sesión existe, la ejecución continúa y la página asistencias.html se muestra.
});
