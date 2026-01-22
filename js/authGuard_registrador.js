document.addEventListener('DOMContentLoaded', () => {
    // Verificar si existe el indicador de sesión
    const isLoggedIn = localStorage.getItem('isLoggedIn');

    if (isLoggedIn !== 'true') {
        // Si no está logueado, redirigir al login
        // Usamos '../html/index.html' o 'index.html' dependiendo de tu estructura de carpetas:
        // Si home.html y index.html están en la misma carpeta (html/):
        window.location.href = 'index.html'; 
        // Detener la carga de la página
    }
    
    // Si la sesión existe, la ejecución continúa y la página home.html se muestra.
});
