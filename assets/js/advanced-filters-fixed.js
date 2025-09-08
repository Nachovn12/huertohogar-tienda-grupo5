// Filtros avanzados para la página de productos - VERSIÓN CORREGIDA
document.addEventListener('DOMContentLoaded', function() {
    console.log('Script avanzado cargado');
    
    // Elementos del DOM
    const quickFilters = document.querySelectorAll('.elegant-filter-btn');
    const viewButtons = document.querySelectorAll('.view-btn');
    const productGrid = document.getElementById('product-list-full');
    const productsCount = document.getElementById('products-count');
    const productsTotal = document.getElementById('products-total');
    
    // Estado de los filtros
    let currentFilters = {
        category: '',
        view: 'grid'
    };
    
    // Productos según la rúbrica del proyecto - Ordenados alfabéticamente
    const allProducts = [
        { 
            id: 'VR002', 
            name: 'Espinacas Frescas', 
            category: 'Verduras Orgánicas', 
            price: 700, 
            stock: 'in-stock', 
            seasonal: false, 
            popular: true,
            unit: 'por bolsa de 500g',
            origin: 'Región de O\'Higgins',
            description: 'Espinacas frescas y nutritivas, perfectas para ensaladas y batidos verdes. Cultivadas bajo prácticas orgánicas que garantizan su calidad y valor nutricional.',
            image: 'https://pngimg.com/uploads/spinach/spinach_PNG45.png',
            detailUrl: 'producto/espinacas-frescas.html'
        },
        { 
            id: 'FR001', 
            name: 'Manzanas Fuji', 
            category: 'Frutas Frescas', 
            price: 1200, 
            stock: 'in-stock', 
            seasonal: false, 
            popular: true,
            unit: 'por kilo',
            origin: 'Región del Maule',
            description: 'Manzanas Fuji crujientes y dulces, perfectas para comer frescas o en postres.',
            image: 'https://santaisabel.vtexassets.com/arquivos/ids/174684-900-900?width=900&height=900&aspect=true',
            detailUrl: 'producto/manzanas-fuji.html'
        },
        { 
            id: 'OR001', 
            name: 'Miel Orgánica', 
            category: 'Productos Orgánicos', 
            price: 5000, 
            stock: 'in-stock', 
            seasonal: false, 
            popular: true,
            unit: 'por frasco de 500g',
            origin: 'Región de Los Lagos',
            description: 'Miel orgánica pura de abejas, endulzante natural perfecto para tu mesa.',
            image: 'https://png.pngtree.com/png-clipart/20240720/original/pngtree-family-apiary-organic-honey-food-production-png-image_15597696.png',
            detailUrl: 'producto/miel-organica.html'
        },
        { 
            id: 'FR002', 
            name: 'Naranjas Valencia', 
            category: 'Frutas Frescas', 
            price: 1000, 
            stock: 'in-stock', 
            seasonal: true, 
            popular: false,
            unit: 'por kilo',
            origin: 'Región de Valparaíso',
            description: 'Naranjas Valencia jugosas y ricas en vitamina C, ideales para jugos naturales.',
            image: 'https://static.vecteezy.com/system/resources/previews/022/825/544/non_2x/orange-fruit-orange-on-transparent-background-free-png.png',
            detailUrl: 'producto/naranjas-valencia.html'
        },
        { 
            id: 'VR001', 
            name: 'Pimientos Tricolores', 
            category: 'Verduras Orgánicas', 
            price: 1500, 
            stock: 'in-stock', 
            seasonal: true, 
            popular: false,
            unit: 'por kilo',
            origin: 'Región Metropolitana',
            description: 'Pimientos rojos, amarillos y verdes, perfectos para ensaladas y guisos.',
            image: 'https://png.pngtree.com/png-vector/20241212/ourmid/pngtree-colored-paprica-raw-paprika-fruit-png-image_14613829.png',
            detailUrl: 'producto/pimientos-tricolores.html'
        },
        { 
            id: 'FR003', 
            name: 'Plátanos Cavendish', 
            category: 'Frutas Frescas', 
            price: 800, 
            stock: 'in-stock', 
            seasonal: false, 
            popular: true,
            unit: 'por kilo',
            origin: 'Región de Coquimbo',
            description: 'Plátanos Cavendish dulces y cremosos, perfectos para el desayuno.',
            image: 'https://png.pngtree.com/png-vector/20240128/ourmid/pngtree-ripe-cavendish-banana-png-image_11508971.png',
            detailUrl: 'producto/platanos-cavendish.html'
        },
        { 
            id: 'OR002', 
            name: 'Quinua Orgánica', 
            category: 'Productos Orgánicos', 
            price: 3000, 
            stock: 'in-stock', 
            seasonal: false, 
            popular: true,
            unit: 'por paquete de 400g',
            origin: 'Región de Arica y Parinacota',
            description: 'Quinua orgánica, superalimento rico en proteínas y nutrientes.',
            image: 'https://manare.cl/wp-content/uploads/2023/09/Manare_QuinoaOrganica400g.png',
            detailUrl: 'producto/quinua-organica.html'
        },
        { 
            id: 'LA001', 
            name: 'Leche Entera', 
            category: 'Productos Lácteos', 
            price: 1200, 
            stock: 'in-stock', 
            seasonal: false, 
            popular: true,
            unit: 'por litro',
            origin: 'Producción local',
            description: 'Leche entera fresca y nutritiva, ideal para el desayuno y la preparación de diversos platos.',
            image: 'https://www.soprole.cl/public/storage/imagenes/banners/202304180943Soprole-Lecheentera-litro.png',
            detailUrl: 'producto/leche-entera.html'
        },
        { 
            id: 'VR003', 
            name: 'Zanahorias Orgánicas', 
            category: 'Verduras Orgánicas', 
            price: 900, 
            stock: 'in-stock', 
            seasonal: true, 
            popular: false,
            unit: 'por kilo',
            origin: 'Región de O\'Higgins',
            description: 'Zanahorias orgánicas crujientes y dulces, ricas en betacaroteno y vitamina A.',
            image: 'https://png.pngtree.com/png-vector/20241225/ourmid/pngtree-fresh-organic-carrots-in-a-neat-stack-png-image_14812590.png',
            detailUrl: 'producto/zanahorias-organicas.html'
        }
    ];

    // Función para renderizar productos
    function renderProducts(products) {
        if (!productGrid) {
            console.error('Product grid not found');
            return;
        }

        if (products.length === 0) {
            productGrid.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <h3>No se encontraron productos</h3>
                    <p>Intenta ajustar los filtros para ver más resultados</p>
                </div>
            `;
            return;
        }

        productGrid.innerHTML = products.map(product => createProductCard(product)).join('');
        
        // Asegurar que las imágenes se carguen correctamente
        const images = productGrid.querySelectorAll('img');
        images.forEach(img => {
            img.addEventListener('load', function() {
                this.classList.add('loaded');
                this.style.opacity = '1';
            });
            img.addEventListener('error', function() {
                console.error('Error cargando imagen:', this.src);
                this.style.display = 'none';
            });
        });
        
        // Aplicar estilos según la vista actual
        if (currentFilters.view === 'list') {
            applyListViewStyles();
        } else {
            applyGridViewStyles();
        }
        
        // Actualizar contador de productos
        updateResultsInfo(products.length);
    }

    // Función para crear tarjeta de producto
    function createProductCard(product) {
        const offerPrice = getOfferPrice(product.id);
        const originalPrice = getOriginalPrice(product.id);
        const isOnOffer = isProductOnOffer(product.id);
        
        const discountPercentage = isOnOffer ? Math.round((1 - offerPrice / originalPrice) * 100) : 0;
        
        return `
            <div class="product-card" data-category="${product.category}">
                <div class="product-badges">
                    ${!isOnOffer && product.seasonal ? '<div class="season-badge">Temporada</div>' : ''}
                    ${!isOnOffer && product.popular ? '<div class="new-badge">Popular</div>' : ''}
                    ${isOnOffer ? `<div class="offer-badge">🔥 ${discountPercentage}% OFF</div>` : ''}
                </div>
                <img src="${product.image}" alt="${product.name}" loading="lazy" style="width: 100%; height: 200px; object-fit: contain; object-position: center; display: block; opacity: 1;">
                <div class="product-info">
                    <h4>${product.name}</h4>
                    <p class="product-category">${product.category}</p>
                    <p class="product-origin">🌱 ${product.origin}</p>
                    <div class="product-rating">
                        <div class="stars">★★★★☆</div>
                        <span class="rating-text">(4.2) · 47 reseñas</span>
                    </div>
                    <div class="product-pricing">
                        <span class="price ${isOnOffer ? 'has-offer' : ''}">${formatPrice(offerPrice || product.price)}</span>
                        <span class="product-unit">${product.unit || 'por unidad'}</span>
                        ${isOnOffer ? `<span class="original-price">Antes: ${formatPrice(originalPrice)}</span>` : ''}
                    </div>
                    <div class="quality-badges">
                        ${product.category === 'Productos Orgánicos' ? '<span class="cert-badge organic">🌿 Orgánico</span>' : ''}
                        ${product.origin.includes('local') ? '<span class="cert-badge local">🏠 Local</span>' : ''}
                        ${product.seasonal ? '<span class="cert-badge seasonal">🍃 Fresco</span>' : ''}
                    </div>
                    <div class="product-actions">
                        <a href="${product.detailUrl}" class="view-details-btn" data-id="${product.id}">
                            <i class="fas fa-info-circle"></i> Ver Detalles
                        </a>
                        <button class="add-to-cart-btn" data-id="${product.id}">
                            <i class="fas fa-shopping-cart"></i> Agregar al Carrito
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Función para formatear precios
    function formatPrice(price) {
        return `$${price.toLocaleString('es-CL')} CLP`;
    }

    // Funciones de ofertas (importadas del script principal)
    function getOfferPrice(productId) {
        if (typeof window.getOfferPrice === 'function') {
            return window.getOfferPrice(productId);
        }
        return null;
    }

    function getOriginalPrice(productId) {
        if (typeof window.getOriginalPrice === 'function') {
            return window.getOriginalPrice(productId);
        }
        return null;
    }

    function isProductOnOffer(productId) {
        if (typeof window.isProductOnOffer === 'function') {
            return window.isProductOnOffer(productId);
        }
        return false;
    }

    // Función para actualizar información de resultados
    function updateResultsInfo(count) {
        if (productsCount) {
            productsCount.textContent = `Mostrando ${count} productos`;
        }
        if (productsTotal) {
            productsTotal.textContent = `de ${allProducts.length} total`;
        }
    }

    // Función para aplicar filtros
    function applyFilters() {
        let filteredProducts = allProducts;
        
        if (currentFilters.category && currentFilters.category !== 'all') {
            filteredProducts = allProducts.filter(product => 
                product.category === currentFilters.category
            );
        }
        
        renderProducts(filteredProducts);
    }

    // Función para manejar cambio de vista
    function handleViewChange(view) {
        currentFilters.view = view;
        
        // Actualizar botones de vista
        viewButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.view === view) {
                btn.classList.add('active');
            }
        });
        
        // Aplicar clase de vista al contenedor
        if (productGrid) {
            productGrid.className = `product-grid content-section ${view}-view`;
        }
        
        // Aplicar estilos específicos
        if (view === 'list') {
            applyListViewStyles();
        } else {
            applyGridViewStyles();
        }
    }

    // Función para manejar filtros rápidos
    function handleQuickFilter(category) {
        currentFilters.category = category;
        
        // Actualizar botones de filtro
        quickFilters.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.category === category) {
                btn.classList.add('active');
            }
        });
        
        applyFilters();
    }

    // Función para configurar event listeners
    function setupEventListeners() {
        console.log('Configurando event listeners');
        
        // Filtros rápidos
        quickFilters.forEach(btn => {
            btn.addEventListener('click', function() {
                const category = this.dataset.category;
                handleQuickFilter(category);
            });
        });
        
        // Vista de productos
        viewButtons.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                const view = this.dataset.view;
                console.log('Cambiando vista a:', view);
                handleViewChange(view);
            });
        });
    }

    // Función para aplicar estilos de vista de grid
    function applyGridViewStyles() {
        if (!productGrid) return;
        
        const cards = productGrid.querySelectorAll('.product-card');
        cards.forEach(card => {
            card.style.display = 'block';
            card.style.width = '100%';
            card.style.maxWidth = '100%';
        });
        
        console.log('Estilos de vista de grid aplicados correctamente');
    }

    // Función para aplicar estilos de vista de lista
    function applyListViewStyles() {
        if (!productGrid) return;
        
        const cards = productGrid.querySelectorAll('.product-card');
        cards.forEach(card => {
            card.style.display = 'flex';
            card.style.width = '100%';
            card.style.maxWidth = '100%';
            card.style.alignItems = 'center';
            card.style.gap = '1.5rem';
            card.style.padding = '1rem';
            card.style.marginBottom = '1rem';
            
            const img = card.querySelector('img');
            if (img) {
                img.style.width = '120px';
                img.style.height = '120px';
                img.style.objectFit = 'cover';
                img.style.borderRadius = '8px';
                img.style.flexShrink = '0';
            }
            
            const productInfo = card.querySelector('.product-info');
            if (productInfo) {
                productInfo.style.flex = '1';
                productInfo.style.display = 'flex';
                productInfo.style.flexDirection = 'column';
                productInfo.style.gap = '0.5rem';
            }
            
            const viewBtn = card.querySelector('.view-details-btn');
            if (viewBtn) {
                viewBtn.style.display = 'flex';
                viewBtn.style.alignItems = 'center';
                viewBtn.style.justifyContent = 'center';
                viewBtn.style.gap = '0.375rem';
                viewBtn.style.flex = '1';
                viewBtn.style.padding = '0.625rem 1rem';
                viewBtn.style.opacity = '1';
                viewBtn.style.visibility = 'visible';
            }
            
            const addBtn = card.querySelector('.add-to-cart-btn');
            if (addBtn) {
                addBtn.style.display = 'flex';
                addBtn.style.alignItems = 'center';
                addBtn.style.justifyContent = 'center';
                addBtn.style.gap = '0.375rem';
                addBtn.style.flex = '1';
                addBtn.style.padding = '0.625rem 1rem';
                addBtn.style.opacity = '1';
                addBtn.style.visibility = 'visible';
            }
        });
        
        console.log('Estilos de vista de lista aplicados correctamente');
    }

    // Inicializar todo
    console.log('Inicializando filtros avanzados...');
    setupEventListeners();
    applyFilters();
    console.log('Filtros avanzados inicializados correctamente');
});