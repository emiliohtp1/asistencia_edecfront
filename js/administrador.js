document.addEventListener('DOMContentLoaded', () => {
    const API_CREAR_USUARIO = 'https://asistencia-edec.onrender.com/api/usuarios/apodaca/crear';
    const API_CAMBIAR_CONTRASEÑA = 'https://asistencia-edec.onrender.com/api/usuarios/apodaca/cambiar-contraseña';
    const API_USUARIOS = 'https://asistencia-edec.onrender.com/api/usuarios/apodaca';
    
    // Elementos del DOM
    const btnCrearUsuario = document.getElementById('btnCrearUsuario');
    const btnCrearUsuarioModal = document.getElementById('btnCrearUsuarioModal');
    const btnUsuarioCircular = document.getElementById('btnUsuarioCircular');
    const btnCerrarSesion = document.getElementById('btnCerrarSesion');
    const btnBuscador = document.getElementById('btnBuscador');
    const btnAsistencias = document.getElementById('btnAsistencias');
    const btnRegistrador = document.getElementById('btnRegistrador');
    const btnUsuarios = document.getElementById('btnUsuarios');
    
    // Modales
    const modalCrearUsuario = document.getElementById('modalCrearUsuario');
    const modalInfoUsuario = document.getElementById('modalInfoUsuario');
    const modalCambiarContraseña = document.getElementById('modalCambiarContraseña');
    const modalUsuarios = document.getElementById('modalUsuarios');
    
    // Formularios
    const formCrearUsuario = document.getElementById('formCrearUsuario');
    const formCambiarContraseña = document.getElementById('formCambiarContraseña');
    
    // Tabla de usuarios
    const tbodyUsuarios = document.getElementById('tbodyUsuarios');
    
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
    
    // Abrir modal de usuarios
    btnUsuarios.addEventListener('click', async () => {
        modalUsuarios.style.display = 'flex';
        await cargarUsuarios();
    });
    
    // Abrir modal de crear usuario desde el modal de usuarios
    btnCrearUsuarioModal.addEventListener('click', () => {
        modalUsuarios.style.display = 'none';
        modalCrearUsuario.style.display = 'flex';
        formCrearUsuario.reset();
        document.getElementById('error-message-crear').style.display = 'none';
        document.getElementById('success-message-crear').style.display = 'none';
    });
    
    // Abrir modales
    btnCrearUsuario?.addEventListener('click', () => {
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
    
    document.getElementById('btnCerrarUsuarios').addEventListener('click', () => {
        modalUsuarios.style.display = 'none';
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
    
    modalUsuarios.addEventListener('click', (e) => {
        if (e.target === modalUsuarios) {
            modalUsuarios.style.display = 'none';
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
            
            setTimeout(async () => {
                modalCrearUsuario.style.display = 'none';
                // Si el modal de usuarios estaba abierto, recargar usuarios y volver a abrirlo
                if (modalUsuarios.style.display === 'flex' || document.getElementById('btnUsuarios')) {
                    await cargarUsuarios();
                    modalUsuarios.style.display = 'flex';
                }
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
    
    // Función para validar que el usuario siga siendo administrador antes de redirigir
    async function validarAdminAntesDeRedirigir(url, tipoPagina) {
        const correo = localStorage.getItem('adminCorreo');
        
        if (!correo) {
            alert('Error: No se encontró información de sesión. Por favor, inicia sesión nuevamente.');
            localStorage.removeItem('isLoggedInAdmin');
            localStorage.removeItem('adminCorreo');
            localStorage.removeItem('adminRol');
            localStorage.removeItem('adminContraseña');
            window.location.href = 'administradorlogin.html';
            return false;
        }
        
        try {
            // Verificar que el usuario siga siendo administrador
            const userResponse = await fetch(`https://asistencia-edec.onrender.com/api/usuarios/apodaca/${correo}`);
            if (userResponse.ok) {
                const usuario = await userResponse.json();
                if (usuario.rol !== 'administrador') {
                    alert('Ya no tienes permisos de administrador. Acceso denegado.');
                    localStorage.removeItem('isLoggedInAdmin');
                    localStorage.removeItem('adminCorreo');
                    localStorage.removeItem('adminRol');
                    localStorage.removeItem('adminContraseña');
                    window.location.href = 'administradorlogin.html';
                    return false;
                }
                
                // Establecer las claves de localStorage necesarias para la página destino
                // Esto permite que los authGuards de esas páginas permitan el acceso
                if (tipoPagina === 'buscador') {
                    localStorage.setItem('isLoggedInBuscadorAlumnos', 'true');
                    localStorage.setItem('buscadorCorreo', correo);
                    localStorage.setItem('buscadorRol', usuario.rol);
                } else if (tipoPagina === 'asistencias') {
                    localStorage.setItem('isLoggedInBuscador', 'true');
                    localStorage.setItem('asistenciasCorreo', correo);
                    localStorage.setItem('asistenciasRol', usuario.rol);
                } else if (tipoPagina === 'registrador') {
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.setItem('registradorCorreo', correo);
                    localStorage.setItem('registradorRol', usuario.rol);
                }
                
                return true;
            } else {
                throw new Error('Error al obtener información del usuario.');
            }
        } catch (error) {
            console.error('Error al validar credenciales:', error);
            alert('Error de conexión al validar credenciales. Intenta nuevamente.');
            return false;
        }
    }
    
    // Navegación a otras páginas (en nuevas pestañas) con validación de credenciales
    btnBuscador.addEventListener('click', async () => {
        const valido = await validarAdminAntesDeRedirigir(btnBuscador.getAttribute('data-url'), 'buscador');
        if (valido) {
            window.open(btnBuscador.getAttribute('data-url'), '_blank');
        }
    });
    
    btnAsistencias.addEventListener('click', async () => {
        const valido = await validarAdminAntesDeRedirigir(btnAsistencias.getAttribute('data-url'), 'asistencias');
        if (valido) {
            window.open(btnAsistencias.getAttribute('data-url'), '_blank');
        }
    });
    
    btnRegistrador.addEventListener('click', async () => {
        const valido = await validarAdminAntesDeRedirigir(btnRegistrador.getAttribute('data-url'), 'registrador');
        if (valido) {
            window.open(btnRegistrador.getAttribute('data-url'), '_blank');
        }
    });
    
    // Función para cargar usuarios desde la API
    async function cargarUsuarios() {
        tbodyUsuarios.innerHTML = '<tr><td colspan="5" style="text-align: center;">Cargando usuarios...</td></tr>';
        
        try {
            const response = await fetch(API_USUARIOS);
            if (!response.ok) {
                throw new Error('Error al cargar usuarios.');
            }
            
            const data = await response.json();
            const usuarios = data.usuarios || [];
            
            if (usuarios.length === 0) {
                tbodyUsuarios.innerHTML = '<tr><td colspan="5" style="text-align: center;">No hay usuarios registrados.</td></tr>';
                return;
            }
            
            tbodyUsuarios.innerHTML = '';
            
            usuarios.forEach(usuario => {
                const fila = document.createElement('tr');
                fila.innerHTML = `
                    <td>${usuario.nombre_completo || ''}</td>
                    <td>${usuario.correo || ''}</td>
                    <td>${usuario.rol || ''}</td>
                    <td>${usuario.campus || ''}</td>
                    <td>
                        <button class="btn-eliminar-usuario" data-correo="${usuario.correo}" title="Eliminar usuario">
                            ×
                        </button>
                    </td>
                `;
                tbodyUsuarios.appendChild(fila);
            });
            
            // Agregar event listeners a los botones de eliminar
            const botonesEliminar = document.querySelectorAll('.btn-eliminar-usuario');
            botonesEliminar.forEach(boton => {
                boton.addEventListener('click', async () => {
                    const correo = boton.getAttribute('data-correo');
                    await eliminarUsuario(correo);
                });
            });
            
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
            tbodyUsuarios.innerHTML = '<tr><td colspan="5" style="text-align: center; color: red;">Error al cargar usuarios.</td></tr>';
        }
    }
    
    // Función para eliminar usuario
    async function eliminarUsuario(correo) {
        if (!correo) return;
        
        if (!confirm(`¿Estás seguro de que deseas eliminar al usuario con correo: ${correo}?`)) {
            return;
        }
        
        try {
            const response = await fetch(`${API_USUARIOS}/${correo}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.detail || 'Error al eliminar usuario.');
            }
            
            alert('Usuario eliminado exitosamente.');
            await cargarUsuarios();
            
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            alert(error.message || 'Error al eliminar usuario. Intenta nuevamente.');
        }
    }
    
    // Función para limpiar todas las credenciales
    function limpiarTodasLasCredenciales() {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('isLoggedInBuscador');
        localStorage.removeItem('isLoggedInBuscadorAlumnos');
        localStorage.removeItem('isLoggedInAdmin');
        localStorage.removeItem('adminCorreo');
        localStorage.removeItem('adminRol');
        localStorage.removeItem('adminContraseña');
        localStorage.removeItem('buscadorCorreo');
        localStorage.removeItem('buscadorRol');
        localStorage.removeItem('asistenciasCorreo');
        localStorage.removeItem('asistenciasRol');
        localStorage.removeItem('registradorCorreo');
        localStorage.removeItem('registradorRol');
    }

    // Cerrar sesión
    btnCerrarSesion.addEventListener('click', () => {
        if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
            limpiarTodasLasCredenciales();
            window.location.href = 'administradorlogin.html';
        }
    });
});
