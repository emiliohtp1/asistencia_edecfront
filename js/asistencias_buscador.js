const API_TODAS_ASISTENCIAS_APODACA = "https://asistencia-edec.onrender.com/api/asistencias/apodaca/todas";
const API_BUSCAR_MATRICULA_APODACA = "https://asistencia-edec.onrender.com/api/asistencias/apodaca/";
const API_FICHADOS = "https://asistencia-edec.onrender.com/api/fichados/apodaca";

let inputBuscarMatricula;
let btnBuscar;
let btnFichados;
let tbodyAsistencias;
let mensajeSinResultados;
let btnCerrarSesion;
let intervaloActualizacion;
let btnFiltros;
let panelFiltros;
let filtrosOverlay;
let btnCerrarFiltros;
let filtroDia;
let filtroMes;
let btnLimpiarDia;
let btnLimpiarMes;
let todasLasAsistencias = []; // Almacenar todas las asistencias cargadas

// Elementos para fichados
let contenedorFichados;
let contenedorAsistencias;
let btnRegresar;
let tbodyFichados;

// Elementos para Excel
let btnExcel;
let modalExcelOverlay;
let modalExcel;
let btnCerrarModalExcel;
let btnCancelarExcel;
let btnGenerarExcel;
let excelFiltroDia;
let excelFiltroMes;

// ==============================
//   CARGAR TODAS LAS ASISTENCIAS AL INICIO
// ==============================
async function cargarTodasLasAsistencias() {
    try {
        const response = await fetch(API_TODAS_ASISTENCIAS_APODACA);
        
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
        const response = await fetch(`${API_BUSCAR_MATRICULA_APODACA}${matricula.trim()}`);
        
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

    // Filtrar por día (número del 1 al 31)
    if (filtroDia && filtroDia.value) {
        const diaFiltro = parseInt(filtroDia.value);
        asistenciasFiltradas = asistenciasFiltradas.filter(asistencia => {
            const fechaAsistencia = (asistencia.Fecha || '').split(' ')[0]; // Si viene con hora, tomar solo la fecha
            let diaAsistencia;
            
            // Extraer el día según el formato de fecha
            if (fechaAsistencia.includes('-')) {
                // Formato YYYY-MM-DD o DD-MM-YYYY
                const partes = fechaAsistencia.split('-');
                // Si el primer número es mayor a 31, es año (formato YYYY-MM-DD)
                if (parseInt(partes[0]) > 31) {
                    diaAsistencia = parseInt(partes[2]);
                } else {
                    // Formato DD-MM-YYYY
                    diaAsistencia = parseInt(partes[0]);
                }
            } else if (fechaAsistencia.includes('/')) {
                // Formato DD/MM/YYYY o YYYY/MM/DD
                const partes = fechaAsistencia.split('/');
                // Si el primer número es mayor a 31, es año (formato YYYY/MM/DD)
                if (parseInt(partes[0]) > 31) {
                    diaAsistencia = parseInt(partes[2]);
                } else {
                    // Formato DD/MM/YYYY
                    diaAsistencia = parseInt(partes[0]);
                }
            } else {
                return false; // Formato desconocido
            }
            
            return diaAsistencia === diaFiltro;
        });
    }

    // Filtrar por mes (número del 1 al 12)
    if (filtroMes && filtroMes.value) {
        const mesFiltro = parseInt(filtroMes.value);
        asistenciasFiltradas = asistenciasFiltradas.filter(asistencia => {
            const fechaAsistencia = (asistencia.Fecha || '').split(' ')[0]; // Si viene con hora, tomar solo la fecha
            let mesAsistencia;
            
            // Extraer el mes según el formato de fecha
            if (fechaAsistencia.includes('-')) {
                // Formato YYYY-MM-DD o DD-MM-YYYY
                const partes = fechaAsistencia.split('-');
                // El mes siempre es la segunda parte
                mesAsistencia = parseInt(partes[1]);
            } else if (fechaAsistencia.includes('/')) {
                // Formato DD/MM/YYYY o YYYY/MM/DD
                const partes = fechaAsistencia.split('/');
                // El mes siempre es la segunda parte
                mesAsistencia = parseInt(partes[1]);
            } else {
                return false; // Formato desconocido
            }
            
            return mesAsistencia === mesFiltro;
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
            <td>${asistencia.Matricula || ''}</td>
            <td>${asistencia.Nombre || ''}</td>
            <td>${asistencia.Fecha || ''}</td>
            <td>${asistencia.Hora || ''}</td>
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
    }, 2000);
}

function detenerActualizacionAutomatica() {
    if (intervaloActualizacion) {
        clearInterval(intervaloActualizacion);
        intervaloActualizacion = null;
    }
}

// ==============================
//   CARGAR FICHADOS
// ==============================
async function cargarFichados() {
    tbodyFichados.innerHTML = '<tr><td colspan="4" style="text-align: center;">Cargando fichados...</td></tr>';
    
    try {
        const response = await fetch(API_FICHADOS);
        
        if (!response.ok) {
            throw new Error('Error al cargar los fichados.');
        }
        
        const data = await response.json();
        const fichados = data.fichados || [];
        
        if (fichados.length === 0) {
            tbodyFichados.innerHTML = '<tr><td colspan="4" style="text-align: center;">No hay alumnos fichados.</td></tr>';
            return;
        }
        
        tbodyFichados.innerHTML = '';
        
        fichados.forEach(fichado => {
            const fila = document.createElement('tr');
            const cantidadFichas = fichado.cantidad_fichas || 0;
            const claseFichas = cantidadFichas >= 3 ? 'fichas-rojo' : '';
            
            fila.innerHTML = `
                <td>${fichado.matricula || ''}</td>
                <td>${fichado.nombre || ''}</td>
                <td>${fichado.programa || ''}</td>
                <td class="${claseFichas}">${cantidadFichas}</td>
            `;
            tbodyFichados.appendChild(fila);
        });
        
    } catch (error) {
        console.error('Error al cargar fichados:', error);
        tbodyFichados.innerHTML = '<tr><td colspan="4" style="text-align: center; color: red;">Error al cargar fichados.</td></tr>';
    }
}

// ==============================
//   CAMBIAR A VISTA DE FICHADOS
// ==============================
function mostrarVistaFichados() {
    // Ocultar contenedor de asistencias
    const tablaAsistencias = document.getElementById('tablaAsistencias');
    const mensajeSinResultados = document.getElementById('mensajeSinResultados');
    const buscadorHeader = document.querySelector('.buscador-header');
    
    tablaAsistencias.style.display = 'none';
    mensajeSinResultados.style.display = 'none';
    buscadorHeader.style.display = 'none';
    
    // Detener actualización automática
    detenerActualizacionAutomatica();
    
    // Mostrar contenedor de fichados
    contenedorFichados.style.display = 'block';
    
    // Cargar fichados
    cargarFichados();
}

// ==============================
//   REGRESAR A VISTA DE ASISTENCIAS
// ==============================
function mostrarVistaAsistencias() {
    // Ocultar contenedor de fichados
    contenedorFichados.style.display = 'none';
    
    // Mostrar contenedor de asistencias
    const tablaAsistencias = document.getElementById('tablaAsistencias');
    const buscadorHeader = document.querySelector('.buscador-header');
    
    buscadorHeader.style.display = 'flex';
    tablaAsistencias.style.display = 'table';
    
    // Reiniciar actualización automática
    iniciarActualizacionAutomatica();
    
    // Recargar asistencias
    cargarTodasLasAsistencias();
}


// ==============================
//   INICIALIZACIÓN
// ==============================
document.addEventListener('DOMContentLoaded', () => {
    // Obtener referencias a los elementos del DOM
    inputBuscarMatricula = document.getElementById("inputBuscarMatricula");
    btnBuscar = document.getElementById("btnBuscar");
    btnFichados = document.getElementById("btnFichados");
    tbodyAsistencias = document.getElementById("tbodyAsistencias");
    mensajeSinResultados = document.getElementById("mensajeSinResultados");
    btnCerrarSesion = document.getElementById("btnCerrarSesion");
    btnFiltros = document.getElementById("btnFiltros");
    panelFiltros = document.getElementById("panelFiltros");
    filtrosOverlay = document.getElementById("filtrosOverlay");
    btnCerrarFiltros = document.getElementById("btnCerrarFiltros");
    filtroDia = document.getElementById("filtroDia");
    filtroMes = document.getElementById("filtroMes");
    btnLimpiarDia = document.getElementById("btnLimpiarDia");
    btnLimpiarMes = document.getElementById("btnLimpiarMes");
    
    // Elementos para fichados
    contenedorFichados = document.getElementById("contenedorFichados");
    btnRegresar = document.getElementById("btnRegresar");
    tbodyFichados = document.getElementById("tbodyFichados");
    
    // Elementos para Excel
    btnExcel = document.getElementById("btnExcel");
    modalExcelOverlay = document.getElementById("modalExcelOverlay");
    modalExcel = document.getElementById("modalExcel");
    btnCerrarModalExcel = document.getElementById("btnCerrarModalExcel");
    btnCancelarExcel = document.getElementById("btnCancelarExcel");
    btnGenerarExcel = document.getElementById("btnGenerarExcel");
    excelFiltroDia = document.getElementById("excelFiltroDia");
    excelFiltroMes = document.getElementById("excelFiltroMes");

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

    // Función para abrir la ventana flotante de filtros
    function abrirFiltros() {
        filtrosOverlay.style.display = 'flex';
        panelFiltros.style.display = 'block';
    }

    // Función para cerrar la ventana flotante de filtros
    function cerrarFiltros() {
        filtrosOverlay.style.display = 'none';
        panelFiltros.style.display = 'none';
    }

    // Toggle panel de filtros
    btnFiltros.addEventListener("click", () => {
        if (panelFiltros.style.display === 'none') {
            abrirFiltros();
        } else {
            cerrarFiltros();
        }
    });

    // Cerrar al hacer clic en el overlay
    filtrosOverlay.addEventListener("click", (e) => {
        if (e.target === filtrosOverlay) {
            cerrarFiltros();
        }
    });

    // Cerrar con el botón X
    btnCerrarFiltros.addEventListener("click", () => {
        cerrarFiltros();
    });

    // Aplicar filtros cuando cambien los valores
    filtroDia.addEventListener("input", () => {
        aplicarFiltros();
    });

    filtroDia.addEventListener("change", () => {
        aplicarFiltros();
    });

    filtroMes.addEventListener("input", () => {
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

    // Función para limpiar todas las credenciales
    function limpiarTodasLasCredenciales() {
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("isLoggedInBuscador");
        localStorage.removeItem("isLoggedInBuscadorAlumnos");
        localStorage.removeItem("isLoggedInAdmin");
        localStorage.removeItem("adminCorreo");
        localStorage.removeItem("adminRol");
        localStorage.removeItem("adminContraseña");
    }

    // Event listeners para fichados
    btnFichados.addEventListener("click", () => {
        mostrarVistaFichados();
    });
    
    btnRegresar.addEventListener("click", () => {
        mostrarVistaAsistencias();
    });

    // Cerrar sesión
    btnCerrarSesion.addEventListener("click", () => {
        if (confirm("¿Estás seguro de que deseas cerrar sesión?")) {
            limpiarTodasLasCredenciales();
            window.location.href = "asistenciaslogin.html";
        }
    });

    // Cargar todas las asistencias al iniciar
    cargarTodasLasAsistencias();
    
    // Iniciar actualización automática
    iniciarActualizacionAutomatica();
    
    // ==============================
    //   FUNCIONALIDAD DE EXCEL
    // ==============================
    
    // Función para abrir el modal de Excel
    function abrirModalExcel() {
        modalExcelOverlay.style.display = 'flex';
        modalExcel.style.display = 'block';
    }
    
    // Función para cerrar el modal de Excel
    function cerrarModalExcel() {
        modalExcelOverlay.style.display = 'none';
        modalExcel.style.display = 'none';
    }
    
    // Event listeners para el modal de Excel
    btnExcel.addEventListener("click", () => {
        abrirModalExcel();
    });
    
    btnCerrarModalExcel.addEventListener("click", () => {
        cerrarModalExcel();
    });
    
    btnCancelarExcel.addEventListener("click", () => {
        cerrarModalExcel();
    });
    
    modalExcelOverlay.addEventListener("click", (e) => {
        if (e.target === modalExcelOverlay) {
            cerrarModalExcel();
        }
    });
    
    // Función para extraer día de una fecha
    function extraerDia(fecha) {
        if (!fecha) return null;
        const fechaAsistencia = fecha.split(' ')[0];
        
        if (fechaAsistencia.includes('-')) {
            const partes = fechaAsistencia.split('-');
            if (parseInt(partes[0]) > 31) {
                return parseInt(partes[2]);
            } else {
                return parseInt(partes[0]);
            }
        } else if (fechaAsistencia.includes('/')) {
            const partes = fechaAsistencia.split('/');
            if (parseInt(partes[0]) > 31) {
                return parseInt(partes[2]);
            } else {
                return parseInt(partes[0]);
            }
        }
        return null;
    }
    
    // Función para extraer mes de una fecha
    function extraerMes(fecha) {
        if (!fecha) return null;
        const fechaAsistencia = fecha.split(' ')[0];
        
        if (fechaAsistencia.includes('-')) {
            const partes = fechaAsistencia.split('-');
            return parseInt(partes[1]);
        } else if (fechaAsistencia.includes('/')) {
            const partes = fechaAsistencia.split('/');
            return parseInt(partes[1]);
        }
        return null;
    }
    
    // Función para filtrar asistencias según los filtros del modal Excel
    function filtrarAsistenciasParaExcel() {
        let asistenciasFiltradas = [...todasLasAsistencias];
        
        const diaSeleccionado = excelFiltroDia.value;
        const mesSeleccionado = excelFiltroMes.value;
        
        // Filtrar por día
        if (diaSeleccionado !== 'todos') {
            const diaFiltro = parseInt(diaSeleccionado);
            asistenciasFiltradas = asistenciasFiltradas.filter(asistencia => {
                const diaAsistencia = extraerDia(asistencia.Fecha);
                return diaAsistencia === diaFiltro;
            });
        }
        
        // Filtrar por mes
        if (mesSeleccionado !== 'todos') {
            const mesFiltro = parseInt(mesSeleccionado);
            asistenciasFiltradas = asistenciasFiltradas.filter(asistencia => {
                const mesAsistencia = extraerMes(asistencia.Fecha);
                return mesAsistencia === mesFiltro;
            });
        }
        
        return asistenciasFiltradas;
    }
    
    // Función para ordenar por matrícula (valores numéricos en string, de menor a mayor)
    function ordenarPorMatricula(asistencias) {
        return asistencias.sort((a, b) => {
            const matriculaA = parseInt(a.Matricula || '0') || 0;
            const matriculaB = parseInt(b.Matricula || '0') || 0;
            return matriculaA - matriculaB;
        });
    }
    
    // Función para generar el archivo Excel
    function generarExcel() {
        try {
            // Filtrar asistencias según los filtros seleccionados
            let asistenciasFiltradas = filtrarAsistenciasParaExcel();
            
            if (asistenciasFiltradas.length === 0) {
                alert('No hay datos para exportar con los filtros seleccionados.');
                return;
            }
            
            // Ordenar por matrícula
            asistenciasFiltradas = ordenarPorMatricula(asistenciasFiltradas);
            
            // Preparar los datos para Excel
            const datosExcel = asistenciasFiltradas.map(asistencia => ({
                'Matricula': asistencia.Matricula || '',
                'Nombre': asistencia.Nombre || '',
                'Fecha': asistencia.Fecha || '',
                'Hora': asistencia.Hora || ''
            }));
            
            // Crear el libro de trabajo
            const wb = XLSX.utils.book_new();
            
            // Crear la hoja de trabajo
            const ws = XLSX.utils.json_to_sheet(datosExcel);
            
            // Agregar la hoja al libro
            XLSX.utils.book_append_sheet(wb, ws, 'Asistencias');
            
            // Generar el nombre del archivo con fecha y hora
            const fecha = new Date();
            const fechaStr = fecha.toISOString().split('T')[0];
            const horaStr = fecha.toTimeString().split(' ')[0].replace(/:/g, '-');
            const nombreArchivo = `Asistencias_${fechaStr}_${horaStr}.xlsx`;
            
            // Escribir el archivo
            XLSX.writeFile(wb, nombreArchivo);
            
            // Cerrar el modal
            cerrarModalExcel();
            
            alert(`Archivo Excel generado exitosamente: ${nombreArchivo}`);
        } catch (error) {
            console.error('Error al generar Excel:', error);
            alert('Error al generar el archivo Excel. Por favor, inténtalo de nuevo.');
        }
    }
    
    // Event listener para generar Excel
    btnGenerarExcel.addEventListener("click", () => {
        generarExcel();
    });
});
