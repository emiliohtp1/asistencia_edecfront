// Funcionalidad del teclado numérico y botones
// (Solo interfaz, sin funcionalidad de API aún)

document.addEventListener('DOMContentLoaded', () => {
    const matriculaInput = document.getElementById('matricula');
    const keyboardKeys = document.querySelectorAll('.key');
    const btnEntrada = document.querySelector('.btn-entrada');
    const btnSalida = document.querySelector('.btn-salida');
    const btnRegistrar = document.getElementById('btnRegistrar');
    
    let tipoSeleccionado = null;

    // Funcionalidad del teclado numérico
    keyboardKeys.forEach(key => {
        key.addEventListener('click', () => {
            const value = key.getAttribute('data-value');
            const action = key.getAttribute('data-action');
            
            if (value) {
                // Agregar número
                matriculaInput.value += value;
                verificarEstado();
            } else if (action === 'clear') {
                // Limpiar todo
                matriculaInput.value = '';
                verificarEstado();
            } else if (action === 'delete') {
                // Eliminar último carácter
                matriculaInput.value = matriculaInput.value.slice(0, -1);
                verificarEstado();
            }
        });
    });

    // Selección de tipo (Entrada/Salida)
    btnEntrada.addEventListener('click', () => {
        tipoSeleccionado = 'entrada';
        btnEntrada.classList.add('selected');
        btnSalida.classList.remove('selected');
        verificarEstado();
    });

    btnSalida.addEventListener('click', () => {
        tipoSeleccionado = 'salida';
        btnSalida.classList.add('selected');
        btnEntrada.classList.remove('selected');
        verificarEstado();
    });

    // Verificar estado para habilitar/deshabilitar botón Registrar
    function verificarEstado() {
        const tieneMatricula = matriculaInput.value.length > 0;
        const tieneTipo = tipoSeleccionado !== null;
        
        if (tieneMatricula && tieneTipo) {
            btnRegistrar.disabled = false;
        } else {
            btnRegistrar.disabled = true;
        }
    }

    // Click en botón Registrar (por ahora solo muestra mensaje)
    btnRegistrar.addEventListener('click', () => {
        if (!btnRegistrar.disabled) {
            console.log('Registrar:', {
                matricula: matriculaInput.value,
                tipo: tipoSeleccionado
            });
            // Aquí se agregará la funcionalidad de API más adelante
        }
    });
});

