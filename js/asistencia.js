const API_ASISTENCIA = "https://asistencia-edec.onrender.com/api/asistencias/registrar";

const matriculaInput = document.getElementById("matriculaInput");
const teclas = document.querySelectorAll(".tecla");
const btnRegistrar = document.getElementById("btnRegistrar");
const mensajeExito = document.getElementById("mensajeExito");

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
            alert(data.detail || "Error al registrar asistencia.");
            btnRegistrar.disabled = false;
            btnRegistrar.textContent = "Registrar";
            return;
        }

        // Mostrar popup flotante con animación
        mensajeExito.classList.add("show");

        setTimeout(() => {
            mensajeExito.classList.remove("show");

            // Espera a que termine la animación antes de ocultarlo
            setTimeout(() => {
                mensajeExito.style.display = "none";
            }, 500);

        }, 3000);


        // Limpiar campo
        matriculaInput.value = "";

    } catch (e) {
        console.error(e);
        alert("Error de conexión con el servidor.");
    }

    btnRegistrar.disabled = false;
    btnRegistrar.textContent = "Registrar";
});
