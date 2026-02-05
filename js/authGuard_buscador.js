document.addEventListener('DOMContentLoaded', async () => {
    // Verificar si existe el indicador de sesión del buscador de alumnos
    const isLoggedIn = localStorage.getItem('isLoggedInBuscadorAlumnos');
    const correoUsuario = localStorage.getItem('buscadorCorreo');
    const rolGuardado = localStorage.getItem('buscadorRol');

    if (isLoggedIn !== 'true' || !correoUsuario) {
        // Si no está logueado, redirigir al login del buscador
        window.location.href = 'buscadorlogin.html';
        return;
    }

    // Roles permitidos: administrador, director, coordinador, servicio social
    const rolesPermitidos = ['administrador', 'director', 'coordinador', 'servicio social'];

    // Verificar el rol del usuario desde la API
    try {
        const response = await fetch(`https://asistencia-edec.onrender.com/api/usuarios/apodaca/${correoUsuario}`);
        if (response.ok) {
            const usuario = await response.json();
            
            // Verificar que el usuario tenga un rol permitido
            if (!rolesPermitidos.includes(usuario.rol)) {
                // Limpiar localStorage y redirigir
                localStorage.removeItem('isLoggedInBuscadorAlumnos');
                localStorage.removeItem('buscadorCorreo');
                localStorage.removeItem('buscadorRol');
                alert('No tienes permisos para acceder a esta página. Solo usuarios con rol de administrador, director, coordinador o servicio social pueden acceder.');
                window.location.href = 'buscadorlogin.html';
                return;
            }
            
            // Actualizar el rol en localStorage si cambió
            if (rolGuardado !== usuario.rol) {
                localStorage.setItem('buscadorRol', usuario.rol);
            }
        } else {
            // Si no se puede obtener la información del usuario, redirigir al login
            localStorage.removeItem('isLoggedInBuscadorAlumnos');
            localStorage.removeItem('buscadorCorreo');
            localStorage.removeItem('buscadorRol');
            window.location.href = 'buscadorlogin.html';
            return;
        }
    } catch (error) {
        console.error('Error al verificar rol:', error);
        localStorage.removeItem('isLoggedInBuscadorAlumnos');
        localStorage.removeItem('buscadorCorreo');
        localStorage.removeItem('buscadorRol');
        window.location.href = 'buscadorlogin.html';
        return;
    }
    
    // Si la sesión existe y el rol es válido, la ejecución continúa y la página buscador.html se muestra.
});
