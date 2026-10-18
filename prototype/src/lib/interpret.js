// Intérprete mínimo de fechas en español para el prototipo.
// No es el parser definitivo: sirve para enseñar la vista previa y la pregunta ante ambigüedad.
// Referencia fija: jueves 22 de octubre de 2026.

const REF = new Date(2026, 9, 22);
const WEEKDAYS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MONTHS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const WORD_HOURS = { una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10, once: 11, doce: 12 };

const pad = (n) => String(n).padStart(2, "0");
const fmtDay = (d) => `${WEEKDAYS[d.getDay()][0].toUpperCase()}${WEEKDAYS[d.getDay()].slice(1)} ${d.getDate()} de ${MONTHS[d.getMonth()]}`;
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

export function interpret(input) {
  let text = input.trim();
  const low = norm(text);
  let date = null;
  let dateLabel = null;
  const cut = [];

  // Día
  let m;
  if ((m = low.match(/\bpasado manana\b/))) { date = addDays(REF, 2); cut.push(m[0]); }
  else if ((m = low.match(/(?<!la )\bmanana\b/))) { date = addDays(REF, 1); cut.push(m[0]); }
  else if ((m = low.match(/\bhoy\b/))) { date = REF; cut.push(m[0]); }
  else if ((m = low.match(/\b(la semana que viene|la proxima semana)\b/))) { dateLabel = "Semana del 26 de octubre, sin día fijo"; cut.push(m[0]); }
  else if ((m = low.match(/\b(?:el )?(\d{1,2}) de (enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\b/))) {
    const month = MONTHS.indexOf(m[2]);
    date = new Date(month < REF.getMonth() ? 2027 : 2026, month, Number(m[1]));
    cut.push(m[0]);
  } else {
    for (let i = 0; i < 7; i++) {
      const re = new RegExp(`\\b(?:el |este |el proximo )?${norm(WEEKDAYS[i])}\\b`);
      if ((m = low.match(re))) {
        let diff = (i - REF.getDay() + 7) % 7;
        if (diff === 0) diff = 7;
        date = addDays(REF, diff);
        cut.push(m[0]);
        break;
      }
    }
  }
  if (date) dateLabel = fmtDay(date);

  // Hora
  let hour = null, min = 0, period = null;
  if ((m = low.match(/\b(?:a las |a la )?(\d{1,2})[:.](\d{2})\b/))) { hour = +m[1]; min = +m[2]; cut.push(m[0]); }
  else if ((m = low.match(/\ba las? (\d{1,2})\b/))) { hour = +m[1]; cut.push(m[0]); }
  else if ((m = low.match(/\ba las? (una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|once|doce)(?: y (media|cuarto)| menos cuarto)?\b/))) {
    hour = WORD_HOURS[m[1]];
    if (m[2] === "media") min = 30;
    else if (m[2] === "cuarto") min = 15;
    else if (m[0].includes("menos cuarto")) { hour -= 1; min = 45; }
    cut.push(m[0]);
  }
  if ((m = low.match(/\b(de|por) la (manana|tarde|noche)\b/))) { period = m[2]; cut.push(m[0]); }

  let timeOptions = [];
  if (hour !== null) {
    if (hour >= 13 || hour === 0) timeOptions = [`${pad(hour)}:${pad(min)}`];
    else if (period === "manana") timeOptions = [`${pad(hour)}:${pad(min)}`];
    else if (period === "tarde" || period === "noche") timeOptions = [`${pad(hour + 12)}:${pad(min)}`];
    else timeOptions = [`${pad(hour + 12)}:${pad(min)}`, `${pad(hour)}:${pad(min)}`];
  }

  // Título: quitar los fragmentos de fecha y el «tengo que»
  let title = text;
  for (const c of cut) {
    const idx = norm(title).indexOf(c);
    if (idx >= 0) title = title.slice(0, idx) + title.slice(idx + c.length);
  }
  title = title.replace(/^\s*(tengo que|hay que|recordar|recuerdame)\s+/i, "").replace(/\s{2,}/g, " ").replace(/\s+(el|a|de)\s*$/i, "").trim();
  if (title) title = title[0].toUpperCase() + title.slice(1);

  const kind = !dateLabel && hour === null ? "sin-fecha" : timeOptions.length ? "con-hora" : "con-dia";
  return { title, dateLabel, timeOptions, ambiguous: timeOptions.length > 1, kind };
}
