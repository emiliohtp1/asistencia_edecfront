document.addEventListener('DOMContentLoaded', () => {
    const API_CREAR_USUARIO = 'https://asistencia-edec.onrender.com/api/usuarios/apodaca/crear';
    const API_CAMBIAR_CONTRASEÑA = 'https://asistencia-edec.onrender.com/api/usuarios/apodaca/cambiar-contraseña';
    const API_USUARIOS = 'https://asistencia-edec.onrender.com/api/usuarios/apodaca';
    const API_BACHILLERATO = 'https://asistencia-edec.onrender.com/api/alumnos/bachillerato';
    const API_UNIVERSIDAD = 'https://asistencia-edec.onrender.com/api/alumnos/universidad';
    
    // Elementos del DOM
    const btnCrearUsuario = document.getElementById('btnCrearUsuario');
    const btnCrearUsuarioModal = document.getElementById('btnCrearUsuarioModal');
    const btnUsuarioCircular = document.getElementById('btnUsuarioCircular');
    const btnCerrarSesion = document.getElementById('btnCerrarSesion');
    const btnBuscador = document.getElementById('btnBuscador');
    const btnAsistencias = document.getElementById('btnAsistencias');
    const btnRegistrador = document.getElementById('btnRegistrador');
    const btnUsuarios = document.getElementById('btnUsuarios');
    const btnAlumnos = document.getElementById('btnAlumnos');
    
    // Elementos para la vista de alumnos
    const containerPrincipal = document.getElementById('containerPrincipal');
    const containerAlumnos = document.getElementById('containerAlumnos');
    const btnRegresarAlumnos = document.getElementById('btnRegresarAlumnos');
    const selectTipoAlumno = document.getElementById('selectTipoAlumno');
    const inputBuscarAlumno = document.getElementById('inputBuscarAlumno');
    const btnAgregarAlumno = document.getElementById('btnAgregarAlumno');
    const tbodyAlumnos = document.getElementById('tbodyAlumnos');
    const paginacionAlumnos = document.getElementById('paginacionAlumnos');
    
    // Modales de alumnos
    const modalEliminarAlumno = document.getElementById('modalEliminarAlumno');
    const modalCrearAlumno = document.getElementById('modalCrearAlumno');
    const formCrearAlumno = document.getElementById('formCrearAlumno');
    const btnConfirmarEliminar = document.getElementById('btnConfirmarEliminar');
    const btnCancelarEliminar = document.getElementById('btnCancelarEliminar');
    const btnCerrarCrearAlumno = document.getElementById('btnCerrarCrearAlumno');
    const btnCancelarCrearAlumno = document.getElementById('btnCancelarCrearAlumno');
    
    // Variables para alumnos
    let alumnosGlobales = [];
    let alumnosFiltrados = [];
    let paginaActual = 1;
    const alumnosPorPagina = 10;
    let alumnoAEliminar = null;
    let tipoAlumnoActual = 'bachillerato';
    
    // Modales
    const modalCrearUsuario = document.getElementById('modalCrearUsuario');
    const modalInfoUsuario = document.getElementById('modalInfoUsuario');
    const modalCambiarContraseña = document.getElementById('modalCambiarContraseña');
    const modalUsuarios = document.getElementById('modalUsuarios');
    const modalUsuariosPendientes = document.getElementById('modalUsuariosPendientes');
    
    // Formularios
    const formCrearUsuario = document.getElementById('formCrearUsuario');
    const formCambiarContraseña = document.getElementById('formCambiarContraseña');
    
    // Tabla de usuarios
    const tbodyUsuarios = document.getElementById('tbodyUsuarios');
    let usuariosGlobales = []; // Almacenar usuarios para ordenamiento
    let ordenActual = {
        columna: null,
        direccion: 'asc' // 'asc' o 'desc'
    };
    
    // Obtener correo del usuario logueado
    const correoUsuario = localStorage.getItem('adminCorreo');
    let rolUsuarioActual = null; // Almacenar el rol del usuario actual
    
    // Cargar información del usuario y actualizar botón circular
    async function cargarInfoUsuario() {
        if (!correoUsuario) return;
        
        try {
            const response = await fetch(`https://asistencia-edec.onrender.com/api/usuarios/apodaca/${correoUsuario}`);
            if (response.ok) {
                const usuario = await response.json();
                rolUsuarioActual = usuario.rol; // Guardar el rol del usuario actual
                const primeraLetra = usuario.nombre_completo.charAt(0).toUpperCase();
                btnUsuarioCircular.textContent = primeraLetra;
                btnUsuarioCircular.setAttribute('data-correo', correoUsuario);
            }
        } catch (error) {
            console.error('Error al cargar información del usuario:', error);
        }
    }
    
    // Función para configurar los roles disponibles según el rol del usuario
    function configurarRolesDisponibles() {
        const selectRol = document.getElementById('rolCrear');
        if (!selectRol) return;
        
        // Limpiar opciones existentes (excepto la primera opción vacía)
        const primeraOpcion = selectRol.querySelector('option[value=""]');
        selectRol.innerHTML = '';
        if (primeraOpcion) {
            selectRol.appendChild(primeraOpcion);
        } else {
            const opcionVacia = document.createElement('option');
            opcionVacia.value = '';
            opcionVacia.textContent = 'Seleccione un rol';
            selectRol.appendChild(opcionVacia);
        }
        
        // Si el usuario es administrador, puede crear cualquier rol
        if (rolUsuarioActual === 'administrador') {
            const rolesCompletos = [
                { value: 'administrador', text: 'Administrador' },
                { value: 'director', text: 'Director' },
                { value: 'coordinador', text: 'Coordinador' },
                { value: 'maestro', text: 'Maestro' },
                { value: 'alumno', text: 'Alumno' },
                { value: 'servicio social', text: 'Servicio Social' }
            ];
            
            rolesCompletos.forEach(rol => {
                const option = document.createElement('option');
                option.value = rol.value;
                option.textContent = rol.text;
                selectRol.appendChild(option);
            });
        } 
        // Si el usuario es director o coordinador, solo puede crear ciertos roles
        else if (rolUsuarioActual === 'director' || rolUsuarioActual === 'coordinador') {
            const rolesLimitados = [
                { value: 'coordinador', text: 'Coordinador' },
                { value: 'maestro', text: 'Maestro' },
                { value: 'alumno', text: 'Alumno' },
                { value: 'servicio social', text: 'Servicio Social' }
            ];
            
            rolesLimitados.forEach(rol => {
                const option = document.createElement('option');
                option.value = rol.value;
                option.textContent = rol.text;
                selectRol.appendChild(option);
            });
        }
    }
    
    // Cargar información al iniciar
    cargarInfoUsuario();
    
    // Abrir modal de usuarios
    btnUsuarios.addEventListener('click', async () => {
        modalUsuarios.style.display = 'flex';
        await cargarUsuarios();
        configurarOrdenamientoHeaders();
        actualizarContadorPendientes();
    });
    
    // Abrir modal de usuarios pendientes
    if (btnPendientesAprobacion) {
        btnPendientesAprobacion.addEventListener('click', async () => {
            modalUsuarios.style.display = 'none';
            modalUsuariosPendientes.style.display = 'flex';
            await cargarUsuariosPendientes();
        });
    }
    
    // Cerrar modal de usuarios pendientes
    if (btnCerrarUsuariosPendientes) {
        btnCerrarUsuariosPendientes.addEventListener('click', () => {
            modalUsuariosPendientes.style.display = 'none';
            modalUsuarios.style.display = 'flex';
        });
    }
    
    // Cerrar modal pendientes al hacer click fuera
    if (modalUsuariosPendientes) {
        modalUsuariosPendientes.addEventListener('click', (e) => {
            if (e.target === modalUsuariosPendientes) {
                modalUsuariosPendientes.style.display = 'none';
                modalUsuarios.style.display = 'flex';
            }
        });
    }
    
    // Configurar event listeners para ordenamiento en headers
    function configurarOrdenamientoHeaders() {
        const headers = document.querySelectorAll('.tabla-usuarios th[data-columna]');
        headers.forEach(header => {
            // Verificar si ya tiene un listener (usando un atributo data)
            if (!header.hasAttribute('data-sort-listener')) {
                header.setAttribute('data-sort-listener', 'true');
                header.addEventListener('click', (e) => {
                    e.preventDefault();
                    const columna = header.getAttribute('data-columna');
                    ordenarUsuarios(columna);
                });
            }
        });
    }
    
    // Abrir modal de crear usuario desde el modal de usuarios
    btnCrearUsuarioModal.addEventListener('click', () => {
        modalUsuarios.style.display = 'none';
        modalCrearUsuario.style.display = 'flex';
        formCrearUsuario.reset();
        document.getElementById('error-message-crear').style.display = 'none';
        document.getElementById('success-message-crear').style.display = 'none';
        configurarRolesDisponibles(); // Configurar roles según el usuario actual
    });
    
    // Abrir modales
    btnCrearUsuario?.addEventListener('click', () => {
        modalCrearUsuario.style.display = 'flex';
        formCrearUsuario.reset();
        document.getElementById('error-message-crear').style.display = 'none';
        document.getElementById('success-message-crear').style.display = 'none';
        configurarRolesDisponibles(); // Configurar roles según el usuario actual
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
                // Roles permitidos: administrador, director, coordinador
                const rolesPermitidos = ['administrador', 'director', 'coordinador'];
                if (!rolesPermitidos.includes(usuario.rol)) {
                    alert('Ya no tienes permisos para acceder a esta página. Acceso denegado.');
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
    // Función para renderizar usuarios en la tabla
    function renderizarUsuarios(usuarios) {
        tbodyUsuarios.innerHTML = '';
        
        // Filtrar solo usuarios autorizados
        const usuariosAutorizados = usuarios.filter(u => u.autorizado === true);
        
        if (usuariosAutorizados.length === 0) {
            tbodyUsuarios.innerHTML = '<tr><td colspan="5" style="text-align: center;">No hay usuarios registrados.</td></tr>';
            return;
        }
        
        usuariosAutorizados.forEach(usuario => {
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
    }
    
    // Función para ordenar usuarios
    function ordenarUsuarios(columna) {
        // Si se hace clic en la misma columna, cambiar dirección
        if (ordenActual.columna === columna) {
            ordenActual.direccion = ordenActual.direccion === 'asc' ? 'desc' : 'asc';
        } else {
            ordenActual.columna = columna;
            ordenActual.direccion = 'asc';
        }
        
        const usuariosOrdenados = [...usuariosGlobales].sort((a, b) => {
            let valorA, valorB;
            
            switch(columna) {
                case 'nombre':
                    valorA = (a.nombre_completo || '').toLowerCase();
                    valorB = (b.nombre_completo || '').toLowerCase();
                    break;
                case 'correo':
                    valorA = (a.correo || '').toLowerCase();
                    valorB = (b.correo || '').toLowerCase();
                    break;
                case 'rol':
                    valorA = (a.rol || '').toLowerCase();
                    valorB = (b.rol || '').toLowerCase();
                    break;
                case 'campus':
                    valorA = (a.campus || '').toLowerCase();
                    valorB = (b.campus || '').toLowerCase();
                    break;
                default:
                    return 0;
            }
            
            if (valorA < valorB) {
                return ordenActual.direccion === 'asc' ? -1 : 1;
            }
            if (valorA > valorB) {
                return ordenActual.direccion === 'asc' ? 1 : -1;
            }
            return 0;
        });
        
        renderizarUsuarios(usuariosOrdenados);
        actualizarIndicadoresOrdenamiento();
    }
    
    // Función para actualizar indicadores visuales de ordenamiento
    function actualizarIndicadoresOrdenamiento() {
        const headers = document.querySelectorAll('.tabla-usuarios th[data-columna]');
        headers.forEach(header => {
            const columna = header.getAttribute('data-columna');
            const span = header.querySelector('.sort-indicator');
            
            if (span) {
                span.remove();
            }
            
            if (ordenActual.columna === columna) {
                const nuevoSpan = document.createElement('span');
                nuevoSpan.className = 'sort-indicator';
                nuevoSpan.textContent = ordenActual.direccion === 'asc' ? ' ↑' : ' ↓';
                header.appendChild(nuevoSpan);
            }
        });
    }
    
    // Función para actualizar contador de usuarios pendientes
    function actualizarContadorPendientes() {
        if (!badgePendientes) return;
        const pendientes = usuariosGlobales.filter(u => !u.autorizado);
        badgePendientes.textContent = pendientes.length;
    }
    
    async function cargarUsuarios() {
        tbodyUsuarios.innerHTML = '<tr><td colspan="5" style="text-align: center;">Cargando usuarios...</td></tr>';
        
        try {
            const response = await fetch(API_USUARIOS);
            if (!response.ok) {
                throw new Error('Error al cargar usuarios.');
            }
            
            const data = await response.json();
            usuariosGlobales = data.usuarios || [];
            
            // Resetear ordenamiento al cargar
            ordenActual = { columna: null, direccion: 'asc' };
            
            renderizarUsuarios(usuariosGlobales);
            actualizarIndicadoresOrdenamiento();
            actualizarContadorPendientes();
            
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
            tbodyUsuarios.innerHTML = '<tr><td colspan="5" style="text-align: center; color: red;">Error al cargar usuarios.</td></tr>';
        }
    }
    
    // Función para cargar usuarios pendientes de aprobación
    async function cargarUsuariosPendientes() {
        if (!tbodyUsuariosPendientes) return;
        
        tbodyUsuariosPendientes.innerHTML = '<tr><td colspan="3" style="text-align: center;">Cargando usuarios pendientes...</td></tr>';
        
        try {
            const response = await fetch(API_USUARIOS);
            if (!response.ok) {
                throw new Error('Error al cargar usuarios pendientes.');
            }
            
            const data = await response.json();
            const usuariosPendientes = (data.usuarios || []).filter(u => !u.autorizado);
            
            if (usuariosPendientes.length === 0) {
                tbodyUsuariosPendientes.innerHTML = '<tr><td colspan="3" style="text-align: center;">No hay usuarios pendientes de aprobación.</td></tr>';
                return;
            }
            
            tbodyUsuariosPendientes.innerHTML = '';
            
            usuariosPendientes.forEach(usuario => {
                const fila = document.createElement('tr');
                fila.innerHTML = `
                    <td>${usuario.nombre_completo || ''}</td>
                    <td>${usuario.correo || ''}</td>
                    <td>
                        <button class="btn-autorizar" data-correo="${usuario.correo}" title="Autorizar usuario">✔️</button>
                        <button class="btn-rechazar" data-correo="${usuario.correo}" title="Eliminar usuario">❌</button>
                    </td>
                `;
                tbodyUsuariosPendientes.appendChild(fila);
            });
            
            // Agregar event listeners a los botones
            const botonesAutorizar = tbodyUsuariosPendientes.querySelectorAll('.btn-autorizar');
            botonesAutorizar.forEach(boton => {
                boton.addEventListener('click', async () => {
                    const correo = boton.getAttribute('data-correo');
                    await autorizarUsuario(correo);
                });
            });
            
            const botonesRechazar = tbodyUsuariosPendientes.querySelectorAll('.btn-rechazar');
            botonesRechazar.forEach(boton => {
                boton.addEventListener('click', async () => {
                    const correo = boton.getAttribute('data-correo');
                    await eliminarUsuarioPendiente(correo);
                });
            });
            
        } catch (error) {
            console.error('Error al cargar usuarios pendientes:', error);
            tbodyUsuariosPendientes.innerHTML = '<tr><td colspan="3" style="text-align: center; color: red;">Error al cargar usuarios pendientes.</td></tr>';
        }
    }
    
    // Función para autorizar usuario
    async function autorizarUsuario(correo) {
        if (!correo) return;
        
        try {
            const response = await fetch(`${API_USUARIOS}/cambiar-autorizado`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    correo: correo,
                    autorizado: true 
                })
            });
            
            if (!response.ok) {
                console.error('Error al autorizar usuario:', response.status, response.statusText);
                return;
            }
            
            // Actualizar tablas automáticamente
            await cargarUsuariosPendientes();
            await cargarUsuarios();
            actualizarContadorPendientes();
            
        } catch (error) {
            console.error('Error al autorizar usuario:', error);
        }
    }
    
    // Función para eliminar usuario pendiente
    async function eliminarUsuarioPendiente(correo) {
        if (!correo) return;
        
        try {
            const response = await fetch(`${API_USUARIOS}/${correo}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                console.error('Error al eliminar usuario:', response.status, response.statusText);
                return;
            }
            
            // Actualizar tablas automáticamente
            await cargarUsuariosPendientes();
            await cargarUsuarios();
            actualizarContadorPendientes();
            
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
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
                console.error('Error al eliminar usuario:', response.status, response.statusText);
                return;
            }
            
            await cargarUsuarios();
            actualizarContadorPendientes();
            
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
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
    
    // ==============================
    //   FUNCIONALIDAD DE ALUMNOS
    // ==============================
    
    // Mostrar vista de alumnos
    btnAlumnos.addEventListener('click', () => {
        containerPrincipal.style.display = 'none';
        containerAlumnos.style.display = 'block';
        paginaActual = 1;
        tipoAlumnoActual = 'bachillerato';
        selectTipoAlumno.value = 'bachillerato'; // Por defecto bachillerato
        inputBuscarAlumno.value = '';
        actualizarPlaceholderBuscador('bachillerato');
        cargarAlumnos('bachillerato');
    });
    
    // Regresar al dashboard principal
    btnRegresarAlumnos.addEventListener('click', () => {
        containerAlumnos.style.display = 'none';
        containerPrincipal.style.display = 'block';
    });
    
    // Cambiar tipo de alumno
    selectTipoAlumno.addEventListener('change', (e) => {
        paginaActual = 1;
        tipoAlumnoActual = e.target.value;
        inputBuscarAlumno.value = '';
        actualizarPlaceholderBuscador(e.target.value);
        cargarAlumnos(e.target.value);
    });
    
    // Actualizar placeholder del buscador
    function actualizarPlaceholderBuscador(tipo) {
        if (tipo === 'bachillerato') {
            inputBuscarAlumno.placeholder = 'Buscar alumno bachillerato';
        } else {
            inputBuscarAlumno.placeholder = 'Buscar alumno universidad';
        }
    }
    
    // Búsqueda de alumnos
    inputBuscarAlumno.addEventListener('input', (e) => {
        const termino = e.target.value.trim().toLowerCase();
        filtrarAlumnos(termino);
    });
    
    // Función para filtrar alumnos
    function filtrarAlumnos(termino) {
        if (termino === '') {
            alumnosFiltrados = [...alumnosGlobales];
        } else {
            alumnosFiltrados = alumnosGlobales.filter(alumno => {
                const matricula = (alumno.matricula || '').toLowerCase();
                const nombre = (alumno.nombre || '').toLowerCase();
                return matricula.includes(termino) || nombre.includes(termino);
            });
        }
        
        paginaActual = 1;
        renderizarAlumnos();
        renderizarPaginacion();
    }
    
    // Abrir modal para agregar alumno
    btnAgregarAlumno.addEventListener('click', () => {
        modalCrearAlumno.style.display = 'flex';
        formCrearAlumno.reset();
        document.getElementById('campusCrearAlumno').value = 'Apodaca';
        document.getElementById('graduadoCrear').value = 'No';
        document.getElementById('turnoCrear').value = 'Matutino';
        document.getElementById('error-message-crear-alumno').style.display = 'none';
        document.getElementById('success-message-crear-alumno').style.display = 'none';
    });
    
    // Cerrar modal de crear alumno
    btnCerrarCrearAlumno.addEventListener('click', () => {
        modalCrearAlumno.style.display = 'none';
    });
    
    btnCancelarCrearAlumno.addEventListener('click', () => {
        modalCrearAlumno.style.display = 'none';
    });
    
    modalCrearAlumno.addEventListener('click', (e) => {
        if (e.target === modalCrearAlumno) {
            modalCrearAlumno.style.display = 'none';
        }
    });
    
    // Crear alumno
    formCrearAlumno.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const errorMsg = document.getElementById('error-message-crear-alumno');
        const successMsg = document.getElementById('success-message-crear-alumno');
        errorMsg.style.display = 'none';
        successMsg.style.display = 'none';
        
        const curso = document.getElementById('cursoCrear').value;
        const datos = {
            matricula: document.getElementById('matriculaCrear').value,
            nombre: document.getElementById('nombreCrear').value,
            coordinador: document.getElementById('coordinadorCrear').value,
            graduado: document.getElementById('graduadoCrear').value,
            correo: document.getElementById('correoCrearAlumno').value,
            campus: document.getElementById('campusCrearAlumno').value,
            programa: document.getElementById('programaCrear').value,
            ciclo: document.getElementById('cicloCrear').value,
            turno: document.getElementById('turnoCrear').value
        };
        
        if (!curso) {
            errorMsg.textContent = 'Por favor seleccione un curso.';
            errorMsg.style.display = 'block';
            return;
        }
        
        const apiUrl = curso === 'Bachillerato' 
            ? 'https://asistencia-edec.onrender.com/api/alumnos/bachillerato/crear'
            : 'https://asistencia-edec.onrender.com/api/alumnos/universidad/crear';
        
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(datos)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                errorMsg.textContent = data.detail || 'Error al crear alumno.';
                errorMsg.style.display = 'block';
                return;
            }
            
            successMsg.textContent = 'Alumno creado exitosamente.';
            successMsg.style.display = 'block';
            formCrearAlumno.reset();
            document.getElementById('campusCrearAlumno').value = 'Apodaca';
            document.getElementById('graduadoCrear').value = 'No';
            document.getElementById('turnoCrear').value = 'Matutino';
            
            // Recargar alumnos después de crear
            setTimeout(async () => {
                modalCrearAlumno.style.display = 'none';
                await cargarAlumnos(tipoAlumnoActual);
                inputBuscarAlumno.value = '';
            }, 2000);
            
        } catch (error) {
            console.error('Error al crear alumno:', error);
            errorMsg.textContent = 'Error de conexión al crear alumno.';
            errorMsg.style.display = 'block';
        }
    });
    
    // Modal de confirmación para eliminar
    btnConfirmarEliminar.addEventListener('click', async () => {
        if (alumnoAEliminar) {
            // Ocultar botones mientras se procesa
            btnConfirmarEliminar.style.display = 'none';
            btnCancelarEliminar.style.display = 'none';
            await eliminarAlumno(alumnoAEliminar.matricula, tipoAlumnoActual);
        }
    });
    
    btnCancelarEliminar.addEventListener('click', () => {
        modalEliminarAlumno.style.display = 'none';
        document.getElementById('success-message-eliminar').style.display = 'none';
        btnConfirmarEliminar.style.display = 'block';
        btnCancelarEliminar.style.display = 'block';
        alumnoAEliminar = null;
    });
    
    modalEliminarAlumno.addEventListener('click', (e) => {
        if (e.target === modalEliminarAlumno) {
            modalEliminarAlumno.style.display = 'none';
            document.getElementById('success-message-eliminar').style.display = 'none';
            btnConfirmarEliminar.style.display = 'block';
            btnCancelarEliminar.style.display = 'block';
            alumnoAEliminar = null;
        }
    });
    
    // Función para eliminar alumno
    async function eliminarAlumno(matricula, tipo) {
        const apiUrl = tipo === 'bachillerato'
            ? `https://asistencia-edec.onrender.com/api/alumnos/bachillerato/${matricula}`
            : `https://asistencia-edec.onrender.com/api/alumnos/universidad/${matricula}`;
        
        const successMsgEliminar = document.getElementById('success-message-eliminar');
        
        try {
            const response = await fetch(apiUrl, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.detail || 'Error al eliminar alumno.');
            }
            
            // Mostrar mensaje de éxito en el modal
            successMsgEliminar.textContent = 'Alumno eliminado exitosamente.';
            successMsgEliminar.style.display = 'block';
            
            // Recargar alumnos
            await cargarAlumnos(tipo);
            inputBuscarAlumno.value = '';
            
            // Cerrar modal después de 2 segundos
            setTimeout(() => {
                modalEliminarAlumno.style.display = 'none';
                successMsgEliminar.style.display = 'none';
                btnConfirmarEliminar.style.display = 'block';
                btnCancelarEliminar.style.display = 'block';
                alumnoAEliminar = null;
            }, 2000);
            
        } catch (error) {
            console.error('Error al eliminar alumno:', error);
            // Mostrar error en el modal
            successMsgEliminar.textContent = error.message || 'Error al eliminar alumno. Intenta nuevamente.';
            successMsgEliminar.style.display = 'block';
            successMsgEliminar.style.backgroundColor = '#dc3545';
            // Restaurar botones
            btnConfirmarEliminar.style.display = 'block';
            btnCancelarEliminar.style.display = 'block';
        }
    }
    
    // Función para cargar alumnos desde la API
    async function cargarAlumnos(tipo) {
        tbodyAlumnos.innerHTML = '<tr><td colspan="4" style="text-align: center;">Cargando alumnos...</td></tr>';
        
        const apiUrl = tipo === 'bachillerato' ? API_BACHILLERATO : API_UNIVERSIDAD;
        
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error('Error al cargar alumnos.');
            }
            
            const data = await response.json();
            alumnosGlobales = data.alumnos || [];
            
            // Ordenar por matrícula de mayor a menor
            alumnosGlobales.sort((a, b) => {
                const matriculaA = parseInt(a.matricula) || 0;
                const matriculaB = parseInt(b.matricula) || 0;
                return matriculaB - matriculaA; // Orden descendente
            });
            
            // Aplicar filtro actual si existe
            const termino = inputBuscarAlumno.value.trim().toLowerCase();
            if (termino === '') {
                alumnosFiltrados = [...alumnosGlobales];
            } else {
                alumnosFiltrados = alumnosGlobales.filter(alumno => {
                    const matricula = (alumno.matricula || '').toLowerCase();
                    const nombre = (alumno.nombre || '').toLowerCase();
                    return matricula.includes(termino) || nombre.includes(termino);
                });
            }
            
            renderizarAlumnos();
            renderizarPaginacion();
            
        } catch (error) {
            console.error('Error al cargar alumnos:', error);
            tbodyAlumnos.innerHTML = '<tr><td colspan="3" style="text-align: center; color: red;">Error al cargar alumnos.</td></tr>';
        }
    }
    
    // Función para renderizar alumnos en la tabla
    function renderizarAlumnos() {
        tbodyAlumnos.innerHTML = '';
        
        if (alumnosFiltrados.length === 0) {
            tbodyAlumnos.innerHTML = '<tr><td colspan="4" style="text-align: center;">No hay alumnos registrados.</td></tr>';
            return;
        }
        
        // Calcular índices para la paginación
        const inicio = (paginaActual - 1) * alumnosPorPagina;
        const fin = inicio + alumnosPorPagina;
        const alumnosPagina = alumnosFiltrados.slice(inicio, fin);
        
        alumnosPagina.forEach(alumno => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${alumno.matricula || ''}</td>
                <td>${alumno.nombre || ''}</td>
                <td>${alumno.programa || ''}</td>
                <td>
                    <button class="btn-eliminar-alumno" data-matricula="${alumno.matricula || ''}" title="Eliminar alumno">
                        ×
                    </button>
                </td>
            `;
            tbodyAlumnos.appendChild(fila);
        });
        
        // Agregar event listeners a los botones de eliminar
        const botonesEliminar = document.querySelectorAll('.btn-eliminar-alumno');
        botonesEliminar.forEach(boton => {
            boton.addEventListener('click', () => {
                const matricula = boton.getAttribute('data-matricula');
                const alumno = alumnosFiltrados.find(a => a.matricula === matricula);
                if (alumno) {
                    alumnoAEliminar = alumno;
                    modalEliminarAlumno.style.display = 'flex';
                }
            });
        });
    }
    
    // Función para renderizar la paginación
    function renderizarPaginacion() {
        paginacionAlumnos.innerHTML = '';
        
        if (alumnosFiltrados.length === 0) {
            return;
        }
        
        const totalPaginas = Math.ceil(alumnosFiltrados.length / alumnosPorPagina);
        
        // Botón "Anterior"
        const btnAnterior = document.createElement('button');
        btnAnterior.className = 'btn-pagina';
        btnAnterior.textContent = '←';
        btnAnterior.disabled = paginaActual === 1;
        btnAnterior.addEventListener('click', () => {
            if (paginaActual > 1) {
                paginaActual--;
                renderizarAlumnos();
                renderizarPaginacion();
                // Scroll al inicio de la tabla
                document.querySelector('.tabla-alumnos-container').scrollTop = 0;
            }
        });
        paginacionAlumnos.appendChild(btnAnterior);
        
        // Botones de páginas
        const maxBotones = 5; // Máximo de botones de página a mostrar
        let inicioPagina = Math.max(1, paginaActual - Math.floor(maxBotones / 2));
        let finPagina = Math.min(totalPaginas, inicioPagina + maxBotones - 1);
        
        // Ajustar inicio si estamos cerca del final
        if (finPagina - inicioPagina < maxBotones - 1) {
            inicioPagina = Math.max(1, finPagina - maxBotones + 1);
        }
        
        // Mostrar "..." al inicio si es necesario
        if (inicioPagina > 1) {
            const btnPrimera = document.createElement('button');
            btnPrimera.className = 'btn-pagina';
            btnPrimera.textContent = '1';
            btnPrimera.addEventListener('click', () => {
                paginaActual = 1;
                renderizarAlumnos();
                renderizarPaginacion();
                document.querySelector('.tabla-alumnos-container').scrollTop = 0;
            });
            paginacionAlumnos.appendChild(btnPrimera);
            
            if (inicioPagina > 2) {
                const span = document.createElement('span');
                span.textContent = '...';
                span.style.padding = '0 5px';
                paginacionAlumnos.appendChild(span);
            }
        }
        
        // Botones de páginas
        for (let i = inicioPagina; i <= finPagina; i++) {
            const btnPagina = document.createElement('button');
            btnPagina.className = 'btn-pagina';
            if (i === paginaActual) {
                btnPagina.classList.add('active');
            }
            btnPagina.textContent = i;
            btnPagina.addEventListener('click', () => {
                paginaActual = i;
                renderizarAlumnos();
                renderizarPaginacion();
                document.querySelector('.tabla-alumnos-container').scrollTop = 0;
            });
            paginacionAlumnos.appendChild(btnPagina);
        }
        
        // Mostrar "..." al final si es necesario
        if (finPagina < totalPaginas) {
            if (finPagina < totalPaginas - 1) {
                const span = document.createElement('span');
                span.textContent = '...';
                span.style.padding = '0 5px';
                paginacionAlumnos.appendChild(span);
            }
            
            const btnUltima = document.createElement('button');
            btnUltima.className = 'btn-pagina';
            btnUltima.textContent = totalPaginas;
            btnUltima.addEventListener('click', () => {
                paginaActual = totalPaginas;
                renderizarAlumnos();
                renderizarPaginacion();
                document.querySelector('.tabla-alumnos-container').scrollTop = 0;
            });
            paginacionAlumnos.appendChild(btnUltima);
        }
        
        // Botón "Siguiente"
        const btnSiguiente = document.createElement('button');
        btnSiguiente.className = 'btn-pagina';
        btnSiguiente.textContent = '→';
        btnSiguiente.disabled = paginaActual === totalPaginas;
        btnSiguiente.addEventListener('click', () => {
            if (paginaActual < totalPaginas) {
                paginaActual++;
                renderizarAlumnos();
                renderizarPaginacion();
                // Scroll al inicio de la tabla
                document.querySelector('.tabla-alumnos-container').scrollTop = 0;
            }
        });
        paginacionAlumnos.appendChild(btnSiguiente);
    }
});
