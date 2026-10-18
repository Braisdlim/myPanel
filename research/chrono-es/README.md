# Prueba: fechas en español sin IA (chrono-node)

- Fecha: 18-10-2026. Versión: chrono-node 2.10.3, `chrono.es`, referencia domingo 18-10-2026 10:00 (+02:00), `forwardDate: true`.
- Ejecutar: `npm i chrono-node@2.10.3 && node prueba.mjs` (en una carpeta aparte).
- Nota: el entorno de la prueba estaba en UTC; en la app habrá que fijar la zona horaria del usuario.

## Resultado

| Frase | Interpretación | Valoración |
|---|---|---|
| tengo que pedir cita en la peluquería | sin fecha | ✅ |
| llamar a mamá mañana | 19-10 (sin hora) | ✅ |
| dentista el martes a las 17:30 | 20-10 17:30 | ✅ |
| cena con Ana el viernes a las nueve y media | 23-10, sin hora | ❌ horas en palabras |
| ensayo viernes de 9:30 a 11:30 | 23-10 09:30 + «11:30» suelto | ⚠️ rango roto; asume mañana sin avisar |
| renovar DNI la semana que viene | sin fecha | ❌ |
| pagar seguro el 3 de noviembre | 03-11 | ✅ |
| revisar CV pasado mañana por la tarde | «mañana» (19-10) | ❌ |
| en dos semanas devolver el libro | 01-11 | ✅ |
| antes del 15 enviar factura | «15» como hora 15:00 | ❌ |

**Conclusión**: 5/10 completos. Hace falta una capa de reglas propia en español y una vista previa de la interpretación con preguntas ante ambigüedad.
