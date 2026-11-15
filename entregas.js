// Opciones de entrega de Malibú Cookies, en el orden en que aparecen al hacer el pedido.
// Sin torta se muestran todas, cada una con sus días (el día se coordina por WhatsApp).
// Si el pedido lleva torta se pide la fecha y aparecen solo las opciones de ese día.
//
// Cada opción tiene:
//   grupo:     título bajo el que aparece ("Puntos de entrega y retiro" o "Delivery").
//   nombre:    lo que dice el botón.
//   detalle:   texto chico bajo el nombre (opcional).
//   mensaje:   cómo aparece en el mensaje de WhatsApp, en la línea "Entrega:".
//   dias:      días en que se ofrece. 1 lunes, 2 martes, 3 miércoles, 4 jueves, 5 viernes, 6 sábado, 0 domingo.
//   precio:    costo del envío en pesos, entre corchetes. Dos valores si depende de la dirección.
//              Sin precio no se suma nada; si además pide dirección, el envío queda "por confirmar".
//   direccion: true si hay que pedir la dirección.
//   lugares:   lista para elegir a dónde (por ejemplo, las universidades), con su pregunta.
//   nota:      aviso que se muestra al elegir la opción.

const LUNES_A_VIERNES = [1, 2, 3, 4, 5];
const TODOS_LOS_DIAS = [1, 2, 3, 4, 5, 6, 0];

window.MALIBU_ENTREGAS = [
  {
    id: "ucm",
    grupo: "Puntos de entrega y retiro",
    nombre: "UCM",
    mensaje: "Punto de entrega UCM",
    dias: LUNES_A_VIERNES,
    nota: "Te lo entregamos en la UCM. Coordinamos la hora por WhatsApp.",
  },
  {
    id: "go-florida",
    grupo: "Puntos de entrega y retiro",
    nombre: "Go Florida",
    mensaje: "Punto de entrega Go Florida",
    dias: TODOS_LOS_DIAS,
    nota: "Te lo entregamos en Go Florida. Coordinamos la hora por WhatsApp.",
  },
  {
    id: "mall-plaza",
    grupo: "Puntos de entrega y retiro",
    nombre: "Mall Plaza",
    mensaje: "Punto de entrega Mall Plaza",
    dias: LUNES_A_VIERNES,
    nota: "Te lo entregamos en el Mall Plaza. Coordinamos la hora por WhatsApp.",
  },
  {
    id: "domicilio",
    grupo: "Puntos de entrega y retiro",
    nombre: "Retiro en domicilio",
    detalle: "17 ½ Sur con 15 Poniente",
    mensaje: "Retiro en domicilio (17 ½ Sur con 15 Poniente)",
    dias: TODOS_LOS_DIAS,
    nota: "Retiras en 17 ½ Sur con 15 Poniente, sector sur poniente. Coordinamos la hora por WhatsApp.",
  },
  {
    id: "la-florida",
    grupo: "Delivery",
    nombre: "Sector La Florida",
    mensaje: "Delivery sector La Florida",
    dias: TODOS_LOS_DIAS,
    precio: [2000],
    direccion: true,
  },
  {
    id: "bicentenario",
    grupo: "Delivery",
    nombre: "Sector Bicentenario",
    mensaje: "Delivery sector Bicentenario",
    dias: TODOS_LOS_DIAS,
    precio: [2000, 3000],
    direccion: true,
    nota: "El envío es de $2.000 o $3.000 según tu dirección: te lo confirmamos por WhatsApp.",
  },
  {
    id: "universidades",
    grupo: "Delivery",
    nombre: "Universidades",
    detalle: "Autónoma, Inacap y Santo Tomás",
    mensaje: "Delivery a universidad",
    dias: LUNES_A_VIERNES,
    precio: [1000],
    lugares: ["Autónoma", "Inacap", "Santo Tomás"],
    pregunta: "¿A qué universidad?",
    nota: "Coordinamos la hora de entrega por WhatsApp.",
  },
  {
    id: "uber",
    grupo: "Delivery",
    nombre: "Envío por Uber",
    detalle: "Costo según la distancia",
    mensaje: "Envío por Uber",
    dias: TODOS_LOS_DIAS,
    direccion: true,
    nota: "El costo del Uber depende de la distancia: te lo confirmamos por WhatsApp.",
  },
];
