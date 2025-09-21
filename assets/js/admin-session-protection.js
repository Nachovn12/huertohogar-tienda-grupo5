/**
 * PROTECCIÓN DE SESIÓN DE ADMINISTRADOR
 * Este script debe ejecutarse ANTES que cualquier otro script
 * para proteger la sesión de administrador de ser eliminada
 */

(function() {
    'use strict';
    
    console.log('🛡️ Inicializando protección de sesión de administrador...');
    
    // Verificar si hay una sesión de administrador activa
    const isAdmin = localStorage.getItem('huertohogar_is_admin') === 'true';
    const userRole = localStorage.getItem('huertohogar_user_role');
    
    if (isAdmin && userRole === 'admin') {
        console.log('✅ Sesión de administrador detectada, activando protección...');
        
        // Lista de claves protegidas
        const protectedKeys = [
            'huertohogar_is_admin',
            'huertohogar_user_role',
            'huertoHogarAuth' // También proteger la sesión principal
        ];
        
        // Función para verificar si una clave está protegida
        function isProtectedKey(key) {
            return protectedKeys.includes(key);
        }
        
        // Interceptar localStorage.removeItem
        const originalRemoveItem = localStorage.removeItem;
        localStorage.removeItem = function(key) {
            if (isProtectedKey(key)) {
                console.log('🛡️ BLOQUEADO: Intento de eliminar clave protegida:', key);
                console.trace('🛡️ Stack trace del intento de eliminación:');
                return; // No eliminar la clave
            }
            return originalRemoveItem.call(this, key);
        };
        
        // Interceptar localStorage.clear
        const originalClear = localStorage.clear;
        localStorage.clear = function() {
            console.log('🛡️ BLOQUEADO: Intento de limpiar localStorage completo');
            console.trace('🛡️ Stack trace del intento de limpieza:');
            
            // Solo limpiar claves no protegidas
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && !isProtectedKey(key)) {
                    keysToRemove.push(key);
                }
            }
            
            // Eliminar solo las claves no protegidas
            keysToRemove.forEach(key => {
                originalRemoveItem.call(localStorage, key);
            });
            
            console.log('🛡️ Limpieza selectiva completada, claves protegidas preservadas');
        };
        
        // Interceptar sessionStorage.removeItem
        const originalSessionRemoveItem = sessionStorage.removeItem;
        sessionStorage.removeItem = function(key) {
            if (isProtectedKey(key)) {
                console.log('🛡️ BLOQUEADO: Intento de eliminar clave protegida de sessionStorage:', key);
                return;
            }
            return originalSessionRemoveItem.call(this, key);
        };
        
        // Interceptar sessionStorage.clear
        const originalSessionClear = sessionStorage.clear;
        sessionStorage.clear = function() {
            console.log('🛡️ BLOQUEADO: Intento de limpiar sessionStorage completo');
            
            // Solo limpiar claves no protegidas
            const keysToRemove = [];
            for (let i = 0; i < sessionStorage.length; i++) {
                const key = sessionStorage.key(i);
                if (key && !isProtectedKey(key)) {
                    keysToRemove.push(key);
                }
            }
            
            keysToRemove.forEach(key => {
                originalSessionRemoveItem.call(sessionStorage, key);
            });
        };
        
        // Función para limpiar sesión de administrador (solo para logout manual)
        window.clearAdminSession = function() {
            console.log('🚪 Limpieza manual de sesión de administrador autorizada');
            protectedKeys.forEach(key => {
                originalRemoveItem.call(localStorage, key);
                originalSessionRemoveItem.call(sessionStorage, key);
            });
        };
        
        console.log('✅ Protección de sesión de administrador activada');
        
    } else {
        console.log('ℹ️ No hay sesión de administrador activa, protección no necesaria');
    }
    
})();
