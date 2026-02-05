// Script reutilizable para toggle de contraseña
document.addEventListener('DOMContentLoaded', function() {
    // Función para inicializar el toggle en un input
    function initPasswordToggle(input) {
        let wrapper = input.parentElement;
        let toggleIcon = wrapper.querySelector('.password-toggle-icon');
        
        // Si no tiene wrapper, crearlo
        if (!wrapper.classList.contains('password-input-wrapper')) {
            wrapper = document.createElement('div');
            wrapper.className = 'password-input-wrapper';
            input.parentNode.insertBefore(wrapper, input);
            wrapper.appendChild(input);
        }
        
        // Si no tiene icono, crearlo
        if (!toggleIcon) {
            toggleIcon = document.createElement('span');
            toggleIcon.className = 'password-toggle-icon';
            toggleIcon.innerHTML = '👁️';
            toggleIcon.setAttribute('aria-label', 'Mostrar contraseña');
            wrapper.appendChild(toggleIcon);
        }
        
        // Remover event listeners previos si existen
        const newToggleIcon = toggleIcon.cloneNode(true);
        toggleIcon.parentNode.replaceChild(newToggleIcon, toggleIcon);
        toggleIcon = newToggleIcon;
        
        // Agregar evento click al icono
        toggleIcon.addEventListener('click', function() {
            if (input.type === 'password') {
                input.type = 'text';
                toggleIcon.innerHTML = '👁️‍🗨️';
                toggleIcon.setAttribute('aria-label', 'Ocultar contraseña');
            } else {
                input.type = 'password';
                toggleIcon.innerHTML = '👁️';
                toggleIcon.setAttribute('aria-label', 'Mostrar contraseña');
            }
        });
    }
    
    // Inicializar todos los inputs de tipo password
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    passwordInputs.forEach(initPasswordToggle);
    
    // También inicializar inputs que puedan cambiar a password dinámicamente
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeType === 1) { // Element node
                    const newPasswordInputs = node.querySelectorAll ? node.querySelectorAll('input[type="password"]') : [];
                    newPasswordInputs.forEach(initPasswordToggle);
                }
            });
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});
