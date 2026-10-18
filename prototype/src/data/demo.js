// Datos ficticios compartidos por todas las composiciones.
// «Hoy» es el jueves 22 de octubre de 2026 a las 16:10 (Europe/Madrid).

export const now = { label: "16:10", minutes: 16 * 60 + 10 };

export const today = { weekday: "Jueves", day: 22, month: "octubre" };

export const accounts = {
  personal: { id: "personal", name: "Personal", email: "tu.nombre@gmail.com" },
  secundaria: { id: "secundaria", name: "Secundaria", email: "otra.cuenta@gmail.com" },
};

// kind: fijo | rutina (opcional) | movible
export const events = [
  { id: "e1", title: "Revisión del presupuesto con Marta", start: "10:00", end: "11:00", startMin: 600, endMin: 660, account: "secundaria", kind: "fijo", place: "Videollamada" },
  { id: "e2", title: "Dentista", start: "17:30", end: "18:15", startMin: 1050, endMin: 1095, account: "personal", kind: "fijo", place: "Clínica Arenal, C/ Mayor 12", note: "Llevar el informe de la última revisión" },
  { id: "e3", title: "Gimnasio", start: "20:00", end: "21:00", startMin: 1200, endMin: 1260, account: "personal", kind: "rutina", note: "Rutina opcional: puedes saltarla" },
];

export const tasksToday = [
  { id: "t1", title: "Revisar el CV antes de enviarlo", estimate: "30 min", kind: "movible" },
  { id: "t2", title: "Pagar el seguro del coche", due: "vence el 3 nov", kind: "movible" },
  { id: "t3", title: "Comprar el regalo de Lucía", kind: "movible" },
];

export const done = [
  { id: "d1", title: "Enviar la factura de septiembre", at: "09:20" },
  { id: "d2", title: "Llamar al taller", at: "12:05" },
  { id: "d3", title: "Revisión del presupuesto con Marta", at: "11:00" },
];

export const attention = [
  { id: "a1", title: "Pedir cita en la peluquería", detail: "Sin fecha, apuntado hace 9 días", kind: "pendiente", action: "Proponer hueco" },
  { id: "a2", title: "Correo de Recursos Humanos sin responder", detail: "Hace 3 días", account: "secundaria", kind: "correo", action: "Abrir en Gmail" },
];

export const upcoming = [
  { id: "u1", day: "Vie", date: 23, items: [
    { title: "Cena con Ana", time: "21:00", account: "personal", kind: "fijo", conflict: true },
    { title: "Ensayo", time: "21:30–23:30", account: "personal", kind: "rutina", conflict: true },
  ] },
  { id: "u2", day: "Sáb", date: 24, items: [{ title: "Mercado con los vecinos", time: "11:00", account: "personal", kind: "movible" }] },
  { id: "u3", day: "Dom", date: 25, items: [] },
  { id: "u4", day: "Lun", date: 26, items: [{ title: "Entrega del informe", time: "Todo el día", account: "secundaria", kind: "fijo" }] },
  { id: "u5", day: "Mar", date: 27, items: [] },
];

export const vacation = { title: "Vacaciones apuntadas", range: "22–26 dic", account: "personal", note: "Solo está en tu calendario. La solicitud formal va por el portal de la empresa." };

export const backlog = [
  { id: "b1", title: "Pedir cita en la peluquería", age: "hace 9 días" },
  { id: "b2", title: "Renovar el DNI", age: "hace 3 semanas" },
  { id: "b3", title: "Devolver el libro a la biblioteca", age: "hace 2 días" },
];

// Ranuras libres hoy (para propuestas)
export const freeSlots = [
  { label: "16:30–17:15", why: "Antes del dentista" },
  { label: "18:30–19:45", why: "Entre el dentista y el gimnasio" },
];

export const conflict = {
  date: "Viernes 23 de octubre",
  a: { title: "Cena con Ana", time: "21:00–23:00", kind: "fijo", account: "personal" },
  b: { title: "Ensayo", time: "21:30–23:30", kind: "rutina", account: "personal", series: "Todos los viernes" },
};

export const searchQuery = "cv";

export const searchResults = [
  { id: "r1", source: "drive", name: "CV_2026_es.pdf", location: "Mi unidad › Empleo", account: "personal", date: "3 oct 2026", certainty: "alta", why: "El nombre y el contenido coinciden" },
  { id: "r2", source: "drive", name: "Currículum (borrador)", location: "Mi unidad › Documentos antiguos", account: "secundaria", date: "14 mar 2026", certainty: "media", why: "Documento de Google con «currículum» en el título" },
  { id: "r3", source: "gmail", name: "Te paso el CV actualizado", location: "Enviado a hola@estudio-norte.es, adjunto CV_final.pdf", account: "personal", date: "2 feb 2026", certainty: "media", why: "Correo con un adjunto que se llama CV" },
  { id: "r4", source: "drive", name: "Carta de presentación.pdf", location: "Mi unidad › Empleo", account: "personal", date: "3 oct 2026", certainty: "baja", why: "Solo menciona el CV en el texto" },
];

export const searchCoverage = {
  searched: ["Drive de Personal", "Drive de Secundaria", "Gmail de Personal"],
  notSearched: [{ what: "Gmail de Secundaria", why: "no has dado permiso de lectura" }],
};
