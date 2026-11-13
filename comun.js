// Código compartido por la tienda y el admin.
const MALIBU_BASE = [["Menta","menta","c"],["Manjar","manjar","c"],["Reese's","reeses","c"],["Prestigio","prestigio","c"],["Cookies & Cream","cookies-cream","c"],["Marshmallows","marshmallows","c"],["Bon o Bon","bon-o-bon","c"],["Lotus","lotus","c"],["Oreo","oreo","c"],["Mantecol","mantecol","c"],["Toffee","toffee","c"],["M&M","m-m","c"],["Ferrero","ferrero","c"],["Nutella","nutella","c"],["Brownie","brownie","c"],["Kinder White","kinder-white","c"],["Kit-Kat","kit-kat","c"],["Kinder Black","kinder-black","c"],["Velvet White","velvet-white","c"],["Velvet Black","velvet-black","c"],["Sahne-Nuss","sahne-nuss","c"],["Cheesecake Velvet","cheesecake-velvet","p"],["Cheesecake Strawberry","cheesecake-strawberry","p"],["Cheesecake Choc Caramel","cheesecake-choc-caramel","p"],["Cheesecake Maracuyá","cheesecake-maracuya","p"],["Caramel Cheesecake","caramel-cheesecake","p"],["Pistacho Choc","pistacho-choc","p"],["Birthday Cake","birthday-cake","p"],["Oreo Cheesecake","oreo-cheesecake","p"],["Biscoff Lotus","biscoff-lotus","p"],["Nute Brownie","nute-brownie","p"],["Nute Choc","nute-choc","p"],["Birthday Lotus","birthday-lotus","p"],["Mega M&M","mega-m-m","p"],["Mega Oreo","mega-oreo","p"],["Peanut Butter","peanut-butter","p"],["Mango","fr-mango","f"],["Frambuesa","fr-frambuesa","f"],["Arándano","fr-arandano","f"]]
  .map(([name, id, cat], i) => ({ id, name, cat, img: `img/${id}.jpg`, orden: i + 1, stock: null }));

const MALIBU_SECCIONES = { c: "Cookies clásicas", p: "Cookies premium", f: "Frutitas virales" };

// Precios por sección. Los que valen se cambian en config.js; estos quedan de respaldo.
const MALIBU_PRECIOS_BASE = { c: 1500, p: 2000, f: 4000 };
function precioSeccion(cat) { const t = window.MALIBU_PRECIOS || {}; return Number(t[cat] ?? MALIBU_PRECIOS_BASE[cat]) || 0; }
// Un sabor puede tener su propio precio (se pone en el admin); si no, vale el de su sección.
function precioDe(p) { return Number(p?.precio) > 0 ? Number(p.precio) : precioSeccion(p?.cat); }
const pesos = n => "$" + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;
const listaY = partes => partes.length > 1 ? partes.slice(0, -1).join(", ") + " y " + partes[partes.length - 1] : partes.join("");

// Cuenta cookies, frutitas y tortas de un pedido y suma la preorden, sin envío.
// pares: [[id, cantidad], ...]; tortas: [{ precio, masDiseno }, ...], masDiseno si el diseño se cobra aparte.
function resumenPedido(pares, porId, tortas = []) {
  let cookies = 0, frutitas = 0, total = 0;
  for (const [id, q] of pares) {
    const p = porId[id];
    if (!p) continue;
    if (p.cat === "f") frutitas += q; else cookies += q;
    total += q * precioDe(p);
  }
  for (const t of tortas) total += Number(t.precio) || 0;
  const galletas = [];
  if (cookies) galletas.push(plural(cookies, "cookie", "cookies"));
  if (frutitas) galletas.push(plural(frutitas, "frutita", "frutitas"));
  const unidades = cookies + frutitas;
  const deTortas = tortas.length ? plural(tortas.length, "torta", "tortas") : "";
  // conteo: "2 cookies, 1 frutita y 1 torta". conteoTotal: "3 (2 cookies y 1 frutita) y 1 torta".
  const conteo = listaY(deTortas ? [...galletas, deTortas] : galletas);
  const conteoGalletas = galletas.length > 1 ? `${unidades} (${galletas.join(" y ")})` : galletas.join("");
  const conteoTotal = [conteoGalletas, deTortas].filter(Boolean).join(" y ");
  return { unidades, tortas: tortas.length, total, masDiseno: tortas.some(t => t.masDiseno), conteo, conteoTotal };
}

const Malibu = {
  hayApi() { return /^https:\/\/script\.google(usercontent)?\.com\//.test(window.MALIBU_API || ""); },

  async catalogo() {
    if (!this.hayApi()) return null;
    const r = await fetch(`${window.MALIBU_API}?action=catalogo&t=${Date.now()}`, { cache: "no-store" });
    const j = await r.json();
    if (!j.ok) throw new Error(j.mensaje || "No se pudo leer el menú.");
    return j.productos;
  },

  // POST sin cabeceras extra para que el navegador no haga una consulta previa (CORS).
  async post(body) {
    if (!this.hayApi()) return { ok: false, error: "config", mensaje: "Falta pegar la URL de Google Apps Script en config.js." };
    try {
      const r = await fetch(window.MALIBU_API, { method: "POST", body: JSON.stringify(body) });
      return await r.json();
    } catch (e) {
      return { ok: false, error: "red", mensaje: "No hay conexión con la hoja de Google. Revisa tu internet e intenta otra vez." };
    }
  },
};

const esc = s => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const norm = s => String(s ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");
const $ = id => document.getElementById(id);
const quedan = p => (typeof p?.stock === "number" ? p.stock : Infinity);
function porSeccion(lista, c) { return lista.filter(p => p.cat === c).sort((a, b) => (a.orden || 0) - (b.orden || 0)); }
function fotoDe(p) { return p.img ? esc(p.img) : "img/logo.png"; }
