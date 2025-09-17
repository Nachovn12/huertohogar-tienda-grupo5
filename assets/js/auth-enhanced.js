/**
 * Sistema de Autenticación Mejorado para HuertoHogar
 * Incluye validaciones robustas, indicador de fortaleza de contraseña y UX mejorada
 */

class AuthEnhanced {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupPasswordStrength();
        this.setupRutValidation();
        this.setupPhoneValidation();
    }

    setupEventListeners() {
        // Toggle de visibilidad de contraseña
        document.querySelectorAll('.password-toggle').forEach(button => {
            button.addEventListener('click', (e) => {
                this.togglePasswordVisibility(e.target.closest('.password-toggle'));
            });
        });

        // Validación en tiempo real
        this.setupRealTimeValidation();

        // Manejo de formularios
        const registerForm = document.getElementById('register-form');
        const loginForm = document.getElementById('login-form');

        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
    }

    setupRealTimeValidation() {
        // Campos de registro
        const registerFields = [
            'nombres', 'apellidos', 'rut', 'email', 'telefono', 
            'direccion', 'password', 'confirm-password'
        ];

        registerFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('blur', () => this.validateField(fieldId));
                field.addEventListener('input', () => this.clearFieldError(fieldId));
            }
        });

        // Campos de login
        const loginFields = ['email', 'password'];
        loginFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('blur', () => this.validateField(fieldId));
                field.addEventListener('input', () => this.clearFieldError(fieldId));
            }
        });

        // Validación especial para confirmación de contraseña
        const passwordField = document.getElementById('password');
        const confirmPasswordField = document.getElementById('confirm-password');
        
        if (passwordField && confirmPasswordField) {
            passwordField.addEventListener('input', () => {
                this.updatePasswordStrength();
                if (confirmPasswordField.value) {
                    this.validateField('confirm-password');
                }
            });
        }
    }

    setupPasswordStrength() {
        const passwordField = document.getElementById('password');
        if (passwordField) {
            passwordField.addEventListener('input', () => this.updatePasswordStrength());
        }
    }

    setupRutValidation() {
        const rutField = document.getElementById('rut');
        if (rutField) {
            rutField.addEventListener('input', (e) => {
                this.formatRut(e.target);
            });
        }
    }

    setupPhoneValidation() {
        const phoneField = document.getElementById('telefono');
        if (phoneField) {
            phoneField.addEventListener('input', (e) => {
                this.formatPhone(e.target);
            });
        }
    }

    togglePasswordVisibility(button) {
        // Usar la función unificada global
        if (window.togglePasswordVisibility) {
            window.togglePasswordVisibility(button);
        } else {
            // Fallback si la función global no está disponible
            const targetId = button.getAttribute('data-target');
            const input = document.getElementById(targetId);
            const icon = button.querySelector('i');

            if (input && icon) {
                if (input.type === 'password') {
                    input.type = 'text';
                    button.classList.add('active');
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                } else {
                    input.type = 'password';
                    button.classList.remove('active');
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
            }
        }
    }

    validateField(fieldId) {
        const field = document.getElementById(fieldId);
        if (!field) return true;

        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        switch (fieldId) {
            case 'nombres':
                if (!value) {
                    errorMessage = 'El nombre es requerido';
                    isValid = false;
                } else if (value.length < 2) {
                    errorMessage = 'El nombre debe tener al menos 2 caracteres';
                    isValid = false;
                } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
                    errorMessage = 'El nombre solo puede contener letras';
                    isValid = false;
                }
                break;

            case 'apellidos':
                if (!value) {
                    errorMessage = 'El apellido es requerido';
                    isValid = false;
                } else if (value.length < 2) {
                    errorMessage = 'El apellido debe tener al menos 2 caracteres';
                    isValid = false;
                } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
                    errorMessage = 'El apellido solo puede contener letras';
                    isValid = false;
                }
                break;

            case 'rut':
                if (!value) {
                    errorMessage = 'El RUT es requerido';
                    isValid = false;
                } else if (!this.validateRut(value)) {
                    errorMessage = 'El RUT no es válido';
                    isValid = false;
                }
                break;

            case 'email':
                if (!value) {
                    errorMessage = 'El email es requerido';
                    isValid = false;
                } else if (!this.validateEmail(value)) {
                    errorMessage = 'El email no es válido';
                    isValid = false;
                }
                break;

            case 'telefono':
                if (!value) {
                    errorMessage = 'El teléfono es requerido';
                    isValid = false;
                } else if (!this.validatePhone(value)) {
                    errorMessage = 'El teléfono debe tener 9 dígitos (9 + 8 dígitos)';
                    isValid = false;
                }
                break;

            case 'direccion':
                if (!value) {
                    errorMessage = 'La dirección es requerida';
                    isValid = false;
                } else if (value.length < 10) {
                    errorMessage = 'La dirección debe tener al menos 10 caracteres';
                    isValid = false;
                }
                break;

            case 'password':
                if (!value) {
                    errorMessage = 'La contraseña es requerida';
                    isValid = false;
                } else if (value.length < 1) {
                    errorMessage = 'La contraseña es requerida';
                    isValid = false;
                }
                // En login, no validamos formato de contraseña, solo que no esté vacía
                break;

            case 'confirm-password':
                const password = document.getElementById('password')?.value;
                if (!value) {
                    errorMessage = 'Confirma tu contraseña';
                    isValid = false;
                } else if (value !== password) {
                    errorMessage = 'Las contraseñas no coinciden';
                    isValid = false;
                }
                break;
        }

        this.showFieldError(fieldId, errorMessage, isValid);
        return isValid;
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validatePhone(phone) {
        // Para Chile: 9 dígitos (incluyendo el 9 como prefijo)
        const cleanPhone = phone.replace(/\s/g, '');
        const phoneRegex = /^9[0-9]{8}$/;
        return phoneRegex.test(cleanPhone);
    }

    validatePassword(password) {
        const minLength = 8;
        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);

        return password.length >= minLength && hasUppercase && hasLowercase && hasNumber;
    }

    validateRut(rut) {
        // Limpiar RUT
        const cleanRut = rut.replace(/[^0-9kK]/g, '');
        
        if (cleanRut.length < 8) return false;

        const rutNumber = cleanRut.slice(0, -1);
        const dv = cleanRut.slice(-1).toUpperCase();

        // Validar dígito verificador
        let sum = 0;
        let multiplier = 2;

        for (let i = rutNumber.length - 1; i >= 0; i--) {
            sum += parseInt(rutNumber[i]) * multiplier;
            multiplier = multiplier === 7 ? 2 : multiplier + 1;
        }

        const remainder = sum % 11;
        const calculatedDv = remainder === 0 ? '0' : remainder === 1 ? 'K' : (11 - remainder).toString();

        return dv === calculatedDv;
    }

    updatePasswordStrength() {
        const password = document.getElementById('password')?.value || '';
        const strengthBar = document.querySelector('.strength-fill');
        const strengthText = document.querySelector('.strength-text');
        const requirements = {
            length: document.getElementById('req-length'),
            uppercase: document.getElementById('req-uppercase'),
            lowercase: document.getElementById('req-lowercase'),
            number: document.getElementById('req-number')
        };

        // Validar requisitos
        const checks = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password)
        };

        // Actualizar iconos de requisitos
        Object.keys(checks).forEach(key => {
            const requirement = requirements[key];
            if (requirement) {
                const icon = requirement.querySelector('i');
                if (checks[key]) {
                    icon.className = 'fas fa-check';
                    icon.style.color = '#2E8B57';
                } else {
                    icon.className = 'fas fa-times';
                    icon.style.color = '#dc3545';
                }
            }
        });

        // Calcular fortaleza
        const validChecks = Object.values(checks).filter(Boolean).length;
        const strength = (validChecks / 4) * 100;

        // Actualizar barra de progreso
        if (strengthBar) {
            strengthBar.style.width = `${strength}%`;
            
            if (strength === 0) {
                strengthBar.style.backgroundColor = '#e9ecef';
                strengthText.textContent = 'Ingresa una contraseña';
            } else if (strength < 25) {
                strengthBar.style.backgroundColor = '#dc3545';
                strengthText.textContent = 'Muy débil';
            } else if (strength < 50) {
                strengthBar.style.backgroundColor = '#fd7e14';
                strengthText.textContent = 'Débil';
            } else if (strength < 75) {
                strengthBar.style.backgroundColor = '#ffc107';
                strengthText.textContent = 'Regular';
            } else if (strength < 100) {
                strengthBar.style.backgroundColor = '#20c997';
                strengthText.textContent = 'Fuerte';
            } else {
                strengthBar.style.backgroundColor = '#2E8B57';
                strengthText.textContent = 'Muy fuerte';
            }
        }
    }

    formatRut(input) {
        let value = input.value.replace(/[^0-9kK]/g, '');
        
        if (value.length > 1) {
            const rutNumber = value.slice(0, -1);
            const dv = value.slice(-1);
            
            // Formatear número con puntos
            const formattedNumber = rutNumber.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
            value = `${formattedNumber}-${dv}`;
        }
        
        input.value = value;
    }

    formatPhone(input) {
        let value = input.value.replace(/[^0-9]/g, '');
        
        // Limitar a 9 dígitos máximo (9 + 8 dígitos)
        if (value.length > 9) {
            value = value.slice(0, 9);
        }
        
        if (value.length > 0) {
            if (value.length <= 1) {
                // Solo el 9
                value = value;
            } else if (value.length <= 5) {
                // 9 + 4 dígitos: 9 1234
                value = `${value.slice(0, 1)} ${value.slice(1)}`;
            } else {
                // 9 + 8 dígitos: 9 1234 5678
                value = `${value.slice(0, 1)} ${value.slice(1, 5)} ${value.slice(5, 9)}`;
            }
        }
        
        input.value = value;
    }

    showFieldError(fieldId, message, isValid) {
        const errorElement = document.getElementById(`${fieldId}-error`);
        const field = document.getElementById(fieldId);
        
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = message ? 'block' : 'none';
        }
        
        if (field) {
            if (isValid) {
                field.classList.remove('error');
                field.classList.add('valid');
            } else {
                field.classList.remove('valid');
                field.classList.add('error');
            }
        }
    }

    clearFieldError(fieldId) {
        const errorElement = document.getElementById(`${fieldId}-error`);
        const field = document.getElementById(fieldId);
        
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
        
        if (field) {
            field.classList.remove('error', 'valid');
        }
    }

    validateForm(formType) {
        let isValid = true;
        
        if (formType === 'register') {
            const fields = ['nombres', 'apellidos', 'rut', 'email', 'telefono', 'direccion', 'password', 'confirm-password'];
            fields.forEach(fieldId => {
                if (!this.validateField(fieldId)) {
                    isValid = false;
                }
            });

            // Validar términos y condiciones
            const termsCheckbox = document.getElementById('terms');
            if (!termsCheckbox?.checked) {
                this.showFieldError('terms', 'Debes aceptar los términos y condiciones', false);
                isValid = false;
            }
        } else if (formType === 'login') {
            const fields = ['email', 'password'];
            fields.forEach(fieldId => {
                if (!this.validateField(fieldId)) {
                    isValid = false;
                }
            });
        }

        return isValid;
    }

    setLoadingState(buttonId, isLoading) {
        const button = document.getElementById(buttonId);
        if (!button) return;

        console.log(`🔄 setLoadingState llamado: ${buttonId} = ${isLoading}`);
        console.trace('Stack trace del setLoadingState');

        const btnText = button.querySelector('.btn-text');
        const btnLoading = button.querySelector('.btn-loading');

        if (isLoading) {
            button.disabled = true;
            if (btnText) btnText.style.display = 'none';
            if (btnLoading) btnLoading.style.display = 'inline-flex';
            console.log('✅ Estado de carga ACTIVADO');
        } else {
            button.disabled = false;
            if (btnText) btnText.style.display = 'inline';
            if (btnLoading) btnLoading.style.display = 'none';
            console.log('✅ Estado de carga DESACTIVADO');
        }
    }

    showSuccessMessage(message) {
        this.showMessage(message, 'success');
    }

    showErrorMessage(message) {
        this.showMessage(message, 'error');
    }

    showMessage(message, type) {
        // Crear o actualizar mensaje de notificación
        let messageElement = document.getElementById('auth-message');
        if (!messageElement) {
            messageElement = document.createElement('div');
            messageElement.id = 'auth-message';
            messageElement.className = 'auth-message';
            
            // Buscar un contenedor apropiado para el mensaje
            let container = document.querySelector('.auth-card') || 
                          document.querySelector('.main-content') || 
                          document.querySelector('.account-content') || 
                          document.querySelector('main') || 
                          document.body;
            
            if (container) {
                container.appendChild(messageElement);
            } else {
                console.error('❌ No se encontró contenedor para el mensaje');
                return;
            }
        }

        messageElement.textContent = message;
        messageElement.className = `auth-message ${type}`;
        messageElement.style.display = 'block';

        // Auto-ocultar después de 5 segundos
        setTimeout(() => {
            messageElement.style.display = 'none';
        }, 5000);
    }

    async handleRegister(e) {
        e.preventDefault();
        
        if (!this.validateForm('register')) {
            return;
        }

        const formData = new FormData(e.target);
        const userData = {
            nombres: formData.get('nombres'),
            apellidos: formData.get('apellidos'),
            rut: formData.get('rut'),
            email: formData.get('email'),
            telefono: formData.get('telefono'),
            direccion: formData.get('direccion'),
            codigoPais: formData.get('countryCode') || '+56',
            password: formData.get('password'),
            newsletter: formData.get('newsletter') === 'on'
        };

        this.setLoadingState('register-submit', true);

        try {
            // Simular llamada a API
            await this.simulateApiCall(2000);
            
            // Crear ID único para el usuario
            const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            
            // Simular datos de usuario completos
            const newUserData = {
                id: userId,
                nombre: userData.nombres,
                apellido: userData.apellidos,
                rut: userData.rut,
                email: userData.email,
                telefono: userData.telefono,
                direccion: userData.direccion,
                codigoPais: userData.codigoPais,
                password: userData.password, // Guardar contraseña para validación
                fechaNacimiento: '', // Se puede agregar en el perfil
                adultos: '1', // Valor por defecto
                ninos: '0', // Valor por defecto
                preferenciasDieteticas: [], // Array vacío por defecto
                newsletter: userData.newsletter,
                fechaRegistro: new Date().toISOString(),
                name: `${userData.nombres} ${userData.apellidos}` // Para compatibilidad
            };
            
            // Guardar en localStorage
            this.saveUserSession(newUserData, true);
            
            // Actualizar header
            this.updateHeaderUI(newUserData);
            
            // Simular éxito
            this.showSuccessMessage(`¡Cuenta creada exitosamente! Bienvenido a HuertoHogar, ${newUserData.name}.`);
            
            // Redirigir después de 2 segundos
            setTimeout(() => {
                window.location.href = 'mi-cuenta.html';
            }, 2000);

        } catch (error) {
            this.showErrorMessage('Error al crear la cuenta. Inténtalo de nuevo.');
        } finally {
            this.setLoadingState('register-submit', false);
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        console.log('🔐 Iniciando proceso de login...');
        
        if (!this.validateForm('login')) {
            console.log('❌ Validación de formulario falló');
            return;
        }
        
        console.log('✅ Validación de formulario pasó');

        const formData = new FormData(e.target);
        const loginData = {
            email: formData.get('email'),
            password: formData.get('password'),
            remember: formData.get('remember') === 'on'
        };

        // VALIDACIÓN INMEDIATA - Sin estado de carga
        console.log('🔍 Validando credenciales inmediatamente...');
        
        // Buscar usuario existente en la base de datos
        const existingUsers = JSON.parse(localStorage.getItem('huerto_users') || '[]');
        console.log('🔍 Usuarios en localStorage:', existingUsers);
        console.log('🔍 Buscando usuario con email:', loginData.email);
        
        const userData = existingUsers.find(user => user.email === loginData.email);
        console.log('🔍 Usuario encontrado:', userData);
        
        // Validar credenciales INMEDIATAMENTE
        if (!userData) {
            // Verificar si es el usuario admin especial
            if (loginData.email === 'admin' && loginData.password === 'admin') {
                console.log('✅ Usuario admin detectado - ACCESO DIRECTO');
                userData = {
                    id: 'admin',
                    name: 'Administrador',
                    email: 'admin',
                    role: 'admin',
                    isAdmin: true
                };
            } else {
                console.log('❌ Usuario no encontrado - ERROR INMEDIATO');
                this.showErrorMessage('Email o contraseña incorrectos.');
                return;
            }
        } else {
            // Verificar contraseña INMEDIATAMENTE para usuarios normales
            console.log('🔍 Comparando contraseñas:');
            console.log('  - Contraseña ingresada:', loginData.password);
            console.log('  - Contraseña guardada:', userData.password);
            console.log('  - ¿Coinciden?:', userData.password === loginData.password);
            
            if (userData.password !== loginData.password) {
                console.log('❌ Contraseña incorrecta - ERROR INMEDIATO');
                this.showErrorMessage('Email o contraseña incorrectos.');
                return;
            }
        }
        
        console.log('✅ Credenciales válidas, procediendo con login');
        
        // Solo mostrar estado de carga si las credenciales son correctas
        this.setLoadingState('login-submit', true);

        try {
            console.log('🔄 Simulando llamada a API...');
            // Simular llamada a API
            await this.simulateApiCall(1500);
            console.log('✅ Llamada a API completada');
            
            // Credenciales correctas - proceder con el login
            try {
                console.log('💾 Guardando sesión...');
                this.saveUserSession(userData, loginData.remember);
                
                console.log('🔄 Actualizando header...');
                this.updateHeaderUI(userData);
                
                console.log('✅ Mostrando mensaje de éxito...');
                this.showSuccessMessage(`¡Bienvenido de vuelta, ${userData.name}!`);
                
                // Redirigir después de 1.5 segundos
                console.log('⏰ Programando redirección...');
                setTimeout(() => {
                    console.log('🚀 Redirigiendo a index.html');
                    window.location.href = 'index.html';
                }, 1500);
            } catch (loginError) {
                console.error('❌ Error durante el proceso de login exitoso:', loginError);
                this.showErrorMessage('Error al completar el login. Inténtalo de nuevo.');
                this.setLoadingState('login-submit', false);
                return;
            }

        } catch (error) {
            console.error('❌ Error en el proceso de login:', error);
            this.showErrorMessage('Error de conexión. Inténtalo de nuevo.');
            this.setLoadingState('login-submit', false);
            return; // Asegurar que se salga en caso de error
        } finally {
            this.setLoadingState('login-submit', false);
        }
    }

    async simulateApiCall(delay) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Simular llamada exitosa
                resolve();
            }, delay);
        });
    }

    extractUserNameFromEmail(email) {
        const name = email.split('@')[0];
        return name.charAt(0).toUpperCase() + name.slice(1);
    }

    saveUserSession(userData, remember = false) {
        const sessionData = {
            user: userData,
            isAuthenticated: true,
            timestamp: Date.now(),
            remember: remember
        };
        
        // Guardar sesión
        if (remember) {
            localStorage.setItem('huertoHogarAuth', JSON.stringify(sessionData));
        } else {
            sessionStorage.setItem('huertoHogarAuth', JSON.stringify(sessionData));
        }
        
        // Guardar permisos de administrador si corresponde
        if (userData.role === 'admin' || userData.isAdmin) {
            localStorage.setItem('huertohogar_is_admin', 'true');
            localStorage.setItem('huertohogar_user_role', 'admin');
            console.log('✅ Permisos de administrador guardados');
        }
        
        // Guardar datos del usuario en la lista de usuarios
        this.saveUserData(userData);
    }

    saveUserData(userData) {
        // Obtener usuarios existentes
        const existingUsers = JSON.parse(localStorage.getItem('huerto_users') || '[]');
        
        // Verificar si el usuario ya existe
        const existingUserIndex = existingUsers.findIndex(user => user.id === userData.id);
        
        if (existingUserIndex >= 0) {
            // Actualizar usuario existente
            existingUsers[existingUserIndex] = userData;
        } else {
            // Agregar nuevo usuario
            existingUsers.push(userData);
        }
        
        // Guardar lista actualizada
        localStorage.setItem('huerto_users', JSON.stringify(existingUsers));
        
        // Crear sesión para compatibilidad con el sistema existente
        const sessionData = {
            userId: userData.id,
            isAuthenticated: true,
            timestamp: Date.now()
        };
        localStorage.setItem('huerto_session', JSON.stringify(sessionData));
        
        console.log('Usuario guardado:', userData);
        console.log('Lista de usuarios actualizada:', existingUsers);
    }

    updateHeaderUI(userData) {
        console.log('🔄 Actualizando header UI con datos:', userData);
        
        const loginLink = document.getElementById('user-login-link');
        const userProfile = document.getElementById('user-profile');
        const userName = document.getElementById('user-name');

        console.log('🔍 Elementos del header:', {
            loginLink: !!loginLink,
            userProfile: !!userProfile,
            userName: !!userName
        });

        if (loginLink && userProfile && userName) {
            // Ocultar botón de login
            loginLink.style.display = 'none';
            
            // Mostrar perfil de usuario
            userProfile.style.display = 'flex';
            
            // Determinar el nombre a mostrar
            let displayName = '';
            if (userData.nombres) {
                // Si tiene nombres, usar el primer nombre
                displayName = userData.nombres.split(' ')[0];
                console.log('✅ Usando nombres del usuario:', displayName);
            } else if (userData.name) {
                // Si tiene name, usar el primer nombre
                displayName = userData.name.split(' ')[0];
                console.log('✅ Usando name del usuario:', displayName);
            } else if (userData.email) {
                // Si no tiene nombres, extraer del email
                displayName = this.extractUserNameFromEmail(userData.email);
                console.log('✅ Extrayendo nombre del email:', displayName);
            } else {
                displayName = 'Usuario';
                console.log('⚠️ Usando nombre por defecto:', displayName);
            }
            
            userName.textContent = displayName;
            console.log('✅ Nombre actualizado en el header:', displayName);
            
            // Agregar event listeners para logout
            this.setupLogoutHandler();
        } else {
            console.error('❌ No se encontraron todos los elementos del header');
        }
    }

    setupLogoutHandler() {
        const logoutBtn = document.getElementById('logout-btn');
        console.log('🔍 Configurando logout handler, botón encontrado:', !!logoutBtn);
        
        if (logoutBtn) {
            // Remover event listeners existentes para evitar duplicados
            logoutBtn.removeEventListener('click', this.handleLogout);
            
            // Crear función bound para poder removerla después
            this.handleLogout = (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🚪 Logout iniciado');
                this.logout();
            };
            
            logoutBtn.addEventListener('click', this.handleLogout);
            console.log('✅ Event listener de logout agregado');
        } else {
            console.error('❌ No se encontró el botón de logout');
        }
    }

    logout() {
        console.log('🚪 Ejecutando logout...');
        
        // Limpiar todas las sesiones relacionadas
        localStorage.removeItem('huertoHogarAuth');
        sessionStorage.removeItem('huertoHogarAuth');
        localStorage.removeItem('huerto_session');
        sessionStorage.removeItem('huerto_session');
        
        console.log('✅ Sesiones limpiadas');
        
        // Actualizar header
        const loginLink = document.getElementById('user-login-link');
        const userProfile = document.getElementById('user-profile');
        
        if (loginLink && userProfile) {
            loginLink.style.display = 'inline-block';
            userProfile.style.display = 'none';
            console.log('✅ Header actualizado');
        }
        
        // Mostrar mensaje de confirmación
        this.showSuccessMessage('Sesión cerrada correctamente');
        
        // Redirigir al inicio después de un breve delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }

    // Función para verificar sesión al cargar la página
    checkExistingSession() {
        // Verificar sesión del nuevo sistema
        const sessionData = localStorage.getItem('huertoHogarAuth') || sessionStorage.getItem('huertoHogarAuth');
        
        if (sessionData) {
            try {
                const auth = JSON.parse(sessionData);
                if (auth.isAuthenticated && auth.user) {
                    // Verificar si es administrador y guardar permisos
                    if (auth.user.role === 'admin' || auth.user.isAdmin) {
                        localStorage.setItem('huertohogar_is_admin', 'true');
                        localStorage.setItem('huertohogar_user_role', 'admin');
                        console.log('✅ Permisos de administrador restaurados');
                    }
                    this.updateHeaderUI(auth.user);
                    return true;
                }
            } catch (error) {
                console.error('Error al cargar sesión:', error);
            }
        }
        
        // Verificar sesión del sistema existente
        const existingSession = localStorage.getItem('huerto_session');
        if (existingSession) {
            try {
                const session = JSON.parse(existingSession);
                if (session.userId) {
                    const users = JSON.parse(localStorage.getItem('huerto_users') || '[]');
                    const user = users.find(u => u.id === session.userId);
                    if (user) {
                        this.updateHeaderUI(user);
                        return true;
                    }
                }
            } catch (error) {
                console.error('Error al cargar sesión existente:', error);
            }
        }
        
        return false;
    }
}

// Función global para actualizar el header en todas las páginas
window.updateHeaderInAllPages = function() {
    if (window.authEnhanced) {
        console.log('🔄 Actualizando header en todas las páginas...');
        window.authEnhanced.checkExistingSession();
    } else {
        console.log('⚠️ authEnhanced no está disponible aún, reintentando...');
        setTimeout(() => {
            if (window.authEnhanced) {
                window.authEnhanced.checkExistingSession();
            }
        }, 100);
    }
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const auth = new AuthEnhanced();
    // Hacer disponible globalmente
    window.authEnhanced = auth;
    // Verificar si hay una sesión existente
    auth.checkExistingSession();
    
    // Event listener global como respaldo para logout
    document.addEventListener('click', (e) => {
        if (e.target && e.target.id === 'logout-btn') {
            e.preventDefault();
            e.stopPropagation();
            console.log('🚪 Logout desde event listener global');
            auth.logout();
        }
    });
});
