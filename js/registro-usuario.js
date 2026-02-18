// Script reutilizable para registro de usuarios desde páginas de login
document.addEventListener('DOMContentLoaded', function() {
    const API_CREAR_USUARIO = 'https://asistencia-edec.onrender.com/api/usuarios/apodaca/crear';
    
    const modalRegistro = document.getElementById('modalRegistro');
    const btnCrearCuenta = document.getElementById('btnCrearCuenta');
    const btnCerrarModalRegistro = document.getElementById('btnCerrarModalRegistro');
    const btnCancelarRegistro = document.getElementById('btnCancelarRegistro');
    const formRegistro = document.getElementById('formRegistro');
    const mensajeExitoRegistro = document.getElementById('mensajeExitoRegistro');
    const inputNombreCompletoRegistro = document.getElementById('nombreCompletoRegistro');
    
    // Capitalizar primera letra de cada palabra en el input de nombre completo
    if (inputNombreCompletoRegistro) {
        inputNombreCompletoRegistro.addEventListener('input', function(e) {
            const cursorPosition = e.target.selectionStart;
            const value = e.target.value;
            const words = value.split(' ');
            const capitalizedWords = words.map(word => {
                if (word.length === 0) return word;
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            });
            const newValue = capitalizedWords.join(' ');
            e.target.value = newValue;
            // Restaurar posición del cursor
            e.target.setSelectionRange(cursorPosition, cursorPosition);
        });
    }
    
    // Abrir modal de registro
    if (btnCrearCuenta) {
        btnCrearCuenta.addEventListener('click', function(e) {
            e.preventDefault();
            if (modalRegistro) {
                modalRegistro.style.display = 'flex';
                // Ocultar mensaje de éxito si está visible
                if (mensajeExitoRegistro) {
                    mensajeExitoRegistro.style.display = 'none';
                }
                // Mostrar formulario
                const formContainer = modalRegistro.querySelector('.form-registro-container');
                if (formContainer) {
                    formContainer.style.display = 'block';
                }
            }
        });
    }
    
    // Cerrar modal de registro
    function cerrarModalRegistro() {
        if (modalRegistro) {
            modalRegistro.style.display = 'none';
        }
    }
    
    if (btnCerrarModalRegistro) {
        btnCerrarModalRegistro.addEventListener('click', cerrarModalRegistro);
    }
    
    if (btnCancelarRegistro) {
        btnCancelarRegistro.addEventListener('click', cerrarModalRegistro);
    }
    
    // Cerrar modal al hacer click fuera
    if (modalRegistro) {
        modalRegistro.addEventListener('click', function(e) {
            if (e.target === modalRegistro) {
                cerrarModalRegistro();
            }
        });
    }
    
    // Manejar envío del formulario
    if (formRegistro) {
        formRegistro.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const errorMsg = modalRegistro.querySelector('#error-message-registro');
            if (errorMsg) {
                errorMsg.style.display = 'none';
            }
            
            const datos = {
                nombre_completo: document.getElementById('nombreCompletoRegistro').value,
                correo: document.getElementById('correoRegistro').value,
                contraseña: document.getElementById('contraseñaRegistro').value,
                rol: document.getElementById('rolRegistro').value,
                campus: document.getElementById('campusRegistro').value
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
                    if (errorMsg) {
                        errorMsg.textContent = data.detail || 'Error al crear cuenta.';
                        errorMsg.style.display = 'block';
                    }
                    return;
                }
                
                // Ocultar formulario y mostrar mensaje de éxito
                const formContainer = modalRegistro.querySelector('.form-registro-container');
                if (formContainer) {
                    formContainer.style.display = 'none';
                }
                
                if (mensajeExitoRegistro) {
                    mensajeExitoRegistro.style.display = 'block';
                }
                
                // Limpiar formulario
                formRegistro.reset();
                
                // Cerrar modal después de 6 segundos
                setTimeout(() => {
                    cerrarModalRegistro();
                    // Restaurar formulario para próxima vez
                    if (formContainer) {
                        formContainer.style.display = 'block';
                    }
                    if (mensajeExitoRegistro) {
                        mensajeExitoRegistro.style.display = 'none';
                    }
                }, 6000);
                
            } catch (error) {
                console.error('Error al crear cuenta:', error);
                if (errorMsg) {
                    errorMsg.textContent = 'Error de conexión. Por favor, inténtalo de nuevo.';
                    errorMsg.style.display = 'block';
                }
            }
        });
    }
});
