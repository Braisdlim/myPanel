"""Mide cuánto ocupa en SQLite el volumen de datos de una persona durante 10 años (datos sintéticos).
Uso: python3 -I medir.py [carpeta_salida]"""
import sqlite3, os, random, datetime, sys, tempfile

random.seed(1)
out = sys.argv[1] if len(sys.argv) > 1 else tempfile.mkdtemp()
db = os.path.join(out, 'pauta-10-anos.sqlite')
if os.path.exists(db): os.remove(db)
c = sqlite3.connect(db)
c.executescript('''
create table fondo (id integer primary key, isin text, nombre text);
create table valor_liquidativo (fondo_id integer, fecha text, valor real, primary key (fondo_id, fecha)) without rowid;
create table movimiento (id integer primary key, cuenta text, fecha text, importe real, concepto text, categoria text);
create table evento (id text primary key, cuenta text, inicio text, fin text, titulo text, lugar text, serie text, actualizado text);
create table tarea (id integer primary key, titulo text, notas text, lista text, cuando text, limite text, duracion integer, hecha text);
''')
inicio = datetime.date(2016, 10, 18)
dias = [inicio + datetime.timedelta(d) for d in range(3652)]
habiles = [d for d in dias if d.weekday() < 5]
FONDOS, MOV_ANO, EV_ANO, TAR_ANO = 20, 3000, 1500, 1500
c.executemany('insert into fondo values (?,?,?)', [(i, f'IE00B{i:07d}', f'Fondo {i}') for i in range(FONDOS)])
c.executemany('insert into valor_liquidativo values (?,?,?)', ((f, d.isoformat(), round(10 + random.random() * 50, 4)) for f in range(FONDOS) for d in habiles))
conceptos = ['Mercadona', 'Recibo luz', 'Transferencia recibida', 'Gasolinera', 'Restaurante', 'Bizum', 'Suscripción']
c.executemany('insert into movimiento (cuenta, fecha, importe, concepto, categoria) values (?,?,?,?,?)',
              (('ES00 0000 0000 00', random.choice(dias).isoformat(), round(random.uniform(-200, 200), 2), random.choice(conceptos) + ' ' + str(random.randint(1, 9999)), 'gastos') for _ in range(MOV_ANO * 10)))
c.executemany('insert into evento values (?,?,?,?,?,?,?,?)',
              ((f'ev{i:08d}', random.choice(['Gmail 1', 'Gmail 2', 'Outlook']), '2026-10-23T10:00', '2026-10-23T11:00', 'Evento de ejemplo ' + str(i), 'Lugar de ejemplo', '', '2026-10-18') for i in range(EV_ANO * 10)))
c.executemany('insert into tarea (titulo, notas, lista, cuando, limite, duracion, hecha) values (?,?,?,?,?,?,?)',
              (('Tarea de ejemplo ' + str(i), 'Unas notas cortas de ejemplo para la tarea.', 'Casa', '2026-10-23', None, 15, None) for i in range(TAR_ANO * 10)))
c.commit(); c.execute('vacuum'); c.close()
n = os.path.getsize(db)
filas = FONDOS * len(habiles) + (MOV_ANO + EV_ANO + TAR_ANO) * 10
print(f'filas: {filas:,}'.replace(',', '.'))
print(f'tamaño de 10 años para 1 persona: {n / 1e6:.1f} MB')
print(f'1.000 personas (estimado, ×1.000): {n * 1000 / 1e9:.1f} GB')
