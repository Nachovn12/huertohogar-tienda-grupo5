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
        // Esperar a que el DOM esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', startCheckout);
        } else {
            startCheckout();
        }
    }
    function startCheckout() {
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
        // Configurar input de teléfono con prefijo fijo
        setupPhoneInput();
        // Configurar date picker de entrega
        setupDeliveryDatePicker();
    }
    function showNotification(message, type = 'info') {
        // Crear notificación temporal
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: ${type === 'success' ? '#2e8b57' : type === 'error' ? '#dc3545' : '#007bff'};
            color: white;
            border-radius: 8px;
            z-index: 10000;
            font-weight: 500;
        `;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    function setupPhoneInput() {
        const phoneInput = document.getElementById('phone');
        if (!phoneInput) {
            return;
        }
        // Función para formatear el número de teléfono
        function formatPhoneNumber(value) {
            // Remover todos los caracteres no numéricos
            const numbers = value.replace(/\D/g, '');
            // Limitar a 9 dígitos (formato chileno: 9 + 8 dígitos)
            const limitedNumbers = numbers.slice(0, 9);
            // Formatear como 9 XXXX XXXX
            if (limitedNumbers.length >= 5) {
                return limitedNumbers.slice(0, 1) + ' ' + limitedNumbers.slice(1, 5) + ' ' + limitedNumbers.slice(5);
            } else if (limitedNumbers.length >= 1) {
                return limitedNumbers.slice(0, 1) + ' ' + limitedNumbers.slice(1);
            }
            return limitedNumbers;
        }
        // Función para actualizar el valor completo del input
        function updatePhoneValue() {
            const currentValue = phoneInput.value;
            const formattedValue = formatPhoneNumber(currentValue);
            phoneInput.value = formattedValue;
            // Actualizar el valor del input hidden para el formulario
            const fullPhoneNumber = '+56 9 ' + formattedValue;
            phoneInput.setAttribute('data-full-phone', fullPhoneNumber);
        }
        // Event listeners
        phoneInput.addEventListener('input', updatePhoneValue);
        phoneInput.addEventListener('paste', (e) => {
            // Permitir que se pegue el valor y luego formatearlo
            setTimeout(updatePhoneValue, 10);
        });
        // Prevenir que se escriban caracteres no numéricos
        phoneInput.addEventListener('keypress', (e) => {
            const char = String.fromCharCode(e.which);
            if (!/[0-9]/.test(char)) {
                e.preventDefault();
            }
        });
        // Configurar el placeholder
        phoneInput.placeholder = '9 1234 5678';
        // Inicializar el valor si ya hay uno
        if (phoneInput.value) {
            updatePhoneValue();
        }
    }
    function setupDeliveryDatePicker() {
        const deliveryDateInput = document.getElementById('delivery-date');
        if (!deliveryDateInput) {
            return;
        }
        // Establecer fecha mínima (mañana)
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const minDate = tomorrow.toISOString().split('T')[0];
        deliveryDateInput.min = minDate;
        // Establecer fecha máxima (30 días desde hoy)
        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + 30);
        const maxDateString = maxDate.toISOString().split('T')[0];
        deliveryDateInput.max = maxDateString;
        // Configurar placeholder
        deliveryDateInput.placeholder = 'Selecciona una fecha';
        // Event listener para cuando cambie la fecha
        deliveryDateInput.addEventListener('change', function() {
        });
    }
    function setupButtons() {
        // Método 1: Event listeners directos
        const nextBtn = document.getElementById('next-step');
        const prevBtn = document.getElementById('prev-step');
        const placeOrderBtn = document.getElementById('place-order');
        if (nextBtn) {
            nextBtn.onclick = function(e) {
                e.preventDefault();
                nextStep();
            };
        } else {
        }
        if (prevBtn) {
            prevBtn.onclick = function(e) {
                e.preventDefault();
                prevStep();
            };
        }
        if (placeOrderBtn) {
            placeOrderBtn.onclick = function(e) {
                e.preventDefault();
                placeOrder();
            };
        }
        // Método 2: Event delegation como fallback
        document.addEventListener('click', function(e) {
            if (e.target.id === 'next-step') {
                e.preventDefault();
                nextStep();
            } else if (e.target.id === 'prev-step') {
                e.preventDefault();
                prevStep();
            } else if (e.target.id === 'place-order') {
                e.preventDefault();
                placeOrder();
            }
        });
    }
    function nextStep() {
        if (validateCurrentStep()) {
            // Guardar datos del paso actual antes de avanzar
            saveCurrentStepData();
            if (currentStep < 4) {
                currentStep++;
                showStep(currentStep);
                updateProgress();
                updateNavigationButtons();
            }
        } else {
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
        // Verificar si el usuario está logueado
        const session = getCurrentSession();
        const isLoggedIn = session && session.expiresAt && session.expiresAt > Date.now();
        // Campos requeridos según el tipo de usuario
        const requiredFields = isLoggedIn 
            ? ['phone', 'address', 'city'] // Para usuarios logueados, solo estos campos son obligatorios
            : ['first-name', 'last-name', 'email', 'phone', 'address', 'city']; // Para invitados, todos los campos
        let isValid = true;
        // Limpiar errores previos
        ['first-name', 'last-name', 'email', 'phone', 'address', 'city'].forEach(fieldName => {
            const field = document.getElementById(fieldName);
            if (field) clearFieldError(field);
        });
        // Validar campos requeridos
        requiredFields.forEach(fieldName => {
            const field = document.getElementById(fieldName);
            if (!field || !field.value.trim()) {
                showFieldError(field, 'Este campo es obligatorio');
                isValid = false;
            } else {
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
        if (phone && phone.value) {
            if (!isValidPhoneNew(phone.value)) {
                showFieldError(phone, 'Ingresa un teléfono válido');
                isValid = false;
            } else {
            }
        }
        if (!isValid) {
            const message = isLoggedIn 
                ? 'Por favor, completa los campos de entrega obligatorios'
                : 'Por favor, completa todos los campos obligatorios';
            showNotification(message, 'error');
        }
        return isValid;
    }
    function validateDeliveryInfo() {
        const deliveryMethod = document.querySelector('input[name="delivery"]:checked');
        if (!deliveryMethod) {
            showNotification('Selecciona un método de entrega', 'error');
            return false;
        }
        // Solo validar fecha y horario si no es retiro en tienda
        if (deliveryMethod.value !== 'pickup') {
            const deliveryDate = document.getElementById('delivery-date');
            const timeSlot = document.querySelector('input[name="timeSlot"]:checked');
            if (!deliveryDate || !deliveryDate.value) {
                showNotification('Selecciona una fecha de entrega', 'error');
                return false;
            }
            if (!timeSlot) {
                showNotification('Selecciona un horario de entrega', 'error');
                return false;
            }
            // Validar que la fecha no sea en el pasado
            const selectedDate = new Date(deliveryDate.value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (selectedDate < today) {
                showNotification('La fecha de entrega no puede ser en el pasado', 'error');
                return false;
            }
        }
        return true;
    }
    function validatePaymentInfo() {
        const paymentMethod = document.querySelector('input[name="payment"]:checked');
        if (!paymentMethod) {
            showNotification('Selecciona un método de pago', 'error');
            return false;
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
    function loadCartData() {
        const cart = JSON.parse(localStorage.getItem('huertoHogarCart')) || [];
        orderData.products = cart;
        calculateTotals();
        updateSummary();
    }
    function loadUserData() {
        // Verificar si hay una sesión activa
        const session = getCurrentSession();
        if (session && session.expiresAt && session.expiresAt > Date.now()) {
            markUserType('logged');
            loadLoggedUserData(session);
        } else {
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
        }
        return null;
    }
    function loadLoggedUserData(session) {
        try {
            // Obtener datos del usuario desde localStorage
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const user = users.find(u => u.id === session.userId);
            if (user) {
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
            }
        } catch (error) {
            setupGuestMode();
        }
    }
    function setupGuestMode() {
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
        try {
            const savedData = localStorage.getItem('huertoHogarCheckoutData');
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                // Cargar datos del cliente
                if (parsedData.customer) {
                    orderData.customer = parsedData.customer;
                }
                // Cargar datos de entrega
                if (parsedData.delivery) {
                    orderData.delivery = parsedData.delivery;
                }
                // Cargar datos de pago
                if (parsedData.payment) {
                    orderData.payment = parsedData.payment;
                }
            }
        } catch (error) {
        }
    }
    function saveCheckoutData() {
        try {
            const dataToSave = {
                customer: orderData.customer,
                delivery: orderData.delivery,
                payment: orderData.payment,
                timestamp: Date.now()
            };
            localStorage.setItem('huertoHogarCheckoutData', JSON.stringify(dataToSave));
        } catch (error) {
        }
    }
    function calculateTotals() {
        let subtotal = 0;
        let totalDiscount = 0;
        orderData.products.forEach(item => {
            // Verificar si el producto está en oferta
            const isOnOffer = window.isProductOnOffer ? window.isProductOnOffer(item.id) : false;
            const originalPrice = window.getOriginalPrice ? window.getOriginalPrice(item.id) : item.price;
            const offerPrice = window.getOfferPrice ? window.getOfferPrice(item.id) : item.price;
            const currentPrice = isOnOffer ? offerPrice : item.price;
            const discount = isOnOffer ? (originalPrice - offerPrice) * item.quantity : 0;
            subtotal += currentPrice * item.quantity;
            totalDiscount += discount;
        });
        orderData.totals.subtotal = subtotal;
        orderData.totals.discount = totalDiscount;
        orderData.totals.shipping = 3000; // Envío estándar
        orderData.totals.total = subtotal + orderData.totals.shipping;
    }
    function updateSummary() {
        const summaryItems = document.getElementById('summary-items');
        const subtotal = document.getElementById('subtotal');
        const discount = document.getElementById('discount');
        const shipping = document.getElementById('shipping');
        const total = document.getElementById('total');
        if (summaryItems) {
            summaryItems.innerHTML = orderData.products.map(item => {
                // Verificar si el producto está en oferta
                const isOnOffer = window.isProductOnOffer ? window.isProductOnOffer(item.id) : false;
                const originalPrice = window.getOriginalPrice ? window.getOriginalPrice(item.id) : item.price;
                const offerPrice = window.getOfferPrice ? window.getOfferPrice(item.id) : item.price;
                const currentPrice = isOnOffer ? offerPrice : item.price;
                const discountAmount = isOnOffer ? (originalPrice - offerPrice) * item.quantity : 0;
                return `
                    <div class="summary-item">
                        <div class="item-info">
                            <img src="${item.image}" alt="${item.name}" class="item-image">
                            <div class="item-details">
                                <h4>${item.name}</h4>
                                <p>Cantidad: ${item.quantity}</p>
                                ${isOnOffer ? `<p class="discount-info">🔥 En oferta: $${formatPrice(currentPrice)} (Antes: $${formatPrice(originalPrice)})</p>` : ''}
                            </div>
                        </div>
                        <div class="item-price">
                            <div>$${formatPrice(currentPrice * item.quantity)}</div>
                            ${discountAmount > 0 ? `<div class="discount-amount">-$${formatPrice(discountAmount)}</div>` : ''}
                        </div>
                    </div>
                `;
            }).join('');
        }
        if (subtotal) subtotal.textContent = `$${formatPrice(orderData.totals.subtotal)}`;
        if (discount) {
            if (orderData.totals.discount > 0) {
                discount.textContent = `-$${formatPrice(orderData.totals.discount)}`;
                discount.style.display = 'block';
            } else {
                discount.style.display = 'none';
            }
        }
        if (shipping) shipping.textContent = `$${formatPrice(orderData.totals.shipping)}`;
        if (total) total.textContent = `$${formatPrice(orderData.totals.total)}`;
    }
    function saveCurrentStepData() {
        if (currentStep === 1) {
            // Guardar datos del cliente
            const firstName = document.getElementById('first-name')?.value || '';
            const lastName = document.getElementById('last-name')?.value || '';
            const email = document.getElementById('email')?.value || '';
            const phoneInput = document.getElementById('phone');
            const phone = phoneInput ? (phoneInput.getAttribute('data-full-phone') || phoneInput.value) : '';
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
        }
        // Guardar datos en localStorage después de cada paso
        saveCheckoutData();
    }
    function placeOrder() {
        const orderNumber = 'HH' + Date.now().toString().slice(-6);
        // Guardar datos del paso actual antes de finalizar
        saveCurrentStepData();
        // Asegurar que los totales estén calculados
        calculateTotals();
        // Obtener el número de teléfono completo con prefijo
        const phoneInput = document.getElementById('phone');
        if (phoneInput) {
            const fullPhoneNumber = phoneInput.getAttribute('data-full-phone') || phoneInput.value;
        }
        // Simular procesamiento
        showLoading(true);
        setTimeout(() => {
            showLoading(false);
            showOrderConfirmation(orderNumber);
            // Limpiar datos del checkout después de completar el pedido
            localStorage.removeItem('huertoHogarCheckoutData');
            localStorage.removeItem('huertoHogarCart');
        }, 2000);
    }
    function showOrderConfirmation(orderNumber) {
        const modal = document.getElementById('order-confirmation-modal');
        const orderNumberSpan = document.getElementById('order-number');
        const deliveryDateSpan = document.getElementById('delivery-date-confirm');
        const totalSpan = document.getElementById('total-confirm');
        // Mostrar número de pedido
        if (orderNumberSpan) orderNumberSpan.textContent = orderNumber;
        // Mostrar fecha de entrega
        if (deliveryDateSpan) {
            const deliveryData = orderData.delivery || {};
            if (deliveryData.date) {
                // Formatear la fecha para mostrar
                const deliveryDate = new Date(deliveryData.date);
                const formattedDate = deliveryDate.toLocaleDateString('es-CL', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
                deliveryDateSpan.textContent = formattedDate;
            } else if (deliveryData.method === 'pickup') {
                deliveryDateSpan.textContent = 'Retiro en tienda';
            } else {
                deliveryDateSpan.textContent = 'No especificada';
            }
        }
        // Mostrar total
        if (totalSpan) {
            const total = orderData.totals?.total || 0;
            totalSpan.textContent = `$${total.toLocaleString('es-CL')} CLP`;
        }
        if (modal) modal.classList.remove('hidden');
    }
    // Función para generar comprobante PDF profesional
    function generateReceipt() {
        // Verificar que jsPDF esté disponible
        if (typeof window.jspdf === 'undefined') {
            showNotification('Error: No se puede generar el comprobante', 'error');
            return;
        }
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        // Obtener datos del pedido
        const orderNumber = document.getElementById('order-number')?.textContent || 'N/A';
        const deliveryDate = document.getElementById('delivery-date-confirm')?.textContent || 'No especificada';
        const total = document.getElementById('total-confirm')?.textContent || '$0 CLP';
        // Datos de la empresa
        const companyName = 'HuertoHogar';
        const companyAddress = 'Av. Principal 123, Santiago, Chile';
        const companyPhone = '+56 9 1234 5678';
        const companyEmail = 'ventas@huertohogar.cl';
        const companyRUT = '12.345.678-9';
        // Fecha actual
        const currentDate = new Date().toLocaleDateString('es-CL', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        // Configuración de colores
        const primaryColor = [46, 139, 87]; // Verde
        const secondaryColor = [107, 114, 128]; // Gris
        const textColor = [31, 41, 55]; // Gris oscuro
        // === ENCABEZADO ===
        doc.setFontSize(24);
        doc.setTextColor(...primaryColor);
        doc.setFont('helvetica', 'bold');
        doc.text(companyName, 20, 30);
        // Línea decorativa
        doc.setDrawColor(...primaryColor);
        doc.setLineWidth(0.5);
        doc.line(20, 35, 190, 35);
        // Información de la empresa
        doc.setFontSize(10);
        doc.setTextColor(...secondaryColor);
        doc.setFont('helvetica', 'normal');
        doc.text(companyAddress, 20, 45);
        doc.text(`Tel: ${companyPhone} | Email: ${companyEmail}`, 20, 50);
        doc.text(`RUT: ${companyRUT}`, 20, 55);
        // === INFORMACIÓN DEL COMPROBANTE ===
        doc.setFontSize(16);
        doc.setTextColor(...textColor);
        doc.setFont('helvetica', 'bold');
        doc.text('COMPROBANTE DE PEDIDO', 20, 75);
        // Datos del comprobante
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`Número de Pedido: ${orderNumber}`, 20, 90);
        doc.text(`Fecha de Emisión: ${currentDate}`, 20, 100);
        doc.text(`Fecha de Entrega: ${deliveryDate}`, 20, 110);
        // === INFORMACIÓN DEL CLIENTE ===
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('INFORMACIÓN DEL CLIENTE', 20, 130);
        const customerData = orderData.customer || {};
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Nombre: ${customerData.firstName || ''} ${customerData.lastName || ''}`, 20, 145);
        doc.text(`Email: ${customerData.email || ''}`, 20, 155);
        doc.text(`Teléfono: ${customerData.phone || ''}`, 20, 165);
        doc.text(`Dirección: ${customerData.address || ''}`, 20, 175);
        doc.text(`Ciudad: ${customerData.city || ''}`, 20, 185);
        // === PRODUCTOS ===
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('PRODUCTOS', 20, 205);
        // Encabezados de la tabla
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Producto', 20, 220);
        doc.text('Cantidad', 100, 220);
        doc.text('Precio Unit.', 130, 220);
        doc.text('Subtotal', 160, 220);
        // Línea separadora
        doc.setDrawColor(...secondaryColor);
        doc.line(20, 225, 190, 225);
        // Productos
        let yPosition = 235;
        const products = orderData.products || [];
        let subtotal = 0;
        let totalDiscount = 0;
        products.forEach((product, index) => {
            if (yPosition > 250) {
                doc.addPage();
                yPosition = 30;
            }
            // Verificar si el producto está en oferta
            const isOnOffer = window.isProductOnOffer ? window.isProductOnOffer(product.id) : false;
            const originalPrice = window.getOriginalPrice ? window.getOriginalPrice(product.id) : product.price;
            const offerPrice = window.getOfferPrice ? window.getOfferPrice(product.id) : product.price;
            const currentPrice = isOnOffer ? offerPrice : product.price;
            const discount = isOnOffer ? (originalPrice - offerPrice) * product.quantity : 0;
            const productSubtotal = currentPrice * product.quantity;
            subtotal += productSubtotal;
            totalDiscount += discount;
            doc.setFont('helvetica', 'normal');
            doc.text(product.name, 20, yPosition);
            doc.text(product.quantity.toString(), 100, yPosition);
            // Mostrar precio con descuento si aplica
            if (isOnOffer) {
                doc.text(`$${currentPrice.toLocaleString('es-CL')}`, 130, yPosition);
                doc.text(`$${productSubtotal.toLocaleString('es-CL')}`, 160, yPosition);
                // Mostrar precio original tachado en la siguiente línea
                yPosition += 8;
                doc.setFontSize(8);
                doc.setTextColor(...secondaryColor);
                doc.text(`Precio original: $${originalPrice.toLocaleString('es-CL')}`, 20, yPosition);
                doc.text(`Descuento: -$${discount.toLocaleString('es-CL')}`, 130, yPosition);
                doc.setFontSize(10);
                doc.setTextColor(...textColor);
                yPosition += 2;
            } else {
                doc.text(`$${currentPrice.toLocaleString('es-CL')}`, 130, yPosition);
                doc.text(`$${productSubtotal.toLocaleString('es-CL')}`, 160, yPosition);
            }
            yPosition += 10;
        });
        // === TOTALES ===
        const shipping = orderData.totals?.shipping || 3000;
        const totalAmount = orderData.totals?.total || 0;
        // Línea separadora
        doc.setDrawColor(...secondaryColor);
        doc.line(120, yPosition + 5, 190, yPosition + 5);
        yPosition += 15;
        doc.setFont('helvetica', 'bold');
        doc.text('Subtotal:', 130, yPosition);
        doc.text(`$${subtotal.toLocaleString('es-CL')}`, 160, yPosition);
        yPosition += 10;
        // Mostrar descuento si hay alguno
        if (totalDiscount > 0) {
            doc.setTextColor(...primaryColor);
            doc.text('Descuento:', 130, yPosition);
            doc.text(`-$${totalDiscount.toLocaleString('es-CL')}`, 160, yPosition);
            yPosition += 10;
        }
        doc.setTextColor(...textColor);
        doc.text('Envío:', 130, yPosition);
        doc.text(`$${shipping.toLocaleString('es-CL')}`, 160, yPosition);
        yPosition += 10;
        doc.setFontSize(12);
        doc.setTextColor(...primaryColor);
        doc.text('TOTAL:', 130, yPosition);
        doc.text(`$${totalAmount.toLocaleString('es-CL')} CLP`, 160, yPosition);
        // === MÉTODO DE ENTREGA ===
        yPosition += 20;
        doc.setFontSize(12);
        doc.setTextColor(...textColor);
        doc.setFont('helvetica', 'bold');
        doc.text('MÉTODO DE ENTREGA', 20, yPosition);
        yPosition += 10;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const deliveryMethod = orderData.delivery?.method || 'No especificado';
        const deliveryMethodText = deliveryMethod === 'delivery' ? 'Entrega a domicilio' : 
                                 deliveryMethod === 'pickup' ? 'Retiro en tienda' : 
                                 deliveryMethod;
        doc.text(deliveryMethodText, 20, yPosition);
        // === PIE DE PÁGINA ===
        const pageHeight = doc.internal.pageSize.height;
        yPosition = pageHeight - 40;
        doc.setFontSize(8);
        doc.setTextColor(...secondaryColor);
        doc.setFont('helvetica', 'normal');
        doc.text('Gracias por su compra en HuertoHogar', 20, yPosition);
        doc.text('Productos frescos y orgánicos para su hogar', 20, yPosition + 8);
        doc.text('www.huertohogar.cl', 20, yPosition + 16);
        // === GUARDAR PDF ===
        const fileName = `Comprobante_${orderNumber}_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
        showNotification('Comprobante generado exitosamente', 'success');
    }
    // Hacer la función disponible globalmente
    window.generateReceipt = generateReceipt;
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
    function isValidPhoneNew(phone) {
        // Validar el formato del input con prefijo fijo
        // El input ahora contiene la parte editable (ej: "9 1234 5678")
        // Remover espacios y validar que sean exactamente 9 dígitos
        const cleanPhone = phone.replace(/\s/g, '');
        // Debe tener exactamente 9 dígitos empezando con 9 (números chilenos)
        // Acepta cualquier número de 9 dígitos que empiece con 9 ya que el prefijo +56 está fijo
        return /^9\d{8}$/.test(cleanPhone);
    }
    function formatPrice(price) {
        return price.toLocaleString('es-CL');
    }
    // Función de prueba para validar teléfonos (disponible en consola)
    window.testPhoneValidation = function(phoneNumber) {
        const result = isValidPhoneNew(phoneNumber);
        return result;
    };
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
        // Cargar información del cliente
        loadCustomerSummary();
        // Cargar método de entrega
        loadDeliverySummary();
        // Cargar método de pago
        loadPaymentSummary();
        // Cargar productos
        loadProductsSummary();
    }
    function loadCustomerSummary() {
        const customerSummary = document.getElementById('customer-summary');
        if (!customerSummary) return;
        const customer = orderData.customer || {};
        // Si no hay datos del cliente, intentar obtenerlos directamente de los campos
        if (!customer.firstName && !customer.lastName && !customer.email) {
            const firstName = document.getElementById('first-name')?.value || '';
            const lastName = document.getElementById('last-name')?.value || '';
            const email = document.getElementById('email')?.value || '';
            const phoneInput = document.getElementById('phone');
            const phone = phoneInput ? (phoneInput.getAttribute('data-full-phone') || phoneInput.value) : '';
            const address = document.getElementById('address')?.value || '';
            const city = document.getElementById('city')?.value || '';
            const postalCode = document.getElementById('postal-code')?.value || '';
            const notes = document.getElementById('notes')?.value || '';
            // Actualizar orderData con los datos obtenidos
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
        }
        let html = '<div class="confirmation-details">';
        // Usar los datos actualizados
        const currentCustomer = orderData.customer || {};
        // Mostrar nombre completo
        if (currentCustomer.firstName || currentCustomer.lastName) {
            const fullName = `${currentCustomer.firstName || ''} ${currentCustomer.lastName || ''}`.trim();
            html += `<p><strong>Nombre:</strong> ${fullName}</p>`;
        } else {
            html += `<p><strong>Nombre:</strong> <span style="color: #6c757d; font-style: italic;">No proporcionado</span></p>`;
        }
        // Mostrar email
        if (currentCustomer.email) {
            html += `<p><strong>Email:</strong> ${currentCustomer.email}</p>`;
        } else {
            html += `<p><strong>Email:</strong> <span style="color: #6c757d; font-style: italic;">No proporcionado</span></p>`;
        }
        // Mostrar teléfono (usar el valor completo con prefijo)
        if (currentCustomer.phone) {
            const phoneInput = document.getElementById('phone');
            const fullPhone = phoneInput ? phoneInput.getAttribute('data-full-phone') : currentCustomer.phone;
            html += `<p><strong>Teléfono:</strong> ${fullPhone || currentCustomer.phone}</p>`;
        } else {
            html += `<p><strong>Teléfono:</strong> <span style="color: #6c757d; font-style: italic;">No proporcionado</span></p>`;
        }
        // Mostrar dirección
        if (currentCustomer.address) {
            html += `<p><strong>Dirección:</strong> ${currentCustomer.address}</p>`;
        } else {
            html += `<p><strong>Dirección:</strong> <span style="color: #6c757d; font-style: italic;">No proporcionada</span></p>`;
        }
        // Mostrar ciudad
        if (currentCustomer.city) {
            html += `<p><strong>Ciudad:</strong> ${currentCustomer.city}</p>`;
        } else {
            html += `<p><strong>Ciudad:</strong> <span style="color: #6c757d; font-style: italic;">No proporcionada</span></p>`;
        }
        // Mostrar código postal si existe
        if (currentCustomer.postalCode) {
            html += `<p><strong>Código Postal:</strong> ${currentCustomer.postalCode}</p>`;
        }
        // Mostrar notas si existen
        if (currentCustomer.notes) {
            html += `<p><strong>Notas:</strong> ${currentCustomer.notes}</p>`;
        }
        html += '</div>';
        customerSummary.innerHTML = html;
    }
    function loadDeliverySummary() {
        const deliverySummary = document.getElementById('delivery-summary');
        if (!deliverySummary) return;
        const delivery = orderData.delivery || {};
        // Si no hay datos de entrega, intentar obtenerlos directamente de los campos
        if (!delivery.method && !delivery.date && !delivery.timeSlot) {
            const deliveryMethod = document.querySelector('input[name="delivery"]:checked');
            const deliveryDate = document.getElementById('delivery-date')?.value || '';
            const timeSlot = document.querySelector('input[name="timeSlot"]:checked');
            // Actualizar orderData con los datos obtenidos
            orderData.delivery = {
                method: deliveryMethod?.value || '',
                date: deliveryDate,
                timeSlot: timeSlot?.value || '',
                cost: deliveryMethod?.value === 'delivery' ? orderData.totals.shipping : 0
            };
        }
        // Usar los datos actualizados
        const currentDelivery = orderData.delivery || {};
        let html = '<div class="confirmation-details">';
        // Mostrar método de entrega
        if (currentDelivery.method) {
            if (currentDelivery.method === 'delivery') {
                html += '<p><strong>Método:</strong> Entrega a Domicilio</p>';
                html += `<p><strong>Costo:</strong> $${formatPrice(currentDelivery.cost || orderData.totals.shipping)}</p>`;
                html += '<p><strong>Dirección de entrega:</strong> La dirección proporcionada en la información del cliente</p>';
            } else if (currentDelivery.method === 'express') {
                html += '<p><strong>Método:</strong> Entrega Express</p>';
                html += `<p><strong>Costo:</strong> $${formatPrice(currentDelivery.cost || orderData.totals.shipping)}</p>`;
                html += '<p><strong>Dirección de entrega:</strong> La dirección proporcionada en la información del cliente</p>';
            } else if (currentDelivery.method === 'pickup') {
                html += '<p><strong>Método:</strong> Retiro en Tienda</p>';
                html += '<p><strong>Costo:</strong> Gratis</p>';
                html += '<p><strong>Dirección de la tienda:</strong> Av. Principal 123, Santiago</p>';
                html += '<p><strong>Horario de atención:</strong> Lunes a Sábado 9:00 - 19:00</p>';
            }
        } else {
            html += '<p><strong>Método:</strong> <span style="color: #6c757d; font-style: italic;">No seleccionado</span></p>';
        }
        // Mostrar fecha de entrega (solo si no es retiro en tienda)
        if (currentDelivery.method !== 'pickup') {
            if (currentDelivery.date) {
                const date = new Date(currentDelivery.date);
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
            if (currentDelivery.timeSlot) {
                const timeLabels = {
                    'morning': 'Mañana (9:00 - 12:00)',
                    'afternoon': 'Tarde (12:00 - 18:00)',
                    'evening': 'Noche (18:00 - 20:00)'
                };
                html += `<p><strong>Horario de entrega:</strong> ${timeLabels[currentDelivery.timeSlot] || currentDelivery.timeSlot}</p>`;
            } else {
                html += '<p><strong>Horario de entrega:</strong> <span style="color: #6c757d; font-style: italic;">No seleccionado</span></p>';
            }
        }
        // Mostrar información adicional
        if (currentDelivery.method === 'delivery' || currentDelivery.method === 'express') {
            html += '<p><strong>Nota:</strong> El pedido será entregado en la dirección proporcionada</p>';
        } else if (currentDelivery.method === 'pickup') {
            html += '<p><strong>Nota:</strong> Debe presentar identificación al retirar</p>';
        }
        html += '</div>';
        deliverySummary.innerHTML = html;
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
    }
    function loadProductsSummary() {
        const productsSummary = document.getElementById('products-summary');
        if (!productsSummary) return;
        const products = orderData.products || [];
        if (products.length === 0) {
            productsSummary.innerHTML = '<div class="confirmation-details"><p style="color: #6c757d; font-style: italic;">No hay productos en el carrito</p></div>';
            return;
        }
        let html = '<div class="confirmation-products">';
        products.forEach((product, index) => {
            // Obtener imagen del producto (usar imagen por defecto si no existe)
            const productImage = product.image || 'assets/img/Logo_HuertoHogar_Web.png';
            html += `
                <div class="product-item">
                    <div class="product-image">
                        <img src="${productImage}" alt="${product.name}" onerror="this.src='assets/img/Logo_HuertoHogar_Web.png'">
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
    }
})();
