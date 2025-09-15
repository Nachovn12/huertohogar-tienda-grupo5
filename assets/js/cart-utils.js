// Utilidades del carrito de compras para productos individuales
// Este archivo proporciona funciones comunes para manejar el carrito

// Variable global para el carrito (se inicializa si no existe)
if (typeof window.cart === 'undefined') {
    window.cart = [];
}

// Función para mostrar notificaciones
const showNotification = (message, type = 'info') => {
    // Crear notificación si no existe
    let notification = document.getElementById('notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: ${type === 'success' ? '#2ecc71' : type === 'error' ? '#e74c3c' : '#3498db'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            font-family: 'Montserrat', sans-serif;
            font-weight: 500;
            font-size: 14px;
            max-width: 300px;
            word-wrap: break-word;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        document.body.appendChild(notification);
    }
    
    notification.textContent = message;
    notification.style.background = type === 'success' ? '#2ecc71' : type === 'error' ? '#e74c3c' : '#3498db';
    notification.style.transform = 'translateX(0)';
    
    // Auto-ocultar después de 3 segundos
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
};

// Función para actualizar el contador del carrito
const updateCartCounter = () => {
    const cartCounter = document.getElementById('cart-counter');
    if (cartCounter) {
        const totalItems = window.cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCounter.textContent = totalItems;
    }
};

// Función para renderizar el carrito
const renderCart = () => {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    
    if (!cartItems || !cartTotal) return;
    
    if (window.cart.length === 0) {
        cartItems.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">Tu carrito está vacío</p>';
        cartTotal.textContent = '$0 CLP';
    } else {
        cartItems.innerHTML = window.cart.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p class="cart-item-price">$${item.price.toLocaleString()} CLP</p>
                    <div class="cart-item-controls">
                        <button class="quantity-btn decrease" data-id="${item.id}">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn increase" data-id="${item.id}">+</button>
                    </div>
                </div>
                <button class="remove-btn" data-id="${item.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');
        
        const total = window.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotal.textContent = `$${total.toLocaleString()} CLP`;
    }
    
    updateCartCounter();
};

// Función para abrir el carrito
const openCart = () => {
    const cartOffcanvas = document.getElementById('cart-offcanvas');
    const cartOverlay = document.getElementById('cart-overlay');
    
    if (cartOffcanvas && cartOverlay) {
        cartOffcanvas.classList.remove('hidden');
        cartOverlay.classList.remove('hidden');
        document.body.classList.add('cart-open');
        setTimeout(() => {
            cartOffcanvas.classList.add('visible');
            cartOverlay.classList.add('visible');
        }, 10);
    }
};

// Función para cerrar el carrito
const closeCart = () => {
    const cartOffcanvas = document.getElementById('cart-offcanvas');
    const cartOverlay = document.getElementById('cart-overlay');
    
    if (cartOffcanvas && cartOverlay) {
        cartOffcanvas.classList.remove('visible');
        cartOverlay.classList.remove('visible');
        document.body.classList.remove('cart-open');
        setTimeout(() => {
            cartOffcanvas.classList.add('hidden');
            cartOverlay.classList.add('hidden');
        }, 300);
    }
};

// Función principal para agregar productos al carrito
const addToCart = (product) => {
    if (!product || !product.id) {
        console.error('Producto inválido para agregar al carrito');
        return;
    }
    
    // Buscar si el producto ya existe en el carrito
    const existingItem = window.cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += product.quantity || 1;
    } else {
        const newItem = {
            ...product,
            quantity: product.quantity || 1
        };
        window.cart.push(newItem);
    }
    
    // Actualizar la visualización del carrito
    renderCart();
    
    // Mostrar notificación
    showNotification(`${product.name} agregado al carrito`, 'success');
    
    // Abrir el carrito automáticamente
    openCart();
    
    // Guardar en localStorage
    localStorage.setItem('cart', JSON.stringify(window.cart));
};

// Función para eliminar productos del carrito
const removeFromCart = (productId) => {
    window.cart = window.cart.filter(item => item.id !== productId);
    renderCart();
    localStorage.setItem('cart', JSON.stringify(window.cart));
};

// Función para actualizar la cantidad de un producto en el carrito
const updateCartQuantity = (productId, newQuantity) => {
    const item = window.cart.find(item => item.id === productId);
    if (item) {
        if (newQuantity <= 0) {
            removeFromCart(productId);
        } else {
            item.quantity = newQuantity;
            renderCart();
            localStorage.setItem('cart', JSON.stringify(window.cart));
        }
    }
};

// Función para inicializar el carrito desde localStorage
const initializeCart = () => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        try {
            const parsedCart = JSON.parse(savedCart);
            // Verificar que los datos del carrito sean válidos
            if (Array.isArray(parsedCart)) {
                window.cart = parsedCart;
            } else {
                window.cart = [];
            }
        } catch (e) {
            console.error('Error al cargar el carrito desde localStorage:', e);
            window.cart = [];
        }
    } else {
        window.cart = [];
    }
    renderCart();
};

// Event listeners para el carrito
const setupCartEventListeners = () => {
    // Botón para abrir el carrito
    const openCartBtn = document.getElementById('open-cart-btn');
    if (openCartBtn) {
        openCartBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openCart();
        });
    }
    
    // Botón para cerrar el carrito
    const closeCartBtn = document.getElementById('close-cart-btn');
    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', closeCart);
    }
    
    // Overlay para cerrar el carrito
    const cartOverlay = document.getElementById('cart-overlay');
    if (cartOverlay) {
        cartOverlay.addEventListener('click', closeCart);
    }
    
    // Event delegation para botones del carrito
    document.addEventListener('click', (e) => {
        // Botón eliminar del carrito
        if (e.target.classList.contains('remove-btn') || e.target.closest('.remove-btn')) {
            const productId = e.target.dataset.id || e.target.closest('[data-id]')?.dataset.id;
            if (productId) {
                removeFromCart(productId);
            }
        }
        
        // Botones de cantidad
        if (e.target.classList.contains('decrease')) {
            const productId = e.target.dataset.id;
            const item = window.cart.find(item => item.id === productId);
            if (item) {
                updateCartQuantity(productId, item.quantity - 1);
            }
        }
        
        if (e.target.classList.contains('increase')) {
            const productId = e.target.dataset.id;
            const item = window.cart.find(item => item.id === productId);
            if (item) {
                updateCartQuantity(productId, item.quantity + 1);
            }
        }
    });
};

// Función para limpiar el carrito y localStorage (para debugging)
const clearCart = () => {
    window.cart = [];
    localStorage.removeItem('cart');
    renderCart();
    console.log('Carrito limpiado');
};

// Función para reiniciar completamente el carrito
const resetCart = () => {
    // Limpiar el carrito actual
    window.cart = [];
    
    // Limpiar localStorage
    localStorage.removeItem('cart');
    
    // Reinicializar el carrito
    initializeCart();
    
    console.log('Carrito reiniciado');
};

// Función para mostrar información de debug del carrito
const debugCart = () => {
    console.log('=== DEBUG DEL CARRITO ===');
    console.log('Carrito actual:', window.cart);
    console.log('localStorage:', localStorage.getItem('cart'));
    console.log('========================');
};

// Hacer funciones disponibles globalmente para debugging
window.clearCart = clearCart;
window.resetCart = resetCart;
window.debugCart = debugCart;
window.addToCart = addToCart;

// Inicializar el carrito cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    // Limpiar el carrito al cargar para evitar datos corruptos
    resetCart();
    setupCartEventListeners();
});
