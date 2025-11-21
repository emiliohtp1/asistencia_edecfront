const API_ASISTENCIA = "https://asistencia-edec.onrender.com/api/asistencias/registrar";

const matriculaInput = document.getElementById("matriculaInput");
const teclas = document.querySelectorAll(".tecla");
const btnRegistrar = document.getElementById("btnRegistrar");
const mensajeExito = document.getElementById("mensajeExito");

// === TECLADO NUMÉRICO ===
teclas.forEach(tecla => {
    tecla.addEventListener("click", () => {
        const valor = tecla.textContent;

        if (valor === "C") {
            matriculaInput.value = "";
        } 
        else if (valor === "←") {
            matriculaInput.value = matriculaInput.value.slice(0, -1);
        } 
        else {
            matriculaInput.value += valor;
        }
    });
});

// === REGISTRAR ASISTENCIA ===
btnRegistrar.addEventListener("click", async () => {
    const matricula = matriculaInput.value.trim();

    if (matricula === "") {
        alert("Ingresa una matrícula.");
        return;
    }

    // Payload simple (Opción B)
    const payload = { matricula };

    try {
        const response = await fetch(API_ASISTENCIA, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const error = await response.json();
            alert(error.detail || "Error al registrar asistencia.");
            return;
        }

        // Mostrar popup flotante
        mensajeExito.style.display = "block";
        setTimeout(() => mensajeExito.style.display = "none", 3000);

        // Limpiar input
        matriculaInput.value = "";

    } catch (e) {
        console.error(e);
        alert("Error de conexión con el servidor.");
    }
});
