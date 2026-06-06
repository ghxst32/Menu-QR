# 🍕 Food App — Documentación

## 📁 Estructura del Proyecto (VS Code)

```
food-app/
│
├── index.html            ← App completa (todas las pantallas)
│
├── css/
│   └── styles.css        ← Estilos, variables y animaciones
│
├── js/
│   └── app.js            ← Lógica: navegación, carrito, WhatsApp
│
├── data/
│   └── menu.json         ← Base de datos del menú + número WhatsApp
│
└── README.md             ← Este archivo
```

---

## 🚀 Cómo ejecutar

### Opción A — Live Server (recomendado para desarrollo)
1. Abre `food-app/` en VS Code
2. Instala la extensión **Live Server** (autor: Ritwick Dey)
3. Clic derecho en `index.html` → **Open with Live Server**
4. Se abre en `http://127.0.0.1:5500`

> ⚠️ **No puedes abrirlo con doble clic** porque el `menu.json` se carga con `fetch()`,
> lo que requiere un servidor HTTP (aunque sea local).

### Opción B — Deploy en producción
Sube toda la carpeta a cualquier hosting estático:
- **Netlify** (drag & drop en app.netlify.com)
- **Vercel** (arrastra la carpeta)
- **GitHub Pages**

---

## 📱 Pantallas

| Pantalla    | Descripción |
|-------------|-------------|
| **Inicio**  | Categorías del menú con íconos |
| **Menú**    | Productos de la categoría seleccionada |
| **Detalle** | Descripción, cantidad y agregar al carrito |
| **Carrito** | Items con cantidad editable + checkout WhatsApp |

---

## 📲 Configurar número de WhatsApp

Abre `data/menu.json` y cambia el campo `"whatsapp"`:

```json
{
  "whatsapp": "526681234567",
  ...
}
```

**Formato:** código de país + número, sin `+`, sin espacios ni guiones.
- México: `52` + 10 dígitos → `526681234567`
- EUA:    `1`  + 10 dígitos → `12125551234`

---

## 🛒 Flujo del carrito

1. El usuario agrega productos desde **Menú** o **Detalle**
2. Los items se guardan en `localStorage` (persisten si cierra la app)
3. En **Carrito** puede ajustar cantidades (+ / −)
4. Al pulsar **Pedir por WhatsApp** se abre WhatsApp con el mensaje:

```
Hola! 👋 Quiero hacer un pedido:

*Pedido:*
  • 2x Margherita Classic
  • 1x Espagueti Carbonara
  • 3x Limonada Fresca

💵 Total: $38.97

¡Gracias! 🙏
```

5. El carrito se vacía automáticamente al enviar el pedido.

---

## ✏️ Personalizar el menú

Edita `data/menu.json`. Para agregar un producto a una categoría:

```json
{
  "id": 16,
  "name": "Hamburguesa Doble",
  "weight": "350g",
  "price": 11.50,
  "stars": 5,
  "emoji": "🍔",
  "description": "Doble carne angus, queso cheddar, lechuga, tomate y salsa especial."
}
```

Para agregar una categoría nueva, agrega un objeto al array `"categories"`:

```json
{
  "id": "burgers",
  "name": "Hamburguesas",
  "items": 12,
  "emoji": "🍔",
  "bg": "#FFF3E0",
  "products": [...]
}
```

---

## 🎨 Cambiar colores

En `css/styles.css` (línea ~5), edita las variables:

```css
:root {
  --red: #E83848;     /* Color principal */
  --bg:  #F4F5F9;     /* Fondo gris claro */
  --white: #FFFFFF;   /* Fondo de tarjetas */
}
```

---

## ✨ Características

- 📱 100% mobile-first, sin simulación de iPhone
- 💾 Carrito persistente con `localStorage`
- ➕ Control de cantidad por producto
- 🔄 Animaciones fluidas entre pantallas
- 🟢 Checkout directo por WhatsApp
- 🔔 Toast notifications al agregar items
- ⭐ Sistema de estrellas por producto
- 🧭 Navegación inferior solo con Home y Carrito
