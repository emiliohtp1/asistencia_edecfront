const API_ASISTENCIA = "https://asistencia-edec.onrender.com/api/asistencias/registrar";

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
            // Solo agrega números
            matriculaInput.value += valor;
        }
    });
});

// ==============================
//   REGISTRAR ASISTENCIA
// ==============================
btnRegistrar.addEventListener("click", async () => {
    const matricula = matriculaInput.value.trim();

    if (matricula.length < 4) {
        alert("Ingresa una matrícula válida.");
        return;
    }

    // Desactivar botón mientras envía
    btnRegistrar.disabled = true;
    btnRegistrar.textContent = "Registrando...";

    const payload = { matricula };

    try {
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
