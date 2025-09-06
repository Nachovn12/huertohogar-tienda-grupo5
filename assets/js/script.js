document.addEventListener('DOMContentLoaded', () => {
    // --- Sistema de Búsqueda Local con localStorage ---
    const SEARCH_STORAGE_KEY = 'huertohogar_search_history';
    const PRODUCTS_STORAGE_KEY = 'huertohogar_products';
    
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

    // --- Función para Mostrar Detalles del Producto ---
    const showProductDetails = (productId) => {
        // Buscar en productos regulares primero
        let product = products.find(p => p.id === productId);
        
        // Si no se encuentra, buscar en ofertas especiales
        if (!product) {
            product = specialOffers.find(o => o.id === productId);
            if (product) {
                // Convertir oferta a formato de producto para el modal
                product = {
                    ...product,
                    price: product.offerPrice
                };
            }
        }
        
        if (!product) return;

        // Crear modal si no existe
        let modal = document.getElementById('product-details-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'product-details-modal';
            modal.className = 'product-details-modal';
            modal.innerHTML = `
                <div class="modal-overlay"></div>
                <div class="modal-content">
                    <button class="modal-close-btn">&times;</button>
                    <div class="modal-body">
                        <div class="product-details-header">
                            <img src="${product.image}" alt="${product.name}" class="product-details-image">
                            <div class="product-details-info">
                                <h2>${product.name}</h2>
                                <p class="product-code">${product.id}</p>
                                <p class="product-price">${formatPrice(product.price)} por ${product.unit}</p>
                            </div>
                        </div>
                        <div class="product-details-content">
                            <div class="detail-section">
                                <h3><i class="fas fa-boxes"></i> Stock Disponible</h3>
                                <p class="stock-info">
                                    <span class="stock-number">${product.stock}</span> ${product.unit}
                                </p>
                            </div>
                            <div class="detail-section">
                                <h3><i class="fas fa-info-circle"></i> Descripción</h3>
                                <p class="product-description">${product.description}</p>
                            </div>
                            <div class="detail-section">
                                <h3><i class="fas fa-tags"></i> Categoría</h3>
                                <p class="product-category">${product.category}</p>
                            </div>
                        </div>
                        <div class="product-details-actions">
                            <button class="add-to-cart-btn-large" data-id="${product.id}">
                                <i class="fas fa-shopping-cart"></i> Agregar al Carrito
                            </button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            // Event listeners para el modal
            modal.querySelector('.modal-close-btn').addEventListener('click', () => {
                modal.classList.remove('active');
            });
            modal.querySelector('.modal-overlay').addEventListener('click', () => {
                modal.classList.remove('active');
            });
            modal.querySelector('.add-to-cart-btn-large').addEventListener('click', () => {
                addToCart(product.id);
                modal.classList.remove('active');
            });
        } else {
            // Actualizar contenido del modal existente
            modal.querySelector('.product-details-image').src = product.image;
            modal.querySelector('.product-details-image').alt = product.name;
            modal.querySelector('.product-details-info h2').textContent = product.name;
            modal.querySelector('.product-code').textContent = product.id;
            modal.querySelector('.product-price').textContent = `${formatPrice(product.price)} por ${product.unit}`;
            modal.querySelector('.stock-number').textContent = product.stock;
            modal.querySelector('.product-description').textContent = product.description;
            modal.querySelector('.product-category').textContent = product.category;
            modal.querySelector('.add-to-cart-btn-large').dataset.id = product.id;
        }

        // Mostrar modal
        modal.classList.add('active');
    };

    const renderProducts = (category = 'all', container, limit = null) => {
        if (!container) return;
        const filtered = category === 'all' ? products : products.filter(p => p.category === category);
        const productsToRender = limit ? filtered.slice(0, limit) : filtered;

        // Aplicar clase especial para categorías con pocos productos
        if (category !== 'all' && productsToRender.length <= 2) {
            container.classList.add('few-products');
        } else {
            container.classList.remove('few-products');
        }

        container.innerHTML = productsToRender.map((product, index) => `
            <div class="product-card grid-card" style="--delay: ${index * 0.1}s">
                <img src="${product.image}" alt="${product.name}">
                <div class="product-info">
                    <h4>${product.name}</h4>
                    <p class="price">${formatPrice(product.price)}</p>
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
        `).join('');

        // Aplicar animaciones a los productos recién renderizados
        setTimeout(() => {
            enhanceProductAnimations();
            enhanceImageAnimations();
            enhanceButtonAnimations();
        }, 100);
    };

    const renderCart = () => {
        if (cart.length === 0) {
            cartItemsList.innerHTML = '<p>Tu carrito está vacío.</p>';
        } else {
            cartItemsList.innerHTML = cart.map(item => `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="item-details">
                        <h4>${item.name}</h4>
                        <span class="price">${formatPrice(item.price)} x ${item.quantity}</span>
                    </div>
                    <button class="remove-btn" data-id="${item.id}">×</button>
                </div>
            `).join('');
        }
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        
        cartTotalSpan.textContent = formatPrice(total);
        cartCounter.textContent = totalItems;
        localStorage.setItem('huertoHogarCart', JSON.stringify(cart));
    };
    
    const addToCart = (productId) => {
        // Buscar en productos regulares primero
        let productToAdd = products.find(p => p.id === productId);
        
        // Si no se encuentra, buscar en ofertas especiales
        if (!productToAdd) {
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
        
        // Solo abrir el carrito para productos regulares, no para ofertas
        if (products.find(p => p.id === productId)) {
            openCart();
        }
    };
    
    const removeFromCart = (productId) => {
        cart = cart.filter(item => item.id !== productId);
        renderCart();
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

    document.body.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart-btn')) {
            addToCart(e.target.dataset.id);
        }
        if (e.target.classList.contains('remove-btn')) {
            removeFromCart(e.target.dataset.id);
        }
        if (e.target.classList.contains('view-details-btn')) {
            const productId = e.target.dataset.id;
            const productUrl = window.productUrlMap[productId];
            if (productUrl) {
                window.location.href = productUrl;
            } else {
                showProductDetails(productId);
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
        const observer = new IntersectionObserver((entries) => {
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
            observer.observe(card);
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
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setTimeout(() => {
                            entry.target.style.opacity = '1';
                            entry.target.style.transform = 'translateY(0)';
                        }, Math.random() * 300); // Delay aleatorio para efecto cascada
                    }
                });
            }, { threshold: 0.1 });
            
            observer.observe(card);
            
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
            // Crear elemento de brillo si no existe
            if (!button.querySelector('.shine-effect')) {
                const shine = document.createElement('div');
                shine.className = 'shine-effect';
                shine.style.cssText = `
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
                    transition: left 0.6s ease;
                    pointer-events: none;
                    z-index: 1;
                `;
                button.appendChild(shine);
            }
            
            button.addEventListener('mouseenter', () => {
                button.style.transform = 'translateY(-2px) scale(1.02)';
                button.style.boxShadow = '0 6px 20px rgba(46, 139, 87, 0.4)';
                
                // Activar efecto de brillo
                const shine = button.querySelector('.shine-effect');
                if (shine) {
                    shine.style.left = '100%';
                }
            });
            
            button.addEventListener('mouseleave', () => {
                button.style.transform = 'translateY(0) scale(1)';
                button.style.boxShadow = '0 2px 8px rgba(46, 139, 87, 0.3)';
                
                // Resetear efecto de brillo
                const shine = button.querySelector('.shine-effect');
                if (shine) {
                    shine.style.left = '-100%';
                }
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
                        renderProducts(filteredProducts, productGrid);
                    }
                }
            } else {
                // Si estamos en otra página, redirigir a productos con filtro
                const searchParams = new URLSearchParams();
                searchParams.set('search', query);
                window.location.href = `productos.html?${searchParams.toString()}`;
            }
        };
        
        // Función para renderizar productos
        const renderProducts = (productsToRender, container) => {
            container.innerHTML = productsToRender.map(product => `
                <div class="product-card" data-category="${product.category}">
                    <div class="product-image">
                        <img src="${product.image}" alt="${product.name}" loading="lazy">
                        <div class="product-overlay">
                            <button class="view-details-btn" data-id="${product.id}">
                                <i class="fas fa-eye"></i> Ver Detalles
                            </button>
                        </div>
                    </div>
                    <div class="product-info">
                        <h3 class="product-name">${product.name}</h3>
                        <p class="product-price">$${product.price.toLocaleString()} CLP</p>
                        <div class="product-actions">
                            <button class="add-to-cart-btn" data-id="${product.id}">
                                <i class="fas fa-shopping-cart"></i> Agregar al Carrito
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
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
    const specialOffers = [
        {
            id: 'OF001',
            name: 'Pack Familiar de Frutas',
            originalPrice: 5000,
            offerPrice: 3500,
            discount: 30,
            category: 'Ofertas Especiales',
            image: 'https://th.bing.com/th/id/OIP.-ghvs7P7auN2dITXfZd5DAHaE7?w=306&h=204&c=7&r=0&o=7&pid=1.7&rm=3',
            stock: 25,
            unit: 'pack',
            description: 'Pack especial con manzanas, naranjas y plátanos. Perfecto para toda la familia. Ahorra un 30% en tu compra.',
            badge: '30% OFF'
        },
        {
            id: 'OF002',
            name: 'Cesta Orgánica Premium',
            originalPrice: 8000,
            offerPrice: 5500,
            discount: 31,
            category: 'Ofertas Especiales',
            image: "https://th.bing.com/th/id/R.4bda382c55d85be8bd155d1e28a4c400?rik=Z0eB0HhaLTY8Iw&riu=http%3a%2f%2f1.bp.blogspot.com%2f-TWenVgDTHzM%2fVFJrG5hhGVI%2fAAAAAAAACIU%2fX1pZWCuHL4U%2fs1600%2fquinoa-espinaca-10.jpg&ehk=iRT%2boMMRJHlmqR2dIzpq8%2bsqCrk9sKa3lZlIalS1zgs%3d&risl=&pid=ImgRaw&r=0",
            stock: 15,
            unit: 'cesta',
            description: 'Selección premium de productos orgánicos: miel, quinua, zanahorias y espinacas. Calidad garantizada.',
            badge: '31% OFF'
        },
        {
            id: 'OF003',
            name: 'Combo Desayuno Saludable',
            originalPrice: 3500,
            offerPrice: 2500,
            discount: 29,
            category: 'Ofertas Especiales',
            image: 'https://image.freepik.com/foto-gratis/leche-fresca-nutritiva-fruta-sana_23-2148239860.jpg',
            stock: 30,
            unit: 'combo',
            description: 'Todo lo necesario para un desayuno nutritivo: leche, frutas frescas y productos orgánicos.',
            badge: '29% OFF'
        },
        {
            id: 'OF004',
            name: 'Kit Verde Completo',
            originalPrice: 6000,
            offerPrice: 4200,
            discount: 30,
            category: 'Ofertas Especiales',
            image: 'https://paseandohilos.com/wp-content/uploads/2015/03/PH_espinaca_Roja_01-1024x1024.jpg',
            stock: 20,
            unit: 'kit',
            description: 'Kit completo de verduras orgánicas: zanahorias, espinacas, pimientos y más. Frescura garantizada.',
            badge: '30% OFF'
        }
    ];

    // Función para renderizar ofertas especiales
    const renderOffers = () => {
        const offersContainer = document.getElementById('offers-grid');
        if (!offersContainer) return;

        offersContainer.innerHTML = specialOffers.map((offer, index) => `
            <div class="offer-card" style="animation-delay: ${index * 0.2}s">
                <div class="offer-badge">${offer.badge}</div>
                <img src="${offer.image}" alt="${offer.name}">
                <div class="offer-content">
                    <h3 class="offer-title">${offer.name}</h3>
                    <p class="offer-description">${offer.description}</p>
                    <div class="offer-pricing">
                        <span class="offer-price">${formatPrice(offer.offerPrice)}</span>
                        <span class="offer-original-price">${formatPrice(offer.originalPrice)}</span>
                        <span class="offer-discount">-${offer.discount}%</span>
                    </div>
                    <div class="offer-actions">
                        <button class="offer-add-btn" data-id="${offer.id}">
                            <i class="fas fa-shopping-cart"></i> Agregar al Carrito
                        </button>
                        <button class="offer-view-btn" data-id="${offer.id}">
                            <i class="fas fa-eye"></i> Ver Detalles
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        // Aplicar animaciones a las ofertas
        setTimeout(() => {
            const offerCards = document.querySelectorAll('.offer-card');
            offerCards.forEach(card => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(30px)';
                card.style.transition = 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            setTimeout(() => {
                                entry.target.style.opacity = '1';
                                entry.target.style.transform = 'translateY(0)';
                            }, Math.random() * 300);
                        }
                    });
                }, { threshold: 0.1 });
                
                observer.observe(card);
            });
        }, 100);
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
            existingItem.quantity++;
        } else {
            cart.push({ ...productToAdd, quantity: 1 });
        }
        
        renderCart();
        // No abrir el carrito automáticamente
        
        // Mostrar notificación
        showNotification(`${offer.name} agregado al carrito`, 'success');
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

        // Ocultar después de 3 segundos
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
        }, 3000);
    };

    // Event listeners para ofertas
    document.body.addEventListener('click', (e) => {
        // Botones de ofertas
        if (e.target.classList.contains('offer-add-btn')) {
            const offerId = e.target.dataset.id;
            addOfferToCart(offerId);
        }
        
        if (e.target.classList.contains('offer-view-btn')) {
            const offerId = e.target.dataset.id;
            const offer = specialOffers.find(o => o.id === offerId);
            if (offer) {
                showProductDetails(offerId);
            }
        }
    });

    // Inicializar ofertas
    renderOffers();
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
            return `
                <div class="carousel-item" data-index="${index}" onclick="window.location.href='${window.productUrlMap[product.id] || '#'}'">
                    <div class="category-badge">${getCategoryName(product.category)}</div>
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                    <div class="carousel-item-content">
                        <h4>${product.name}</h4>
                        <div class="rating">
                            <div class="stars">
                                ${'★'.repeat(5)}
                            </div>
                            <span class="rating-text">(${rating.rating}) · ${rating.reviewCount} reseñas</span>
                        </div>
                        <p class="price">${product.price.toLocaleString()} CLP</p>
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