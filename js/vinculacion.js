const API_VINCULACION_REGISTRAR = 'https://asistencia-edec.onrender.com/api/vinculacion/registrar';
const API_VINCULACION_DATOS = 'https://asistencia-edec.onrender.com/api/vinculacion/datos';
const API_VINCULACION_BORRAR = 'https://asistencia-edec.onrender.com/api/vinculacion/borrar/';

let formRegistrarVinculacion;
let inputNombre;
let inputTelefono;
let inputPrograma;
let tbodyVinculacion;
let paginacionVinculacion;
let mensajeSinResultados;
let btnCerrarSesion;
let todosLosRegistros = [];
let registrosFiltrados = [];
let paginaActual = 1;
const registrosPorPagina = 10;

// Elementos para Excel
let btnImportarExcel;
let modalExcelOverlay;
let modalExcel;
let btnCerrarModalExcel;
let btnCancelarExcel;
let btnGenerarExcel;
let excelFiltroFecha;
let mensajeExitoExcel;

// ==============================
//   INICIALIZACIÓN
// ==============================
document.addEventListener('DOMContentLoaded', () => {
    // Obtener referencias a los elementos del DOM
    formRegistrarVinculacion = document.getElementById('formRegistrarVinculacion');
    inputNombre = document.getElementById('inputNombre');
    inputTelefono = document.getElementById('inputTelefono');
    inputPrograma = document.getElementById('inputPrograma');
    tbodyVinculacion = document.getElementById('tbodyVinculacion');
    paginacionVinculacion = document.getElementById('paginacionVinculacion');
    mensajeSinResultados = document.getElementById('mensajeSinResultados');
    btnCerrarSesion = document.getElementById('btnCerrarSesion');
    
    // Elementos para Excel
    btnImportarExcel = document.getElementById('btnImportarExcel');
    modalExcelOverlay = document.getElementById('modalExcelOverlay');
    modalExcel = document.getElementById('modalExcel');
    btnCerrarModalExcel = document.getElementById('btnCerrarModalExcel');
    btnCancelarExcel = document.getElementById('btnCancelarExcel');
    btnGenerarExcel = document.getElementById('btnGenerarExcel');
    excelFiltroFecha = document.getElementById('excelFiltroFecha');
    mensajeExitoExcel = document.getElementById('mensajeExitoExcel');
    
    // Cargar registros al inicio
    cargarRegistros();
    
    // Event listeners
    formRegistrarVinculacion.addEventListener('submit', registrarVinculacion);
    btnCerrarSesion.addEventListener('click', cerrarSesion);
    
    // Capitalizar primera letra de cada palabra en el input de nombre
    inputNombre.addEventListener('input', function(e) {
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
    
    // Event listeners para Excel
    btnImportarExcel.addEventListener('click', abrirModalExcel);
    btnCerrarModalExcel.addEventListener('click', cerrarModalExcel);
    btnCancelarExcel.addEventListener('click', cerrarModalExcel);
    btnGenerarExcel.addEventListener('click', generarExcel);
    
    // Cerrar modal al hacer click fuera
    modalExcelOverlay.addEventListener('click', (e) => {
        if (e.target === modalExcelOverlay) {
            cerrarModalExcel();
        }
    });
});

// ==============================
//   CARGAR REGISTROS
// ==============================
async function cargarRegistros() {
    try {
        const response = await fetch(API_VINCULACION_DATOS);
        if (!response.ok) {
            throw new Error('Error al cargar registros');
        }
        
        const data = await response.json();
        
        // Ordenar por fecha más reciente primero (usando timestamp)
        todosLosRegistros = data.registros.sort((a, b) => {
            const fechaA = new Date(a.timestamp || a.fecha);
            const fechaB = new Date(b.timestamp || b.fecha);
            return fechaB - fechaA; // Más reciente primero
        });
        
        registrosFiltrados = [...todosLosRegistros];
        paginaActual = 1;
        mostrarRegistros();
    } catch (error) {
        console.error('Error al cargar registros:', error);
        tbodyVinculacion.innerHTML = '<tr><td colspan="4" style="text-align: center; color: red;">Error al cargar registros</td></tr>';
    }
}

// ==============================
//   MOSTRAR REGISTROS
// ==============================
function mostrarRegistros() {
    tbodyVinculacion.innerHTML = '';
    
    if (registrosFiltrados.length === 0) {
        mensajeSinResultados.style.display = 'block';
        if (paginacionVinculacion) {
            paginacionVinculacion.innerHTML = '';
        }
        return;
    }
    
    mensajeSinResultados.style.display = 'none';
    
    // Calcular índices para la paginación
    const inicio = (paginaActual - 1) * registrosPorPagina;
    const fin = inicio + registrosPorPagina;
    const registrosPagina = registrosFiltrados.slice(inicio, fin);
    
    registrosPagina.forEach(registro => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${registro.telefono || ''}</td>
            <td>${registro.nombre || ''}</td>
            <td>${registro.fecha || ''}</td>
            <td>
                <button class="btn-eliminar-usuario" onclick="eliminarRegistro(${registro.telefono})" title="Eliminar">
                    ×
                </button>
            </td>
        `;
        tbodyVinculacion.appendChild(fila);
    });
    
    // Renderizar paginación
    renderizarPaginacion();
}

// ==============================
//   RENDERIZAR PAGINACIÓN
// ==============================
function renderizarPaginacion() {
    if (!paginacionVinculacion) return;
    
    paginacionVinculacion.innerHTML = '';
    paginacionVinculacion.style.display = 'flex';
    
    if (registrosFiltrados.length === 0) {
        return;
    }
    
    const totalPaginas = Math.ceil(registrosFiltrados.length / registrosPorPagina);
    
    // Botón "Anterior"
    const btnAnterior = document.createElement('button');
    btnAnterior.className = 'btn-pagina';
    btnAnterior.textContent = '←';
    btnAnterior.disabled = paginaActual === 1;
    btnAnterior.addEventListener('click', () => {
        if (paginaActual > 1) {
            paginaActual--;
            mostrarRegistros();
            document.querySelector('.tabla-container').scrollTop = 0;
        }
    });
    paginacionVinculacion.appendChild(btnAnterior);
    
    // Botones de páginas
    const maxBotones = 5;
    let inicioPagina = Math.max(1, paginaActual - Math.floor(maxBotones / 2));
    let finPagina = Math.min(totalPaginas, inicioPagina + maxBotones - 1);
    
    if (finPagina - inicioPagina < maxBotones - 1) {
        inicioPagina = Math.max(1, finPagina - maxBotones + 1);
    }
    
    if (inicioPagina > 1) {
        const btnPrimera = document.createElement('button');
        btnPrimera.className = 'btn-pagina';
        btnPrimera.textContent = '1';
        btnPrimera.addEventListener('click', () => {
            paginaActual = 1;
            mostrarRegistros();
            document.querySelector('.tabla-container').scrollTop = 0;
        });
        paginacionVinculacion.appendChild(btnPrimera);
        
        if (inicioPagina > 2) {
            const span = document.createElement('span');
            span.textContent = '...';
            span.style.padding = '0 5px';
            paginacionVinculacion.appendChild(span);
        }
    }
    
    for (let i = inicioPagina; i <= finPagina; i++) {
        const btnPagina = document.createElement('button');
        btnPagina.className = 'btn-pagina';
        if (i === paginaActual) {
            btnPagina.classList.add('active');
        }
        btnPagina.textContent = i;
        btnPagina.addEventListener('click', () => {
            paginaActual = i;
            mostrarRegistros();
            document.querySelector('.tabla-container').scrollTop = 0;
        });
        paginacionVinculacion.appendChild(btnPagina);
    }
    
    if (finPagina < totalPaginas) {
        if (finPagina < totalPaginas - 1) {
            const span = document.createElement('span');
            span.textContent = '...';
            span.style.padding = '0 5px';
            paginacionVinculacion.appendChild(span);
        }
        
        const btnUltima = document.createElement('button');
        btnUltima.className = 'btn-pagina';
        btnUltima.textContent = totalPaginas;
        btnUltima.addEventListener('click', () => {
            paginaActual = totalPaginas;
            mostrarRegistros();
            document.querySelector('.tabla-container').scrollTop = 0;
        });
        paginacionVinculacion.appendChild(btnUltima);
    }
    
    // Botón "Siguiente"
    const btnSiguiente = document.createElement('button');
    btnSiguiente.className = 'btn-pagina';
    btnSiguiente.textContent = '→';
    btnSiguiente.disabled = paginaActual === totalPaginas;
    btnSiguiente.addEventListener('click', () => {
        if (paginaActual < totalPaginas) {
            paginaActual++;
            mostrarRegistros();
            document.querySelector('.tabla-container').scrollTop = 0;
        }
    });
    paginacionVinculacion.appendChild(btnSiguiente);
}

// ==============================
//   REGISTRAR VINCULACIÓN
// ==============================
async function registrarVinculacion(e) {
    e.preventDefault();
    
    const errorMsg = document.getElementById('error-message-registro');
    const successMsg = document.getElementById('success-message-registro');
    
    errorMsg.style.display = 'none';
    successMsg.style.display = 'none';
    
    const nombre = inputNombre.value.trim();
    const telefono = parseInt(inputTelefono.value.trim());
    const programa = inputPrograma.value.trim();
    
    if (!nombre || !telefono || !programa) {
        errorMsg.textContent = 'Por favor, completa todos los campos.';
        errorMsg.style.display = 'block';
        return;
    }
    
    try {
        const response = await fetch(API_VINCULACION_REGISTRAR, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nombre: nombre,
                telefono: telefono,
                programa: programa
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            errorMsg.textContent = data.detail || 'Error al registrar vinculación.';
            errorMsg.style.display = 'block';
            return;
        }
        
        successMsg.textContent = 'Registro creado exitosamente.';
        successMsg.style.display = 'block';
        formRegistrarVinculacion.reset();
        
        // Recargar registros después de crear
        setTimeout(async () => {
            await cargarRegistros();
            successMsg.style.display = 'none';
        }, 1000);
        
    } catch (error) {
        console.error('Error al registrar vinculación:', error);
        errorMsg.textContent = 'Error de conexión al registrar vinculación.';
        errorMsg.style.display = 'block';
    }
}

// ==============================
//   ELIMINAR REGISTRO
// ==============================
async function eliminarRegistro(telefono) {
    if (!confirm(`¿Estás seguro de que deseas eliminar el registro con teléfono ${telefono}?`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_VINCULACION_BORRAR}${telefono}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Error al eliminar registro');
        }
        
        // Recargar registros después de eliminar
        await cargarRegistros();
        
    } catch (error) {
        console.error('Error al eliminar registro:', error);
        alert('Error al eliminar el registro. Por favor, inténtalo de nuevo.');
    }
}

// ==============================
//   CERRAR SESIÓN
// ==============================
function cerrarSesion() {
    localStorage.removeItem('isLoggedInVinculacion');
    localStorage.removeItem('vinculacionCorreo');
    localStorage.removeItem('vinculacionContraseña');
    localStorage.removeItem('vinculacionRol');
    window.location.href = 'vinculacionlogin.html';
}

// ==============================
//   FUNCIONALIDAD DE EXCEL
// ==============================

function abrirModalExcel() {
    modalExcelOverlay.style.display = 'flex';
    excelFiltroFecha.value = '';
}

function cerrarModalExcel() {
    modalExcelOverlay.style.display = 'none';
    excelFiltroFecha.value = '';
    
    // Restaurar elementos del modal
    const inputGroup = modalExcel.querySelector('.input-group');
    const modalButtons = modalExcel.querySelector('.modal-buttons');
    const titulo = modalExcel.querySelector('h2');
    
    if (inputGroup) inputGroup.style.display = 'block';
    if (modalButtons) modalButtons.style.display = 'flex';
    if (titulo) titulo.style.display = 'block';
    if (btnCerrarModalExcel) btnCerrarModalExcel.style.display = 'flex';
    if (mensajeExitoExcel) mensajeExitoExcel.style.display = 'none';
}

async function generarExcel() {
    try {
        let registrosParaExcel = [...todosLosRegistros];
        
        // Filtrar por fecha si se proporciona
        const fechaFiltro = excelFiltroFecha.value;
        if (fechaFiltro) {
            registrosParaExcel = registrosParaExcel.filter(registro => {
                // Usar timestamp si está disponible (más confiable)
                if (registro.timestamp) {
                    // Parsear el timestamp del registro
                    const fechaRegistro = new Date(registro.timestamp);
                    // Parsear la fecha del filtro (formato YYYY-MM-DD)
                    const fechaFiltroDate = new Date(fechaFiltro + 'T00:00:00');
                    
                    // Comparar solo año, mes y día (ignorar hora)
                    return fechaRegistro.getFullYear() === fechaFiltroDate.getFullYear() &&
                           fechaRegistro.getMonth() === fechaFiltroDate.getMonth() &&
                           fechaRegistro.getDate() === fechaFiltroDate.getDate();
                } else if (registro.fecha) {
                    // Fallback: usar el campo fecha si timestamp no está disponible
                    // Formato esperado: "17/02/2026 a las 17:16"
                    const partesFecha = registro.fecha.split(' ')[0].split('/'); // ["17", "02", "2026"]
                    if (partesFecha.length === 3) {
                        const diaRegistro = parseInt(partesFecha[0]);
                        const mesRegistro = parseInt(partesFecha[1]) - 1; // Los meses en JS son 0-indexed
                        const anioRegistro = parseInt(partesFecha[2]);
                        
                        const fechaFiltroDate = new Date(fechaFiltro + 'T00:00:00');
                        
                        return anioRegistro === fechaFiltroDate.getFullYear() &&
                               mesRegistro === fechaFiltroDate.getMonth() &&
                               diaRegistro === fechaFiltroDate.getDate();
                    }
                }
                return false;
            });
        }
        
        if (registrosParaExcel.length === 0) {
            alert('No hay datos para exportar con los filtros seleccionados.');
            return;
        }
        
        // Ordenar por fecha (de más reciente a menos reciente)
        registrosParaExcel.sort((a, b) => {
            const fechaA = new Date(a.timestamp || a.fecha);
            const fechaB = new Date(b.timestamp || b.fecha);
            return fechaB - fechaA;
        });
        
        // Crear un nuevo libro de trabajo
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Vinculacion');
        
        // Definir los headers
        const headers = ['Teléfono', 'Nombre', 'Fecha'];
        
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
        registrosParaExcel.forEach(registro => {
            const row = worksheet.addRow([
                registro.telefono || '',
                registro.nombre || '',
                registro.fecha || ''
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
        
        // Calcular el ancho máximo para cada columna
        const columnWidths = {
            A: 0, // Teléfono
            B: 0, // Nombre
            C: 0  // Fecha
        };
        
        // Calcular ancho para headers
        headers.forEach((header, index) => {
            const colLetter = String.fromCharCode(65 + index); // A, B, C
            columnWidths[colLetter] = Math.max(columnWidths[colLetter] || 0, header.length);
        });
        
        // Calcular ancho para datos
        registrosParaExcel.forEach(registro => {
            const values = [
                String(registro.telefono || ''),
                String(registro.nombre || ''),
                String(registro.fecha || '')
            ];
            
            values.forEach((value, index) => {
                const colLetter = String.fromCharCode(65 + index);
                columnWidths[colLetter] = Math.max(columnWidths[colLetter] || 0, value.length);
            });
        });
        
        // Aplicar anchos de columna
        worksheet.getColumn('A').width = Math.max(15, Math.min(columnWidths.A + 5, 20)); // Teléfono
        worksheet.getColumn('B').width = Math.max(30, Math.min(columnWidths.B + 5, 50)); // Nombre
        worksheet.getColumn('C').width = Math.max(15, Math.min(columnWidths.C + 5, 20)); // Fecha
        
        // Generar el nombre del archivo
        let nombreArchivo = 'Vinculacion_Registros';
        if (fechaFiltro) {
            // Parsear directamente el string YYYY-MM-DD para evitar problemas de zona horaria
            const partesFecha = fechaFiltro.split('-');
            const aaaa = partesFecha[0];
            const mm = partesFecha[1];
            const dd = partesFecha[2];
            nombreArchivo = `Vinculacion_Registros_${dd}-${mm}-${aaaa}`;
        } else {
            const fecha = new Date();
            const dd = String(fecha.getDate()).padStart(2, '0');
            const mm = String(fecha.getMonth() + 1).padStart(2, '0');
            const aaaa = fecha.getFullYear();
            nombreArchivo = `Vinculacion_Registros_${dd}-${mm}-${aaaa}`;
        }
        nombreArchivo += '.xlsx';
        
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
        }, 2000);
    } catch (error) {
        console.error('Error al generar Excel:', error);
        alert('Error al generar el archivo Excel. Por favor, inténtalo de nuevo.');
    }
}
