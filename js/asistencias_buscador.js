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
let asistenciasFiltradas = []; // Almacenar asistencias filtradas para paginación
let paginaActual = 1; // Página actual de la paginación
const asistenciasPorPagina = 10; // Cantidad de asistencias por página
let paginacionAsistencias; // Elemento del DOM para la paginación

// Elementos para fichados
let contenedorFichados;
let contenedorAsistencias;
let btnRegresar;
let tbodyFichados;
let btnExcelFichados;
let mensajeExitoFichados;
let todosLosFichados = []; // Almacenar todos los fichados cargados
let fichadosFiltrados = []; // Almacenar fichados para paginación
let paginaActualFichados = 1; // Página actual de la paginación de fichados
const fichadosPorPagina = 10; // Cantidad de fichados por página
let paginacionFichados; // Elemento del DOM para la paginación de fichados

// Elementos para modal de eliminar fichado
let modalEliminarFichado;
let btnEliminarFichadoSi;
let btnEliminarFichadoNo;
let tituloEliminarFichado;
let mensajeExitoEliminarFichado;
let botonesEliminarFichado;
let fichadoSeleccionadoEliminar = null;
let procesandoEliminarFichado = false;
let vistaActual = 'asistencias'; // 'asistencias' o 'fichados'

// Elementos para Excel
let btnExcel;
let btnExcelMobile; // Botón Excel para móviles
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
async function cargarTodasLasAsistencias(mantenerPagina = false) {
    try {
        const response = await fetch(API_TODAS_ASISTENCIAS_APODACA);
        
        if (!response.ok) {
            throw new Error('Error al cargar las asistencias.');
        }

        const data = await response.json();
        todasLasAsistencias = data.asistencias || [];
        if (!mantenerPagina) {
            paginaActual = 1; // Resetear a la primera página al cargar
        }
        aplicarFiltros(mantenerPagina);
    } catch (error) {
        console.error('Error:', error);
        mostrarMensajeError('Error al cargar las asistencias del día.');
    }
}

// ==============================
//   BUSCAR POR MATRÍCULA
// ==============================
async function buscarPorMatricula(matricula, mantenerPagina = false) {
    if (!matricula || matricula.trim() === '') {
        // Si está vacío, cargar todas las asistencias
        cargarTodasLasAsistencias(mantenerPagina);
        return;
    }

    try {
        const response = await fetch(`${API_BUSCAR_MATRICULA_APODACA}${matricula.trim()}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                todasLasAsistencias = [];
                if (!mantenerPagina) {
                    paginaActual = 1; // Resetear a la primera página
                }
                aplicarFiltros(mantenerPagina);
                return;
            }
            throw new Error('Error al buscar la matrícula.');
        }

        const data = await response.json();
        todasLasAsistencias = data.asistencias || [];
        if (!mantenerPagina) {
            paginaActual = 1; // Resetear a la primera página al buscar
        }
        aplicarFiltros(mantenerPagina);
    } catch (error) {
        console.error('Error:', error);
        mostrarMensajeError('Error al buscar la matrícula.');
    }
}

// ==============================
//   APLICAR FILTROS
// ==============================
function aplicarFiltros(mantenerPagina = false) {
    // Verificar que los elementos del DOM estén inicializados
    if (!filtroDia || !filtroMes) {
        asistenciasFiltradas = [...todasLasAsistencias];
        if (!mantenerPagina) {
            paginaActual = 1;
        }
        mostrarAsistencias(asistenciasFiltradas);
        return;
    }

    asistenciasFiltradas = [...todasLasAsistencias];

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

    // Solo resetear página si no se debe mantener
    if (!mantenerPagina) {
        paginaActual = 1;
    }
    mostrarAsistencias(asistenciasFiltradas);
}

// ==============================
//   MOSTRAR ASISTENCIAS EN LA TABLA
// ==============================
function mostrarAsistencias(asistencias) {
    tbodyAsistencias.innerHTML = '';
    
    // Guardar las asistencias filtradas para la paginación
    asistenciasFiltradas = asistencias;

    if (asistencias.length === 0) {
        mensajeSinResultados.style.display = 'block';
        if (paginacionAsistencias) {
            paginacionAsistencias.innerHTML = '';
        }
        return;
    }

    mensajeSinResultados.style.display = 'none';
    
    // Calcular índices para la paginación
    const inicio = (paginaActual - 1) * asistenciasPorPagina;
    const fin = inicio + asistenciasPorPagina;
    const asistenciasPagina = asistencias.slice(inicio, fin);

    asistenciasPagina.forEach(asistencia => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${asistencia.Matricula || ''}</td>
            <td>${asistencia.Nombre || ''}</td>
            <td>${asistencia.Fecha || ''}</td>
            <td>${asistencia.Hora || ''}</td>
        `;
        tbodyAsistencias.appendChild(fila);
    });
    
    // Renderizar paginación
    renderizarPaginacionAsistencias();
}

// ==============================
//   RENDERIZAR PAGINACIÓN DE ASISTENCIAS
// ==============================
function renderizarPaginacionAsistencias() {
    if (!paginacionAsistencias) return;
    
    paginacionAsistencias.innerHTML = '';
    paginacionAsistencias.style.display = 'flex';
    
    if (asistenciasFiltradas.length === 0) {
        return;
    }
    
    const totalPaginas = Math.ceil(asistenciasFiltradas.length / asistenciasPorPagina);
    
    // Botón "Anterior"
    const btnAnterior = document.createElement('button');
    btnAnterior.className = 'btn-pagina';
    btnAnterior.textContent = '←';
    btnAnterior.disabled = paginaActual === 1;
    btnAnterior.addEventListener('click', () => {
        if (paginaActual > 1) {
            paginaActual--;
            mostrarAsistencias(asistenciasFiltradas);
            // Scroll al inicio de la tabla
            document.querySelector('.tabla-container').scrollTop = 0;
        }
    });
    paginacionAsistencias.appendChild(btnAnterior);
    
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
            mostrarAsistencias(asistenciasFiltradas);
            document.querySelector('.tabla-container').scrollTop = 0;
        });
        paginacionAsistencias.appendChild(btnPrimera);
        
        if (inicioPagina > 2) {
            const span = document.createElement('span');
            span.textContent = '...';
            span.style.padding = '0 5px';
            paginacionAsistencias.appendChild(span);
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
            mostrarAsistencias(asistenciasFiltradas);
            document.querySelector('.tabla-container').scrollTop = 0;
        });
        paginacionAsistencias.appendChild(btnPagina);
    }
    
    // Mostrar "..." al final si es necesario
    if (finPagina < totalPaginas) {
        if (finPagina < totalPaginas - 1) {
            const span = document.createElement('span');
            span.textContent = '...';
            span.style.padding = '0 5px';
            paginacionAsistencias.appendChild(span);
        }
        
        const btnUltima = document.createElement('button');
        btnUltima.className = 'btn-pagina';
        btnUltima.textContent = totalPaginas;
        btnUltima.addEventListener('click', () => {
            paginaActual = totalPaginas;
            mostrarAsistencias(asistenciasFiltradas);
            document.querySelector('.tabla-container').scrollTop = 0;
        });
        paginacionAsistencias.appendChild(btnUltima);
    }
    
    // Botón "Siguiente"
    const btnSiguiente = document.createElement('button');
    btnSiguiente.className = 'btn-pagina';
    btnSiguiente.textContent = '→';
    btnSiguiente.disabled = paginaActual === totalPaginas;
    btnSiguiente.addEventListener('click', () => {
        if (paginaActual < totalPaginas) {
            paginaActual++;
            mostrarAsistencias(asistenciasFiltradas);
            // Scroll al inicio de la tabla
            document.querySelector('.tabla-container').scrollTop = 0;
        }
    });
    paginacionAsistencias.appendChild(btnSiguiente);
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
    
    // Guardar la página actual antes de actualizar
    const paginaAnterior = paginaActual;
    
    if (matricula === '') {
        // Si no hay búsqueda activa, cargar todas las asistencias manteniendo la página
        cargarTodasLasAsistencias(true);
    } else {
        // Si hay una búsqueda activa, actualizar esa búsqueda manteniendo la página
        buscarPorMatricula(matricula, true);
    }
    
    // Después de aplicar filtros, verificar si la página actual sigue siendo válida
    setTimeout(() => {
        const totalPaginas = Math.ceil(asistenciasFiltradas.length / asistenciasPorPagina);
        if (paginaAnterior > totalPaginas && totalPaginas > 0) {
            paginaActual = totalPaginas;
            mostrarAsistencias(asistenciasFiltradas);
        } else if (paginaAnterior <= totalPaginas && paginaAnterior > 0) {
            paginaActual = paginaAnterior;
            mostrarAsistencias(asistenciasFiltradas);
        }
    }, 100);
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
        
        // Ordenar de mayor a menor por cantidad_fichas
        todosLosFichados.sort((a, b) => {
            const fichasA = a.cantidad_fichas || 0;
            const fichasB = b.cantidad_fichas || 0;
            return fichasB - fichasA; // Orden descendente
        });
        
        fichadosFiltrados = [...todosLosFichados];
        paginaActualFichados = 1; // Resetear a la primera página
        
        mostrarFichados();
        
    } catch (error) {
        console.error('Error al cargar fichados:', error);
        tbodyFichados.innerHTML = '<tr><td colspan="5" style="text-align: center; color: red;">Error al cargar fichados.</td></tr>';
        if (paginacionFichados) {
            paginacionFichados.innerHTML = '';
        }
    }
}

// ==============================
//   MOSTRAR FICHADOS EN LA TABLA
// ==============================
function mostrarFichados() {
    tbodyFichados.innerHTML = '';
    
    if (fichadosFiltrados.length === 0) {
        tbodyFichados.innerHTML = '<tr><td colspan="5" style="text-align: center;">No hay alumnos fichados.</td></tr>';
        if (paginacionFichados) {
            paginacionFichados.innerHTML = '';
        }
        return;
    }
    
    // Calcular índices para la paginación
    const inicio = (paginaActualFichados - 1) * fichadosPorPagina;
    const fin = inicio + fichadosPorPagina;
    const fichadosPagina = fichadosFiltrados.slice(inicio, fin);
    
    fichadosPagina.forEach(fichado => {
        const fila = document.createElement('tr');
        const cantidadFichas = fichado.cantidad_fichas || 0;
        const claseFichas = cantidadFichas >= 3 ? 'fichas-rojo' : '';
        
        fila.innerHTML = `
            <td>${fichado.matricula || ''}</td>
            <td>${fichado.nombre || ''}</td>
            <td>${fichado.programa || ''}</td>
            <td class="${claseFichas}">${cantidadFichas}</td>
            <td>
                <button class="btn-eliminar-usuario" data-matricula="${fichado.matricula || ''}" data-nombre="${fichado.nombre || ''}" title="Eliminar registro">
                    ×
                </button>
            </td>
        `;
        tbodyFichados.appendChild(fila);
    });
    
    // Agregar event listeners a los botones de eliminar
    const botonesEliminar = document.querySelectorAll('#tbodyFichados .btn-eliminar-usuario');
    botonesEliminar.forEach(boton => {
        boton.addEventListener('click', () => {
            const matricula = boton.getAttribute('data-matricula');
            const nombre = boton.getAttribute('data-nombre');
            const fichado = fichadosFiltrados.find(f => f.matricula === matricula);
            if (fichado) {
                abrirModalEliminarFichado(fichado);
            }
        });
    });
    
    // Renderizar paginación
    renderizarPaginacionFichados();
}

// ==============================
//   RENDERIZAR PAGINACIÓN DE FICHADOS
// ==============================
function renderizarPaginacionFichados() {
    if (!paginacionFichados) return;
    
    paginacionFichados.innerHTML = '';
    paginacionFichados.style.display = 'flex';
    
    if (fichadosFiltrados.length === 0) {
        return;
    }
    
    const totalPaginas = Math.ceil(fichadosFiltrados.length / fichadosPorPagina);
    
    // Botón "Anterior"
    const btnAnterior = document.createElement('button');
    btnAnterior.className = 'btn-pagina';
    btnAnterior.textContent = '←';
    btnAnterior.disabled = paginaActualFichados === 1;
    btnAnterior.addEventListener('click', () => {
        if (paginaActualFichados > 1) {
            paginaActualFichados--;
            mostrarFichados();
            // Scroll al inicio de la tabla
            const tablaContainer = contenedorFichados.querySelector('.tabla-container');
            if (tablaContainer) {
                tablaContainer.scrollTop = 0;
            }
        }
    });
    paginacionFichados.appendChild(btnAnterior);
    
    // Botones de páginas
    const maxBotones = 5; // Máximo de botones de página a mostrar
    let inicioPagina = Math.max(1, paginaActualFichados - Math.floor(maxBotones / 2));
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
            paginaActualFichados = 1;
            mostrarFichados();
            const tablaContainer = contenedorFichados.querySelector('.tabla-container');
            if (tablaContainer) {
                tablaContainer.scrollTop = 0;
            }
        });
        paginacionFichados.appendChild(btnPrimera);
        
        if (inicioPagina > 2) {
            const span = document.createElement('span');
            span.textContent = '...';
            span.style.padding = '0 5px';
            paginacionFichados.appendChild(span);
        }
    }
    
    // Botones de páginas
    for (let i = inicioPagina; i <= finPagina; i++) {
        const btnPagina = document.createElement('button');
        btnPagina.className = 'btn-pagina';
        if (i === paginaActualFichados) {
            btnPagina.classList.add('active');
        }
        btnPagina.textContent = i;
        btnPagina.addEventListener('click', () => {
            paginaActualFichados = i;
            mostrarFichados();
            const tablaContainer = contenedorFichados.querySelector('.tabla-container');
            if (tablaContainer) {
                tablaContainer.scrollTop = 0;
            }
        });
        paginacionFichados.appendChild(btnPagina);
    }
    
    // Mostrar "..." al final si es necesario
    if (finPagina < totalPaginas) {
        if (finPagina < totalPaginas - 1) {
            const span = document.createElement('span');
            span.textContent = '...';
            span.style.padding = '0 5px';
            paginacionFichados.appendChild(span);
        }
        
        const btnUltima = document.createElement('button');
        btnUltima.className = 'btn-pagina';
        btnUltima.textContent = totalPaginas;
        btnUltima.addEventListener('click', () => {
            paginaActualFichados = totalPaginas;
            mostrarFichados();
            const tablaContainer = contenedorFichados.querySelector('.tabla-container');
            if (tablaContainer) {
                tablaContainer.scrollTop = 0;
            }
        });
        paginacionFichados.appendChild(btnUltima);
    }
    
    // Botón "Siguiente"
    const btnSiguiente = document.createElement('button');
    btnSiguiente.className = 'btn-pagina';
    btnSiguiente.textContent = '→';
    btnSiguiente.disabled = paginaActualFichados === totalPaginas;
    btnSiguiente.addEventListener('click', () => {
        if (paginaActualFichados < totalPaginas) {
            paginaActualFichados++;
            mostrarFichados();
            // Scroll al inicio de la tabla
            const tablaContainer = contenedorFichados.querySelector('.tabla-container');
            if (tablaContainer) {
                tablaContainer.scrollTop = 0;
            }
        }
    });
    paginacionFichados.appendChild(btnSiguiente);
}

// ==============================
//   MODAL DE ELIMINAR FICHADO
// ==============================

function abrirModalEliminarFichado(fichado) {
    fichadoSeleccionadoEliminar = fichado;
    if (tituloEliminarFichado) {
        tituloEliminarFichado.textContent = `¿Eliminar 1 registro del usuario ${fichado.nombre || ''}?`;
    }
    if (modalEliminarFichado) {
        modalEliminarFichado.style.display = 'flex';
    }
    // Ocultar mensaje de éxito al abrir el modal
    if (mensajeExitoEliminarFichado) {
        mensajeExitoEliminarFichado.style.display = 'none';
        mensajeExitoEliminarFichado.classList.remove('show');
    }
    // Mostrar los botones al abrir el modal
    if (btnEliminarFichadoSi) {
        btnEliminarFichadoSi.style.display = 'block';
    }
    if (btnEliminarFichadoNo) {
        btnEliminarFichadoNo.style.display = 'block';
    }
    if (botonesEliminarFichado) {
        botonesEliminarFichado.style.display = 'flex';
    }
    procesandoEliminarFichado = false;
}

function cerrarModalEliminarFichado() {
    if (modalEliminarFichado) {
        modalEliminarFichado.style.display = 'none';
    }
    fichadoSeleccionadoEliminar = null;
    procesandoEliminarFichado = false;
}

async function eliminarRegistroFichado() {
    // Evitar múltiples eliminaciones simultáneas
    if (procesandoEliminarFichado) {
        return;
    }
    
    if (!fichadoSeleccionadoEliminar || !fichadoSeleccionadoEliminar.matricula) {
        alert('Error: No se puede eliminar el registro. Falta información del fichado.');
        return;
    }
    
    // Marcar como procesando
    procesandoEliminarFichado = true;
    
    // Ocultar botones inmediatamente para evitar múltiples registros
    if (btnEliminarFichadoSi) {
        btnEliminarFichadoSi.style.display = 'none';
    }
    if (btnEliminarFichadoNo) {
        btnEliminarFichadoNo.style.display = 'none';
    }
    if (botonesEliminarFichado) {
        botonesEliminarFichado.style.display = 'none';
    }
    
    try {
        const matricula = fichadoSeleccionadoEliminar.matricula;
        const response = await fetch(`https://asistencia-edec.onrender.com/api/fichados/apodaca/${matricula}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.detail || 'Error al eliminar registro.');
        }
        
        // Mostrar mensaje de éxito
        if (mensajeExitoEliminarFichado) {
            mensajeExitoEliminarFichado.style.display = 'block';
            setTimeout(() => {
                mensajeExitoEliminarFichado.classList.add('show');
            }, 10);
            
            // Cerrar el modal después de 2 segundos y recargar fichados
            setTimeout(() => {
                mensajeExitoEliminarFichado.classList.remove('show');
                setTimeout(() => {
                    mensajeExitoEliminarFichado.style.display = 'none';
                    cerrarModalEliminarFichado();
                    // Recargar fichados después de eliminar
                    cargarFichados();
                }, 500);
            }, 2000);
        } else {
            // Fallback si no existe el elemento
            alert('1 registro eliminado correctamente.');
            cerrarModalEliminarFichado();
            cargarFichados();
        }
        
    } catch (error) {
        console.error('Error al eliminar registro de fichado:', error);
        alert(error.message || 'Error al eliminar registro. Intenta nuevamente.');
        // Restaurar botones en caso de error
        if (btnEliminarFichadoSi) {
            btnEliminarFichadoSi.style.display = 'block';
        }
        if (btnEliminarFichadoNo) {
            btnEliminarFichadoNo.style.display = 'block';
        }
        if (botonesEliminarFichado) {
            botonesEliminarFichado.style.display = 'flex';
        }
        procesandoEliminarFichado = false;
    }
}

// ==============================
//   CAMBIAR A VISTA DE FICHADOS
// ==============================
function mostrarVistaFichados() {
    // Cambiar vista actual
    vistaActual = 'fichados';
    
    // Ocultar contenedor de asistencias
    const tablaAsistencias = document.getElementById('tablaAsistencias');
    const mensajeSinResultados = document.getElementById('mensajeSinResultados');
    const buscadorHeader = document.querySelector('.buscador-header');
    
    tablaAsistencias.style.display = 'none';
    mensajeSinResultados.style.display = 'none';
    buscadorHeader.style.display = 'none';
    
    // Ocultar paginación de asistencias
    if (paginacionAsistencias) {
        paginacionAsistencias.style.display = 'none';
    }
    
    // Detener actualización automática
    detenerActualizacionAutomatica();
    
    // Mostrar contenedor de fichados
    contenedorFichados.style.display = 'block';
    
    // Obtener y configurar el botón de Excel de fichados ahora que el contenedor está visible
    btnExcelFichados = document.getElementById("btnExcelFichados");
    if (btnExcelFichados) {
        btnExcelFichados.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            generarExcelFichados();
        });
    }
    
    // Cargar fichados
    paginaActualFichados = 1; // Resetear a la primera página
    cargarFichados();
}

// ==============================
//   REGRESAR A VISTA DE ASISTENCIAS
// ==============================
function mostrarVistaAsistencias() {
    // Cambiar vista actual
    vistaActual = 'asistencias';
    
    // Ocultar contenedor de fichados
    contenedorFichados.style.display = 'none';
    
    // Ocultar paginación de fichados
    if (paginacionFichados) {
        paginacionFichados.style.display = 'none';
    }
    
    // Mostrar contenedor de asistencias
    const tablaAsistencias = document.getElementById('tablaAsistencias');
    const buscadorHeader = document.querySelector('.buscador-header');
    
    buscadorHeader.style.display = 'flex';
    tablaAsistencias.style.display = 'table';
    
    // Mostrar paginación de asistencias
    if (paginacionAsistencias) {
        paginacionAsistencias.style.display = 'flex';
    }
    
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
    // btnExcelFichados se obtendrá cuando se muestre la vista de fichados
    mensajeExitoFichados = document.getElementById("mensajeExitoFichados");
    
    // Elementos para modal de eliminar fichado
    modalEliminarFichado = document.getElementById("modalEliminarFichado");
    btnEliminarFichadoSi = document.getElementById("btnEliminarFichadoSi");
    btnEliminarFichadoNo = document.getElementById("btnEliminarFichadoNo");
    tituloEliminarFichado = document.getElementById("tituloEliminarFichado");
    mensajeExitoEliminarFichado = document.getElementById("mensajeExitoEliminarFichado");
    botonesEliminarFichado = document.getElementById("botonesEliminarFichado");
    
    // Elementos para Excel
    btnExcel = document.getElementById("btnExcel");
    btnExcelMobile = document.getElementById("btnExcelMobile"); // Variable global, igual que btnFichados y btnCerrarSesion
    modalExcelOverlay = document.getElementById("modalExcelOverlay");
    modalExcel = document.getElementById("modalExcel");
    btnCerrarModalExcel = document.getElementById("btnCerrarModalExcel");
    btnCancelarExcel = document.getElementById("btnCancelarExcel");
    btnGenerarExcel = document.getElementById("btnGenerarExcel");
    const excelFiltroDia = document.getElementById("excelFiltroDia");
    const excelFiltroMes = document.getElementById("excelFiltroMes");
    const excelFiltroAnio = document.getElementById("excelFiltroAnio");
    btnLimpiarFechaExcel = document.getElementById("btnLimpiarFechaExcel");
    mensajeExitoExcel = document.getElementById("mensajeExitoExcel");
    
    // Elementos para paginación
    paginacionAsistencias = document.getElementById("paginacionAsistencias");
    paginacionFichados = document.getElementById("paginacionFichados");

    // Función para manejar clicks en botones de Excel (se define aquí para que esté disponible)
    const handleExcelClick = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        // Si estamos en la vista de fichados, exportar fichados
        if (vistaActual === 'fichados') {
            generarExcelFichados();
        } else {
            // Si estamos en la vista de asistencias, abrir modal de Excel
            abrirModalExcel();
        }
    };

    // Configurar event listeners
    btnBuscar.addEventListener("click", () => {
        const matricula = inputBuscarMatricula.value.trim();
        paginaActual = 1; // Resetear a la primera página al buscar
        buscarPorMatricula(matricula);
    });

    inputBuscarMatricula.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            const matricula = inputBuscarMatricula.value.trim();
            paginaActual = 1; // Resetear a la primera página al buscar
            buscarPorMatricula(matricula);
        }
    });

    // Permitir buscar todas si se limpia el campo
    inputBuscarMatricula.addEventListener("input", (e) => {
        if (e.target.value.trim() === '') {
            paginaActual = 1; // Resetear a la primera página al limpiar
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
    // Event listener para botón Fichados (flotante y desktop)
    const handleFichadosClick = () => {
        mostrarVistaFichados();
    };
    
    if (btnFichados) {
        btnFichados.addEventListener("click", handleFichadosClick);
    }
    
    const btnFichadosDesktop = document.getElementById("btnFichadosDesktop");
    if (btnFichadosDesktop) {
        btnFichadosDesktop.addEventListener("click", handleFichadosClick);
    }
    
    btnRegresar.addEventListener("click", () => {
        mostrarVistaAsistencias();
    });
    
    // Event listeners para modal de eliminar fichado
    if (btnEliminarFichadoSi) {
        btnEliminarFichadoSi.addEventListener("click", async () => {
            await eliminarRegistroFichado();
        });
    }
    
    if (btnEliminarFichadoNo) {
        btnEliminarFichadoNo.addEventListener("click", () => {
            cerrarModalEliminarFichado();
        });
    }
    
    // Cerrar modal al hacer click fuera
    if (modalEliminarFichado) {
        modalEliminarFichado.addEventListener("click", (e) => {
            if (e.target === modalEliminarFichado && !procesandoEliminarFichado) {
                cerrarModalEliminarFichado();
            }
        });
    }

    // Cerrar sesión
    btnCerrarSesion.addEventListener("click", () => {
        if (confirm("¿Estás seguro de que deseas cerrar sesión?")) {
            limpiarTodasLasCredenciales();
            window.location.href = "asistenciaslogin.html";
        }
    });

    // Configurar botón Excel móvil (EXACTAMENTE igual que btnFichados y btnCerrarSesion)
    // Agregar logs de depuración para móviles
    if (window.innerWidth <= 768) {
        console.log('=== DEBUG MÓVIL ===');
        console.log('btnExcelMobile existe?', btnExcelMobile !== null);
        console.log('btnExcelMobile:', btnExcelMobile);
        if (btnExcelMobile) {
            console.log('btnExcelMobile.textContent:', btnExcelMobile.textContent);
            console.log('btnExcelMobile.style.display:', window.getComputedStyle(btnExcelMobile).display);
            console.log('btnExcelMobile.parentElement:', btnExcelMobile.parentElement);
            console.log('Contenedor .asistencias-header-buttons display:', window.getComputedStyle(btnExcelMobile.parentElement).display);
            
            // Alert para depuración en móviles
            setTimeout(() => {
                alert(`DEBUG MÓVIL:\nbtnExcelMobile existe: ${btnExcelMobile !== null}\nTexto: ${btnExcelMobile ? btnExcelMobile.textContent : 'N/A'}\nDisplay: ${btnExcelMobile ? window.getComputedStyle(btnExcelMobile).display : 'N/A'}\nContenedor display: ${btnExcelMobile && btnExcelMobile.parentElement ? window.getComputedStyle(btnExcelMobile.parentElement).display : 'N/A'}`);
            }, 1000);
        } else {
            alert('ERROR: btnExcelMobile NO EXISTE en el DOM');
        }
    }
    
    if (btnExcelMobile) {
        // Acortar texto en móviles
        if (window.innerWidth <= 768) {
            if (btnExcelMobile.textContent.includes("Importar a Excel")) {
                btnExcelMobile.textContent = "Excel";
            }
        }
        
        // Event listener para el botón móvil (EXACTAMENTE igual que btnFichados)
        btnExcelMobile.addEventListener("click", handleExcelClick);
        
        console.log('Event listener agregado a btnExcelMobile');
    } else {
        console.error('btnExcelMobile no encontrado en el DOM');
        if (window.innerWidth <= 768) {
            alert('ERROR: btnExcelMobile no encontrado. ID correcto?');
        }
    }

    // Cargar todas las asistencias al iniciar
    cargarTodasLasAsistencias();
    
    // Iniciar actualización automática
    iniciarActualizacionAutomatica();
    
    // ==============================
    //   FUNCIONALIDAD DE EXCEL
    // ==============================
    
    // Función para poblar los selectores de fecha
    function poblarSelectoresFecha() {
        // Poblar selector de día (01-31)
        if (excelFiltroDia) {
            excelFiltroDia.innerHTML = '<option value="">Día</option>';
            for (let i = 1; i <= 31; i++) {
                const option = document.createElement('option');
                option.value = i.toString().padStart(2, '0');
                option.textContent = i.toString().padStart(2, '0');
                excelFiltroDia.appendChild(option);
            }
        }
        
        // Poblar selector de mes (01-12)
        if (excelFiltroMes) {
            excelFiltroMes.innerHTML = '<option value="">Mes</option>';
            const meses = [
                '01 - Enero', '02 - Febrero', '03 - Marzo', '04 - Abril',
                '05 - Mayo', '06 - Junio', '07 - Julio', '08 - Agosto',
                '09 - Septiembre', '10 - Octubre', '11 - Noviembre', '12 - Diciembre'
            ];
            for (let i = 1; i <= 12; i++) {
                const option = document.createElement('option');
                option.value = i.toString().padStart(2, '0');
                option.textContent = meses[i - 1];
                excelFiltroMes.appendChild(option);
            }
        }
        
        // Poblar selector de año (2025-2030)
        if (excelFiltroAnio) {
            excelFiltroAnio.innerHTML = '<option value="">Año</option>';
            for (let i = 2025; i <= 2030; i++) {
                const option = document.createElement('option');
                option.value = i.toString();
                option.textContent = i.toString();
                excelFiltroAnio.appendChild(option);
            }
        }
    }
    
    // Función para abrir el modal de Excel
    function abrirModalExcel() {
        if (modalExcelOverlay && modalExcel) {
            modalExcelOverlay.style.display = 'flex';
            // Poblar selectores si no están poblados
            if (excelFiltroDia && excelFiltroDia.options.length <= 1) {
                poblarSelectoresFecha();
            }
            // Resetear valores
            if (excelFiltroDia) excelFiltroDia.value = '';
            if (excelFiltroMes) excelFiltroMes.value = '';
            if (excelFiltroAnio) excelFiltroAnio.value = '';
        }
    }
    
    // Función para cerrar el modal de Excel
    function cerrarModalExcel() {
        if (modalExcelOverlay) {
            modalExcelOverlay.style.display = 'none';
        }
    }
    
    // El botón btnExcel ya no se usa en móviles (se usa btnExcelMobile)
    // Solo usarlo en desktop si existe
    if (btnExcel && window.innerWidth > 768) {
        btnExcel.addEventListener("click", handleExcelClick);
    }
    
    const btnExcelDesktop = document.getElementById("btnExcelDesktop");
    if (btnExcelDesktop) {
        btnExcelDesktop.addEventListener("click", handleExcelClick);
    }
    
    // Event delegation para btnExcelFichados (se configurará cuando se muestre la vista de fichados)
    // Usar event delegation en el contenedor de fichados como respaldo
    if (contenedorFichados) {
        contenedorFichados.addEventListener("click", (e) => {
            // Verificar si el click fue en el botón o en un elemento hijo
            const clickedButton = e.target.closest('#btnExcelFichados');
            if (clickedButton || e.target.id === "btnExcelFichados") {
                e.preventDefault();
                e.stopPropagation();
                console.log('Event delegation capturó click en btnExcelFichados');
                generarExcelFichados();
            }
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
    
    // Función para extraer año de una fecha
    function extraerAnio(fecha) {
        if (!fecha) return null;
        const fechaAsistencia = fecha.split(' ')[0];
        
        if (fechaAsistencia.includes('-')) {
            const partes = fechaAsistencia.split('-');
            // Si el primer número es mayor a 31, es año (formato YYYY-MM-DD)
            if (parseInt(partes[0]) > 31) {
                return parseInt(partes[0]);
            } else {
                // Formato DD-MM-YYYY
                return parseInt(partes[2]);
            }
        } else if (fechaAsistencia.includes('/')) {
            const partes = fechaAsistencia.split('/');
            // Si el primer número es mayor a 31, es año (formato YYYY/MM/DD)
            if (parseInt(partes[0]) > 31) {
                return parseInt(partes[0]);
            } else {
                // Formato DD/MM/YYYY
                return parseInt(partes[2]);
            }
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
        
        // Obtener valores de los selectores
        const diaSeleccionado = excelFiltroDia ? excelFiltroDia.value : '';
        const mesSeleccionado = excelFiltroMes ? excelFiltroMes.value : '';
        const anioSeleccionado = excelFiltroAnio ? excelFiltroAnio.value : '';
        
        // Si todos están vacíos, retornar todas las asistencias
        if (!diaSeleccionado && !mesSeleccionado && !anioSeleccionado) {
            return asistenciasFiltradas;
        }
        
        // Filtrar por año si está seleccionado
        if (anioSeleccionado) {
            const anioFiltro = parseInt(anioSeleccionado);
            asistenciasFiltradas = asistenciasFiltradas.filter(asistencia => {
                const anioAsistencia = extraerAnio(asistencia.Fecha);
                return anioAsistencia === anioFiltro;
            });
        }
        
        // Filtrar por mes si está seleccionado
        if (mesSeleccionado) {
            const mesFiltro = parseInt(mesSeleccionado);
            asistenciasFiltradas = asistenciasFiltradas.filter(asistencia => {
                const mesAsistencia = extraerMes(asistencia.Fecha);
                return mesAsistencia === mesFiltro;
            });
        }
        
        // Filtrar por día si está seleccionado
        if (diaSeleccionado) {
            const diaFiltro = parseInt(diaSeleccionado);
            asistenciasFiltradas = asistenciasFiltradas.filter(asistencia => {
                const diaAsistencia = extraerDia(asistencia.Fecha);
                return diaAsistencia === diaFiltro;
            });
        }
        
        return asistenciasFiltradas;
    }
    
    // Función para ordenar por fecha (de más reciente a menos reciente)
    function ordenarPorFecha(asistencias) {
        return asistencias.sort((a, b) => {
            const fechaA = formatearFechaParaComparacion(a.Fecha);
            const fechaB = formatearFechaParaComparacion(b.Fecha);
            
            // Si alguna fecha es null, ponerla al final
            if (!fechaA && !fechaB) return 0;
            if (!fechaA) return 1;
            if (!fechaB) return -1;
            
            // Comparar fechas (más reciente primero = orden descendente)
            if (fechaA > fechaB) return -1;
            if (fechaA < fechaB) return 1;
            
            // Si las fechas son iguales, ordenar por hora (más reciente primero)
            const horaA = a.Hora || '';
            const horaB = b.Hora || '';
            if (horaA > horaB) return -1;
            if (horaA < horaB) return 1;
            
            return 0;
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
            
            // Ordenar por fecha (de más reciente a menos reciente)
            asistenciasFiltradas = ordenarPorFecha(asistenciasFiltradas);
            
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
            if (excelFiltroDia) excelFiltroDia.value = '';
            if (excelFiltroMes) excelFiltroMes.value = '';
            if (excelFiltroAnio) excelFiltroAnio.value = '';
        });
    }
    
    // Event listener para generar Excel
    btnGenerarExcel.addEventListener("click", () => {
        generarExcel();
    });
    
    // Poblar selectores de fecha al cargar la página
    poblarSelectoresFecha();
});

// ==============================
//   FUNCIÓN GLOBAL PARA GENERAR EXCEL DE FICHADOS
// ==============================
async function generarExcelFichados() {
    try {
            if (todosLosFichados.length === 0) {
                alert('No hay datos de fichados para exportar.');
                return;
            }
            
            // Usar fichadosFiltrados que ya están ordenados
            const fichadosOrdenados = [...fichadosFiltrados];
            
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
            
            // Mostrar mensaje de éxito (si existe, aunque esté oculto en móviles)
            if (mensajeExitoFichados) {
                mensajeExitoFichados.style.display = 'block';
                
                // Ocultar mensaje después de 2 segundos
                setTimeout(() => {
                    if (mensajeExitoFichados) {
                        mensajeExitoFichados.style.display = 'none';
                    }
                }, 2000);
            }
            
            // También mostrar un mensaje temporal en la parte superior si estamos en móviles
            if (window.innerWidth <= 768) {
                const mensajeTemporal = document.createElement('div');
                mensajeTemporal.textContent = 'Archivo generado exitosamente';
                mensajeTemporal.style.cssText = 'position: fixed; top: 60px; left: 50%; transform: translateX(-50%); background: #28a745; color: white; padding: 12px 20px; border-radius: 8px; z-index: 2000; font-weight: bold;';
                document.body.appendChild(mensajeTemporal);
                
                setTimeout(() => {
                    mensajeTemporal.remove();
                }, 2000);
            }
    } catch (error) {
        console.error('Error al generar Excel de fichados:', error);
        alert('Error al generar el archivo Excel. Por favor, inténtalo de nuevo.');
    }
}
