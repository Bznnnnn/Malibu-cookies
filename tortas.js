// Menú de tortas de Malibú Cookies, en pesos chilenos.
// Para cambiar un precio, cambia el número y guarda. Para agregar un sabor, copia una línea completa
// y cambia el nombre y los precios. Ojo con las comas y las comillas.

window.MALIBU_TORTAS = {
  // Porciones de las tortas de bizcocho y de hojarasca. Los precios de abajo van en este mismo orden.
  porciones: [10, 15, 20, 30, 40],

  // Tortas de bizcocho, agrupadas como en el menú. El precio no incluye el diseño.
  // "Sabor": [10 porciones, 15, 20, 30, 40]
  bizcocho: {
    "Con manjar": {
      "Manjar crema": [13000, 15000, 19000, 26000, 35000],
      "Manjar chocolate": [17000, 23000, 29000, 38000, 48000],
      "Manjar moka": [15000, 18000, 24000, 33000, 43000],
      "Manjar nuez": [16000, 21000, 25000, 35000, 45000],
      "Manjar con reducción de frambuesas": [15000, 20000, 24000, 35000, 44000],
      "Manjar pastelera": [14000, 17000, 22000, 31000, 39000],
      "Manjar lúcuma": [15000, 19000, 24000, 31000, 42000],
      "Manjar naranja": [14000, 20000, 24000, 31000, 43000],
      "Manjar piña": [14000, 17000, 21000, 29000, 39000],
      "Manjar durazno": [15000, 18000, 23000, 31000, 40000],
    },
    "De chocolate": {
      "Chocolate moka": [17000, 19000, 26000, 36000, 45000],
      "Chocolate con reducción de frambuesa": [16000, 21000, 26000, 35000, 45000],
      "Chocolate naranja": [15000, 22000, 25000, 34000, 44000],
      "Selva negra": [17000, 23000, 26000, 35000, 45000],
    },
    "Tres y cuatro leches": {
      "Tres leches (con crema pastelera)": [17000, 23000, 28000, 38000, 47000],
      "Cuatro leches (con manjar y pastelera)": [18000, 24000, 29000, 39000, 48000],
      "Cuatro leches (con manjar, pastelera y durazno)": [19000, 25000, 30000, 40000, 49000],
    },
    "Otros sabores": {
      "Crema piña": [13000, 16000, 19000, 26000, 36000],
      "Prestigio (bizcocho de chocolate)": [19000, 25000, 29000, 39000, 49000],
      "Oreo chocolate": [20000, 26000, 30000, 40000, 50000],
    },
  },

  // Tortas de hojarasca. El precio no incluye el diseño.
  hojarasca: {
    "Manjar": [16000, 23000, 28000, 39000, 40000],
    "Manjar nuez": [18000, 25000, 30000, 42000, 52000],
    "Manjar naranja": [17000, 24000, 28000, 40000, 50000],
    "Amor amor": [17000, 24000, 28000, 40000, 50000],
    "Trasnochada": [17000, 24000, 28000, 40000, 50000],
  },

  // Mini tortas: el precio depende del diseño y ya lo incluye.
  mini: {
    sabores: [
      "Manjar crema",
      "Manjar pastelera",
      "Tres leches (lleva pastelera)",
      "Cuatro leches (lleva pastelera y manjar)",
      "Chocolate moka",
      "Manjar lúcuma",
      "Manjar naranja",
      "Manjar chocolate",
    ],
    bizcochos: ["Vainilla", "Chocolate"],
    disenos: [
      ["Diseño básico", 10000],
      ["Diseño con foto, guindas con glitter o mayor elaboración", 12000],
    ],
  },

  coberturas: ["Crema", "Fondant"],
};
