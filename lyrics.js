/* ==========================================================
   CONFIGURACION, FOTOS Y LETRA  -  AQUI ES DONDE EDITAS
   ========================================================== */
 
// ---------- DEDICATORIA ----------
var TITLE    = "Livias";
var SUBTITLE = "MIAMOR";
var DEDICATION_TO  = "My Livias";                       // nombre de ella (sale en la intro y al final)
var DEDICATION_MSG = "Eres mi universo entero. Te amo. DE Meza";  // mensaje del final
 
// ---------- AUDIO ----------
var AUDIO_START = 91.0;   // segundo del MP3 donde empieza la letra (91 = 1:31)
var AUDIO_FILES = ["PARTY.mp3"];
 
// ---------- AJUSTE GLOBAL DE TIEMPOS ----------
// TIME_SCALE     : multiplica TODOS los tiempos (inicio y duracion).
//                  1 = igual | 1.5 = todo 50% mas lento | 0.8 = 20% mas rapido
// DURATION_EXTRA : segundos que se SUMAN a la duracion de cada palabra (ej. 1 = un segundo mas).
//                  Las letras se iluminan mas despacio dentro de la palabra.
// CASCADE        : true  = cada palabra empuja a las siguientes (nada se pisa, la letra entera se alarga)
//                  false = solo se alarga la palabra, las demas mantienen su inicio original
var TIME_SCALE     = 1.2;
var DURATION_EXTRA = 0;
var CASCADE        = false;
 
// Segundo (de la letra) en que aparece el mensaje final. null = automatico
var OUTRO_AT = null;
 
// ---------- FOTOS ----------
// Pon tus fotos en la carpeta "fotos/". Cada foto puede ser:
//   "fotos/1.jpg"                                  (solo la foto)
//   { src: "fotos/1.jpg", caption: "Nuestro dia" }  (foto + frase debajo)
// Las fotos van apareciendo una a una mientras avanza la cancion.
// Si hay mas fotos que espacios en pantalla, se van turnando solas.
// Si una foto no existe, se muestra un marco con "tu foto aqui".
var PHOTOS = [
  "gatito.jpg",
  "gojo.jpg",
  "db.jpg",
  "lobo.jpg",
  "oso.jpg",
  "parao.jpg",
  "pro.jpg",
  "sa.jpg",
  "uwu.jpg",
  "vegeto.jpg"
  // { src: "fotos/11.jpg", caption: "Te amo" },
];
 
/* ----------------------------------------------------------
   LETRA
   Cada LINEA es un arreglo [ ... ] de palabras.
   Cada PALABRA:  ["texto", inicio, duracion, "estilo", "fuente", hold]
 
   - texto    : la palabra (puedes alargar vocales: "mujeeeer")
   - inicio   : segundo en que empieza (0 = inicio de la letra)
   - duracion : cuantos segundos dura
   - estilo   : "normal" (blanco-rosa) | "soft" (celeste) | "dramatic" (dorado)
                | "passion" (rosa fuerte + corazones) | "romantic" (rosa)
   - fuente   : "garamond" | "playfair" | "vibes" (cursiva) | "cinzel"
   - hold     : (opcional) true = la palabra late al final; un numero = duracion del latido
   ---------------------------------------------------------- */
var LYRICS = [
 
  [
    ["antes que se", 0.0, 0.3, "soft",     "garamond"],
    ["acabe el ",       0.3, 0.3, "soft",     "garamond"],
    ["MOMENTOO", 1.0, 2.0, "romantic", "vibes", true]
  ],
 
  [
    ["el himno",      3.4, 0.5, "normal", "playfair"],
    ["N1",      3.9, 0.6, "normal", "playfair"],
    ["de",  4.5, 0.6, "normal", "playfair"],
    ["la",        5.1, 0.3, "normal", "playfair"],
    ["fiesta", 5.4, 1.6, "normal", "playfair", true]
  ],
 
  [
    ["YEAH YEAH",        7.09, 1.4, "normal",   "garamond"],
    ["LIVIAS UwU", 7.49, 2.6, "passion",  "garamond", true]
  ],
 
  [
    ["la ",      9.2,  0.3,  "normal", "garamond"],
    ["mirada",   9.5,  1.0,  "normal", "garamond"],
    ["del",      10.7, 0.06, "soft",   "garamond"],
    ["amor", 10.79,0.5,  "soft",   "garamond"]
  ],
 
  [
    ["el",           10.9, 0.3, "soft", "garamond"],
    ["subidon de",      11.2, 0.8, "soft", "vibes"],
    ["ADRENALINA", 12.3, 1.0, "soft", "garamond"]
  ],
 
  [
    ["EL",         13.7, 0.3, "normal", "garamond"],
    ["ella",       14.0, 0.5, "normal", "garamond"],
    ["esta", 14.3, 0.5, "normal", "garamond"]
  ],
 
  [
    ["CONMIGOOO", 14.5, 1.2, "passion",  "vibes", true]
  ],
 
  [
    ["con",   15.0, 0.6, "normal", "playfair"],
    ["ese gesto", 15.7, 0.8, "normal", "playfair"],
    ["de indiferencia", 16.3, 0.6, "normal", "playfair"]
  ],
 
  [
    ["los",           16.6, 0.4, "normal", "garamond"],
    ["PAPARAZZI",        17.0, 1.0, "normal", "garamond"],

  ],
  [
    ["la camera plus", 18.6, 1.1, "normal", "garamond", true]
  ],
 
  [
    ["el",       20.0,  0.09,"soft", "garamond"],
    ["blanco & negro", 20.4, 1.2, "soft", "playfair"],
    ["y",      21.7, 0.2, "soft", "playfair", true],
    ["el",     22.6, 1.1, "soft", "playfair"],
    ["efecto del color",   23.0, 0.5, "soft", "playfair"]
  ],
 
  [
    ["la",      23.5, 0.7,  "normal",   "garamond"],
    ["chica",     24.0, 0.8,  "normal",   "garamond"],
    ["de",        24.4, 0.5, "normal",   "garamond"],
    ["buen rollo", 25.0, 1.4,  "romantic", "vibes", true]
  ],
  
  [
    ["los",           25.6, 0.4, "normal", "garamond"],
    ["cubiculos",        26.3, 1.0, "normal", "garamond"],

  ],

  [
    ["la",         27.0, 0.3, "normal", "garamond"],
    ["casa",       27.5, 0.5, "normal", "garamond"],
    ["de la", 28.0, 0.5, "normal", "garamond"],
    ["Diversion", 28.5, 0.6, "passion",  "vibes", true]
  ],
  [
    ["el himno",      29.3, 0.7,  "normal",   "garamond"],
    ["NUMERO 1", 29.8, 1.4,  "romantic", "vibes", true]
  ],

  [
    ["DE la fiesta", 32.3, 3.2, "passion",  "vibes", true]
  ],
];