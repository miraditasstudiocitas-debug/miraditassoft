/* =============================================
   MIRADITAS STUDIO — app.js  v2
   ============================================= */

// ── DATOS INICIALES ──────────────────────────────────────────────
const DEFAULT_COSTOS = [
  { id: 'c1', concepto: 'Arriendo',  valor: 3500000 },
  { id: 'c2', concepto: 'Servicios', valor: 500000  },
  { id: 'c3', concepto: 'Cafetería', valor: 50000   },
  { id: 'c4', concepto: 'Insumos',   valor: 250000  },
];

const DEFAULT_SERVICIOS = [
  { id: 's1',  nombre: 'Manicure Tradicional',   precio: 18000,  pctNegocio: 0.5, cat: 'manicure' },
  { id: 's2',  nombre: 'Semipermanente',          precio: 40000,  pctNegocio: 0.5, cat: 'manicure' },
  { id: 's3',  nombre: 'Semipermanente + Rubber', precio: 58000,  pctNegocio: 0.5, cat: 'manicure' },
  { id: 's4',  nombre: 'Uñas Poligel',            precio: 120000, pctNegocio: 0.5, cat: 'manicure' },
  { id: 's5',  nombre: 'Uñas Acrílicas',          precio: 120000, pctNegocio: 0.5, cat: 'manicure' },
  { id: 's6',  nombre: 'Press On',                precio: 95000,  pctNegocio: 0.5, cat: 'manicure' },
  { id: 's7',  nombre: 'Pies Tradicionales',      precio: 50000,  pctNegocio: 0.5, cat: 'manicure' },
  { id: 's8',  nombre: 'Pies Semipermanente',     precio: 50000,  pctNegocio: 0.5, cat: 'manicure' },
  { id: 's9',  nombre: 'Limpieza Pies',           precio: 20000,  pctNegocio: 0.5, cat: 'manicure' },
  { id: 's10', nombre: 'Reparación Uña',          precio: 10000,  pctNegocio: 0.5, cat: 'manicure' },
  { id: 's11', nombre: 'Retiro Esmalte',          precio: 20000,  pctNegocio: 0.5, cat: 'manicure' },
  { id: 's12', nombre: 'Depilación Cera',         precio: 10000,  pctNegocio: 0.6, cat: 'lashes'   },
  { id: 's13', nombre: 'Diseño + Depilación',     precio: 20000,  pctNegocio: 0.6, cat: 'lashes'   },
  { id: 's14', nombre: 'Diseño + Henna',          precio: 30000,  pctNegocio: 0.6, cat: 'lashes'   },
  { id: 's15', nombre: 'Depilación Bozo',         precio: 8000,   pctNegocio: 0.6, cat: 'lashes'   },
  { id: 's16', nombre: 'Laminado Cejas',          precio: 85000,  pctNegocio: 0.6, cat: 'lashes'   },
  { id: 's17', nombre: 'Pestañas Natural',        precio: 130000, pctNegocio: 0.6, cat: 'lashes'   },
  { id: 's18', nombre: 'Pestañas Semi Natural',   precio: 150000, pctNegocio: 0.6, cat: 'lashes'   },
  { id: 's19', nombre: 'Pestañas Pestañina',      precio: 160000, pctNegocio: 0.6, cat: 'lashes'   },
  { id: 's20', nombre: 'Pestañas Ruso',           precio: 170000, pctNegocio: 0.6, cat: 'lashes'   },
  { id: 's21', nombre: 'Retoque',                 precio: 50000,  pctNegocio: 0.6, cat: 'lashes'   },
  { id: 's22', nombre: 'Lifting',                 precio: 95000,  pctNegocio: 0.6, cat: 'lashes'   },
];

const DEFAULT_EMPLEADAS = [
  { id: 'e1', nombre: 'Lashista 1',    tipo: 'lashista',    pctNegocio: 0.6 },
  { id: 'e2', nombre: 'Lashista 2',    tipo: 'lashista',    pctNegocio: 0.6 },
  { id: 'e3', nombre: 'Manicurista 1', tipo: 'manicurista', pctNegocio: 0.5 },
  { id: 'e4', nombre: 'Manicurista 2', tipo: 'manicurista', pctNegocio: 0.5 },
];

// ── PERSISTENCIA ─────────────────────────────────────────────────
function load(key, def) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def; } catch { return def; }
}
function save(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

let costos    = load('ms_costos',    DEFAULT_COSTOS);
let servicios = load('ms_servicios', DEFAULT_SERVICIOS);
let empleadas = load('ms_empleadas', DEFAULT_EMPLEADAS);
let historial = load('ms_historial', []);   // cierres completos
let diaActual = load('ms_dia',       []);   // items servicios del día en curso
let gastosHoy = load('ms_gastos_hoy', []);  // gastos del día en curso
let editEmpId = null, editSrvId = null, editCostoId = null;

// ── UTILIDADES ────────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const fmt = n => '$' + Math.round(n).toLocaleString('es-CO');
const uid = () => '_' + Math.random().toString(36).slice(2, 9);

function toast(msg, type = 'success') {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

function totalCostos() { return costos.reduce((s, c) => s + c.valor, 0); }
function gananciaBrutaMes() { return historial.reduce((s, c) => s + c.totalNegocio, 0); }
function gastosExtraMes()   { return historial.reduce((s, c) => s + (c.totalGastos || 0), 0); }
function gananciaRealMes()  { return gananciaBrutaMes() - gastosExtraMes(); }
function totalGastosHoy()   { return gastosHoy.reduce((s, g) => s + g.valor, 0); }

// ── ALERTAS ───────────────────────────────────────────────────────
function renderAlertas() {
  const banner = $('alertas-banner');
  const alertas = [];

  if (historial.length >= 2) {
    const hoy   = historial[historial.length - 1].totalVendido;
    const ayer  = historial[historial.length - 2].totalVendido;
    if (hoy < ayer) {
      alertas.push(`Hoy vendiste ${fmt(hoy)}, menos que ayer (${fmt(ayer)})`);
    }
  }

  const meta = totalCostos();
  const real = gananciaRealMes();
  if (real < 0 && historial.length > 0) {
    alertas.push(`Llevas ${fmt(Math.abs(real))} en déficit este mes`);
  }

  if (!alertas.length) { banner.style.display = 'none'; return; }
  banner.style.display = 'flex';
  banner.innerHTML = alertas.map(a => `<span class="alerta-item">${a}</span>`).join('');
}

// ── TABS ──────────────────────────────────────────────────────────
document.querySelectorAll('.tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(s => s.classList.remove('active'));
    btn.classList.add('active');
    $('tab-' + btn.dataset.tab).classList.add('active');

    if (btn.dataset.tab === 'equilibrio') setEquilibrioUI();
    if (btn.dataset.tab === 'empleadas')  renderEmpleadas();
    if (btn.dataset.tab === 'servicios')  renderServicios();
    if (btn.dataset.tab === 'costos')     renderCostos();
    if (btn.dataset.tab === 'historial')  { renderHistorial(); $('vista-servicios').style.display = 'block'; $('vista-cierres').style.display = 'none'; }
    if (btn.dataset.tab === 'dashboard')  renderDashboard();
  });
});

// ── FECHA ─────────────────────────────────────────────────────────
function setFecha() {
  $('fecha-hoy').textContent = new Date().toLocaleDateString('es-CO', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
}
setFecha();

// ── SELECTORES ────────────────────────────────────────────────────
function populateSelectores() {
  const selEmp = $('sel-empleada');
  selEmp.innerHTML = '<option value="">— Selecciona empleada —</option>';
  empleadas.forEach(e => {
    const opt = document.createElement('option');
    opt.value = e.id;
    opt.textContent = e.nombre + ' (' + (e.tipo === 'lashista' ? 'Lashista' : e.tipo === 'manicurista' ? 'Manicurista' : 'Estilista') + ')';
    selEmp.appendChild(opt);
  });

  const selSrv = $('sel-servicio');
  selSrv.innerHTML = '<option value="">— Selecciona servicio —</option>';
  const grupos = {};
  servicios.forEach(s => { if (!grupos[s.cat]) grupos[s.cat] = []; grupos[s.cat].push(s); });
  const catLabels = { manicure: 'Manicure / Pies', lashes: 'Pestañas / Cejas', otro: 'Otros' };
  Object.entries(grupos).forEach(([cat, srvs]) => {
    const og = document.createElement('optgroup');
    og.label = catLabels[cat] || cat;
    srvs.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent = s.nombre + ' — ' + fmt(s.precio);
      og.appendChild(opt);
    });
    selSrv.appendChild(og);
  });
  // Opción "Otro" libre
  const ogOtro = document.createElement('optgroup');
  ogOtro.label = '— Servicio / Adicional personalizado —';
  const optLibre = document.createElement('option');
  optLibre.value = 'otro-libre';
  optLibre.textContent = '✏ Otro (ingresar nombre y valor)';
  ogOtro.appendChild(optLibre);
  selSrv.appendChild(ogOtro);
}

// ── PREVIEW ───────────────────────────────────────────────────────
function updatePreview() {
  const srvId = $('sel-servicio').value;
  const qty   = parseInt($('inp-cantidad').value) || 1;
  const box   = $('preview-servicio');
  const campoLibre = $('campo-srv-libre');

  // Mostrar/ocultar campo libre
  if (srvId === 'otro-libre') {
    campoLibre.style.display = 'block';
    box.style.display = 'none';
    return;
  } else {
    campoLibre.style.display = 'none';
  }

  if (!srvId) { box.style.display = 'none'; return; }
  const srv = servicios.find(s => s.id === srvId);
  if (!srv)  { box.style.display = 'none'; return; }
  const total = srv.precio * qty;
  $('prev-precio').textContent = fmt(srv.precio);
  $('prev-total').textContent  = fmt(total);
  $('prev-spa').textContent    = fmt(total * srv.pctNegocio);
  $('prev-emp').textContent    = fmt(total * (1 - srv.pctNegocio));
  box.style.display = 'block';
}
$('sel-servicio').addEventListener('change', updatePreview);
$('inp-cantidad').addEventListener('input',  updatePreview);

// Listener % personalizado servicio libre
$('inp-srv-libre-pct').addEventListener('change', () => {
  $('campo-srv-libre-custom').style.display = $('inp-srv-libre-pct').value === 'custom' ? 'flex' : 'none';
});

// ── AGREGAR SERVICIO AL DÍA ───────────────────────────────────────
$('btn-agregar').addEventListener('click', () => {
  const empId = $('sel-empleada').value;
  const srvId = $('sel-servicio').value;
  const qty   = parseInt($('inp-cantidad').value) || 1;
  if (!empId) { toast('Selecciona una empleada', 'error'); return; }
  if (!srvId) { toast('Selecciona un servicio',  'error'); return; }

  const emp = empleadas.find(e => e.id === empId);
  if (!emp) return;

  let srvNombre, precio, pctNegocio;

  if (srvId === 'otro-libre') {
    // Servicio personalizado
    srvNombre = $('inp-srv-libre-nombre').value.trim();
    precio    = parseFloat($('inp-srv-libre-precio').value);
    const pctRaw = $('inp-srv-libre-pct').value;
    pctNegocio = pctRaw === 'custom'
      ? parseFloat($('inp-srv-libre-pct-custom').value) / 100
      : parseFloat(pctRaw);
    if (!srvNombre) { toast('Escribe el nombre del servicio', 'error'); return; }
    if (!precio || precio <= 0) { toast('Ingresa un precio válido', 'error'); return; }
  } else {
    const srv = servicios.find(s => s.id === srvId);
    if (!srv) return;
    srvNombre  = srv.nombre;
    precio     = srv.precio;
    pctNegocio = srv.pctNegocio;
  }

  const total   = precio * qty;
  const negocio = total * pctNegocio;
  const empPago = total * (1 - pctNegocio);

  diaActual.push({ id: uid(), empId, empNombre: emp.nombre, srvId, srvNombre, qty, precio, total, negocio, empPago });
  save('ms_dia', diaActual);

  $('sel-empleada').value = '';
  $('sel-servicio').value = '';
  $('inp-cantidad').value = 1;
  $('preview-servicio').style.display = 'none';
  $('campo-srv-libre').style.display  = 'none';
  $('inp-srv-libre-nombre').value = '';
  $('inp-srv-libre-precio').value = '';
  $('inp-srv-libre-pct').value = '0.5';
  $('campo-srv-libre-custom').style.display = 'none';
  renderDiaActual();
  setEquilibrioUI();
  toast('Servicio agregado ✓');
});

// ── RENDER DÍA ACTUAL ─────────────────────────────────────────────
function renderDiaActual() {
  const container = $('day-items');
  const totalesEl = $('day-totals');
  const gastosSec = $('gastos-section');
  const paymentEl = $('payment-section');
  const btnCerrar = $('btn-cerrar');

  if (!diaActual.length) {
    container.innerHTML = '<div class="empty-state">No hay servicios registrados aún</div>';
    totalesEl.style.display = 'none';
    paymentEl.style.display = 'none';
    btnCerrar.style.display = 'none';
    renderGastosHoy(); // siempre renderizar gastos
    return;
  }

  container.innerHTML = diaActual.map(item => `
    <div class="day-item">
      <div class="day-item-info">
        <div class="day-item-name">${item.srvNombre}</div>
        <div class="day-item-sub">${item.empNombre} · ×${item.qty}</div>
      </div>
      <div class="day-item-amounts">
        <div class="day-item-total">${fmt(item.total)}</div>
        <div class="day-item-split">Negocio: ${fmt(item.negocio)}</div>
      </div>
      <button class="day-item-del" data-id="${item.id}">✕</button>
    </div>
  `).join('');

  container.querySelectorAll('.day-item-del').forEach(btn => {
    btn.addEventListener('click', () => {
      diaActual = diaActual.filter(i => i.id !== btn.dataset.id);
      save('ms_dia', diaActual);
      renderDiaActual();
      setEquilibrioUI();
    });
  });

  const totalVendido  = diaActual.reduce((s, i) => s + i.total,   0);
  const totalNegocio  = diaActual.reduce((s, i) => s + i.negocio, 0);
  const totalEmpleada = diaActual.reduce((s, i) => s + i.empPago, 0);

  $('tot-vendido').textContent   = fmt(totalVendido);
  $('tot-negocio').textContent   = fmt(totalNegocio);
  $('tot-empleadas').textContent = fmt(totalEmpleada);

  totalesEl.style.display = 'block';
  paymentEl.style.display = 'block';
  btnCerrar.style.display = 'block';

  renderGastosHoy();
}

// ── GASTOS DEL DÍA ────────────────────────────────────────────────
function renderGastosHoy() {
  const list     = $('gastos-list');
  const totalRow = $('gastos-total-row');
  const realBox  = $('ganancia-real-box');
  const realVal  = $('ganancia-real-val');

  if (!gastosHoy.length) {
    list.innerHTML = '<div style="font-size:.82rem;color:var(--text-muted);padding:.4rem 0">Sin gastos registrados</div>';
    totalRow.style.display = 'none';
  } else {
    list.innerHTML = gastosHoy.map(g => `
      <div class="gasto-item">
        <span class="gasto-desc">${g.concepto}</span>
        <span class="gasto-valor">${fmt(g.valor)}</span>
        <button class="gasto-del" data-id="${g.id}">✕</button>
      </div>
    `).join('');
    list.querySelectorAll('.gasto-del').forEach(btn => {
      btn.addEventListener('click', () => {
        gastosHoy = gastosHoy.filter(g => g.id !== btn.dataset.id);
        save('ms_gastos_hoy', gastosHoy);
        renderGastosHoy();
      });
    });
    $('gastos-total-val').textContent = fmt(totalGastosHoy());
    totalRow.style.display = 'flex';
  }

  // Ganancia REAL del día
  const totalNegocio  = diaActual.reduce((s, i) => s + i.negocio, 0);
  const gananciaReal  = totalNegocio - totalGastosHoy();
  realVal.textContent = fmt(gananciaReal);
  realVal.className   = 'ganancia-real-num' + (gananciaReal < 0 ? ' negativa' : '');
}

// Modal gastos - descripción libre
$('btn-add-gasto').addEventListener('click', () => {
  $('inp-gasto-valor').value = '';
  $('inp-gasto-desc').value  = '';
  $('modal-gasto').style.display = 'flex';
  setTimeout(() => $('inp-gasto-desc').focus(), 100);
});

$('btn-cancel-gasto').addEventListener('click', () => { $('modal-gasto').style.display = 'none'; });

$('btn-save-gasto').addEventListener('click', () => {
  const desc  = $('inp-gasto-desc').value.trim();
  const valor = parseFloat($('inp-gasto-valor').value);
  if (!desc)  { toast('Describe el gasto', 'error'); return; }
  if (!valor || valor <= 0) { toast('Ingresa un valor válido', 'error'); return; }
  gastosHoy.push({ id: uid(), concepto: desc, valor });
  save('ms_gastos_hoy', gastosHoy);
  $('modal-gasto').style.display = 'none';
  renderGastosHoy();
  toast('Gasto registrado ✓');
});

// ── CERRAR DÍA ────────────────────────────────────────────────────
$('btn-cerrar').addEventListener('click', () => {
  if (!diaActual.length) { toast('No hay servicios para cerrar', 'error'); return; }

  const efectivo     = parseFloat($('inp-efectivo').value) || 0;
  const transfer     = parseFloat($('inp-transfer').value) || 0;
  const totalVend    = diaActual.reduce((s, i) => s + i.total,   0);
  const totalNeg     = diaActual.reduce((s, i) => s + i.negocio, 0);
  const totalEmp     = diaActual.reduce((s, i) => s + i.empPago, 0);
  const totalGastos  = totalGastosHoy();
  const gananciaReal = totalNeg - totalGastos;

  let tipoPago = 'mixto';
  if (efectivo > 0 && transfer === 0) tipoPago = 'efectivo';
  else if (transfer > 0 && efectivo === 0) tipoPago = 'transferencia';

  const cierre = {
    id: uid(),
    fecha: new Date().toLocaleDateString('es-CO'),
    items: [...diaActual],
    gastos: [...gastosHoy],
    totalVendido:  totalVend,
    totalNegocio:  totalNeg,
    totalEmpleadas: totalEmp,
    totalGastos,
    gananciaReal,
    efectivo, transfer, tipoPago,
  };

  historial.push(cierre);
  save('ms_historial', historial);

  diaActual = [];
  gastosHoy = [];
  save('ms_dia', diaActual);
  save('ms_gastos_hoy', gastosHoy);

  $('inp-efectivo').value = 0;
  $('inp-transfer').value = 0;

  renderDiaActual();
  setEquilibrioUI();
  renderAlertas();
  toast('Día cerrado exitosamente 🌸');
});

// ── EQUILIBRIO ────────────────────────────────────────────────────
function setEquilibrioUI() {
  const meta   = totalCostos();
  const brutaAcum = gananciaBrutaMes();
  const gastosAcum = gastosExtraMes();
  const realAcum  = gananciaRealMes();
  const pct    = Math.min((brutaAcum / meta) * 100, 100);
  const falta  = Math.max(meta - brutaAcum, 0);

  // mini bar
  const fill = $('eq-bar-fill');
  if (fill) {
    fill.style.width = pct + '%';
    fill.classList.toggle('over', brutaAcum >= meta);
    $('eq-pct-txt').textContent = pct.toFixed(1) + '%';
    $('eq-acum').textContent    = fmt(brutaAcum);
    $('eq-meta').textContent    = fmt(meta);
    $('eq-falta').textContent   = fmt(falta);
  }

  // full tab
  if ($('eq-costos')) {
    $('eq-costos').textContent      = fmt(meta);
    $('eq-ganancia').textContent    = fmt(brutaAcum);
    $('eq-gastos-extra').textContent = fmt(gastosAcum);

    const util = realAcum - meta;
    $('eq-utilidad').textContent = util >= 0 ? fmt(util) : '-' + fmt(Math.abs(util));
    $('eq-utilidad').style.color = util >= 0 ? 'var(--green)' : 'var(--rose)';

    const hoy      = new Date();
    const diasMes  = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).getDate();
    const diasRest = diasMes - hoy.getDate() + 1;
    if (diasRest > 0 && brutaAcum < meta) {
      $('eq-meta-diaria').textContent = fmt(falta / diasRest) + '/día';
    } else if (brutaAcum >= meta) {
      $('eq-meta-diaria').textContent = '✓ Meta alcanzada';
    } else {
      $('eq-meta-diaria').textContent = '—';
    }

    const fillBig = $('eq-bar-big');
    if (fillBig) {
      fillBig.style.width = pct + '%';
      fillBig.classList.toggle('over', brutaAcum >= meta);
      $('eq-bar-label').textContent = pct.toFixed(0) + '%';
    }
    $('eq-status').textContent = brutaAcum >= meta
      ? '✓ Punto de equilibrio alcanzado este mes 🎉'
      : `Faltan ${fmt(falta)} para cubrir costos fijos`;
    $('eq-status').style.color = brutaAcum >= meta ? 'var(--green)' : 'var(--text-muted)';

    renderChartDias();
  }
}

// ── HISTORIAL ─────────────────────────────────────────────────────
function renderHistorial() {
  const tbody = $('hist-body');
  if (!historial.length) {
    tbody.innerHTML = '<tr><td colspan="8" class="empty-state">Sin registros aún</td></tr>';
    return;
  }
  const rows = [];
  historial.forEach(c => {
    c.items.forEach(item => {
      const badge = c.tipoPago === 'efectivo'
        ? '<span class="badge badge-efectivo">Efectivo</span>'
        : c.tipoPago === 'transferencia'
          ? '<span class="badge badge-transfer">Transferencia</span>'
          : '<span class="badge badge-mixto">Mixto</span>';
      rows.push(`<tr>
        <td>${c.fecha}</td><td>${item.empNombre}</td><td>${item.srvNombre}</td>
        <td>${item.qty}</td><td>${fmt(item.total)}</td>
        <td>${fmt(item.negocio)}</td><td>${fmt(item.empPago)}</td><td>${badge}</td>
      </tr>`);
    });
  });
  tbody.innerHTML = rows.join('');
}

// Vista cierres de caja
$('btn-ver-cierres').addEventListener('click', () => {
  $('vista-servicios').style.display = 'none';
  $('vista-cierres').style.display   = 'block';
  renderCierresCaja();
});
$('btn-volver-servicios').addEventListener('click', () => {
  $('vista-servicios').style.display = 'block';
  $('vista-cierres').style.display   = 'none';
});

function buildCierreTexto(c) {
  const lines = [];
  lines.push(`Fecha: ${c.fecha}`);
  lines.push('');
  lines.push(`Ventas: ${fmt(c.totalVendido)}`);
  lines.push(`Efectivo: ${fmt(c.efectivo || 0)}`);
  lines.push(`Transferencia: ${fmt(c.transfer || 0)}`);
  lines.push('');
  lines.push(`Pago empleadas: ${fmt(c.totalEmpleadas)}`);
  if (c.totalGastos > 0) {
    lines.push(`Gastos del día: ${fmt(c.totalGastos)}`);
    if (c.gastos && c.gastos.length) {
      c.gastos.forEach(g => lines.push(`  · ${g.concepto}: ${fmt(g.valor)}`));
    }
  }
  lines.push('');
  const real = c.gananciaReal != null ? c.gananciaReal : c.totalNegocio;
  lines.push(`GANANCIA REAL: ${fmt(real)}`);
  return lines.join('\n');
}

function renderCierresCaja() {
  const container = $('cierres-list');
  if (!historial.length) {
    container.innerHTML = '<div class="card"><div class="empty-state">Sin cierres registrados</div></div>';
    return;
  }
  container.innerHTML = [...historial].reverse().map(c => {
    const texto = buildCierreTexto(c);
    const real  = c.gananciaReal != null ? c.gananciaReal : c.totalNegocio;
    const colorClass = real >= 0 ? 'linea-destacada' : 'linea-roja';
    const htmlTexto = texto.split('\n').map(l => {
      if (l.startsWith('GANANCIA REAL')) return `<span class="${colorClass}">${l}</span>`;
      return l;
    }).join('\n');

    return `
      <div class="cierre-caja-card">
        <div class="cierre-caja-header">
          <div class="cierre-caja-fecha">📅 Cierre del ${c.fecha}</div>
          <button class="btn-copy" data-texto="${encodeURIComponent(texto)}">📋 Copiar</button>
        </div>
        <pre class="cierre-caja-body">${htmlTexto}</pre>
      </div>`;
  }).join('');

  container.querySelectorAll('.btn-copy').forEach(btn => {
    btn.addEventListener('click', () => {
      const texto = decodeURIComponent(btn.dataset.texto);
      navigator.clipboard.writeText(texto).then(() => toast('Cierre copiado al portapapeles ✓')).catch(() => toast('No se pudo copiar', 'error'));
    });
  });
}

// Exportar CSV
$('btn-export-csv').addEventListener('click', () => {
  if (!historial.length) { toast('Sin datos para exportar', 'error'); return; }
  const lines = ['Fecha,Empleada,Servicio,Cantidad,Total Venta,Negocio,Empleada,Pago,Gastos Día,Ganancia Real'];
  historial.forEach(c => {
    c.items.forEach(i => {
      lines.push([c.fecha, i.empNombre, i.srvNombre, i.qty, i.total, i.negocio, i.empPago, c.tipoPago, c.totalGastos || 0, c.gananciaReal != null ? c.gananciaReal : c.totalNegocio].join(','));
    });
  });
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'miraditas_historial.csv'; a.click();
  URL.revokeObjectURL(url);
  toast('CSV descargado ✓');
});

// ── DASHBOARD ─────────────────────────────────────────────────────
function renderDashboard() {
  if (!historial.length) {
    ['dash-total-vendido','dash-ganancia-bruta','dash-gastos-extra','dash-ganancia-real',
     'dash-efectivo','dash-transfer','dash-dias','dash-promedio'].forEach(id => $(id).textContent = '$0');
    $('ranking-empleadas').innerHTML = '<div class="empty-state">Sin datos aún</div>';
    $('ranking-servicios').innerHTML = '<div class="empty-state">Sin datos aún</div>';
    $('pago-bars').innerHTML = '<div class="empty-state">Sin datos aún</div>';
    $('chart-dash-dias').innerHTML = '';
    return;
  }

  const totalVend  = historial.reduce((s, c) => s + c.totalVendido, 0);
  const brutaAcum  = gananciaBrutaMes();
  const gastosAcum = gastosExtraMes();
  const realAcum   = gananciaRealMes();
  const efectivoT  = historial.reduce((s, c) => s + (c.efectivo  || 0), 0);
  const transferT  = historial.reduce((s, c) => s + (c.transfer  || 0), 0);
  const dias       = historial.length;
  const promedio   = dias > 0 ? totalVend / dias : 0;

  $('dash-total-vendido').textContent  = fmt(totalVend);
  $('dash-ganancia-bruta').textContent = fmt(brutaAcum);
  $('dash-gastos-extra').textContent   = fmt(gastosAcum);
  $('dash-ganancia-real').textContent  = fmt(realAcum);
  $('dash-efectivo').textContent       = fmt(efectivoT);
  $('dash-transfer').textContent       = fmt(transferT);
  $('dash-dias').textContent           = dias;
  $('dash-promedio').textContent       = fmt(promedio);

  // Ranking empleadas
  const porEmp = {};
  historial.forEach(c => {
    c.items.forEach(i => {
      if (!porEmp[i.empNombre]) porEmp[i.empNombre] = { ventas: 0, negocio: 0, servicios: 0 };
      porEmp[i.empNombre].ventas   += i.total;
      porEmp[i.empNombre].negocio  += i.negocio;
      porEmp[i.empNombre].servicios += i.qty;
    });
  });
  const rankEmp = Object.entries(porEmp).sort((a, b) => b[1].ventas - a[1].ventas);
  const medallas = ['gold', 'silver', 'bronze'];
  $('ranking-empleadas').innerHTML = rankEmp.map(([nombre, d], i) => `
    <div class="ranking-item">
      <div class="ranking-pos ${medallas[i] || ''}">${i + 1}</div>
      <div class="ranking-info">
        <div class="ranking-name">${nombre}</div>
        <div class="ranking-sub">${d.servicios} servicios · Negocio: ${fmt(d.negocio)}</div>
      </div>
      <div class="ranking-val">${fmt(d.ventas)}</div>
    </div>`).join('');

  // Ranking servicios
  const porSrv = {};
  historial.forEach(c => {
    c.items.forEach(i => {
      if (!porSrv[i.srvNombre]) porSrv[i.srvNombre] = { qty: 0, total: 0 };
      porSrv[i.srvNombre].qty   += i.qty;
      porSrv[i.srvNombre].total += i.total;
    });
  });
  const rankSrv = Object.entries(porSrv).sort((a, b) => b[1].qty - a[1].qty).slice(0, 8);
  $('ranking-servicios').innerHTML = rankSrv.map(([nombre, d], i) => `
    <div class="ranking-item">
      <div class="ranking-pos ${medallas[i] || ''}">${i + 1}</div>
      <div class="ranking-info">
        <div class="ranking-name">${nombre}</div>
        <div class="ranking-sub">Vendido: ${fmt(d.total)}</div>
      </div>
      <div class="ranking-val">×${d.qty}</div>
    </div>`).join('');

  // Barras métodos de pago
  const maxPago = Math.max(efectivoT, transferT, 1);
  const mixtoT  = historial.filter(c => c.tipoPago === 'mixto').reduce((s, c) => s + c.totalVendido, 0);
  $('pago-bars').innerHTML = [
    { label: '💵 Efectivo',       val: efectivoT, cls: 'efectivo' },
    { label: '📲 Transferencia',  val: transferT, cls: 'transfer' },
    { label: '🔀 Mixto',          val: mixtoT,    cls: 'mixto'    },
  ].map(p => `
    <div class="pago-bar-item">
      <span class="pago-bar-label">${p.label}</span>
      <div class="pago-bar-track">
        <div class="pago-bar-fill ${p.cls}" style="width:${Math.round((p.val / (totalVend || 1)) * 100)}%"></div>
      </div>
      <span class="pago-bar-val">${fmt(p.val)}</span>
    </div>`).join('');

  // Chart días
  renderChartGeneric('chart-dash-dias', historial.map(c => ({ label: c.fecha.split('/').slice(0,2).join('/'), val: c.totalVendido })));
}

// ── CHART ─────────────────────────────────────────────────────────
function renderChartDias() {
  const entries = historial.map(c => ({ label: c.fecha.split('/').slice(0,2).join('/'), val: c.totalNegocio }));
  renderChartGeneric('chart-dias', entries);
}

function renderChartGeneric(containerId, entries) {
  const container = $(containerId);
  if (!container) return;
  if (!entries.length) { container.innerHTML = '<div class="empty-state">Sin datos aún</div>'; return; }
  const maxVal = Math.max(...entries.map(e => e.val), 1);
  container.innerHTML = entries.map(e => {
    const h = Math.max((e.val / maxVal) * 100, 2);
    return `<div class="chart-bar-wrap"><div class="chart-bar" style="height:${h}px" data-tip="${fmt(e.val)}"></div><span class="chart-day-label">${e.label}</span></div>`;
  }).join('');
}

// ── EMPLEADAS ─────────────────────────────────────────────────────
function renderEmpleadas() {
  const grid = $('emp-grid');
  const avatars = { lashista: '✿', manicurista: '💅', estilista: '✂' };
  const tipos   = { lashista: 'Lashista', manicurista: 'Manicurista', estilista: 'Estilista' };
  grid.innerHTML = empleadas.map(e => `
    <div class="emp-card">
      <div class="emp-avatar">${avatars[e.tipo] || '✿'}</div>
      <div class="emp-name">${e.nombre}</div>
      <div class="emp-tipo">${tipos[e.tipo] || e.tipo}</div>
      <span class="emp-commission">${Math.round(e.pctNegocio * 100)}% negocio · ${Math.round((1 - e.pctNegocio) * 100)}% empleada</span>
      <div class="emp-actions">
        <button class="emp-btn" data-edit="${e.id}">✏ Editar</button>
        <button class="emp-btn danger" data-del="${e.id}">✕ Eliminar</button>
      </div>
    </div>`).join('');
  grid.querySelectorAll('[data-edit]').forEach(btn => btn.addEventListener('click', () => openModalEmp(btn.dataset.edit)));
  grid.querySelectorAll('[data-del]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirm('¿Eliminar esta empleada?')) {
        empleadas = empleadas.filter(e => e.id !== btn.dataset.del);
        save('ms_empleadas', empleadas);
        renderEmpleadas(); populateSelectores(); toast('Empleada eliminada');
      }
    });
  });
}

function openModalEmp(id = null) {
  editEmpId = id;
  if (id) {
    const e = empleadas.find(e => e.id === id);
    $('inp-emp-nombre').value = e.nombre;
    $('inp-emp-tipo').value   = e.tipo;
    $('inp-emp-pct').value    = Math.round(e.pctNegocio * 100);
    $('campo-pct-manual').style.display = e.tipo === 'estilista' ? 'flex' : 'none';
  } else {
    $('inp-emp-nombre').value = '';
    $('inp-emp-tipo').value   = 'lashista';
    $('inp-emp-pct').value    = 60;
    $('campo-pct-manual').style.display = 'none';
  }
  $('modal-emp').style.display = 'flex';
}

$('btn-nueva-emp').addEventListener('click', () => openModalEmp());
$('btn-cancel-emp').addEventListener('click', () => { $('modal-emp').style.display = 'none'; });
$('inp-emp-tipo').addEventListener('change', () => {
  $('campo-pct-manual').style.display = $('inp-emp-tipo').value === 'estilista' ? 'flex' : 'none';
});
$('btn-save-emp').addEventListener('click', () => {
  const nombre = $('inp-emp-nombre').value.trim();
  const tipo   = $('inp-emp-tipo').value;
  if (!nombre) { toast('Escribe el nombre', 'error'); return; }
  let pctNegocio = tipo === 'lashista' ? 0.6 : tipo === 'manicurista' ? 0.5 : parseFloat($('inp-emp-pct').value) / 100;
  if (editEmpId) { const idx = empleadas.findIndex(e => e.id === editEmpId); empleadas[idx] = { ...empleadas[idx], nombre, tipo, pctNegocio }; }
  else empleadas.push({ id: uid(), nombre, tipo, pctNegocio });
  save('ms_empleadas', empleadas);
  $('modal-emp').style.display = 'none';
  renderEmpleadas(); populateSelectores();
  toast(editEmpId ? 'Empleada actualizada ✓' : 'Empleada agregada ✓');
  editEmpId = null;
});

// ── SERVICIOS ─────────────────────────────────────────────────────
function renderServicios() {
  const container = $('servicios-grupos');
  const catLabels = { manicure: 'Manicure / Pies', lashes: 'Pestañas / Cejas', otro: 'Otros' };
  const grupos = {};
  servicios.forEach(s => { if (!grupos[s.cat]) grupos[s.cat] = []; grupos[s.cat].push(s); });
  container.innerHTML = Object.entries(grupos).map(([cat, srvs]) => `
    <div class="card">
      <div class="srv-grupo-title">${catLabels[cat] || cat}</div>
      <div class="srv-grid">
        ${srvs.map(s => `
          <div class="srv-card">
            <div class="srv-name">${s.nombre}</div>
            <div class="srv-price">${fmt(s.precio)}</div>
            <div class="srv-split">${Math.round(s.pctNegocio*100)}% negocio · ${Math.round((1-s.pctNegocio)*100)}% empleada</div>
            <div class="srv-actions">
              <button class="srv-btn" data-edit="${s.id}">✏ Editar</button>
              <button class="srv-btn danger" data-del="${s.id}">✕</button>
            </div>
          </div>`).join('')}
      </div>
    </div>`).join('');
  container.querySelectorAll('[data-edit]').forEach(btn => btn.addEventListener('click', () => openModalSrv(btn.dataset.edit)));
  container.querySelectorAll('[data-del]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirm('¿Eliminar este servicio?')) {
        servicios = servicios.filter(s => s.id !== btn.dataset.del);
        save('ms_servicios', servicios); renderServicios(); populateSelectores(); toast('Servicio eliminado');
      }
    });
  });
}

function openModalSrv(id = null) {
  editSrvId = id;
  $('modal-srv-title').textContent = id ? 'Editar Servicio' : 'Nuevo Servicio';
  if (id) {
    const s = servicios.find(s => s.id === id);
    $('inp-srv-nombre').value = s.nombre;
    $('inp-srv-precio').value = s.precio;
    $('inp-srv-cat').value    = s.cat;
    const pct = s.pctNegocio;
    if (pct === 0.6) $('inp-srv-pct').value = '0.6';
    else if (pct === 0.5) $('inp-srv-pct').value = '0.5';
    else { $('inp-srv-pct').value = 'custom'; $('inp-srv-pct-custom').value = Math.round(pct*100); }
    $('campo-srv-custom').style.display = (pct !== 0.6 && pct !== 0.5) ? 'flex' : 'none';
  } else {
    $('inp-srv-nombre').value = ''; $('inp-srv-precio').value = '';
    $('inp-srv-cat').value = 'manicure'; $('inp-srv-pct').value = '0.5';
    $('campo-srv-custom').style.display = 'none';
  }
  $('modal-srv').style.display = 'flex';
}

$('btn-nuevo-srv').addEventListener('click', () => openModalSrv());
$('btn-cancel-srv').addEventListener('click', () => { $('modal-srv').style.display = 'none'; });
$('inp-srv-pct').addEventListener('change', () => { $('campo-srv-custom').style.display = $('inp-srv-pct').value === 'custom' ? 'flex' : 'none'; });
$('btn-save-srv').addEventListener('click', () => {
  const nombre = $('inp-srv-nombre').value.trim();
  const precio = parseFloat($('inp-srv-precio').value);
  const cat    = $('inp-srv-cat').value;
  if (!nombre) { toast('Escribe el nombre', 'error'); return; }
  if (!precio || precio <= 0) { toast('Precio inválido', 'error'); return; }
  const pctRaw = $('inp-srv-pct').value;
  const pctNegocio = pctRaw === 'custom' ? parseFloat($('inp-srv-pct-custom').value) / 100 : parseFloat(pctRaw);
  if (editSrvId) { const idx = servicios.findIndex(s => s.id === editSrvId); servicios[idx] = { ...servicios[idx], nombre, precio, cat, pctNegocio }; }
  else servicios.push({ id: uid(), nombre, precio, cat, pctNegocio });
  save('ms_servicios', servicios);
  $('modal-srv').style.display = 'none';
  renderServicios(); populateSelectores();
  toast(editSrvId ? 'Servicio actualizado ✓' : 'Servicio agregado ✓');
  editSrvId = null;
});

// ── COSTOS FIJOS ──────────────────────────────────────────────────
function renderCostos() {
  const tbody = $('costos-body');
  tbody.innerHTML = costos.map(c => `
    <tr>
      <td>${c.concepto}</td>
      <td>${fmt(c.valor)}</td>
      <td style="text-align:right">
        <button class="costo-edit" data-id="${c.id}">✏</button>
        <button class="costo-del"  data-id="${c.id}">✕</button>
      </td>
    </tr>`).join('');
  tbody.querySelectorAll('.costo-edit').forEach(btn => btn.addEventListener('click', () => openModalCosto(btn.dataset.id)));
  tbody.querySelectorAll('.costo-del').forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirm('¿Eliminar este costo?')) {
        costos = costos.filter(c => c.id !== btn.dataset.id);
        save('ms_costos', costos); renderCostos(); setEquilibrioUI(); toast('Costo eliminado');
      }
    });
  });
  $('costos-total-val').textContent = fmt(totalCostos());
}

function openModalCosto(id = null) {
  editCostoId = id;
  if (id) { const c = costos.find(c => c.id === id); $('inp-costo-nombre').value = c.concepto; $('inp-costo-valor').value = c.valor; }
  else { $('inp-costo-nombre').value = ''; $('inp-costo-valor').value = ''; }
  $('modal-costo').style.display = 'flex';
}

$('btn-nuevo-costo').addEventListener('click', () => openModalCosto());
$('btn-cancel-costo').addEventListener('click', () => { $('modal-costo').style.display = 'none'; });
$('btn-save-costo').addEventListener('click', () => {
  const concepto = $('inp-costo-nombre').value.trim();
  const valor    = parseFloat($('inp-costo-valor').value);
  if (!concepto) { toast('Escribe el concepto', 'error'); return; }
  if (!valor || valor <= 0) { toast('Valor inválido', 'error'); return; }
  if (editCostoId) { const idx = costos.findIndex(c => c.id === editCostoId); costos[idx] = { ...costos[idx], concepto, valor }; }
  else costos.push({ id: uid(), concepto, valor });
  save('ms_costos', costos);
  $('modal-costo').style.display = 'none';
  renderCostos(); setEquilibrioUI();
  toast(editCostoId ? 'Costo actualizado ✓' : 'Costo agregado ✓');
  editCostoId = null;
});

// Cerrar modales con click afuera
['modal-emp','modal-srv','modal-costo','modal-gasto'].forEach(id => {
  $(id).addEventListener('click', e => { if (e.target === $(id)) $(id).style.display = 'none'; });
});

// ── INIT ─────────────────────────────────────────────────────────
populateSelectores();
renderDiaActual();
setEquilibrioUI();
renderAlertas();
