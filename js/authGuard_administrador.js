document.addEventListener('DOMContentLoaded', async () => {
    // Verificar si existe el indicador de sesión
    const isLoggedIn = localStorage.getItem('isLoggedInAdmin');
    const correoUsuario = localStorage.getItem('adminCorreo');
    const rolGuardado = localStorage.getItem('adminRol');

    if (isLoggedIn !== 'true' || !correoUsuario) {
        // Si no está logueado, redirigir al login
        window.location.href = 'administradorlogin.html';
        return;
    }

    // Verificar el rol del usuario desde la API
    try {
        const response = await fetch(`https://asistencia-edec.onrender.com/api/usuarios/apodaca/${correoUsuario}`);
        if (response.ok) {
            const usuario = await response.json();
            
            // Roles permitidos: administrador, director, coordinador
            const rolesPermitidos = ['administrador', 'director', 'coordinador'];
            
            // Verificar que el usuario tenga un rol permitido
            if (!rolesPermitidos.includes(usuario.rol)) {
                // Limpiar localStorage y redirigir
                localStorage.removeItem('isLoggedInAdmin');
                localStorage.removeItem('adminCorreo');
                localStorage.removeItem('adminRol');
                localStorage.removeItem('adminContraseña');
                alert('No tienes permisos para acceder a esta página. Solo usuarios con rol de administrador, director o coordinador pueden acceder.');
                window.location.href = 'administradorlogin.html';
                return;
            }
            
            // Actualizar el rol en localStorage si cambió
            if (rolGuardado !== usuario.rol) {
                localStorage.setItem('adminRol', usuario.rol);
            }
        } else {
            // Si no se puede obtener la información del usuario, redirigir al login
            localStorage.removeItem('isLoggedInAdmin');
            localStorage.removeItem('adminCorreo');
            localStorage.removeItem('adminRol');
            localStorage.removeItem('adminContraseña');
            window.location.href = 'administradorlogin.html';
            return;
        }
    } catch (error) {
        console.error('Error al verificar rol:', error);
        // En caso de error, redirigir al login por seguridad
        localStorage.removeItem('isLoggedInAdmin');
        localStorage.removeItem('adminCorreo');
        localStorage.removeItem('adminRol');
        localStorage.removeItem('adminContraseña');
        window.location.href = 'administradorlogin.html';
        return;
    }
    
    // Si la sesión existe y el rol es correcto, la ejecución continúa y la página administrador.html se muestra.
});
