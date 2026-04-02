const servicios = [
  { id: '1', nombre: 'Manicure', precio: 20000, pct: 0.5 },
  { id: '2', nombre: 'Pestañas', precio: 100000, pct: 0.6 }
];

const empleadas = [
  { id: '1', nombre: 'Ana' },
  { id: '2', nombre: 'Luisa' }
];

let diaActual = [];
let historial = JSON.parse(localStorage.getItem('historial')) || [];

const $ = id => document.getElementById(id);

function fmt(n) {
  return '$' + n.toLocaleString();
}

// cargar selects
function init() {
  servicios.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.id;
    opt.textContent = s.nombre;
    $('sel-servicio').appendChild(opt);
  });

  empleadas.forEach(e => {
    const opt = document.createElement('option');
    opt.value = e.id;
    opt.textContent = e.nombre;
    $('sel-empleada').appendChild(opt);
  });

  renderHistorial();
}

$('btn-agregar').onclick = () => {
  const emp = empleadas.find(e => e.id === $('sel-empleada').value);
  const srv = servicios.find(s => s.id === $('sel-servicio').value);
  const qty = parseInt($('inp-cantidad').value);

  const total = srv.precio * qty;
  const negocio = total * srv.pct;
  const empPago = total * (1 - srv.pct);

  diaActual.push({
    empNombre: emp.nombre,
    srvNombre: srv.nombre,
    qty,
    total,
    negocio,
    empPago
  });

  renderDia();
};

function renderDia() {
  const div = $('day-items');
  div.innerHTML = '';

  let total = 0;
  let negocio = 0;

  diaActual.forEach(i => {
    total += i.total;
    negocio += i.negocio;

    div.innerHTML += `<p>${i.srvNombre} - ${fmt(i.total)}</p>`;
  });

  const gastos = parseFloat($('inp-gastos').value) || 0;
  const gananciaReal = negocio - gastos;

  $('day-totals').innerHTML = `
    <p>Total: ${fmt(total)}</p>
    <p>Negocio: ${fmt(negocio)}</p>
    <p>Gastos: ${fmt(gastos)}</p>
    <p><strong>Ganancia real: ${fmt(gananciaReal)}</strong></p>
  `;
}

$('btn-cerrar').onclick = () => {
  const efectivo = parseFloat($('inp-efectivo').value) || 0;
  const transfer = parseFloat($('inp-transfer').value) || 0;
  const gastos = parseFloat($('inp-gastos').value) || 0;

  const total = diaActual.reduce((s,i)=>s+i.total,0);
  const negocio = diaActual.reduce((s,i)=>s+i.negocio,0);

  const cierre = {
    fecha: new Date().toLocaleDateString(),
    items: diaActual,
    total,
    negocio,
    efectivo,
    transfer,
    gastos,
    gananciaReal: negocio - gastos
  };

  historial.push(cierre);
  localStorage.setItem('historial', JSON.stringify(historial));

  diaActual = [];
  renderDia();
  renderHistorial();
};

function renderHistorial() {
  const body = $('hist-body');
  body.innerHTML = '';

  historial.forEach(c => {
    body.innerHTML += `
      <tr>
        <td>${c.fecha}</td>
        <td>${fmt(c.total)}</td>
        <td>${fmt(c.gananciaReal)}</td>
      </tr>
    `;
  });
}

// EXPORTAR CSV
$('btn-export-csv').onclick = () => {
  let csv = "Fecha,Total,Ganancia\n";

  historial.forEach(c => {
    csv += `${c.fecha},${c.total},${c.gananciaReal}\n`;
  });

  const blob = new Blob([csv]);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'historial.csv';
  a.click();
};

// EXPORTAR ÚLTIMO CIERRE
$('btn-export-dia').onclick = () => {
  if (!historial.length) return;

  const c = historial[historial.length - 1];

  let txt = `
CIERRE DEL DÍA

Fecha: ${c.fecha}

Ventas: ${fmt(c.total)}
Efectivo: ${fmt(c.efectivo)}
Transferencia: ${fmt(c.transfer)}

Gastos: ${fmt(c.gastos)}
Ganancia real: ${fmt(c.gananciaReal)}
`;

  const blob = new Blob([txt]);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'cierre.txt';
  a.click();
};

init();
