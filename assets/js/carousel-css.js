// Carrusel Infinito Solo CSS - Basado en https://blog.logto.io/es/carrusel-de-desplazamiento-infinito-solo-con-css

// Función global para inicializar el carrusel infinito de productos recomendados
function initializeCarousel(currentProductId) {
    const carouselWrapper = document.getElementById('carousel-wrapper');
    
    if (!carouselWrapper) {
        return;
    }
    
    // Los controles de carrusel han sido eliminados - solo CSS maneja la animación
    
    // Función para intentar inicializar el carrusel
    const tryInitializeCarousel = () => {
        const storedProducts = localStorage.getItem('huertohogar_products');
        
        if (!storedProducts) {
            setTimeout(tryInitializeCarousel, 100);
            return;
        }
        
        const allProducts = JSON.parse(storedProducts);
        
        const currentProduct = allProducts.find(p => p.id === currentProductId);
        
        if (!currentProduct) {
            return;
        }
        initializeCarouselWithProducts(allProducts, currentProduct);
    };
    
    tryInitializeCarousel();
}

// Función auxiliar para inicializar el carrusel con los productos
function initializeCarouselWithProducts(allProducts, currentProduct) {
    const carouselWrapper = document.getElementById('carousel-wrapper');
    
    // Filtrar productos relacionados (misma categoría o productos similares)
    const relatedProducts = allProducts.filter(product => 
        product.id !== currentProduct.id && 
        (product.category === currentProduct.category || 
         product.category === 'Productos Orgánicos' || 
         product.category === 'Frutas Frescas' ||
         product.category === 'Verduras Orgánicas')
    ).slice(0, 6); // 6 productos para el carrusel CSS
    
    if (relatedProducts.length === 0) {
        return;
    }
    
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
    
    // Función para obtener la URL correcta del producto
    function getProductUrl(productId) {
        const baseUrl = window.productUrlMap[productId];
        if (!baseUrl) return '#';
        
        // Si ya estamos en la carpeta producto/, usar solo el nombre del archivo
        if (window.location.pathname.includes('/producto/')) {
            return baseUrl.replace('producto/', '');
        }
        
        // Si estamos en la raíz, usar la ruta completa
        return baseUrl;
    }
    
    // Renderizar productos en el carrusel (duplicados para CSS infinito)
    function renderCarouselItems() {
        const duplicatedProducts = [...relatedProducts, ...relatedProducts];
        carouselWrapper.innerHTML = duplicatedProducts.map((product, index) => {
            const rating = generateRating();
            const productUrl = getProductUrl(product.id);
            return `
                <div class="carousel-item" data-index="${index}" onclick="window.location.href='${productUrl}'">
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
                        <button class="view-product-btn" onclick="event.stopPropagation(); window.location.href='${productUrl}'">
                            <i class="fas fa-shopping-cart"></i> Ver Producto
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    // Inicializar carrusel
    renderCarouselItems();
}
