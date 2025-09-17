# Panel de Administración - HuertoHogar

## Descripción
El Panel de Administración de HuertoHogar es un sistema completo de gestión de productos que permite a los administradores agregar, editar, eliminar y gestionar todos los productos del sitio web de manera eficiente.

## Características Principales

### 🎯 Gestión de Productos
- **Agregar productos**: Formulario completo con validación
- **Editar productos**: Modificación de todos los campos
- **Eliminar productos**: Con confirmación de seguridad
- **Visualización**: Tabla responsive con paginación

### 📊 Estadísticas en Tiempo Real
- Total de productos
- Número de categorías
- Precio promedio
- Productos destacados

### 🔍 Filtros y Búsqueda
- Búsqueda por nombre, descripción o categoría
- Filtro por categoría
- Filtro por estado (activo/inactivo)
- Limpieza rápida de filtros

### 📁 Importación y Exportación
- Exportar productos a JSON
- Importar productos desde archivo JSON
- Validación de datos importados

## Estructura de Archivos

```
├── admin-panel.html          # Página principal del panel
├── assets/css/admin-panel.css # Estilos específicos del panel
├── assets/js/admin-panel.js   # Lógica del panel de administración
└── ADMIN-PANEL-README.md     # Esta documentación
```

## Uso del Panel

### Acceso
1. Navegar a `admin-panel.html` desde cualquier página del sitio
2. El panel verifica automáticamente los permisos de administrador
3. Si no tienes permisos, se mostrará un mensaje de acceso denegado

### Agregar un Producto
1. Hacer clic en "Agregar Producto"
2. Completar el formulario con:
   - **Nombre**: Nombre del producto
   - **Categoría**: Seleccionar de la lista
   - **Precio**: Precio en CLP
   - **Stock**: Cantidad disponible
   - **Imagen**: URL de la imagen
   - **Unidad**: Tipo de medida
   - **Descripción**: Descripción detallada
   - **Características**: Separadas por comas
   - **Destacado**: Marcar si es producto destacado
   - **Activo**: Estado del producto
3. Hacer clic en "Guardar Producto"

### Editar un Producto
1. Hacer clic en el botón de editar (lápiz) en la tabla
2. Modificar los campos necesarios
3. Hacer clic en "Guardar Producto"

### Eliminar un Producto
1. Hacer clic en el botón de eliminar (basura) en la tabla
2. Confirmar la eliminación en el modal
3. El producto se eliminará permanentemente

### Filtros y Búsqueda
- **Búsqueda**: Escribir en el campo de búsqueda
- **Filtro por categoría**: Seleccionar categoría específica
- **Filtro por estado**: Mostrar solo activos o inactivos
- **Limpiar filtros**: Restablecer todos los filtros

### Exportar Productos
1. Hacer clic en "Exportar"
2. Se descargará un archivo JSON con todos los productos

### Importar Productos
1. Hacer clic en "Importar"
2. Seleccionar archivo JSON válido
3. Los productos se agregarán al sistema

## Estructura de Datos

### Producto
```javascript
{
    id: "string",           // ID único del producto
    name: "string",         // Nombre del producto
    category: "string",     // Categoría
    price: number,          // Precio en CLP
    stock: number,          // Cantidad en stock
    image: "string",        // URL de la imagen
    unit: "string",         // Unidad de medida
    description: "string",  // Descripción del producto
    features: ["string"],   // Array de características
    featured: boolean,      // Si es producto destacado
    active: boolean,        // Si está activo
    createdAt: "string",    // Fecha de creación (ISO)
    updatedAt: "string"     // Fecha de actualización (ISO)
}
```

## Integración con el Sistema

### localStorage
- **Clave**: `huertohogar_products`
- **Formato**: Array de objetos producto
- **Sincronización**: Automática con el sitio principal

### Permisos de Administrador
El panel verifica los siguientes valores en localStorage:
- `huertohogar_user_role === 'admin'`
- `huertohogar_is_admin === 'true'`

Para habilitar el acceso, ejecutar en la consola del navegador:
```javascript
localStorage.setItem('huertohogar_is_admin', 'true');
```

## Responsive Design

El panel está completamente optimizado para:
- **Desktop**: Vista completa con tabla y filtros
- **Tablet**: Adaptación de columnas y controles
- **Mobile**: Vista compacta con navegación optimizada

## Tecnologías Utilizadas

- **HTML5**: Estructura semántica
- **CSS3**: Estilos modernos con Flexbox y Grid
- **JavaScript ES6+**: Lógica del panel
- **Font Awesome**: Iconografía
- **localStorage**: Persistencia de datos

## Características de Seguridad

- Validación de permisos de administrador
- Confirmación de eliminación
- Validación de formularios
- Sanitización de datos de entrada
- Verificación de tipos de archivo para importación

## Personalización

### Colores
Los colores se definen en `:root` del archivo CSS:
```css
:root {
    --admin-primary: #2E8B57;
    --admin-secondary: #4CAF50;
    --admin-accent: #FFD700;
    --admin-danger: #e74c3c;
    /* ... más colores */
}
```

### Configuración
- **Productos por página**: Modificar `itemsPerPage` en el constructor
- **Categorías**: Actualizar el array de categorías en el formulario
- **Validaciones**: Modificar las reglas en `handleProductSubmit`

## Soporte

Para reportar problemas o solicitar nuevas características, contactar al equipo de desarrollo.

---

**Desarrollado para HuertoHogar** - Sistema de gestión de productos orgánicos
