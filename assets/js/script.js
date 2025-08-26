document.addEventListener('DOMContentLoaded', () => {
    // --- Datos Completos de Productos (Basados en el PDF) ---
    const products = [
        { id: 'FR001', name: 'Manzanas Fuji', price: 1200, category: 'Frutas Frescas', image: 'https://santaisabel.vtexassets.com/arquivos/ids/174684-900-900?width=900&height=900&aspect=true' },
        { id: 'FR002', name: 'Naranjas Valencia', price: 1000, category: 'Frutas Frescas', image: 'https://fruverhome.co/wp-content/uploads/2020/08/naranjavalencia.jpg.webp' },
        { id: 'FR003', name: 'Plátanos Cavendish', price: 800, category: 'Frutas Frescas', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Cavendish_Banana_DS.jpg/1200px-Cavendish_Banana_DS.jpg'},
        { id: 'VR001', name: 'Zanahorias Orgánicas', price: 900, category: 'Verduras Orgánicas', image: 'https://png.pngtree.com/png-vector/20241225/ourmid/pngtree-fresh-organic-carrots-in-a-neat-stack-png-image_14812590.png' },
        { id: 'VR002', name: 'Espinacas Frescas', price: 700, category: 'Verduras Orgánicas', image: 'https://fruverhome.co/wp-content/uploads/2020/08/Espinaca-Baby.jpg.webp' },
        { id: 'VR003', name: 'Pimientos Tricolores', price: 1500, category: 'Verduras Orgánicas', image: 'https://png.pngtree.com/png-vector/20241212/ourmid/pngtree-colored-paprica-raw-paprika-fruit-png-image_14613829.png' },
        { id: 'PO001', name: 'Miel Orgánica', price: 5000, category: 'Productos Orgánicos', image: 'https://png.pngtree.com/png-clipart/20240720/original/pngtree-family-apiary-organic-honey-food-production-png-image_15597696.png' },
        { id: 'PO003', name: 'Quinua Orgánica', price: 3000, category: 'Productos Orgánicos', image: 'https://manare.cl/wp-content/uploads/2023/09/Manare_QuinoaOrganica400g.png' },
        { id: 'PL001', name: 'Leche Entera', price: 1800, category: 'Productos Lácteos', image: 'https://www.mitiendacolun.cl/media/catalog/product/m/i/mid_leche_entera_1lt.jpg?quality=80&bg-color=255,255,255&fit=bounds&height=700&width=700&canvas=700:700' }
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

    const renderProducts = (category = 'all', container, limit = null) => {
        if (!container) return;
        const filtered = category === 'all' ? products : products.filter(p => p.category === category);
        const productsToRender = limit ? filtered.slice(0, limit) : filtered;

        container.innerHTML = productsToRender.map((product, index) => `
            <div class="product-card grid-card" style="--delay: ${index * 0.1}s">
                <img src="${product.image}" alt="${product.name}">
                <div class="product-info">
                    <h4>${product.name}</h4>
                    <p class="price">${formatPrice(product.price)}</p>
                    <button class="add-to-cart-btn" data-id="${product.id}">Agregar al Carrito</button>
                </div>
            </div>
        `).join('');
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
            });
        });
    }

    // --- Event Listeners Globales ---
    if (openCartBtn) {
        openCartBtn.addEventListener('click', (e) => { e.preventDefault(); openCart(); });
        closeCartBtn.addEventListener('click', closeCart);
        cartOverlay.addEventListener('click', closeCart);
    }

    document.body.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart-btn')) {
            addToCart(e.target.dataset.id);
        }
        if (e.target.classList.contains('remove-btn')) {
            removeFromCart(e.target.dataset.id);
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
        renderProducts('all', productListHome, 4);
    }
    if (productListFull) {
        renderProducts('all', productListFull);
    }
    renderCart();
});