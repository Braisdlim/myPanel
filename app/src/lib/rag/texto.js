// Texto para buscar en español (D-061): minúsculas, sin tildes, sin palabras vacías y con una raíz ligera.
// Sin dependencias: un lematizador «ligero» (quita plurales y las terminaciones más comunes), suficiente para
// agenda, tareas y notas cortas. Se mide contra el banco de preguntas (research/rag/resultados.md).

const VACIAS = new Set(("a al algo algun alguna algunas alguno algunos ante antes aqui asi aun bajo bien cada como con contra cual cuales cuando " +
  "de del desde donde dos el ella ellas ellos en entre era eran es esa esas ese eso esos esta estaba estado estan estar este esto estos " +
  "fue fueron ha haber habia han has hasta hay la las le les lo los mas me mi mis mucho muy nada ni no nos nosotros o os otra otras otro otros " +
  "para pero poco por porque que quien se sea ser si sido sin sobre son su sus tambien te tengo tiene tienen tu tus un una unas uno unos y ya yo " +
  "voy vas va vamos van hago hace hacer tener ir esto dime decir sabes cual cuales cuanto cuantos cuanta cuantas mio mia").split(" "));

/** Minúsculas y sin tildes; la ñ pasa a n, como escribe mucha gente en el móvil («cumpleanos»). */
export function normalizar(t) {
  return (t ?? "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

const SUFIJOS = ["amientos", "imientos", "amiento", "imiento", "aciones", "uciones", "adoras", "adores", "ancias", "encias", "mente",
  "acion", "ucion", "adora", "ador", "ancia", "encia", "idades", "idad", "istas", "ista", "ables", "ibles", "able", "ible",
  "ando", "iendo", "ados", "idos", "adas", "idas", "ado", "ido", "ada", "ida", "aron", "ieron", "aba", "ia",
  "ar", "er", "ir", "es", "os", "as", "o", "a", "e", "s"];

/** Raíz ligera: quita la terminación más larga si deja al menos 4 letras («clases» → «clas», «revisión» → «revis»). */
export function raiz(palabra) {
  if (palabra.length <= 4 || /\d/.test(palabra)) return palabra;
  for (const s of SUFIJOS) if (palabra.endsWith(s) && palabra.length - s.length >= 4) return palabra.slice(0, -s.length);
  return palabra;
}

/** Palabras con significado, ya en raíz. */
export function terminos(t) {
  return normalizar(t).split(/[^a-z0-9]+/).filter((p) => p.length > 1 && !VACIAS.has(p)).map(raiz);
}
