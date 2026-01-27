document.addEventListener('DOMContentLoaded', async () => {
    // Verificar si existe el indicador de sesión
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const correoUsuario = localStorage.getItem('registradorCorreo');
    const rolGuardado = localStorage.getItem('registradorRol');

    if (isLoggedIn !== 'true' || !correoUsuario) {
        // Si no está logueado, redirigir al login
        window.location.href = 'index.html'; 
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
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('registradorCorreo');
                localStorage.removeItem('registradorRol');
                alert('No tienes permisos para acceder a esta página. Solo usuarios con rol de administrador, director, coordinador o servicio social pueden acceder.');
                window.location.href = 'index.html';
                return;
            }
            
            // Actualizar el rol en localStorage si cambió
            if (rolGuardado !== usuario.rol) {
                localStorage.setItem('registradorRol', usuario.rol);
            }
        } else {
            // Si no se puede obtener la información del usuario, redirigir al login
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('registradorCorreo');
            localStorage.removeItem('registradorRol');
            window.location.href = 'index.html';
            return;
        }
    } catch (error) {
        console.error('Error al verificar rol:', error);
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('registradorCorreo');
        localStorage.removeItem('registradorRol');
        window.location.href = 'index.html';
        return;
    }
    
    // Si la sesión existe y el rol es válido, la ejecución continúa y la página home.html se muestra.
});
