# 🥑 HuertoHogar - Tienda Online de Productos Frescos

![Estado del proyecto](https://img.shields.io/badge/estado-en%20desarrollo-yellow)
![Licencia](https://img.shields.io/badge/licencia-MIT-green)

**HuertoHogar** es una tienda online dedicada a llevar la frescura y calidad de los productos del campo directamente a la puerta de nuestros clientes en Chile. Con más de 6 años de experiencia y presencia en 9 ciudades, promovemos un estilo de vida saludable y sostenible.

---

## 🌱 Misión

Proporcionar productos frescos y de calidad directamente desde el campo hasta la puerta de nuestros clientes, fomentando la conexión entre consumidores y agricultores locales, y promoviendo prácticas agrícolas sostenibles.

## 👁️ Visión

Ser la tienda online líder en la distribución de productos frescos y naturales en Chile, reconocida por nuestra calidad, servicio y compromiso con la sostenibilidad.

---

## 🚀 Características principales

### 🔐 Sistema de Autenticación Avanzado
- **Registro de usuarios** con validación completa de datos
- **Inicio de sesión** seguro con persistencia de sesión
- **Recuperación de contraseña** con sistema de tokens
- **Gestión de perfiles** con validación RUT chilena profesional
- **Autocompletado inteligente** de datos del usuario

### 🛒 Experiencia de Compra Mejorada
- **Catálogo de productos** con filtros por categoría
- **Páginas individuales** para cada producto con detalles completos
- **Carrusel de productos relacionados** con animaciones CSS
- **Carrito de compras** y resumen de pedidos
- **Seguimiento de pedidos** y envíos

### 📱 Interfaz Profesional
- **Diseño responsivo** optimizado para todos los dispositivos
- **Validación en tiempo real** con feedback visual elegante
- **Calendario inteligente** para fechas de nacimiento (navegación rápida de años)
- **Formularios optimizados** con formato automático (RUT, teléfono chileno)
- **Iconografía profesional** con Font Awesome

### 🌐 Funcionalidades Adicionales
- **Blog educativo** sobre alimentación saludable y sostenibilidad
- **Mapa interactivo** de tiendas físicas
- **Sistema de reseñas** y calificaciones
- **Programas de fidelización** y descuentos
- **Integración con redes sociales**

---

## 🖼️ Capturas de pantalla

### Página principal
![Página principal](assets/img/inicio.png)

### Registro de usuario
![Registro de usuario](assets/img/registro.png)

### Catálogo de productos
![Catálogo de productos](assets/img/productos.png)

---

## 🛠️ Tecnologías utilizadas

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Fuentes**: Google Fonts (Montserrat, Playfair Display)
- **Iconos**: Font Awesome
- **Almacenamiento**: LocalStorage para persistencia de datos
- **Validación**: Algoritmos personalizados para RUT chileno
- **Responsive Design**: CSS Grid y Flexbox

---

## 📦 Estructura del proyecto

```
huertohogar-tienda-grupo5/
├── assets/
│   ├── css/
│   │   ├── normalize.css
│   │   └── style.css
│   ├── favicon/
│   │   ├── favicon-16x16.png
│   │   ├── favicon-32x32.png
│   │   ├── favicon-192x192.png
│   │   ├── favicon-512x512.png
│   │   ├── apple-touch-icon.png
│   │   └── site.webmanifest
│   ├── img/
│   │   └── Logo Huerto Hogar.jpg
│   └── js/
│       ├── auth.js
│       ├── script.js
│       └── carousel-css.js
├── producto/
│   ├── espinacas-frescas.html
│   ├── leche-entera.html
│   ├── manzanas-fuji.html
│   ├── miel-organica.html
│   ├── naranjas-valencia.html
│   ├── pimientos-tricolores.html
│   ├── platanos-cavendish.html
│   ├── quinua-organica.html
│   └── zanahorias-organicas.html
├── index.html
├── registro.html
├── login.html
├── mi-cuenta.html
├── productos.html
├── producto-detalle.html
├── nosotros.html
├── blog.html
├── recuperar.html
├── restablecer.html
├── README.md
├── LICENSE
└── CONTRIBUTING.md
```

---

## 🌐 Demo en Vivo

### 🚀 **Prueba la aplicación ahora mismo**
[![Demo en Vivo](https://img.shields.io/badge/🌐-Demo%20en%20Vivo-blue?style=for-the-badge&logo=github)](https://nachovn12.github.io/huertohogar-tienda-grupo5/)

**🔗 [https://nachovn12.github.io/huertohogar-tienda-grupo5/](https://nachovn12.github.io/huertohogar-tienda-grupo5/)**

> 💡 **Compatible con todos los dispositivos**: Móviles, tablets, laptops y escritorio

---

## 🚀 Instalación y uso

### Opción 1: Usar la Demo (Recomendado)
Simplemente visita el enlace de arriba para probar la aplicación sin instalación.

### Opción 2: Instalación Local

1. **Clona el repositorio**:
   ```bash
   git clone https://github.com/Nachovn12/huertohogar-tienda-grupo5.git
   ```

2. **Navega al directorio del proyecto**:
   ```bash
   cd huertohogar-tienda-grupo5
   ```

3. **Abre el proyecto**:
   - Abre `index.html` en tu navegador web
   - O usa un servidor local (recomendado para desarrollo)

4. **Para desarrollo**:
   - Usa VS Code con Live Server extension
   - O cualquier servidor HTTP local

---

## 📱 Cómo activar GitHub Pages (Para el enlace de demo)

Si el enlace de demo no funciona, sigue estos pasos para activar GitHub Pages:

1. **Ve a tu repositorio en GitHub**: https://github.com/Nachovn12/huertohogar-tienda-grupo5
2. **Haz clic en "Settings"** (Configuración)
3. **Desplázate hacia abajo** hasta encontrar "Pages" en el menú lateral
4. **En "Source"** selecciona "Deploy from a branch"
5. **Selecciona "main"** como branch y "/ (root)" como folder
6. **Haz clic en "Save"**
7. **Espera unos minutos** y tu sitio estará disponible en: `https://nachovn12.github.io/huertohogar-tienda-grupo5/`

---

## ✨ Funcionalidades Destacadas

### 🔐 Sistema de Autenticación
- **Registro completo** con validación de datos chilenos
- **Validación RUT** con algoritmo oficial chileno
- **Formato automático** de teléfonos (+56)
- **Calendario inteligente** para fechas de nacimiento
- **Persistencia de sesión** con LocalStorage

### 🛒 Experiencia de Usuario
- **Navegación intuitiva** entre productos
- **Filtros dinámicos** por categoría
- **Carrusel de productos** con animaciones CSS
- **Formularios optimizados** con validación en tiempo real
- **Diseño responsivo** para todos los dispositivos

### 🎨 Interfaz Profesional
- **Paleta de colores** coherente con la marca
- **Tipografía elegante** con Google Fonts
- **Iconografía consistente** con Font Awesome
- **Animaciones suaves** y transiciones
- **Feedback visual** para todas las interacciones

---

## 📍 Sucursales

- **Santiago** - Centro de distribución principal
- **Puerto Montt** - Región de Los Lagos
- **Villarica** - Región de La Araucanía
- **Nacimiento** - Región del Biobío
- **Viña del Mar** - Región de Valparaíso
- **Valparaíso** - Puerto principal
- **Concepción** - Región del Biobío

---

## 👥 Contribuidores

- **Ignacio** [@Nachovn12](https://github.com/Nachovn12) - Desarrollador Frontend
- **Benjamin** [@BenjaFlores379](https://github.com/BenjaFlores379) - Desarrollador Backend

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Por favor lee nuestro [CONTRIBUTING.md](CONTRIBUTING.md) para detalles sobre nuestro código de conducta y el proceso para enviar pull requests.

---

> 🌱 **Descubre la frescura del campo con HuertoHogar!**  
> Conéctate con la naturaleza y lleva lo mejor del campo a tu mesa.

---

**Última actualización**: Septiembre 2025  
**Versión**: 2.0.0  
**Estado**: En desarrollo activo