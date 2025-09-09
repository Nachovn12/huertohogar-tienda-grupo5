/* ===== CHECKOUT SYSTEM - VERSIÓN SIMPLIFICADA ===== */
(function() {
    'use strict';

    let currentStep = 1;
    let orderData = {
        customer: {},
        delivery: {},
        payment: {},
        products: [],
        totals: { subtotal: 0, discount: 0, shipping: 0, total: 0 }
    };

    // Función principal de inicialización
    function init() {
        console.log('🚀 Iniciando checkout...');
        
        // Esperar a que el DOM esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', startCheckout);
        } else {
            startCheckout();
        }
    }

    function startCheckout() {
        console.log('📋 Configurando checkout...');
        
        // Configurar botones con múltiples métodos
        setupButtons();
        
        // Cargar datos del carrito
        loadCartData();
        
        // Cargar datos del usuario si está logueado
        loadUserData();
        
        // Cargar datos guardados del checkout
        loadSavedCheckoutData();
        
        // Configurar otros elementos
        setupDeliveryOptions();
        setupPaymentOptions();
        setupDatePicker();
        
        console.log('✅ Checkout configurado correctamente');
    }

    function setupButtons() {
        console.log('🔘 Configurando botones...');
        
        // Método 1: Event listeners directos
        const nextBtn = document.getElementById('next-step');
        const prevBtn = document.getElementById('prev-step');
        const placeOrderBtn = document.getElementById('place-order');
        
        if (nextBtn) {
            nextBtn.onclick = function(e) {
                e.preventDefault();
                console.log('➡️ Botón siguiente clickeado');
                nextStep();
            };
            console.log('✅ Botón siguiente configurado');
        } else {
            console.log('❌ Botón siguiente no encontrado');
        }
        
        if (prevBtn) {
            prevBtn.onclick = function(e) {
                e.preventDefault();
                console.log('⬅️ Botón anterior clickeado');
                prevStep();
            };
        }
        
        if (placeOrderBtn) {
            placeOrderBtn.onclick = function(e) {
                e.preventDefault();
                console.log('✅ Botón finalizar clickeado');
                placeOrder();
            };
        }

        // Método 2: Event delegation como fallback
        document.addEventListener('click', function(e) {
            if (e.target.id === 'next-step') {
                e.preventDefault();
                console.log('➡️ Botón siguiente (delegation)');
                nextStep();
            } else if (e.target.id === 'prev-step') {
                e.preventDefault();
                console.log('⬅️ Botón anterior (delegation)');
                prevStep();
            } else if (e.target.id === 'place-order') {
                e.preventDefault();
                console.log('✅ Botón finalizar (delegation)');
                placeOrder();
            }
        });
    }

    function nextStep() {
        console.log('🔄 Avanzando al siguiente paso...');
        console.log('Paso actual:', currentStep);
        
        if (validateCurrentStep()) {
            if (currentStep < 4) {
                currentStep++;
                console.log('Nuevo paso:', currentStep);
                showStep(currentStep);
                updateProgress();
                updateNavigationButtons();
                saveCurrentStepData();
            }
        } else {
            console.log('❌ Validación falló');
        }
    }

    function prevStep() {
        console.log('🔄 Retrocediendo al paso anterior...');
        if (currentStep > 1) {
            currentStep--;
            console.log('Nuevo paso:', currentStep);
            showStep(currentStep);
            updateProgress();
            updateNavigationButtons();
        }
    }

    function showStep(stepNumber) {
        console.log('👁️ Mostrando paso:', stepNumber);
        const steps = document.querySelectorAll('.checkout-step');
        steps.forEach((step, index) => {
            step.classList.toggle('active', index + 1 === stepNumber);
        });
        
        // Si es el paso de confirmación, cargar los datos
        if (stepNumber === 4) {
            loadConfirmationData();
        }
    }

    function updateProgress() {
        const progressSteps = document.querySelectorAll('.progress-steps .step');
        progressSteps.forEach((step, index) => {
            const stepNumber = index + 1;
            step.classList.remove('active', 'completed');
            
            if (stepNumber < currentStep) {
                step.classList.add('completed');
            } else if (stepNumber === currentStep) {
                step.classList.add('active');
            }
        });
    }

    function updateNavigationButtons() {
        const prevBtn = document.getElementById('prev-step');
        const nextBtn = document.getElementById('next-step');
        const placeOrderBtn = document.getElementById('place-order');
        
        if (prevBtn) {
            prevBtn.style.display = currentStep > 1 ? 'block' : 'none';
        }
        
        if (currentStep === 4) {
            if (nextBtn) nextBtn.style.display = 'none';
            if (placeOrderBtn) placeOrderBtn.style.display = 'block';
        } else {
            if (nextBtn) nextBtn.style.display = 'block';
            if (placeOrderBtn) placeOrderBtn.style.display = 'none';
        }
    }

    function validateCurrentStep() {
        console.log('🔍 Validando paso:', currentStep);
        
        switch (currentStep) {
            case 1:
                return validateCustomerInfo();
            case 2:
                return validateDeliveryInfo();
            case 3:
                return validatePaymentInfo();
            case 4:
                return validateConfirmation();
            default:
                return true;
        }
    }

    function validateCustomerInfo() {
        console.log('👤 Validando información del cliente...');
        
        // Verificar si el usuario está logueado
        const session = getCurrentSession();
        const isLoggedIn = session && session.expiresAt && session.expiresAt > Date.now();
        
        console.log('Estado del usuario:', isLoggedIn ? 'logueado' : 'invitado');
        
        // Campos requeridos según el tipo de usuario
        const requiredFields = isLoggedIn 
            ? ['phone', 'address', 'city'] // Para usuarios logueados, solo estos campos son obligatorios
            : ['firstName', 'lastName', 'email', 'phone', 'address', 'city']; // Para invitados, todos los campos
        
        let isValid = true;

        // Limpiar errores previos
        ['firstName', 'lastName', 'email', 'phone', 'address', 'city'].forEach(fieldName => {
            const field = document.getElementById(fieldName);
            if (field) clearFieldError(field);
        });

        // Validar campos requeridos
        requiredFields.forEach(fieldName => {
            const field = document.getElementById(fieldName);
            if (!field || !field.value.trim()) {
                console.log('❌ Campo vacío:', fieldName);
                showFieldError(field, 'Este campo es obligatorio');
                isValid = false;
            }
        });

        // Validar email solo si está presente
        const email = document.getElementById('email');
        if (email && email.value && !isValidEmail(email.value)) {
            showFieldError(email, 'Ingresa un email válido');
            isValid = false;
        }

        // Validar teléfono solo si está presente
        const phone = document.getElementById('phone');
        if (phone && phone.value && !isValidPhone(phone.value)) {
            showFieldError(phone, 'Ingresa un teléfono válido');
            isValid = false;
        }

        if (!isValid) {
            const message = isLoggedIn 
                ? 'Por favor, completa los campos de entrega obligatorios'
                : 'Por favor, completa todos los campos obligatorios';
            showNotification(message, 'error');
        }

        console.log('✅ Validación cliente:', isValid ? 'exitosa' : 'falló');
        return isValid;
    }

    function validateDeliveryInfo() {
        console.log('🚚 Validando información de entrega...');
        const deliveryMethod = document.querySelector('input[name="delivery"]:checked');
        if (!deliveryMethod) {
            showNotification('Selecciona un método de entrega', 'error');
            return false;
        }
        return true;
    }

    function validatePaymentInfo() {
        console.log('💳 Validando información de pago...');
        const paymentMethod = document.querySelector('input[name="payment"]:checked');
        if (!paymentMethod) {
            showNotification('Selecciona un método de pago', 'error');
            return false;
        }
        return true;
    }

    function validateConfirmation() {
        console.log('✅ Validando confirmación...');
        const acceptTerms = document.getElementById('accept-terms');
        if (!acceptTerms || !acceptTerms.checked) {
            showNotification('Debes aceptar los términos y condiciones', 'error');
            return false;
        }
        return true;
    }

    function loadCartData() {
        console.log('🛒 Cargando datos del carrito...');
        const cart = JSON.parse(localStorage.getItem('huertoHogarCart')) || [];
        orderData.products = cart;
        calculateTotals();
        updateSummary();
    }

    function loadUserData() {
        console.log('👤 Verificando datos del usuario...');
        
        // Verificar si hay una sesión activa
        const session = getCurrentSession();
        if (session && session.expiresAt && session.expiresAt > Date.now()) {
            console.log('✅ Usuario logueado, cargando datos...');
            markUserType('logged');
            loadLoggedUserData(session);
        } else {
            console.log('👤 Usuario invitado, campos requeridos');
            markUserType('guest');
            setupGuestMode();
        }
    }

    function markUserType(userType) {
        const checkoutStep = document.getElementById('step-1');
        if (checkoutStep) {
            checkoutStep.setAttribute('data-user-type', userType);
        }
    }

    function getCurrentSession() {
        try {
            // Intentar obtener sesión de sessionStorage primero
            const ss = sessionStorage.getItem('currentSession');
            if (ss) {
                const parsed = JSON.parse(ss);
                if (parsed.expiresAt && parsed.expiresAt > Date.now()) {
                    return parsed;
                }
            }
            
            // Fallback a localStorage
            const ls = localStorage.getItem('currentSession');
            if (ls) {
                const parsed = JSON.parse(ls);
                if (parsed.expiresAt && parsed.expiresAt > Date.now()) {
                    return parsed;
                }
            }
        } catch (error) {
            console.log('Error al obtener sesión:', error);
        }
        return null;
    }

    function loadLoggedUserData(session) {
        try {
            // Obtener datos del usuario desde localStorage
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const user = users.find(u => u.id === session.userId);
            
            if (user) {
                console.log('📝 Cargando datos del usuario:', user.displayName || user.nombre);
                
                // Separar nombre completo en nombre y apellido
                const nameParts = user.nombre ? user.nombre.split(' ').filter(part => part.length > 0) : [];
                
                // Llenar campos automáticamente
                const firstNameField = document.getElementById('first-name');
                const lastNameField = document.getElementById('last-name');
                const emailField = document.getElementById('email');
                
                if (firstNameField && nameParts.length > 0) {
                    firstNameField.value = nameParts[0];
                }
                
                if (lastNameField && nameParts.length > 1) {
                    lastNameField.value = nameParts.slice(1).join(' ');
                }
                
                if (emailField) {
                    emailField.value = user.email || '';
                }
                
                // Marcar campos como pre-llenados
                markFieldsAsPrefilled([firstNameField, lastNameField, emailField]);
                
                // Guardar datos en orderData
                orderData.customer = {
                    firstName: nameParts[0] || '',
                    lastName: nameParts.slice(1).join(' ') || '',
                    email: user.email || '',
                    phone: user.telefono || '',
                    address: user.direccion || '',
                    city: '', // El usuario puede completar esto
                    postalCode: '',
                    notes: ''
                };
                
                console.log('✅ Datos del usuario cargados correctamente');
            }
        } catch (error) {
            console.error('Error al cargar datos del usuario:', error);
            setupGuestMode();
        }
    }

    function setupGuestMode() {
        console.log('👤 Configurando modo invitado...');
        
        // Los campos ya están configurados como requeridos en el HTML
        // No necesitamos hacer nada especial aquí
    }

    function markFieldsAsPrefilled(fields) {
        fields.forEach(field => {
            if (field && field.value) {
                field.style.backgroundColor = '#f0f9ff';
                field.style.borderColor = '#2E8B57';
                field.setAttribute('data-prefilled', 'true');
                
                // Agregar indicador visual
                const indicator = document.createElement('small');
                indicator.textContent = '✓ Pre-llenado desde tu cuenta';
                indicator.style.color = '#2E8B57';
                indicator.style.fontSize = '0.8rem';
                indicator.style.fontStyle = 'italic';
                
                if (field.parentNode) {
                    field.parentNode.appendChild(indicator);
                }
            }
        });
    }

    function loadSavedCheckoutData() {
        console.log('💾 Cargando datos guardados del checkout...');
        
        try {
            const savedData = localStorage.getItem('huertoHogarCheckoutData');
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                
                // Cargar datos del cliente
                if (parsedData.customer) {
                    orderData.customer = parsedData.customer;
                    console.log('✅ Datos del cliente cargados desde localStorage');
                }
                
                // Cargar datos de entrega
                if (parsedData.delivery) {
                    orderData.delivery = parsedData.delivery;
                    console.log('✅ Datos de entrega cargados desde localStorage');
                }
                
                // Cargar datos de pago
                if (parsedData.payment) {
                    orderData.payment = parsedData.payment;
                    console.log('✅ Datos de pago cargados desde localStorage');
                }
            }
        } catch (error) {
            console.log('Error al cargar datos guardados:', error);
        }
    }

    function saveCheckoutData() {
        console.log('💾 Guardando datos del checkout en localStorage...');
        
        try {
            const dataToSave = {
                customer: orderData.customer,
                delivery: orderData.delivery,
                payment: orderData.payment,
                timestamp: Date.now()
            };
            
            localStorage.setItem('huertoHogarCheckoutData', JSON.stringify(dataToSave));
            console.log('✅ Datos del checkout guardados');
        } catch (error) {
            console.log('Error al guardar datos:', error);
        }
    }

    function calculateTotals() {
        let subtotal = 0;
        orderData.products.forEach(item => {
            subtotal += item.price * item.quantity;
        });
        orderData.totals.subtotal = subtotal;
        orderData.totals.shipping = 3000; // Envío estándar
        orderData.totals.total = subtotal + orderData.totals.shipping;
    }

    function updateSummary() {
        const summaryItems = document.getElementById('summary-items');
        const subtotal = document.getElementById('subtotal');
        const shipping = document.getElementById('shipping');
        const total = document.getElementById('total');

        if (summaryItems) {
            summaryItems.innerHTML = orderData.products.map(item => `
                <div class="summary-item">
                    <div class="item-info">
                        <img src="${item.image}" alt="${item.name}" class="item-image">
                        <div class="item-details">
                            <h4>${item.name}</h4>
                            <p>Cantidad: ${item.quantity}</p>
                        </div>
                    </div>
                    <div class="item-price">$${formatPrice(item.price * item.quantity)}</div>
                </div>
            `).join('');
        }

        if (subtotal) subtotal.textContent = `$${formatPrice(orderData.totals.subtotal)}`;
        if (shipping) shipping.textContent = `$${formatPrice(orderData.totals.shipping)}`;
        if (total) total.textContent = `$${formatPrice(orderData.totals.total)}`;
    }

    function saveCurrentStepData() {
        console.log('💾 Guardando datos del paso:', currentStep);
        
        if (currentStep === 1) {
            // Guardar datos del cliente
            const firstName = document.getElementById('first-name')?.value || '';
            const lastName = document.getElementById('last-name')?.value || '';
            const email = document.getElementById('email')?.value || '';
            const phone = document.getElementById('phone')?.value || '';
            const address = document.getElementById('address')?.value || '';
            const city = document.getElementById('city')?.value || '';
            const postalCode = document.getElementById('postal-code')?.value || '';
            const notes = document.getElementById('notes')?.value || '';
            
            orderData.customer = {
                firstName,
                lastName,
                email,
                phone,
                address,
                city,
                postalCode,
                notes
            };
            
            console.log('💾 Datos del cliente guardados:', orderData.customer);
        } else if (currentStep === 2) {
            // Guardar datos de entrega
            const deliveryMethod = document.querySelector('input[name="delivery"]:checked');
            const deliveryDate = document.getElementById('delivery-date')?.value || '';
            const timeSlot = document.querySelector('input[name="timeSlot"]:checked');
            
            orderData.delivery = {
                method: deliveryMethod?.value || '',
                date: deliveryDate,
                timeSlot: timeSlot?.value || '',
                cost: deliveryMethod?.value === 'delivery' ? orderData.totals.shipping : 0
            };
            
            console.log('💾 Datos de entrega guardados:', orderData.delivery);
        } else if (currentStep === 3) {
            // Guardar datos de pago
            const paymentMethod = document.querySelector('input[name="payment"]:checked');
            const cardNumber = document.getElementById('card-number')?.value || '';
            const cardName = document.getElementById('card-name')?.value || '';
            const cardExpiry = document.getElementById('card-expiry')?.value || '';
            const cardCvv = document.getElementById('card-cvv')?.value || '';
            
            orderData.payment = {
                method: paymentMethod?.value || '',
                cardNumber: cardNumber,
                cardName: cardName,
                cardExpiry: cardExpiry,
                cardCvv: cardCvv
            };
            
            console.log('💾 Datos de pago guardados:', orderData.payment);
        }
        
        // Guardar datos en localStorage después de cada paso
        saveCheckoutData();
    }

    function placeOrder() {
        console.log('🎉 Finalizando pedido...');
        const orderNumber = 'HH' + Date.now().toString().slice(-6);
        
        // Limpiar datos del checkout después de completar el pedido
        localStorage.removeItem('huertoHogarCheckoutData');
        
        // Simular procesamiento
        showLoading(true);
        
        setTimeout(() => {
            showLoading(false);
            showOrderConfirmation(orderNumber);
            localStorage.removeItem('huertoHogarCart');
        }, 2000);
    }

    function showOrderConfirmation(orderNumber) {
        const modal = document.getElementById('order-confirmation-modal');
        const orderNumberSpan = document.getElementById('order-number');
        
        if (orderNumberSpan) orderNumberSpan.textContent = orderNumber;
        if (modal) modal.classList.remove('hidden');
    }

    function setupDeliveryOptions() {
        const deliveryOptions = document.querySelectorAll('.delivery-option');
        deliveryOptions.forEach(option => {
            option.addEventListener('click', () => {
                deliveryOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                const radio = option.querySelector('input[type="radio"]');
                if (radio) radio.checked = true;
            });
        });
    }

    function setupPaymentOptions() {
        const paymentOptions = document.querySelectorAll('.payment-option');
        paymentOptions.forEach(option => {
            option.addEventListener('click', () => {
                paymentOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                const radio = option.querySelector('input[type="radio"]');
                if (radio) radio.checked = true;
            });
        });
    }

    function setupDatePicker() {
        const dateInput = document.getElementById('delivery-date');
        if (dateInput) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            dateInput.min = tomorrow.toISOString().split('T')[0];
        }
    }

    function showFieldError(field, message) {
        if (!field) return;
        clearFieldError(field);
        field.style.borderColor = '#ef4444';
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        errorDiv.style.color = '#ef4444';
        errorDiv.style.fontSize = '0.8rem';
        errorDiv.style.marginTop = '0.25rem';
        
        field.parentNode.appendChild(errorDiv);
    }

    function clearFieldError(field) {
        if (!field) return;
        field.style.borderColor = '';
        const errorDiv = field.parentNode.querySelector('.field-error');
        if (errorDiv) errorDiv.remove();
    }

    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        `;
        
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        
        notification.style.backgroundColor = colors[type] || colors.info;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.style.transform = 'translateX(0)', 100);
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    function showLoading(show) {
        const existing = document.getElementById('loading-overlay');
        if (existing) existing.remove();
        
        if (show) {
            const loadingOverlay = document.createElement('div');
            loadingOverlay.id = 'loading-overlay';
            loadingOverlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                color: white;
                font-size: 1.2rem;
            `;
            loadingOverlay.innerHTML = `
                <div style="text-align: center;">
                    <div style="width: 50px; height: 50px; border: 4px solid #f3f3f3; border-top: 4px solid #2E8B57; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem;"></div>
                    <p>Procesando pedido...</p>
                </div>
            `;
            document.body.appendChild(loadingOverlay);
        }
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function isValidPhone(phone) {
        return /^\+56\s?9\d{8}$/.test(phone) || /^\+56\s?[2-9]\d{7,8}$/.test(phone);
    }

    function formatPrice(price) {
        return price.toLocaleString('es-CL');
    }

    // Inicializar
    init();

    // CSS para animación de loading
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);

    function loadConfirmationData() {
        console.log('📋 Cargando datos de confirmación...');
        
        // Cargar información del cliente
        loadCustomerSummary();
        
        // Cargar método de entrega
        loadDeliverySummary();
        
        // Cargar método de pago
        loadPaymentSummary();
        
        // Cargar productos
        loadProductsSummary();
        
        console.log('✅ Datos de confirmación cargados');
    }

    function loadCustomerSummary() {
        const customerSummary = document.getElementById('customer-summary');
        if (!customerSummary) return;
        
        const customer = orderData.customer || {};
        console.log('📋 Datos del cliente disponibles:', customer);
        
        let html = '<div class="confirmation-details">';
        
        // Mostrar nombre completo
        if (customer.firstName || customer.lastName) {
            const fullName = `${customer.firstName || ''} ${customer.lastName || ''}`.trim();
            html += `<p><strong>Nombre:</strong> ${fullName}</p>`;
        }
        
        // Mostrar email
        if (customer.email) {
            html += `<p><strong>Email:</strong> ${customer.email}</p>`;
        }
        
        // Mostrar teléfono
        if (customer.phone) {
            html += `<p><strong>Teléfono:</strong> ${customer.phone}</p>`;
        } else {
            html += `<p><strong>Teléfono:</strong> <span style="color: #6c757d; font-style: italic;">No proporcionado</span></p>`;
        }
        
        // Mostrar dirección
        if (customer.address) {
            html += `<p><strong>Dirección:</strong> ${customer.address}</p>`;
        } else {
            html += `<p><strong>Dirección:</strong> <span style="color: #6c757d; font-style: italic;">No proporcionada</span></p>`;
        }
        
        // Mostrar ciudad
        if (customer.city) {
            html += `<p><strong>Ciudad:</strong> ${customer.city}</p>`;
        } else {
            html += `<p><strong>Ciudad:</strong> <span style="color: #6c757d; font-style: italic;">No proporcionada</span></p>`;
        }
        
        // Mostrar código postal si existe
        if (customer.postalCode) {
            html += `<p><strong>Código Postal:</strong> ${customer.postalCode}</p>`;
        }
        
        // Mostrar notas si existen
        if (customer.notes) {
            html += `<p><strong>Notas:</strong> ${customer.notes}</p>`;
        }
        
        html += '</div>';
        
        customerSummary.innerHTML = html;
        console.log('✅ Resumen del cliente cargado');
    }

    function loadDeliverySummary() {
        const deliverySummary = document.getElementById('delivery-summary');
        if (!deliverySummary) return;
        
        const delivery = orderData.delivery || {};
        console.log('📋 Datos de entrega disponibles:', delivery);
        
        let html = '<div class="confirmation-details">';
        
        // Mostrar método de entrega
        if (delivery.method) {
            if (delivery.method === 'delivery') {
                html += '<p><strong>Método:</strong> Entrega a Domicilio</p>';
                html += `<p><strong>Costo:</strong> $${formatPrice(delivery.cost || orderData.totals.shipping)}</p>`;
                html += '<p><strong>Dirección de entrega:</strong> La dirección proporcionada en la información del cliente</p>';
            } else if (delivery.method === 'pickup') {
                html += '<p><strong>Método:</strong> Retiro en Tienda</p>';
                html += '<p><strong>Costo:</strong> Gratis</p>';
                html += '<p><strong>Dirección de la tienda:</strong> Av. Principal 123, Santiago</p>';
                html += '<p><strong>Horario de atención:</strong> Lunes a Sábado 9:00 - 19:00</p>';
            }
        } else {
            html += '<p><strong>Método:</strong> <span style="color: #6c757d; font-style: italic;">No seleccionado</span></p>';
        }
        
        // Mostrar fecha de entrega
        if (delivery.date) {
            const date = new Date(delivery.date);
            const formattedDate = date.toLocaleDateString('es-CL', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            html += `<p><strong>Fecha de entrega:</strong> ${formattedDate}</p>`;
        } else {
            html += '<p><strong>Fecha de entrega:</strong> <span style="color: #6c757d; font-style: italic;">No seleccionada</span></p>';
        }
        
        // Mostrar horario de entrega
        if (delivery.timeSlot) {
            const timeLabels = {
                'morning': 'Mañana (9:00 - 12:00)',
                'afternoon': 'Tarde (12:00 - 18:00)',
                'evening': 'Noche (18:00 - 20:00)'
            };
            html += `<p><strong>Horario de entrega:</strong> ${timeLabels[delivery.timeSlot] || delivery.timeSlot}</p>`;
        } else {
            html += '<p><strong>Horario de entrega:</strong> <span style="color: #6c757d; font-style: italic;">No seleccionado</span></p>';
        }
        
        // Mostrar información adicional
        if (delivery.method === 'delivery') {
            html += '<p><strong>Nota:</strong> El pedido será entregado en la dirección proporcionada</p>';
        } else if (delivery.method === 'pickup') {
            html += '<p><strong>Nota:</strong> Debe presentar identificación al retirar</p>';
        }
        
        html += '</div>';
        
        deliverySummary.innerHTML = html;
        console.log('✅ Resumen de entrega cargado');
    }

    function loadPaymentSummary() {
        const paymentSummary = document.getElementById('payment-summary');
        if (!paymentSummary) return;
        
        const payment = orderData.payment || {};
        
        let html = '<div class="confirmation-details">';
        
        if (payment.method) {
            if (payment.method === 'card') {
                html += '<p><strong>Método:</strong> Tarjeta de Crédito/Débito</p>';
                if (payment.cardNumber) {
                    const maskedNumber = '**** **** **** ' + payment.cardNumber.slice(-4);
                    html += `<p><strong>Tarjeta:</strong> ${maskedNumber}</p>`;
                }
                if (payment.cardName) {
                    html += `<p><strong>Nombre:</strong> ${payment.cardName}</p>`;
                }
            } else if (payment.method === 'transfer') {
                html += '<p><strong>Método:</strong> Transferencia Bancaria</p>';
                html += '<p><strong>Banco:</strong> Banco de Chile</p>';
                html += '<p><strong>Cuenta:</strong> 1234567890</p>';
            } else if (payment.method === 'cash') {
                html += '<p><strong>Método:</strong> Pago en Efectivo</p>';
                html += '<p><strong>Nota:</strong> Pago al recibir el pedido</p>';
            }
        }
        
        html += '</div>';
        
        paymentSummary.innerHTML = html;
        console.log('✅ Resumen de pago cargado:', payment);
    }

    function loadProductsSummary() {
        const productsSummary = document.getElementById('products-summary');
        if (!productsSummary) return;
        
        const products = orderData.products || [];
        console.log('📋 Productos disponibles:', products);
        
        if (products.length === 0) {
            productsSummary.innerHTML = '<div class="confirmation-details"><p style="color: #6c757d; font-style: italic;">No hay productos en el carrito</p></div>';
            return;
        }
        
        let html = '<div class="confirmation-products">';
        
        products.forEach((product, index) => {
            // Obtener imagen del producto (usar imagen por defecto si no existe)
            const productImage = product.image || 'assets/img/Logo Huerto Hogar.jpg';
            
            html += `
                <div class="product-item">
                    <div class="product-image">
                        <img src="${productImage}" alt="${product.name}" onerror="this.src='assets/img/Logo Huerto Hogar.jpg'">
                    </div>
                    <div class="product-info">
                        <h4>${product.name}</h4>
                        <div class="product-details">
                            <div class="detail-row">
                                <span class="detail-label">Cantidad:</span>
                                <span class="detail-value">${product.quantity}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Precio unitario:</span>
                                <span class="detail-value">$${formatPrice(product.price)}</span>
                            </div>
                            <div class="detail-row total-row">
                                <span class="detail-label">Subtotal:</span>
                                <span class="detail-value">$${formatPrice(product.price * product.quantity)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Agregar separador entre productos (excepto el último)
            if (index < products.length - 1) {
                html += '<div class="product-separator"></div>';
            }
        });
        
        // Agregar resumen total
        html += `
            <div class="products-total">
                <div class="total-summary">
                    <div class="total-line">
                        <span>Total de productos:</span>
                        <span>$${formatPrice(orderData.totals.subtotal)}</span>
                    </div>
                    <div class="total-line">
                        <span>Envío:</span>
                        <span>$${formatPrice(orderData.totals.shipping)}</span>
                    </div>
                    <div class="total-line final-total">
                        <span>Total final:</span>
                        <span>$${formatPrice(orderData.totals.total)}</span>
                    </div>
                </div>
            </div>
        `;
        
        html += '</div>';
        
        productsSummary.innerHTML = html;
        console.log('✅ Resumen de productos cargado');
    }

})();
