/**
 * Malibú Cookies: base de datos en Google Sheets.
 *
 * Este script vive dentro de la hoja de cálculo "Malibú Cookies - Base de datos".
 * Guarda el catálogo, el stock, los pedidos confirmados y las credenciales del admin.
 *
 * Instalación (una sola vez):
 *   1. Pega este código en Extensiones > Apps Script y guarda.
 *   2. Elige la función "configurar" y toca Ejecutar. Acepta los permisos.
 *   3. En la pestaña "Credenciales", cambia la clave de ejemplo por una tuya.
 *   4. Implementar > Nueva implementación > Aplicación web.
 *      Ejecutar como: Yo. Quién tiene acceso: Cualquier usuario.
 *   5. Copia la URL que termina en /exec y pégala en config.js de la página.
 *
 * La página pública solo puede LEER el catálogo. Todo cambio exige iniciar sesión
 * con un usuario y clave de la pestaña "Credenciales", que nunca sale de esta hoja.
 */

// ID de la hoja de cálculo (lo que va entre /d/ y /edit en su enlace).
// Déjalo vacío si este script está creado desde la misma hoja (Extensiones > Apps Script).
const ID_HOJA = '';

const HOJA_PRODUCTOS = 'Productos';
const HOJA_PEDIDOS = 'Pedidos';
const HOJA_CRED = 'Credenciales';
const CARPETA_FOTOS = 'Malibú Cookies - Fotos';
const CLAVE_INICIAL = 'CAMBIA-ESTA-CLAVE';
const MAX_INTENTOS = 5;          // intentos fallidos antes de bloquear
const BLOQUEO_SEG = 15 * 60;     // 15 minutos
const SESION_SEG = 6 * 60 * 60;  // 6 horas

const SECCION_A_CODIGO = { clasica: 'c', clasicas: 'c', premium: 'p', frutitas: 'f', frutita: 'f' };
const CODIGO_A_SECCION = { c: 'Clásica', p: 'Premium', f: 'Frutitas' };
const COLS_PRODUCTOS = ['id', 'nombre', 'seccion', 'foto', 'orden', 'stock'];
const COLS_PEDIDOS = ['id', 'fecha', 'cliente', 'detalle', 'items_json', 'estado'];

const CATALOGO_INICIAL = [
  ['menta', 'Menta', 'c'], ['manjar', 'Manjar', 'c'], ['reeses', "Reese's", 'c'], ['prestigio', 'Prestigio', 'c'],
  ['cookies-cream', 'Cookies & Cream', 'c'], ['marshmallows', 'Marshmallows', 'c'], ['bon-o-bon', 'Bon o Bon', 'c'],
  ['lotus', 'Lotus', 'c'], ['oreo', 'Oreo', 'c'], ['mantecol', 'Mantecol', 'c'], ['toffee', 'Toffee', 'c'],
  ['m-m', 'M&M', 'c'], ['ferrero', 'Ferrero', 'c'], ['nutella', 'Nutella', 'c'], ['brownie', 'Brownie', 'c'],
  ['kinder-white', 'Kinder White', 'c'], ['kit-kat', 'Kit-Kat', 'c'], ['kinder-black', 'Kinder Black', 'c'],
  ['velvet-white', 'Velvet White', 'c'], ['velvet-black', 'Velvet Black', 'c'], ['sahne-nuss', 'Sahne-Nuss', 'c'],
  ['cheesecake-velvet', 'Cheesecake Velvet', 'p'], ['cheesecake-strawberry', 'Cheesecake Strawberry', 'p'],
  ['cheesecake-choc-caramel', 'Cheesecake Choc Caramel', 'p'], ['cheesecake-maracuya', 'Cheesecake Maracuyá', 'p'],
  ['caramel-cheesecake', 'Caramel Cheesecake', 'p'], ['pistacho-choc', 'Pistacho Choc', 'p'],
  ['birthday-cake', 'Birthday Cake', 'p'], ['oreo-cheesecake', 'Oreo Cheesecake', 'p'], ['biscoff-lotus', 'Biscoff Lotus', 'p'],
  ['nute-brownie', 'Nute Brownie', 'p'], ['nute-choc', 'Nute Choc', 'p'], ['birthday-lotus', 'Birthday Lotus', 'p'],
  ['mega-m-m', 'Mega M&M', 'p'], ['mega-oreo', 'Mega Oreo', 'p'], ['peanut-butter', 'Peanut Butter', 'p'],
  ['fr-mango', 'Mango', 'f'], ['fr-frambuesa', 'Frambuesa', 'f'], ['fr-arandano', 'Arándano', 'f'],
];

/* ------------------------------------------------------------------ */
/* Configuración inicial                                               */
/* ------------------------------------------------------------------ */

function configurar() {
  const ss = libro_();

  let prod = ss.getSheetByName(HOJA_PRODUCTOS);
  if (!prod) prod = ss.insertSheet(HOJA_PRODUCTOS);
  if (prod.getLastRow() === 0) {
    prod.appendRow(COLS_PRODUCTOS);
    const filas = CATALOGO_INICIAL.map((p, i) => [p[0], p[1], CODIGO_A_SECCION[p[2]], 'img/' + p[0] + '.jpg', i + 1, '']);
    prod.getRange(2, 1, filas.length, COLS_PRODUCTOS.length).setValues(filas);
    prod.setFrozenRows(1);
    prod.getRange(1, 1, 1, COLS_PRODUCTOS.length).setFontWeight('bold');
    const regla = SpreadsheetApp.newDataValidation().requireValueInList(['Clásica', 'Premium', 'Frutitas'], true).build();
    prod.getRange(2, 3, 500, 1).setDataValidation(regla);
  }

  let ped = ss.getSheetByName(HOJA_PEDIDOS);
  if (!ped) ped = ss.insertSheet(HOJA_PEDIDOS);
  if (ped.getLastRow() === 0) {
    ped.appendRow(COLS_PEDIDOS);
    ped.setFrozenRows(1);
    ped.getRange(1, 1, 1, COLS_PEDIDOS.length).setFontWeight('bold');
  }

  let cred = ss.getSheetByName(HOJA_CRED);
  if (!cred) cred = ss.insertSheet(HOJA_CRED);
  if (cred.getLastRow() === 0) {
    cred.appendRow(['usuario', 'clave']);
    cred.appendRow(['admin', CLAVE_INICIAL]);
    cred.setFrozenRows(1);
    cred.getRange(1, 1, 1, 2).setFontWeight('bold');
  }

  const hoja1 = ss.getSheetByName('Hoja 1') || ss.getSheetByName('Sheet1');
  if (hoja1 && hoja1.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(hoja1);

  carpetaFotos_(); // pide el permiso de Drive para subir fotos
  Logger.log('Listo. Ahora cambia la clave en la pestaña "Credenciales" y publica la aplicación web.');
}

/* ------------------------------------------------------------------ */
/* Entradas de la aplicación web                                       */
/* ------------------------------------------------------------------ */

function doGet(e) {
  const accion = (e && e.parameter && e.parameter.action) || 'catalogo';
  if (accion === 'catalogo') return json_({ ok: true, productos: leerProductos_() });
  return json_({ ok: false, error: 'accion', mensaje: 'Acción no válida.' });
}

function doPost(e) {
  let body;
  try {
    body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
  } catch (err) {
    return json_({ ok: false, error: 'formato', mensaje: 'Solicitud inválida.' });
  }
  try {
    if (body.action === 'login') return json_(login_(body.usuario, body.clave));

    const usuario = validarSesion_(body.token);
    if (!usuario) return json_({ ok: false, error: 'sesion', mensaje: 'Tu sesión expiró. Vuelve a ingresar.' });

    switch (body.action) {
      case 'logout': CacheService.getScriptCache().remove('tok:' + body.token); return json_({ ok: true });
      case 'sesion': return json_({ ok: true, usuario: usuario });
      case 'agregarProducto': return json_(conLock_(() => agregarProducto_(body)));
      case 'eliminarProducto': return json_(conLock_(() => eliminarProducto_(body.id)));
      case 'guardarStock': return json_(conLock_(() => guardarStock_(body.id, body.stock)));
      case 'confirmarPedido': return json_(conLock_(() => confirmarPedido_(body.items, body.cliente)));
      case 'anularPedido': return json_(conLock_(() => anularPedido_(body.id)));
      case 'pedidos': return json_({ ok: true, pedidos: leerPedidos_() });
      default: return json_({ ok: false, error: 'accion', mensaje: 'Acción no válida.' });
    }
  } catch (err) {
    return json_({ ok: false, error: 'interno', mensaje: String((err && err.message) || err) });
  }
}

/* ------------------------------------------------------------------ */
/* Sesión                                                              */
/* ------------------------------------------------------------------ */

function login_(usuario, clave) {
  usuario = String(usuario || '').trim().toLowerCase();
  clave = String(clave || '');
  const cache = CacheService.getScriptCache();
  const kFallos = 'fallos:' + usuario;
  const fallos = Number(cache.get(kFallos) || 0);
  if (fallos >= MAX_INTENTOS) {
    return { ok: false, error: 'bloqueado', mensaje: 'Demasiados intentos fallidos. Espera 15 minutos y vuelve a intentar.' };
  }

  const filas = hoja_(HOJA_CRED).getDataRange().getValues().slice(1);
  const fila = filas.find(r => String(r[0]).trim().toLowerCase() === usuario && usuario !== '');
  const claveGuardada = fila ? String(fila[1]) : '';

  if (fila && claveGuardada === CLAVE_INICIAL) {
    return { ok: false, error: 'clave_inicial', mensaje: 'Primero cambia la clave de ejemplo en la pestaña "Credenciales" de tu hoja.' };
  }
  if (!fila || !clave || claveGuardada.length < 6 || !igualSeguro_(clave, claveGuardada)) {
    cache.put(kFallos, String(fallos + 1), BLOQUEO_SEG);
    Utilities.sleep(700);
    return { ok: false, error: 'credenciales', mensaje: 'Usuario o clave incorrectos.' };
  }

  cache.remove(kFallos);
  const token = Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, '');
  cache.put('tok:' + token, usuario, SESION_SEG);
  return { ok: true, token: token, usuario: usuario };
}

function validarSesion_(token) {
  if (!token || typeof token !== 'string' || token.length < 40) return null;
  const cache = CacheService.getScriptCache();
  const usuario = cache.get('tok:' + token);
  if (usuario) cache.put('tok:' + token, usuario, SESION_SEG); // renueva la sesión mientras se usa
  return usuario;
}

function igualSeguro_(a, b) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

/* ------------------------------------------------------------------ */
/* Productos y stock                                                   */
/* ------------------------------------------------------------------ */

function leerProductos_() {
  const valores = hoja_(HOJA_PRODUCTOS).getDataRange().getValues();
  valores.shift();
  return valores
    .filter(r => String(r[0]).trim() && String(r[1]).trim())
    .map(r => ({
      id: String(r[0]).trim(),
      name: String(r[1]).trim(),
      cat: SECCION_A_CODIGO[normalizar_(r[2])] || 'c',
      img: String(r[3] || '').trim(),
      orden: Number(r[4]) || 0,
      stock: r[5] === '' || r[5] === null ? null : Math.max(0, Math.floor(Number(r[5]) || 0)),
    }))
    .sort((a, b) => a.orden - b.orden);
}

function agregarProducto_(b) {
  const nombre = String(b.nombre || '').trim().slice(0, 60);
  const cat = ['c', 'p', 'f'].indexOf(b.cat) >= 0 ? b.cat : 'c';
  if (!nombre) return { ok: false, mensaje: 'Escribe un nombre.' };
  const productos = leerProductos_();
  if (productos.some(p => normalizar_(p.name) === normalizar_(nombre))) {
    return { ok: false, mensaje: 'Ya existe un producto con ese nombre.' };
  }
  let base = normalizar_(nombre).slice(0, 40) || 'producto';
  let id = base, n = 2;
  while (productos.some(p => p.id === id)) id = base + '-' + (n++);

  let foto = '';
  if (b.fotoBase64) foto = guardarFoto_(b.fotoBase64, id);

  const orden = productos.reduce((m, p) => Math.max(m, p.orden), 0) + 1;
  const stock = b.stock === '' || b.stock === null || b.stock === undefined ? '' : Math.max(0, Math.floor(Number(b.stock) || 0));
  hoja_(HOJA_PRODUCTOS).appendRow([id, nombre, CODIGO_A_SECCION[cat], foto, orden, stock]);
  return { ok: true, productos: leerProductos_() };
}

function eliminarProducto_(id) {
  const h = hoja_(HOJA_PRODUCTOS);
  const fila = buscarFila_(h, id);
  if (!fila) return { ok: false, mensaje: 'Ese producto ya no existe.' };
  h.deleteRow(fila);
  return { ok: true, productos: leerProductos_() };
}

function guardarStock_(id, stock) {
  const h = hoja_(HOJA_PRODUCTOS);
  const fila = buscarFila_(h, id);
  if (!fila) return { ok: false, mensaje: 'Ese producto ya no existe.' };
  const valor = stock === '' || stock === null || stock === undefined ? '' : Math.max(0, Math.floor(Number(stock) || 0));
  h.getRange(fila, 6).setValue(valor);
  return { ok: true, productos: leerProductos_() };
}

function guardarFoto_(base64, id) {
  const limpio = String(base64).replace(/^data:image\/\w+;base64,/, '');
  const bytes = Utilities.base64Decode(limpio);
  if (bytes.length > 2 * 1024 * 1024) throw new Error('La foto es muy pesada (máximo 2 MB).');
  const blob = Utilities.newBlob(bytes, 'image/jpeg', id + '.jpg');
  const archivo = carpetaFotos_().createFile(blob);
  archivo.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return 'https://lh3.googleusercontent.com/d/' + archivo.getId();
}

function carpetaFotos_() {
  const it = DriveApp.getFoldersByName(CARPETA_FOTOS);
  return it.hasNext() ? it.next() : DriveApp.createFolder(CARPETA_FOTOS);
}

/* ------------------------------------------------------------------ */
/* Pedidos                                                             */
/* ------------------------------------------------------------------ */

function confirmarPedido_(items, cliente) {
  if (!Array.isArray(items) || !items.length) return { ok: false, mensaje: 'El pedido está vacío.' };
  const h = hoja_(HOJA_PRODUCTOS);
  const valores = h.getDataRange().getValues();

  // Agrupa cantidades por producto
  const cant = {};
  items.forEach(i => {
    const q = Math.floor(Number(i.qty) || 0);
    if (i.id && q > 0) cant[i.id] = (cant[i.id] || 0) + q;
  });
  const ids = Object.keys(cant);
  if (!ids.length) return { ok: false, mensaje: 'El pedido está vacío.' };

  // Valida todo antes de descontar
  const detalle = [];
  for (const id of ids) {
    const r = valores.findIndex((v, k) => k > 0 && String(v[0]).trim() === id);
    if (r < 0) return { ok: false, mensaje: 'Un producto del pedido ya no existe en el menú.' };
    const stock = valores[r][5];
    if (stock !== '' && stock !== null && Number(stock) < cant[id]) {
      return { ok: false, mensaje: 'No hay stock suficiente de ' + valores[r][1] + ' (quedan ' + Number(stock) + ').' };
    }
    detalle.push({ id: id, qty: cant[id], name: String(valores[r][1]), fila: r + 1, stock: stock });
  }
  detalle.forEach(d => {
    if (d.stock !== '' && d.stock !== null) h.getRange(d.fila, 6).setValue(Number(d.stock) - d.qty);
  });

  const pedidoId = 'P' + Utilities.formatDate(new Date(), 'America/Santiago', 'yyMMddHHmmss') + Math.floor(Math.random() * 90 + 10);
  const resumen = detalle.map(d => d.qty + ' × ' + d.name).join(', ');
  const itemsJson = JSON.stringify(detalle.map(d => ({ id: d.id, qty: d.qty, name: d.name })));
  hoja_(HOJA_PEDIDOS).appendRow([pedidoId, new Date(), String(cliente || '').slice(0, 80), resumen, itemsJson, 'confirmado']);
  return { ok: true, productos: leerProductos_(), pedidos: leerPedidos_() };
}

function anularPedido_(id) {
  const hp = hoja_(HOJA_PEDIDOS);
  const fila = buscarFila_(hp, id);
  if (!fila) return { ok: false, mensaje: 'No encontré ese pedido.' };
  const fila_valores = hp.getRange(fila, 1, 1, COLS_PEDIDOS.length).getValues()[0];
  if (fila_valores[5] === 'anulado') return { ok: true, productos: leerProductos_(), pedidos: leerPedidos_() };

  const items = JSON.parse(fila_valores[4] || '[]');
  const h = hoja_(HOJA_PRODUCTOS);
  items.forEach(i => {
    const f = buscarFila_(h, i.id);
    if (!f) return;
    const actual = h.getRange(f, 6).getValue();
    if (actual !== '' && actual !== null) h.getRange(f, 6).setValue(Number(actual) + Number(i.qty));
  });
  hp.getRange(fila, 6).setValue('anulado');
  return { ok: true, productos: leerProductos_(), pedidos: leerPedidos_() };
}

function leerPedidos_() {
  const valores = hoja_(HOJA_PEDIDOS).getDataRange().getValues();
  valores.shift();
  return valores
    .filter(r => r[0])
    .slice(-40)
    .reverse()
    .map(r => ({
      id: String(r[0]),
      fecha: r[1] instanceof Date ? r[1].toISOString() : String(r[1]),
      cliente: String(r[2] || ''),
      detalle: String(r[3] || ''),
      estado: String(r[5] || ''),
    }));
}

/* ------------------------------------------------------------------ */
/* Utilidades                                                          */
/* ------------------------------------------------------------------ */

function libro_() {
  return ID_HOJA ? SpreadsheetApp.openById(ID_HOJA) : SpreadsheetApp.getActiveSpreadsheet();
}

function hoja_(nombre) {
  const h = libro_().getSheetByName(nombre);
  if (!h) throw new Error('Falta la pestaña "' + nombre + '". Ejecuta la función configurar.');
  return h;
}

function buscarFila_(h, id) {
  const ids = h.getRange(1, 1, Math.max(1, h.getLastRow()), 1).getValues();
  for (let i = 1; i < ids.length; i++) if (String(ids[i][0]).trim() === String(id)) return i + 1;
  return 0;
}

function conLock_(fn) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(15000)) return { ok: false, mensaje: 'Hay otro cambio en curso. Intenta de nuevo en unos segundos.' };
  try { return fn(); } finally { lock.releaseLock(); }
}

function normalizar_(s) {
  return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
