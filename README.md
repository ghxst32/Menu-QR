# 🍕 Food App — Guía de Estructura del Proyecto

## 📁 Estructura de Carpetas para VS Code

```
food-app/
│
├── index.html              ← Página principal (única) con todas las pantallas
│
├── css/
│   └── styles.css          ← Todos los estilos, animaciones y variables CSS
│
├── js/
│   └── app.js              ← Toda la lógica: navegación, carrito, renderizado
│
├── data/
│   └── menu.json           ← Base de datos local: categorías y productos
│
└── README.md               ← Este archivo
```

---

## 🚀 Cómo ejecutar el proyecto

### Opción 1 — Live Server (recomendado)
1. Abre la carpeta `food-app/` en VS Code
2. Instala la extensión **Live Server** (ritwickdey.LiveServer)
3. Clic derecho en `index.html` → **Open with Live Server**
4. Se abrirá en `http://127.0.0.1:5500`

### Opción 2 — Sin extensión (NO funciona directamente)
> ⚠️ El archivo `menu.json` se carga con `fetch()`, lo cual requiere un servidor HTTP.
> Abrirlo con `file://` dará error CORS.

---

## 🖥️ Pantallas disponibles

| Pantalla       | Descripción                                      |
|----------------|--------------------------------------------------|
| **Home**       | Lista de categorías con íconos y conteo de items |
| **Menu**       | Productos de la categoría seleccionada           |
| **Detalle**    | Vista expandida del producto con descripción     |
| **Carrito**    | Items en el carrito + resumen + checkout         |

---

## ✨ Características

- 🔁 Navegación con animaciones de slide fluidas
- ➕ Botón "Add to cart" con animación de rebote
- 🛒 Badge dinámico del carrito
- 📋 Resumen expandible con animación suave
- 🔔 Toast notifications al agregar items
- 📱 Diseño tipo iPhone con marco realista
- 🎨 Paleta roja fiel al diseño de referencia
- ⭐ Sistema de estrellas por producto
- 👁️ "Peek" al siguiente producto en detalle

---

## 🎨 Tecnologías usadas

- **HTML5** — Estructura de pantallas
- **CSS3** — Variables, animaciones, keyframes
- **JavaScript (vanilla)** — Lógica de la SPA
- **JSON** — Datos del menú
- **Google Fonts** — Nunito + Poppins

---

## 💡 Personalización

### Agregar productos
Edita `data/menu.json`, agrega un objeto en el array `products` de la categoría:
```json
{
  "id": 16,
  "name": "Nuevo Platillo",
  "weight": "300g",
  "price": 8.50,
  "rating": 4.5,
  "stars": 4,
  "description": "Descripción del producto aquí."
}
```

### Cambiar colores
En `css/styles.css`, línea ~5:
```css
:root {
  --red: #E8384D;       ← Color primario
  --bg: #F2F3F7;        ← Fondo gris claro
  --white: #FFFFFF;     ← Tarjetas
}
```
