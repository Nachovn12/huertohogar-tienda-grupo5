document.addEventListener('DOMContentLoaded', () => {
    // --- Sistema de Búsqueda Local con localStorage ---
    const SEARCH_STORAGE_KEY = 'huertohogar_search_history';
    const PRODUCTS_STORAGE_KEY = 'huertohogar_products';
    
    // --- Funcionalidad del Botón Hero ---
    const initHeroButton = () => {
        const heroButton = document.querySelector('.hero-section .btn-primary');
        console.log('Botón hero encontrado:', heroButton);
        
        if (heroButton) {
            // Agregar evento de click
            heroButton.addEventListener('click', function(e) {
                console.log('Botón hero clickeado!');
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
                    console.log('Haciendo scroll suave a productos');
                    const productsSection = document.getElementById('categories') || document.querySelector('.content-section');
                    if (productsSection) {
                        productsSection.scrollIntoView({ 
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                } else {
                    // Si no estamos en productos.html, navegar normalmente
                    console.log('Navegando a productos.html');
                    window.location.href = 'productos.html';
                }
            });
            
            // Agregar evento de mouseover para debug
            heroButton.addEventListener('mouseover', function() {
                console.log('Mouse sobre el botón hero');
            });
        } else {
            console.log('No se encontró el botón hero');
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
        
        console.log('🎯 Ofertas generadas:', offers);
        return offers;
    };

    // --- Datos Completos de Productos (Basados en el PDF) ---
    const products = [
        { 
            id: 'FR001', 
            name: 'Manzanas Fuji', 
            price: 1200, 
            category: 'Frutas Frescas', 
            image: 'https://santaisabel.vtexassets.com/arquivos/ids/174684-900-900?width=900&height=900&aspect=true',
            stock: 150,
            unit: 'kilos',
            description: 'Manzanas Fuji crujientes y dulces, cultivadas en el Valle del Maule. Perfectas para meriendas saludables o como ingrediente en postres. Estas manzanas son conocidas por su textura firme y su sabor equilibrado entre dulce y ácido.'
        },
        { 
            id: 'FR002', 
            name: 'Naranjas Valencia', 
            price: 1000, 
            category: 'Frutas Frescas', 
            image: 'https://static.vecteezy.com/system/resources/previews/022/825/544/non_2x/orange-fruit-orange-on-transparent-background-free-png.png',
            stock: 200,
            unit: 'kilos',
            description: 'Jugosas y ricas en vitamina C, estas naranjas Valencia son ideales para zumos frescos y refrescantes. Cultivadas en condiciones climáticas óptimas que aseguran su dulzura y jugosidad.'
        },
        { 
            id: 'FR003', 
            name: 'Plátanos Cavendish', 
            price: 800, 
            category: 'Frutas Frescas', 
            image: 'https://png.pngtree.com/png-vector/20240128/ourmid/pngtree-ripe-cavendish-banana-png-image_11508971.png',
            stock: 250,
            unit: 'kilos',
            description: 'Plátanos maduros y dulces, perfectos para el desayuno o como snack energético. Estos plátanos son ricos en potasio y vitaminas, ideales para mantener una dieta equilibrada.'
        },
        { 
            id: 'VR001', 
            name: 'Zanahorias Orgánicas', 
            price: 900, 
            category: 'Verduras Orgánicas', 
            image: 'https://png.pngtree.com/png-vector/20241225/ourmid/pngtree-fresh-organic-carrots-in-a-neat-stack-png-image_14812590.png',
            stock: 100,
            unit: 'kilos',
            description: 'Zanahorias crujientes cultivadas sin pesticidas en la Región de O\'Higgins. Excelente fuente de vitamina A y fibra, ideales para ensaladas, jugos o como snack saludable.'
        },
        { 
            id: 'VR002', 
            name: 'Espinacas Frescas', 
            price: 700, 
            category: 'Verduras Orgánicas', 
            image: 'https://pngimg.com/uploads/spinach/spinach_PNG45.png',
            stock: 80,
            unit: 'bolsas de 500g',
            description: 'Espinacas frescas y nutritivas, perfectas para ensaladas y batidos verdes. Estas espinacas son cultivadas bajo prácticas orgánicas que garantizan su calidad y valor nutricional.'
        },
        { 
            id: 'VR003', 
            name: 'Pimientos Tricolores', 
            price: 1500, 
            category: 'Verduras Orgánicas', 
            image: 'https://png.pngtree.com/png-vector/20241212/ourmid/pngtree-colored-paprica-raw-paprika-fruit-png-image_14613829.png',
            stock: 120,
            unit: 'kilos',
            description: 'Pimientos rojos, amarillos y verdes, ideales para salteados y platos coloridos. Ricos en antioxidantes y vitaminas, estos pimientos añaden un toque vibrante y saludable a cualquier receta.'
        },
        { 
            id: 'PO001', 
            name: 'Miel Orgánica', 
            price: 5000, 
            category: 'Productos Orgánicos', 
            image: 'https://png.pngtree.com/png-clipart/20240720/original/pngtree-family-apiary-organic-honey-food-production-png-image_15597696.png',
            stock: 50,
            unit: 'frascos de 500g',
            description: 'Miel pura y orgánica producida por apicultores locales. Rica en antioxidantes y con un sabor inigualable, perfecta para endulzar de manera natural tus comidas y bebidas.'
        },
        { 
            id: 'PO003', 
            name: 'Quinua Orgánica', 
            price: 3000, 
            category: 'Productos Orgánicos', 
            image: 'https://manare.cl/wp-content/uploads/2023/09/Manare_QuinoaOrganica400g.png',
            stock: 75,
            unit: 'paquetes de 400g',
            description: 'Quinua orgánica de alta calidad, rica en proteínas y nutrientes esenciales. Perfecta para ensaladas, sopas y como sustituto del arroz. Cultivada en los Andes chilenos.'
        },
        { 
            id: 'PL001', 
            name: 'Leche Entera', 
            price: 1800, 
            category: 'Productos Lácteos', 
            image: 'https://www.soprole.cl/public/storage/imagenes/banners/202304180943Soprole-Lecheentera-litro.png',
            stock: 200,
            unit: 'litros',
            description: 'Leche entera fresca y nutritiva, rica en calcio y vitaminas. Perfecta para el desayuno, postres y preparaciones culinarias. Producida bajo los más altos estándares de calidad.'
        }
    ];

    // Inicializar ofertas especiales
    const specialOffers = getRecommendedProductsForOffers();
    console.log('🎯 Ofertas especiales inicializadas:', specialOffers);
    
    // Función de debug inmediato
    const debugOffersImmediately = () => {
        console.log('🔍 DEBUG INMEDIATO:');
        console.log('- Productos disponibles:', products.length);
        console.log('- Ofertas generadas:', specialOffers.length);
        console.log('- Contenedor offers-grid existe:', !!document.getElementById('offers-grid'));
        console.log('- Document ready state:', document.readyState);
        
        if (specialOffers.length > 0) {
            console.log('- Primera oferta:', specialOffers[0]);
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
        console.log('🎯 renderProducts llamado:', { category, container: !!container, limit });
        
        try {
            if (!container) {
                console.log('❌ No se encontró el contenedor');
                return;
            }
            
            const filtered = category === 'all' ? products : products.filter(p => p.category === category);
            const productsToRender = limit ? filtered.slice(0, limit) : filtered;
            console.log('Productos a renderizar:', productsToRender.length);
            console.log('Productos disponibles:', products.length);

            if (productsToRender.length === 0) {
                console.log('❌ No hay productos para renderizar');
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
                console.log(`Renderizando producto ${index + 1}:`, product.name);
                
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
                    console.log(`✅ Producto ${index + 1} renderizado correctamente`);
                } catch (error) {
                    console.error(`❌ Error al renderizar producto ${index + 1}:`, error);
                }
            });

            container.innerHTML = html;
            console.log('✅ renderProducts completado.');
            console.log('HTML generado:', container.innerHTML.substring(0, 200) + '...');
            console.log('Número de elementos en el contenedor:', container.children.length);

            // Aplicar animaciones a los productos recién renderizados
            setTimeout(() => {
                try {
                    enhanceProductAnimations();
                    enhanceImageAnimations();
                    enhanceButtonAnimations();
                } catch (error) {
                    console.error('Error en animaciones:', error);
                }
            }, 100);
            
        } catch (error) {
            console.error('❌ Error general en renderProducts:', error);
            container.innerHTML = '<p style="text-align: center; color: #e74c3c; padding: 2rem;">Error al cargar los productos. Por favor, recarga la página.</p>';
        }
    };

    // Inicializar productos para la página principal
    if (productListHome) {
        console.log('🎯 Inicializando productos para página principal...');
        renderProducts('all', productListHome, 6);
    }
    
    // La página de productos se inicializa con advanced-filters-fixed.js
    // No necesitamos inicializar aquí para evitar conflictos

    // --- Función para Mostrar Detalles del Producto ---
    // --- Función para Redirigir a Detalles del Producto ---
    const goToProductDetails = (productId) => {
        const productUrl = window.productUrlMap[productId];
        if (productUrl) {
            window.location.href = productUrl;
        } else {
            console.warn(`No se encontró URL para el producto: ${productId}`);
        }
    };

    const renderProductsAlphabetically = (category = 'all', container) => {
        console.log('🎯 renderProductsAlphabetically llamado:', { category, container: !!container });
        
        try {
            if (!container) {
                console.log('❌ No se encontró el contenedor');
                return;
            }
            
            const filtered = category === 'all' ? products : products.filter(p => p.category === category);
            
            // Ordenar productos alfabéticamente por nombre
            const sortedProducts = [...filtered].sort((a, b) => {
                return a.name.localeCompare(b.name, 'es', { sensitivity: 'base' });
            });
            
            console.log('Productos a renderizar (ordenados alfabéticamente):', sortedProducts.length);
            console.log('Orden de productos:', sortedProducts.map(p => p.name));

            if (sortedProducts.length === 0) {
                console.log('❌ No hay productos para renderizar');
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
                console.log(`Renderizando producto ${index + 1}:`, product.name);
                
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
                    console.log(`✅ Producto ${index + 1} renderizado correctamente`);
                } catch (error) {
                    console.error(`❌ Error al renderizar producto ${index + 1}:`, error);
                }
            });

            container.innerHTML = html;
            console.log('✅ renderProductsAlphabetically completado.');
            console.log('HTML generado:', container.innerHTML.substring(0, 200) + '...');
            console.log('Número de elementos en el contenedor:', container.children.length);

            // Aplicar animaciones a los productos recién renderizados
            setTimeout(() => {
                try {
                    enhanceProductAnimations();
                    enhanceImageAnimations();
                    enhanceButtonAnimations();
                } catch (error) {
                    console.error('Error en animaciones:', error);
                }
            }, 100);
            
        } catch (error) {
            console.error('❌ Error general en renderProductsAlphabetically:', error);
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
                console.log(`🛒 Renderizando item del carrito: ${item.name} (ID: ${item.id})`);
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
            console.log(`🔍 Controles del carrito creados: ${decreaseBtns.length} botones - y ${increaseBtns.length} botones +`);
            decreaseBtns.forEach((btn, index) => {
                console.log(`  - Botón ${index + 1}: ID=${btn.dataset.id}, Clases=${btn.className}`);
            });
            increaseBtns.forEach((btn, index) => {
                console.log(`  + Botón ${index + 1}: ID=${btn.dataset.id}, Clases=${btn.className}`);
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
        console.log('Aumentando cantidad para producto:', productId);
        const item = cart.find(item => item.id === productId);
        if (item) {
            item.quantity++;
            renderCart();
            console.log('Cantidad actualizada:', item.quantity);
        } else {
            console.log('Producto no encontrado en el carrito');
        }
    };

    const decreaseQuantity = (productId) => {
        console.log('Disminuyendo cantidad para producto:', productId);
        const item = cart.find(item => item.id === productId);
        if (item) {
            if (item.quantity > 1) {
                item.quantity--;
                console.log('Cantidad actualizada:', item.quantity);
            } else {
                console.log('Eliminando producto del carrito');
                removeFromCart(productId);
            }
            renderCart();
        } else {
            console.log('Producto no encontrado en el carrito');
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
                console.log('Botón eliminar clickeado, ID:', productId);
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
                console.log('Botón + clickeado, ID:', productId);
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
                console.log('Botón - clickeado, ID:', productId);
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
        console.log('🔧 Verificando controles del carrito con IDs hardcodeados...');
        
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
                            console.log(`✅ Corregido decrease-btn para ${product.name}: ${product.id}`);
                        }
                        if (increaseBtn) {
                            increaseBtn.dataset.id = product.id;
                            console.log(`✅ Corregido increase-btn para ${product.name}: ${product.id}`);
                        }
                        if (removeBtn) {
                            removeBtn.dataset.id = product.id;
                            console.log(`✅ Corregido remove-btn para ${product.name}: ${product.id}`);
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
        console.log('🛒 Asegurando que todos los controles del carrito funcionen...');
        
        // Buscar todos los botones de control del carrito en toda la página
        const allDecreaseBtns = document.querySelectorAll('.decrease-btn');
        const allIncreaseBtns = document.querySelectorAll('.increase-btn');
        const allRemoveBtns = document.querySelectorAll('.remove-btn');
        
        // Función para corregir un botón específico
        const fixButton = (button, type) => {
            if (!button.dataset.id || button.dataset.id === 'VR001') {
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
                            console.log(`✅ Corregido ${type} para ${product.name}: ${product.id}`);
                        }
                    }
                }
            }
        };
        
        // Corregir todos los botones
        allDecreaseBtns.forEach(btn => fixButton(btn, 'decrease-btn'));
        allIncreaseBtns.forEach(btn => fixButton(btn, 'increase-btn'));
        allRemoveBtns.forEach(btn => fixButton(btn, 'remove-btn'));
        
        console.log('✅ Verificación de controles del carrito completada');
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
                            // Aquí puedes agregar la lógica del carrito
                            alert(`¡${product.name} agregado al carrito!`);
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
        console.log('🎯 Ejecutando renderOffers...');
        console.log('Ofertas disponibles:', specialOffers);
        
        const offersContainer = document.getElementById('offers-grid');
        console.log('Contenedor de ofertas encontrado:', offersContainer);
        
        if (!offersContainer) {
            console.log('❌ No se encontró el contenedor offers-grid');
            // Reintentar después de un breve delay
            setTimeout(() => {
                const retryContainer = document.getElementById('offers-grid');
                if (retryContainer) {
                    console.log('✅ Contenedor encontrado en reintento');
                    renderOffers();
                }
            }, 100);
            return;
        }

        if (!specialOffers || specialOffers.length === 0) {
            console.log('❌ No hay ofertas disponibles para renderizar');
            offersContainer.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">No hay ofertas disponibles en este momento.</p>';
            return;
        }

        console.log('Ofertas a renderizar:', specialOffers.length);
        
        try {
            offersContainer.innerHTML = specialOffers.map((offer, index) => {
                console.log(`Renderizando oferta ${index + 1}:`, offer);
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

            console.log('✅ Ofertas renderizadas correctamente');
            console.log('HTML generado:', offersContainer.innerHTML.substring(0, 200) + '...');

            // Aplicar animaciones a las ofertas
            setTimeout(() => {
                const offerCards = document.querySelectorAll('.offer-card');
                console.log('Tarjetas de ofertas encontradas para animar:', offerCards.length);
                
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
            console.error('❌ Error al renderizar ofertas:', error);
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
                border-radius: 8px;
                color: white;
                font-weight: 600;
                z-index: 10000;
                transform: translateX(100%);
                transition: transform 0.3s ease;
                max-width: 300px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.2);
                cursor: pointer;
            `;
            document.body.appendChild(notification);
        }

        // Configurar colores según tipo
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            warning: '#ffc107',
            info: '#17a2b8'
        };

        notification.style.backgroundColor = colors[type] || colors.info;
        notification.textContent = message;
        notification.style.transform = 'translateX(0)';

        // Agregar funcionalidad de clic para abrir el carrito
        notification.onclick = () => {
            openCart();
            // Ocultar la notificación inmediatamente al hacer clic
            notification.style.transform = 'translateX(100%)';
        };

        // Ocultar después de 3 segundos
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
        }, 3000);
    };

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

    // Función de inicialización de ofertas
    const initializeOffers = () => {
        console.log('🎯 Inicializando sistema de ofertas...');
        console.log('Ofertas disponibles:', specialOffers);
        console.log('Contenedor offers-grid existe:', !!document.getElementById('offers-grid'));
        
        // Verificar que el contenedor existe antes de proceder
        const offersContainer = document.getElementById('offers-grid');
        if (!offersContainer) {
            console.log('⏳ Contenedor no encontrado, reintentando en 50ms...');
            setTimeout(initializeOffers, 50);
            return;
        }
        
        if (specialOffers && specialOffers.length > 0) {
            renderOffers();
        } else {
            console.log('❌ No se pudieron generar ofertas especiales');
        }
    };
    
    // Múltiples puntos de inicialización para asegurar que funcione
    setTimeout(initializeOffers, 100);
    setTimeout(initializeOffers, 500);
    setTimeout(initializeOffers, 1000);
    
    // También intentar renderizar cuando la página esté completamente cargada
    window.addEventListener('load', () => {
        console.log('🎯 Página completamente cargada, renderizando ofertas...');
        initializeOffers();
    });
    
    // Función de respaldo para renderizar ofertas
    const ensureOffersRendered = () => {
        const offersContainer = document.getElementById('offers-grid');
        if (offersContainer && offersContainer.children.length === 0) {
            console.log('🎯 Reintentando renderizar ofertas...');
            initializeOffers();
        }
    };
    
    // Verificar periódicamente si las ofertas se renderizaron
    setInterval(ensureOffersRendered, 3000);
    
    // También intentar cuando se detecten cambios en el DOM
    const offersObserver = new MutationObserver((mutations) => {
        let shouldCheck = false;
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                shouldCheck = true;
            }
        });
        if (shouldCheck) {
            setTimeout(ensureOffersRendered, 500);
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
        console.warn('No se encontraron productos relacionados, usando productos de prueba');
        
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
        console.log('🔐 Modal de autenticación inicializado');
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
        console.log('🔐 Intentando abrir modal de autenticación...');
        
        if (this.isAuthenticated) {
            console.log('✅ Usuario ya autenticado, procediendo al checkout');
            this.proceedToCheckout();
            return;
        }

        // Verificar que el modal existe
        if (!this.modal) {
            console.error('❌ Modal de autenticación no encontrado');
            return;
        }

        console.log('✅ Modal encontrado, mostrando...');

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
                console.log('✅ Focus establecido en el primer botón');
            } else {
                console.warn('⚠️ No se encontró el primer botón para focus');
            }
        }, 100);

        console.log('✅ Modal de autenticación abierto correctamente');
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
        console.log('🔐 Modal de autenticación cerrado');
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
        console.log('🛒 Continuando como invitado');
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
                console.log('🔐 Usuario autenticado encontrado:', this.user);
            } catch (error) {
                console.error('Error al cargar autenticación:', error);
            }
        }
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
        console.log('🛒 Procediendo al checkout...');
        
        if (this.isAuthenticated) {
            this.saveAuth();
            console.log('👤 Usuario autenticado:', this.user);
        } else {
            console.log('👤 Checkout como invitado');
        }

        // Aquí se integraría con el sistema de checkout real
        // Por ahora, mostramos un mensaje
        this.showSuccessMessage('Redirigiendo al checkout...');
        
        // Redirigir al checkout
        setTimeout(() => {
            window.location.href = 'checkout.html';
            console.log('🛒 Redirigiendo a checkout.html');
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
        localStorage.removeItem('huertoHogarAuth');
        console.log('🔐 Usuario deslogueado');
    }
}

// Inicializar modal cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Inicializando modal de autenticación...');
    
    // Verificar que el modal existe antes de inicializarlo
    const modalElement = document.getElementById('auth-modal');
    if (modalElement) {
        console.log('✅ Modal encontrado en el DOM');
        try {
            window.authModal = new AuthModal();
            console.log('✅ Modal de autenticación inicializado correctamente');
        } catch (error) {
            console.error('❌ Error al inicializar el modal:', error);
        }
    } else {
        console.error('❌ Modal de autenticación no encontrado en el DOM');
    }
    
    // Integrar con el botón de checkout existente
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('🛒 Botón de checkout clickeado');
            
            // Verificar si el modal existe
            if (window.authModal) {
                console.log('✅ Modal de autenticación disponible');
                window.authModal.openModal();
            } else {
                console.error('❌ Modal de autenticación no disponible');
                // Redirigir directamente a checkout si no hay modal
                window.location.href = 'checkout.html';
            }
        });
    } else {
        console.error('❌ Botón de checkout no encontrado');
    }
    
    // Función de respaldo para checkout directo
    window.goToCheckout = () => {
        console.log('🛒 Redirigiendo a checkout...');
        window.location.href = 'checkout.html';
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
        console.log('🔐 Modal de olvidé mi contraseña inicializado');
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
            
            console.log('🔐 Modal de olvidé mi contraseña abierto');
        }
    }

    debugElements() {
        console.log('🔍 Verificando elementos del modal:');
        console.log('new-password input:', document.getElementById('new-password'));
        console.log('new-password-toggle:', document.getElementById('new-password-toggle'));
        console.log('confirm-password input:', document.getElementById('confirm-password'));
        console.log('confirm-password-toggle:', document.getElementById('confirm-password-toggle'));
    }

    setupModalEvents() {
        // Formulario
        const form = document.getElementById('forgot-password-form');
        if (form && !form.hasAttribute('data-listener-added')) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
            form.setAttribute('data-listener-added', 'true');
            console.log('✅ Event listener agregado al formulario de olvidé mi contraseña');
        }
        
        // Toggle de visibilidad de contraseñas - Configurar directamente
        this.setupPasswordToggles();
        
        // Validación en tiempo real
        this.setupRealTimeValidation();
    }

    setupPasswordToggles() {
        console.log('🔧 Configurando toggles de contraseña...');
        
        // Configurar toggle para nueva contraseña
        const newPasswordToggle = document.getElementById('new-password-toggle');
        if (newPasswordToggle) {
            console.log('✅ Toggle de new-password encontrado');
            
            // Agregar event listener directamente
            newPasswordToggle.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('👁️ Toggle clickeado para new-password');
                this.togglePasswordVisibility('new-password');
            };
            
            // También agregar con addEventListener como respaldo
            newPasswordToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('👁️ Toggle clickeado para new-password (addEventListener)');
                this.togglePasswordVisibility('new-password');
            });
            
            console.log('✅ Event listeners agregados al toggle de new-password');
        } else {
            console.error('❌ No se encontró el toggle de new-password');
        }
        
        // Configurar toggle para confirmar contraseña
        const confirmPasswordToggle = document.getElementById('confirm-password-toggle');
        if (confirmPasswordToggle) {
            console.log('✅ Toggle de confirm-password encontrado');
            
            // Agregar event listener directamente
            confirmPasswordToggle.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('👁️ Toggle clickeado para confirm-password');
                this.togglePasswordVisibility('confirm-password');
            };
            
            // También agregar con addEventListener como respaldo
            confirmPasswordToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('👁️ Toggle clickeado para confirm-password (addEventListener)');
                this.togglePasswordVisibility('confirm-password');
            });
            
            console.log('✅ Event listeners agregados al toggle de confirm-password');
        } else {
            console.error('❌ No se encontró el toggle de confirm-password');
        }
    }

    closeModal() {
        if (this.modal) {
            this.modal.style.display = 'none';
            document.body.style.overflow = '';
            this.resetForm();
            console.log('🔐 Modal de olvidé mi contraseña cerrado');
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
        console.log(`🔄 TogglePasswordVisibility llamado para: ${fieldId}`);
        
        const input = document.getElementById(fieldId);
        const toggle = document.getElementById(fieldId + '-toggle');
        
        console.log(`📝 Input encontrado:`, input);
        console.log(`👁️ Toggle encontrado:`, toggle);
        
        if (input && toggle) {
            console.log(`🔍 Tipo actual del input: ${input.type}`);
            
            if (input.type === 'password') {
                input.type = 'text';
                console.log('👁️ Cambiando a texto visible');
                toggle.innerHTML = `
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" height="20" width="20">
                        <path fill="#485760" fill-rule="evenodd" clip-rule="evenodd" d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"></path>
                    </svg>
                `;
            } else {
                input.type = 'password';
                console.log('🔒 Cambiando a contraseña oculta');
                toggle.innerHTML = `
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" height="20" width="20">
                        <path fill="#485760" fill-rule="evenodd" clip-rule="evenodd" d="M12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8ZM10 12C10 10.8954 10.8954 10 12 10C13.1046 10 14 10.8954 14 12C14 13.1046 13.1046 14 12 14C10.8954 14 10 13.1046 10 12Z"></path>
                        <path fill="#485760" fill-rule="evenodd" clip-rule="evenodd" d="M12 4C8.68793 4 6.31245 5.39172 4.71551 7.05809C3.14259 8.6994 2.31647 10.611 2.02986 11.7575C1.99005 11.9167 1.99005 12.0833 2.02986 12.2425C2.31647 13.389 3.14259 15.3006 4.71551 16.9419C6.31245 18.6083 8.68793 20 12 20C15.3121 20 17.6875 18.6083 19.2845 16.9419C20.8574 15.3006 21.6835 13.389 21.9701 12.2425C22.01 12.0833 22.01 11.9167 21.9701 11.7575C21.6835 10.611 20.8574 8.6994 19.2845 7.05809C17.6875 5.39172 15.3121 4 12 4ZM6.15949 15.5581C4.97234 14.3193 4.30739 12.8896 4.03753 12C4.30739 11.1104 4.97234 9.68067 6.15949 8.44191C7.43755 7.10828 9.31207 6 12 6C14.6879 6 16.5625 7.10828 17.8405 8.44191C19.0277 9.68067 19.6926 11.1104 19.9625 12C19.6926 12.8896 19.0277 14.3193 17.8405 15.5581C16.5625 16.8917 14.6879 18 12 18C9.31207 18 7.43755 16.8917 6.15949 15.5581Z"></path>
                    </svg>
                `;
            }
        } else {
            console.error('❌ No se encontraron los elementos input o toggle');
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
        console.log('✅ Modal de olvidé mi contraseña encontrado en el DOM');
        try {
            window.forgotPasswordModal = new ForgotPasswordModal();
            console.log('✅ Modal de olvidé mi contraseña inicializado correctamente');
        } catch (error) {
            console.error('❌ Error al inicializar el modal de olvidé mi contraseña:', error);
        }
    } else {
        console.error('❌ Modal de olvidé mi contraseña no encontrado en el DOM');
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
        console.log('🔐 Modal de verificación de cuenta inicializado');
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
            
            console.log('🔐 Modal de verificación de cuenta abierto');
        }
    }

    closeModal() {
        if (this.modal) {
            this.modal.style.display = 'none';
            document.body.style.overflow = '';
            this.stopCountdown();
            this.clearCodeInputs();
            console.log('🔐 Modal de verificación de cuenta cerrado');
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
                console.log('✅ Verificación completada');
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
        console.log('✅ Modal de verificación de cuenta encontrado en el DOM');
        try {
            window.verificationModal = new VerificationModal();
            console.log('✅ Modal de verificación de cuenta inicializado correctamente');
        } catch (error) {
            console.error('❌ Error al inicializar el modal de verificación de cuenta:', error);
        }
    } else {
        console.error('❌ Modal de verificación de cuenta no encontrado en el DOM');
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
    console.log(`🧪 Probando toggle para: ${fieldId}`);
    const input = document.getElementById(fieldId);
    const toggle = document.getElementById(fieldId + '-toggle');
    
    console.log('Input:', input);
    console.log('Toggle:', toggle);
    
    if (input && toggle) {
        if (input.type === 'password') {
            input.type = 'text';
            console.log('✅ Cambiado a texto visible');
        } else {
            input.type = 'password';
            console.log('✅ Cambiado a contraseña oculta');
        }
    } else {
        console.error('❌ Elementos no encontrados');
    }
};

// Sistema unificado de toggles de contraseñas
class PasswordToggleManager {
    constructor() {
        this.init();
    }

    init() {
        console.log('🔧 Inicializando sistema unificado de toggles de contraseñas');
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
                console.log(`✅ Configurando event listener directo para: ${toggleId}`);
                
                // Remover listeners existentes
                toggle.replaceWith(toggle.cloneNode(true));
                const newToggle = document.getElementById(toggleId);
                
                newToggle.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log(`👁️ Toggle directo clickeado: ${toggleId}`);
                    
                    const inputId = toggleId.replace('-toggle', '');
                    const input = document.getElementById(inputId);
                    
                    if (input) {
                        this.togglePasswordVisibility(inputId, newToggle);
                    } else {
                        console.error(`❌ Input no encontrado para: ${inputId}`);
                    }
                });
            }
        });
    }

    setupGlobalEventDelegation() {
        // Event delegation para todos los toggles de contraseñas
        document.addEventListener('click', (e) => {
            console.log('🖱️ Click detectado en:', e.target);
            console.log('🔍 Clases del elemento:', e.target.classList);
            console.log('🔍 Contiene password-toggle?', e.target.classList.contains('password-toggle'));
            
            if (e.target && e.target.classList.contains('password-toggle')) {
                e.preventDefault();
                e.stopPropagation();
                
                const toggle = e.target;
                const inputId = this.getInputIdFromToggle(toggle);
                
                console.log('🎯 Toggle encontrado:', toggle);
                console.log('🎯 Input ID encontrado:', inputId);
                
                if (inputId) {
                    console.log(`👁️ Toggle clickeado para: ${inputId}`);
                    this.togglePasswordVisibility(inputId, toggle);
                } else {
                    console.error('❌ No se pudo encontrar el input asociado al toggle');
                }
            }
        });
        
        console.log('✅ Sistema de event delegation configurado para toggles de contraseñas');
    }

    getInputIdFromToggle(toggle) {
        console.log('🔍 Buscando input para toggle:', toggle);
        
        // Buscar el input asociado al toggle
        const inputContainer = toggle.closest('.input-container');
        console.log('🔍 Input container encontrado:', inputContainer);
        
        if (inputContainer) {
            const input = inputContainer.querySelector('input[type="password"], input[type="text"]');
            console.log('🔍 Input encontrado:', input);
            console.log('🔍 Input ID:', input ? input.id : 'No encontrado');
            
            if (input) {
                return input.id;
            }
        }
        
        // Método alternativo: buscar por ID del toggle
        const toggleId = toggle.id;
        if (toggleId && toggleId.includes('-toggle')) {
            const inputId = toggleId.replace('-toggle', '');
            const input = document.getElementById(inputId);
            console.log('🔍 Método alternativo - Input ID:', inputId);
            console.log('🔍 Método alternativo - Input encontrado:', input);
            
            if (input) {
                return inputId;
            }
        }
        
        return null;
    }

    togglePasswordVisibility(inputId, toggle) {
        const input = document.getElementById(inputId);
        
        if (input) {
            console.log(`🔍 Tipo actual del input: ${input.type}`);
            
            if (input.type === 'password') {
                input.type = 'text';
                console.log('👁️ Cambiando a texto visible');
                this.updateToggleIcon(toggle, 'visible');
            } else {
                input.type = 'password';
                console.log('🔒 Cambiando a contraseña oculta');
                this.updateToggleIcon(toggle, 'hidden');
            }
        } else {
            console.error(`❌ No se encontró el input con ID: ${inputId}`);
        }
    }

    updateToggleIcon(toggle, state) {
        if (state === 'visible') {
            toggle.innerHTML = `
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" height="20" width="20">
                    <path fill="#485760" fill-rule="evenodd" clip-rule="evenodd" d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"></path>
                </svg>
            `;
        } else {
            toggle.innerHTML = `
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" height="20" width="20">
                    <path fill="#485760" fill-rule="evenodd" clip-rule="evenodd" d="M12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8ZM10 12C10 10.8954 10.8954 10 12 10C13.1046 10 14 10.8954 14 12C14 13.1046 13.1046 14 12 14C10.8954 14 10 13.1046 10 12Z"></path>
                    <path fill="#485760" fill-rule="evenodd" clip-rule="evenodd" d="M12 4C8.68793 4 6.31245 5.39172 4.71551 7.05809C3.14259 8.6994 2.31647 10.611 2.02986 11.7575C1.99005 11.9167 1.99005 12.0833 2.02986 12.2425C2.31647 13.389 3.14259 15.3006 4.71551 16.9419C6.31245 18.6083 8.68793 20 12 20C15.3121 20 17.6875 18.6083 19.2845 16.9419C20.8574 15.3006 21.6835 13.389 21.9701 12.2425C22.01 12.0833 22.01 11.9167 21.9701 11.7575C21.6835 10.611 20.8574 8.6994 19.2845 7.05809C17.6875 5.39172 15.3121 4 12 4ZM6.15949 15.5581C4.97234 14.3193 4.30739 12.8896 4.03753 12C4.30739 11.1104 4.97234 9.68067 6.15949 8.44191C7.43755 7.10828 9.31207 6 12 6C14.6879 6 16.5625 7.10828 17.8405 8.44191C19.0277 9.68067 19.6926 11.1104 19.9625 12C19.6926 12.8896 19.0277 14.3193 17.8405 15.5581C16.5625 16.8917 14.6879 18 12 18C9.31207 18 7.43755 16.8917 6.15949 15.5581Z"></path>
                </svg>
            `;
        }
    }
}

// Inicializar el sistema unificado
window.passwordToggleManager = new PasswordToggleManager();

// Función específica para probar el modal de olvidé mi contraseña
window.testForgotPasswordToggle = function() {
    console.log('🧪 Probando toggles del modal de olvidé mi contraseña');
    
    const newPasswordToggle = document.getElementById('new-password-toggle');
    const confirmPasswordToggle = document.getElementById('confirm-password-toggle');
    const newPasswordInput = document.getElementById('new-password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    
    console.log('🔍 new-password-toggle:', newPasswordToggle);
    console.log('🔍 confirm-password-toggle:', confirmPasswordToggle);
    console.log('🔍 new-password input:', newPasswordInput);
    console.log('🔍 confirm-password input:', confirmPasswordInput);
    
    if (newPasswordToggle && newPasswordInput) {
        console.log('✅ Toggle de nueva contraseña encontrado');
        newPasswordToggle.click();
    } else {
        console.error('❌ Toggle de nueva contraseña no encontrado');
    }
    
    if (confirmPasswordToggle && confirmPasswordInput) {
        console.log('✅ Toggle de confirmar contraseña encontrado');
        confirmPasswordToggle.click();
    } else {
        console.error('❌ Toggle de confirmar contraseña no encontrado');
    }
};