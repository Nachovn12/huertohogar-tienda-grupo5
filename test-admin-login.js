/**
 * Script de prueba para el login de administrador
 * Ejecutar en la consola del navegador para probar el acceso
 */

console.log('🧪 Iniciando prueba de login de administrador...');

// Limpiar sesiones existentes para prueba
localStorage.removeItem('huertoHogarAuth');
sessionStorage.removeItem('huertoHogarAuth');
localStorage.removeItem('huertohogar_is_admin');
localStorage.removeItem('huertohogar_user_role');

console.log('🧹 Sesiones limpiadas');

// Simular login de administrador
const adminUser = {
    id: 'admin',
    name: 'Administrador',
    email: 'admin',
    role: 'admin',
    isAdmin: true
};

// Guardar sesión como si fuera un login exitoso
const sessionData = {
    user: adminUser,
    isAuthenticated: true,
    timestamp: Date.now(),
    remember: true
};

localStorage.setItem('huertoHogarAuth', JSON.stringify(sessionData));
localStorage.setItem('huertohogar_is_admin', 'true');
localStorage.setItem('huertohogar_user_role', 'admin');

console.log('✅ Sesión de administrador creada');
console.log('📊 Datos guardados:');
console.log('- huertoHogarAuth:', localStorage.getItem('huertoHogarAuth'));
console.log('- huertohogar_is_admin:', localStorage.getItem('huertohogar_is_admin'));
console.log('- huertohogar_user_role:', localStorage.getItem('huertohogar_user_role'));

// Verificar que el panel de administración debería estar accesible
console.log('🔍 Verificando acceso al panel...');
const isAdmin = localStorage.getItem('huertohogar_is_admin') === 'true';
const userRole = localStorage.getItem('huertohogar_user_role');

if (isAdmin && userRole === 'admin') {
    console.log('✅ Acceso al panel de administración habilitado');
    console.log('🔗 Puedes acceder a: admin-panel.html');
} else {
    console.log('❌ Error: No se pudo habilitar el acceso');
}

// Crear botón de acceso directo
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
console.log('🎯 Botón de acceso al panel agregado');

console.log('🎉 Prueba completada. Recarga la página para ver los cambios.');
