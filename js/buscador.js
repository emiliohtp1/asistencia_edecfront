const API_TODAS_ASISTENCIAS = "https://asistencia-edec.onrender.com/api/asistencias/todas";
const API_BUSCAR_MATRICULA = "https://asistencia-edec.onrender.com/api/asistencias/matricula/";

let inputBuscarMatricula;
let btnBuscar;
let tbodyAsistencias;
let mensajeSinResultados;
let btnCerrarSesion;
let intervaloActualizacion;
let btnFiltros;
let panelFiltros;
let filtroDia;
let filtroMes;
let btnLimpiarDia;
let btnLimpiarMes;
let todasLasAsistencias = []; // Almacenar todas las asistencias cargadas

// ==============================
//   CARGAR TODAS LAS ASISTENCIAS AL INICIO
// ==============================
async function cargarTodasLasAsistencias() {
    try {
        const response = await fetch(API_TODAS_ASISTENCIAS);
        
        if (!response.ok) {
            throw new Error('Error al cargar las asistencias.');
        }

        const data = await response.json();
        todasLasAsistencias = data.asistencias || [];
        aplicarFiltros();
    } catch (error) {
        console.error('Error:', error);
        mostrarMensajeError('Error al cargar las asistencias del día.');
    }
}

// ==============================
//   BUSCAR POR MATRÍCULA
// ==============================
async function buscarPorMatricula(matricula) {
    if (!matricula || matricula.trim() === '') {
        // Si está vacío, cargar todas las asistencias
        cargarTodasLasAsistencias();
        return;
    }

    try {
        const response = await fetch(`${API_BUSCAR_MATRICULA}${matricula.trim()}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                todasLasAsistencias = [];
                aplicarFiltros();
                return;
            }
            throw new Error('Error al buscar la matrícula.');
        }

        const data = await response.json();
        todasLasAsistencias = data.asistencias || [];
        aplicarFiltros();
    } catch (error) {
        console.error('Error:', error);
        mostrarMensajeError('Error al buscar la matrícula.');
    }
}

// ==============================
//   APLICAR FILTROS
// ==============================
function aplicarFiltros() {
    // Verificar que los elementos del DOM estén inicializados
    if (!filtroDia || !filtroMes) {
        mostrarAsistencias(todasLasAsistencias);
        return;
    }

    let asistenciasFiltradas = [...todasLasAsistencias];

    // Filtrar por día
    if (filtroDia && filtroDia.value) {
        const fechaFiltro = filtroDia.value;
        asistenciasFiltradas = asistenciasFiltradas.filter(asistencia => {
            // Comparar solo la fecha (sin hora)
            const fechaAsistencia = asistencia.fecha.split(' ')[0]; // Si viene con hora, tomar solo la fecha
            return fechaAsistencia === fechaFiltro || asistencia.fecha.startsWith(fechaFiltro);
        });
    }

    // Filtrar por mes
    if (filtroMes && filtroMes.value) {
        const [año, mes] = filtroMes.value.split('-');
        asistenciasFiltradas = asistenciasFiltradas.filter(asistencia => {
            const fechaAsistencia = asistencia.fecha.split(' ')[0]; // Si viene con hora, tomar solo la fecha
            const [añoAsistencia, mesAsistencia] = fechaAsistencia.split('-');
            return añoAsistencia === año && mesAsistencia === mes;
        });
    }

    mostrarAsistencias(asistenciasFiltradas);
}

// ==============================
//   MOSTRAR ASISTENCIAS EN LA TABLA
// ==============================
function mostrarAsistencias(asistencias) {
    tbodyAsistencias.innerHTML = '';

    if (asistencias.length === 0) {
        mensajeSinResultados.style.display = 'block';
        return;
    }

    mensajeSinResultados.style.display = 'none';

    asistencias.forEach(asistencia => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${asistencia.matricula}</td>
            <td>${asistencia.fecha}</td>
            <td>${asistencia.hora}</td>
        `;
        tbodyAsistencias.appendChild(fila);
    });
}

// ==============================
//   MOSTRAR MENSAJE DE ERROR
// ==============================
function mostrarMensajeError(mensaje) {
    tbodyAsistencias.innerHTML = '';
    mensajeSinResultados.textContent = mensaje;
    mensajeSinResultados.style.display = 'block';
}

// ==============================
//   ACTUALIZACIÓN AUTOMÁTICA
// ==============================
function actualizarTabla() {
    const matricula = inputBuscarMatricula.value.trim();
    
    if (matricula === '') {
        // Si no hay búsqueda activa, cargar todas las asistencias
        cargarTodasLasAsistencias();
    } else {
        // Si hay una búsqueda activa, actualizar esa búsqueda
        buscarPorMatricula(matricula);
    }
}

function iniciarActualizacionAutomatica() {
    // Limpiar intervalo anterior si existe
    if (intervaloActualizacion) {
        clearInterval(intervaloActualizacion);
    }
    
    // Actualizar cada 5 segundos
    intervaloActualizacion = setInterval(() => {
        actualizarTabla();
    }, 5000);
}

function detenerActualizacionAutomatica() {
    if (intervaloActualizacion) {
        clearInterval(intervaloActualizacion);
        intervaloActualizacion = null;
    }
}


// ==============================
//   INICIALIZACIÓN
// ==============================
document.addEventListener('DOMContentLoaded', () => {
    // Obtener referencias a los elementos del DOM
    inputBuscarMatricula = document.getElementById("inputBuscarMatricula");
    btnBuscar = document.getElementById("btnBuscar");
    tbodyAsistencias = document.getElementById("tbodyAsistencias");
    mensajeSinResultados = document.getElementById("mensajeSinResultados");
    btnCerrarSesion = document.getElementById("btnCerrarSesion");
    btnFiltros = document.getElementById("btnFiltros");
    panelFiltros = document.getElementById("panelFiltros");
    filtroDia = document.getElementById("filtroDia");
    filtroMes = document.getElementById("filtroMes");
    btnLimpiarDia = document.getElementById("btnLimpiarDia");
    btnLimpiarMes = document.getElementById("btnLimpiarMes");

    // Configurar event listeners
    btnBuscar.addEventListener("click", () => {
        const matricula = inputBuscarMatricula.value.trim();
        buscarPorMatricula(matricula);
    });

    inputBuscarMatricula.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            const matricula = inputBuscarMatricula.value.trim();
            buscarPorMatricula(matricula);
        }
    });

    // Permitir buscar todas si se limpia el campo
    inputBuscarMatricula.addEventListener("input", (e) => {
        if (e.target.value.trim() === '') {
            cargarTodasLasAsistencias();
        }
    });

    // Toggle panel de filtros
    btnFiltros.addEventListener("click", () => {
        if (panelFiltros.style.display === 'none') {
            panelFiltros.style.display = 'block';
        } else {
            panelFiltros.style.display = 'none';
        }
    });

    // Aplicar filtros cuando cambien los valores
    filtroDia.addEventListener("change", () => {
        aplicarFiltros();
    });

    filtroMes.addEventListener("change", () => {
        aplicarFiltros();
    });

    // Limpiar filtros
    btnLimpiarDia.addEventListener("click", () => {
        filtroDia.value = '';
        aplicarFiltros();
    });

    btnLimpiarMes.addEventListener("click", () => {
        filtroMes.value = '';
        aplicarFiltros();
    });
    
    // Limpiar intervalo cuando la página se cierre o se navegue
    window.addEventListener("beforeunload", () => {
        detenerActualizacionAutomatica();
    });

    // Cerrar sesión
    btnCerrarSesion.addEventListener("click", () => {
        if (confirm("¿Estás seguro de que deseas cerrar sesión?")) {
            localStorage.removeItem("isLoggedInBuscador");
            window.location.href = "buscadorlogin.html";
        }
    });

    // Cargar todas las asistencias al iniciar
    cargarTodasLasAsistencias();
    
    // Iniciar actualización automática
    iniciarActualizacionAutomatica();
});
