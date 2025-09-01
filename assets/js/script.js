document.addEventListener('DOMContentLoaded', () => {
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
        const product = products.find(p => p.id === productId);
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
        const productToAdd = products.find(p => p.id === productId);
        if (!productToAdd) return;
        const existingItem = cart.find(item => item.id === productId);

        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ ...productToAdd, quantity: 1 });
        }
        
        renderCart();
        openCart();
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
            showProductDetails(e.target.dataset.id);
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

    // Inicializar animaciones de categorías
    animateCategories();
    
    // Inicializar animaciones mejoradas para productos
    enhanceProductAnimations();
    enhanceImageAnimations();
    enhanceButtonAnimations();
    
    // Actualizar contadores de productos por categoría
    updateCategoryProductCounts();
});