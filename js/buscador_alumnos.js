const API_BACHILLERATO = "https://asistencia-edec.onrender.com/api/alumnos/bachillerato";
const API_UNIVERSIDAD = "https://asistencia-edec.onrender.com/api/alumnos/universidad";

let inputBuscarAlumno;
let btnBuscarAlumno;
let tbodyAlumnos;
let tablaAlumnos;
let btnCerrarSesion;

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
//   MOSTRAR ALUMNOS EN LA TABLA
// ==============================
function mostrarAlumnos(alumnos) {
    tbodyAlumnos.innerHTML = '';
    tablaAlumnos.style.display = 'table';

    alumnos.forEach(alumno => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${alumno.matricula || ''}</td>
            <td>${alumno.nombre || ''}</td>
            <td>${alumno.programa || ''}</td>
        `;
        tbodyAlumnos.appendChild(fila);
    });
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

    // Cerrar sesión
    btnCerrarSesion.addEventListener("click", () => {
        if (confirm("¿Estás seguro de que deseas cerrar sesión?")) {
            localStorage.removeItem("isLoggedInBuscadorAlumnos");
            window.location.href = "buscadorlogin.html";
        }
    });
});
