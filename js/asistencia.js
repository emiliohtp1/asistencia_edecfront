const API_ALUMNOS = "https://asistencia-edec.onrender.com/api/usuarios/alumnos/todos";
const API_ASISTENCIA = "https://asistencia-edec.onrender.com/api/asistencia/registrar"; // <-- deberás crearlo

const matriculaInput = document.getElementById("matriculaInput");
const teclas = document.querySelectorAll(".tecla");
const btnEntrada = document.getElementById("btnEntrada");
const btnSalida = document.getElementById("btnSalida");
const btnRegistrar = document.getElementById("btnRegistrar");
const mensajeExito = document.getElementById("mensajeExito");

let tipoRegistro = null;

// Obtener referencia del input donde se escribe la matrícula
const inputMatricula = document.getElementById("matriculaInput");

// Función: insertar número en el input
function agregarNumero(num) {
    inputMatricula.value += num;
}

// Función: borrar último número
function borrarUltimo() {
    inputMatricula.value = inputMatricula.value.slice(0, -1);
}

// Función: limpiar todo
function limpiarInput() {
    inputMatricula.value = "";
}

// Teclado numérico
teclas.forEach(tecla => {
    tecla.addEventListener("click", () => {
        const valor = tecla.textContent;

        if (valor === "C") {
            matriculaInput.value = "";
        } else if (valor === "←") {
            matriculaInput.value = matriculaInput.value.slice(0, -1);
        } else {
            matriculaInput.value += valor;
        }
    });
});

// Selección entrada/salida
btnEntrada.addEventListener("click", () => {
    tipoRegistro = "entrada";
    btnEntrada.classList.add("selected");
    btnSalida.classList.remove("selected");
});

btnSalida.addEventListener("click", () => {
    tipoRegistro = "salida";
    btnSalida.classList.add("selected");
    btnEntrada.classList.remove("selected");
});

// Registrar asistencia
btnRegistrar.addEventListener("click", async () => {
    const matricula = matriculaInput.value.trim();

    if (matricula === "") {
        alert("Ingresa una matrícula.");
        return;
    }

    if (!tipoRegistro) {
        alert("Selecciona Entrada o Salida.");
        return;
    }

    // Buscar alumno
    const response = await fetch(API_ALUMNOS);
    const data = await response.json();

    const alumno = data.alumnos.find(a => a.matricula === matricula);

    if (!alumno) {
        alert("Matrícula no encontrada.");
        return;
    }

    // Preparar registro
    const payload = {
        matricula: alumno.matricula,
        nombre: alumno.nombre_completo,
        carrera: alumno.carrera,
        tipo: tipoRegistro
    };

    // Enviar registro a API
    await fetch(API_ASISTENCIA, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    // Mostrar mensaje de éxito
    mensajeExito.style.display = "block";
    setTimeout(() => mensajeExito.style.display = "none", 3000);

    matriculaInput.value = "";
    btnEntrada.classList.remove("selected");
    btnSalida.classList.remove("selected");
    tipoRegistro = null;
});
