// AuthGuard para proteger la página de vinculación
document.addEventListener('DOMContentLoaded', async () => {
    // Verificar si existe el indicador de sesión
    const isLoggedIn = localStorage.getItem('isLoggedInVinculacion');
    const correoUsuario = localStorage.getItem('vinculacionCorreo');
    const rolGuardado = localStorage.getItem('vinculacionRol');

    if (isLoggedIn !== 'true' || !correoUsuario) {
        // Si no está logueado, redirigir al login
        window.location.href = 'vinculacionlogin.html';
        return;
    }

    // Verificar el rol del usuario desde la API
    try {
        const response = await fetch(`https://asistencia-edec.onrender.com/api/usuarios/apodaca/${correoUsuario}`);
        if (response.ok) {
            const usuario = await response.json();
            
            // Verificar si el usuario está autorizado
            if (!usuario.autorizado) {
                localStorage.removeItem('isLoggedInVinculacion');
                localStorage.removeItem('vinculacionCorreo');
                localStorage.removeItem('vinculacionContraseña');
                localStorage.removeItem('vinculacionRol');
                alert('Usuario no aprobado todavía.');
                window.location.href = 'vinculacionlogin.html';
                return;
            }
            
            // Roles permitidos: administrador, director, coordinador, vinculacion
            const rolesPermitidos = ['administrador', 'director', 'coordinador', 'vinculacion'];
            
            // Verificar que el usuario tenga un rol permitido
            if (!rolesPermitidos.includes(usuario.rol)) {
                // Limpiar localStorage y redirigir
                localStorage.removeItem('isLoggedInVinculacion');
                localStorage.removeItem('vinculacionCorreo');
                localStorage.removeItem('vinculacionRol');
                localStorage.removeItem('vinculacionContraseña');
                alert('No tienes permisos para acceder a esta página. Solo usuarios con rol de administrador, director, coordinador o vinculación pueden acceder.');
                window.location.href = 'vinculacionlogin.html';
                return;
            }
            
            // Actualizar el rol en localStorage si cambió
            if (rolGuardado !== usuario.rol) {
                localStorage.setItem('vinculacionRol', usuario.rol);
            }
        } else {
            // Si no se puede obtener la información del usuario, redirigir al login
            localStorage.removeItem('isLoggedInVinculacion');
            localStorage.removeItem('vinculacionCorreo');
            localStorage.removeItem('vinculacionRol');
            localStorage.removeItem('vinculacionContraseña');
            window.location.href = 'vinculacionlogin.html';
            return;
        }
    } catch (error) {
        console.error('Error al verificar rol:', error);
        // En caso de error, redirigir al login por seguridad
        localStorage.removeItem('isLoggedInVinculacion');
        localStorage.removeItem('vinculacionCorreo');
        localStorage.removeItem('vinculacionRol');
        localStorage.removeItem('vinculacionContraseña');
        window.location.href = 'vinculacionlogin.html';
        return;
    }
    
    // Si la sesión existe y el rol es correcto, la ejecución continúa y la página vinculacion.html se muestra.
});
