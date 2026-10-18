import * as chrono from 'chrono-node';
const ref = new Date('2026-10-18T10:00:00+02:00'); // domingo
const frases = [
 'tengo que pedir cita en la peluquería',
 'llamar a mamá mañana',
 'dentista el martes a las 17:30',
 'cena con Ana el viernes a las nueve y media',
 'ensayo viernes de 9:30 a 11:30',
 'renovar DNI la semana que viene',
 'pagar seguro el 3 de noviembre',
 'revisar CV pasado mañana por la tarde',
 'en dos semanas devolver el libro',
 'antes del 15 enviar factura',
];
for (const f of frases) {
  const r = chrono.es.parse(f, ref, { forwardDate: true });
  console.log(JSON.stringify(f), '→', r.length ? r.map(x => `"${x.text}" ${x.start.date().toISOString()}${x.end ? ' → ' + x.end.date().toISOString() : ''} certain(hour)=${x.start.isCertain('hour')}`).join(' | ') : '(sin fecha)');
}
