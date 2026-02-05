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
        const responseBachillerato = await fetch(API_BACHILLERATO);
        if (responseBachillerato.ok) {
            const dataBachillerato = await responseBachillerato.json();
            const alumnosBachillerato = dataBachillerato.alumnos || [];
            
            alumnosEncontrados = alumnosBachillerato.filter(alumno => {
                const matricula = (alumno.matricula || '').toLowerCase();
                const nombre = (alumno.nombre || '').toLowerCase();
                return matricula.includes(terminoBusqueda) || nombre.includes(terminoBusqueda);
            });

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
        const responseUniversidad = await fetch(API_UNIVERSIDAD);
        if (responseUniversidad.ok) {
            const dataUniversidad = await responseUniversidad.json();
            const alumnosUniversidad = dataUniversidad.alumnos || [];
            
            alumnosEncontrados = alumnosUniversidad.filter(alumno => {
                const matricula = (alumno.matricula || '').toLowerCase();
                const nombre = (alumno.nombre || '').toLowerCase();
                return matricula.includes(terminoBusqueda) || nombre.includes(terminoBusqueda);
            });

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
        const response = await fetch(API_FICHADOS);
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

    alumnos.forEach(alumno => {
        const fila = document.createElement('tr');
        const cantidadFichas = fichadosMap[alumno.matricula] || 0;
        const claseFichas = cantidadFichas >= 3 ? 'fichas-rojo' : '';
        
        fila.innerHTML = `
            <td>${alumno.matricula || ''}</td>
            <td>${alumno.nombre || ''}</td>
            <td>${alumno.programa || ''}</td>
            <td>${alumno.Coordinador || ''}</td>
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
}

// ==============================
//   CERRAR MODAL DE FICHAR
// ==============================
function cerrarModalFichar() {
    modalFicharAlumno.style.display = 'none';
    alumnoSeleccionado = null;
}

// ==============================
//   FICHAR ALUMNO
// ==============================
async function ficharAlumno() {
    if (!alumnoSeleccionado) return;
    
    // Validar que tenga al menos matrícula y nombre
    if (!alumnoSeleccionado.matricula || !alumnoSeleccionado.nombre) {
        alert('Error: El alumno no tiene la información necesaria para ser fichado.');
        return;
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
