# Malibú Cookies

Página de Malibú Cookies (Talca): menú de cookies, frutitas virales y tortas, pedidos por WhatsApp y panel de administración.

- `index.html`: la tienda.
- `admin.html`: panel de administración (usuario y clave).
- `config.js`: URL de la aplicación web de Google Apps Script, número de WhatsApp y precios por sección (clásicas, premium y frutitas).
- `tortas.js`: menú de tortas con sus precios por porciones (bizcocho y hojarasca) y los diseños de las mini tortas.
- `entregas.js`: opciones de entrega (puntos de entrega, retiro y delivery) con los días en que se ofrece cada una y el costo del envío. Al hacer el pedido se muestran todas, cada una con sus días; si el pedido lleva torta, se elige la fecha y aparecen solo las opciones de ese día.
- `comun.js`, `estilos.css`: código y estilos compartidos.
- `img/`: fotos del menú y logo.
- `apps-script/Codigo.gs`: script que va dentro de la hoja de Google (catálogo, stock, pedidos y credenciales).

Los datos y las claves viven en la hoja de Google del negocio, no en este repositorio.

Al cambiar `comun.js`, `estilos.css`, `tortas.js` o `entregas.js`, sube el número `?v=` con que se cargan en `index.html` y `admin.html`. Así el navegador no junta una página nueva con un archivo viejo guardado.
