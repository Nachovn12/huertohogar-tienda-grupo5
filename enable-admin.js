/**
 * Script para habilitar el acceso de administrador
 * Ejecutar en la consola del navegador para acceder al panel de administración
 */

// Habilitar acceso de administrador
localStorage.setItem('huertohogar_is_admin', 'true');
localStorage.setItem('huertohogar_user_role', 'admin');

console.log('✅ Acceso de administrador habilitado');
console.log('🔗 Puedes acceder al panel en: admin-panel.html');

// Verificar que se guardó correctamente
const isAdmin = localStorage.getItem('huertohogar_is_admin');
const userRole = localStorage.getItem('huertohogar_user_role');

console.log('📊 Estado actual:');
console.log('- Es administrador:', isAdmin);
console.log('- Rol de usuario:', userRole);

// Mostrar enlace directo
const currentUrl = window.location.origin + window.location.pathname.replace(/[^/]*$/, '');
const adminUrl = currentUrl + 'admin-panel.html';
console.log('🌐 Enlace directo:', adminUrl);

// Crear botón flotante para acceder al panel
const adminButton = document.createElement('div');
adminButton.innerHTML = `
    <a href="admin-panel.html" style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: #2E8B57;
        color: white;
        padding: 12px 20px;
        border-radius: 25px;
        text-decoration: none;
        font-weight: bold;
        box-shadow: 0 4px 15px rgba(46, 139, 87, 0.3);
        z-index: 9999;
        display: flex;
        align-items: center;
        gap: 8px;
        font-family: 'Montserrat', sans-serif;
        transition: all 0.3s ease;
    " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(46, 139, 87, 0.4)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(46, 139, 87, 0.3)'">
        <i class="fas fa-cog"></i>
        Panel Admin
    </a>
`;

document.body.appendChild(adminButton);

console.log('🎯 Botón de acceso al panel agregado a la página');
