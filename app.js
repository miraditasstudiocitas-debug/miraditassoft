/* =============================================
   MIRADITAS STUDIO — app.js
   ============================================= */

// ── ESTADO INICIAL ──────────────────────────────────────────────
const DEFAULT_COSTOS = [
  { id: 'c1', concepto: 'Arriendo',   valor: 3500000 },
  { id: 'c2', concepto: 'Servicios',  valor: 500000  },
  { id: 'c3', concepto: 'Cafetería',  valor: 50000   },
  { id: 'c4', concepto: 'Insumos',    valor: 250000  },
];

const DEFAULT_SERVICIOS = [
  // Manicure / Pies  (50/50 → negocio 0.5)
  { id: 's1',  nombre: 'Manicure Tradicional',    precio: 18000,  pctNegocio: 0.5, cat: 'manicure' },
  { id: 's2',  nombre: 'Semipermanente',           precio: 40000,  pctNegocio: 0.5, cat: 'manicure' },
  { id: 's3',  nombre: 'Semipermanente + Rubber',  precio: 58000,  pctNegocio: 0.5, cat: 'manicure' },
  { id: 's4',  nombre: 'Uñas Poligel',             precio: 120000, pctNegocio: 0.5, cat: 'manicure' },
  { id: 's5',  nombre: 'Uñas Acrílicas',           precio: 120000, pctNegocio: 0.5, cat: 'manicure' },
  { id: 's6',  nombre: 'Press On',                 precio: 95000,  pctNegocio: 0.5, cat: 'manicure' },
  { id: 's7',  nombre: 'Pies Tradicionales',       precio: 50000,  pctNegocio: 0.5, cat: 'manicure' },
  { id: 's8',  nombre: 'Pies Semipermanente',      precio: 50000,  pctNegocio: 0.5, cat: 'manicure' },
  { id: 's9',  nombre: 'Limpieza Pies',            precio: 20000,  pctNegocio: 0.5, cat: 'manicure' },
  { id: 's10', nombre: 'Reparación Uña',           precio: 10000,  pctNegocio: 0.5, cat: 'manicure' },
  { id: 's11', nombre: 'Retiro Esmalte',           precio: 20000,  pctNegocio: 0.5, cat: 'manicure' },
  // Pestañas / Cejas  (60/40 → negocio 0.6)
  { id: 's12', nombre: 'Depilación Cera',          precio: 10000,  pctNegocio: 0.6, cat: 'lashes' },
  { id: 's13', nombre: 'Diseño + Depilación',      precio: 20000,  pctNegocio: 0.6, cat: 'lashes' },
  { id: 's14', nombre: 'Diseño + Henna',           precio: 30000,  pctNegocio: 0.6, cat: 'lashes' },
  { id: 's15', nombre: 'Depilación Bozo',          precio: 8000,   pctNegocio: 0.6, cat: 'lashes' },
  { id: 's16', nombre: 'Laminado Cejas',           precio: 85000,  pctNegocio: 0.6, cat: 'lashes' },
  { id: 's17', nombre: 'Pestañas Natural',         precio: 130000, pctNegocio: 0.6, cat: 'lashes' },
  { id: 's18', nombre: 'Pestañas Semi Natural',    precio: 150000, pctNegocio: 0.6, cat: 'lashes' },
  { id: 's19', nombre: 'Pestañas Pestañina',       precio: 160000, pctNegocio: 0.6, cat: 'lashes' },
  { id: 's20', nombre: 'Pestañas Ruso',            precio: 170000, pctNegocio: 0.6, cat: 'lashes' },
  { id: 's21', nombre: 'Retoque',                  precio: 50000,  pctNegocio: 0.6, cat: 'lashes' },
  { id: 's22', nombre: 'Lifting',                  precio: 95000,  pctNegocio: 0.6, cat: 'lashes' },
];

const DEFAULT_EMPLEADAS = [
  { id: 'e1', nombre: 'Lashista 1',    tipo: 'lashista',    pctNegocio: 0.6 },
  { id: 'e2', nombre: 'Lashista 2',    tipo: 'lashista',    pctNegocio: 0.6 },
  { id: 'e3', nombre: 'Manicurista 1', tipo: 'manicurista', pctNegocio: 0.5 },
  { id: 'e4', nombre: 'Manicurista 2', tipo: 'manicurista', pctNegocio: 0.5 },
];

// ── CARGA / PERSISTENCIA ─────────────────────────────────────────
function load(key, def) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def; }
  catch { return def; }
}
function save(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

let costos    = load('ms_costos',    DEFAULT_COSTOS);
let servicios = load('ms_servicios', DEFAULT_SERVICIOS);
let empleadas = load('ms_empleadas', DEFAULT_EMPLEADAS);
let historial = load('ms_historial', []);  // array de cierres
let diaActual = load('ms_dia',       []);  // items del día en curso
let editEmpId = null;
let editSrvId = null;
let editCostoId = null;

// ── UTILIDADES ───────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const fmt = n => '$' + Math.round(n).toLocaleString('es-CO');
const uid = () => '_' + Math.random().toString(36).slice(2, 9);

function toast(msg, type = 'success') {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

function totalCostos() { return costos.reduce((s, c) => s + c.valor, 0); }

function gananciaMes() {
  return historial.reduce((s, c) => s + c.totalNegocio, 0);
}

function setEquilibrioUI() {
  const meta  = totalCostos();
  const acum  = gananciaMes();
  const pct   = Math.min((acum / meta) * 100, 100);
  const falta = Math.max(meta - acum, 0);

  // mini bar (cierre tab)
  const fill = $('eq-bar-fill');
  if (fill) {
    fill.style.width = pct + '%';
    fill.classList.toggle('over', acum >= meta);
    $('eq-pct-txt').textContent = pct.toFixed(1) + '%';
    $('eq-acum').textContent    = fmt(acum);
    $('eq-meta').textContent    = fmt(meta);
    $('eq-falta').textContent   = fmt(falta);
  }

  // full equilibrio tab
  if ($('eq-costos')) {
    $('eq-costos').textContent   = fmt(meta);
    $('eq-ganancia').textContent = fmt(acum);
    const util = acum - meta;
    $('eq-utilidad').textContent = util >= 0 ? fmt(util) : '-' + fmt(Math.abs(util));
    $('eq-utilidad').style.color = util >= 0 ? 'var(--green)' : 'var(--rose)';

    // Meta diaria
    const hoy = new Date();
    const diasMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).getDate();
    const diaNum  = hoy.getDate();
    const diasRest = diasMes - diaNum + 1;
    if (diasRest > 0 && acum < meta) {
      $('eq-meta-diaria').textContent = fmt(falta / diasRest) + '/día';
    } else if (acum >= meta) {
      $('eq-meta-diaria').textContent = '✓ Meta alcanzada';
    } else {
      $('eq-meta-diaria').textContent = '—';
    }

    const fillBig = $('eq-bar-big');
    if (fillBig) {
      fillBig.style.width = pct + '%';
      fillBig.classList.toggle('over', acum >= meta);
      $('eq-bar-label').textContent = pct.toFixed(0) + '%';
    }
    $('eq-status').textContent = acum >= meta ? '✓ Punto de equilibrio alcanzado este mes 🎉' : `Faltan ${fmt(falta)} para cubrir costos fijos`;
    $('eq-status').style.color = acum >= meta ? 'var(--green)' : 'var(--text-muted)';

    renderChartDias();
  }
}

// ── TABS ─────────────────────────────────────────────────────────
document.querySelectorAll('.tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(s => s.classList.remove('active'));
    btn.classList.add('active');
    $('tab-' + btn.dataset.tab).classList.add('active');

    if (btn.dataset.tab === 'equilibrio')  setEquilibrioUI();
    if (btn.dataset.tab === 'empleadas')   renderEmpleadas();
    if (btn.dataset.tab === 'servicios')   renderServicios();
    if (btn.dataset.tab === 'costos')      renderCostos();
    if (btn.dataset.tab === 'historial')   renderHistorial();
  });
});

// ── FECHA ────────────────────────────────────────────────────────
function setFecha() {
  const d = new Date();
  $('fecha-hoy').textContent = d.toLocaleDateString('es-CO', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
}
setFecha();

// ── CIERRE DEL DÍA ───────────────────────────────────────────────
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
  servicios.forEach(s => {
    if (!grupos[s.cat]) grupos[s.cat] = [];
    grupos[s.cat].push(s);
  });

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
}

function updatePreview() {
  const srvId = $('sel-servicio').value;
  const qty   = parseInt($('inp-cantidad').value) || 1;
  const box   = $('preview-servicio');

  if (!srvId) { box.style.display = 'none'; return; }
  const srv = servicios.find(s => s.id === srvId);
  if (!srv) { box.style.display = 'none'; return; }

  const total   = srv.precio * qty;
  const negocio = total * srv.pctNegocio;
  const empPago = total * (1 - srv.pctNegocio);

  $('prev-precio').textContent = fmt(srv.precio);
  $('prev-total').textContent  = fmt(total);
  $('prev-spa').textContent    = fmt(negocio);
  $('prev-emp').textContent    = fmt(empPago);
  box.style.display = 'block';
}

$('sel-servicio').addEventListener('change', updatePreview);
$('inp-cantidad').addEventListener('input',  updatePreview);

$('btn-agregar').addEventListener('click', () => {
  const empId = $('sel-empleada').value;
  const srvId = $('sel-servicio').value;
  const qty   = parseInt($('inp-cantidad').value) || 1;

  if (!empId) { toast('Selecciona una empleada', 'error'); return; }
  if (!srvId) { toast('Selecciona un servicio',  'error'); return; }

  const emp = empleadas.find(e => e.id === empId);
  const srv = servicios.find(s => s.id === srvId);
  if (!emp || !srv) return;

  const total   = srv.precio * qty;
  const negocio = total * srv.pctNegocio;
  const empPago = total * (1 - srv.pctNegocio);

  diaActual.push({
    id: uid(), empId, empNombre: emp.nombre,
    srvId, srvNombre: srv.nombre, qty,
    precio: srv.precio, total, negocio, empPago
  });
  save('ms_dia', diaActual);

  $('sel-empleada').value = '';
  $('sel-servicio').value = '';
  $('inp-cantidad').value = 1;
  $('preview-servicio').style.display = 'none';
  renderDiaActual();
  setEquilibrioUI();
  toast('Servicio agregado ✓');
});

function renderDiaActual() {
  const container = $('day-items');
  const totales   = $('day-totals');
  const payment   = $('payment-section');
  const btnCerrar = $('btn-cerrar');

  if (!diaActual.length) {
    container.innerHTML = '<div class="empty-state">No hay servicios registrados aún</div>';
    totales.style.display   = 'none';
    payment.style.display   = 'none';
    btnCerrar.style.display = 'none';
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
      <button class="day-item-del" data-id="${item.id}" title="Eliminar">✕</button>
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

  const totalVendido  = diaActual.reduce((s, i) => s + i.total, 0);
  const totalNegocio  = diaActual.reduce((s, i) => s + i.negocio, 0);
  const totalEmpleada = diaActual.reduce((s, i) => s + i.empPago, 0);

  $('tot-vendido').textContent   = fmt(totalVendido);
  $('tot-negocio').textContent   = fmt(totalNegocio);
  $('tot-empleadas').textContent = fmt(totalEmpleada);

  totales.style.display   = 'block';
  payment.style.display   = 'block';
  btnCerrar.style.display = 'block';
}

$('btn-cerrar').addEventListener('click', () => {
  if (!diaActual.length) { toast('No hay servicios para cerrar', 'error'); return; }

  const efectivo  = parseFloat($('inp-efectivo').value) || 0;
  const transfer  = parseFloat($('inp-transfer').value) || 0;
  const totalVend = diaActual.reduce((s, i) => s + i.total, 0);
  const totalNeg  = diaActual.reduce((s, i) => s + i.negocio, 0);
  const totalEmp  = diaActual.reduce((s, i) => s + i.empPago, 0);

  let tipoPago = 'mixto';
  if (efectivo > 0 && transfer === 0) tipoPago = 'efectivo';
  else if (transfer > 0 && efectivo === 0) tipoPago = 'transferencia';

  const cierre = {
    id: uid(),
    fecha: new Date().toLocaleDateString('es-CO'),
    items: [...diaActual],
    totalVendido: totalVend,
    totalNegocio: totalNeg,
    totalEmpleadas: totalEmp,
    efectivo, transfer, tipoPago
  };

  historial.push(cierre);
  save('ms_historial', historial);

  diaActual = [];
  save('ms_dia', diaActual);

  $('inp-efectivo').value = 0;
  $('inp-transfer').value = 0;

  renderDiaActual();
  setEquilibrioUI();
  toast('Día cerrado exitosamente 🌸');
});

// ── HISTORIAL ────────────────────────────────────────────────────
function renderHistorial() {
  const tbody = $('hist-body');
  if (!historial.length) {
    tbody.innerHTML = '<tr><td colspan="8" class="empty-state">Sin registros aún</td></tr>';
    return;
  }

  const rows = [];
  historial.forEach(cierre => {
    cierre.items.forEach(item => {
      const badge = cierre.tipoPago === 'efectivo'
        ? '<span class="badge badge-efectivo">Efectivo</span>'
        : cierre.tipoPago === 'transferencia'
          ? '<span class="badge badge-transfer">Transferencia</span>'
          : '<span class="badge badge-mixto">Mixto</span>';

      rows.push(`
        <tr>
          <td>${cierre.fecha}</td>
          <td>${item.empNombre}</td>
          <td>${item.srvNombre}</td>
          <td>${item.qty}</td>
          <td>${fmt(item.total)}</td>
          <td>${fmt(item.negocio)}</td>
          <td>${fmt(item.empPago)}</td>
          <td>${badge}</td>
        </tr>
      `);
    });
  });
  tbody.innerHTML = rows.join('');
}

$('btn-export-csv').addEventListener('click', () => {
  if (!historial.length) { toast('Sin datos para exportar', 'error'); return; }
  const lines = ['Fecha,Empleada,Servicio,Cantidad,Total Venta,Negocio,Empleada,Pago'];
  historial.forEach(c => {
    c.items.forEach(i => {
      lines.push([c.fecha, i.empNombre, i.srvNombre, i.qty, i.total, i.negocio, i.empPago, c.tipoPago].join(','));
    });
  });
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'miraditas_historial.csv'; a.click();
  URL.revokeObjectURL(url);
  toast('CSV descargado ✓');
});

// ── CHART DÍAS ───────────────────────────────────────────────────
function renderChartDias() {
  const container = $('chart-dias');
  if (!container) return;

  const byDay = {};
  historial.forEach(c => { byDay[c.fecha] = (byDay[c.fecha] || 0) + c.totalNegocio; });

  const entries = Object.entries(byDay).slice(-30);
  if (!entries.length) { container.innerHTML = '<div class="empty-state">Sin datos aún</div>'; return; }

  const maxVal = Math.max(...entries.map(([,v]) => v), 1);

  container.innerHTML = entries.map(([fecha, val]) => {
    const h = Math.max((val / maxVal) * 100, 2);
    const label = fecha.split('/').slice(0,2).join('/');
    return `
      <div class="chart-bar-wrap">
        <div class="chart-bar" style="height:${h}px" data-tip="${fmt(val)}"></div>
        <span class="chart-day-label">${label}</span>
      </div>`;
  }).join('');
}

// ── EMPLEADAS ────────────────────────────────────────────────────
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
    </div>
  `).join('');

  grid.querySelectorAll('[data-edit]').forEach(btn => {
    btn.addEventListener('click', () => openModalEmp(btn.dataset.edit));
  });
  grid.querySelectorAll('[data-del]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirm('¿Eliminar esta empleada?')) {
        empleadas = empleadas.filter(e => e.id !== btn.dataset.del);
        save('ms_empleadas', empleadas);
        renderEmpleadas();
        populateSelectores();
        toast('Empleada eliminada');
      }
    });
  });
}

function openModalEmp(id = null) {
  editEmpId = id;
  const modal = $('modal-emp');
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
  modal.style.display = 'flex';
}

$('btn-nueva-emp').addEventListener('click', () => openModalEmp());
$('btn-cancel-emp').addEventListener('click', () => { $('modal-emp').style.display = 'none'; });

$('inp-emp-tipo').addEventListener('change', () => {
  $('campo-pct-manual').style.display = $('inp-emp-tipo').value === 'estilista' ? 'flex' : 'none';
});

$('btn-save-emp').addEventListener('click', () => {
  const nombre = $('inp-emp-nombre').value.trim();
  const tipo   = $('inp-emp-tipo').value;
  if (!nombre) { toast('Escribe el nombre de la empleada', 'error'); return; }

  let pctNegocio;
  if (tipo === 'lashista')    pctNegocio = 0.6;
  else if (tipo === 'manicurista') pctNegocio = 0.5;
  else pctNegocio = parseFloat($('inp-emp-pct').value) / 100;

  if (editEmpId) {
    const idx = empleadas.findIndex(e => e.id === editEmpId);
    empleadas[idx] = { ...empleadas[idx], nombre, tipo, pctNegocio };
  } else {
    empleadas.push({ id: uid(), nombre, tipo, pctNegocio });
  }

  save('ms_empleadas', empleadas);
  $('modal-emp').style.display = 'none';
  renderEmpleadas();
  populateSelectores();
  toast(editEmpId ? 'Empleada actualizada ✓' : 'Empleada agregada ✓');
  editEmpId = null;
});

// ── SERVICIOS ────────────────────────────────────────────────────
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
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');

  container.querySelectorAll('[data-edit]').forEach(btn => {
    btn.addEventListener('click', () => openModalSrv(btn.dataset.edit));
  });
  container.querySelectorAll('[data-del]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirm('¿Eliminar este servicio?')) {
        servicios = servicios.filter(s => s.id !== btn.dataset.del);
        save('ms_servicios', servicios);
        renderServicios();
        populateSelectores();
        toast('Servicio eliminado');
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
    $('inp-srv-nombre').value = '';
    $('inp-srv-precio').value = '';
    $('inp-srv-cat').value    = 'manicure';
    $('inp-srv-pct').value    = '0.5';
    $('campo-srv-custom').style.display = 'none';
  }
  $('modal-srv').style.display = 'flex';
}

$('btn-nuevo-srv').addEventListener('click', () => openModalSrv());
$('btn-cancel-srv').addEventListener('click', () => { $('modal-srv').style.display = 'none'; });

$('inp-srv-pct').addEventListener('change', () => {
  $('campo-srv-custom').style.display = $('inp-srv-pct').value === 'custom' ? 'flex' : 'none';
});

$('btn-save-srv').addEventListener('click', () => {
  const nombre = $('inp-srv-nombre').value.trim();
  const precio = parseFloat($('inp-srv-precio').value);
  const cat    = $('inp-srv-cat').value;
  if (!nombre) { toast('Escribe el nombre del servicio', 'error'); return; }
  if (!precio || precio <= 0) { toast('Ingresa un precio válido', 'error'); return; }

  const pctRaw = $('inp-srv-pct').value;
  let pctNegocio;
  if (pctRaw === 'custom') pctNegocio = parseFloat($('inp-srv-pct-custom').value) / 100;
  else pctNegocio = parseFloat(pctRaw);

  if (editSrvId) {
    const idx = servicios.findIndex(s => s.id === editSrvId);
    servicios[idx] = { ...servicios[idx], nombre, precio, cat, pctNegocio };
  } else {
    servicios.push({ id: uid(), nombre, precio, cat, pctNegocio });
  }

  save('ms_servicios', servicios);
  $('modal-srv').style.display = 'none';
  renderServicios();
  populateSelectores();
  toast(editSrvId ? 'Servicio actualizado ✓' : 'Servicio agregado ✓');
  editSrvId = null;
});

// ── COSTOS FIJOS ─────────────────────────────────────────────────
function renderCostos() {
  const tbody = $('costos-body');
  tbody.innerHTML = costos.map(c => `
    <tr>
      <td>${c.concepto}</td>
      <td>${fmt(c.valor)}</td>
      <td style="text-align:right">
        <button class="costo-edit" data-id="${c.id}" title="Editar">✏</button>
        <button class="costo-del"  data-id="${c.id}" title="Eliminar">✕</button>
      </td>
    </tr>
  `).join('');

  tbody.querySelectorAll('.costo-edit').forEach(btn => {
    btn.addEventListener('click', () => openModalCosto(btn.dataset.id));
  });
  tbody.querySelectorAll('.costo-del').forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirm('¿Eliminar este costo?')) {
        costos = costos.filter(c => c.id !== btn.dataset.id);
        save('ms_costos', costos);
        renderCostos();
        setEquilibrioUI();
        toast('Costo eliminado');
      }
    });
  });

  $('costos-total-val').textContent = fmt(totalCostos());
}

function openModalCosto(id = null) {
  editCostoId = id;
  if (id) {
    const c = costos.find(c => c.id === id);
    $('inp-costo-nombre').value = c.concepto;
    $('inp-costo-valor').value  = c.valor;
  } else {
    $('inp-costo-nombre').value = '';
    $('inp-costo-valor').value  = '';
  }
  $('modal-costo').style.display = 'flex';
}

$('btn-nuevo-costo').addEventListener('click', () => openModalCosto());
$('btn-cancel-costo').addEventListener('click', () => { $('modal-costo').style.display = 'none'; });

$('btn-save-costo').addEventListener('click', () => {
  const concepto = $('inp-costo-nombre').value.trim();
  const valor    = parseFloat($('inp-costo-valor').value);
  if (!concepto) { toast('Escribe el concepto', 'error'); return; }
  if (!valor || valor <= 0) { toast('Ingresa un valor válido', 'error'); return; }

  if (editCostoId) {
    const idx = costos.findIndex(c => c.id === editCostoId);
    costos[idx] = { ...costos[idx], concepto, valor };
  } else {
    costos.push({ id: uid(), concepto, valor });
  }

  save('ms_costos', costos);
  $('modal-costo').style.display = 'none';
  renderCostos();
  setEquilibrioUI();
  toast(editCostoId ? 'Costo actualizado ✓' : 'Costo agregado ✓');
  editCostoId = null;
});

// Cerrar modales con click afuera
['modal-emp', 'modal-srv', 'modal-costo'].forEach(id => {
  $(id).addEventListener('click', e => { if (e.target === $(id)) $(id).style.display = 'none'; });
});

// ── INIT ─────────────────────────────────────────────────────────
populateSelectores();
renderDiaActual();
setEquilibrioUI();
