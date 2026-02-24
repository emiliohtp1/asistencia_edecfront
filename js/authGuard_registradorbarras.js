document.addEventListener('DOMContentLoaded', async () => {
    // Verificar si existe el indicador de sesión
    const isLoggedIn = localStorage.getItem('isLoggedInBarras');
    const correoUsuario = localStorage.getItem('registradorBarrasCorreo');
    const rolGuardado = localStorage.getItem('registradorBarrasRol');

    if (isLoggedIn !== 'true' || !correoUsuario) {
        // Si no está logueado, redirigir al login
        window.location.href = 'registradorbarraslogin.html'; 
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
                localStorage.removeItem('isLoggedInBarras');
                localStorage.removeItem('registradorBarrasCorreo');
                localStorage.removeItem('registradorBarrasRol');
                alert('No tienes permisos para acceder a esta página. Solo usuarios con rol de administrador, director, coordinador o servicio social pueden acceder.');
                window.location.href = 'registradorbarraslogin.html';
                return;
            }
            
            // Actualizar el rol en localStorage si cambió
            if (rolGuardado !== usuario.rol) {
                localStorage.setItem('registradorBarrasRol', usuario.rol);
            }
        } else {
            // Si no se puede obtener la información del usuario, redirigir al login
            localStorage.removeItem('isLoggedInBarras');
            localStorage.removeItem('registradorBarrasCorreo');
            localStorage.removeItem('registradorBarrasRol');
            window.location.href = 'registradorbarraslogin.html';
            return;
        }
    } catch (error) {
        console.error('Error al verificar rol:', error);
        localStorage.removeItem('isLoggedInBarras');
        localStorage.removeItem('registradorBarrasCorreo');
        localStorage.removeItem('registradorBarrasRol');
        window.location.href = 'registradorbarraslogin.html';
        return;
    }
    
    // Si la sesión existe y el rol es válido, la ejecución continúa y la página se muestra.
});
