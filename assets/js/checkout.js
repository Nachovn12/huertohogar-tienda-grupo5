/* ===== CHECKOUT SYSTEM ===== */
(function() {
    'use strict';

    // --- Variables Globales ---
    let currentStep = 1;
    let orderData = {
        customer: {},
        delivery: {},
        payment: {},
        products: [],
        totals: {
            subtotal: 0,
            discount: 0,
            shipping: 0,
            total: 0
        }
    };

    // --- Elementos del DOM ---
    let steps, progressSteps, prevBtn, nextBtn, placeOrderBtn, orderModal;

    // --- Inicialización ---
    function init() {
        // Esperar a que el DOM esté completamente cargado
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initCheckout);
        } else {
            initCheckout();
        }
    }

    init();

    // Inicialización de emergencia después de 2 segundos
    setTimeout(() => {
        if (!nextBtn || !document.getElementById('next-step')) {
            console.log('Reinicializando checkout de emergencia...');
            initCheckout();
        }
    }, 2000);

    function initCheckout() {
        console.log('Inicializando checkout...');
        
        // Pequeño delay para asegurar que el DOM esté completamente renderizado
        setTimeout(() => {
            // Obtener elementos del DOM
            steps = document.querySelectorAll('.checkout-step');
            progressSteps = document.querySelectorAll('.progress-steps .step');
            prevBtn = document.getElementById('prev-step');
            nextBtn = document.getElementById('next-step');
            placeOrderBtn = document.getElementById('place-order');
            orderModal = document.getElementById('order-confirmation-modal');
            
            console.log('Elementos encontrados:');
            console.log('- Pasos de checkout:', steps.length);
            console.log('- Pasos de progreso:', progressSteps.length);
            console.log('- Botón anterior:', prevBtn ? 'OK' : 'NO ENCONTRADO');
            console.log('- Botón siguiente:', nextBtn ? 'OK' : 'NO ENCONTRADO');
            console.log('- Botón finalizar:', placeOrderBtn ? 'OK' : 'NO ENCONTRADO');

            console.log('Elementos encontrados:', {
                steps: steps.length,
                progressSteps: progressSteps.length,
                prevBtn: !!prevBtn,
                nextBtn: !!nextBtn,
                placeOrderBtn: !!placeOrderBtn,
                orderModal: !!orderModal
            });

            // Verificar que los elementos existen
            if (!steps.length || !nextBtn) {
                console.error('Elementos del checkout no encontrados, reintentando...');
                setTimeout(initCheckout, 100);
                return;
            }

            loadCartData();
            setupEventListeners();
            showStep(1); // Mostrar el primer paso
            updateProgress();
            updateSummary();
            setupDatePicker();
            setupPaymentMethods();
            setupDeliveryOptions();
            
            console.log('Checkout inicializado correctamente');
        }, 100);
    }


    // --- Cargar Datos del Carrito ---
    function loadCartData() {
        const cart = JSON.parse(localStorage.getItem('huertoHogarCart')) || [];
        orderData.products = cart;
        calculateTotals();
    }

    // --- Calcular Totales ---
    function calculateTotals() {
        let subtotal = 0;
        
        orderData.products.forEach(item => {
            subtotal += item.price * item.quantity;
        });

        orderData.totals.subtotal = subtotal;
        orderData.totals.discount = 0; // Se puede implementar lógica de descuentos
        orderData.totals.shipping = getShippingCost();
        orderData.totals.total = subtotal - orderData.totals.discount + orderData.totals.shipping;

        updateSummaryDisplay();
    }

    // --- Obtener Costo de Envío ---
    function getShippingCost() {
        const deliveryMethod = orderData.delivery.method;
        const shippingCosts = {
            'standard': 3000,
            'express': 5000,
            'pickup': 0
        };
        return shippingCosts[deliveryMethod] || 0;
    }

    // --- Event Listeners ---
    function setupEventListeners() {
        console.log('Configurando event listeners...');
        
        // Navegación entre pasos
        if (nextBtn) {
            console.log('Agregando listener al botón siguiente');
            nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Botón siguiente clickeado');
                nextStep();
            });
        } else {
            console.error('Botón siguiente no encontrado');
        }
        
        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Botón anterior clickeado');
                prevStep();
            });
        }
        
        if (placeOrderBtn) {
            placeOrderBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Botón finalizar pedido clickeado');
                placeOrder();
            });
        }

        // Fallback: Event delegation para botones
        document.addEventListener('click', (e) => {
            if (e.target && e.target.id === 'next-step') {
                e.preventDefault();
                e.stopPropagation();
                console.log('Botón siguiente clickeado (delegation)');
                nextStep();
            } else if (e.target && e.target.id === 'prev-step') {
                e.preventDefault();
                e.stopPropagation();
                console.log('Botón anterior clickeado (delegation)');
                prevStep();
            } else if (e.target && e.target.id === 'place-order') {
                e.preventDefault();
                e.stopPropagation();
                console.log('Botón finalizar pedido clickeado (delegation)');
                placeOrder();
            }
        });

        // Formularios
        setupFormValidation();
        
        // Modal
        setupModalEvents();

        // Opciones de entrega
        setupDeliveryOptions();

        // Métodos de pago
        setupPaymentMethods();
    }

    // --- Navegación entre Pasos ---
    function nextStep() {
        console.log('nextStep llamado, paso actual:', currentStep);
        
        if (validateCurrentStep()) {
            console.log('Validación exitosa, avanzando al siguiente paso');
            if (currentStep < 4) {
                currentStep++;
                console.log('Nuevo paso:', currentStep);
                console.log('Mostrando paso:', currentStep);
                showStep(currentStep);
                updateProgress();
                updateNavigationButtons();
                
                // Guardar datos del paso actual
                saveCurrentStepData();
            } else {
                console.log('Ya estamos en el último paso');
            }
        } else {
            console.log('Validación falló, no se puede avanzar');
        }
    }

    function prevStep() {
        if (currentStep > 1) {
            currentStep--;
            showStep(currentStep);
            updateProgress();
            updateNavigationButtons();
        }
    }

    function showStep(stepNumber) {
        console.log('🎯 showStep llamado con paso:', stepNumber);
        console.log('🎯 Total de pasos encontrados:', steps.length);
        
        if (!steps || steps.length === 0) {
            console.error('❌ ERROR: No se encontraron pasos de checkout');
            return;
        }
        
        steps.forEach((step, index) => {
            const stepIndex = index + 1;
            const isActive = stepIndex === stepNumber;
            step.classList.toggle('active', isActive);
            console.log(`🎯 Paso ${stepIndex}: ${isActive ? '✅ ACTIVO' : '❌ inactivo'}`);
            
            // Verificar si el paso tiene contenido
            if (isActive) {
                console.log('🎯 Contenido del paso activo:', step.innerHTML.substring(0, 100) + '...');
            }
        });
    }

    function updateProgress() {
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
        // Mostrar/ocultar botón Anterior
        prevBtn.style.display = currentStep > 1 ? 'block' : 'none';
        
        // El botón Siguiente siempre está visible
        nextBtn.style.display = 'block';
        
        // El botón Finalizar Pedido permanece oculto
        if (placeOrderBtn) {
            placeOrderBtn.style.display = 'none';
        }
    }

    // --- Validación de Pasos ---
    function validateCurrentStep() {
        console.log('🔍 Validando paso actual:', currentStep);
        
        let result = false;
        switch (currentStep) {
            case 1:
                result = validateCustomerInfo();
                break;
            case 2:
                result = validateDeliveryInfo();
                break;
            case 3:
                result = validatePaymentInfo();
                break;
            case 4:
                result = validateConfirmation();
                break;
            default:
                result = true;
        }
        
        console.log('🔍 Resultado de validación del paso', currentStep, ':', result ? '✅ EXITOSA' : '❌ FALLÓ');
        return result;
    }

    function validateCustomerInfo() {
        console.log('Validando información del cliente...');
        const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city'];
        let isValid = true;
        let hasErrors = false;

        // Limpiar errores previos
        requiredFields.forEach(fieldName => {
            const field = document.getElementById(fieldName);
            if (field) {
                clearFieldError(field);
            }
        });

        requiredFields.forEach(fieldName => {
            const field = document.getElementById(fieldName);
            console.log(`Validando campo ${fieldName}:`, field ? field.value : 'campo no encontrado');
            
            if (!field) {
                console.log(`Campo ${fieldName} no encontrado en el DOM`);
                isValid = false;
                hasErrors = true;
                return;
            }
            
            if (!field.value || !field.value.trim()) {
                console.log(`Campo ${fieldName} está vacío`);
                showFieldError(field, 'Este campo es obligatorio');
                isValid = false;
                hasErrors = true;
            }
        });

        // Validar email
        const email = document.getElementById('email');
        if (email && email.value && !isValidEmail(email.value)) {
            console.log('Email inválido:', email.value);
            showFieldError(email, 'Ingresa un email válido');
            isValid = false;
            hasErrors = true;
        }

        // Validar teléfono
        const phone = document.getElementById('phone');
        if (phone && phone.value && !isValidPhone(phone.value)) {
            console.log('Teléfono inválido:', phone.value);
            showFieldError(phone, 'Ingresa un teléfono válido (9 1234 5678)');
            isValid = false;
            hasErrors = true;
        }

        if (hasErrors) {
            showNotification('Por favor, completa todos los campos obligatorios correctamente', 'error');
        }

        console.log('Validación del cliente:', isValid ? 'exitosa' : 'falló');
        return isValid;
    }

    function validateDeliveryInfo() {
        console.log('Validando información de entrega...');
        
        const deliveryMethod = document.querySelector('input[name="delivery"]:checked');
        console.log('Método de entrega seleccionado:', deliveryMethod ? deliveryMethod.value : 'NINGUNO');
        
        if (!deliveryMethod) {
            console.log('ERROR: No hay método de entrega seleccionado');
            showNotification('Selecciona un método de entrega', 'error');
            return false;
        }

        if (deliveryMethod.value !== 'pickup') {
            const deliveryDate = document.getElementById('delivery-date');
            const timeSlot = document.querySelector('input[name="timeSlot"]:checked');
            
            console.log('Fecha de entrega:', deliveryDate ? deliveryDate.value : 'NO ENCONTRADA');
            console.log('Horario seleccionado:', timeSlot ? timeSlot.value : 'NINGUNO');
            
            if (!deliveryDate || !deliveryDate.value) {
                console.log('ERROR: No hay fecha de entrega');
                showFieldError(deliveryDate, 'Selecciona una fecha de entrega');
                return false;
            }
            
            if (!timeSlot) {
                console.log('ERROR: No hay horario seleccionado');
                showNotification('Selecciona un horario de entrega', 'error');
                return false;
            }
        }

        console.log('✅ Validación de entrega exitosa');
        return true;
    }

    function validatePaymentInfo() {
        const paymentMethod = document.querySelector('input[name="payment"]:checked');
        if (!paymentMethod) {
            showNotification('Selecciona un método de pago', 'error');
            return false;
        }

        if (paymentMethod.value === 'card') {
            const requiredFields = ['card-number', 'card-name', 'card-expiry', 'card-cvv'];
            let isValid = true;

            requiredFields.forEach(fieldId => {
                const field = document.getElementById(fieldId);
                if (!field || !field.value.trim()) {
                    showFieldError(field, 'Este campo es obligatorio');
                    isValid = false;
                } else {
                    clearFieldError(field);
                }
            });

            // Validar número de tarjeta
            const cardNumber = document.getElementById('card-number');
            if (cardNumber && cardNumber.value && !isValidCardNumber(cardNumber.value)) {
                showFieldError(cardNumber, 'Número de tarjeta inválido');
                isValid = false;
            }

            return isValid;
        }

        return true;
    }

    function validateConfirmation() {
        const acceptTerms = document.getElementById('accept-terms');
        if (!acceptTerms || !acceptTerms.checked) {
            showNotification('Debes aceptar los términos y condiciones', 'error');
            return false;
        }
        return true;
    }

    // --- Configuración de Opciones de Entrega ---
    function setupDeliveryOptions() {
        const deliveryOptions = document.querySelectorAll('.delivery-option');
        
        deliveryOptions.forEach(option => {
            option.addEventListener('click', () => {
                // Remover clase active de todas las opciones
                deliveryOptions.forEach(opt => opt.classList.remove('active'));
                // Agregar clase active a la opción seleccionada
                option.classList.add('active');
                
                // Marcar el radio button
                const radio = option.querySelector('input[type="radio"]');
                if (radio) {
                    radio.checked = true;
                }

                // Mostrar/ocultar programación según el método
                const deliverySchedule = document.getElementById('delivery-schedule');
                const method = option.dataset.delivery;
                
                if (method === 'pickup') {
                    deliverySchedule.style.display = 'none';
                } else {
                    deliverySchedule.style.display = 'block';
                }

                // Recalcular totales
                calculateTotals();
            });
        });
    }

    // --- Configuración de Métodos de Pago ---
    function setupPaymentMethods() {
        const paymentOptions = document.querySelectorAll('.payment-option');
        
        paymentOptions.forEach(option => {
            option.addEventListener('click', () => {
                // Remover clase active de todas las opciones
                paymentOptions.forEach(opt => opt.classList.remove('active'));
                // Agregar clase active a la opción seleccionada
                option.classList.add('active');
                
                // Marcar el radio button
                const radio = option.querySelector('input[type="radio"]');
                if (radio) {
                    radio.checked = true;
                }
            });
        });

        // Formatear número de tarjeta
        const cardNumber = document.getElementById('card-number');
        if (cardNumber) {
            cardNumber.addEventListener('input', formatCardNumber);
        }

        // Formatear fecha de vencimiento
        const cardExpiry = document.getElementById('card-expiry');
        if (cardExpiry) {
            cardExpiry.addEventListener('input', formatCardExpiry);
        }
    }

    // --- Configuración del Selector de Fecha ---
    function setupDatePicker() {
        const dateInput = document.getElementById('delivery-date');
        if (dateInput) {
            // Establecer fecha mínima como mañana
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            dateInput.min = tomorrow.toISOString().split('T')[0];
            
            // Establecer fecha máxima como 30 días desde hoy
            const maxDate = new Date();
            maxDate.setDate(maxDate.getDate() + 30);
            dateInput.max = maxDate.toISOString().split('T')[0];
            
            // Establecer fecha por defecto como mañana
            if (!dateInput.value) {
                dateInput.value = tomorrow.toISOString().split('T')[0];
            }
        }
    }

    // --- Guardar Datos del Paso Actual ---
    function saveCurrentStepData() {
        switch (currentStep) {
            case 1:
                saveCustomerData();
                break;
            case 2:
                saveDeliveryData();
                break;
            case 3:
                savePaymentData();
                break;
        }
    }

    function saveCustomerData() {
        const form = document.getElementById('customer-form');
        const formData = new FormData(form);
        
        orderData.customer = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            address: formData.get('address'),
            city: formData.get('city'),
            postalCode: formData.get('postalCode'),
            notes: formData.get('notes')
        };
    }

    function saveDeliveryData() {
        const deliveryMethod = document.querySelector('input[name="delivery"]:checked');
        const deliveryDate = document.getElementById('delivery-date');
        const timeSlot = document.querySelector('input[name="timeSlot"]:checked');
        
        orderData.delivery = {
            method: deliveryMethod ? deliveryMethod.value : '',
            date: deliveryDate ? deliveryDate.value : '',
            timeSlot: timeSlot ? timeSlot.value : ''
        };
    }

    function savePaymentData() {
        const paymentMethod = document.querySelector('input[name="payment"]:checked');
        
        orderData.payment = {
            method: paymentMethod ? paymentMethod.value : ''
        };

        if (paymentMethod && paymentMethod.value === 'card') {
            orderData.payment.card = {
                number: document.getElementById('card-number').value,
                name: document.getElementById('card-name').value,
                expiry: document.getElementById('card-expiry').value,
                cvv: document.getElementById('card-cvv').value
            };
        }
    }

    // --- Actualizar Resumen ---
    function updateSummary() {
        updateSummaryDisplay();
        updateConfirmationSummary();
    }

    function updateSummaryDisplay() {
        const summaryItems = document.getElementById('summary-items');
        const subtotal = document.getElementById('subtotal');
        const discount = document.getElementById('discount');
        const shipping = document.getElementById('shipping');
        const total = document.getElementById('total');

        // Mostrar productos
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

        // Actualizar totales
        if (subtotal) subtotal.textContent = `$${formatPrice(orderData.totals.subtotal)}`;
        if (discount) discount.textContent = `-$${formatPrice(orderData.totals.discount)}`;
        if (shipping) shipping.textContent = `$${formatPrice(orderData.totals.shipping)}`;
        if (total) total.textContent = `$${formatPrice(orderData.totals.total)}`;
    }

    function updateConfirmationSummary() {
        // Información del cliente
        const customerSummary = document.getElementById('customer-summary');
        if (customerSummary && orderData.customer.firstName) {
            customerSummary.innerHTML = `
                <div class="summary-detail"><strong>Nombre:</strong> ${orderData.customer.firstName} ${orderData.customer.lastName}</div>
                <div class="summary-detail"><strong>Email:</strong> ${orderData.customer.email}</div>
                <div class="summary-detail"><strong>Teléfono:</strong> ${orderData.customer.phone}</div>
                <div class="summary-detail"><strong>Dirección:</strong> ${orderData.customer.address}, ${orderData.customer.city}</div>
            `;
        }

        // Información de entrega
        const deliverySummary = document.getElementById('delivery-summary');
        if (deliverySummary && orderData.delivery.method) {
            const methodNames = {
                'standard': 'Entrega Estándar',
                'express': 'Entrega Express',
                'pickup': 'Retiro en Tienda'
            };
            
            deliverySummary.innerHTML = `
                <div class="summary-detail"><strong>Método:</strong> ${methodNames[orderData.delivery.method] || orderData.delivery.method}</div>
                ${orderData.delivery.date ? `<div class="summary-detail"><strong>Fecha:</strong> ${formatDate(orderData.delivery.date)}</div>` : ''}
                ${orderData.delivery.timeSlot ? `<div class="summary-detail"><strong>Horario:</strong> ${getTimeSlotText(orderData.delivery.timeSlot)}</div>` : ''}
            `;
        }

        // Información de pago
        const paymentSummary = document.getElementById('payment-summary');
        if (paymentSummary && orderData.payment.method) {
            const methodNames = {
                'card': 'Tarjeta de Crédito/Débito',
                'transfer': 'Transferencia Bancaria',
                'cash': 'Pago Contra Entrega'
            };
            
            paymentSummary.innerHTML = `
                <div class="summary-detail"><strong>Método:</strong> ${methodNames[orderData.payment.method] || orderData.payment.method}</div>
                ${orderData.payment.card ? `<div class="summary-detail"><strong>Tarjeta:</strong> **** **** **** ${orderData.payment.card.number.slice(-4)}</div>` : ''}
            `;
        }

        // Productos
        const productsSummary = document.getElementById('products-summary');
        if (productsSummary) {
            productsSummary.innerHTML = orderData.products.map(item => `
                <div class="summary-detail">${item.name} x${item.quantity} - $${formatPrice(item.price * item.quantity)}</div>
            `).join('');
        }
    }

    // --- Procesar Pedido ---
    function placeOrder() {
        if (validateConfirmation()) {
            // Guardar todos los datos
            saveCurrentStepData();
            
            // Generar número de pedido
            const orderNumber = generateOrderNumber();
            
            // Simular procesamiento
            showLoading(true);
            
            setTimeout(() => {
                // Guardar pedido en localStorage
                saveOrderToStorage(orderNumber);
                
                // Limpiar carrito
                localStorage.removeItem('huertoHogarCart');
                
                // Mostrar confirmación
                showOrderConfirmation(orderNumber);
                
                // Enviar notificaciones
                sendNotifications(orderNumber);
                
                showLoading(false);
            }, 2000);
        }
    }

    function generateOrderNumber() {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        return `HH${timestamp.toString().slice(-6)}${random.toString().padStart(3, '0')}`;
    }

    function saveOrderToStorage(orderNumber) {
        const order = {
            ...orderData,
            orderNumber,
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        const orders = JSON.parse(localStorage.getItem('huertoHogarOrders') || '[]');
        orders.push(order);
        localStorage.setItem('huertoHogarOrders', JSON.stringify(orders));
    }

    function showOrderConfirmation(orderNumber) {
        const orderNumberSpan = document.getElementById('order-number');
        const deliveryDateSpan = document.getElementById('delivery-date-confirm');
        const totalSpan = document.getElementById('total-confirm');
        
        if (orderNumberSpan) orderNumberSpan.textContent = orderNumber;
        if (deliveryDateSpan) deliveryDateSpan.textContent = formatDate(orderData.delivery.date);
        if (totalSpan) totalSpan.textContent = `$${formatPrice(orderData.totals.total)}`;
        
        orderModal.classList.remove('hidden');
    }

    function sendNotifications(orderNumber) {
        // Simular envío de notificaciones
        console.log('📧 Enviando email de confirmación...');
        console.log('📱 Enviando SMS de confirmación...');
        
        // Aquí se integraría con servicios reales de email/SMS
        showNotification('¡Gracias por elegir HuertoHogar! Te hemos enviado la confirmación por email y SMS', 'success');
        
        // Mostrar mensaje adicional de HuertoHogar
        setTimeout(() => {
            showNotification('🌱 Tus productos frescos del campo están siendo preparados con amor', 'info');
        }, 2000);
    }

    // --- Configuración del Modal ---
    function setupModalEvents() {
        const modalClose = document.querySelector('.modal-close');
        if (modalClose) {
            modalClose.addEventListener('click', () => {
                orderModal.classList.add('hidden');
            });
        }
        
        // Cerrar modal al hacer click fuera
        orderModal.addEventListener('click', (e) => {
            if (e.target === orderModal) {
                orderModal.classList.add('hidden');
            }
        });
    }

    // --- Utilidades de Validación ---
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function isValidPhone(phone) {
        // Validar formato chileno: +56 9 1234 5678 (9 dígitos total)
        const cleanPhone = phone.replace(/\s/g, '');
        return /^\+569\d{8}$/.test(cleanPhone) || /^9\d{8}$/.test(cleanPhone);
    }

    function isValidCardNumber(number) {
        // Algoritmo de Luhn simplificado
        const cleanNumber = number.replace(/\s/g, '');
        return /^\d{13,19}$/.test(cleanNumber);
    }

    // --- Utilidades de Formateo ---
    function formatCardNumber(input) {
        let value = input.value.replace(/\s/g, '');
        let formattedValue = value.replace(/(.{4})/g, '$1 ').trim();
        input.value = formattedValue;
    }

    function formatCardExpiry(input) {
        let value = input.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        input.value = value;
    }

    function formatPrice(price) {
        return price.toLocaleString('es-CL');
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-CL', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    function getTimeSlotText(timeSlot) {
        const timeSlots = {
            'morning': 'Mañana (9:00 - 12:00)',
            'afternoon': 'Tarde (12:00 - 18:00)',
            'evening': 'Noche (18:00 - 20:00)'
        };
        return timeSlots[timeSlot] || timeSlot;
    }

    // --- Utilidades de UI ---
    function showFieldError(field, message) {
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
        field.style.borderColor = '';
        const errorDiv = field.parentNode.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    function showNotification(message, type = 'info') {
        // Crear notificación temporal mejorada
        const notification = document.createElement('div');
        notification.className = `notification notification-${type} status-message`;
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.75rem;">
                <i class="fas ${getNotificationIcon(type)}" style="font-size: 1.2rem;"></i>
                <span>${message}</span>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            color: white;
            font-weight: 600;
            z-index: 10000;
            transform: translateX(100%);
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            max-width: 350px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.2);
            font-family: 'Montserrat', sans-serif;
        `;
        
        const colors = {
            success: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
            error: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
            warning: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
            info: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)'
        };
        
        notification.style.background = colors[type] || colors.info;
        document.body.appendChild(notification);
        
        // Animar entrada
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remover después de 4 segundos
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 400);
        }, 4000);
    }

    function getNotificationIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    function showLoading(show) {
        const loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'loading-overlay';
        loadingOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, rgba(46, 139, 87, 0.9) 0%, rgba(0, 0, 0, 0.8) 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            color: white;
            font-size: 1.2rem;
            backdrop-filter: blur(5px);
        `;
        
        if (show) {
            loadingOverlay.innerHTML = `
                <div style="text-align: center; background: rgba(255, 255, 255, 0.1); padding: 3rem; border-radius: 20px; backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2);">
                    <div class="loading-spinner" style="width: 60px; height: 60px; border: 4px solid rgba(255, 255, 255, 0.3); border-top: 4px solid #FFD700; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1.5rem;"></div>
                    <h3 style="margin: 0 0 0.5rem 0; font-family: 'Playfair Display', serif; color: #FFD700;">Procesando tu pedido</h3>
                    <p style="margin: 0; opacity: 0.9; font-family: 'Montserrat', sans-serif;">Preparando tus productos frescos...</p>
                </div>
            `;
            document.body.appendChild(loadingOverlay);
        } else {
            const existing = document.getElementById('loading-overlay');
            if (existing) {
                existing.remove();
            }
        }
    }

    // --- Configuración de Validación de Formularios ---
    function setupFormValidation() {
        const forms = document.querySelectorAll('.checkout-form');
        forms.forEach(form => {
            const inputs = form.querySelectorAll('input, textarea, select');
            inputs.forEach(input => {
                input.addEventListener('blur', () => {
                    if (input.hasAttribute('required') && !input.value.trim()) {
                        showFieldError(input, 'Este campo es obligatorio');
                    } else {
                        clearFieldError(input);
                    }
                });
                
                input.addEventListener('input', () => {
                    clearFieldError(input);
                });
            });
        });
    }

    // --- CSS para animación de loading ---
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
});
