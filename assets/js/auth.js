/* Autenticación HuertoHogar - localStorage/sessionStorage */
(function () {
    'use strict';

    // --- Constantes y claves de almacenamiento ---
    const STORAGE_KEYS = {
        users: 'users',
        usersChecksum: 'users_checksum',
        currentSession: 'currentSession',
        currentSessionChecksum: 'currentSession_checksum',
        failedAttempts: 'failedAttempts',
        registerThrottle: 'registerThrottle'
    };

    const SECURITY = {
        passwordMinLength: 8,
        sessionInactivityMs: 30 * 60 * 1000, // 30 minutos
        loginMaxAttempts: 3,
        loginBlockMs: 5 * 60 * 1000, // 5 minutos
        registerRateMax: 3,
        registerRateWindowMs: 60 * 1000, // 1 minuto
        saltPrefix: 'HuertoHogar$S1$',
        saltSuffix: '$S2$Edu2025'
    };

    // --- Utilidades ---
    const now = () => Date.now();

    const uuid = () =>
        'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });

    const sanitize = (value) => {
        if (typeof value !== 'string') return value;
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;', '/': '&#x2F;' };
        return value.replace(/[&<>"'/]/g, (m) => map[m]);
    };

    const trimAndNormalize = (value) => (value || '').toString().trim().replace(/\s+/g, ' ');

    const encryptPassword = (plain) => {
        const payload = SECURITY.saltPrefix + plain + SECURITY.saltSuffix;
        try { return btoa(unescape(encodeURIComponent(payload))); } catch { return btoa(payload); }
    };

    const comparePassword = (plain, encrypted) => encryptPassword(plain) === encrypted;

    const generateSessionToken = () => `${now()}_${Math.random().toString(36).slice(2)}_${uuid()}`;

    const readJSON = (key, fallback) => {
        try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
    };

    const writeJSON = (key, value) => {
        try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
    };

    const computeChecksum = (obj) => {
        try {
            const raw = SECURITY.saltPrefix + JSON.stringify(obj) + SECURITY.saltSuffix;
            return btoa(unescape(encodeURIComponent(raw)));
        } catch {
            return btoa(SECURITY.saltPrefix + JSON.stringify(obj));
        }
    };

    const readSession = () => {
        try {
            // Priorizar sessionStorage (sesión no recordada) si existe y no expirada
            const ss = sessionStorage.getItem(STORAGE_KEYS.currentSession);
            if (ss) {
                const parsed = JSON.parse(ss);
                return parsed;
            }
        } catch {}
        // Fallback a localStorage (sesión recordada)
        return readJSON(STORAGE_KEYS.currentSession, null);
    };

    const writeSession = (session, remember) => {
        const payload = { ...session, recordar: !!remember };
        try {
            const checksum = computeChecksum(payload);
            if (remember) {
                localStorage.setItem(STORAGE_KEYS.currentSession, JSON.stringify(payload));
                localStorage.setItem(STORAGE_KEYS.currentSessionChecksum, checksum);
                sessionStorage.removeItem(STORAGE_KEYS.currentSession);
                sessionStorage.removeItem(STORAGE_KEYS.currentSessionChecksum);
            } else {
                sessionStorage.setItem(STORAGE_KEYS.currentSession, JSON.stringify(payload));
                sessionStorage.setItem(STORAGE_KEYS.currentSessionChecksum, checksum);
                localStorage.removeItem(STORAGE_KEYS.currentSession);
                localStorage.removeItem(STORAGE_KEYS.currentSessionChecksum);
            }
        } catch {}
    };

    const clearSession = () => {
        try { localStorage.removeItem(STORAGE_KEYS.currentSession); } catch {}
        try { localStorage.removeItem(STORAGE_KEYS.currentSessionChecksum); } catch {}
        try { sessionStorage.removeItem(STORAGE_KEYS.currentSession); } catch {}
        try { sessionStorage.removeItem(STORAGE_KEYS.currentSessionChecksum); } catch {}
    };

    const getUsers = () => {
        const users = readJSON(STORAGE_KEYS.users, []);
        const stored = localStorage.getItem(STORAGE_KEYS.usersChecksum);
        const valid = computeChecksum(users) === stored || stored === null;
        if (!valid) {
            console.warn('Integridad de usuarios no verificada. Reiniciando lista.');
            writeJSON(STORAGE_KEYS.users, []);
            try { localStorage.removeItem(STORAGE_KEYS.usersChecksum); } catch {}
            return [];
        }
        return users;
    };
    const setUsers = (users) => {
        writeJSON(STORAGE_KEYS.users, users);
        try { localStorage.setItem(STORAGE_KEYS.usersChecksum, computeChecksum(users)); } catch {}
    };

    const getFailed = () => readJSON(STORAGE_KEYS.failedAttempts, {});
    const setFailed = (obj) => writeJSON(STORAGE_KEYS.failedAttempts, obj);

    const setRegisterThrottle = (entry) => writeJSON(STORAGE_KEYS.registerThrottle, entry);
    const getRegisterThrottle = () => readJSON(STORAGE_KEYS.registerThrottle, { count: 0, windowStart: 0 });

    // --- Validaciones ---
    const isValidEmail = (email) => /^(?:[a-zA-Z0-9_'^&\/+{}\-]+(?:\.[a-zA-Z0-9_'^&\/+{}\-]+)*)@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/.test(email);

    const isValidName = (name) => name.split(' ').filter(Boolean).length >= 2;

    const isValidPhoneCL = (phone) => /^\+56\s?9\d{8}$/.test(phone) || /^\+56\s?[2-9]\d{7,8}$/.test(phone);

    const passwordChecks = (pwd) => {
        const checks = {
            length: pwd.length >= SECURITY.passwordMinLength,
            upper: /[A-Z]/.test(pwd),
            digit: /\d/.test(pwd)
        };
        const passed = Object.values(checks).filter(Boolean).length;
        const score = Math.round((passed / 3) * 100);
        return { checks, score };
    };

    // --- UI helpers ---
    const qs = (sel, root = document) => root.querySelector(sel);
    const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

    const showAlert = (container, message, type = 'info') => {
        if (!container) return;
        container.innerHTML = `<div class="alert alert-${type}" role="status">${sanitize(message)}</div>`;
    };

    const setLoading = (button, loading) => {
        if (!button) return;
        if (loading) {
            button.dataset.originalText = button.textContent;
            button.disabled = true;
            button.textContent = 'Procesando...';
        } else {
            button.disabled = false;
            if (button.dataset.originalText) button.textContent = button.dataset.originalText;
        }
    };

    // --- Navbar dinámica ---
    const updateNavbarAuth = () => {
        const session = readSession();
        const loginLink = qs('#user-login-link');
        const userProfile = qs('#user-profile');
        const userName = qs('#user-name');
        
        if (!loginLink || !userProfile || !userName) {
            return;
        }
        
        if (session && session.expiresAt && session.expiresAt > now()) {
            // Ocultar enlace de login y mostrar perfil de usuario
            loginLink.style.display = 'none';
            userProfile.style.display = 'flex';
            
            // Obtener datos del usuario
            const users = getUsers();
            const user = users.find(u => u.id === session.userId);
            
            if (user && user.nombre) {
                // Formatear nombre: Primer Nombre + Apellido Paterno
                const fullName = user.nombre || '';
                const nameParts = fullName.trim().split(' ');
                let displayName = '';
                
                if (nameParts.length >= 3) {
                    // Tomar primer nombre y apellido paterno (tercer elemento)
                    displayName = `${nameParts[0]} ${nameParts[2]}`;
                } else if (nameParts.length === 2) {
                    // Si solo hay 2 palabras, usar ambas
                    displayName = `${nameParts[0]} ${nameParts[1]}`;
                } else if (nameParts.length === 1) {
                    // Si solo hay un nombre, usarlo completo
                    displayName = nameParts[0];
                } else {
                    // Fallback si no hay nombre
                    displayName = 'Usuario';
                }
                
                userName.textContent = displayName;
            } else {
                userName.textContent = 'Usuario';
            }
        } else {
            // Mostrar enlace de login y ocultar perfil de usuario
            loginLink.style.display = 'block';
            userProfile.style.display = 'none';
        }
    };

    // --- Gestión de intentos y rate limit ---
    const isLoginBlocked = (email) => {
        const failed = getFailed();
        const rec = failed[email];
        if (!rec) return false;
        if (rec.blockedUntil && rec.blockedUntil > now()) return true;
        return false;
    };

    const registerFailedAttempt = (email) => {
        const failed = getFailed();
        const rec = failed[email] || { count: 0, lastAttempt: 0, blockedUntil: 0 };
        const t = now();
        rec.count = (rec.lastAttempt && t - rec.lastAttempt > SECURITY.loginBlockMs) ? 1 : rec.count + 1;
        rec.lastAttempt = t;
        if (rec.count >= SECURITY.loginMaxAttempts) {
            rec.blockedUntil = t + SECURITY.loginBlockMs;
        }
        failed[email] = rec;
        setFailed(failed);
    };

    const clearFailedAttempts = (email) => {
        const failed = getFailed();
        if (failed[email]) delete failed[email];
        setFailed(failed);
    };

    const throttleRegister = () => {
        const t = now();
        const entry = getRegisterThrottle();
        if (!entry.windowStart || t - entry.windowStart > SECURITY.registerRateWindowMs) {
            setRegisterThrottle({ windowStart: t, count: 1 });
            return { allowed: true };
        }
        if (entry.count >= SECURITY.registerRateMax) return { allowed: false, retryIn: (entry.windowStart + SECURITY.registerRateWindowMs) - t };
        setRegisterThrottle({ windowStart: entry.windowStart, count: entry.count + 1 });
        return { allowed: true };
    };

    // --- Sesión / Auto-logout ---
    const startActivityWatcher = () => {
        const updateActivity = () => {
            const s = readSession();
            if (!s) return;
            const expiresAt = now() + SECURITY.sessionInactivityMs;
            writeSession({ ...s, expiresAt }, s.recordar);
        };
        ['click', 'keydown', 'mousemove', 'scroll', 'touchstart'].forEach(evt => {
            window.addEventListener(evt, updateActivity, { passive: true });
        });
        // Chequeo periódico para auto-logout
        setInterval(() => {
            const s = readSession();
            if (s && s.expiresAt && s.expiresAt <= now()) {
                logout(true);
            }
        }, 15000);
    };

    // --- API principal ---
    const register = async (payload) => {
        const throttle = throttleRegister();
        if (!throttle.allowed) {
            return { ok: false, error: `Demasiados registros seguidos. Intenta en ${Math.ceil(throttle.retryIn / 1000)}s.` };
        }

        const nombre = trimAndNormalize(payload.nombre);
        const email = trimAndNormalize(payload.email).toLowerCase();
        const password = payload.password || '';
        const confirmar = payload.confirmar || '';
        const direccion = trimAndNormalize(payload.direccion || '');
        const telefono = trimAndNormalize(payload.telefono || '');
        const aceptaTyC = !!payload.aceptaTyC;
        const newsletter = !!payload.newsletter;

        if (!isValidName(nombre)) return { ok: false, error: 'Ingresa tu nombre completo (mínimo 2 palabras).' };
        if (!isValidEmail(email)) return { ok: false, error: 'Correo electrónico no válido.' };
        const pw = passwordChecks(password);
        if (pw.score < 100) return { ok: false, error: 'La contraseña no cumple todos los requisitos.' };
        if (password !== confirmar) return { ok: false, error: 'Las contraseñas no coinciden.' };
        if (telefono && !isValidPhoneCL(telefono)) return { ok: false, error: 'Número de contacto chileno inválido (+56 ...).' };
        if (!aceptaTyC) return { ok: false, error: 'Debes aceptar los términos y condiciones.' };

        const users = getUsers();
        if (users.some(u => u.email === email)) {
            return { ok: false, error: 'El email ya está registrado.' };
        }

        const encrypted = encryptPassword(password);
        const user = {
            id: uuid(),
            nombre: sanitize(nombre),
            email: sanitize(email),
            password: encrypted,
            direccion: sanitize(direccion),
            telefono: sanitize(telefono),
            fechaRegistro: now(),
            ultimoLogin: null,
            activo: true,
            newsletter
        };
        users.push(user);
        setUsers(users);
        return { ok: true, user };
    };

    const login = async ({ email, password, recordar }) => {
        const normalized = trimAndNormalize(email).toLowerCase();
        if (isLoginBlocked(normalized)) {
            const failed = getFailed()[normalized];
            const wait = Math.max(0, Math.ceil((failed.blockedUntil - now()) / 1000));
            return { ok: false, error: `Demasiados intentos fallidos. Espera ${wait}s.` };
        }

        const users = getUsers();
        const user = users.find(u => u.email === normalized && u.activo);
        if (!user || !comparePassword(password, user.password)) {
            registerFailedAttempt(normalized);
            return { ok: false, error: 'Credenciales inválidas.' };
        }

        clearFailedAttempts(normalized);
        user.ultimoLogin = now();
        setUsers(users);

        const token = generateSessionToken();
        const session = {
            userId: user.id,
            token,
            loginTime: now(),
            recordar: !!recordar,
            expiresAt: now() + SECURITY.sessionInactivityMs
        };
        writeSession(session, recordar);
        return { ok: true, user, session };
    };

    const logout = (redirect = false) => {
        clearSession();
        updateNavbarAuth();
        if (redirect) window.location.href = 'index.html';
    };

    // --- Recuperación de contraseña (simulada) ---
    const requestPasswordReset = (email) => {
        const normalized = trimAndNormalize(email).toLowerCase();
        if (!isValidEmail(normalized)) return { ok: false, error: 'Correo inválido.' };
        const users = getUsers();
        const user = users.find(u => u.email === normalized);
        if (!user) return { ok: false, error: 'Si el correo existe, enviaremos instrucciones.' };
        const token = generateSessionToken();
        const tokenKey = `reset_${normalized}`;
        writeJSON(tokenKey, { token, createdAt: now(), expiresAt: now() + 15 * 60 * 1000 }); // 15 min
        return { ok: true, token };
    };

    const resetPasswordWithToken = ({ email, token, newPassword }) => {
        const normalized = trimAndNormalize(email).toLowerCase();
        const tokenKey = `reset_${normalized}`;
        const entry = readJSON(tokenKey, null);
        if (!entry || entry.token !== token || entry.expiresAt < now()) return { ok: false, error: 'Token inválido o expirado.' };
        const pw = passwordChecks(newPassword);
        if (pw.score < 100) return { ok: false, error: 'La nueva contraseña no cumple requisitos.' };
        const users = getUsers();
        const idx = users.findIndex(u => u.email === normalized);
        if (idx === -1) return { ok: false, error: 'Usuario no encontrado.' };
        users[idx].password = encryptPassword(newPassword);
        setUsers(users);
        try { localStorage.removeItem(tokenKey); } catch {}
        return { ok: true };
    };

    // --- Protección de acciones (checkout requiere sesión y dirección) ---
    const protectActions = () => {
        qsa('.checkout-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const s = readSession();
                if (!s || !s.expiresAt || s.expiresAt <= now()) {
                    e.preventDefault();
                    alert('Debes iniciar sesión para finalizar la compra.');
                    window.location.href = 'login.html';
                    return;
                }
                const users = getUsers();
                const user = users.find(u => u.id === s.userId);
                if (!user || !user.direccion) {
                    e.preventDefault();
                    alert('Agrega una dirección de entrega en Mi Cuenta antes de comprar.');
                    window.location.href = 'mi-cuenta.html';
                }
            });
        });
    };

    // --- Utilidades de cuenta ---
    const getCurrentUser = () => {
        const s = readSession();
        if (!s) return null;
        const users = getUsers();
        return users.find(u => u.id === s.userId) || null;
    };

    const updateCurrentUser = (updates) => {
        const s = readSession();
        if (!s) return { ok: false, error: 'Sin sesión activa.' };
        const users = getUsers();
        const idx = users.findIndex(u => u.id === s.userId);
        if (idx === -1) return { ok: false, error: 'Usuario no encontrado.' };
        const next = { ...users[idx] };
        if (typeof updates.nombre === 'string') {
            if (!isValidName(trimAndNormalize(updates.nombre))) return { ok: false, error: 'Nombre inválido.' };
            next.nombre = sanitize(trimAndNormalize(updates.nombre));
        }
        if (typeof updates.direccion === 'string') {
            next.direccion = sanitize(trimAndNormalize(updates.direccion));
        }
        if (typeof updates.telefono === 'string') {
            const t = trimAndNormalize(updates.telefono);
            if (t && !isValidPhoneCL(t)) return { ok: false, error: 'Teléfono chileno inválido.' };
            next.telefono = sanitize(t);
        }
        if (typeof updates.newsletter === 'boolean') {
            next.newsletter = updates.newsletter;
        }
        users[idx] = next;
        setUsers(users);
        return { ok: true, user: next };
    };

    const enforceAuthForAccountPage = () => {
        if (window.location.pathname.endsWith('mi-cuenta.html')) {
            const s = readSession();
            if (!s || !s.expiresAt || s.expiresAt <= now()) {
                window.location.href = 'login.html';
            }
        }
    };

    const setupAccountPage = () => {
        if (!window.location.pathname.endsWith('mi-cuenta.html')) return;
        const user = getCurrentUser();
        if (!user) return;
        const nameEl = qs('#account-name');
        const emailEl = qs('#account-email');
        const lastLoginEl = qs('#account-last-login');
        if (nameEl) nameEl.textContent = user.nombre;
        if (emailEl) emailEl.textContent = user.email;
        if (lastLoginEl) lastLoginEl.textContent = user.ultimoLogin ? new Date(user.ultimoLogin).toLocaleString('es-CL') : '—';

        // Rellenar formulario
        const form = qs('#profile-form');
        if (!form) return;
        const inputName = qs('#profile-name');
        const inputAddress = qs('#profile-address');
        const inputPhone = qs('#profile-phone');
        const inputNews = qs('#profile-newsletter');
        const feedback = qs('#profile-feedback');
        if (inputName) inputName.value = user.nombre || '';
        if (inputAddress) inputAddress.value = user.direccion || '';
        if (inputPhone) inputPhone.value = user.telefono || '';
        if (inputNews) inputNews.checked = !!user.newsletter;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const res = updateCurrentUser({
                nombre: inputName ? inputName.value : undefined,
                direccion: inputAddress ? inputAddress.value : undefined,
                telefono: inputPhone ? inputPhone.value : undefined,
                newsletter: inputNews ? !!inputNews.checked : undefined
            });
            if (!res.ok) {
                showAlert(feedback, res.error, 'warning');
                return;
            }
            showAlert(feedback, 'Perfil actualizado correctamente.', 'success');
            updateNavbarAuth();
        });
    };

    // --- Enlaces con formularios ---
    const setupRegisterForm = () => {
        const form = qs('form[data-auth="register"]') || qs('main form') && window.location.pathname.endsWith('registro.html') ? qs('main form') : null;
        if (!form) return;
        form.setAttribute('data-auth', 'register');
        const nameInput = qs('#name');
        const emailInput = qs('#email');
        const passInput = qs('#password');
        const confirmInput = qs('#confirm-password');
        const addressInput = qs('#address');
        const phoneInput = qs('#phone');
        const termsInput = qs('#terms');
        const newsletterInput = qs('#newsletter');
        const feedback = document.createElement('div');
        feedback.id = 'register-feedback';
        form.appendChild(feedback);

        // Medidor de fortaleza
        let meter = qs('#password-strength');
        if (!meter) {
            meter = document.createElement('div');
            meter.id = 'password-strength';
            meter.innerHTML = '<div class="strength-bar"><span></span></div><small class="strength-text">Fortaleza: —</small>';
            passInput && passInput.parentElement && passInput.parentElement.appendChild(meter);
        }

        const updateStrength = () => {
            const { score, checks } = passwordChecks(passInput.value);
            const span = meter.querySelector('.strength-bar span');
            const text = meter.querySelector('.strength-text');
            span.style.width = `${score}%`;
            let label = 'Débil', type = 'weak';
            if (score >= 100) { label = 'Fuerte'; type = 'strong'; }
            else if (score >= 60) { label = 'Media'; type = 'medium'; }
            meter.className = `strength-${type}`;
            text.textContent = `Fortaleza: ${label}`;
        };

        passInput && passInput.addEventListener('input', updateStrength);

        // Eliminar tooltips nativos del navegador
        const passwordInputs = form.querySelectorAll('input[type="password"], input[type="text"]');
        passwordInputs.forEach(input => {
            // Eliminar atributos que generan tooltips nativos
            input.removeAttribute('title');
            input.removeAttribute('pattern');
            input.setAttribute('novalidate', 'true');
            
            // Desactivar validación nativa
            input.addEventListener('invalid', (e) => {
                e.preventDefault();
            });
        });

        // Funcionalidad de mostrar/ocultar contraseña
        const passwordToggles = form.querySelectorAll('.password-toggle');
        passwordToggles.forEach(toggle => {
            toggle.addEventListener('click', () => {
                const targetId = toggle.getAttribute('data-target');
                const input = form.querySelector(`#${targetId}`);
                
                if (input.type === 'password') {
                    input.type = 'text';
                    toggle.classList.add('active');
                    toggle.setAttribute('aria-label', 'Ocultar contraseña');
                } else {
                    input.type = 'password';
                    toggle.classList.remove('active');
                    toggle.setAttribute('aria-label', 'Mostrar contraseña');
                }
            });
        });

        const button = form.querySelector('button[type="submit"]');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            setLoading(button, true);
            const result = await register({
                nombre: nameInput ? nameInput.value : '',
                email: emailInput ? emailInput.value : '',
                password: passInput ? passInput.value : '',
                confirmar: confirmInput ? confirmInput.value : '',
                direccion: addressInput ? addressInput.value : '',
                telefono: phoneInput ? phoneInput.value : '',
                aceptaTyC: termsInput ? termsInput.checked : false,
                newsletter: newsletterInput ? newsletterInput.checked : false
            });
            if (!result.ok) {
                showAlert(feedback, result.error, 'warning');
                setLoading(button, false);
                return;
            }
            showAlert(feedback, 'Registro exitoso. Redirigiendo...', 'success');
            
            // Guardar el email en sessionStorage para autocompletar en login
            if (emailInput && emailInput.value) {
                sessionStorage.setItem('registeredEmail', emailInput.value);
            }
            
            setTimeout(() => { window.location.href = 'login.html'; }, 1200);
        });
    };

    const setupLoginForm = () => {
        const form = qs('form[data-auth="login"]') || qs('main form') && window.location.pathname.endsWith('login.html') ? qs('main form') : null;
        if (!form) return;
        form.setAttribute('data-auth', 'login');
        const emailInput = qs('#email');
        const passInput = qs('#password');
        const rememberInput = qs('#remember');
        const feedback = document.createElement('div');
        feedback.id = 'login-feedback';
        form.appendChild(feedback);
        const button = form.querySelector('button[type="submit"]');

        // Autocompletar email si viene del registro
        const registeredEmail = sessionStorage.getItem('registeredEmail');
        if (registeredEmail && emailInput) {
            emailInput.value = registeredEmail;
            // Agregar indicador visual de que el email fue autocompletado
            emailInput.style.backgroundColor = '#f0f9ff';
            emailInput.style.borderColor = '#2E8B57';
            
            // Enfocar el campo de contraseña para mejor UX
            if (passInput) {
                passInput.focus();
            }
            
            // Mostrar mensaje informativo
            const infoMessage = document.createElement('div');
            infoMessage.style.cssText = 'color: #2E8B57; font-size: 0.9rem; margin-top: 0.5rem; font-style: italic;';
            infoMessage.textContent = '✓ Email autocompletado desde el registro';
            emailInput.parentNode.appendChild(infoMessage);
            
            // Remover el indicador después de 3 segundos
            setTimeout(() => {
                emailInput.style.backgroundColor = '';
                emailInput.style.borderColor = '';
                if (infoMessage.parentNode) {
                    infoMessage.parentNode.removeChild(infoMessage);
                }
            }, 3000);
        }

        // Funcionalidad de mostrar/ocultar contraseña
        const passwordToggles = form.querySelectorAll('.password-toggle');
        passwordToggles.forEach(toggle => {
            toggle.addEventListener('click', () => {
                const targetId = toggle.getAttribute('data-target');
                const input = form.querySelector(`#${targetId}`);
                
                if (input.type === 'password') {
                    input.type = 'text';
                    toggle.classList.add('active');
                    toggle.setAttribute('aria-label', 'Ocultar contraseña');
                } else {
                    input.type = 'password';
                    toggle.classList.remove('active');
                    toggle.setAttribute('aria-label', 'Mostrar contraseña');
                }
            });
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            setLoading(button, true);
            const result = await login({ email: emailInput ? emailInput.value : '', password: passInput ? passInput.value : '', recordar: rememberInput ? !!rememberInput.checked : false });
            if (!result.ok) {
                showAlert(feedback, result.error, 'warning');
                setLoading(button, false);
                return;
            }
            showAlert(feedback, '¡Bienvenido! Redirigiendo...', 'success');
            
            // Limpiar el email del sessionStorage después del login exitoso
            sessionStorage.removeItem('registeredEmail');
            
            updateNavbarAuth();
            setTimeout(() => { window.location.href = 'productos.html'; }, 800);
        });
    };

    const setupRecoveryRequestForm = () => {
        const form = qs('form[data-auth="recover"]');
        if (!form) return;
        const emailInput = qs('#recover-email');
        const feedback = qs('#recover-feedback') || document.createElement('div');
        feedback.id = 'recover-feedback';
        if (!feedback.parentElement) form.appendChild(feedback);
        const button = form.querySelector('button[type="submit"]');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            setLoading(button, true);
            const res = requestPasswordReset(emailInput ? emailInput.value : '');
            if (!res.ok) {
                showAlert(feedback, res.error, 'warning');
                setLoading(button, false);
                return;
            }
            showAlert(feedback, 'Hemos simulado el envío de un correo con tu token. Copia el token generado en consola y continúa.', 'success');
            console.info('Token de recuperación (simulado):', res.token);
            setLoading(button, false);
        });
    };

    const setupResetForm = () => {
        const form = qs('form[data-auth="reset"]');
        if (!form) return;
        const emailInput = qs('#reset-email');
        const tokenInput = qs('#reset-token');
        const passInput = qs('#new-password');
        const confirmInput = qs('#new-password-confirm');
        const feedback = qs('#reset-feedback') || document.createElement('div');
        feedback.id = 'reset-feedback';
        if (!feedback.parentElement) form.appendChild(feedback);
        const button = form.querySelector('button[type="submit"]');

        // Fortalecer visual
        passInput && passInput.addEventListener('input', () => {
            const { score } = passwordChecks(passInput.value);
            form.dataset.strength = String(score);
        });

        // Eliminar tooltips nativos del navegador
        const passwordInputs = form.querySelectorAll('input[type="password"], input[type="text"]');
        passwordInputs.forEach(input => {
            // Eliminar atributos que generan tooltips nativos
            input.removeAttribute('title');
            input.removeAttribute('pattern');
            input.setAttribute('novalidate', 'true');
            
            // Desactivar validación nativa
            input.addEventListener('invalid', (e) => {
                e.preventDefault();
            });
        });

        // Funcionalidad de mostrar/ocultar contraseña
        const passwordToggles = form.querySelectorAll('.password-toggle');
        passwordToggles.forEach(toggle => {
            toggle.addEventListener('click', () => {
                const targetId = toggle.getAttribute('data-target');
                const input = form.querySelector(`#${targetId}`);
                
                if (input.type === 'password') {
                    input.type = 'text';
                    toggle.classList.add('active');
                    toggle.setAttribute('aria-label', 'Ocultar contraseña');
                } else {
                    input.type = 'password';
                    toggle.classList.remove('active');
                    toggle.setAttribute('aria-label', 'Mostrar contraseña');
                }
            });
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (passInput && confirmInput && passInput.value !== confirmInput.value) {
                showAlert(feedback, 'Las contraseñas no coinciden.', 'warning');
                return;
            }
            setLoading(button, true);
            const res = resetPasswordWithToken({
                email: emailInput ? emailInput.value : '',
                token: tokenInput ? tokenInput.value : '',
                newPassword: passInput ? passInput.value : ''
            });
            if (!res.ok) {
                showAlert(feedback, res.error, 'warning');
                setLoading(button, false);
                return;
            }
            showAlert(feedback, 'Contraseña actualizada. Inicia sesión.', 'success');
            setTimeout(() => { window.location.href = 'login.html'; }, 1000);
        });
    };

    // --- Arranque ---
    document.addEventListener('DOMContentLoaded', () => {
        updateNavbarAuth();
        protectActions();
        enforceAuthForAccountPage();
        setupRegisterForm();
        setupLoginForm();
        setupRecoveryRequestForm();
        setupResetForm();
        setupAccountPage();
        startActivityWatcher();

        // Enlazar botón de logout si existiera en alguna página
        const logoutBtn = qs('#logout-btn');
        if (logoutBtn) logoutBtn.addEventListener('click', (e) => { e.preventDefault(); logout(true); });
    });

    // Exponer mínimamente para consola/debug educativo
    window.HuertoAuth = {
        register,
        login,
        logout,
        requestPasswordReset,
        resetPasswordWithToken,
        getCurrentUser,
        updateCurrentUser,
        _debug: { getUsers, setUsers, readSession }
    };
})();


