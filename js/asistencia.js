const API_ASISTENCIA = "https://asistencia-edec.onrender.com/api/asistencias/registrar";
const API_BACHILLERATO = "https://asistencia-edec.onrender.com/api/alumnos/bachillerato";
const API_UNIVERSIDAD = "https://asistencia-edec.onrender.com/api/alumnos/universidad";

const matriculaInput = document.getElementById("matriculaInput");
const teclas = document.querySelectorAll(".tecla");
const btnRegistrar = document.getElementById("btnRegistrar");
const mensajeExito = document.getElementById("mensajeExito");
const btnCerrarSesion = document.getElementById("btnCerrarSesion");

// ==============================
//      TECLADO NUMÉRICO
// ==============================
teclas.forEach(tecla => {
    tecla.addEventListener("click", () => {
        const valor = tecla.textContent.trim();

        if (valor === "C") {
            matriculaInput.value = "";
        }
        else if (valor === "←") {
            matriculaInput.value = matriculaInput.value.slice(0, -1);
        }
        else if (!isNaN(valor)) {  
            // Solo agrega números si no se ha alcanzado el límite de 5 dígitos
            if (matriculaInput.value.length < 5) {
                matriculaInput.value += valor;
            }
        }
    });
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
btnRegistrar.addEventListener("click", async () => {
    const matricula = matriculaInput.value.trim();

    // Validar que sea exactamente 5 dígitos
    if (matricula.length !== 5) {
        alert("Ingresa una matrícula de 5 dígitos.");
        return;
    }

    // Desactivar botón mientras procesa
    btnRegistrar.disabled = true;
    btnRegistrar.textContent = "Registrando...";

    try {
        // Buscar el alumno en las APIs
        const alumno = await buscarAlumno(matricula);

        if (!alumno) {
            // Si no se encuentra el alumno, mostrar alert y limpiar input
            alert("El usuario no existe.");
            matriculaInput.value = "";
            btnRegistrar.disabled = false;
            btnRegistrar.textContent = "Registrar";
            return;
        }

        // Si se encuentra el alumno, registrar la asistencia
        const payload = {
            matricula: alumno.matricula,
            nombre: alumno.nombre
        };

        const response = await fetch(API_ASISTENCIA, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            // Si hay un error del servidor, mostramos el detalle y detenemos el proceso
            alert(data.detail || "Error al registrar asistencia.");
            btnRegistrar.disabled = false;
            btnRegistrar.textContent = "Registrar";
            return;
        }

        // --- LÓGICA DE LA ALERTA INTERNA ---
        
        // 1. Hacemos que el elemento exista en el flujo de la página
        mensajeExito.style.display = "block";

        // 2. Un pequeño retraso para que el navegador note el cambio y ejecute la transición CSS
        setTimeout(() => {
            mensajeExito.classList.add("show");
        }, 10);

        // 3. Programamos la desaparición tras 3 segundos
        setTimeout(() => {
            // Iniciamos desvanecimiento
            mensajeExito.classList.remove("show");

            // Esperamos a que la transición de opacidad termine (0.6s según tu CSS) para ocultarlo totalmente
            setTimeout(() => {
                mensajeExito.style.display = "none";
            }, 600); 

        }, 3000);

        // Limpiar el campo de texto inmediatamente tras el éxito
        matriculaInput.value = "";

    } catch (e) {
        console.error(e);
        alert("Error de conexión con el servidor.");
    }

    btnRegistrar.disabled = false;
    btnRegistrar.textContent = "Registrar";
});

// ==============================
//   CERRAR SESIÓN
// ==============================
btnCerrarSesion.addEventListener("click", () => {
    if (confirm("¿Estás seguro de que deseas cerrar sesión?")) {
        localStorage.removeItem("isLoggedIn");
        window.location.href = "index.html";
    }
});
