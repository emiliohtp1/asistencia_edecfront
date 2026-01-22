document.addEventListener('DOMContentLoaded', () => {
    // Verificar si existe el indicador de sesión del buscador de alumnos
    const isLoggedIn = localStorage.getItem('isLoggedInBuscadorAlumnos');

    if (isLoggedIn !== 'true') {
        // Si no está logueado, redirigir al login del buscador
        window.location.href = 'buscadorlogin.html';
    }
    
    // Si la sesión existe, la ejecución continúa y la página buscador.html se muestra.
});
