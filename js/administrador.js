document.addEventListener('DOMContentLoaded', () => {
    const API_CREAR_USUARIO = 'https://asistencia-edec.onrender.com/api/usuarios/apodaca/crear';
    const API_CAMBIAR_CONTRASEÑA = 'https://asistencia-edec.onrender.com/api/usuarios/apodaca/cambiar-contraseña';
    
    // Elementos del DOM
    const btnCrearUsuario = document.getElementById('btnCrearUsuario');
    const btnUsuarioCircular = document.getElementById('btnUsuarioCircular');
    const btnCerrarSesion = document.getElementById('btnCerrarSesion');
    const btnBuscador = document.getElementById('btnBuscador');
    const btnAsistencias = document.getElementById('btnAsistencias');
    const btnRegistrador = document.getElementById('btnRegistrador');
    
    // Modales
    const modalCrearUsuario = document.getElementById('modalCrearUsuario');
    const modalInfoUsuario = document.getElementById('modalInfoUsuario');
    const modalCambiarContraseña = document.getElementById('modalCambiarContraseña');
    
    // Formularios
    const formCrearUsuario = document.getElementById('formCrearUsuario');
    const formCambiarContraseña = document.getElementById('formCambiarContraseña');
    
    // Obtener correo del usuario logueado
    const correoUsuario = localStorage.getItem('adminCorreo');
    
    // Cargar información del usuario y actualizar botón circular
    async function cargarInfoUsuario() {
        if (!correoUsuario) return;
        
        try {
            const response = await fetch(`https://asistencia-edec.onrender.com/api/usuarios/apodaca/${correoUsuario}`);
            if (response.ok) {
                const usuario = await response.json();
                const primeraLetra = usuario.nombre_completo.charAt(0).toUpperCase();
                btnUsuarioCircular.textContent = primeraLetra;
                btnUsuarioCircular.setAttribute('data-correo', correoUsuario);
            }
        } catch (error) {
            console.error('Error al cargar información del usuario:', error);
        }
    }
    
    // Cargar información al iniciar
    cargarInfoUsuario();
    
    // Abrir modales
    btnCrearUsuario.addEventListener('click', () => {
        modalCrearUsuario.style.display = 'flex';
        formCrearUsuario.reset();
        document.getElementById('error-message-crear').style.display = 'none';
        document.getElementById('success-message-crear').style.display = 'none';
    });
    
    btnUsuarioCircular.addEventListener('click', async () => {
        if (!correoUsuario) return;
        
        try {
            const response = await fetch(`https://asistencia-edec.onrender.com/api/usuarios/apodaca/${correoUsuario}`);
            if (response.ok) {
                const usuario = await response.json();
                mostrarInfoUsuario(usuario);
                modalInfoUsuario.style.display = 'flex';
            } else {
                alert('Error al cargar información del usuario.');
            }
        } catch (error) {
            console.error('Error al cargar información del usuario:', error);
            alert('Error de conexión al cargar información del usuario.');
        }
    });
    
    // Mostrar información del usuario en el modal
    function mostrarInfoUsuario(usuario) {
        const content = document.getElementById('infoUsuarioContent');
        const fechaCreacion = new Date(usuario.fecha_creacion).toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        content.innerHTML = `
            <div class="info-usuario-item">
                <strong>Nombre Completo:</strong> <span>${usuario.nombre_completo}</span>
            </div>
            <div class="info-usuario-item">
                <strong>Correo:</strong> <span>${usuario.correo}</span>
            </div>
            <div class="info-usuario-item">
                <strong>Rol:</strong> <span>${usuario.rol}</span>
            </div>
            <div class="info-usuario-item">
                <strong>Campus:</strong> <span>${usuario.campus}</span>
            </div>
            <div class="info-usuario-item">
                <strong>Fecha de Creación:</strong> <span>${fechaCreacion}</span>
            </div>
        `;
    }
    
    // Cerrar modales
    document.getElementById('btnCerrarCrearUsuario').addEventListener('click', () => {
        modalCrearUsuario.style.display = 'none';
    });
    
    document.getElementById('btnCancelarCrearUsuario').addEventListener('click', () => {
        modalCrearUsuario.style.display = 'none';
    });
    
    document.getElementById('btnCerrarInfoUsuario').addEventListener('click', () => {
        modalInfoUsuario.style.display = 'none';
    });
    
    document.getElementById('btnCerrarInfoUsuario2').addEventListener('click', () => {
        modalInfoUsuario.style.display = 'none';
    });
    
    document.getElementById('btnCerrarCambiarContraseña').addEventListener('click', () => {
        modalCambiarContraseña.style.display = 'none';
    });
    
    document.getElementById('btnCancelarCambiarContraseña').addEventListener('click', () => {
        modalCambiarContraseña.style.display = 'none';
    });
    
    // Cerrar modal al hacer click fuera
    modalCrearUsuario.addEventListener('click', (e) => {
        if (e.target === modalCrearUsuario) {
            modalCrearUsuario.style.display = 'none';
        }
    });
    
    modalInfoUsuario.addEventListener('click', (e) => {
        if (e.target === modalInfoUsuario) {
            modalInfoUsuario.style.display = 'none';
        }
    });
    
    modalCambiarContraseña.addEventListener('click', (e) => {
        if (e.target === modalCambiarContraseña) {
            modalCambiarContraseña.style.display = 'none';
        }
    });
    
    // Abrir modal de cambiar contraseña desde el modal de info
    document.getElementById('btnCambiarContraseña').addEventListener('click', () => {
        modalInfoUsuario.style.display = 'none';
        modalCambiarContraseña.style.display = 'flex';
        formCambiarContraseña.reset();
        document.getElementById('error-message-password').style.display = 'none';
        document.getElementById('success-message-password').style.display = 'none';
    });
    
    // Crear usuario
    formCrearUsuario.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const errorMsg = document.getElementById('error-message-crear');
        const successMsg = document.getElementById('success-message-crear');
        errorMsg.style.display = 'none';
        successMsg.style.display = 'none';
        
        const datos = {
            nombre_completo: document.getElementById('nombreCompleto').value,
            correo: document.getElementById('correoCrear').value,
            contraseña: document.getElementById('contraseñaCrear').value,
            rol: document.getElementById('rolCrear').value,
            campus: document.getElementById('campusCrear').value
        };
        
        try {
            const response = await fetch(API_CREAR_USUARIO, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(datos)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                errorMsg.textContent = data.detail || 'Error al crear usuario.';
                errorMsg.style.display = 'block';
                return;
            }
            
            successMsg.textContent = 'Usuario creado exitosamente.';
            successMsg.style.display = 'block';
            formCrearUsuario.reset();
            
            setTimeout(() => {
                modalCrearUsuario.style.display = 'none';
            }, 2000);
            
        } catch (error) {
            console.error('Error al crear usuario:', error);
            errorMsg.textContent = 'Error de conexión al crear usuario.';
            errorMsg.style.display = 'block';
        }
    });
    
    // Cambiar contraseña
    formCambiarContraseña.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const errorMsg = document.getElementById('error-message-password');
        const successMsg = document.getElementById('success-message-password');
        errorMsg.style.display = 'none';
        successMsg.style.display = 'none';
        
        const nuevaContraseña = document.getElementById('nuevaContraseña').value;
        const confirmarContraseña = document.getElementById('confirmarContraseña').value;
        
        if (nuevaContraseña !== confirmarContraseña) {
            errorMsg.textContent = 'Las contraseñas no coinciden.';
            errorMsg.style.display = 'block';
            return;
        }
        
        const datos = {
            correo: correoUsuario,
            contraseña_actual: document.getElementById('contraseñaActual').value,
            nueva_contraseña: nuevaContraseña
        };
        
        try {
            const response = await fetch(API_CAMBIAR_CONTRASEÑA, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(datos)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                errorMsg.textContent = data.detail || 'Error al cambiar contraseña.';
                errorMsg.style.display = 'block';
                return;
            }
            
            successMsg.textContent = 'Contraseña cambiada exitosamente.';
            successMsg.style.display = 'block';
            formCambiarContraseña.reset();
            
            setTimeout(() => {
                modalCambiarContraseña.style.display = 'none';
            }, 2000);
            
        } catch (error) {
            console.error('Error al cambiar contraseña:', error);
            errorMsg.textContent = 'Error de conexión al cambiar contraseña.';
            errorMsg.style.display = 'block';
        }
    });
    
    // Navegación a otras páginas (en nuevas pestañas)
    btnBuscador.addEventListener('click', () => {
        window.open(btnBuscador.getAttribute('data-url'), '_blank');
    });
    
    btnAsistencias.addEventListener('click', () => {
        window.open(btnAsistencias.getAttribute('data-url'), '_blank');
    });
    
    btnRegistrador.addEventListener('click', () => {
        window.open(btnRegistrador.getAttribute('data-url'), '_blank');
    });
    
    // Cerrar sesión
    btnCerrarSesion.addEventListener('click', () => {
        if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
            localStorage.removeItem('isLoggedInAdmin');
            localStorage.removeItem('adminCorreo');
            window.location.href = 'administradorlogin.html';
        }
    });
});
