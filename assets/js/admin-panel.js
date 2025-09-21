/**
 * PANEL DE ADMINISTRACIÓN DE PRODUCTOS - HUERTOHOGAR
 * Sistema CRUD completo para gestión de productos con localStorage
 */

class AdminPanel {
    constructor() {
        this.products = [];
        this.filteredProducts = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.editingProduct = null;
        this.productsPerPage = 10;
        this.trashProducts = [];
        this.selectedTrashItems = [];
        this.inactivityTimer = null;
        this.warningTimer = null;
        this.lastActivity = Date.now();
        
        // Claves de localStorage
        this.STORAGE_KEY = 'huertohogar_products';
        this.TRASH_KEY = 'huertohogar_products_trash';
        this.CATEGORIES_KEY = 'huertohogar_categories';
        
        // Elementos del DOM
        this.elements = {
            // Tabla y lista
            productsTable: document.getElementById('products-table'),
            productsTbody: document.getElementById('products-tbody'),
            productsPagination: document.getElementById('products-pagination'),
            
            // Botones principales
            addProductBtn: document.getElementById('add-product-btn'),
            refreshProductsBtn: document.getElementById('refresh-products-btn'),
            exportProductsBtn: document.getElementById('export-products'),
            importProductsBtn: document.getElementById('import-products'),
            
            // Filtros
            searchInput: document.getElementById('admin-search'),
            categoryFilter: document.getElementById('category-filter'),
            statusFilter: document.getElementById('status-filter'),
            clearFiltersBtn: document.getElementById('clear-filters'),
            
            // Estadísticas
            totalProducts: document.getElementById('total-products'),
            totalCategories: document.getElementById('total-categories'),
            avgPrice: document.getElementById('avg-price'),
            featuredProducts: document.getElementById('featured-products'),
            
            // Modales
            productModal: document.getElementById('product-modal'),
            deleteModal: document.getElementById('delete-modal'),
            trashModal: document.getElementById('trash-modal'),
            closeModal: document.getElementById('close-modal'),
            closeDeleteModal: document.getElementById('close-delete-modal'),
            closeTrashModal: document.getElementById('close-trash-modal'),
            
            // Formulario de producto
            productForm: document.getElementById('product-form'),
            modalTitle: document.getElementById('modal-title'),
            cancelProduct: document.getElementById('cancel-product'),
            saveProduct: document.getElementById('save-product'),
            
            // Modal de eliminación
            deleteProductName: document.getElementById('delete-product-name'),
            cancelDelete: document.getElementById('cancel-delete'),
            confirmDelete: document.getElementById('confirm-delete'),
            
            // Input de importación
            importFileInput: document.getElementById('import-file-input'),
            
            // Papelera
            viewTrashBtn: document.getElementById('view-trash-btn'),
            trashCount: document.getElementById('trash-count'),
            trashTbody: document.getElementById('trash-tbody'),
            trashEmpty: document.getElementById('trash-empty'),
            selectAllTrash: document.getElementById('select-all-trash'),
            restoreAllBtn: document.getElementById('restore-all-btn'),
            deleteAllBtn: document.getElementById('delete-all-btn')
        };
        
        this.init();
    }
    
    init() {
        this.loadProducts();
        this.loadTrashProducts();
        this.setupEventListeners();
        this.setupAutoLogout();
        this.updateStatistics();
        this.populateCategoryFilter();
        this.renderProducts();
        this.updateTrashCount();
    }
    
    setupEventListeners() {
        // Botones principales
        this.elements.addProductBtn.addEventListener('click', () => this.openProductModal());
        this.elements.refreshProductsBtn.addEventListener('click', () => this.refreshProducts());
        this.elements.exportProductsBtn.addEventListener('click', () => this.exportProducts());
        this.elements.importProductsBtn.addEventListener('click', () => this.importProducts());
        
        // Filtros
        this.elements.searchInput.addEventListener('input', () => this.applyFilters());
        this.elements.categoryFilter.addEventListener('change', () => this.applyFilters());
        this.elements.statusFilter.addEventListener('change', () => this.applyFilters());
        this.elements.clearFiltersBtn.addEventListener('click', () => this.clearFilters());
        
        // Modales
        this.elements.closeModal.addEventListener('click', () => this.closeProductModal());
        this.elements.closeDeleteModal.addEventListener('click', () => this.closeDeleteModal());
        this.elements.cancelProduct.addEventListener('click', () => this.closeProductModal());
        this.elements.cancelDelete.addEventListener('click', () => this.closeDeleteModal());
        
        // Formulario
        this.elements.productForm.addEventListener('submit', (e) => this.handleProductSubmit(e));
        
        // Botón de confirmar eliminación
        if (this.elements.confirmDelete) {
            this.elements.confirmDelete.addEventListener('click', () => {
                console.log('Botón confirmDelete clickeado');
                this.deleteProduct();
            });
            console.log('Event listener para confirmDelete configurado');
        } else {
            console.error('Elemento confirmDelete no encontrado');
        }
        
        // Importación de archivos
        this.elements.importFileInput.addEventListener('change', (e) => this.handleFileImport(e));
        
        // Papelera
        this.elements.viewTrashBtn.addEventListener('click', () => this.openTrashModal());
        this.elements.closeTrashModal.addEventListener('click', () => this.closeTrashModal());
        this.elements.selectAllTrash.addEventListener('change', () => this.toggleSelectAllTrash());
        this.elements.restoreAllBtn.addEventListener('click', () => this.restoreSelectedItems());
        this.elements.deleteAllBtn.addEventListener('click', () => this.deleteSelectedItemsPermanently());
        
        // Cerrar modales al hacer clic fuera
        this.elements.productModal.addEventListener('click', (e) => {
            if (e.target === this.elements.productModal) {
                this.closeProductModal();
            }
        });
        
        this.elements.deleteModal.addEventListener('click', (e) => {
            if (e.target === this.elements.deleteModal) {
                this.closeDeleteModal();
            }
        });
        
        this.elements.trashModal.addEventListener('click', (e) => {
            if (e.target === this.elements.trashModal) {
                this.closeTrashModal();
            }
        });
    }
    
    // === CERRADO AUTOMÁTICO DE SESIÓN ===
    setupAutoLogout() {
        console.log('Configurando cierre automático de sesión del admin...');
        
        // Detectar actividad del usuario para reiniciar el timer
        const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
        activityEvents.forEach(event => {
            document.addEventListener(event, () => {
                this.resetInactivityTimer();
            }, true);
        });
        
        // Detectar cuando el usuario intenta salir de la página
        window.addEventListener('beforeunload', (e) => {
            console.log('Usuario intentando salir de la página - cerrando sesión admin');
            this.logoutAdmin();
        });
        
        // Detectar cuando la página se está descargando
        window.addEventListener('unload', () => {
            console.log('Página descargándose - cerrando sesión admin');
            this.logoutAdmin();
        });
        
        // Detectar cuando la página pierde el foco
        window.addEventListener('blur', () => {
            console.log('Página perdió el foco - iniciando timer de inactividad');
            this.setInactivityTimer();
        });
        
        // Detectar cuando la página recupera el foco
        window.addEventListener('focus', () => {
            console.log('Página recuperó el foco - limpiando timer de inactividad');
            this.clearInactivityTimer();
        });
        
        // Detectar cambios de visibilidad de la página
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                console.log('Página oculta - iniciando timer de inactividad');
                this.setInactivityTimer();
            } else {
                console.log('Página visible - limpiando timer de inactividad');
                this.clearInactivityTimer();
            }
        });
        
        // Iniciar timer de inactividad general
        this.startGeneralInactivityTimer();
        
        console.log('Cierre automático de sesión configurado correctamente');
    }
    
    resetInactivityTimer() {
        this.lastActivity = Date.now();
        this.clearInactivityTimer();
        this.startGeneralInactivityTimer();
    }
    
    startGeneralInactivityTimer() {
        // Cerrar sesión después de 10 minutos de inactividad total
        this.inactivityTimer = setTimeout(() => {
            console.log('Sesión cerrada por inactividad general (10 minutos)');
            this.logoutAdmin();
        }, 10 * 60 * 1000); // 10 minutos
        
        // Mostrar advertencia 2 minutos antes del cierre
        this.warningTimer = setTimeout(() => {
            this.showInactivityWarning();
        }, 8 * 60 * 1000); // 8 minutos (2 minutos antes del cierre)
    }
    
    showInactivityWarning() {
        this.showMessage('⚠️ Tu sesión se cerrará en 2 minutos por inactividad. Mueve el mouse o haz clic para mantener la sesión activa.', 'warning');
    }
    
    setInactivityTimer() {
        // Cerrar sesión después de 5 minutos de inactividad
        this.inactivityTimer = setTimeout(() => {
            console.log('Sesión cerrada por inactividad');
            this.logoutAdmin();
        }, 5 * 60 * 1000); // 5 minutos
    }
    
    clearInactivityTimer() {
        if (this.inactivityTimer) {
            clearTimeout(this.inactivityTimer);
            this.inactivityTimer = null;
        }
        if (this.warningTimer) {
            clearTimeout(this.warningTimer);
            this.warningTimer = null;
        }
    }
    
    logoutAdmin() {
        console.log('Cerrando sesión del administrador...');
        
        // Limpiar datos de sesión del admin
        localStorage.removeItem('huertoHogarAuth');
        sessionStorage.removeItem('huertoHogarAuth');
        localStorage.removeItem('huertohogar_is_admin');
        localStorage.removeItem('huertohogar_user_role');
        
        // Limpiar timer de inactividad
        this.clearInactivityTimer();
        
        // Mostrar mensaje de sesión cerrada
        this.showMessage('Sesión cerrada automáticamente por seguridad', 'info');
        
        // Redirigir al login después de un breve delay
        setTimeout(() => {
            showAdminLogin();
        }, 2000);
        
        console.log('Sesión del administrador cerrada correctamente');
    }
    
    // === GESTIÓN DE PRODUCTOS ===
    loadProducts() {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
            this.products = JSON.parse(stored);
        } else {
            // Cargar productos por defecto si no hay ninguno
            this.products = this.getDefaultProducts();
            this.saveProducts();
        }
        this.filteredProducts = [...this.products];
    }
    
    saveProducts() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.products));
        this.updateStatistics();
    }
    
    loadTrashProducts() {
        const stored = localStorage.getItem(this.TRASH_KEY);
        this.trashProducts = stored ? JSON.parse(stored) : [];
    }
    
    saveTrashProducts() {
        localStorage.setItem(this.TRASH_KEY, JSON.stringify(this.trashProducts));
        this.updateTrashCount();
    }
    
    getDefaultProducts() {
        return [
            {
                id: 1,
                name: "Manzanas Fuji",
                category: "Frutas Frescas",
                price: 2500,
                stock: 50,
                image: "https://images.pexels.com/photos/102104/pexels-photo-102104.jpeg?auto=compress&cs=tinysrgb&w=400",
                unit: "kg",
                description: "Manzanas Fuji frescas y crujientes, perfectas para el consumo diario.",
                features: ["Fresco", "De temporada", "Nutritivo"],
                featured: true,
                active: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                name: "Espinacas Orgánicas",
                category: "Verduras Orgánicas",
                price: 1800,
                stock: 30,
                image: "https://images.pexels.com/photos/2325840/pexels-photo-2325840.jpeg?auto=compress&cs=tinysrgb&w=400",
                unit: "kg",
                description: "Espinacas orgánicas cultivadas sin pesticidas, ricas en hierro y vitaminas.",
                features: ["Orgánico", "Sin pesticidas", "Rico en hierro"],
                featured: false,
                active: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 3,
                name: "Miel Orgánica",
                category: "Productos Orgánicos",
                price: 4500,
                stock: 20,
                image: "https://images.pexels.com/photos/33783/honey-jar-honey-comb-beeswax-bee-hive.jpg?auto=compress&cs=tinysrgb&w=400",
                unit: "unidad",
                description: "Miel pura de abejas, endulzante natural sin procesar.",
                features: ["Natural", "Sin procesar", "Endulzante natural"],
                featured: true,
                active: true,
                createdAt: new Date().toISOString()
            }
        ];
    }
    
    // === FILTROS Y BÚSQUEDA ===
    applyFilters() {
        const searchTerm = this.elements.searchInput.value.toLowerCase();
        const categoryFilter = this.elements.categoryFilter.value;
        const statusFilter = this.elements.statusFilter.value;
        
        this.filteredProducts = this.products.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchTerm) ||
                                product.description.toLowerCase().includes(searchTerm) ||
                                product.category.toLowerCase().includes(searchTerm);
            
            const matchesCategory = !categoryFilter || product.category === categoryFilter;
            const matchesStatus = !statusFilter || 
                                (statusFilter === 'active' && product.active) ||
                                (statusFilter === 'inactive' && !product.active);
            
            return matchesSearch && matchesCategory && matchesStatus;
        });
        
        this.currentPage = 1;
        this.renderProducts();
    }
    
    clearFilters() {
        this.elements.searchInput.value = '';
        this.elements.categoryFilter.value = '';
        this.elements.statusFilter.value = '';
        this.filteredProducts = [...this.products];
        this.currentPage = 1;
        this.renderProducts();
    }
    
    // === RENDERIZADO ===
    renderProducts() {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const productsToShow = this.filteredProducts.slice(startIndex, endIndex);
        
        this.elements.productsTbody.innerHTML = '';
        
        if (productsToShow.length === 0) {
            this.elements.productsTbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 3rem; color: var(--color-text-secondary);">
                        <i class="fas fa-box-open" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                        <p>No se encontraron productos</p>
                    </td>
                </tr>
            `;
        } else {
            productsToShow.forEach(product => {
                const row = this.createProductRow(product);
                this.elements.productsTbody.appendChild(row);
            });
        }
        
        this.renderPagination();
    }
    
    createProductRow(product) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <img src="${product.image}" alt="${product.name}" class="product-image" 
                     onerror="this.src='https://via.placeholder.com/60x60?text=Sin+Imagen'">
            </td>
            <td>
                <div class="product-name">${product.name}</div>
                <div class="product-category">${product.category}</div>
            </td>
            <td>${product.category}</td>
            <td class="product-price">$${product.price.toLocaleString('es-CL')}</td>
            <td class="product-stock">${product.stock} ${product.unit}</td>
            <td>
                <span class="product-status ${product.active ? 'active' : 'inactive'}">
                    ${product.active ? 'Activo' : 'Inactivo'}
                </span>
            </td>
            <td>
                <span class="product-featured ${product.featured ? 'yes' : 'no'}">
                    ${product.featured ? 'Sí' : 'No'}
                </span>
            </td>
            <td>
                <div class="product-actions">
                    <button class="btn-action btn-edit" onclick="editProduct('${product.id}')" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action btn-delete" onclick="confirmDeleteProduct('${product.id}')" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        return row;
    }
    
    renderPagination() {
        const totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
        
        if (totalPages <= 1) {
            this.elements.productsPagination.innerHTML = '';
            return;
        }
        
        let paginationHTML = '';
        
        // Botón anterior
        paginationHTML += `
            <button class="pagination-btn" ${this.currentPage === 1 ? 'disabled' : ''} 
                    onclick="goToPage(${this.currentPage - 1})">
                <i class="fas fa-chevron-left"></i>
            </button>
        `;
        
        // Números de página
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
                paginationHTML += `
                    <button class="pagination-btn ${i === this.currentPage ? 'active' : ''}" 
                            onclick="goToPage(${i})">
                        ${i}
                    </button>
                `;
            } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
                paginationHTML += '<span class="pagination-ellipsis">...</span>';
            }
        }
        
        // Botón siguiente
        paginationHTML += `
            <button class="pagination-btn" ${this.currentPage === totalPages ? 'disabled' : ''} 
                    onclick="goToPage(${this.currentPage + 1})">
                <i class="fas fa-chevron-right"></i>
            </button>
        `;
        
        this.elements.productsPagination.innerHTML = paginationHTML;
    }
    
    goToPage(page) {
        const totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
        if (page >= 1 && page <= totalPages) {
            this.currentPage = page;
            this.renderProducts();
        }
    }
    
    // === MODAL DE PRODUCTO ===
    openProductModal(productId = null) {
        this.editingProduct = productId;
        
        if (productId) {
            const product = this.products.find(p => p.id === productId);
            if (product) {
                this.elements.modalTitle.textContent = 'Editar Producto';
                this.populateProductForm(product);
            }
        } else {
            this.elements.modalTitle.textContent = 'Agregar Producto';
            this.elements.productForm.reset();
        }
        
        this.elements.productModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
    
    closeProductModal() {
        this.elements.productModal.style.display = 'none';
        document.body.style.overflow = '';
        this.elements.productForm.reset();
        this.editingProduct = null;
    }
    
    populateProductForm(product) {
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-category').value = product.category;
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-stock').value = product.stock;
        document.getElementById('product-image').value = product.image;
        document.getElementById('product-unit').value = product.unit;
        document.getElementById('product-description').value = product.description || '';
        document.getElementById('product-features').value = product.features ? product.features.join(', ') : '';
        document.getElementById('product-featured').checked = product.featured;
        document.getElementById('product-active').checked = product.active;
    }
    
    handleProductSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(this.elements.productForm);
        const productData = {
            name: formData.get('name'),
            category: formData.get('category'),
            price: parseInt(formData.get('price')),
            stock: parseInt(formData.get('stock')),
            image: formData.get('image'),
            unit: formData.get('unit'),
            description: formData.get('description'),
            features: formData.get('features') ? formData.get('features').split(',').map(f => f.trim()) : [],
            featured: formData.get('featured') === 'on',
            active: formData.get('active') === 'on'
        };
        
        // Validación básica
        if (!productData.name || !productData.category || !productData.price || !productData.stock || !productData.image) {
            this.showMessage('Por favor, completa todos los campos obligatorios.', 'error');
            return;
        }
        
        if (this.editingProduct) {
            this.updateProduct(this.editingProduct, productData);
        } else {
            this.addProduct(productData);
        }
    }
    
    addProduct(productData) {
        const newProduct = {
            ...productData,
            id: Date.now(), // ID simple basado en timestamp
            createdAt: new Date().toISOString()
        };
        
        this.products.push(newProduct);
        this.saveProducts();
        this.applyFilters();
        this.closeProductModal();
        this.showMessage('Producto agregado exitosamente.', 'success');
    }
    
    updateProduct(productId, productData) {
        const index = this.products.findIndex(p => p.id === productId);
        if (index !== -1) {
            this.products[index] = {
                ...this.products[index],
                ...productData,
                id: productId,
                updatedAt: new Date().toISOString()
            };
            
            this.saveProducts();
            this.applyFilters();
            this.closeProductModal();
            this.showMessage('Producto actualizado exitosamente.', 'success');
        }
    }
    
    editProduct(productId) {
        this.openProductModal(productId);
    }
    
    // === ELIMINACIÓN ===
    confirmDeleteProduct(productId) {
        console.log('confirmDeleteProduct() llamado con ID:', productId);
        console.log('Products array:', this.products);
        console.log('confirmDelete element:', this.elements.confirmDelete);
        
        // Los IDs pueden ser strings o números, así que usamos comparación flexible
        const product = this.products.find(p => p.id == productId);
        console.log('Producto encontrado:', product);
        
        if (product) {
            this.elements.deleteProductName.textContent = product.name;
            this.elements.deleteModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            
            // Guardar el ID del producto a eliminar
            this.elements.confirmDelete.dataset.productId = productId;
            console.log('Dataset productId configurado:', this.elements.confirmDelete.dataset.productId);
            console.log('Modal de eliminación abierto para:', product.name);
        } else {
            console.error('Producto no encontrado:', productId);
            this.showMessage('Error: Producto no encontrado', 'error');
        }
    }
    
    closeDeleteModal() {
        this.elements.deleteModal.style.display = 'none';
        document.body.style.overflow = '';
        this.elements.confirmDelete.dataset.productId = '';
    }
    
    deleteProduct() {
        console.log('deleteProduct() llamado');
        
        // Obtener el ID del producto a eliminar
        const productId = this.elements.confirmDelete.dataset.productId;
        console.log('Product ID (raw):', productId);
        
        if (!productId) {
            console.error('No hay productId en el dataset');
            this.showMessage('Error: No se encontró el ID del producto', 'error');
            return;
        }
        
        // Los IDs pueden ser strings o números, así que los comparamos directamente
        console.log('Products array:', this.products);
        
        const index = this.products.findIndex(p => p.id == productId); // Usar == para comparación flexible
        console.log('Index encontrado:', index);
        
        if (index !== -1) {
            const product = this.products[index];
            const productName = product.name;
            console.log('Producto a eliminar:', productName);
            
            // Agregar fecha de eliminación
            product.deletedAt = new Date().toISOString();
            product.deletedBy = 'admin';
            
            // Mover a la papelera
            this.trashProducts.push(product);
            this.saveTrashProducts();
            console.log('Producto agregado a la papelera');
            
            // Eliminar de la lista principal
            this.products.splice(index, 1);
            this.saveProducts();
            this.applyFilters();
            this.closeDeleteModal();
            this.showMessage(`Producto "${productName}" movido a la papelera.`, 'success');
            console.log('Producto eliminado exitosamente');
        } else {
            console.error('Error al eliminar producto:', productId);
            this.showMessage('Error: No se pudo eliminar el producto', 'error');
        }
    }
    
    // === ESTADÍSTICAS ===
    updateStatistics() {
        const totalProducts = this.products.length;
        const categories = [...new Set(this.products.map(p => p.category))];
        const avgPrice = this.products.length > 0 ? 
            Math.round(this.products.reduce((sum, p) => sum + p.price, 0) / this.products.length) : 0;
        const featuredProducts = this.products.filter(p => p.featured).length;
        
        this.elements.totalProducts.textContent = totalProducts;
        this.elements.totalCategories.textContent = categories.length;
        this.elements.avgPrice.textContent = `$${avgPrice.toLocaleString('es-CL')}`;
        this.elements.featuredProducts.textContent = featuredProducts;
    }
    
    populateCategoryFilter() {
        const categories = [...new Set(this.products.map(p => p.category))];
        const categoryFilter = this.elements.categoryFilter;
        
        // Limpiar opciones existentes (excepto la primera)
        while (categoryFilter.children.length > 1) {
            categoryFilter.removeChild(categoryFilter.lastChild);
        }
        
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
    }
    
    // === IMPORTACIÓN Y EXPORTACIÓN ===
    exportProducts() {
        const dataStr = JSON.stringify(this.products, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `huertohogar-productos-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        this.showMessage('Productos exportados exitosamente.', 'success');
    }
    
    importProducts() {
        this.elements.importFileInput.click();
    }
    
    handleFileImport(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const importedProducts = JSON.parse(event.target.result);
                
                if (Array.isArray(importedProducts)) {
                    // Validar estructura básica
                    const validProducts = importedProducts.filter(p => 
                        p.name && p.category && p.price && p.stock
                    );
                    
                    if (validProducts.length > 0) {
                        // Asignar nuevos IDs para evitar conflictos
                        const newProducts = validProducts.map((p, index) => ({
                            ...p,
                            id: Date.now() + index,
                            createdAt: new Date().toISOString()
                        }));
                        
                        this.products = [...this.products, ...newProducts];
                        this.saveProducts();
                        this.populateCategoryFilter();
                        this.applyFilters();
                        this.showMessage(`${validProducts.length} productos importados exitosamente.`, 'success');
                    } else {
                        this.showMessage('El archivo no contiene productos válidos.', 'error');
                    }
                } else {
                    this.showMessage('Formato de archivo inválido.', 'error');
                }
            } catch (error) {
                this.showMessage('Error al procesar el archivo.', 'error');
                console.error('Error importing products:', error);
            }
        };
        
        reader.readAsText(file);
        e.target.value = ''; // Limpiar el input
    }
    
    // === UTILIDADES ===
    refreshProducts() {
        this.loadProducts();
        this.populateCategoryFilter();
        this.clearFilters();
        this.showMessage('Productos actualizados.', 'info');
    }
    
    showMessage(message, type = 'info') {
        // Remover mensajes existentes
        const existingMessages = document.querySelectorAll('.status-message');
        existingMessages.forEach(msg => msg.remove());
        
        // Crear nuevo mensaje
        const messageDiv = document.createElement('div');
        messageDiv.className = `status-message ${type}`;
        messageDiv.textContent = message;
        
        // Insertar al inicio del contenido principal
        const adminMain = document.querySelector('.admin-main');
        adminMain.insertBefore(messageDiv, adminMain.firstChild);
        
        // Auto-remover después de 5 segundos
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }
    
    // === GESTIÓN DE PAPELERA ===
    updateTrashCount() {
        if (this.elements.trashCount) {
            this.elements.trashCount.textContent = this.trashProducts.length;
        }
    }
    
    openTrashModal() {
        this.elements.trashModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        this.renderTrashProducts();
    }
    
    closeTrashModal() {
        this.elements.trashModal.style.display = 'none';
        document.body.style.overflow = '';
        this.selectedTrashItems = [];
        this.updateTrashActions();
    }
    
    renderTrashProducts() {
        if (this.trashProducts.length === 0) {
            this.elements.trashTbody.innerHTML = '';
            this.elements.trashEmpty.style.display = 'block';
            this.elements.selectAllTrash.checked = false;
            this.updateTrashActions();
            return;
        }
        
        this.elements.trashEmpty.style.display = 'none';
        this.elements.trashTbody.innerHTML = '';
        
        this.trashProducts.forEach((product, index) => {
            const row = this.createTrashRow(product, index);
            this.elements.trashTbody.appendChild(row);
        });
        
        this.updateTrashActions();
    }
    
    createTrashRow(product, index) {
        const row = document.createElement('tr');
        row.dataset.productId = product.id;
        
        const deletedDate = new Date(product.deletedAt).toLocaleDateString('es-CL', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        row.innerHTML = `
            <td>
                <input type="checkbox" class="trash-checkbox" data-product-id="${product.id}">
            </td>
            <td>
                <img src="${product.image}" alt="${product.name}" class="trash-product-image" 
                     onerror="this.src='https://via.placeholder.com/50x50?text=Sin+Imagen'">
            </td>
            <td>
                <div class="trash-product-name">${product.name}</div>
                <div class="trash-product-category">${product.category}</div>
            </td>
            <td>${product.category}</td>
            <td class="product-price">$${product.price.toLocaleString('es-CL')}</td>
            <td class="product-stock">${product.stock} ${product.unit}</td>
            <td class="trash-deleted-date">${deletedDate}</td>
            <td>
                <div class="trash-actions-cell">
                    <button class="btn-restore" onclick="restoreProduct('${product.id}')" title="Recuperar">
                        <i class="fas fa-undo"></i>
                    </button>
                    <button class="btn-delete-permanent" onclick="deleteProductPermanently('${product.id}')" title="Eliminar permanentemente">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        // Event listener para checkbox individual
        const checkbox = row.querySelector('.trash-checkbox');
        checkbox.addEventListener('change', () => {
            this.toggleTrashItemSelection(product.id, checkbox.checked);
        });
        
        return row;
    }
    
    toggleSelectAllTrash() {
        const isChecked = this.elements.selectAllTrash.checked;
        const checkboxes = this.elements.trashTbody.querySelectorAll('.trash-checkbox');
        
        checkboxes.forEach(checkbox => {
            checkbox.checked = isChecked;
            const productId = parseInt(checkbox.dataset.productId);
            this.toggleTrashItemSelection(productId, isChecked);
        });
    }
    
    toggleTrashItemSelection(productId, isSelected) {
        if (isSelected) {
            if (!this.selectedTrashItems.includes(productId)) {
                this.selectedTrashItems.push(productId);
            }
        } else {
            this.selectedTrashItems = this.selectedTrashItems.filter(id => id !== productId);
        }
        
        this.updateTrashActions();
    }
    
    updateTrashActions() {
        const hasSelection = this.selectedTrashItems.length > 0;
        this.elements.restoreAllBtn.disabled = !hasSelection;
        this.elements.deleteAllBtn.disabled = !hasSelection;
        
        // Actualizar texto de botones
        if (hasSelection) {
            this.elements.restoreAllBtn.innerHTML = `
                <i class="fas fa-undo"></i>
                Recuperar (${this.selectedTrashItems.length})
            `;
            this.elements.deleteAllBtn.innerHTML = `
                <i class="fas fa-trash"></i>
                Eliminar (${this.selectedTrashItems.length})
            `;
        } else {
            this.elements.restoreAllBtn.innerHTML = `
                <i class="fas fa-undo"></i>
                Recuperar Todo
            `;
            this.elements.deleteAllBtn.innerHTML = `
                <i class="fas fa-trash"></i>
                Eliminar Todo Permanentemente
            `;
        }
    }
    
    restoreProduct(productId) {
        const index = this.trashProducts.findIndex(p => p.id == productId); // Usar == para comparación flexible
        if (index !== -1) {
            const product = this.trashProducts[index];
            const productName = product.name;
            
            // Remover propiedades de eliminación
            delete product.deletedAt;
            delete product.deletedBy;
            
            // Agregar de vuelta a la lista principal
            this.products.push(product);
            this.saveProducts();
            
            // Remover de la papelera
            this.trashProducts.splice(index, 1);
            this.saveTrashProducts();
            
            // Actualizar vistas
            this.renderTrashProducts();
            this.applyFilters();
            this.updateStatistics();
            
            this.showMessage(`Producto "${productName}" recuperado exitosamente.`, 'success');
        }
    }
    
    deleteProductPermanently(productId) {
        if (confirm('¿Estás seguro de que deseas eliminar este producto permanentemente? Esta acción no se puede deshacer.')) {
            const index = this.trashProducts.findIndex(p => p.id == productId); // Usar == para comparación flexible
            if (index !== -1) {
                const productName = this.trashProducts[index].name;
                this.trashProducts.splice(index, 1);
                this.saveTrashProducts();
                this.renderTrashProducts();
                this.showMessage(`Producto "${productName}" eliminado permanentemente.`, 'success');
            }
        }
    }
    
    restoreSelectedItems() {
        if (this.selectedTrashItems.length === 0) return;
        
        const restoredCount = this.selectedTrashItems.length;
        
        this.selectedTrashItems.forEach(productId => {
            const index = this.trashProducts.findIndex(p => p.id == productId); // Usar == para comparación flexible
            if (index !== -1) {
                const product = this.trashProducts[index];
                delete product.deletedAt;
                delete product.deletedBy;
                
                this.products.push(product);
                this.trashProducts.splice(index, 1);
            }
        });
        
        this.saveProducts();
        this.saveTrashProducts();
        this.renderTrashProducts();
        this.applyFilters();
        this.updateStatistics();
        this.selectedTrashItems = [];
        
        this.showMessage(`${restoredCount} productos recuperados exitosamente.`, 'success');
    }
    
    deleteSelectedItemsPermanently() {
        if (this.selectedTrashItems.length === 0) return;
        
        if (confirm(`¿Estás seguro de que deseas eliminar permanentemente ${this.selectedTrashItems.length} productos? Esta acción no se puede deshacer.`)) {
            const deletedCount = this.selectedTrashItems.length;
            
            this.selectedTrashItems.forEach(productId => {
                const index = this.trashProducts.findIndex(p => p.id == productId); // Usar == para comparación flexible
                if (index !== -1) {
                    this.trashProducts.splice(index, 1);
                }
            });
            
            this.saveTrashProducts();
            this.renderTrashProducts();
            this.selectedTrashItems = [];
            
            this.showMessage(`${deletedCount} productos eliminados permanentemente.`, 'success');
        }
    }
}

// === INICIALIZACIÓN ===
let adminPanel;

document.addEventListener('DOMContentLoaded', () => {
    // Verificar si el usuario tiene permisos de administrador
    const isAdmin = localStorage.getItem('huertohogar_user_role') === 'admin' || 
                   localStorage.getItem('huertohogar_is_admin') === 'true';
    
    if (isAdmin) {
        // Si ya está autenticado, mostrar el panel directamente
        showAdminPanel();
    } else {
        // Si no está autenticado, mostrar el modal de login
        showAdminLogin();
    }
});

function showAdminLogin() {
    const loginModal = document.getElementById('admin-login-modal');
    const mainContent = document.getElementById('admin-main-content');
    
    if (loginModal) {
        loginModal.style.display = 'flex';
    }
    if (mainContent) {
        mainContent.style.display = 'none';
    }
    
    // Configurar el formulario de login
    setupAdminLogin();
}

function showAdminPanel() {
    console.log('showAdminPanel() llamado');
    const loginModal = document.getElementById('admin-login-modal');
    const mainContent = document.getElementById('admin-main-content');
    
    if (loginModal) {
        loginModal.style.display = 'none';
    }
    if (mainContent) {
        mainContent.style.display = 'block';
    }
    
    // Inicializar el panel de administración
    if (!window.adminPanel) {
        console.log('Creando nueva instancia de AdminPanel');
        adminPanel = new AdminPanel();
        window.adminPanel = adminPanel;
        console.log('AdminPanel creado:', window.adminPanel);
    } else {
        console.log('AdminPanel ya existe:', window.adminPanel);
    }
}

function setupAdminLogin() {
    const loginForm = document.getElementById('admin-login-form');
    const passwordToggle = document.getElementById('admin-password-toggle');
    const loginSubmit = document.getElementById('admin-login-submit');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleAdminLogin);
    }
    
    if (passwordToggle) {
        passwordToggle.addEventListener('click', () => {
            togglePasswordVisibility('admin-password', passwordToggle);
        });
    }
}

function handleAdminLogin(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const username = formData.get('username');
    const password = formData.get('password');
    const remember = formData.get('remember') === 'on';
    
    // Validar credenciales
    if (username === 'admin' && password === 'admin') {
        // Credenciales correctas
        setLoadingState('admin-login-submit', true);
        
        // Simular verificación
        setTimeout(() => {
            // Guardar sesión de administrador
            const adminUser = {
                id: 'admin',
                name: 'Administrador',
                email: 'admin',
                role: 'admin',
                isAdmin: true
            };
            
            const sessionData = {
                user: adminUser,
                isAuthenticated: true,
                timestamp: Date.now(),
                remember: remember
            };
            
            if (remember) {
                localStorage.setItem('huertoHogarAuth', JSON.stringify(sessionData));
            } else {
                sessionStorage.setItem('huertoHogarAuth', JSON.stringify(sessionData));
            }
            
            localStorage.setItem('huertohogar_is_admin', 'true');
            localStorage.setItem('huertohogar_user_role', 'admin');
            
            setLoadingState('admin-login-submit', false);
            
            // Mostrar mensaje de éxito
            showMessage('¡Bienvenido, Administrador!', 'success');
            
            // Mostrar el panel después de un breve delay
            setTimeout(() => {
                showAdminPanel();
            }, 1000);
            
        }, 1500);
        
    } else {
        // Credenciales incorrectas
        showMessage('Usuario o contraseña incorrectos', 'error');
    }
}

function setLoadingState(buttonId, loading) {
    const button = document.getElementById(buttonId);
    if (button) {
        const btnText = button.querySelector('.btn-text');
        const btnLoading = button.querySelector('.btn-loading');
        
        if (loading) {
            if (btnText) btnText.style.display = 'none';
            if (btnLoading) btnLoading.style.display = 'flex';
            button.disabled = true;
        } else {
            if (btnText) btnText.style.display = 'flex';
            if (btnLoading) btnLoading.style.display = 'none';
            button.disabled = false;
        }
    }
}

function togglePasswordVisibility(inputId, toggleButton) {
    const input = document.getElementById(inputId);
    const icon = toggleButton.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

function showMessage(message, type = 'info') {
    // Remover mensajes existentes
    const existingMessages = document.querySelectorAll('.admin-status-message');
    existingMessages.forEach(msg => msg.remove());
    
    // Crear nuevo mensaje
    const messageDiv = document.createElement('div');
    messageDiv.className = `admin-status-message ${type}`;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        padding: 1rem 2rem;
        border-radius: 8px;
        font-weight: 500;
        z-index: 10000;
        max-width: 400px;
        text-align: center;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    `;
    
    if (type === 'success') {
        messageDiv.style.background = 'rgba(39, 174, 96, 0.1)';
        messageDiv.style.color = '#27ae60';
        messageDiv.style.border = '1px solid rgba(39, 174, 96, 0.2)';
    } else if (type === 'error') {
        messageDiv.style.background = 'rgba(231, 76, 60, 0.1)';
        messageDiv.style.color = '#e74c3c';
        messageDiv.style.border = '1px solid rgba(231, 76, 60, 0.2)';
    }
    
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);
    
    // Auto-remover después de 3 segundos
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 3000);
}

// Función para cerrar sesión de administrador
function logoutAdmin() {
    localStorage.removeItem('huertoHogarAuth');
    sessionStorage.removeItem('huertoHogarAuth');
    localStorage.removeItem('huertohogar_is_admin');
    localStorage.removeItem('huertohogar_user_role');
    
    showMessage('Sesión cerrada correctamente', 'info');
    
    setTimeout(() => {
        showAdminLogin();
    }, 1000);
}

// Event listener para el botón de cerrar sesión
document.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'admin-logout-btn') {
        e.preventDefault();
        logoutAdmin();
    }
});

// === FUNCIONES GLOBALES PARA EVENT HANDLERS ===
function editProduct(id) {
    if (window.adminPanel) {
        window.adminPanel.editProduct(id);
    }
}

function confirmDeleteProduct(id) {
    console.log('Función global confirmDeleteProduct llamada con ID:', id);
    console.log('window.adminPanel existe:', !!window.adminPanel);
    if (window.adminPanel) {
        console.log('Llamando a adminPanel.confirmDeleteProduct');
        window.adminPanel.confirmDeleteProduct(id);
    } else {
        console.error('adminPanel no está disponible');
    }
}

function goToPage(page) {
    if (window.adminPanel) {
        window.adminPanel.goToPage(page);
    }
}

function restoreProduct(id) {
    if (window.adminPanel) {
        window.adminPanel.restoreProduct(id);
    }
}

function deleteProductPermanently(id) {
    if (window.adminPanel) {
        window.adminPanel.deleteProductPermanently(id);
    }
}
