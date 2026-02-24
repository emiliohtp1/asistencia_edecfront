const API_ASISTENCIA = "https://asistencia-edec.onrender.com/api/asistencias/registrar";
const API_BACHILLERATO = "https://asistencia-edec.onrender.com/api/alumnos/bachillerato";
const API_UNIVERSIDAD = "https://asistencia-edec.onrender.com/api/alumnos/universidad";

const codigoBarrasInput = document.getElementById("codigoBarrasInput");
const mensajeExito = document.getElementById("mensajeExito");
const mensajeError = document.getElementById("mensajeError");
const btnCerrarSesion = document.getElementById("btnCerrarSesion");

// ==============================
//   AUTOFOCUS Y MANTENER FOCO
// ==============================
let autofocusInterval;

function mantenerFoco() {
    // Verificar si el input no tiene foco
    if (document.activeElement !== codigoBarrasInput) {
        codigoBarrasInput.focus();
    }
}

// Iniciar el intervalo para mantener el foco cada 1 segundo
function iniciarAutofocus() {
    autofocusInterval = setInterval(mantenerFoco, 1000);
}

// Detener el intervalo cuando el input tiene foco manualmente
codigoBarrasInput.addEventListener('focus', () => {
    if (autofocusInterval) {
        clearInterval(autofocusInterval);
    }
});

// Reiniciar el intervalo cuando el input pierde el foco
codigoBarrasInput.addEventListener('blur', () => {
    iniciarAutofocus();
});

// Iniciar el autofocus al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    codigoBarrasInput.focus();
    iniciarAutofocus();
});

// ==============================
//   BUSCAR ALUMNO EN API
// ==============================
async function buscarAlumno(matricula) {
    // Buscar primero en bachillerato
    try {
        const responseBachillerato = await fetch(API_BACHILLERATO);
        if (responseBachillerato.ok) {
            const dataBachillerato = await responseBachillerato.json();
            const alumno = dataBachillerato.alumnos.find(a => a.matricula === matricula);
            if (alumno) {
                return {
                    matricula: alumno.matricula,
                    nombre: alumno.nombre
                };
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
            const alumno = dataUniversidad.alumnos.find(a => a.matricula === matricula);
            if (alumno) {
                return {
                    matricula: alumno.matricula,
                    nombre: alumno.nombre
                };
            }
        }
    } catch (error) {
        console.error("Error al buscar en universidad:", error);
    }

    return null;
}

// ==============================
//   REGISTRAR ASISTENCIA
// ==============================
codigoBarrasInput.addEventListener("keypress", async (e) => {
    // Detectar cuando se presiona Enter o cuando el scanner termina de leer
    if (e.key === "Enter" || e.keyCode === 13) {
        e.preventDefault();
        
        const matricula = codigoBarrasInput.value.trim();

        // Validar que haya un valor
        if (!matricula || matricula.length === 0) {
            mostrarError("Ingresa un código de barras válido.");
            codigoBarrasInput.value = "";
            codigoBarrasInput.focus();
            return;
        }

        // Ocultar mensajes anteriores
        ocultarMensajes();

        try {
            // Buscar el alumno en las APIs
            const alumno = await buscarAlumno(matricula);

            if (!alumno) {
                // Si no se encuentra el alumno, mostrar error
                mostrarError("El usuario no existe.");
                codigoBarrasInput.value = "";
                codigoBarrasInput.focus();
                return;
            }

            // Si se encuentra el alumno, registrar la asistencia
            // El modelo pide que matricula sea string
            const payload = {
                matricula: String(alumno.matricula),
                nombre: alumno.nombre
            };

            const response = await fetch(API_ASISTENCIA, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                // Si hay un error del servidor, mostramos el detalle
                mostrarError(data.detail || "Error al registrar asistencia.");
                codigoBarrasInput.value = "";
                codigoBarrasInput.focus();
                return;
            }

            // Mostrar mensaje de éxito
            mostrarExito();

            // Limpiar el campo de texto inmediatamente tras el éxito
            codigoBarrasInput.value = "";
            codigoBarrasInput.focus();

        } catch (e) {
            console.error(e);
            mostrarError("Error de conexión con el servidor.");
            codigoBarrasInput.value = "";
            codigoBarrasInput.focus();
        }
    }
});

// ==============================
//   FUNCIONES DE MENSAJES
// ==============================
function mostrarExito() {
    mensajeError.style.display = "none";
    mensajeExito.style.display = "block";
    
    setTimeout(() => {
        mensajeExito.classList.add("show");
    }, 10);

    setTimeout(() => {
        mensajeExito.classList.remove("show");
        setTimeout(() => {
            mensajeExito.style.display = "none";
        }, 600);
    }, 3000);
}

function mostrarError(mensaje) {
    mensajeExito.style.display = "none";
    mensajeError.textContent = mensaje || "Error de asistencia.";
    mensajeError.style.display = "block";
    
    setTimeout(() => {
        mensajeError.classList.add("show");
    }, 10);

    setTimeout(() => {
        mensajeError.classList.remove("show");
        setTimeout(() => {
            mensajeError.style.display = "none";
        }, 600);
    }, 3000);
}

function ocultarMensajes() {
    mensajeExito.style.display = "none";
    mensajeError.style.display = "none";
    mensajeExito.classList.remove("show");
    mensajeError.classList.remove("show");
}

// ==============================
//   FUNCIÓN PARA LIMPIAR TODAS LAS CREDENCIALES
// ==============================
function limpiarTodasLasCredenciales() {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("isLoggedInBarras");
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
    localStorage.removeItem("registradorBarrasCorreo");
    localStorage.removeItem("registradorBarrasRol");
}

// ==============================
//   CERRAR SESIÓN
// ==============================
btnCerrarSesion.addEventListener("click", () => {
    if (confirm("¿Estás seguro de que deseas cerrar sesión?")) {
        if (autofocusInterval) {
            clearInterval(autofocusInterval);
        }
        limpiarTodasLasCredenciales();
        window.location.href = "registradorbarraslogin.html";
    }
});
