// Aplicación principal del sistema de asistencia

// Elementos del DOM
const form = document.getElementById('asistenciaForm');
const inputMatricula = document.getElementById('matricula');
const radioEntrada = document.querySelector('input[value="entrada"]');
const radioSalida = document.querySelector('input[value="salida"]');
const btnRegistrar = document.getElementById('btnRegistrar');
const infoUsuario = document.getElementById('infoUsuario');
const nombreUsuario = document.getElementById('nombreUsuario');
const carreraUsuario = document.getElementById('carreraUsuario');
const tipoUsuario = document.getElementById('tipoUsuario');
const mensajeDiv = document.getElementById('mensaje');

// Estado de la aplicación
let usuarioActual = null;
let tipoRegistroSeleccionado = null;

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    inicializarApp();
});

function inicializarApp() {
    // Limpiar formulario al cargar
    form.reset();
    ocultarMensaje();
    ocultarInfoUsuario();
    deshabilitarBoton();
    
    // Event listener para el input de matrícula
    inputMatricula.addEventListener('input', debounce(validarMatricula, 500));
    
    // Event listener para los radio buttons
    radioEntrada.addEventListener('change', () => {
        if (radioEntrada.checked) {
            tipoRegistroSeleccionado = 'entrada';
            verificarEstadoFormulario();
        }
    });
    
    radioSalida.addEventListener('change', () => {
        if (radioSalida.checked) {
            tipoRegistroSeleccionado = 'salida';
            verificarEstadoFormulario();
        }
    });
    
    // Event listener para el formulario
    form.addEventListener('submit', manejarSubmit);
    
    // Focus en el input de matrícula
    inputMatricula.focus();
}

/**
 * Valida la matrícula y obtiene la información del usuario
 */
async function validarMatricula() {
    const matricula = inputMatricula.value.trim();
    
    if (matricula.length < 3) {
        ocultarInfoUsuario();
        deshabilitarBoton();
        usuarioActual = null;
        return;
    }
    
    try {
        mostrarMensaje('Buscando usuario...', 'info');
        const usuario = await obtenerUsuario(matricula);
        
        if (usuario.encontrado) {
            usuarioActual = usuario;
            mostrarInfoUsuario(usuario);
            verificarEstadoFormulario();
            ocultarMensaje();
        } else {
            ocultarInfoUsuario();
            deshabilitarBoton();
            mostrarMensaje('Usuario no encontrado', 'error');
            usuarioActual = null;
        }
    } catch (error) {
        ocultarInfoUsuario();
        deshabilitarBoton();
        mostrarMensaje(error.message || 'Error al buscar usuario', 'error');
        usuarioActual = null;
    }
}

/**
 * Muestra la información del usuario
 */
function mostrarInfoUsuario(usuario) {
    nombreUsuario.textContent = usuario.nombre_completo;
    carreraUsuario.textContent = usuario.carrera;
    tipoUsuario.textContent = usuario.tipo === 'alumno' ? 'Alumno' : 'Maestro';
    infoUsuario.classList.remove('hidden');
}

/**
 * Oculta la información del usuario
 */
function ocultarInfoUsuario() {
    infoUsuario.classList.add('hidden');
    nombreUsuario.textContent = '-';
    carreraUsuario.textContent = '-';
    tipoUsuario.textContent = '-';
}

/**
 * Verifica el estado del formulario y habilita/deshabilita el botón
 */
function verificarEstadoFormulario() {
    if (usuarioActual && tipoRegistroSeleccionado) {
        habilitarBoton();
    } else {
        deshabilitarBoton();
    }
}

/**
 * Habilita el botón de registrar
 */
function habilitarBoton() {
    btnRegistrar.disabled = false;
}

/**
 * Deshabilita el botón de registrar
 */
function deshabilitarBoton() {
    btnRegistrar.disabled = true;
}

/**
 * Maneja el envío del formulario
 */
async function manejarSubmit(event) {
    event.preventDefault();
    
    if (!usuarioActual || !tipoRegistroSeleccionado) {
        mostrarMensaje('Por favor complete todos los campos', 'error');
        return;
    }
    
    try {
        deshabilitarBoton();
        btnRegistrar.innerHTML = '<span class="loading"></span> Registrando...';
        mostrarMensaje('Registrando asistencia...', 'info');
        
        const resultado = await registrarAsistencia(
            usuarioActual.matricula,
            tipoRegistroSeleccionado
        );
        
        // Mostrar mensaje de éxito
        mostrarMensaje(resultado.mensaje || 'Asistencia del usuario registrada', 'success');
        
        // Limpiar formulario después de 2 segundos
        setTimeout(() => {
            form.reset();
            ocultarInfoUsuario();
            ocultarMensaje();
            usuarioActual = null;
            tipoRegistroSeleccionado = null;
            inputMatricula.focus();
            btnRegistrar.innerHTML = 'Registrar Asistencia';
        }, 2000);
        
    } catch (error) {
        mostrarMensaje(error.message || 'Error al registrar asistencia', 'error');
        habilitarBoton();
        btnRegistrar.innerHTML = 'Registrar Asistencia';
    }
}

/**
 * Muestra un mensaje al usuario
 */
function mostrarMensaje(texto, tipo = 'info') {
    mensajeDiv.textContent = texto;
    mensajeDiv.className = `mensaje ${tipo}`;
    mensajeDiv.classList.remove('hidden');
}

/**
 * Oculta el mensaje
 */
function ocultarMensaje() {
    mensajeDiv.classList.add('hidden');
}

/**
 * Función debounce para optimizar las búsquedas
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

