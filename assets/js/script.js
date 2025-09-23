document.addEventListener('DOMContentLoaded', () => {
    // --- Inicializar sesión de usuario ---
    if (window.authEnhanced && typeof window.authEnhanced.checkExistingSession === 'function') {
        window.authEnhanced.checkExistingSession();
    } else {
        // Si authEnhanced no está disponible aún, usar la función global
        if (typeof window.updateHeaderInAllPages === 'function') {
            window.updateHeaderInAllPages();
        }
    }
    // --- Sistema de Búsqueda Local con localStorage ---
    const SEARCH_STORAGE_KEY = 'huertohogar_search_history';
    const PRODUCTS_STORAGE_KEY = 'huertohogar_products';
    // --- Funcionalidad del Botón Hero ---
    const initHeroButton = () => {
        const heroButton = document.querySelector('.hero-section .btn-primary');
        if (heroButton) {
            // Agregar evento de click
            heroButton.addEventListener('click', function(e) {
                e.preventDefault(); // Prevenir comportamiento por defecto
                // Tracking de analytics (opcional)
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'click', {
                        'event_category': 'Hero Button',
                        'event_label': 'Descubre Nuestros Productos'
                    });
                }
                // Verificar si estamos en la página de productos
                const currentPath = window.location.pathname;
                const isOnProductsPage = currentPath.includes('productos.html') || currentPath.endsWith('/productos.html');
                if (isOnProductsPage) {
                    // Si estamos en productos.html, hacer scroll suave
                    const productsSection = document.getElementById('categories') || document.querySelector('.content-section');
                    if (productsSection) {
                        productsSection.scrollIntoView({ 
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                } else {
                    // Si no estamos en productos.html, navegar normalmente
                    window.location.href = 'productos.html';
                }
            });
            // Agregar evento de mouseover para debug
            heroButton.addEventListener('mouseover', function() {
            });
        } else {
        }
    };
    // Inicializar funcionalidad del botón hero
    initHeroButton();
    // Función para guardar productos en localStorage
    const saveProductsToStorage = (products) => {
        localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
    };
    // Función para cargar productos desde localStorage
    const loadProductsFromStorage = () => {
        const stored = localStorage.getItem(PRODUCTS_STORAGE_KEY);
        return stored ? JSON.parse(stored) : null;
    };
    // Función para guardar historial de búsquedas
    const saveSearchHistory = (searchTerm) => {
        if (!searchTerm.trim()) return;
        let history = JSON.parse(localStorage.getItem(SEARCH_STORAGE_KEY) || '[]');
        history = history.filter(term => term !== searchTerm); // Evitar duplicados
        history.unshift(searchTerm); // Agregar al inicio
        history = history.slice(0, 10); // Mantener solo 10 búsquedas recientes
        localStorage.setItem(SEARCH_STORAGE_KEY, JSON.stringify(history));
    };
    // Función para cargar historial de búsquedas
    const loadSearchHistory = () => {
        return JSON.parse(localStorage.getItem(SEARCH_STORAGE_KEY) || '[]');
    };
    // Función de búsqueda local
    const searchProducts = (query, products) => {
        if (!query.trim()) return products;
        const searchTerm = query.toLowerCase().trim();
        return products.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm) ||
            product.id.toLowerCase().includes(searchTerm)
        );
    };
    // Mapeo de productos a URLs amigables profesionales
    window.productUrlMap = {
        'FR001': 'producto/manzanas-fuji.html',
        'FR002': 'producto/naranjas-valencia.html',
        'FR003': 'producto/platanos-cavendish.html',
        'VR001': 'producto/zanahorias-organicas.html',
        'VR002': 'producto/espinacas-frescas.html',
        'VR003': 'producto/pimientos-tricolores.html',
        'PO001': 'producto/miel-organica.html',
        'PO003': 'producto/quinua-organica.html',
        'PL001': 'producto/leche-entera.html'
    };
    // Función para mostrar sugerencias de búsqueda
    const showSearchSuggestions = (input, products) => {
        const suggestionsContainer = document.getElementById('search-suggestions');
        if (!suggestionsContainer) return;
        const query = input.value.toLowerCase().trim();
        if (query.length < 2) {
            suggestionsContainer.style.display = 'none';
            return;
        }
        const suggestions = products
            .filter(product => 
                product.name.toLowerCase().includes(query) ||
                product.category.toLowerCase().includes(query)
            )
            .slice(0, 5)
            .map(product => ({
                text: product.name,
                category: product.category,
                id: product.id
            }));
        if (suggestions.length > 0) {
            suggestionsContainer.innerHTML = suggestions
                .map(suggestion => `
                    <div class="search-suggestion" data-product-id="${suggestion.id}">
                        <span class="suggestion-text">${suggestion.text}</span>
                        <span class="suggestion-category">${suggestion.category}</span>
                    </div>
                `).join('');
            suggestionsContainer.style.display = 'block';
        } else {
            suggestionsContainer.style.display = 'none';
        }
    };
    // --- Sistema de Ofertas Especiales ---
    // Seleccionar los 4 productos más recomendados para ofertas
    const getRecommendedProductsForOffers = () => {
        // Seleccionar los productos más recomendados de diferentes categorías
        const organicProducts = products.filter(p => p.category === 'Productos Orgánicos');
        const fujiApples = products.find(p => p.id === 'FR001');
        const carrots = products.find(p => p.id === 'VR003');
        const recommendedProducts = [
            // Productos Orgánicos (2 productos)
            ...organicProducts,
            // Agregar 1 producto popular de Frutas Frescas (Manzanas Fuji)
            fujiApples,
            // Agregar 1 producto de Verduras Orgánicas (Zanahorias)
            carrots
        ].filter(Boolean); // Eliminar valores undefined
        // Convertir a formato de ofertas con descuentos
        const offers = recommendedProducts.map((product, index) => {
            const discounts = [25, 20, 15, 18]; // Descuentos diferentes para cada producto
            const discount = discounts[index] || 15;
            const originalPrice = product.price;
            const offerPrice = Math.round(originalPrice * (1 - discount / 100));
            return {
                id: product.id,
                name: product.name,
                originalPrice: originalPrice,
                offerPrice: offerPrice,
                discount: discount,
                category: product.category,
                image: product.image,
                stock: product.stock,
                unit: product.unit,
                description: product.description,
                badge: `${discount}% OFF`
            };
        });
        return offers;
    };
    // --- Función para obtener productos por defecto ---
    const getDefaultProducts = () => [
        { 
            id: 'FR001', 
            name: 'Manzanas Fuji', 
            price: 1200, 
            category: 'Frutas Frescas', 
            image: 'https://santaisabel.vtexassets.com/arquivos/ids/174684-900-900?width=900&height=900&aspect=true',
            stock: 150,
            unit: 'kilos',
            description: 'Manzanas Fuji crujientes y dulces, cultivadas en el Valle del Maule. Perfectas para meriendas saludables o como ingrediente en postres. Estas manzanas son conocidas por su textura firme y su sabor equilibrado entre dulce y ácido.',
            features: ['Fresco', 'De temporada', 'Nutritivo'],
            featured: true,
            active: true,
            createdAt: new Date().toISOString()
        },
        { 
            id: 'FR002', 
            name: 'Naranjas Valencia', 
            price: 1000, 
            category: 'Frutas Frescas', 
            image: 'https://static.vecteezy.com/system/resources/previews/022/825/544/non_2x/orange-fruit-orange-on-transparent-background-free-png.png',
            stock: 200,
            unit: 'kilos',
            description: 'Jugosas y ricas en vitamina C, estas naranjas Valencia son ideales para zumos frescos y refrescantes. Cultivadas en condiciones climáticas óptimas que aseguran su dulzura y jugosidad.',
            features: ['Fresco', 'Rico en vitamina C', 'Jugoso'],
            featured: false,
            active: true,
            createdAt: new Date().toISOString()
        },
        { 
            id: 'FR003', 
            name: 'Plátanos Cavendish', 
            price: 800, 
            category: 'Frutas Frescas', 
            image: 'https://png.pngtree.com/png-vector/20240128/ourmid/pngtree-ripe-cavendish-banana-png-image_11508971.png',
            stock: 250,
            unit: 'kilos',
            description: 'Plátanos maduros y dulces, perfectos para el desayuno o como snack energético. Estos plátanos son ricos en potasio y vitaminas, ideales para mantener una dieta equilibrada.',
            features: ['Fresco', 'Rico en potasio', 'Energético'],
            featured: false,
            active: true,
            createdAt: new Date().toISOString()
        },
        { 
            id: 'VR001', 
            name: 'Zanahorias Orgánicas', 
            price: 900, 
            category: 'Verduras Orgánicas', 
            image: 'https://png.pngtree.com/png-vector/20241225/ourmid/pngtree-fresh-organic-carrots-in-a-neat-stack-png-image_14812590.png',
            stock: 100,
            unit: 'kilos',
            description: 'Zanahorias crujientes cultivadas sin pesticidas en la Región de O\'Higgins. Excelente fuente de vitamina A y fibra, ideales para ensaladas, jugos o como snack saludable.',
            features: ['Orgánico', 'Sin pesticidas', 'Rico en vitamina A'],
            featured: false,
            active: true,
            createdAt: new Date().toISOString()
        },
        { 
            id: 'VR002', 
            name: 'Espinacas Frescas', 
            price: 700, 
            category: 'Verduras Orgánicas', 
            image: 'https://pngimg.com/uploads/spinach/spinach_PNG45.png',
            stock: 80,
            unit: 'bolsas de 500g',
            description: 'Espinacas frescas y nutritivas, perfectas para ensaladas y batidos verdes. Estas espinacas son cultivadas bajo prácticas orgánicas que garantizan su calidad y valor nutricional.',
            features: ['Orgánico', 'Fresco', 'Nutritivo'],
            featured: false,
            active: true,
            createdAt: new Date().toISOString()
        },
        { 
            id: 'VR003', 
            name: 'Pimientos Tricolores', 
            price: 1500, 
            category: 'Verduras Orgánicas', 
            image: 'https://png.pngtree.com/png-vector/20241212/ourmid/pngtree-colored-paprica-raw-paprika-fruit-png-image_14613829.png',
            stock: 120,
            unit: 'kilos',
            description: 'Pimientos rojos, amarillos y verdes, ideales para salteados y platos coloridos. Ricos en antioxidantes y vitaminas, estos pimientos añaden un toque vibrante y saludable a cualquier receta.',
            features: ['Orgánico', 'Colorido', 'Rico en antioxidantes'],
            featured: true,
            active: true,
            createdAt: new Date().toISOString()
        },
        { 
            id: 'PO001', 
            name: 'Miel Orgánica', 
            price: 5000, 
            category: 'Productos Orgánicos', 
            image: 'https://png.pngtree.com/png-clipart/20240720/original/pngtree-family-apiary-organic-honey-food-production-png-image_15597696.png',
            stock: 50,
            unit: 'frascos de 500g',
            description: 'Miel pura y orgánica producida por apicultores locales. Rica en antioxidantes y con un sabor inigualable, perfecta para endulzar de manera natural tus comidas y bebidas.',
            features: ['Orgánico', 'Natural', 'Rico en antioxidantes'],
            featured: true,
            active: true,
            createdAt: new Date().toISOString()
        },
        { 
            id: 'PO003', 
            name: 'Quinua Orgánica', 
            price: 3000, 
            category: 'Productos Orgánicos', 
            image: 'https://manare.cl/wp-content/uploads/2023/09/Manare_QuinoaOrganica400g.png',
            stock: 75,
            unit: 'paquetes de 400g',
            description: 'Quinua orgánica de alta calidad, rica en proteínas y nutrientes esenciales. Perfecta para ensaladas, sopas y como sustituto del arroz. Cultivada en los Andes chilenos.',
            features: ['Orgánico', 'Rico en proteínas', 'Nutritivo'],
            featured: false,
            active: true,
            createdAt: new Date().toISOString()
        },
        { 
            id: 'PL001', 
            name: 'Leche Entera', 
            price: 1800, 
            category: 'Productos Lácteos', 
            image: 'https://www.soprole.cl/public/storage/imagenes/banners/202304180943Soprole-Lecheentera-litro.png',
            stock: 200,
            unit: 'litros',
            description: 'Leche entera fresca y nutritiva, rica en calcio y vitaminas. Perfecta para el desayuno, postres y preparaciones culinarias. Producida bajo los más altos estándares de calidad.',
            features: ['Fresco', 'Rico en calcio', 'Nutritivo'],
            featured: false,
            active: true,
            createdAt: new Date().toISOString()
        }
    ];
    // --- Cargar productos desde localStorage o usar los por defecto ---
    let products = loadProductsFromStorage();
    if (!products) {
        products = getDefaultProducts();
        saveProductsToStorage(products);
    }
    // Inicializar ofertas especiales
    const specialOffers = getRecommendedProductsForOffers();
    // Función de debug inmediato
    const debugOffersImmediately = () => {
        if (specialOffers.length > 0) {
        }
    };
    // Ejecutar debug inmediatamente
    debugOffersImmediately();
    // Función para obtener el precio de oferta de un producto
    const getOfferPrice = (productId) => {
        const offer = specialOffers.find(o => o.id === productId);
        return offer ? offer.offerPrice : null;
    };
    // Función para obtener el precio original de un producto en oferta
    const getOriginalPrice = (productId) => {
        const offer = specialOffers.find(o => o.id === productId);
        return offer ? offer.originalPrice : null;
    };
    // Función para verificar si un producto está en oferta
    const isProductOnOffer = (productId) => {
        return specialOffers.some(o => o.id === productId);
    };
    // Hacer las funciones de ofertas disponibles globalmente
    window.getOfferPrice = getOfferPrice;
    window.getOriginalPrice = getOriginalPrice;
    window.isProductOnOffer = isProductOnOffer;
    let cart = JSON.parse(localStorage.getItem('huertoHogarCart')) || [];
    // --- Selectores del DOM ---
    const productListHome = document.getElementById('product-list-home');
    const productListFull = document.getElementById('product-list-full');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const cartItemsList = document.querySelector('#cart-offcanvas .cart-body');
    const cartTotalSpan = document.querySelector('#cart-offcanvas #cart-total');
    const cartCounter = document.getElementById('cart-counter');
    const openCartBtn = document.getElementById('open-cart-btn');
    const closeCartBtn = document.getElementById('close-cart-btn');
    const cartOffcanvas = document.getElementById('cart-offcanvas');
    const cartOverlay = document.getElementById('cart-overlay');
    // --- Funciones del Carrito y Productos ---
    const formatPrice = (price) => `$${price.toLocaleString('es-CL')} CLP`;
    // Hacer formatPrice disponible globalmente
    window.formatPrice = formatPrice;
    // Función para renderizar productos
    const renderProducts = (category = 'all', container, limit = null) => {
        try {
            if (!container) {
                return;
            }
            const filtered = category === 'all' ? products : products.filter(p => p.category === category);
            const productsToRender = limit ? filtered.slice(0, limit) : filtered;
            if (productsToRender.length === 0) {
                container.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">No hay productos disponibles.</p>';
                return;
            }
            // Aplicar clase especial para categorías con pocos productos
            if (category !== 'all' && productsToRender.length <= 2) {
                container.classList.add('few-products');
            } else {
                container.classList.remove('few-products');
            }
            // Renderizado simplificado para debug
            let html = '';
            productsToRender.forEach((product, index) => {
                try {
                    const offerPrice = getOfferPrice(product.id);
                    const originalPrice = getOriginalPrice(product.id);
                    const isOnOffer = isProductOnOffer(product.id);
                    const discountPercentage = isOnOffer ? Math.round((1 - offerPrice / originalPrice) * 100) : 0;
                    const savings = isOnOffer ? (originalPrice - offerPrice) : 0;
                    const productHtml = `
                        <div class="product-card grid-card" style="--delay: ${index * 0.1}s">
                            ${isOnOffer ? `<div class="offer-badge">🔥 ${discountPercentage}% OFF</div>` : (product.popular ? '<div class="new-badge">Popular</div>' : '')}
                            <img src="${product.image}" alt="${product.name}">
                            <div class="product-info">
                                <h4>${product.name}</h4>
                                <div class="product-pricing">
                                    <p class="price ${isOnOffer ? 'has-offer' : ''}">${formatPrice(offerPrice || product.price)}</p>
                                    <span class="product-unit">${product.unit || 'por unidad'}</span>
                                    ${isOnOffer ? `<span class="original-price">Antes: ${formatPrice(originalPrice)}</span>` : ''}
                                    ${isOnOffer ? `<span class="savings-badge">💰 Ahorras $${formatPrice(savings)}</span>` : ''}
                                </div>
                                <div class="product-actions">
                                    <button class="view-details-btn" data-id="${product.id}">
                                        <i class="fas fa-info-circle"></i> Ver Detalles
                                    </button>
                                    <button class="add-to-cart-btn" data-id="${product.id}">
                                        <i class="fas fa-shopping-cart"></i> Agregar al Carrito
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                    html += productHtml;
                } catch (error) {
                }
            });
            container.innerHTML = html;
            // Aplicar animaciones a los productos recién renderizados
            setTimeout(() => {
                try {
                    enhanceProductAnimations();
                    enhanceImageAnimations();
                    enhanceButtonAnimations();
                } catch (error) {
                }
            }, 100);
        } catch (error) {
            container.innerHTML = '<p style="text-align: center; color: #e74c3c; padding: 2rem;">Error al cargar los productos. Por favor, recarga la página.</p>';
        }
    };
    // Inicializar productos para la página principal
    if (productListHome) {
        renderProducts('all', productListHome, 6);
    }
    // La página de productos se inicializa con filtros-avanzados.js
    // No necesitamos inicializar aquí para evitar conflictos
    // --- Función para Mostrar Detalles del Producto ---
    // --- Función para Redirigir a Detalles del Producto ---
    const goToProductDetails = (productId) => {
        const productUrl = window.productUrlMap[productId];
        if (productUrl) {
            window.location.href = productUrl;
        } else {
        }
    };
    const renderProductsAlphabetically = (category = 'all', container) => {
        try {
            if (!container) {
                return;
            }
            const filtered = category === 'all' ? products : products.filter(p => p.category === category);
            // Ordenar productos alfabéticamente por nombre
            const sortedProducts = [...filtered].sort((a, b) => {
                return a.name.localeCompare(b.name, 'es', { sensitivity: 'base' });
            });
            if (sortedProducts.length === 0) {
                container.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">No hay productos disponibles.</p>';
                return;
            }
            // Aplicar clase especial para categorías con pocos productos
            if (category !== 'all' && sortedProducts.length <= 2) {
                container.classList.add('few-products');
            } else {
                container.classList.remove('few-products');
            }
            // Renderizado con orden alfabético
            let html = '';
            sortedProducts.forEach((product, index) => {
                try {
                    const offerPrice = getOfferPrice(product.id);
                    const originalPrice = getOriginalPrice(product.id);
                    const isOnOffer = isProductOnOffer(product.id);
                    const discountPercentage = isOnOffer ? Math.round((1 - offerPrice / originalPrice) * 100) : 0;
                    const savings = isOnOffer ? (originalPrice - offerPrice) : 0;
                    const productHtml = `
                        <div class="product-card grid-card" style="--delay: ${index * 0.1}s">
                            ${isOnOffer ? `<div class="offer-badge">🔥 ${discountPercentage}% OFF</div>` : (product.popular ? '<div class="new-badge">Popular</div>' : '')}
                            <img src="${product.image}" alt="${product.name}">
                            <div class="product-info">
                                <h4>${product.name}</h4>
                                <div class="product-pricing">
                                    <p class="price ${isOnOffer ? 'has-offer' : ''}">${formatPrice(offerPrice || product.price)}</p>
                                    <span class="product-unit">${product.unit || 'por unidad'}</span>
                                    ${isOnOffer ? `<span class="original-price">Antes: ${formatPrice(originalPrice)}</span>` : ''}
                                    ${isOnOffer ? `<span class="savings-badge">💰 Ahorras $${formatPrice(savings)}</span>` : ''}
                                </div>
                                <div class="product-actions">
                                    <button class="view-details-btn" data-id="${product.id}">
                                        <i class="fas fa-info-circle"></i> Ver Detalles
                                    </button>
                                    <button class="add-to-cart-btn" data-id="${product.id}">
                                        <i class="fas fa-shopping-cart"></i> Agregar al Carrito
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                    html += productHtml;
                } catch (error) {
                }
            });
            container.innerHTML = html;
            // Aplicar animaciones a los productos recién renderizados
            setTimeout(() => {
                try {
                    enhanceProductAnimations();
                    enhanceImageAnimations();
                    enhanceButtonAnimations();
                } catch (error) {
                }
            }, 100);
        } catch (error) {
            container.innerHTML = '<p style="text-align: center; color: #e74c3c; padding: 2rem;">Error al cargar los productos. Por favor, recarga la página.</p>';
        }
    };
    const renderCart = () => {
        if (cart.length === 0) {
            cartItemsList.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Tu carrito está vacío</p>
                    <small>Agrega algunos productos para comenzar</small>
                </div>
            `;
        } else {
            cartItemsList.innerHTML = cart.map(item => {
                return `
                    <div class="cart-item" data-id="${item.id}">
                        <div class="cart-item-image">
                            <img src="${item.image}" alt="${item.name}">
                        </div>
                        <div class="cart-item-details">
                            <h4 class="cart-item-name">${item.name}</h4>
                            <div class="cart-item-price">${formatPrice(item.price)}</div>
                            <div class="cart-item-total">Total: ${formatPrice(item.price * item.quantity)}</div>
                        </div>
                        <div class="cart-item-controls">
                            <div class="quantity-controls">
                                <button class="quantity-btn decrease-btn" data-id="${item.id}">
                                    <i class="fas fa-minus"></i>
                                </button>
                                <span class="quantity-display">${item.quantity}</span>
                                <button class="quantity-btn increase-btn" data-id="${item.id}">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                            <button class="remove-btn" data-id="${item.id}" title="Eliminar producto">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        }
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartTotalSpan.textContent = formatPrice(total);
        cartCounter.textContent = totalItems;
        localStorage.setItem('huertoHogarCart', JSON.stringify(cart));
        // Debug: verificar que los controles se crearon correctamente
        setTimeout(() => {
            const decreaseBtns = document.querySelectorAll('.decrease-btn');
            const increaseBtns = document.querySelectorAll('.increase-btn');
            decreaseBtns.forEach((btn, index) => {
            });
            increaseBtns.forEach((btn, index) => {
            });
        }, 100);
    };
    const addToCart = (productId) => {
        // Buscar en productos regulares primero
        let productToAdd = products.find(p => p.id === productId);
        if (productToAdd) {
            // Verificar si está en oferta
            const offerPrice = getOfferPrice(productId);
            const isOnOffer = isProductOnOffer(productId);
            if (isOnOffer) {
                productToAdd = {
                    ...productToAdd,
                    price: offerPrice
                };
            }
        } else {
            // Si no se encuentra, buscar en ofertas especiales
            const offer = specialOffers.find(o => o.id === productId);
            if (offer) {
                productToAdd = {
                    ...offer,
                    price: offer.offerPrice
                };
            }
        }
        if (!productToAdd) return;
        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ ...productToAdd, quantity: 1 });
        }
        renderCart();
        // Mostrar notificación
        showNotification(`${productToAdd.name} agregado al carrito`, 'success');
        // Solo abrir el carrito para productos regulares, no para ofertas
        if (products.find(p => p.id === productId)) {
            openCart();
        }
    };
    const removeFromCart = (productId) => {
        cart = cart.filter(item => item.id !== productId);
        renderCart();
    };
    const increaseQuantity = (productId) => {
        const item = cart.find(item => item.id === productId);
        if (item) {
            item.quantity++;
            renderCart();
        } else {
        }
    };
    const decreaseQuantity = (productId) => {
        const item = cart.find(item => item.id === productId);
        if (item) {
            if (item.quantity > 1) {
                item.quantity--;
            } else {
                removeFromCart(productId);
            }
            renderCart();
        } else {
        }
    };
    const openCart = () => {
        cartOffcanvas.classList.remove('hidden');
        cartOverlay.classList.remove('hidden');
        document.body.classList.add('cart-open');
        setTimeout(() => {
            cartOffcanvas.classList.add('visible');
            cartOverlay.classList.add('visible');
        }, 10);
    };
    const closeCart = () => {
        cartOffcanvas.classList.remove('visible');
        cartOverlay.classList.remove('visible');
        document.body.classList.remove('cart-open');
        setTimeout(() => {
            cartOffcanvas.classList.add('hidden');
            cartOverlay.classList.add('hidden');
        }, 300);
    };
    // --- Lógica de Filtros ---
    if (filterButtons.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                renderProducts(button.dataset.category, productListFull);
                // Mostrar/ocultar información de categoría
                if (button.dataset.category === 'all') {
                    hideCategoryInfo();
                } else {
                    showCategoryInfo(button.dataset.category);
                }
            });
        });
    }
    // --- Filtrado Automático por Categoría desde URL ---
    const autoFilterByCategory = () => {
        // Obtener el parámetro de categoría de la URL
        const urlParams = new URLSearchParams(window.location.search);
        const categoria = urlParams.get('categoria');
        if (categoria && filterButtons.length > 0) {
            // Buscar el botón de filtro correspondiente
            const targetButton = Array.from(filterButtons).find(btn => 
                btn.dataset.category === categoria
            );
            if (targetButton) {
                // Remover clase active de todos los botones
                filterButtons.forEach(btn => btn.classList.remove('active'));
                // Activar el botón de la categoría
                targetButton.classList.add('active');
                // Renderizar productos filtrados
                renderProducts(categoria, productListFull);
                // Mostrar mensaje informativo de categoría
                showCategoryInfo(categoria);
                // Hacer scroll suave hasta la sección de productos
                setTimeout(() => {
                    document.getElementById('product-list-full').scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }, 100);
            }
        }
    };
    // --- Mostrar Información de Categoría Filtrada ---
    const showCategoryInfo = (categoria) => {
        const categoryInfo = document.getElementById('category-info');
        const categoryInfoText = document.getElementById('category-info-text');
        if (categoryInfo && categoryInfoText) {
            categoryInfoText.textContent = `Mostrando productos de: ${categoria}`;
            categoryInfo.style.display = 'flex';
        }
    };
    // --- Ocultar Información de Categoría ---
    const hideCategoryInfo = () => {
        const categoryInfo = document.getElementById('category-info');
        if (categoryInfo) {
            categoryInfo.style.display = 'none';
        }
    };
    // --- Event Listeners Globales ---
    if (openCartBtn) {
        openCartBtn.addEventListener('click', (e) => { e.preventDefault(); openCart(); });
        closeCartBtn.addEventListener('click', closeCart);
        cartOverlay.addEventListener('click', closeCart);
    }
    // --- Event Listener para Botón "Ver Todos" ---
    const clearFilterBtn = document.getElementById('clear-filter');
    if (clearFilterBtn) {
        clearFilterBtn.addEventListener('click', () => {
            // Activar botón "Todos"
            filterButtons.forEach(btn => btn.classList.remove('active'));
            const allButton = Array.from(filterButtons).find(btn => btn.dataset.category === 'all');
            if (allButton) allButton.classList.add('active');
            // Renderizar todos los productos
            renderProducts('all', productListFull);
            // Ocultar información de categoría
            hideCategoryInfo();
            // Limpiar parámetro de URL
            const url = new URL(window.location);
            url.searchParams.delete('categoria');
            window.history.replaceState({}, '', url);
        });
    }
    // Event delegation para todos los botones
    document.body.addEventListener('click', (e) => {
        // Botón agregar al carrito (productos regulares)
        if (e.target.classList.contains('add-to-cart-btn') && !e.target.closest('.offer-card')) {
            const productId = e.target.dataset.id || e.target.closest('[data-id]')?.dataset.id;
            if (productId) {
                addToCart(productId);
            }
        }
        // Botón eliminar del carrito
        if (e.target.classList.contains('remove-btn') || e.target.closest('.remove-btn')) {
            e.preventDefault();
            e.stopPropagation();
            const button = e.target.classList.contains('remove-btn') ? e.target : e.target.closest('.remove-btn');
            const productId = button?.dataset.id;
            if (productId) {
                removeFromCart(productId);
            }
        }
        // Botón aumentar cantidad
        if (e.target.classList.contains('increase-btn') || e.target.closest('.increase-btn')) {
            e.preventDefault();
            e.stopPropagation();
            const button = e.target.classList.contains('increase-btn') ? e.target : e.target.closest('.increase-btn');
            const productId = button?.dataset.id;
            if (productId) {
                increaseQuantity(productId);
            }
        }
        // Botón disminuir cantidad
        if (e.target.classList.contains('decrease-btn') || e.target.closest('.decrease-btn')) {
            e.preventDefault();
            e.stopPropagation();
            const button = e.target.classList.contains('decrease-btn') ? e.target : e.target.closest('.decrease-btn');
            const productId = button?.dataset.id;
            if (productId) {
                decreaseQuantity(productId);
            }
        }
        // Botón ver detalles
        if (e.target.classList.contains('view-details-btn') && !e.target.closest('.offer-card')) {
            const productId = e.target.dataset.id || e.target.closest('[data-id]')?.dataset.id;
            if (productId) {
                goToProductDetails(productId);
            }
        }
    });
    // --- Lógica para Animaciones al Hacer Scroll (Scroll Reveal) ---
    const intersectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.content-section').forEach(section => {
        intersectionObserver.observe(section);
    });
    // --- Renderizado Inicial ---
    if (productListHome) {
        renderProducts('all', productListHome, 6);
    }
    if (productListFull) {
        renderProducts('all', productListFull);
        // Aplicar filtrado automático si hay parámetro de categoría en la URL
        autoFilterByCategory();
    }
    renderCart();
    // --- Animación de Categorías ---
    const animateCategories = () => {
        const categoryCards = document.querySelectorAll('.category-card.detailed-card');
        const categoryObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, index * 200);
                }
            });
        }, { threshold: 0.1 });
        categoryCards.forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            categoryObserver.observe(card);
        });
    };
    // --- Animaciones Mejoradas para Productos ---
    const enhanceProductAnimations = () => {
        const productCards = document.querySelectorAll('.product-card');
        productCards.forEach(card => {
            // Agregar efecto de entrada suave
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            // Observar cuando la tarjeta es visible
            const cardObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setTimeout(() => {
                            entry.target.style.opacity = '1';
                            entry.target.style.transform = 'translateY(0)';
                        }, Math.random() * 300); // Delay aleatorio para efecto cascada
                    }
                });
            }, { threshold: 0.1 });
            cardObserver.observe(card);
            // Agregar efectos de hover mejorados
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-6px) scale(1.02)';
                card.style.boxShadow = '0 20px 40px rgba(46, 139, 87, 0.15)';
                card.style.borderColor = 'rgba(46, 139, 87, 0.3)';
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
                card.style.boxShadow = 'var(--shadow-soft)';
                card.style.borderColor = 'rgba(0, 0, 0, 0.05)';
            });
        });
    };
    // --- Animaciones para Imágenes de Productos ---
    const enhanceImageAnimations = () => {
        const productImages = document.querySelectorAll('.product-card img');
        productImages.forEach(img => {
            img.addEventListener('mouseenter', () => {
                img.style.transform = 'scale(1.05)';
                img.style.boxShadow = '0 8px 20px rgba(46, 139, 87, 0.1)';
            });
            img.addEventListener('mouseleave', () => {
                img.style.transform = 'scale(1)';
                img.style.boxShadow = 'none';
            });
        });
    };
    // --- Animaciones para Botones ---
    const enhanceButtonAnimations = () => {
        const buttons = document.querySelectorAll('.add-to-cart-btn');
        buttons.forEach(button => {
            button.addEventListener('mouseenter', () => {
                button.style.transform = 'translateY(-2px) scale(1.02)';
                button.style.boxShadow = '0 6px 20px rgba(46, 139, 87, 0.4)';
            });
            button.addEventListener('mouseleave', () => {
                button.style.transform = 'translateY(0) scale(1)';
                button.style.boxShadow = '0 2px 8px rgba(46, 139, 87, 0.3)';
            });
        });
    };
    // --- Actualizar Contadores de Productos por Categoría ---
    const updateCategoryProductCounts = () => {
        const categories = ['Frutas Frescas', 'Verduras Orgánicas', 'Productos Orgánicos', 'Productos Lácteos'];
        categories.forEach(category => {
            const productCount = products.filter(p => p.category === category).length;
            const countElements = document.querySelectorAll('.count-number');
            // Mapear categoría con su posición en el HTML
            const categoryIndex = {
                'Frutas Frescas': 0,
                'Verduras Orgánicas': 1,
                'Productos Orgánicos': 2,
                'Productos Lácteos': 3
            };
            if (countElements[categoryIndex[category]]) {
                countElements[categoryIndex[category]].textContent = productCount;
                // Actualizar texto singular/plural
                const parentDiv = countElements[categoryIndex[category]].parentElement;
                const textNode = parentDiv.childNodes[2]; // El nodo de texto después del span
                if (textNode && textNode.nodeType === Node.TEXT_NODE) {
                    textNode.textContent = productCount === 1 ? ' producto disponible' : ' productos disponibles';
                }
            }
        });
    };
    // --- Inicialización del Sistema de Búsqueda ---
    const initializeSearchSystem = () => {
        // Guardar productos en localStorage si no existen
        if (!loadProductsFromStorage()) {
            saveProductsToStorage(products);
        }
        // Obtener elementos de búsqueda
        const searchInputs = document.querySelectorAll('.search-bar input[type="text"]');
        const searchButtons = document.querySelectorAll('.search-bar');
        searchInputs.forEach(input => {
            // Crear contenedor de sugerencias si no existe
            if (!document.getElementById('search-suggestions')) {
                const suggestionsContainer = document.createElement('div');
                suggestionsContainer.id = 'search-suggestions';
                suggestionsContainer.className = 'search-suggestions';
                suggestionsContainer.style.cssText = `
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                    z-index: 1000;
                    display: none;
                    max-height: 300px;
                    overflow-y: auto;
                `;
                // Insertar después del input
                const searchBar = input.closest('.search-bar');
                if (searchBar) {
                    searchBar.style.position = 'relative';
                    searchBar.appendChild(suggestionsContainer);
                }
            }
            // Evento de búsqueda en tiempo real
            input.addEventListener('input', (e) => {
                const query = e.target.value;
                showSearchSuggestions(input, products);
            });
            // Evento de búsqueda al presionar Enter
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    window.performSearch(input.value);
                }
            });
            // Evento de click en sugerencias
            document.addEventListener('click', (e) => {
                if (e.target.closest('.search-suggestion')) {
                    const suggestion = e.target.closest('.search-suggestion');
                    const productId = suggestion.dataset.productId;
                    const product = products.find(p => p.id === productId);
                    if (product) {
                        // Ir directamente al producto específico usando URL amigable
                        const productUrl = window.productUrlMap[product.id];
                        if (productUrl) {
                            window.location.href = productUrl;
                        } else {
                            window.location.href = `producto-detalle.html?id=${product.id}`;
                        }
                    }
                }
            });
            // Ocultar sugerencias al hacer click fuera
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.search-bar')) {
                    const suggestions = document.getElementById('search-suggestions');
                    if (suggestions) {
                        suggestions.style.display = 'none';
                    }
                }
            });
        });
        // Función para realizar búsqueda (global)
        window.performSearch = (query) => {
            if (!query.trim()) return;
            // Guardar en historial
            saveSearchHistory(query);
            // Filtrar productos
            const filteredProducts = searchProducts(query, products);
            // Mostrar resultados
            displaySearchResults(filteredProducts, query);
            // Ocultar sugerencias
            const suggestions = document.getElementById('search-suggestions');
            if (suggestions) {
                suggestions.style.display = 'none';
            }
        };
        // Función para mostrar resultados de búsqueda
        const displaySearchResults = (filteredProducts, query) => {
            // Si hay exactamente 1 resultado, ir directamente al producto
            if (filteredProducts.length === 1) {
                const product = filteredProducts[0];
                const productUrl = window.productUrlMap[product.id];
                if (productUrl) {
                    window.location.href = productUrl;
                } else {
                    window.location.href = `producto-detalle.html?id=${product.id}`;
                }
                return;
            }
            // Si estamos en la página de productos, filtrar la vista
            if (window.location.pathname.includes('productos.html')) {
                const productGrid = document.getElementById('product-list-home');
                if (productGrid) {
                    if (filteredProducts.length === 0) {
                        productGrid.innerHTML = `
                            <div class="no-results" style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
                                <h3>No se encontraron productos para "${query}"</h3>
                                <p>Intenta con otros términos de búsqueda</p>
                            </div>
                        `;
                    } else {
                        renderSearchProducts(filteredProducts, productGrid);
                    }
                }
            } else {
                // Si estamos en otra página, redirigir a productos con filtro
                const searchParams = new URLSearchParams();
                searchParams.set('search', query);
                window.location.href = `productos.html?${searchParams.toString()}`;
            }
        };
        // Función para renderizar productos (usando la función principal)
        const renderSearchProducts = (productsToRender, container) => {
            if (!container) return;
            // Usar la función principal renderProducts
            container.innerHTML = productsToRender.map((product, index) => {
                const offerPrice = getOfferPrice(product.id);
                const originalPrice = getOriginalPrice(product.id);
                const isOnOffer = isProductOnOffer(product.id);
                const discountPercentage = isOnOffer ? Math.round((1 - offerPrice / originalPrice) * 100) : 0;
                const savings = isOnOffer ? (originalPrice - offerPrice) : 0;
                return `
                    <div class="product-card grid-card" style="--delay: ${index * 0.1}s">
                        ${isOnOffer ? `<div class="offer-badge">🔥 ${discountPercentage}% OFF</div>` : (product.popular ? '<div class="new-badge">Popular</div>' : '')}
                        <img src="${product.image}" alt="${product.name}">
                        <div class="product-info">
                            <h4>${product.name}</h4>
                            <div class="product-pricing">
                                <p class="price ${isOnOffer ? 'has-offer' : ''}">${formatPrice(offerPrice || product.price)}</p>
                                <span class="product-unit">${product.unit || 'por unidad'}</span>
                                ${isOnOffer ? `<span class="original-price">Antes: ${formatPrice(originalPrice)}</span>` : ''}
                                ${isOnOffer ? `<span class="savings-badge">💰 Ahorras $${formatPrice(savings)}</span>` : ''}
                            </div>
                            <div class="product-actions">
                                <button class="view-details-btn" data-id="${product.id}">
                                    <i class="fas fa-info-circle"></i> Ver Detalles
                                </button>
                                <button class="add-to-cart-btn" data-id="${product.id}">
                                    <i class="fas fa-shopping-cart"></i> Agregar al Carrito
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        };
    };
    // Inicializar animaciones de categorías
    animateCategories();
    // Inicializar animaciones mejoradas para productos
    enhanceProductAnimations();
    enhanceImageAnimations();
    enhanceButtonAnimations();
    // Actualizar contadores de productos por categoría
    updateCategoryProductCounts();
    // Inicializar sistema de búsqueda
    initializeSearchSystem();
    // Manejar búsquedas desde URL
    const handleURLSearch = () => {
        if (window.location.pathname.includes('productos.html')) {
            const urlParams = new URLSearchParams(window.location.search);
            const searchQuery = urlParams.get('search');
            if (searchQuery) {
                // Aplicar búsqueda automáticamente
                const searchInput = document.querySelector('.search-bar input[type="text"]');
                if (searchInput) {
                    searchInput.value = searchQuery;
                    window.performSearch(searchQuery);
                }
            }
        }
    };
    // Ejecutar búsqueda desde URL al cargar la página
    handleURLSearch();
    // Función para corregir controles del carrito con IDs hardcodeados
    const fixHardcodedCartControls = () => {
        // Buscar todos los controles del carrito que puedan tener IDs hardcodeados
        const cartControls = document.querySelectorAll('.cart-item-controls');
        cartControls.forEach(control => {
            const decreaseBtn = control.querySelector('.decrease-btn');
            const increaseBtn = control.querySelector('.increase-btn');
            const removeBtn = control.querySelector('.remove-btn');
            // Buscar el ID del producto en el contexto del item del carrito
            const cartItem = control.closest('.cart-item');
            if (cartItem) {
                const productName = cartItem.querySelector('.cart-item-name');
                if (productName) {
                    // Buscar el producto por nombre en la lista de productos
                    const product = products.find(p => p.name === productName.textContent.trim());
                    if (product) {
                        // Actualizar los data-id de los botones
                        if (decreaseBtn) {
                            decreaseBtn.dataset.id = product.id;
                        }
                        if (increaseBtn) {
                            increaseBtn.dataset.id = product.id;
                        }
                        if (removeBtn) {
                            removeBtn.dataset.id = product.id;
                        }
                    }
                }
            }
        });
    };
    // Ejecutar corrección de controles al cargar la página
    setTimeout(fixHardcodedCartControls, 1000);
    // También ejecutar cuando se actualice el carrito
    const originalRenderCart = renderCart;
    const enhancedRenderCart = function() {
        originalRenderCart.call(this);
        setTimeout(fixHardcodedCartControls, 100);
    };
    // Reemplazar la función original
    window.renderCart = enhancedRenderCart;
    // Función para asegurar que todos los controles del carrito funcionen
    const ensureCartControlsWork = () => {
        // Buscar todos los botones de control del carrito en toda la página
        const allDecreaseBtns = document.querySelectorAll('.decrease-btn');
        const allIncreaseBtns = document.querySelectorAll('.increase-btn');
        const allRemoveBtns = document.querySelectorAll('.remove-btn');
        // Función para corregir un botón específico
        const fixButton = (button, type) => {
            if (!button.dataset.id) {
                // Buscar el producto por contexto
                const cartItem = button.closest('.cart-item');
                if (cartItem) {
                    const productName = cartItem.querySelector('.cart-item-name, .item-name, h4, h3');
                    if (productName) {
                        const product = products.find(p => 
                            p.name === productName.textContent.trim() ||
                            productName.textContent.includes(p.name)
                        );
                        if (product) {
                            button.dataset.id = product.id;
                        }
                    }
                }
            }
        };
        // Corregir todos los botones
        allDecreaseBtns.forEach(btn => fixButton(btn, 'decrease-btn'));
        allIncreaseBtns.forEach(btn => fixButton(btn, 'increase-btn'));
        allRemoveBtns.forEach(btn => fixButton(btn, 'remove-btn'));
    };
    // Ejecutar la verificación periódicamente
    setInterval(ensureCartControlsWork, 2000);
    // También ejecutar cuando se detecten cambios en el DOM
    const cartObserver = new MutationObserver((mutations) => {
        let shouldCheck = false;
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList' && 
                (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0)) {
                shouldCheck = true;
            }
        });
        if (shouldCheck) {
            setTimeout(ensureCartControlsWork, 500);
        }
    });
    cartObserver.observe(document.body, {
        childList: true,
        subtree: true
    });
    // --- Funcionalidad para página de detalle de producto ---
    const loadProductDetail = () => {
        if (window.location.pathname.includes('producto-detalle.html')) {
            const urlParams = new URLSearchParams(window.location.search);
            const productId = urlParams.get('id');
            if (productId) {
                const product = products.find(p => p.id === productId);
                if (product) {
                    // Cargar datos del producto
                    document.getElementById('product-image').src = product.image;
                    document.getElementById('product-image').alt = product.name;
                    document.getElementById('product-name').textContent = product.name;
                    document.getElementById('product-price').textContent = `$${product.price.toLocaleString()} CLP`;
                    document.getElementById('product-description').textContent = product.description;
                    document.getElementById('product-origin').textContent = 'Valle del Maule, Chile';
                    document.getElementById('product-stock').textContent = `${product.stock} ${product.unit}`;
                    // Actualizar título de la página
                    document.title = `${product.name} - HuertoHogar`;
                    // Configurar botón de agregar al carrito
                    const addToCartBtn = document.getElementById('add-to-cart-detail');
                    if (addToCartBtn) {
                        addToCartBtn.addEventListener('click', () => {
                            // Usar la función unificada del carrito
                            if (typeof addToCart === 'function') {
                                addToCart(product);
                            } else {
                                // Fallback si la función no está disponible
                                alert(`¡${product.name} agregado al carrito!`);
                            }
                        });
                    }
                } else {
                    // Producto no encontrado
                    document.querySelector('.product-detail-layout').innerHTML = `
                        <div class="no-results" style="text-align: center; padding: 3rem;">
                            <h2>Producto no encontrado</h2>
                            <p>El producto que buscas no existe o ha sido eliminado.</p>
                            <a href="productos.html" class="btn btn-primary">Ver todos los productos</a>
                        </div>
                    `;
                }
            } else {
                // No se proporcionó ID de producto
                document.querySelector('.product-detail-layout').innerHTML = `
                    <div class="no-results" style="text-align: center; padding: 3rem;">
                        <h2>Producto no especificado</h2>
                        <p>No se ha especificado qué producto mostrar.</p>
                        <a href="productos.html" class="btn btn-primary">Ver todos los productos</a>
                    </div>
                `;
            }
        }
    };
    // Cargar detalle del producto al cargar la página
    loadProductDetail();
    // --- Sistema de Ofertas Especiales ---
    // Función para renderizar ofertas especiales
    const renderOffers = () => {
        const offersContainer = document.getElementById('offers-grid');
        if (!offersContainer) {
            // Reintentar después de un breve delay
            setTimeout(() => {
                const retryContainer = document.getElementById('offers-grid');
                if (retryContainer) {
                    renderOffers();
                }
            }, 100);
            return;
        }
        if (!specialOffers || specialOffers.length === 0) {
            offersContainer.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">No hay ofertas disponibles en este momento.</p>';
            return;
        }
        try {
            offersContainer.innerHTML = specialOffers.map((offer, index) => {
                return `
                    <div class="offer-card grid-card" style="--delay: ${index * 0.2}s; opacity: 1; transform: translateY(0px) scale(1); transition: 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94); box-shadow: var(--shadow-soft); border-color: rgba(0, 0, 0, 0.05);">
                        <div class="offer-badge">${offer.badge}</div>
                        <img src="${offer.image}" alt="${offer.name}" style="transform: scale(1); box-shadow: none;">
                        <div class="product-info">
                            <h4>${offer.name}</h4>
                            <div class="offer-pricing">
                                <p class="price">${formatPrice(offer.offerPrice)}</p>
                                <span class="offer-original-price">${formatPrice(offer.originalPrice)}</span>
                                <span class="offer-discount">-${offer.discount}%</span>
                            </div>
                            <div class="product-actions">
                                <button class="view-details-btn" data-id="${offer.id}">
                                    <i class="fas fa-info-circle"></i> Ver Detalles
                                </button>
                                <button class="add-to-cart-btn" data-id="${offer.id}">
                                    <i class="fas fa-shopping-cart"></i> Agregar al Carrito
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
            // Aplicar animaciones a las ofertas
            setTimeout(() => {
                const offerCards = document.querySelectorAll('.offer-card');
                offerCards.forEach(card => {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(30px)';
                    card.style.transition = 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                    const offerObserver = new IntersectionObserver((entries) => {
                        entries.forEach(entry => {
                            if (entry.isIntersecting) {
                                setTimeout(() => {
                                    entry.target.style.opacity = '1';
                                    entry.target.style.transform = 'translateY(0)';
                                }, Math.random() * 300);
                            }
                        });
                    }, { threshold: 0.1 });
                    offerObserver.observe(card);
                });
            }, 100);
        } catch (error) {
            offersContainer.innerHTML = '<p style="text-align: center; color: #e74c3c; padding: 2rem;">Error al cargar las ofertas. Por favor, recarga la página.</p>';
        }
    };
    // Función para agregar oferta al carrito
    const addOfferToCart = (offerId) => {
        const offer = specialOffers.find(o => o.id === offerId);
        if (!offer) return;
        // Convertir oferta a formato de producto normal
        const productToAdd = {
            ...offer,
            price: offer.offerPrice
        };
        const existingItem = cart.find(item => item.id === offerId);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ ...productToAdd, quantity: 1 });
        }
        renderCart();
        // Abrir el carrito automáticamente
        openCart();
        // Mostrar notificación
        showNotification(`${offer.name} agregado al carrito`, 'success');
    };
    const showOfferDetails = (offerId) => {
        goToProductDetails(offerId);
    };
    // Función para mostrar notificaciones mejorada
    const showNotification = (message, type = 'info') => {
        // Crear elemento de notificación
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        `;
        // Agregar al DOM
        document.body.appendChild(notification);
        // Mostrar con animación
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        // Remover después de 4 segundos (más tiempo para leer)
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    };
    function getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }
    // Hacer showNotification disponible globalmente
    window.showNotification = showNotification;
    // Event listeners para ofertas
    document.body.addEventListener('click', (e) => {
        // Botones de ofertas
        if (e.target.classList.contains('add-to-cart-btn') && e.target.closest('.offer-card')) {
            const offerId = e.target.dataset.id;
            addOfferToCart(offerId);
        } else if (e.target.classList.contains('view-details-btn') && e.target.closest('.offer-card')) {
            const offerId = e.target.dataset.id;
            showOfferDetails(offerId);
        }
        if (e.target.classList.contains('offer-view-btn')) {
            const offerId = e.target.dataset.id;
            goToProductDetails(offerId);
        }
    });
    // Variable para controlar si ya se inicializaron las ofertas
    let offersInitialized = false;
    // Función de inicialización de ofertas
    const initializeOffers = () => {
        // Evitar múltiples inicializaciones
        if (offersInitialized) {
            return;
        }
        // Verificar que el contenedor existe antes de proceder
        const offersContainer = document.getElementById('offers-grid');
        if (!offersContainer) {
            return;
        }
        if (specialOffers && specialOffers.length > 0) {
            renderOffers();
            offersInitialized = true;
        } else {
        }
    };
    // Inicializar ofertas cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeOffers);
    } else {
        initializeOffers();
    }
    // También intentar cuando se detecten cambios en el DOM
    const offersObserver = new MutationObserver((mutations) => {
        let shouldCheck = false;
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                shouldCheck = true;
            }
        });
        if (shouldCheck && !offersInitialized) {
            setTimeout(initializeOffers, 500);
        }
    });
    offersObserver.observe(document.body, {
        childList: true,
        subtree: true
    });
});
// Función global para inicializar el carrusel infinito de productos recomendados
function initializeCarousel(currentProductId) {
    const carouselWrapper = document.getElementById('carousel-wrapper');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const dotsContainer = document.getElementById('carousel-dots');
    if (!carouselWrapper || !prevBtn || !nextBtn || !dotsContainer) {
        return;
    }
    // Función para intentar inicializar el carrusel
    const tryInitializeCarousel = () => {
        // Obtener productos desde localStorage
        const storedProducts = localStorage.getItem('huertohogar_products');
        if (!storedProducts) {
            // Si no hay productos, esperar un poco y volver a intentar
            setTimeout(tryInitializeCarousel, 100);
            return;
        }
        const allProducts = JSON.parse(storedProducts);
        const currentProduct = allProducts.find(p => p.id === currentProductId);
        if (!currentProduct) {
            return;
        }
        // Continuar con la inicialización del carrusel
        initializeCarouselWithProducts(allProducts, currentProduct);
    };
    // Iniciar el proceso
    tryInitializeCarousel();
}
// Función auxiliar para inicializar el carrusel con los productos
function initializeCarouselWithProducts(allProducts, currentProduct) {
    const carouselWrapper = document.getElementById('carousel-wrapper');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const dotsContainer = document.getElementById('carousel-dots');
    // Filtrar productos relacionados (misma categoría o productos similares)
    const relatedProducts = allProducts.filter(product => 
        product.id !== currentProduct.id && 
        (product.category === currentProduct.category || 
         product.category === 'Productos Orgánicos' || 
         product.category === 'Frutas Frescas' ||
         product.category === 'Verduras Orgánicas')
    ).slice(0, 8); // Aumentar a 8 productos para el loop infinito
    if (relatedProducts.length === 0) {
        // Productos de prueba para debuggear
        const testProducts = [
            {
                id: 'TEST001',
                name: 'Producto de Prueba 1',
                price: 1000,
                image: 'https://via.placeholder.com/300x200?text=Producto+1',
                category: 'frutas'
            },
            {
                id: 'TEST002', 
                name: 'Producto de Prueba 2',
                price: 2000,
                image: 'https://via.placeholder.com/300x200?text=Producto+2',
                category: 'verduras'
            },
            {
                id: 'TEST003',
                name: 'Producto de Prueba 3', 
                price: 3000,
                image: 'https://via.placeholder.com/300x200?text=Producto+3',
                category: 'productos-organicos'
            }
        ];
        initializeCarouselWithProducts(testProducts, currentProduct);
        return;
    }
    // Configuración del carrusel infinito
    let currentIndex = 0;
    const itemsPerView = window.innerWidth <= 768 ? 2 : 3;
    const totalItems = relatedProducts.length;
    // Crear productos duplicados para carrusel CSS infinito
    const duplicatedProducts = [...relatedProducts, ...relatedProducts];
    // Función para obtener el nombre de la categoría
    function getCategoryName(category) {
        const categoryNames = {
            'Frutas Frescas': 'Frutas',
            'Verduras Orgánicas': 'Verduras',
            'Productos Orgánicos': 'Orgánico',
            'Productos Lácteos': 'Lácteos'
        };
        return categoryNames[category] || 'Producto';
    }
    // Función para generar rating aleatorio
    function generateRating() {
        const rating = (4.0 + Math.random() * 1.0).toFixed(1);
        const reviewCount = Math.floor(Math.random() * 50) + 10;
        return { rating, reviewCount };
    }
    // Renderizar productos en el carrusel
    function renderCarouselItems() {
        carouselWrapper.innerHTML = duplicatedProducts.map((product, index) => {
            const rating = generateRating();
            const offerPrice = getOfferPrice(product.id);
            const originalPrice = getOriginalPrice(product.id);
            const isOnOffer = isProductOnOffer(product.id);
            const discountPercentage = isOnOffer ? Math.round((1 - offerPrice / originalPrice) * 100) : 0;
            const savings = isOnOffer ? (originalPrice - offerPrice) : 0;
            return `
                <div class="carousel-item" data-index="${index}" onclick="window.location.href='${window.productUrlMap[product.id] || '#'}'">
                    <div class="category-badge">${getCategoryName(product.category)}</div>
                    ${isOnOffer ? `<div class="carousel-offer-badge">🔥 ${discountPercentage}% OFF</div>` : ''}
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                    <div class="carousel-item-content">
                        <h4>${product.name}</h4>
                        <div class="rating">
                            <div class="stars">
                                ${'★'.repeat(5)}
                            </div>
                            <span class="rating-text">(${rating.rating}) · ${rating.reviewCount} reseñas</span>
                        </div>
                        <div class="carousel-pricing">
                            <p class="price ${isOnOffer ? 'has-offer' : ''}">${formatPrice(offerPrice || product.price)}</p>
                            ${isOnOffer ? `<span class="original-price">Antes: ${formatPrice(originalPrice)}</span>` : ''}
                            ${isOnOffer ? `<span class="discount-badge">💥 -${discountPercentage}%</span>` : ''}
                            ${isOnOffer ? `<span class="savings-badge">💰 Ahorras $${formatPrice(savings)}</span>` : ''}
                        </div>
                        <button class="view-product-btn" onclick="event.stopPropagation(); window.location.href='${window.productUrlMap[product.id] || '#'}'">
                            <i class="fas fa-shopping-cart"></i> Ver Producto
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }
    // Renderizar puntos de navegación
    function renderDots() {
        dotsContainer.innerHTML = '';
        const totalSlides = Math.ceil(totalItems / itemsPerView);
        for (let i = 0; i < totalSlides; i++) {
            const dot = document.createElement('button');
            dot.className = `carousel-dot ${i === 0 ? 'active' : ''}`;
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
        }
    }
    // Ir a una slide específica optimizada
    function goToSlide(index) {
        currentIndex = index;
        const translateX = -currentIndex * itemWidth;
        carouselWrapper.style.transform = `translateX(${translateX}%)`;
        // Actualizar puntos activos
        document.querySelectorAll('.carousel-dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
        // Actualizar estado de botones
        prevBtn.disabled = false;
        nextBtn.disabled = false;
    }
    // Siguiente slide con loop infinito perfecto
    function nextSlide() {
        currentIndex++;
        const translateX = -currentIndex * itemWidth;
        carouselWrapper.style.transform = `translateX(${translateX}%)`;
        // Si llegamos al final de la primera copia, saltar al inicio de la segunda copia
        if (currentIndex >= totalItems) {
            setTimeout(() => {
                currentIndex = 0;
                carouselWrapper.style.transition = 'none';
                carouselWrapper.style.transform = 'translateX(0%)';
                carouselWrapper.offsetHeight; // Forzar reflow
                carouselWrapper.style.transition = 'transform 0.3s ease-out';
            }, 300);
        }
        updateDots();
    }
    // Slide anterior con loop infinito perfecto
    function prevSlide() {
        currentIndex--;
        const translateX = -currentIndex * itemWidth;
        carouselWrapper.style.transform = `translateX(${translateX}%)`;
        // Si llegamos antes del inicio, saltar al final de la primera copia
        if (currentIndex < 0) {
            currentIndex = totalItems - 1;
            setTimeout(() => {
                carouselWrapper.style.transition = 'none';
                carouselWrapper.style.transform = `translateX(-${currentIndex * itemWidth}%)`;
                carouselWrapper.offsetHeight; // Forzar reflow
                carouselWrapper.style.transition = 'transform 0.3s ease-out';
            }, 300);
        }
        updateDots();
    }
    // Actualizar puntos de navegación
    function updateDots() {
        const totalSlides = Math.ceil(totalItems / itemsPerView);
        const activeDot = currentIndex % totalSlides;
        document.querySelectorAll('.carousel-dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === activeDot);
        });
    }
    // Event listeners
    nextBtn.addEventListener('click', nextSlide);
    prevBtn.addEventListener('click', prevSlide);
    // Auto-play del carrusel infinito
    let autoPlayInterval;
    function startAutoPlay() {
        autoPlayInterval = setInterval(() => {
            nextSlide();
        }, 2500); // Cambiar cada 2.5 segundos
    }
    function stopAutoPlay() {
        if (autoPlayInterval) {
            clearInterval(autoPlayInterval);
        }
    }
    // Pausar auto-play al hacer hover
    carouselWrapper.addEventListener('mouseenter', stopAutoPlay);
    carouselWrapper.addEventListener('mouseleave', startAutoPlay);
    // Touch/swipe support para móviles
    let startX = 0;
    let isDragging = false;
    carouselWrapper.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        isDragging = true;
        stopAutoPlay();
    });
    carouselWrapper.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
    });
    carouselWrapper.addEventListener('touchend', (e) => {
        if (!isDragging) return;
        isDragging = false;
        const endX = e.changedTouches[0].clientX;
        const diff = startX - endX;
        if (Math.abs(diff) > 50) { // Mínimo swipe de 50px
            if (diff > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        }
        startAutoPlay();
    });
    // Inicializar carrusel
    renderCarouselItems();
    renderDots();
    goToSlide(0);
    startAutoPlay();
    // Responsive: recalcular en resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const newItemsPerView = window.innerWidth <= 768 ? 2 : 3;
            if (newItemsPerView !== itemsPerView) {
                location.reload(); // Recargar para recalcular
            }
        }, 250);
    });
}
// ========================================
// MODAL DE AUTENTICACIÓN
// ========================================
class AuthModal {
    constructor() {
        this.modal = document.getElementById('auth-modal');
        this.currentSection = 'welcome';
        this.isAuthenticated = false;
        this.user = null;
        this.loginEmail = null;
        this.init();
    }
    init() {
        this.bindEvents();
        this.checkExistingAuth();
    }
    bindEvents() {
        // Botones de navegación del modal
        document.getElementById('show-register')?.addEventListener('click', () => this.showSection('register'));
        document.getElementById('show-login')?.addEventListener('click', () => this.showSection('login-step1'));
        document.getElementById('back-to-welcome')?.addEventListener('click', () => this.showSection('welcome'));
        document.getElementById('back-to-welcome-login')?.addEventListener('click', () => this.showSection('welcome'));
        document.getElementById('guest-checkout')?.addEventListener('click', () => this.handleGuestCheckout());
        document.getElementById('auth-modal-close')?.addEventListener('click', () => this.closeModal());
        // Formularios
        document.getElementById('register-form')?.addEventListener('submit', (e) => this.handleRegister(e));
        document.getElementById('login-email-form')?.addEventListener('submit', (e) => this.handleLoginStep1(e));
        document.getElementById('login-password-form')?.addEventListener('submit', (e) => this.handleLoginStep2(e));
        // Event listeners para el flujo de login de dos pasos
        document.getElementById('switch-to-login')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showSection('login-step1');
        });
        document.getElementById('switch-to-register')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showSection('register');
        });
        document.getElementById('change-email-link')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showSection('login-step1');
        });
        // Toggle de visibilidad de contraseña
        document.getElementById('password-toggle')?.addEventListener('click', () => this.togglePasswordVisibility());
        // Validación en tiempo real
        this.setupRealTimeValidation();
        // Cerrar modal con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                this.closeModal();
            }
        });
        // Remover el event listener de click fuera del modal
        // El modal solo se cerrará con el botón X o la tecla ESC
    }
    setupRealTimeValidation() {
        // Validación en tiempo real para registro
        const registerInputs = ['register-email', 'register-phone', 'register-firstname', 'register-lastname', 'register-rut', 'register-password', 'register-confirm-password'];
        registerInputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('blur', () => this.validateField(inputId));
                input.addEventListener('input', () => this.clearFieldError(inputId));
            }
        });
        // Validación en tiempo real para login
        const loginInputs = ['login-email', 'login-password'];
        loginInputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('blur', () => this.validateField(inputId));
                input.addEventListener('input', () => this.clearFieldError(inputId));
            }
        });
    }
    openModal() {
        // Verificar si el usuario está autenticado
        this.checkAuthStatus();
        if (this.isAuthenticated) {
            this.proceedToCheckout();
            return;
        }
        // Verificar que el modal existe
        if (!this.modal) {
            return;
        }
        // Asegurar que el modal esté visible
        this.modal.style.display = 'flex';
        this.modal.style.visibility = 'visible';
        this.modal.style.opacity = '1';
        this.modal.classList.add('active');
        // Prevenir scroll del body
        document.body.style.overflow = 'hidden';
        document.body.classList.add('modal-open');
        // Mostrar la sección de bienvenida
        this.showSection('welcome');
        // Focus en el primer elemento interactivo
        setTimeout(() => {
            const firstButton = this.modal.querySelector('button:not(.close-btn)');
            if (firstButton) {
                firstButton.focus();
            } else {
            }
        }, 100);
    }
    closeModal() {
        // Ocultar con animación
        this.modal.classList.remove('active');
        // Restaurar scroll del body
        document.body.style.overflow = '';
        document.body.classList.remove('modal-open');
        // Ocultar completamente después de la animación
        setTimeout(() => {
            this.modal.style.display = 'none';
        }, 300);
        this.resetForms();
    }
    showSection(sectionName) {
        // Ocultar todas las secciones
        const sections = this.modal.querySelectorAll('.auth-section');
        sections.forEach(section => {
            section.classList.remove('active');
            section.style.display = 'none';
        });
        // Ocultar el contenido principal
        const mainBody = this.modal.querySelector('.auth-modal-body');
        const mainActions = this.modal.querySelector('.auth-actions');
        // Actualizar el título del header según la sección
        const titleElement = document.getElementById('auth-modal-title');
        if (titleElement) {
            switch(sectionName) {
                case 'welcome':
                    titleElement.textContent = 'Inicia sesión o regístrate';
                    break;
                case 'register':
                    titleElement.textContent = 'Crear cuenta';
                    break;
                case 'login-step1':
                    titleElement.textContent = 'Iniciar sesión';
                    break;
                case 'login-step2':
                    titleElement.textContent = 'Iniciar sesión';
                    break;
                default:
                    titleElement.textContent = 'Inicia sesión o regístrate';
            }
        }
        if (sectionName === 'welcome') {
            // Mostrar contenido principal
            if (mainBody) mainBody.style.display = 'block';
            if (mainActions) mainActions.style.display = 'flex';
            this.currentSection = sectionName;
        } else {
            // Ocultar contenido principal y mostrar formulario
            if (mainBody) mainBody.style.display = 'none';
            if (mainActions) mainActions.style.display = 'none';
            const targetSection = document.getElementById(`auth-${sectionName}`);
            if (targetSection) {
                targetSection.style.display = 'block';
                targetSection.classList.add('active');
                this.currentSection = sectionName;
                // Focus en el primer input de la sección
                setTimeout(() => {
                    const firstInput = targetSection.querySelector('input');
                    firstInput?.focus();
                }, 100);
            }
        }
    }
    validateField(fieldId) {
        const input = document.getElementById(fieldId);
        const errorElement = document.getElementById(`${fieldId}-error`);
        if (!input || !errorElement) return true;
        let isValid = true;
        let errorMessage = '';
        const value = input.value.trim();
        switch (fieldId) {
            case 'register-firstname':
                if (!value) {
                    errorMessage = 'El nombre es requerido';
                    isValid = false;
                } else if (value.length < 2) {
                    errorMessage = 'El nombre debe tener al menos 2 caracteres';
                    isValid = false;
                }
                break;
            case 'register-lastname':
                if (!value) {
                    errorMessage = 'El apellido es requerido';
                    isValid = false;
                } else if (value.length < 2) {
                    errorMessage = 'El apellido debe tener al menos 2 caracteres';
                    isValid = false;
                }
                break;
            case 'register-phone':
                if (!value) {
                    errorMessage = 'El teléfono es requerido';
                    isValid = false;
                } else if (!/^[0-9]{8,9}$/.test(value)) {
                    errorMessage = 'Ingresa un teléfono válido (8-9 dígitos)';
                    isValid = false;
                }
                break;
            case 'register-rut':
                if (!value) {
                    errorMessage = 'El RUT es requerido';
                    isValid = false;
                } else if (!this.isValidRUT(value)) {
                    errorMessage = 'Ingresa un RUT válido (ej: 12345678-9)';
                    isValid = false;
                }
                break;
            case 'register-email':
            case 'login-email':
                if (!value) {
                    errorMessage = 'El correo electrónico es requerido';
                    isValid = false;
                } else if (!this.isValidEmail(value)) {
                    errorMessage = 'Ingresa un correo electrónico válido';
                    isValid = false;
                }
                break;
            case 'register-password':
                if (!value) {
                    errorMessage = 'La contraseña es requerida';
                    isValid = false;
                } else if (value.length < 6) {
                    errorMessage = 'La contraseña debe tener al menos 6 caracteres';
                    isValid = false;
                }
                break;
            case 'register-confirm-password':
                const password = document.getElementById('register-password')?.value;
                if (!value) {
                    errorMessage = 'Confirma tu contraseña';
                    isValid = false;
                } else if (value !== password) {
                    errorMessage = 'Las contraseñas no coinciden';
                    isValid = false;
                }
                break;
            case 'login-password':
                if (!value) {
                    errorMessage = 'La contraseña es requerida';
                    isValid = false;
                }
                break;
        }
        this.showFieldError(fieldId, errorMessage, isValid);
        return isValid;
    }
    clearFieldError(fieldId) {
        const input = document.getElementById(fieldId);
        const errorElement = document.getElementById(`${fieldId}-error`);
        if (input) input.classList.remove('error');
        if (errorElement) {
            errorElement.classList.remove('show');
            errorElement.textContent = '';
        }
    }
    showFieldError(fieldId, message, isValid) {
        const input = document.getElementById(fieldId);
        const errorElement = document.getElementById(`${fieldId}-error`);
        if (input) {
            input.classList.toggle('error', !isValid);
        }
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.toggle('show', !isValid);
        }
    }
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    isValidRUT(rut) {
        // Limpiar el RUT
        rut = rut.replace(/[^0-9kK]/g, '');
        if (rut.length < 8 || rut.length > 9) return false;
        const body = rut.slice(0, -1);
        const dv = rut.slice(-1).toUpperCase();
        // Calcular dígito verificador
        let sum = 0;
        let multiplier = 2;
        for (let i = body.length - 1; i >= 0; i--) {
            sum += parseInt(body[i]) * multiplier;
            multiplier = multiplier === 7 ? 2 : multiplier + 1;
        }
        const remainder = sum % 11;
        const calculatedDV = remainder === 0 ? '0' : remainder === 1 ? 'K' : (11 - remainder).toString();
        return dv === calculatedDV;
    }
    validateForm(formType) {
        let isValid = true;
        if (formType === 'register') {
            const fields = ['register-email', 'register-phone', 'register-firstname', 'register-lastname', 'register-rut', 'register-password', 'register-confirm-password'];
            fields.forEach(fieldId => {
                if (!this.validateField(fieldId)) {
                    isValid = false;
                }
            });
            // Validar términos y condiciones
            const termsCheckbox = document.getElementById('register-terms');
            if (!termsCheckbox?.checked) {
                this.showFieldError('register-terms', 'Debes aceptar los términos y condiciones', false);
                isValid = false;
            }
        } else if (formType === 'login') {
            const fields = ['login-email', 'login-password'];
            fields.forEach(fieldId => {
                if (!this.validateField(fieldId)) {
                    isValid = false;
                }
            });
        }
        return isValid;
    }
    async handleRegister(e) {
        e.preventDefault();
        if (!this.validateForm('register')) {
            return;
        }
        const formData = new FormData(e.target);
        const userData = {
            firstname: formData.get('firstname'),
            lastname: formData.get('lastname'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            countryCode: formData.get('countryCode'),
            rut: formData.get('rut'),
            password: formData.get('password')
        };
        this.setLoadingState('register-submit', true);
        try {
            // Simular llamada a API
            await this.simulateApiCall(2000);
            // Simular éxito
            this.user = userData;
            this.isAuthenticated = true;
            this.showSuccessMessage('¡Cuenta creada exitosamente!');
            setTimeout(() => {
                this.closeModal();
                this.proceedToCheckout();
            }, 1500);
        } catch (error) {
            this.showErrorMessage('Error al crear la cuenta. Inténtalo de nuevo.');
        } finally {
            this.setLoadingState('register-submit', false);
        }
    }
    async handleLogin(e) {
        e.preventDefault();
        if (!this.validateForm('login')) {
            return;
        }
        const formData = new FormData(e.target);
        const loginData = {
            email: formData.get('email'),
            password: formData.get('password'),
            remember: formData.get('remember') === 'on'
        };
        this.setLoadingState('login-submit', true);
        try {
            // Simular llamada a API
            await this.simulateApiCall(1500);
            // Simular éxito
            this.user = { name: 'Usuario', email: loginData.email };
            this.isAuthenticated = true;
            this.showSuccessMessage('¡Bienvenido de vuelta!');
            setTimeout(() => {
                this.closeModal();
                this.proceedToCheckout();
            }, 1500);
        } catch (error) {
            this.showErrorMessage('Credenciales incorrectas. Inténtalo de nuevo.');
        } finally {
            this.setLoadingState('login-submit', false);
        }
    }
    // Nuevo método para el paso 1 del login (ingreso de email)
    async handleLoginStep1(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        if (!email) {
            this.showErrorMessage('Por favor ingresa tu correo electrónico');
            return;
        }
        if (!this.isValidEmail(email)) {
            this.showErrorMessage('Por favor ingresa un correo electrónico válido');
            return;
        }
        this.setLoadingState('login-continue', true);
        try {
            // Simular verificación de email
            await this.simulateApiCall(1000);
            // Guardar el email para el paso 2
            this.loginEmail = email;
            // Actualizar el mensaje de bienvenida con el nombre del usuario
            const welcomeMessage = document.getElementById('login-welcome-message');
            if (welcomeMessage) {
                const userName = this.extractUserNameFromEmail(email);
                welcomeMessage.textContent = `Es un gusto tenerte de vuelta, ${userName}`;
            }
            // Pasar al paso 2
            this.showSection('login-step2');
            // Poblar el campo de email en el paso 2
            const emailDisplay = document.getElementById('login-email-display');
            if (emailDisplay) {
                emailDisplay.value = email;
            }
        } catch (error) {
            this.showErrorMessage('Error al verificar el correo. Inténtalo de nuevo.');
        } finally {
            this.setLoadingState('login-continue', false);
        }
    }
    // Nuevo método para el paso 2 del login (ingreso de contraseña)
    async handleLoginStep2(e) {
        e.preventDefault();
        const password = document.getElementById('login-password').value;
        if (!password) {
            this.showErrorMessage('Por favor ingresa tu contraseña');
            return;
        }
        this.setLoadingState('login-submit', true);
        try {
            // Simular llamada a API
            await this.simulateApiCall(1500);
            // Simular éxito
            this.user = { 
                name: this.extractUserNameFromEmail(this.loginEmail), 
                email: this.loginEmail 
            };
            this.isAuthenticated = true;
            this.showSuccessMessage('¡Bienvenido de vuelta!');
            setTimeout(() => {
                this.closeModal();
                this.proceedToCheckout();
            }, 1500);
        } catch (error) {
            this.showErrorMessage('Contraseña incorrecta. Inténtalo de nuevo.');
        } finally {
            this.setLoadingState('login-submit', false);
        }
    }
    // Método para extraer nombre de usuario del email
    extractUserNameFromEmail(email) {
        const name = email.split('@')[0];
        return name.charAt(0).toUpperCase() + name.slice(1);
    }
    // Método para validar email
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    // Método para toggle de visibilidad de contraseña
    togglePasswordVisibility() {
        const passwordInput = document.getElementById('login-password');
        const toggleIcon = document.getElementById('password-toggle');
        if (passwordInput && toggleIcon) {
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                toggleIcon.innerHTML = `
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" height="24" width="24">
                        <path fill="#485760" fill-rule="evenodd" clip-rule="evenodd" d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"></path>
                    </svg>
                `;
            } else {
                passwordInput.type = 'password';
                toggleIcon.innerHTML = `
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" height="24" width="24">
                        <path fill="#485760" fill-rule="evenodd" clip-rule="evenodd" d="M12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8ZM10 12C10 10.8954 10.8954 10 12 10C13.1046 10 14 10.8954 14 12C14 13.1046 13.1046 14 12 14C10.8954 14 10 13.1046 10 12Z"></path>
                        <path fill="#485760" fill-rule="evenodd" clip-rule="evenodd" d="M12 4C8.68793 4 6.31245 5.39172 4.71551 7.05809C3.14259 8.6994 2.31647 10.611 2.02986 11.7575C1.99005 11.9167 1.99005 12.0833 2.02986 12.2425C2.31647 13.389 3.14259 15.3006 4.71551 16.9419C6.31245 18.6083 8.68793 20 12 20C15.3121 20 17.6875 18.6083 19.2845 16.9419C20.8574 15.3006 21.6835 13.389 21.9701 12.2425C22.01 12.0833 22.01 11.9167 21.9701 11.7575C21.6835 10.611 20.8574 8.6994 19.2845 7.05809C17.6875 5.39172 15.3121 4 12 4ZM6.15949 15.5581C4.97234 14.3193 4.30739 12.8896 4.03753 12C4.30739 11.1104 4.97234 9.68067 6.15949 8.44191C7.43755 7.10828 9.31207 6 12 6C14.6879 6 16.5625 7.10828 17.8405 8.44191C19.0277 9.68067 19.6926 11.1104 19.9625 12C19.6926 12.8896 19.0277 14.3193 17.8405 15.5581C16.5625 16.8917 14.6879 18 12 18C9.31207 18 7.43755 16.8917 6.15949 15.5581Z"></path>
                    </svg>
                `;
            }
        }
    }
    handleGuestCheckout() {
        this.closeModal();
        this.proceedToCheckout();
    }
    setLoadingState(buttonId, isLoading) {
        const button = document.getElementById(buttonId);
        if (!button) return;
        if (isLoading) {
            button.classList.add('loading');
            button.disabled = true;
        } else {
            button.classList.remove('loading');
            button.disabled = false;
        }
    }
    showSuccessMessage(message) {
        this.showMessage(message, 'success');
    }
    showErrorMessage(message) {
        this.showMessage(message, 'error');
    }
    showMessage(message, type) {
        // Crear elemento de mensaje temporal
        const messageEl = document.createElement('div');
        messageEl.className = `auth-message auth-message-${type}`;
        messageEl.textContent = message;
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#2e8b57' : '#e74c3c'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10001;
            animation: slideInRight 0.3s ease-out;
        `;
        document.body.appendChild(messageEl);
        // Remover después de 3 segundos
        setTimeout(() => {
            messageEl.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => messageEl.remove(), 300);
        }, 3000);
    }
    simulateApiCall(delay) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simular 90% de éxito
                if (Math.random() > 0.1) {
                    resolve();
                } else {
                    reject(new Error('API Error'));
                }
            }, delay);
        });
    }
    resetForms() {
        // Limpiar formularios
        document.getElementById('register-form')?.reset();
        document.getElementById('login-form')?.reset();
        // Limpiar errores
        const errorElements = this.modal.querySelectorAll('.error-message');
        errorElements.forEach(el => {
            el.classList.remove('show');
            el.textContent = '';
        });
        const errorInputs = this.modal.querySelectorAll('.error');
        errorInputs.forEach(input => input.classList.remove('error'));
        // Volver a la vista principal
        this.showSection('welcome');
    }
    checkExistingAuth() {
        // Verificar si hay autenticación guardada en localStorage
        const savedAuth = localStorage.getItem('huertoHogarAuth');
        if (savedAuth) {
            try {
                const authData = JSON.parse(savedAuth);
                this.user = authData.user;
                this.isAuthenticated = authData.isAuthenticated;
            } catch (error) {
            }
        }
    }
    checkAuthStatus() {
        this.checkExistingAuth();
        return this.isAuthenticated;
    }
    saveAuth() {
        const authData = {
            user: this.user,
            isAuthenticated: this.isAuthenticated,
            timestamp: Date.now()
        };
        localStorage.setItem('huertoHogarAuth', JSON.stringify(authData));
    }
    proceedToCheckout() {
        if (this.isAuthenticated) {
            this.saveAuth();
        } else {
        }
        // Aquí se integraría con el sistema de checkout real
        // Por ahora, mostramos un mensaje
        this.showSuccessMessage('Redirigiendo al checkout...');
        // Redirigir al checkout
        setTimeout(() => {
            window.location.href = 'pago.html';
        }, 1000);
    }
    isUserAuthenticated() {
        return this.isAuthenticated;
    }
    getCurrentUser() {
        return this.user;
    }
    logout() {
        this.isAuthenticated = false;
        this.user = null;
        // Verificar si es una sesión de administrador antes de limpiar
        const isAdmin = localStorage.getItem('huertohogar_is_admin') === 'true';
        const userRole = localStorage.getItem('huertohogar_user_role');
        if (isAdmin && userRole === 'admin') {
        } else {
            localStorage.removeItem('huertoHogarAuth');
        }
    }
}
// Inicializar modal cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // No inicializar el modal de autenticación en la página de checkout
    // ya que tiene su propio sistema de autenticación
    if (window.location.pathname.includes('pago.html')) {
        return;
    }
    // Verificar que el modal existe antes de inicializarlo
    const modalElement = document.getElementById('auth-modal');
    if (modalElement) {
        try {
            window.authModal = new AuthModal();
        } catch (error) {
        }
    } else {
    }
    // Integrar con el botón de checkout existente
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // Verificar si el modal existe
            if (window.authModal) {
                // Verificar estado de autenticación antes de abrir modal
                window.authModal.checkAuthStatus();
                if (window.authModal.isAuthenticated) {
                    window.authModal.proceedToCheckout();
                } else {
                    window.authModal.openModal();
                }
            } else {
                // Redirigir directamente a checkout si no hay modal
                window.location.href = 'pago.html';
            }
        });
    } else {
    }
    // Función de respaldo para checkout directo
    window.goToCheckout = () => {
        window.location.href = 'pago.html';
    };
});
// Agregar estilos para animaciones de mensajes
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
`;
document.head.appendChild(style);
// ===========================================
// MODAL DE OLVIDÉ MI CONTRASEÑA
// ===========================================
class ForgotPasswordModal {
    constructor() {
        this.modal = document.getElementById('forgot-password-modal');
        this.init();
    }
    init() {
        this.bindEvents();
    }
    bindEvents() {
        // Botón de cerrar
        document.getElementById('forgot-password-modal-close')?.addEventListener('click', () => this.closeModal());
        // Cerrar modal con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal && this.modal.style.display !== 'none') {
                this.closeModal();
            }
        });
    }
    setupRealTimeValidation() {
        const inputs = ['new-password', 'confirm-password'];
        inputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('blur', () => this.validateField(inputId));
                input.addEventListener('input', () => this.clearFieldError(inputId));
            }
        });
    }
    openModal() {
        if (this.modal) {
            this.modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            // Configurar event listeners cuando el modal se abre
            this.setupModalEvents();
            // Verificar que los elementos existen
            this.debugElements();
        }
    }
    debugElements() {
    }
    setupModalEvents() {
        // Formulario
        const form = document.getElementById('forgot-password-form');
        if (form && !form.hasAttribute('data-listener-added')) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
            form.setAttribute('data-listener-added', 'true');
        }
        // Toggle de visibilidad de contraseñas - Configurar directamente
        this.setupPasswordToggles();
        // Validación en tiempo real
        this.setupRealTimeValidation();
    }
    setupPasswordToggles() {
        // Configurar toggle para nueva contraseña
        const newPasswordToggle = document.getElementById('new-password-toggle');
        if (newPasswordToggle) {
            // Agregar event listener directamente
            newPasswordToggle.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.togglePasswordVisibility('new-password');
            };
            // También agregar con addEventListener como respaldo
            newPasswordToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.togglePasswordVisibility('new-password');
            });
        } else {
        }
        // Configurar toggle para confirmar contraseña
        const confirmPasswordToggle = document.getElementById('confirm-password-toggle');
        if (confirmPasswordToggle) {
            // Agregar event listener directamente
            confirmPasswordToggle.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.togglePasswordVisibility('confirm-password');
            };
            // También agregar con addEventListener como respaldo
            confirmPasswordToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.togglePasswordVisibility('confirm-password');
            });
        } else {
        }
    }
    closeModal() {
        if (this.modal) {
            this.modal.style.display = 'none';
            document.body.style.overflow = '';
            this.resetForm();
        }
    }
    async handleSubmit(e) {
        e.preventDefault();
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        // Validar campos
        if (!this.validatePassword(newPassword)) {
            this.showErrorMessage('new-password-error', 'La contraseña debe tener al menos 8 caracteres');
            return;
        }
        if (newPassword !== confirmPassword) {
            this.showErrorMessage('confirm-password-error', 'Las contraseñas no coinciden');
            return;
        }
        // Mostrar estado de carga
        this.setLoadingState(true);
        try {
            // Simular llamada a API
            await this.simulateApiCall(2000);
            // Mostrar mensaje de éxito
            this.showSuccessMessage();
            // Cerrar modal después de 2 segundos y abrir verificación
            setTimeout(() => {
                this.closeModal();
                // Abrir modal de verificación con el email del usuario
                const userEmail = this.getUserEmail();
                if (window.openVerificationModal) {
                    window.openVerificationModal(userEmail);
                }
            }, 2000);
        } catch (error) {
            this.showErrorMessage('new-password-error', 'Error al crear la nueva contraseña. Inténtalo de nuevo.');
        } finally {
            this.setLoadingState(false);
        }
    }
    validatePassword(password) {
        return password && password.length >= 8;
    }
    validateField(fieldId) {
        const input = document.getElementById(fieldId);
        const value = input.value.trim();
        if (fieldId === 'new-password') {
            if (!this.validatePassword(value)) {
                this.showErrorMessage('new-password-error', 'La contraseña debe tener al menos 8 caracteres');
                return false;
            }
        } else if (fieldId === 'confirm-password') {
            const newPassword = document.getElementById('new-password').value;
            if (value && value !== newPassword) {
                this.showErrorMessage('confirm-password-error', 'Las contraseñas no coinciden');
                return false;
            }
        }
        this.clearFieldError(fieldId);
        return true;
    }
    clearFieldError(fieldId) {
        const errorElement = document.getElementById(fieldId + '-error');
        if (errorElement) {
            errorElement.textContent = '';
        }
    }
    showErrorMessage(elementId, message) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
        }
    }
    showSuccessMessage() {
        // Crear mensaje de éxito temporal
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.innerHTML = `
            <div style="
                background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
                color: white;
                padding: 16px 24px;
                border-radius: 8px;
                text-align: center;
                font-weight: 600;
                margin-bottom: 20px;
                animation: slideInDown 0.3s ease;
            ">
                <i class="fas fa-check-circle" style="margin-right: 8px;"></i>
                ¡Contraseña creada exitosamente!
            </div>
        `;
        const form = document.getElementById('forgot-password-form');
        form.parentNode.insertBefore(successMessage, form);
        // Remover mensaje después de 3 segundos
        setTimeout(() => {
            if (successMessage.parentNode) {
                successMessage.parentNode.removeChild(successMessage);
            }
        }, 3000);
    }
    setLoadingState(loading) {
        const button = document.getElementById('create-password-submit');
        if (button) {
            if (loading) {
                button.classList.add('loading');
                button.disabled = true;
            } else {
                button.classList.remove('loading');
                button.disabled = false;
            }
        }
    }
    togglePasswordVisibility(fieldId) {
        const input = document.getElementById(fieldId);
        const toggle = document.getElementById(fieldId + '-toggle');
        if (input && toggle) {
            if (input.type === 'password') {
                input.type = 'text';
                toggle.innerHTML = `
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" height="20" width="20">
                        <path fill="#485760" fill-rule="evenodd" clip-rule="evenodd" d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"></path>
                    </svg>
                `;
            } else {
                input.type = 'password';
                toggle.innerHTML = `
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" height="20" width="20">
                        <path fill="#485760" fill-rule="evenodd" clip-rule="evenodd" d="M12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8ZM10 12C10 10.8954 10.8954 10 12 10C13.1046 10 14 10.8954 14 12C14 13.1046 13.1046 14 12 14C10.8954 14 10 13.1046 10 12Z"></path>
                        <path fill="#485760" fill-rule="evenodd" clip-rule="evenodd" d="M12 4C8.68793 4 6.31245 5.39172 4.71551 7.05809C3.14259 8.6994 2.31647 10.611 2.02986 11.7575C1.99005 11.9167 1.99005 12.0833 2.02986 12.2425C2.31647 13.389 3.14259 15.3006 4.71551 16.9419C6.31245 18.6083 8.68793 20 12 20C15.3121 20 17.6875 18.6083 19.2845 16.9419C20.8574 15.3006 21.6835 13.389 21.9701 12.2425C22.01 12.0833 22.01 11.9167 21.9701 11.7575C21.6835 10.611 20.8574 8.6994 19.2845 7.05809C17.6875 5.39172 15.3121 4 12 4ZM6.15949 15.5581C4.97234 14.3193 4.30739 12.8896 4.03753 12C4.30739 11.1104 4.97234 9.68067 6.15949 8.44191C7.43755 7.10828 9.31207 6 12 6C14.6879 6 16.5625 7.10828 17.8405 8.44191C19.0277 9.68067 19.6926 11.1104 19.9625 12C19.6926 12.8896 19.0277 14.3193 17.8405 15.5581C16.5625 16.8917 14.6879 18 12 18C9.31207 18 7.43755 16.8917 6.15949 15.5581Z"></path>
                    </svg>
                `;
            }
        } else {
        }
    }
    resetForm() {
        const form = document.getElementById('forgot-password-form');
        if (form) {
            form.reset();
        }
        // Limpiar mensajes de error
        this.clearFieldError('new-password');
        this.clearFieldError('confirm-password');
    }
    getUserEmail() {
        // Obtener el email del usuario desde el modal de login
        const loginEmail = document.getElementById('login-email-display');
        if (loginEmail && loginEmail.value) {
            return loginEmail.value;
        }
        // Fallback: usar el email del usuario autenticado si existe
        if (window.authModal && window.authModal.loginEmail) {
            return window.authModal.loginEmail;
        }
        // Fallback por defecto
        return 'usuario@ejemplo.com';
    }
    async simulateApiCall(delay) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simular éxito en el 90% de los casos
                if (Math.random() > 0.1) {
                    resolve();
                } else {
                    reject(new Error('API Error'));
                }
            }, delay);
        });
    }
}
// Inicializar el modal de olvidé mi contraseña
document.addEventListener('DOMContentLoaded', () => {
    const forgotPasswordModalElement = document.getElementById('forgot-password-modal');
    if (forgotPasswordModalElement) {
        try {
            window.forgotPasswordModal = new ForgotPasswordModal();
        } catch (error) {
        }
    } else {
    }
});
// Función global para abrir el modal de olvidé mi contraseña
window.openForgotPasswordModal = () => {
    if (window.forgotPasswordModal) {
        window.forgotPasswordModal.openModal();
    }
};
// ===========================================
// MODAL DE VERIFICACIÓN DE CUENTA
// ===========================================
class VerificationModal {
    constructor() {
        this.modal = document.getElementById('verification-modal');
        this.countdownInterval = null;
        this.timeLeft = 300; // 5 minutos en segundos
        this.init();
    }
    init() {
        this.bindEvents();
    }
    bindEvents() {
        // Botón de cerrar
        document.getElementById('verification-modal-close')?.addEventListener('click', () => this.closeModal());
        // Formulario
        document.getElementById('verification-form')?.addEventListener('submit', (e) => this.handleSubmit(e));
        // Inputs de código
        this.setupCodeInputs();
        // Cerrar modal con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal && this.modal.style.display !== 'none') {
                this.closeModal();
            }
        });
    }
    setupCodeInputs() {
        const codeInputs = document.querySelectorAll('.code-input');
        codeInputs.forEach((input, index) => {
            // Solo permitir números
            input.addEventListener('input', (e) => {
                const value = e.target.value;
                if (!/^\d*$/.test(value)) {
                    e.target.value = value.replace(/\D/g, '');
                }
                // Auto-avanzar al siguiente input
                if (value && index < codeInputs.length - 1) {
                    codeInputs[index + 1].focus();
                }
                // Actualizar estado visual
                this.updateInputState(input);
            });
            // Manejar teclas especiales
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && !input.value && index > 0) {
                    codeInputs[index - 1].focus();
                }
                if (e.key === 'ArrowLeft' && index > 0) {
                    codeInputs[index - 1].focus();
                }
                if (e.key === 'ArrowRight' && index < codeInputs.length - 1) {
                    codeInputs[index + 1].focus();
                }
            });
            // Pegar código completo
            input.addEventListener('paste', (e) => {
                e.preventDefault();
                const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');
                if (pastedData.length === 6) {
                    for (let i = 0; i < 6; i++) {
                        codeInputs[i].value = pastedData[i];
                        this.updateInputState(codeInputs[i]);
                    }
                    codeInputs[5].focus();
                }
            });
        });
    }
    updateInputState(input) {
        input.classList.remove('filled', 'error');
        if (input.value) {
            input.classList.add('filled');
        }
    }
    openModal(email = 'usuario@ejemplo.com') {
        if (this.modal) {
            // Actualizar email en el modal
            const emailElement = document.getElementById('verification-email');
            if (emailElement) {
                emailElement.textContent = email;
            }
            this.modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            // Iniciar countdown
            this.startCountdown();
            // Limpiar inputs
            this.clearCodeInputs();
        }
    }
    closeModal() {
        if (this.modal) {
            this.modal.style.display = 'none';
            document.body.style.overflow = '';
            this.stopCountdown();
            this.clearCodeInputs();
        }
    }
    async handleSubmit(e) {
        e.preventDefault();
        const codeInputs = document.querySelectorAll('.code-input');
        const code = Array.from(codeInputs).map(input => input.value).join('');
        // Validar que todos los campos estén llenos
        if (code.length !== 6) {
            this.showError('Por favor ingresa el código completo de 6 dígitos');
            return;
        }
        // Mostrar estado de carga
        this.setLoadingState(true);
        try {
            // Simular llamada a API
            await this.simulateApiCall(2000);
            // Mostrar mensaje de éxito
            this.showSuccess('¡Código verificado correctamente!');
            // Cerrar modal después de 2 segundos
            setTimeout(() => {
                this.closeModal();
                // Aquí podrías redirigir o hacer otras acciones
            }, 2000);
        } catch (error) {
            this.showError('Código incorrecto. Inténtalo de nuevo.');
            this.clearCodeInputs();
        } finally {
            this.setLoadingState(false);
        }
    }
    startCountdown() {
        this.timeLeft = 300; // 5 minutos
        this.updateCountdownDisplay();
        this.countdownInterval = setInterval(() => {
            this.timeLeft--;
            this.updateCountdownDisplay();
            if (this.timeLeft <= 0) {
                this.stopCountdown();
            }
        }, 1000);
    }
    stopCountdown() {
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }
    }
    updateCountdownDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        const display = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        const timerElement = document.getElementById('countdown-timer');
        if (timerElement) {
            timerElement.textContent = display;
        }
    }
    clearCodeInputs() {
        const codeInputs = document.querySelectorAll('.code-input');
        codeInputs.forEach(input => {
            input.value = '';
            input.classList.remove('filled', 'error');
        });
        codeInputs[0].focus();
    }
    showError(message) {
        this.clearMessages();
        const errorElement = document.createElement('div');
        errorElement.className = 'verification-error';
        errorElement.textContent = message;
        const form = document.getElementById('verification-form');
        form.appendChild(errorElement);
        // Resaltar inputs con error
        const codeInputs = document.querySelectorAll('.code-input');
        codeInputs.forEach(input => {
            input.classList.add('error');
        });
    }
    showSuccess(message) {
        this.clearMessages();
        const successElement = document.createElement('div');
        successElement.className = 'verification-success';
        successElement.textContent = message;
        const form = document.getElementById('verification-form');
        form.appendChild(successElement);
    }
    clearMessages() {
        const existingError = document.querySelector('.verification-error');
        const existingSuccess = document.querySelector('.verification-success');
        if (existingError) existingError.remove();
        if (existingSuccess) existingSuccess.remove();
    }
    setLoadingState(loading) {
        const button = document.getElementById('validate-code-submit');
        if (button) {
            if (loading) {
                button.classList.add('loading');
                button.disabled = true;
            } else {
                button.classList.remove('loading');
                button.disabled = false;
            }
        }
    }
    async simulateApiCall(delay) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simular éxito en el 80% de los casos
                if (Math.random() > 0.2) {
                    resolve();
                } else {
                    reject(new Error('Invalid Code'));
                }
            }, delay);
        });
    }
}
// Inicializar el modal de verificación
document.addEventListener('DOMContentLoaded', () => {
    const verificationModalElement = document.getElementById('verification-modal');
    if (verificationModalElement) {
        try {
            window.verificationModal = new VerificationModal();
        } catch (error) {
        }
    } else {
    }
});
// Función global para abrir el modal de verificación
window.openVerificationModal = (email) => {
    if (window.verificationModal) {
        window.verificationModal.openModal(email);
    }
};
// Función global para probar el toggle de contraseñas
window.testPasswordToggle = function(fieldId) {
    const input = document.getElementById(fieldId);
    const toggle = document.getElementById(fieldId + '-toggle');
    if (input && toggle) {
        if (input.type === 'password') {
            input.type = 'text';
        } else {
            input.type = 'password';
        }
    } else {
    }
};
// Sistema unificado de toggles de contraseñas
class PasswordToggleManager {
    constructor() {
        this.init();
    }
    init() {
        this.setupGlobalEventDelegation();
        this.setupDirectEventListeners();
    }
    setupDirectEventListeners() {
        // Configurar event listeners directos como respaldo
        const toggleIds = [
            'register-password-toggle',
            'register-confirm-password-toggle', 
            'login-password-toggle',
            'new-password-toggle',
            'confirm-password-toggle'
        ];
        toggleIds.forEach(toggleId => {
            const toggle = document.getElementById(toggleId);
            if (toggle) {
                // Remover listeners existentes
                toggle.replaceWith(toggle.cloneNode(true));
                const newToggle = document.getElementById(toggleId);
                newToggle.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const inputId = toggleId.replace('-toggle', '');
                    const input = document.getElementById(inputId);
                    if (input) {
                        this.togglePasswordVisibility(inputId, newToggle);
                    } else {
                    }
                });
            }
        });
    }
    setupGlobalEventDelegation() {
        // Event delegation para todos los toggles de contraseñas
        document.addEventListener('click', (e) => {
            if (e.target && e.target.classList.contains('password-toggle')) {
                e.preventDefault();
                e.stopPropagation();
                const toggle = e.target;
                // Usar la función unificada
                window.togglePasswordVisibility(toggle);
            }
        });
    }
    getInputIdFromToggle(toggle) {
        // Método 1: Buscar por data-target
        if (toggle.dataset && toggle.dataset.target) {
            const inputId = toggle.dataset.target;
            const input = document.getElementById(inputId);
            if (input) {
                return inputId;
            }
        }
        // Método 2: Buscar el input asociado al toggle en el contenedor
        const inputContainer = toggle.closest('.input-container, .password-input-container');
        if (inputContainer) {
            const input = inputContainer.querySelector('input[type="password"], input[type="text"]');
            if (input) {
                return input.id;
            }
        }
        // Método 3: Buscar por ID del toggle
        const toggleId = toggle.id;
        if (toggleId && toggleId.includes('-toggle')) {
            const inputId = toggleId.replace('-toggle', '');
            const input = document.getElementById(inputId);
            if (input) {
                return inputId;
            }
        }
        return null;
    }
    togglePasswordVisibility(inputId, toggle) {
        const input = document.getElementById(inputId);
        if (input) {
            if (input.type === 'password') {
                input.type = 'text';
                this.updateToggleIcon(toggle, 'visible');
            } else {
                input.type = 'password';
                this.updateToggleIcon(toggle, 'hidden');
            }
        } else {
        }
    }
    updateToggleIcon(toggle, state) {
        if (state === 'visible') {
            // Mostrar icono de ojo tachado (contraseña visible)
            toggle.innerHTML = `
                <i class="fas fa-eye-slash"></i>
            `;
            toggle.classList.add('active');
        } else {
            // Mostrar icono de ojo normal (contraseña oculta)
            toggle.innerHTML = `
                <i class="fas fa-eye"></i>
            `;
            toggle.classList.remove('active');
        }
    }
}
// Inicializar el sistema unificado
window.passwordToggleManager = new PasswordToggleManager();
// Función simple para inicializar toggles de contraseña
function initializePasswordToggles() {
    // Buscar todos los botones de toggle de contraseña
    const toggles = document.querySelectorAll('.password-toggle');
    toggles.forEach((toggle, index) => {
        // Remover listeners existentes
        const newToggle = toggle.cloneNode(true);
        toggle.parentNode.replaceChild(newToggle, toggle);
        // Agregar event listener
        newToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            // Obtener el input asociado
            let inputId = null;
            // Método 1: data-target
            if (this.dataset && this.dataset.target) {
                inputId = this.dataset.target;
            }
            // Método 2: buscar en el contenedor
            else {
                const container = this.closest('.input-container, .password-input-container');
                if (container) {
                    const input = container.querySelector('input[type="password"], input[type="text"]');
                    if (input) {
                        inputId = input.id;
                    }
                }
            }
            if (inputId) {
                const input = document.getElementById(inputId);
                if (input) {
                    if (input.type === 'password') {
                        input.type = 'text';
                        this.innerHTML = '<i class="fas fa-eye-slash"></i>';
                        this.classList.add('active');
                    } else {
                        input.type = 'password';
                        this.innerHTML = '<i class="fas fa-eye"></i>';
                        this.classList.remove('active');
                    }
                } else {
                }
            } else {
            }
        });
    });
}
// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePasswordToggles);
} else {
    initializePasswordToggles();
}
// Función para inicializar la validación de contraseña
function initializePasswordStrength() {
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const strengthIndicator = document.getElementById('password-strength');
    if (passwordInput && strengthIndicator) {
        passwordInput.addEventListener('input', function() {
            const password = this.value;
            updatePasswordStrength(password, strengthIndicator);
            // Si hay campo de confirmación, validar también
            if (confirmPasswordInput) {
                validatePasswordMatch();
            }
        });
        // Validación inicial
        updatePasswordStrength(passwordInput.value, strengthIndicator);
    } else {
    }
    // Validar confirmación de contraseña si existe
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', validatePasswordMatch);
    }
}
// Función para validar que las contraseñas coincidan
function validatePasswordMatch() {
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    if (!passwordInput || !confirmPasswordInput) return;
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    if (confirmPassword.length > 0) {
        if (password === confirmPassword) {
            confirmPasswordInput.setCustomValidity('');
            confirmPasswordInput.style.borderColor = '#10b981';
        } else {
            confirmPasswordInput.setCustomValidity('Las contraseñas no coinciden');
            confirmPasswordInput.style.borderColor = '#ef4444';
        }
    } else {
        confirmPasswordInput.setCustomValidity('');
        confirmPasswordInput.style.borderColor = '';
    }
}
// Función para actualizar la fortaleza de la contraseña
function updatePasswordStrength(password, indicator) {
    const strengthBar = indicator.querySelector('.strength-bar span');
    const strengthText = indicator.querySelector('.strength-text');
    if (!strengthBar || !strengthText) {
        return;
    }
    const strength = calculatePasswordStrength(password);
    // Remover clases anteriores
    indicator.classList.remove('strength-weak', 'strength-medium', 'strength-strong');
    // Actualizar barra y texto
    strengthBar.style.width = strength.percentage + '%';
    strengthText.textContent = strength.text;
    // Agregar clase de fortaleza
    if (strength.level > 0) {
        indicator.classList.add(strength.class);
    }
}
// Función para calcular la fortaleza de la contraseña
function calculatePasswordStrength(password) {
    if (!password || password.length === 0) {
        return {
            level: 0,
            percentage: 0,
            text: 'Ingresa una contraseña',
            class: ''
        };
    }
    let score = 0;
    let feedback = [];
    // Longitud mínima (8 caracteres)
    if (password.length >= 8) {
        score += 2; // Peso mayor para longitud
    } else {
        feedback.push('Mínimo 8 caracteres');
    }
    // Longitud óptima (10+ caracteres)
    if (password.length >= 10) {
        score += 1;
    }
    // Contiene letras mayúsculas
    if (/[A-Z]/.test(password)) {
        score += 1;
    } else {
        feedback.push('Incluye mayúsculas');
    }
    // Contiene letras minúsculas
    if (/[a-z]/.test(password)) {
        score += 1;
    } else {
        feedback.push('Incluye minúsculas');
    }
    // Contiene números
    if (/[0-9]/.test(password)) {
        score += 1;
    } else {
        feedback.push('Incluye números');
    }
    // Contiene caracteres especiales (opcional, no obligatorio)
    if (/[^A-Za-z0-9]/.test(password)) {
        score += 1;
    }
    // Determinar nivel de fortaleza (criterios más flexibles)
    let level, percentage, text, className;
    if (score <= 3) {
        level = 1;
        percentage = 30;
        text = 'Débil - ' + feedback.join(', ');
        className = 'strength-weak';
    } else if (score <= 5) {
        level = 2;
        percentage = 70;
        text = 'Media - ' + (feedback.length > 0 ? feedback.join(', ') : 'Buena contraseña');
        className = 'strength-medium';
    } else {
        level = 3;
        percentage = 100;
        text = 'Fuerte - ¡Excelente contraseña!';
        className = 'strength-strong';
    }
    return {
        level: level,
        percentage: percentage,
        text: text,
        class: className
    };
}
// Inicializar validación de contraseña cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePasswordStrength);
} else {
    initializePasswordStrength();
}
// Función de prueba para verificar la validación
window.testPasswordStrength = function(password = 'Nachovn114') {
    const result = calculatePasswordStrength(password);
    return result;
};
// ===== SISTEMA DE AUTENTICACIÓN SOCIAL =====
function initializeSocialAuth() {
    // Botones de autenticación social
    const googleBtn = document.querySelector('.google-btn');
    const facebookBtn = document.querySelector('.facebook-btn');
    if (googleBtn) {
        googleBtn.addEventListener('click', handleGoogleAuth);
    }
    if (facebookBtn) {
        facebookBtn.addEventListener('click', handleFacebookAuth);
    }
}
function handleGoogleAuth() {
    // Simular autenticación con Google
    showNotification('Redirigiendo a Google...', 'info');
    // En una implementación real, aquí se integraría con Google OAuth
    setTimeout(() => {
        // Simular éxito de autenticación
        const userData = {
            name: 'Usuario Google',
            email: 'usuario@gmail.com',
            provider: 'google'
        };
        handleSocialAuthSuccess(userData);
    }, 2000);
}
function handleFacebookAuth() {
    // Simular autenticación con Facebook
    showNotification('Redirigiendo a Facebook...', 'info');
    // En una implementación real, aquí se integraría con Facebook OAuth
    setTimeout(() => {
        // Simular éxito de autenticación
        const userData = {
            name: 'Usuario Facebook',
            email: 'usuario@facebook.com',
            provider: 'facebook'
        };
        handleSocialAuthSuccess(userData);
    }, 2000);
}
function handleSocialAuthSuccess(userData) {
    // Guardar datos del usuario
    localStorage.setItem('huertoHogarUser', JSON.stringify(userData));
    // Mostrar notificación de éxito
    showNotification(`¡Bienvenido ${userData.name}!`, 'success');
    // Redirigir al inicio
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}
// ===== SISTEMA DE REGISTRO Y LOGIN =====
function initializeAuthForms() {
    // Formulario de registro
    const registerForm = document.querySelector('form[data-auth="register"]');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    // Formulario de login
    const loginForm = document.querySelector('form[data-auth="login"]');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    // Verificar si hay email en URL para prellenar
    checkEmailFromURL();
}
function handleRegister(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const userData = {
        nombres: formData.get('nombres'),
        apellidos: formData.get('apellidos'),
        email: formData.get('email'),
        password: formData.get('password'),
        confirmPassword: formData.get('confirm-password'),
        terms: formData.get('terms'),
        newsletter: formData.get('newsletter')
    };
    // Validar datos
    if (!validateRegisterData(userData)) {
        return;
    }
    // Simular proceso de registro
    showNotification('Creando tu cuenta...', 'info');
    setTimeout(() => {
        // Guardar datos del usuario
        const user = {
            name: `${userData.nombres} ${userData.apellidos}`,
            email: userData.email,
            provider: 'email',
            createdAt: new Date().toISOString()
        };
        localStorage.setItem('huertoHogarUser', JSON.stringify(user));
        // Mostrar notificación de éxito
        showNotification('¡Cuenta creada exitosamente!', 'success');
        // Redirigir al login con el email prellenado
        setTimeout(() => {
            const loginURL = `login.html?email=${encodeURIComponent(userData.email)}`;
            window.location.href = loginURL;
        }, 2000);
    }, 1500);
}
function handleLogin(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const loginData = {
        email: formData.get('email'),
        password: formData.get('password'),
        remember: formData.get('remember')
    };
    // Validar datos
    if (!validateLoginData(loginData)) {
        return;
    }
    // Simular proceso de login
    showNotification('Iniciando sesión...', 'info');
    setTimeout(() => {
        // Cargar datos del usuario
        const user = JSON.parse(localStorage.getItem('huertoHogarUser') || '{}');
        if (user.email === loginData.email) {
            // Login exitoso
            showNotification(`¡Bienvenido ${user.name}!`, 'success');
            // Redirigir al inicio
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            showNotification('Credenciales incorrectas', 'error');
        }
    }, 1000);
}
function validateRegisterData(data) {
    // Validar nombres
    if (!data.nombres || data.nombres.trim().length < 2) {
        showNotification('Los nombres deben tener al menos 2 caracteres', 'error');
        return false;
    }
    // Validar apellidos
    if (!data.apellidos || data.apellidos.trim().length < 2) {
        showNotification('Los apellidos deben tener al menos 2 caracteres', 'error');
        return false;
    }
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailRegex.test(data.email)) {
        showNotification('Ingresa un email válido', 'error');
        return false;
    }
    // Validar contraseña
    if (!data.password || data.password.length < 8) {
        showNotification('La contraseña debe tener al menos 8 caracteres', 'error');
        return false;
    }
    // Validar confirmación de contraseña
    if (data.password !== data.confirmPassword) {
        showNotification('Las contraseñas no coinciden', 'error');
        return false;
    }
    // Validar términos y condiciones
    if (!data.terms) {
        showNotification('Debes aceptar los términos y condiciones', 'error');
        return false;
    }
    return true;
}
function validateLoginData(data) {
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailRegex.test(data.email)) {
        showNotification('Ingresa un email válido', 'error');
        return false;
    }
    // Validar contraseña
    if (!data.password || data.password.length < 6) {
        showNotification('La contraseña debe tener al menos 6 caracteres', 'error');
        return false;
    }
    return true;
}
function checkEmailFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');
    if (email) {
        const emailInput = document.getElementById('email');
        if (emailInput) {
            emailInput.value = email;
        }
    }
}
// Inicializar autenticación social cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initializeSocialAuth();
        initializeAuthForms();
    });
} else {
    initializeSocialAuth();
    initializeAuthForms();
}
// Función específica para probar el modal de olvidé mi contraseña
window.testForgotPasswordToggle = function() {
    const newPasswordToggle = document.getElementById('new-password-toggle');
    const confirmPasswordToggle = document.getElementById('confirm-password-toggle');
    const newPasswordInput = document.getElementById('new-password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    if (newPasswordToggle && newPasswordInput) {
        newPasswordToggle.click();
    } else {
    }
    if (confirmPasswordToggle && confirmPasswordInput) {
        confirmPasswordToggle.click();
    } else {
    }
};
// Función unificada para toggle de contraseñas
window.togglePasswordVisibility = function(toggleElement) {
    if (!toggleElement) return;
    const inputId = toggleElement.getAttribute('data-target') || 
                   toggleElement.id.replace('-toggle', '');
    const input = document.getElementById(inputId);
    if (!input) {
        return;
    }
    const icon = toggleElement.querySelector('i');
    if (!icon) {
        return;
    }
    if (input.type === 'password') {
        input.type = 'text';
        toggleElement.classList.add('active');
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        toggleElement.classList.remove('active');
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
};
