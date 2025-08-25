document.addEventListener('DOMContentLoaded', () => {
    // Datos de productos actualizados y completos basados en el documento "DSY1104 - Forma A tienda HUERTO HOGAR.pdf"
    // NOTA: Es recomendable reemplazar estas URLs de imágenes externas con imágenes locales para mayor fiabilidad.
    const products = [
        { id: 'FR001', name: 'Manzanas Fuji', price: 1200, category: 'Frutas Frescas', stock: 150, image: 'http://santaisabel.vtexassets.com/arquivos/ids/174684/Manzana-Fuji-granel.jpg?v=637574808673230000' },
        { id: 'FR002', name: 'Naranjas Valencia', price: 1000, category: 'Frutas Frescas', stock: 200, image: 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcRry7q05SrzoFgt3jUa5WL3TArBTtFSlQBArpA_nGg4qt95uWEG-czrd84zL_w5oHzlEy6zsxvry49eyamRuGvIlZHGe7f00Soduin9DnGpq9NuxYiteOOH' },
        { id: 'FR003', name: 'Plátanos Cavendish', price: 800, category: 'Frutas Frescas', stock: 250, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Cavendish_Banana_DS.jpg/1200px-Cavendish_Banana_DS.jpg' },
        { id: 'VR001', name: 'Zanahorias Orgánicas', price: 900, category: 'Verduras Orgánicas', stock: 100, image: 'https://png.pngtree.com/png-vector/20241225/ourmid/pngtree-fresh-organic-carrots-in-a-neat-stack-png-image_14812590.png' },
        { id: 'VR002', name: 'Espinacas Frescas', price: 700, category: 'Verduras Orgánicas', stock: 80, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSR4TtvpdemZRiVTnLwPUfNumCCZoMhoitxLQ&s'},
        { id: 'VR003', name: 'Pimientos Tricolores', price: 1500, category: 'Verduras Orgánicas', stock: 120, image: 'https://img.freepik.com/foto-gratis/pimientos-frescos-maduros-aislados-blanco_632805-15.jpg?semt=ais_hybrid&w=740&q=80' },
        { id: 'PO001', name: 'Miel Orgánica', price: 5000, category: 'Productos Orgánicos', stock: 50, image: 'https://png.pngtree.com/png-vector/20241120/ourmid/pngtree-organic-honey-in-burlap-covered-jar-png-image_14507168.png' },
        { id: 'PO003', name: 'Quinua Orgánica', price: 3000, category: 'Productos Orgánicos', stock: 75, image: 'https://manare.cl/wp-content/uploads/2023/09/Manare_QuinoaOrganica400g.png' },
        { id: 'PL001', name: 'Leche Entera', price: 1800, category: 'Productos Lácteos', stock: 90, image: 'https://cdnx.jumpseller.com/sala-de-venta-express/image/48990344/resize/610/610?1719114473' }
    ];

    const productList = document.getElementById('product-list');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const cartItemsList = document.getElementById('cart-items');
    const cartTotalSpan = document.getElementById('cart-total');

    let cart = JSON.parse(localStorage.getItem('huertoHogarCart')) || [];

    const formatPrice = (price) => `$${price.toLocaleString('es-CL')} CLP`;

    const renderProducts = (category = 'all') => {
        const filteredProducts = category === 'all' ? products : products.filter(p => p.category === category);
        productList.innerHTML = '';
        filteredProducts.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <h4>${product.name}</h4>
                <p class="price">${formatPrice(product.price)}</p>
                <button class="add-to-cart-btn" data-id="${product.id}">Agregar al carrito</button>
            `;
            productList.appendChild(productCard);
        });
    };

    const renderCart = () => {
        if (cart.length === 0) {
            cartItemsList.innerHTML = '<p>Tu carrito está vacío.</p>';
            cartTotalSpan.textContent = formatPrice(0);
            return;
        }

        cartItemsList.innerHTML = '';
        let total = 0;
        cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            cartItem.innerHTML = `
                <span>${item.name} (${item.quantity})</span>
                <span>${formatPrice(itemTotal)} <button class="remove-btn" data-id="${item.id}">X</button></span>
            `;
            cartItemsList.appendChild(cartItem);
        });

        cartTotalSpan.textContent = formatPrice(total);
        localStorage.setItem('huertoHogarCart', JSON.stringify(cart));
    };

    const addToCart = (productId) => {
        const productToAdd = products.find(p => p.id === productId);
        const existingItem = cart.find(item => item.id === productId);

        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ ...productToAdd, quantity: 1 });
        }
        renderCart();
    };

    const removeFromCart = (productId) => {
        cart = cart.filter(item => item.id !== productId);
        renderCart();
    };

    // Listeners
    productList.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart-btn')) {
            addToCart(e.target.dataset.id);
        }
    });

    cartItemsList.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-btn')) {
            removeFromCart(e.target.dataset.id);
        }
    });

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            renderProducts(button.dataset.category);
        });
    });

    // Initial render
    renderProducts();
    renderCart();
});