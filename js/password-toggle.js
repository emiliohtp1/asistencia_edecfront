// Script reutilizable para toggle de contraseña
document.addEventListener('DOMContentLoaded', function() {
    // Conjunto para rastrear inputs ya inicializados
    const initializedInputs = new WeakSet();
    
    // SVG para ojo (mostrar contraseña)
    const eyeSlashSvg = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
    </svg>`;
    
    // SVG para ojo tachado (ocultar contraseña)
    const eyeSvg = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
    </svg>`;
    
    // Función para inicializar el toggle en un input
    function initPasswordToggle(input) {
        // Verificar si ya fue inicializado
        if (initializedInputs.has(input)) {
            return;
        }
        
        // Verificar si ya tiene un icono (evitar duplicados)
        let wrapper = input.parentElement;
        if (wrapper.classList.contains('password-input-wrapper')) {
            const existingIcon = wrapper.querySelector('.password-toggle-icon');
            if (existingIcon) {
                initializedInputs.add(input);
                return;
            }
        }
        
        // Si no tiene wrapper, crearlo
        if (!wrapper.classList.contains('password-input-wrapper')) {
            wrapper = document.createElement('div');
            wrapper.className = 'password-input-wrapper';
            input.parentNode.insertBefore(wrapper, input);
            wrapper.appendChild(input);
        }
        
        // Crear el icono
        const toggleIcon = document.createElement('button');
        toggleIcon.type = 'button';
        toggleIcon.className = 'password-toggle-icon';
        toggleIcon.innerHTML = eyeSvg;
        toggleIcon.setAttribute('aria-label', 'Mostrar contraseña');
        wrapper.appendChild(toggleIcon);
        
        // Función para actualizar el icono
        function updateIcon() {
            if (input.type === 'password') {
                toggleIcon.innerHTML = eyeSvg;
                toggleIcon.setAttribute('aria-label', 'Mostrar contraseña');
                toggleIcon.classList.remove('visible');
            } else {
                toggleIcon.innerHTML = eyeSlashSvg;
                toggleIcon.setAttribute('aria-label', 'Ocultar contraseña');
                toggleIcon.classList.add('visible');
            }
        }
        
        // Inicializar el icono según el estado actual
        updateIcon();
        
        // Agregar evento click al icono
        toggleIcon.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (input.type === 'password') {
                input.type = 'text';
            } else {
                input.type = 'password';
            }
            updateIcon();
        });
        
        // Marcar como inicializado
        initializedInputs.add(input);
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
