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
let btnExcelFichados;
let mensajeExitoFichados;
let todosLosFichados = []; // Almacenar todos los fichados cargados

// Elementos para Excel
let btnExcel;
let modalExcelOverlay;
let modalExcel;
let btnCerrarModalExcel;
let btnCancelarExcel;
let btnGenerarExcel;
let excelFiltroFecha;
let btnLimpiarFechaExcel;
let mensajeExitoExcel;

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
        
        // Almacenar fichados globalmente
        todosLosFichados = fichados;
        
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
    btnExcelFichados = document.getElementById("btnExcelFichados");
    mensajeExitoFichados = document.getElementById("mensajeExitoFichados");
    
    // Elementos para Excel
    btnExcel = document.getElementById("btnExcel");
    modalExcelOverlay = document.getElementById("modalExcelOverlay");
    modalExcel = document.getElementById("modalExcel");
    btnCerrarModalExcel = document.getElementById("btnCerrarModalExcel");
    btnCancelarExcel = document.getElementById("btnCancelarExcel");
    btnGenerarExcel = document.getElementById("btnGenerarExcel");
    excelFiltroFecha = document.getElementById("excelFiltroFecha");
    btnLimpiarFechaExcel = document.getElementById("btnLimpiarFechaExcel");
    mensajeExitoExcel = document.getElementById("mensajeExitoExcel");

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
        localStorage.removeItem("buscadorCorreo");
        localStorage.removeItem("buscadorRol");
        localStorage.removeItem("asistenciasCorreo");
        localStorage.removeItem("asistenciasRol");
        localStorage.removeItem("registradorCorreo");
        localStorage.removeItem("registradorRol");
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
        if (modalExcelOverlay && modalExcel) {
            modalExcelOverlay.style.display = 'flex';
        }
    }
    
    // Función para cerrar el modal de Excel
    function cerrarModalExcel() {
        if (modalExcelOverlay) {
            modalExcelOverlay.style.display = 'none';
        }
    }
    
    // Event listeners para el modal de Excel
    if (btnExcel) {
        btnExcel.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            abrirModalExcel();
        });
    }
    
    if (btnCerrarModalExcel) {
        btnCerrarModalExcel.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            cerrarModalExcel();
        });
    }
    
    if (btnCancelarExcel) {
        btnCancelarExcel.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            cerrarModalExcel();
        });
    }
    
    if (modalExcelOverlay) {
        modalExcelOverlay.addEventListener("click", (e) => {
            // Solo cerrar si se hace clic directamente en el overlay, no en el contenido del modal
            if (e.target === modalExcelOverlay) {
                cerrarModalExcel();
            }
        });
    }
    
    // Prevenir que los clics dentro del modal lo cierren
    if (modalExcel) {
        modalExcel.addEventListener("click", (e) => {
            e.stopPropagation();
        });
    }
    
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
    
    // Función para convertir fecha a formato YYYY-MM-DD
    function formatearFechaParaComparacion(fecha) {
        if (!fecha) return null;
        const fechaAsistencia = fecha.split(' ')[0]; // Tomar solo la fecha, sin la hora
        
        // Convertir diferentes formatos a YYYY-MM-DD
        if (fechaAsistencia.includes('-')) {
            const partes = fechaAsistencia.split('-');
            // Si el primer número es mayor a 31, es año (formato YYYY-MM-DD)
            if (parseInt(partes[0]) > 31) {
                return fechaAsistencia; // Ya está en formato YYYY-MM-DD
            } else {
                // Formato DD-MM-YYYY, convertir a YYYY-MM-DD
                return `${partes[2]}-${partes[1]}-${partes[0]}`;
            }
        } else if (fechaAsistencia.includes('/')) {
            const partes = fechaAsistencia.split('/');
            // Si el primer número es mayor a 31, es año (formato YYYY/MM/DD)
            if (parseInt(partes[0]) > 31) {
                return fechaAsistencia.replace(/\//g, '-'); // Convertir / a -
            } else {
                // Formato DD/MM/YYYY, convertir a YYYY-MM-DD
                return `${partes[2]}-${partes[1]}-${partes[0]}`;
            }
        }
        return null;
    }
    
    // Función para filtrar asistencias según los filtros del modal Excel
    function filtrarAsistenciasParaExcel() {
        let asistenciasFiltradas = [...todasLasAsistencias];
        
        const fechaSeleccionada = excelFiltroFecha.value;
        
        // Si hay una fecha seleccionada, filtrar por esa fecha
        if (fechaSeleccionada && fechaSeleccionada !== '') {
            asistenciasFiltradas = asistenciasFiltradas.filter(asistencia => {
                const fechaAsistencia = formatearFechaParaComparacion(asistencia.Fecha);
                return fechaAsistencia === fechaSeleccionada;
            });
        }
        // Si no hay fecha seleccionada, retornar todas las asistencias
        
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
    async function generarExcel() {
        try {
            // Filtrar asistencias según los filtros seleccionados
            let asistenciasFiltradas = filtrarAsistenciasParaExcel();
            
            if (asistenciasFiltradas.length === 0) {
                alert('No hay datos para exportar con los filtros seleccionados.');
                return;
            }
            
            // Ordenar por matrícula
            asistenciasFiltradas = ordenarPorMatricula(asistenciasFiltradas);
            
            // Crear un nuevo libro de trabajo
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Asistencias');
            
            // Definir los headers
            const headers = ['Matricula', 'Nombre', 'Fecha', 'Hora'];
            
            // Agregar headers con estilo
            const headerRow = worksheet.addRow(headers);
            headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            headerRow.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF0B0B63' } // Color #0b0b63
            };
            headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
            headerRow.height = 20;
            
            // Agregar los datos
            asistenciasFiltradas.forEach(asistencia => {
                const row = worksheet.addRow([
                    asistencia.Matricula || '',
                    asistencia.Nombre || '',
                    asistencia.Fecha || '',
                    asistencia.Hora || ''
                ]);
                
                // Aplicar bordes negros a todas las celdas de la fila
                row.eachCell({ includeEmpty: true }, (cell) => {
                    cell.border = {
                        top: { style: 'thin', color: { argb: 'FF000000' } },
                        left: { style: 'thin', color: { argb: 'FF000000' } },
                        bottom: { style: 'thin', color: { argb: 'FF000000' } },
                        right: { style: 'thin', color: { argb: 'FF000000' } }
                    };
                });
            });
            
            // Aplicar bordes a los headers también
            headerRow.eachCell({ includeEmpty: true }, (cell) => {
                cell.border = {
                    top: { style: 'thin', color: { argb: 'FF000000' } },
                    left: { style: 'thin', color: { argb: 'FF000000' } },
                    bottom: { style: 'thin', color: { argb: 'FF000000' } },
                    right: { style: 'thin', color: { argb: 'FF000000' } }
                };
            });
            
            // Calcular el ancho máximo para cada columna basado en el contenido
            const columnWidths = {
                A: 0, // Matricula
                B: 0, // Nombre
                C: 0, // Fecha
                D: 0  // Hora
            };
            
            // Calcular ancho para headers
            headers.forEach((header, index) => {
                const colLetter = String.fromCharCode(65 + index); // A, B, C, D
                columnWidths[colLetter] = Math.max(columnWidths[colLetter] || 0, header.length);
            });
            
            // Calcular ancho para datos
            asistenciasFiltradas.forEach(asistencia => {
                const values = [
                    String(asistencia.Matricula || ''),
                    String(asistencia.Nombre || ''),
                    String(asistencia.Fecha || ''),
                    String(asistencia.Hora || '')
                ];
                
                values.forEach((value, index) => {
                    const colLetter = String.fromCharCode(65 + index);
                    columnWidths[colLetter] = Math.max(columnWidths[colLetter] || 0, value.length);
                });
            });
            
            // Aplicar anchos de columna (mínimo 15, máximo basado en contenido + padding)
            worksheet.getColumn('A').width = Math.max(15, Math.min(columnWidths.A + 5, 20)); // Matricula
            worksheet.getColumn('B').width = Math.max(30, Math.min(columnWidths.B + 5, 50)); // Nombre
            worksheet.getColumn('C').width = Math.max(15, Math.min(columnWidths.C + 5, 20)); // Fecha
            worksheet.getColumn('D').width = Math.max(12, Math.min(columnWidths.D + 5, 15)); // Hora
            
            // Generar el nombre del archivo con fecha y hora
            const fecha = new Date();
            const fechaStr = fecha.toISOString().split('T')[0];
            const horaStr = fecha.toTimeString().split(' ')[0].replace(/:/g, '-');
            const nombreArchivo = `Asistencias_Apodaca_${fechaStr}_${horaStr}.xlsx`;
            
            // Generar el buffer y descargar
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = nombreArchivo;
            link.click();
            window.URL.revokeObjectURL(url);
            
            // Ocultar el contenido del modal y mostrar el mensaje de éxito
            const inputGroup = modalExcel.querySelector('.input-group');
            const modalButtons = modalExcel.querySelector('.modal-buttons');
            const titulo = modalExcel.querySelector('h2');
            
            if (inputGroup) inputGroup.style.display = 'none';
            if (modalButtons) modalButtons.style.display = 'none';
            if (titulo) titulo.style.display = 'none';
            if (btnCerrarModalExcel) btnCerrarModalExcel.style.display = 'none';
            
            // Mostrar mensaje de éxito
            if (mensajeExitoExcel) {
                mensajeExitoExcel.style.display = 'block';
            }
            
            // Después de 2 segundos, cerrar el modal
            setTimeout(() => {
                cerrarModalExcel();
                // Restaurar elementos del modal
                if (inputGroup) inputGroup.style.display = 'block';
                if (modalButtons) modalButtons.style.display = 'flex';
                if (titulo) titulo.style.display = 'block';
                if (btnCerrarModalExcel) btnCerrarModalExcel.style.display = 'flex';
                if (mensajeExitoExcel) mensajeExitoExcel.style.display = 'none';
            }, 2000);
        } catch (error) {
            console.error('Error al generar Excel:', error);
            alert('Error al generar el archivo Excel. Por favor, inténtalo de nuevo.');
        }
    }
    
    // Event listener para limpiar fecha
    if (btnLimpiarFechaExcel) {
        btnLimpiarFechaExcel.addEventListener("click", () => {
            excelFiltroFecha.value = '';
        });
    }
    
    // Event listener para generar Excel
    btnGenerarExcel.addEventListener("click", () => {
        generarExcel();
    });
    
    // ==============================
    //   FUNCIONALIDAD DE EXCEL PARA FICHADOS
    // ==============================
    
    // Función para generar el archivo Excel de fichados
    async function generarExcelFichados() {
        try {
            if (todosLosFichados.length === 0) {
                alert('No hay datos de fichados para exportar.');
                return;
            }
            
            // Ordenar de mayor a menor por cantidad_fichas
            const fichadosOrdenados = [...todosLosFichados].sort((a, b) => {
                const fichasA = a.cantidad_fichas || 0;
                const fichasB = b.cantidad_fichas || 0;
                return fichasB - fichasA; // Orden descendente
            });
            
            // Crear un nuevo libro de trabajo
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Fichados');
            
            // Definir los headers
            const headers = ['Matricula', 'Nombre', 'Programa', 'Fichas'];
            
            // Agregar headers con estilo
            const headerRow = worksheet.addRow(headers);
            headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            headerRow.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF0B0B63' } // Color #0b0b63
            };
            headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
            headerRow.height = 20;
            
            // Aplicar bordes a los headers (solo columnas A-D)
            ['A', 'B', 'C', 'D'].forEach(col => {
                const cell = worksheet.getCell(`${col}1`);
                cell.border = {
                    top: { style: 'thin', color: { argb: 'FF000000' } },
                    left: { style: 'thin', color: { argb: 'FF000000' } },
                    bottom: { style: 'thin', color: { argb: 'FF000000' } },
                    right: { style: 'thin', color: { argb: 'FF000000' } }
                };
            });
            
            // Agregar los datos
            fichadosOrdenados.forEach((fichado, index) => {
                const rowNumber = index + 2; // +2 porque la fila 1 es el header
                const row = worksheet.addRow([
                    fichado.matricula || '',
                    fichado.nombre || '',
                    fichado.programa || '',
                    fichado.cantidad_fichas || 0
                ]);
                
                // Aplicar bordes negros a todas las celdas de la fila (columnas A-D)
                ['A', 'B', 'C', 'D'].forEach(col => {
                    const cell = worksheet.getCell(`${col}${rowNumber}`);
                    cell.border = {
                        top: { style: 'thin', color: { argb: 'FF000000' } },
                        left: { style: 'thin', color: { argb: 'FF000000' } },
                        bottom: { style: 'thin', color: { argb: 'FF000000' } },
                        right: { style: 'thin', color: { argb: 'FF000000' } }
                    };
                    
                    // Si la celda es de Fichas (columna D) y el valor es >= 3, aplicar color rojo
                    if (col === 'D' && (fichado.cantidad_fichas || 0) >= 3) {
                        cell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'FFFF0000' } // Color rojo
                        };
                        cell.font = { color: { argb: 'FFFFFFFF' }, bold: true }; // Texto blanco y negrita
                    }
                });
            });
            
            // Calcular el ancho máximo para cada columna basado en el contenido
            const columnWidths = {
                A: 0, // Matricula
                B: 0, // Nombre
                C: 0, // Programa
                D: 0  // Fichas
            };
            
            // Calcular ancho para headers
            headers.forEach((header, index) => {
                const colLetter = String.fromCharCode(65 + index); // A, B, C, D
                columnWidths[colLetter] = Math.max(columnWidths[colLetter] || 0, header.length);
            });
            
            // Calcular ancho para datos
            fichadosOrdenados.forEach(fichado => {
                const values = [
                    String(fichado.matricula || ''),
                    String(fichado.nombre || ''),
                    String(fichado.programa || ''),
                    String(fichado.cantidad_fichas || 0)
                ];
                
                values.forEach((value, index) => {
                    const colLetter = String.fromCharCode(65 + index);
                    columnWidths[colLetter] = Math.max(columnWidths[colLetter] || 0, value.length);
                });
            });
            
            // Aplicar anchos de columna (mínimo 15, máximo basado en contenido + padding)
            worksheet.getColumn('A').width = Math.max(15, Math.min(columnWidths.A + 5, 20)); // Matricula
            worksheet.getColumn('B').width = Math.max(30, Math.min(columnWidths.B + 5, 60)); // Nombre
            worksheet.getColumn('C').width = Math.max(40, Math.min(columnWidths.C + 5, 80)); // Programa
            worksheet.getColumn('D').width = Math.max(12, Math.min(columnWidths.D + 5, 15)); // Fichas
            
            // Generar el nombre del archivo con fecha y hora
            const fecha = new Date();
            const fechaStr = fecha.toISOString().split('T')[0];
            const horaStr = fecha.toTimeString().split(' ')[0].replace(/:/g, '-');
            const nombreArchivo = `Fichados_Apodaca_${fechaStr}_${horaStr}.xlsx`;
            
            // Generar el buffer y descargar
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = nombreArchivo;
            link.click();
            window.URL.revokeObjectURL(url);
            
            // Mostrar mensaje de éxito
            if (mensajeExitoFichados) {
                mensajeExitoFichados.style.display = 'block';
                
                // Ocultar mensaje después de 2 segundos
                setTimeout(() => {
                    if (mensajeExitoFichados) {
                        mensajeExitoFichados.style.display = 'none';
                    }
                }, 2000);
            }
        } catch (error) {
            console.error('Error al generar Excel de fichados:', error);
            alert('Error al generar el archivo Excel. Por favor, inténtalo de nuevo.');
        }
    }
    
    // Event listener para generar Excel de fichados
    if (btnExcelFichados) {
        btnExcelFichados.addEventListener("click", () => {
            generarExcelFichados();
        });
    }
});
