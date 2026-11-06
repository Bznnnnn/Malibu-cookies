// Código compartido por la tienda y el admin.
const MALIBU_BASE = [["Menta","menta","c"],["Manjar","manjar","c"],["Reese's","reeses","c"],["Prestigio","prestigio","c"],["Cookies & Cream","cookies-cream","c"],["Marshmallows","marshmallows","c"],["Bon o Bon","bon-o-bon","c"],["Lotus","lotus","c"],["Oreo","oreo","c"],["Mantecol","mantecol","c"],["Toffee","toffee","c"],["M&M","m-m","c"],["Ferrero","ferrero","c"],["Nutella","nutella","c"],["Brownie","brownie","c"],["Kinder White","kinder-white","c"],["Kit-Kat","kit-kat","c"],["Kinder Black","kinder-black","c"],["Velvet White","velvet-white","c"],["Velvet Black","velvet-black","c"],["Sahne-Nuss","sahne-nuss","c"],["Cheesecake Velvet","cheesecake-velvet","p"],["Cheesecake Strawberry","cheesecake-strawberry","p"],["Cheesecake Choc Caramel","cheesecake-choc-caramel","p"],["Cheesecake Maracuyá","cheesecake-maracuya","p"],["Caramel Cheesecake","caramel-cheesecake","p"],["Pistacho Choc","pistacho-choc","p"],["Birthday Cake","birthday-cake","p"],["Oreo Cheesecake","oreo-cheesecake","p"],["Biscoff Lotus","biscoff-lotus","p"],["Nute Brownie","nute-brownie","p"],["Nute Choc","nute-choc","p"],["Birthday Lotus","birthday-lotus","p"],["Mega M&M","mega-m-m","p"],["Mega Oreo","mega-oreo","p"],["Peanut Butter","peanut-butter","p"],["Mango","fr-mango","f"],["Frambuesa","fr-frambuesa","f"],["Arándano","fr-arandano","f"]]
  .map(([name, id, cat], i) => ({ id, name, cat, img: `img/${id}.jpg`, orden: i + 1, stock: null }));

const MALIBU_SECCIONES = { c: "Cookies clásicas", p: "Cookies premium", f: "Frutitas virales" };

// Precios por sección. Los que valen se cambian en config.js; estos quedan de respaldo.
const MALIBU_PRECIOS_BASE = { c: 1500, p: 2000, f: 4000 };
function precioDe(p) { const t = window.MALIBU_PRECIOS || {}; return Number(t[p?.cat] ?? MALIBU_PRECIOS_BASE[p?.cat]) || 0; }
const pesos = n => "$" + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

// Cuenta cookies y frutitas de un pedido ([[id, cantidad], ...]) y suma la preorden, sin envío.
function resumenPedido(pares, porId) {
  let cookies = 0, frutitas = 0, total = 0;
  for (const [id, q] of pares) {
    const p = porId[id];
    if (!p) continue;
    if (p.cat === "f") frutitas += q; else cookies += q;
    total += q * precioDe(p);
  }
  const partes = [];
  if (cookies) partes.push(cookies + (cookies === 1 ? " cookie" : " cookies"));
  if (frutitas) partes.push(frutitas + (frutitas === 1 ? " frutita" : " frutitas"));
  const conteo = partes.join(" y ");
  const unidades = cookies + frutitas;
  return { unidades, total, conteo, conteoTotal: partes.length > 1 ? `${unidades} (${conteo})` : conteo };
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
