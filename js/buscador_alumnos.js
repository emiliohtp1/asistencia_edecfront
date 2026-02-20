const API_BACHILLERATO = "https://asistencia-edec.onrender.com/api/alumnos/bachillerato";
const API_UNIVERSIDAD = "https://asistencia-edec.onrender.com/api/alumnos/universidad";
const API_FICHAR_ALUMNO = "https://asistencia-edec.onrender.com/api/fichados/apodaca/registrar";
const API_FICHADOS = "https://asistencia-edec.onrender.com/api/fichados/apodaca";

let inputBuscarAlumno;
let btnBuscarAlumno;
let tbodyAlumnos;
let tablaAlumnos;
let btnCerrarSesion;
let modalFicharAlumno;
let btnFicharSi;
let btnFicharNo;
let alumnoSeleccionado = null;
let procesandoFichar = false; // Bandera para evitar múltiples registros

// ==============================
//   BUSCAR ALUMNO
// ==============================
async function buscarAlumno(termino) {
    if (!termino || termino.trim() === '') {
        tablaAlumnos.style.display = 'none';
        return;
    }

    const terminoBusqueda = termino.trim().toLowerCase();
    let alumnosEncontrados = [];

    // Buscar primero en bachillerato
    try {
        // Agregar timestamp para forzar petición única y evitar cache
        const urlBachillerato = `${API_BACHILLERATO}?t=${Date.now()}`;
        const responseBachillerato = await fetch(urlBachillerato, {
            cache: 'no-store'
        });
        if (responseBachillerato.ok) {
            const dataBachillerato = await responseBachillerato.json();
            const alumnosBachillerato = dataBachillerato.alumnos || [];
            
            // Debug: Verificar datos recibidos
            console.log('=== DEBUG BACHILLERATO ===');
            console.log('Total alumnos recibidos:', alumnosBachillerato.length);
            if (alumnosBachillerato.length > 0) {
                console.log('Primer alumno completo:', alumnosBachillerato[0]);
                console.log('Coordinador del primer alumno:', alumnosBachillerato[0]?.coordinador);
            }
            
            alumnosEncontrados = alumnosBachillerato.filter(alumno => {
                const matricula = (alumno.matricula || '').toLowerCase();
                const nombre = (alumno.nombre || '').toLowerCase();
                return matricula.includes(terminoBusqueda) || nombre.includes(terminoBusqueda);
            });

            // Debug: Verificar alumnos encontrados
            if (alumnosEncontrados.length > 0) {
                console.log('Alumnos encontrados:', alumnosEncontrados.length);
                console.log('Primer alumno encontrado:', alumnosEncontrados[0]);
                console.log('Coordinador del alumno encontrado:', alumnosEncontrados[0]?.coordinador);
            }

            if (alumnosEncontrados.length > 0) {
                mostrarAlumnos(alumnosEncontrados);
                return;
            }
        }
    } catch (error) {
        console.error("Error al buscar en bachillerato:", error);
    }

    // Si no se encuentra en bachillerato, buscar en universidad
    try {
        // Agregar timestamp para forzar petición única y evitar cache
        const urlUniversidad = `${API_UNIVERSIDAD}?t=${Date.now()}`;
        const responseUniversidad = await fetch(urlUniversidad, {
            cache: 'no-store'
        });
        if (responseUniversidad.ok) {
            const dataUniversidad = await responseUniversidad.json();
            const alumnosUniversidad = dataUniversidad.alumnos || [];
            
            // Debug: Verificar datos recibidos
            console.log('=== DEBUG UNIVERSIDAD ===');
            console.log('Total alumnos recibidos:', alumnosUniversidad.length);
            if (alumnosUniversidad.length > 0) {
                console.log('Primer alumno completo:', alumnosUniversidad[0]);
                console.log('Coordinador del primer alumno:', alumnosUniversidad[0]?.coordinador);
            }
            
            alumnosEncontrados = alumnosUniversidad.filter(alumno => {
                const matricula = (alumno.matricula || '').toLowerCase();
                const nombre = (alumno.nombre || '').toLowerCase();
                return matricula.includes(terminoBusqueda) || nombre.includes(terminoBusqueda);
            });

            // Debug: Verificar alumnos encontrados
            if (alumnosEncontrados.length > 0) {
                console.log('Alumnos encontrados:', alumnosEncontrados.length);
                console.log('Primer alumno encontrado:', alumnosEncontrados[0]);
                console.log('Coordinador del alumno encontrado:', alumnosEncontrados[0]?.coordinador);
            }

            if (alumnosEncontrados.length > 0) {
                mostrarAlumnos(alumnosEncontrados);
                return;
            }
        }
    } catch (error) {
        console.error("Error al buscar en universidad:", error);
    }

    // Si no se encuentra en ninguna API
    if (alumnosEncontrados.length === 0) {
        alert("El alumno no existe.");
        tablaAlumnos.style.display = 'none';
    }
}

// ==============================
//   OBTENER FICHADOS
// ==============================
async function obtenerFichados() {
    try {
        // Agregar timestamp para forzar petición única y evitar cache
        const urlFichados = `${API_FICHADOS}?t=${Date.now()}`;
        const response = await fetch(urlFichados, {
            cache: 'no-store'
        });
        if (!response.ok) {
            throw new Error('Error al obtener fichados');
        }
        const data = await response.json();
        const fichados = data.fichados || [];
        
        // Crear un mapa de fichados por matrícula para acceso rápido
        const fichadosMap = {};
        fichados.forEach(fichado => {
            fichadosMap[fichado.matricula] = fichado.cantidad_fichas || 0;
        });
        
        return fichadosMap;
    } catch (error) {
        console.error('Error al obtener fichados:', error);
        return {};
    }
}

// ==============================
//   MOSTRAR ALUMNOS EN LA TABLA
// ==============================
async function mostrarAlumnos(alumnos) {
    tbodyAlumnos.innerHTML = '';
    tablaAlumnos.style.display = 'table';

    // Obtener fichados
    const fichadosMap = await obtenerFichados();

    alumnos.forEach((alumno, index) => {
        const fila = document.createElement('tr');
        const cantidadFichas = fichadosMap[alumno.matricula] || 0;
        const claseFichas = cantidadFichas >= 3 ? 'fichas-rojo' : '';
        // Manejar coordinador en minúscula o mayúscula
        const coordinador = alumno.coordinador || alumno.Coordinador || '';
        
        // Debug: Verificar coordinador antes de mostrar
        if (index === 0) {
            console.log('=== DEBUG MOSTRAR ALUMNOS ===');
            console.log('Alumno a mostrar:', alumno);
            console.log('Coordinador extraído:', coordinador);
            console.log('alumno.coordinador:', alumno.coordinador);
            console.log('alumno.Coordinador:', alumno.Coordinador);
        }
        
        fila.innerHTML = `
            <td>${alumno.matricula || ''}</td>
            <td>${alumno.nombre || ''}</td>
            <td>${alumno.programa || ''}</td>
            <td>${coordinador}</td>
            <td class="${claseFichas}">${cantidadFichas}</td>
            <td>
                <button class="btn-fichar" data-matricula="${alumno.matricula || ''}">
                    Fichar
                </button>
            </td>
        `;
        tbodyAlumnos.appendChild(fila);
    });
    
    // Agregar event listeners a los botones de fichar
    const botonesFichar = document.querySelectorAll('.btn-fichar');
    botonesFichar.forEach(boton => {
        boton.addEventListener('click', () => {
            const matricula = boton.getAttribute('data-matricula');
            const alumno = alumnos.find(a => a.matricula === matricula);
            if (alumno) {
                abrirModalFichar(alumno);
            }
        });
    });
}

// ==============================
//   ABRIR MODAL DE FICHAR
// ==============================
function abrirModalFichar(alumno) {
    alumnoSeleccionado = alumno;
    modalFicharAlumno.style.display = 'flex';
    // Ocultar mensaje de éxito al abrir el modal
    const mensajeExito = document.getElementById('mensajeExitoFichar');
    if (mensajeExito) {
        mensajeExito.style.display = 'none';
        mensajeExito.classList.remove('show');
    }
    // Mostrar los botones al abrir el modal
    if (btnFicharSi) {
        btnFicharSi.style.display = 'block';
    }
    if (btnFicharNo) {
        btnFicharNo.style.display = 'block';
    }
}

// ==============================
//   CERRAR MODAL DE FICHAR
// ==============================
function cerrarModalFichar() {
    modalFicharAlumno.style.display = 'none';
    alumnoSeleccionado = null;
    procesandoFichar = false; // Resetear bandera al cerrar
}

// ==============================
//   FICHAR ALUMNO
// ==============================
async function ficharAlumno() {
    // Evitar múltiples registros simultáneos
    if (procesandoFichar) {
        return;
    }
    
    if (!alumnoSeleccionado) return;
    
    // Validar que tenga al menos matrícula y nombre
    if (!alumnoSeleccionado.matricula || !alumnoSeleccionado.nombre) {
        alert('Error: El alumno no tiene la información necesaria para ser fichado.');
        return;
    }
    
    // Marcar como procesando
    procesandoFichar = true;
    
    // Ocultar botones inmediatamente para evitar múltiples registros
    if (btnFicharSi) {
        btnFicharSi.style.display = 'none';
    }
    if (btnFicharNo) {
        btnFicharNo.style.display = 'none';
    }
    
    // Preparar los datos según el formato requerido
    // Usar los valores del objeto alumno si existen, sino valores por defecto
    const datosFichar = {
        matricula: alumnoSeleccionado.matricula || '',
        nombre: alumnoSeleccionado.nombre || '',
        coordinador: alumnoSeleccionado.coordinador || alumnoSeleccionado.Coordinador || 'Leslie',
        graduado: alumnoSeleccionado.graduado || alumnoSeleccionado.Graduado || 'No',
        correo: alumnoSeleccionado.correo || alumnoSeleccionado.Correo || `al${alumnoSeleccionado.matricula}@edec.edu.mx`,
        campus: alumnoSeleccionado.campus || alumnoSeleccionado.Campus || 'Apodaca',
        programa: alumnoSeleccionado.programa || alumnoSeleccionado.Programa || '',
        ciclo: alumnoSeleccionado.ciclo || alumnoSeleccionado.Ciclo || 'C1-2026',
        turno: alumnoSeleccionado.turno || alumnoSeleccionado.Turno || 'Sabatino'
    };
    
    try {
        const response = await fetch(API_FICHAR_ALUMNO, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datosFichar)
        });
        
        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.detail || 'Error al fichar alumno.');
        }
        
        // Ocultar botones inmediatamente para evitar múltiples registros
        if (btnFicharSi) {
            btnFicharSi.style.display = 'none';
        }
        if (btnFicharNo) {
            btnFicharNo.style.display = 'none';
        }
        
        // Mostrar mensaje de éxito
        const mensajeExito = document.getElementById('mensajeExitoFichar');
        if (mensajeExito) {
            mensajeExito.style.display = 'block';
            setTimeout(() => {
                mensajeExito.classList.add('show');
            }, 10);
            
            // Cerrar el modal después de 2 segundos
            setTimeout(() => {
                mensajeExito.classList.remove('show');
                setTimeout(() => {
                    mensajeExito.style.display = 'none';
                    cerrarModalFichar();
                }, 500);
            }, 2000);
        } else {
            // Fallback si no existe el elemento
            alert('Alumno fichado exitosamente.');
            cerrarModalFichar();
        }
        
    } catch (error) {
        console.error('Error al fichar alumno:', error);
        alert(error.message || 'Error al fichar alumno. Intenta nuevamente.');
        // Restaurar botones en caso de error
        if (btnFicharSi) {
            btnFicharSi.style.display = 'block';
        }
        if (btnFicharNo) {
            btnFicharNo.style.display = 'block';
        }
        procesandoFichar = false;
    }
}

// ==============================
//   INICIALIZACIÓN
// ==============================
document.addEventListener('DOMContentLoaded', () => {
    // Obtener referencias a los elementos del DOM
    inputBuscarAlumno = document.getElementById("inputBuscarAlumno");
    btnBuscarAlumno = document.getElementById("btnBuscarAlumno");
    tbodyAlumnos = document.getElementById("tbodyAlumnos");
    tablaAlumnos = document.getElementById("tablaAlumnos");
    btnCerrarSesion = document.getElementById("btnCerrarSesion");
    modalFicharAlumno = document.getElementById("modalFicharAlumno");
    btnFicharSi = document.getElementById("btnFicharSi");
    btnFicharNo = document.getElementById("btnFicharNo");

    // Configurar event listeners
    btnBuscarAlumno.addEventListener("click", () => {
        const termino = inputBuscarAlumno.value.trim();
        buscarAlumno(termino);
    });

    inputBuscarAlumno.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            const termino = inputBuscarAlumno.value.trim();
            buscarAlumno(termino);
        }
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

    // Event listeners para el modal de fichar
    btnFicharSi.addEventListener("click", async () => {
        await ficharAlumno();
    });
    
    btnFicharNo.addEventListener("click", () => {
        cerrarModalFichar();
    });
    
    // Cerrar modal al hacer click fuera
    modalFicharAlumno.addEventListener("click", (e) => {
        if (e.target === modalFicharAlumno) {
            cerrarModalFichar();
        }
    });

    // Cerrar sesión
    btnCerrarSesion.addEventListener("click", () => {
        if (confirm("¿Estás seguro de que deseas cerrar sesión?")) {
            limpiarTodasLasCredenciales();
            window.location.href = "buscadorlogin.html";
        }
    });
});
