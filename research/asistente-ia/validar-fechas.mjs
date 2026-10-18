// Prueba: validar en código la propuesta de evento que devolvería un modelo (salida JSON).
// Ejecutar en una carpeta aparte: npm i temporal-polyfill@1.0.6 && node validar-fechas.mjs
import { Temporal } from 'temporal-polyfill';

const ZONA = 'Europe/Madrid';
const ahora = Temporal.ZonedDateTime.from('2026-10-18T10:00:00+02:00[Europe/Madrid]'); // domingo
const DIAS = { lunes: 1, martes: 2, 'miércoles': 3, jueves: 4, viernes: 5, 'sábado': 6, domingo: 7 };

// Propuestas simuladas (lo que un modelo podría devolver con JSON Schema).
const propuestas = [
  { frase: 'cena el viernes a las nueve y media', dia_semana_dicho: 'viernes', inicio: '2026-10-23T21:30', fin: '2026-10-23T23:00' },
  { frase: 'cena el viernes a las nueve y media (modelo se equivoca de día)', dia_semana_dicho: 'viernes', inicio: '2026-10-24T21:30', fin: '2026-10-24T23:00' },
  { frase: 'guardia de la noche del sábado al domingo, de 1:30 a 3:30 (cruza el cambio de hora)', dia_semana_dicho: 'domingo', inicio: '2026-10-25T01:30', fin: '2026-10-25T03:30' },
  { frase: 'llamar a las 2:30 del domingo 25 (hora repetida)', dia_semana_dicho: 'domingo', inicio: '2026-10-25T02:30', fin: '2026-10-25T02:45' },
  { frase: 'revisión el martes pasado', dia_semana_dicho: 'martes', inicio: '2026-10-13T10:00', fin: '2026-10-13T11:00' },
];

for (const p of propuestas) {
  const avisos = [];
  const ini = Temporal.PlainDateTime.from(p.inicio);
  const fin = Temporal.PlainDateTime.from(p.fin);
  if (DIAS[p.dia_semana_dicho] && ini.dayOfWeek !== DIAS[p.dia_semana_dicho])
    avisos.push(`el ${ini.toPlainDate()} no es ${p.dia_semana_dicho}`);
  // ¿La hora local existe y es única ese día en Madrid?
  const antes = ini.toZonedDateTime(ZONA, { disambiguation: 'earlier' });
  const despues = ini.toZonedDateTime(ZONA, { disambiguation: 'later' });
  if (antes.epochNanoseconds !== despues.epochNanoseconds)
    avisos.push(`${ini.toPlainTime()} ocurre dos veces (cambio de hora): preguntar`);
  const zi = ini.toZonedDateTime(ZONA), zf = fin.toZonedDateTime(ZONA);
  if (Temporal.ZonedDateTime.compare(zf, zi) <= 0) avisos.push('el fin no es posterior al inicio');
  const dur = zi.until(zf, { largestUnit: 'hours' });
  const reloj = ini.until(fin, { largestUnit: 'hours' });
  if (dur.total("minutes") !== reloj.total("minutes")) avisos.push(`dura ${dur.toString()} reales aunque el reloj marque ${reloj.toString()}`);
  if (Temporal.ZonedDateTime.compare(zi, ahora) < 0) avisos.push('está en el pasado');
  console.log(`${avisos.length ? '⚠️' : '✅'} ${p.frase}\n   ${zi.toString()} → ${zf.toString()}${avisos.length ? '\n   ' + avisos.join('; ') : ''}`);
}
