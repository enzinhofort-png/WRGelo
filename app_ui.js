const NOME_MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

function fmtDate(d) {
  if (!d) return '—';
  var p = d.split('-');
  return p[2]+'/'+p[1]+'/'+p[0];
}
function fmtR(v) {
  return 'R$ <span class="num">' + Number(v).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2}) + '</span>';
}
function today() { return new Date().toISOString().split('T')[0]; }

document.querySelectorAll('input[type=date]').forEach(function(i){ i.value = today(); });
var dateEl = document.getElementById('cur-date');
if(dateEl) dateEl.textContent = new Date().toLocaleDateString('pt-BR',{day:'2-digit',month:'short',year:'numeric'});


var CH = {};
function mkChart(id, cfg) {
  if (CH[id]) { CH[id].destroy(); }
  var ctx = document.getElementById(id);
  if (!ctx) return;
  CH[id] = new Chart(ctx, cfg);
}
var grd = 'rgba(255,255,255,0.05)';
var tkc = 'rgba(100,200,240,0.7)';
var gBase = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { labels: { color: tkc, font: { family: "'Space Grotesk',sans-serif", size: 10 }, boxWidth: 10 } }, tooltip: { backgroundColor: 'rgba(7,16,30,.95)', borderColor: 'rgba(0,180,230,.3)', borderWidth: 1 } },
  scales: { x: { grid: { color: grd }, ticks: { color: tkc, font: { family: "'Space Grotesk',sans-serif", size: 10 } } }, y: { grid: { color: grd }, ticks: { color: tkc, font: { family: "'Space Grotesk',sans-serif", size: 10 }, callback: function(v){ return 'R$'+v; } } } }
};

var CUR = 'dashboard';
function goTo(id) {
  document.querySelectorAll('.pg').forEach(function(p){ p.classList.remove('on'); });
  document.querySelectorAll('.bn').forEach(function(b){ b.classList.remove('on'); });
  document.getElementById('pg-'+id).classList.add('on');
  document.getElementById('bn-'+id).classList.add('on');
  window.scrollTo(0,0);
  CUR = id;
  if (id === 'dashboard') renderDash();
  if (id === 'pedidos')   renderPedidos('todos');
  if (id === 'estoque')   renderEstoque();
  if (id === 'caixa')     renderCaixa();
  if (id === 'sim')       { simRestore(); simUp(); renderProjChart(undefined, undefined); }
  if (id === 'admin')     renderAdmin();
}

// ── UI REFRESHE (DASHBOARD) ─────────────────────────
function renderDash() {
  var tots = {s3:0,s5:0,s10:0};
  PEDIDOS.filter(p => !p.is_historico).forEach(function(v){
    if (v.produto === '3kg') tots.s3 += v.quantidade;
    else if (v.produto === '5kg') tots.s5 += v.quantidade;
    else if (v.produto === '10kg') tots.s10 += v.quantidade;
  });
  
  var somaQtd = PEDIDOS.reduce((acc, curr) => acc + curr.quantidade, 0);

  var elSacos = document.getElementById('h-sacostot');
  if(elSacos) elSacos.innerHTML = `<span class="num">${somaQtd}</span>`;
  var elEstC = document.getElementById('h-estcount');
  if(elEstC) elEstC.innerHTML = `<span class="num">${(ESTOQUE.s3+ESTOQUE.s5+ESTOQUE.s10)}</span>`;
  var elPeds = document.getElementById('h-peds');
  if(elPeds) elPeds.innerHTML = `<span class="num">${PEDIDOS.length}</span>`;

  var currentMonthOrders = PEDIDOS.filter(p => !p.is_historico);
  var elMes = document.getElementById('h-mes');
  if(elMes) elMes.innerHTML = `<span class="num">${currentMonthOrders.length}</span>`;

  var totalEntradas = PEDIDOS.reduce((s,p) => s+p.total, 0);
  var elRecup = document.getElementById('d-recup');
  if(elRecup) elRecup.innerHTML = fmtR(Math.max(0, TOTAL_INV - totalEntradas));
  
  var elFat = document.getElementById('d-fat');
  if(elFat) elFat.innerHTML = fmtR(totalEntradas);
  var elEst = document.getElementById('d-estoque');
  if(elEst) elEst.innerHTML = `<span class="num">${(ESTOQUE.s3+ESTOQUE.s5+ESTOQUE.s10)}</span> un.`;

  var cliTot = {};
  PEDIDOS.forEach(function(v){ cliTot[v.cliente] = (cliTot[v.cliente]||0) + v.total; });
  var cliKeys = Object.keys(cliTot).sort((a,b) => cliTot[b] - cliTot[a]);
  
  var mesesComVenda = NOME_MESES.filter(m => PEDIDOS.some(p => p.mes === m));
  var mTotal = {};
  mesesComVenda.forEach(m => {
    mTotal[m] = PEDIDOS.filter(p => p.mes === m).reduce((s, p) => s + p.total, 0);
  });

  var chartLabels = mesesComVenda;
  var chartData = mesesComVenda.map(m => mTotal[m]);

  mkChart('ch-v', {
    type: 'bar',
    data: {
      labels: chartLabels,
      datasets: [{
        label: 'Vendas (R$)',
        data: chartData,
        backgroundColor: chartLabels.map((l, i) => i === chartLabels.length - 1 ? 'rgba(0,212,160,0.6)' : 'rgba(0,180,230,0.6)'),
        borderColor: chartLabels.map((l, i) => i === chartLabels.length - 1 ? 'rgba(0,212,160,1)' : 'rgba(0,180,230,1)'),
        borderWidth: 2, borderRadius: 6
      }]
    },
    options: { 
      responsive: true, maintainAspectRatio: false, 
      plugins: { legend: { display: false }, tooltip: gBase.plugins.tooltip }, 
      scales: gBase.scales,
      onClick: (e, elements) => {
        if (elements.length > 0) {
          const idx = elements[0].index;
          const lbl = e.chart.data.labels[idx];
          showChartModal('Mês de ' + lbl, PEDIDOS.filter(p => p.mes === lbl));
        }
      }
    }
  });

  const colors = ['var(--ice)', 'var(--mint)', 'var(--ice2)', 'var(--warn)', 'var(--red)', 'var(--mu)', '#9b59b6', '#34495e', '#16a085', '#27ae60'];

  mkChart('ch-cli', {
    type: 'doughnut',
    data: {
      labels: cliKeys,
      datasets: [{
        data: cliKeys.map(k => cliTot[k]),
        backgroundColor: colors.map(c => c.includes('var') ? (c === 'var(--red)' ? 'rgba(230,59,90,0.7)' : (c === 'var(--ice)' ? 'rgba(0,180,230,0.7)' : (c === 'var(--mint)' ? 'rgba(0,212,160,0.7)' : 'rgba(100,200,240,0.7)'))) : c),
        borderColor: '#06101E', borderWidth: 2
      }]
    },
    options: { 
      responsive: true, maintainAspectRatio: false, 
      plugins: { legend: { display: false }, tooltip: gBase.plugins.tooltip },
      onClick: (e, elements) => {
        if(elements.length > 0) {
           const idx = elements[0].index;
           const lbl = e.chart.data.labels[idx];
           showChartModal('Vendas para: ' + lbl, PEDIDOS.filter(p => p.cliente === lbl));
        }
      }
    }
  });

  // MIX DE PRODUTOS
  var prodTot = { '3kg': 0, '5kg': 0, '10kg': 0 };
  PEDIDOS.forEach(p => { if(prodTot[p.produto] !== undefined) prodTot[p.produto] += p.quantidade; });
  var prodKeys = Object.keys(prodTot);

  mkChart('ch-prod', {
    type: 'doughnut',
    data: {
      labels: prodKeys,
      datasets: [{
        data: prodKeys.map(k => prodTot[k]),
        backgroundColor: ['rgba(0,180,230,0.7)', 'rgba(0,212,160,0.7)', 'rgba(230,59,90,0.7)'],
        borderColor: '#06101E', borderWidth: 2
      }]
    },
    options: { 
      responsive: true, maintainAspectRatio: false, 
      plugins: { 
        legend: { position: 'right', labels: { color: tkc, font: { size: 10 } } }, 
        tooltip: {
          ...gBase.plugins.tooltip,
          callbacks: {
            label: function(ctx) {
              return ' ' + ctx.label + ': ' + ctx.raw + ' un';
            }
          }
        }
      },
      onClick: (e, elements) => {
        if(elements.length > 0) {
           const idx = elements[0].index;
           const lbl = e.chart.data.labels[idx];
           showChartModal('Vendas do Produto: ' + lbl, PEDIDOS.filter(p => p.produto === lbl));
        }
      }
    }
  });

  var maxV = Math.max.apply(null, Object.values(cliTot)) || 1;
  document.getElementById('d-progs').innerHTML = cliKeys.slice(0, 5).map(function(k, i){
    var pct = Math.round(cliTot[k]/maxV*100);
    var cl = colors[i % colors.length];
    return `<div class="prow" onclick="showChartModal('Detalhes do Cliente: ${k}', PEDIDOS.filter(p => p.cliente === '${k}'))" style="cursor:pointer">
      <div class="plbl"><span>${k}</span><span style="color:${cl}">${fmtR(cliTot[k])}</span></div>
      <div class="ptrack"><div class="pfil" style="width:${pct}%;background:${cl}"></div></div>
    </div>`;
  }).join('');

  var rec = PEDIDOS.slice(0, 8); 
  document.getElementById('d-recentes').innerHTML = rec.map(function(v){
    return `<tr><td>${fmtDate(v.data)}</td><td><span class="bx bx-ice">${v.cliente.split(' ')[0]}</span></td><td>${v.produto}</td><td style="color:var(--mint);font-weight:700">${fmtR(v.total)}</td></tr>`;
  }).join('');

  // Popular select do PDF com meses reais
  const pdfMesSel = document.getElementById('pdf-mes-sel');
  if(pdfMesSel) {
    pdfMesSel.innerHTML = `<option value="todos">Todos os Meses</option>` + mesesComVenda.map(m => `<option value="${m}">${m}</option>`).join('');
  }

}


// ── PEDIDOS ───────────────────────────
let editingPedId = null;
let PED_CUR_MONTH = 'todos';

function renderPedidos(f) {
  PED_CUR_MONTH = f;
  const prodFilter = document.getElementById('pf-prod') ? document.getElementById('pf-prod').value : 'todos';

  // Dinamizar Tabs de Meses
  const pedTabs = document.getElementById('ped-tabs');
  if(pedTabs) {
    const mesesComVenda = NOME_MESES.filter(m => PEDIDOS.some(p => p.mes === m));
    let tabsHtml = `<button class="tab ${f==='todos'?'on':''}" onclick="filtPed('todos',this)">Todos</button>`;
    mesesComVenda.forEach(m => {
      tabsHtml += `<button class="tab ${f===m?'on':''}" onclick="filtPed('${m}',this)">${m}</button>`;
    });
    tabsHtml += `<button class="tab ${f==='Novo'?'on':''}" onclick="filtPed('Novo',this)">Novos</button>`;
    pedTabs.innerHTML = tabsHtml;
  }

  // Popular select de clientes
  const cliSel = document.getElementById('np-c');
  if(cliSel) {
    cliSel.innerHTML = CLIENTES.map(c => `<option value="${c.nome}">${c.nome}</option>`).join('');
    if(CLIENTES.length === 0) cliSel.innerHTML = '<option value="">Cadastre um cliente primeiro</option>';
  }

  var rows = f === 'todos' ? PEDIDOS : f === 'Novo' ? PEDIDOS.filter(p=>!p.is_historico) : PEDIDOS.filter(p=> p.mes === f);
  
  if (prodFilter !== 'todos') {
    rows = rows.filter(p => p.produto === prodFilter);
  }

  document.getElementById('p-count').textContent = rows.length + ' reg.';
  var paid = rows.filter(p => p.total > 0);
  const totalFaturamento = rows.reduce((s,p) => s+p.total, 0);
  const elFatTotal = document.getElementById('p-fat-total');
  if(elFatTotal) elFatTotal.innerHTML = fmtR(totalFaturamento);

  document.getElementById('p-ticket').innerHTML = paid.length > 0 ? fmtR(totalFaturamento/paid.length) : '—';
  
  document.getElementById('p-tbody').innerHTML = rows.map(function(v){
    var btnDel = `<button class="btn btn-sm" style="background:rgba(230,59,90,.15);color:var(--red);border:none" onclick="delPed('${v.id}')" title="Excluir">✕</button>`;
    var btnEdit = `<button class="btn btn-sm" style="background:rgba(0,180,230,.15);color:var(--ice);border:none;margin-right:4px" onclick="editPed('${v.id}')" title="Editar">✎</button>`;
    
    // Permitir editar qualquer um, mas excluir apenas os novos (não históricos)
    var actions = btnEdit + (!v.is_historico ? btnDel : '');
    
    return `<tr><td>${fmtDate(v.data)}</td><td>${v.cliente}</td><td><span class="bx bx-ice">${v.produto}</span></td><td>${v.quantidade}</td><td style="color:${v.total>0?'var(--mint)':'var(--mu)'}">${fmtR(v.total)}</td><td><span class="bx bx-${v.mes==='Março'?'mint':'ice'}">${v.mes}</span></td><td>${actions}</td></tr>`;
  }).join('') || '<tr><td colspan="7" style="text-align:center;color:var(--mu);padding:20px">Nenhum registro.</td></tr>';
}

function filtPed(f, btn) {
  document.querySelectorAll('#ped-tabs .tab').forEach(b => b.classList.remove('on'));
  if(btn) btn.classList.add('on');
  renderPedidos(f);
}

function openNovoPed() {
  editingPedId = null;
  document.getElementById('ped-mo-title').textContent = '🛒 Novo Pedido';
  
  // Resetar campos
  document.getElementById('np-d').value = new Date().toISOString().split('T')[0];
  document.getElementById('np-q').value = 5;
  document.getElementById('np-u').value = 3.5;
  document.getElementById('np-t').value = 17.5;
  document.getElementById('np-p').value = '3kg';
  document.getElementById('np-pg').value = 'Dinheiro';
  
  openMo('mo-ped');
}

function editPed(id) {
  const p = PEDIDOS.find(x => x.id === id);
  if(!p) return;
  
  editingPedId = id;
  document.getElementById('ped-mo-title').textContent = '✎ Editar Pedido';
  
  document.getElementById('np-d').value = p.data;
  document.getElementById('np-c').value = p.cliente;
  document.getElementById('np-p').value = p.produto;
  document.getElementById('np-q').value = p.quantidade;
  document.getElementById('np-u').value = (p.total / p.quantidade).toFixed(2);
  document.getElementById('np-t').value = p.total.toFixed(2);
  document.getElementById('np-pg').value = p.pagamento || 'Dinheiro';
  
  openMo('mo-ped');
}

// ── API MUTATIONS ─────────────────────
async function delPed(id) {
  if(!confirm('Deletar este pedido?')) return;
  showLoading();
  await logAudit('pedidos', 'DELETE', { id });
  await sb.from('pedidos').delete().eq('id', id);
  await loadData();
}

function autoPrc() {
  var m = {'3kg':3.5,'5kg':5,'10kg':9.5};
  document.getElementById('np-u').value = m[document.getElementById('np-p').value] || 5;
  calcPed();
}

function calcPed() {
  var q = parseFloat(document.getElementById('np-q').value)||0;
  var u = parseFloat(document.getElementById('np-u').value)||0;
  document.getElementById('np-t').value = (q*u).toFixed(2);
}

async function savePed() {
  calcPed();
  var d = document.getElementById('np-d').value;
  var c = document.getElementById('np-c').value;
  if(!d || !c) return alert('Data e Cliente obrigatórios.');

  var mm = {'01':'Janeiro','02':'Fevereiro','03':'Março','04':'Abril','05':'Maio','06':'Junho','07':'Julho','08':'Agosto','09':'Setembro','10':'Outubro','11':'Novembro','12':'Dezembro'};
  var mes = mm[d.split('-')[1]] || 'Novo';
  
  var obj = {
    data: d, cliente: c,
    produto: document.getElementById('np-p').value,
    quantidade: parseFloat(document.getElementById('np-q').value)||0,
    valor_unitario: parseFloat(document.getElementById('np-u').value)||0,
    total: parseFloat(document.getElementById('np-t').value)||0,
    pagamento: document.getElementById('np-pg').value,
    mes: mes
  };
  
  showLoading();
  try {
    let res;
    if(editingPedId) {
      const original = PEDIDOS.find(x => x.id === editingPedId);
      obj.is_historico = original ? original.is_historico : false;
      res = await sb.from('pedidos').update(obj).eq('id', editingPedId);
      await logAudit('pedidos', 'UPDATE', { id: editingPedId, ...obj });
    } else {
      obj.is_historico = false;
      res = await sb.from('pedidos').insert([obj]);
      await logAudit('pedidos', 'INSERT', obj);
    }
    if(res.error) throw res.error;
    closeMo('mo-ped');
    await loadData();
    editingPedId = null;
  } catch(e) {
    alert('Erro ao salvar pedido.');
    console.error(e);
  }
  hideLoading();
}

// ── ESTOQUE ───────────────────────────
// Helper: retorna quantidade total vendida de um produto em um mês
function getQtd(produto, mes) {
  return PEDIDOS.filter(function(p){ return p.produto === produto && p.mes === mes; }).reduce(function(s,p){ return s + p.quantidade; }, 0);
}

// Máximos editáveis (default)
var EST_MAX = { s3: 500, s5: 400, s10: 200 };

function renderEstoque() {
  var itens = [ {k:'s3',n:'Sacos 3kg', max: EST_MAX.s3}, {k:'s5',n:'Sacos 5kg', max: EST_MAX.s5}, {k:'s10',n:'Sacos 10kg', max: EST_MAX.s10} ];
  document.getElementById('e-lista').innerHTML = itens.map(function(it){
    var q = ESTOQUE[it.k]||0;
    var pct = it.max > 0 ? Math.min(100, Math.round(q/it.max*100)) : 0;
    var cor = pct < 20 ? 'var(--red)' : pct < 40 ? 'var(--warn)' : 'var(--ice)';
    return '<div class="si"><div class="sico">🧊</div><div class="sinf"><div class="snm">'+it.n+'</div><div class="ssb">'+q+' / '+it.max+' un. ('+pct+'%)</div><div class="sbar"><div class="sfil" style="width:'+pct+'%;background:'+cor+'"></div></div></div><div class="sqt" style="color:'+cor+';cursor:pointer" onclick="promptEstoque(\''+it.k+'\', \''+it.n+'\')" title="Editar estoque e máximo">'+q+' ✎<br><span style="font-size:10px;color:var(--mu)">unid.</span></div></div>';
  }).join('');

  var mesesComVenda = NOME_MESES.filter(m => PEDIDOS.some(p => p.mes === m));
  var datasets = mesesComVenda.map((m, i) => {
    return {
      label: m,
      data: [getQtd('3kg',m), getQtd('5kg',m), getQtd('10kg',m)],
      backgroundColor: i % 2 === 0 ? 'rgba(0,180,230,.6)' : 'rgba(0,212,160,.6)',
      borderRadius: 4
    };
  });

  mkChart('ch-e', {
    type: 'bar',
    data: {
      labels: ['3kg','5kg','10kg'],
      datasets: datasets
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: tkc } }, tooltip: gBase.plugins.tooltip }, scales: gBase.scales }
  });

  var nm = {s3:'Sacos 3kg',s5:'Sacos 5kg',s10:'Sacos 10kg'};
  document.getElementById('e-count').textContent = EST_HIST.length + ' reg.';
  document.getElementById('e-tbody').innerHTML = EST_HIST.length === 0
    ? '<tr><td colspan="5" style="text-align:center;color:var(--mu);padding:16px;">Sem movimentos.</td></tr>'
    : EST_HIST.map(function(h){
        return '<tr><td>'+fmtDate(h.data)+'</td><td>'+nm[h.produto]+'</td><td><span class="bx bx-'+(h.tipo==='e'?'mint':h.tipo==='s'?'red':'warn')+'">'+(h.tipo==='e'?'Entrada':h.tipo==='s'?'Saída':'Ajuste')+'</span></td><td>'+h.quantidade+'</td><td style="color:var(--mu)">'+( h.observacao||'—')+'</td></tr>';
      }).join('');
}

async function saveEst() {
  var p = document.getElementById('ne-p').value;
  var t = document.getElementById('ne-t').value;
  var q = parseInt(document.getElementById('ne-q').value)||0;
  
  var nq = ESTOQUE[p] || 0;
  if (t === 'e') nq += q;
  else if (t === 's') nq = Math.max(0, nq-q);
  else nq = q;

  showLoading();
  await sb.from('estoque').upsert([{produto: p, quantidade: nq}], {onConflict: 'produto'});
  var movObj = { data: document.getElementById('ne-d').value, produto: p, tipo: t, quantidade: q, observacao: document.getElementById('ne-o').value };
  await sb.from('estoque_movimentos').insert([movObj]);
  await logAudit('estoque', 'UPDATE', { produto: p, final: nq, movimento: movObj });
  closeMo('mo-est');
  await loadData();
}

let _promptEstData = null;
function promptEstoque(k, nm) {
  _promptEstData = { k, nm };
  document.getElementById('pmt-desc').innerHTML = `<b>Quantidade</b> em estoque para ${nm}:`;
  document.getElementById('pmt-val').value = ESTOQUE[k] || 0;
  // Criar campo de máximo se não existir
  var maxEl = document.getElementById('pmt-max');
  if (!maxEl) {
    var container = document.getElementById('pmt-val').parentElement;
    var lbl = document.createElement('label');
    lbl.style.cssText = 'display:block;margin-top:10px;font-size:13px;color:var(--mu)';
    lbl.innerHTML = '<b>Estoque máximo suportado:</b>';
    var inp = document.createElement('input');
    inp.type = 'number'; inp.id = 'pmt-max'; inp.min = '0';
    inp.className = document.getElementById('pmt-val').className;
    inp.style.cssText = 'width:100%;margin-top:4px;';
    container.appendChild(lbl);
    container.appendChild(inp);
  }
  document.getElementById('pmt-max').value = EST_MAX[k] || 0;
  openMo('mo-custom-prompt');
}

function closeCustomPrompt() {
  closeMo('mo-custom-prompt');
}

function confirmCustomPrompt() {
  const vStr = document.getElementById('pmt-val').value;
  if (!vStr || vStr.trim() === '' || isNaN(parseInt(vStr))) return;
  const v = Math.max(0, parseInt(vStr));
  const k = _promptEstData.k;
  // Atualizar máximo se alterado
  var maxEl = document.getElementById('pmt-max');
  if (maxEl) {
    var newMax = Math.max(1, parseInt(maxEl.value) || EST_MAX[k]);
    EST_MAX[k] = newMax;
  }
  const diff = v - (ESTOQUE[k]||0);
  if (diff === 0) { closeCustomPrompt(); renderEstoque(); return; }
  
  closeCustomPrompt();
  showLoading();
  ESTOQUE[k] = v; // otimista
  sb.from('estoque').upsert([{produto: k, quantidade: v}], {onConflict: 'produto'}).then(() => {
    var movObj = { data: today(), produto: k, tipo: 'a', quantidade: Math.abs(diff), observacao: 'Ajustada pelo painel visual' };
    sb.from('estoque_movimentos').insert([movObj]).then(() => {
      logAudit('estoque', 'UPDATE_AJUSTE', { produto: k, final: v, diff: diff, max: EST_MAX[k] }).then(() => {
        loadData();
      });
    });
  });
}

// ── CAIXA / DESPESAS ──────────────────
function renderCaixa() {
  var totDesp = DESPESAS.reduce((s,d) => s + Number(d.valor), 0);
  var totalEntradas = PEDIDOS.reduce((s,p) => s+p.total, 0);
  var saldo = TOTAL_INV + totDesp - totalEntradas;
  
  // Cálculo de média mensal dinâmico
  var mesesComVenda = NOME_MESES.filter(m => PEDIDOS.some(p => p.mes === m));
  var mTotal = mesesComVenda.map(m => PEDIDOS.filter(p => p.mes === m).reduce((s,p) => s+p.total, 0));
  var media = mTotal.length > 0 ? mTotal.reduce((a,b) => a+b, 0) / mTotal.length : 0;
  
  var mesesBe = media > 0 ? Math.ceil(saldo/media) : '∞';
  
  document.getElementById('c-saldo').innerHTML = fmtR(saldo);
  document.getElementById('c-be').textContent = media > 0 ? '~'+mesesBe+' meses' : 'A definir';
  
  var elBeSub = document.getElementById('c-be-sub');
  if(elBeSub) elBeSub.textContent = 'Na média de ' + (media > 0 ? fmtR(media).replace('R$ ','R$').replace(/<[^>]*>/g, '') : 'R$ 0,00') + '/mês';

  mkChart('ch-cx', {
    type: 'line',
    data: {
      labels: mesesComVenda.map(m => m.substring(0,3)),
      datasets: [{ 
        label: 'Entradas (R$)', 
        data: mTotal, 
        borderColor:'rgba(0,180,230,1)', 
        backgroundColor:'rgba(0,180,230,0.07)', 
        borderWidth:2.5, 
        fill:true, 
        tension:.4, 
        pointRadius:4, 
        pointBackgroundColor:'rgba(0,180,230,1)' 
      }]
    },
    options: { responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:gBase.scales }
  });

  const INVEST = [{n:'MÁQUINA DE GELO',v:15471},{n:'SACOS PLÁSTICOS 5KG',v:257.82},{n:'SACOS PLÁSTICOS 10KG (1)',v:297.96},{n:'SACOS PLÁSTICOS 10KG (2)',v:595.92},{n:'MÃO DE OBRA VOLTAGEM',v:500},{n:'FREEZER',v:2200},{n:'FRETE',v:150},{n:'AR CONDICIONADO',v:1750},{n:'MAQUININHA CARTÃO',v:209},{n:'MÃO OBRA LIMPEZA',v:100},{n:'MAT. REFORMA',v:293},{n:'RETIRADA ENTULHO',v:30},{n:'FAIXAS DIVULGAÇÃO',v:99.80},{n:'SACO GELO 3KG',v:145.03},{n:'NOVA SELADORA',v:704.78},{n:'FOLDER DIVULGAÇÃO',v:150},{n:'JANELA',v:320.39},{n:'BASCULHANTE',v:197.99},{n:'BARRA DE FERRO',v:186.34},{n:'MÃO OBRA REFORMA',v:600},{n:'CHIP VIVO',v:58},{n:'MATERIAL CONST.',v:376},{n:'CHAPA PORTÃO',v:50},{n:'NOVO FREEZER',v:2000}];
  document.getElementById('c-invest').innerHTML = INVEST.map(c=>`<div class="crow"><span class="cnm">${c.n}</span><span class="cvl">${fmtR(c.v)}</span></div>`).join('') + `<div class="crow" style="border-top:1px solid rgba(0,180,230,.2);margin-top:6px;padding-top:6px"><span style="font-weight:700;color:var(--tx)">TOTAL</span><span style="font-family:'Playfair Display',serif;font-size:15px;color:var(--red)">${fmtR(TOTAL_INV)}</span></div>`;

  document.getElementById('c-desp-tbody').innerHTML = DESPESAS.length === 0
    ? '<tr><td colspan="4" style="text-align:center;color:var(--mu);padding:18px;">Sem despesas extra.</td></tr>'
    : DESPESAS.map(d=>`<tr><td>${fmtDate(d.data)}</td><td>${d.descricao}</td><td style="color:var(--red);font-weight:700">${fmtR(d.valor)}</td><td><button class="btn btn-sm" style="background:rgba(230,59,90,.15);color:var(--red);border:none" onclick="delDesp('${d.id}')">✕</button></td></tr>`).join('');
}

async function saveDesp() {
  showLoading();
  var obj = {
    data: document.getElementById('nd-d').value,
    categoria: document.getElementById('nd-c').value,
    descricao: document.getElementById('nd-ds').value || document.getElementById('nd-c').value,
    valor: parseFloat(document.getElementById('nd-v').value)||0,
    pagamento: document.getElementById('nd-p').value
  };
  await sb.from('despesas').insert([obj]);
  await logAudit('despesas', 'INSERT', obj);
  closeMo('mo-desp');
  await loadData();
}

async function delDesp(id) {
  if(!confirm('Deletar esta despesa?')) return;
  showLoading();
  await logAudit('despesas', 'DELETE', {id});
  await sb.from('despesas').delete().eq('id', id);
  await loadData();
}

// ── SIMULADOR ─────────────────────────
// Restaurar último cenário salvo do localStorage
function simRestore() {
  try {
    var saved = localStorage.getItem('wr_sim_cenario');
    if (saved) {
      var d = JSON.parse(saved);
      if (d.sl3 !== undefined)  document.getElementById('sl3').value = d.sl3;
      if (d.sl5 !== undefined)  document.getElementById('sl5').value = d.sl5;
      if (d.sl10 !== undefined) document.getElementById('sl10').value = d.sl10;
      if (d.p3 !== undefined)   document.getElementById('p3').value = d.p3;
      if (d.p5 !== undefined)   document.getElementById('p5').value = d.p5;
      if (d.p10 !== undefined)  document.getElementById('p10').value = d.p10;
      if (d.cfix !== undefined) document.getElementById('cfix').value = d.cfix;
      if (d.cprod !== undefined) document.getElementById('cprod').value = d.cprod;
    }
  } catch(e) { /* ignora erros de parse */ }
}

function simUp() {
  var q3 = +document.getElementById('sl3').value;
  var q5 = +document.getElementById('sl5').value;
  var q10= +document.getElementById('sl10').value;
  var p3 = parseFloat(document.getElementById('p3').value)||3.5;
  var p5 = parseFloat(document.getElementById('p5').value)||5;
  var p10= parseFloat(document.getElementById('p10').value)||9.5;
  var cf = parseFloat(document.getElementById('cfix').value)||0;
  var cp = parseFloat(document.getElementById('cprod').value)||0;

  // Salvar cenário no localStorage
  try {
    localStorage.setItem('wr_sim_cenario', JSON.stringify({
      sl3: q3, sl5: q5, sl10: q10,
      p3: document.getElementById('p3').value,
      p5: document.getElementById('p5').value,
      p10: document.getElementById('p10').value,
      cfix: document.getElementById('cfix').value,
      cprod: document.getElementById('cprod').value
    }));
  } catch(e) {}

  document.getElementById('v3').textContent  = q3; document.getElementById('v5').textContent  = q5; document.getElementById('v10').textContent = q10;

  var r3=q3*p3, r5=q5*p5, r10=q10*p10;
  var bruto=r3+r5+r10;
  var custoProd=(q3+q5+q10)*cp;
  var lucro=bruto-custoProd-cf;
  var totDesp = DESPESAS.reduce((s,d)=>s+Number(d.valor),0);
  var saldo = TOTAL_INV + totDesp - TOTAL_ENT;
  var mBe = lucro > 0 ? Math.ceil(saldo/lucro) : 9999;
  var roi12 = lucro > 0 ? ((lucro*12/saldo)*100).toFixed(1) : 0;
  var marg = bruto > 0 ? ((lucro/bruto)*100).toFixed(1) : 0;

  var set = (id, val) => { var el = document.getElementById(id); if(el) el.innerHTML = val; };
  set('sr3', fmtR(r3)); set('sr5', fmtR(r5)); set('sr10', fmtR(r10));
  set('srb', fmtR(bruto)); set('srcp', '- '+fmtR(custoProd)); set('srcf', '- '+fmtR(cf));
  var elLucro = document.getElementById('srl');
  if(elLucro) {
    elLucro.innerHTML = fmtR(lucro);
    elLucro.style.color = lucro >= 0 ? 'var(--mint)' : 'var(--red)';
  }
  set('srbe', mBe < 9999 ? '~'+mBe+' meses' : 'Sem lucro');
  set('srroi', roi12+'% a.a.'); set('srmg', marg+'%');

  if (mBe < 600) {
    var dt = new Date(); dt.setMonth(dt.getMonth() + mBe);
    document.getElementById('srbed').textContent = dt.toLocaleDateString('pt-BR',{month:'short',year:'numeric'});
  } else { document.getElementById('srbed').textContent = 'Indefinido'; }

  document.getElementById('sc-c').innerHTML = fmtR(lucro*0.7); document.getElementById('sc-b').innerHTML = fmtR(lucro); document.getElementById('sc-o').innerHTML = fmtR(lucro*1.3);
  renderProjChart(lucro, saldo);
}

function renderProjChart(lucro, saldo) {
  if (lucro === undefined) { lucro = 0; saldo = 0; }
  var labels = [], data = [];
  var d = new Date();
  var acc = -saldo;
  for (var i = 0; i <= 36; i++) {
    var dt2 = new Date(d.getFullYear(), d.getMonth()+i, 1);
    labels.push(dt2.toLocaleDateString('pt-BR',{month:'short',year:'2-digit'}));
    data.push(parseFloat(acc.toFixed(2)));
    acc += lucro;
  }
  var pos = data[data.length-1] >= 0;
  mkChart('ch-proj', {
    type: 'line',
    data: {
      labels: labels,
      datasets: [ {label:'Saldo',data:data, borderColor: pos?'rgba(0,212,160,1)':'rgba(230,59,90,1)', backgroundColor: pos?'rgba(0,212,160,.07)':'rgba(230,59,90,.07)', borderWidth:2.5,fill:true,tension:.4,pointRadius:1}, {label:'Breakeven',data:Array(37).fill(0), borderColor:'rgba(255,255,255,.15)',borderWidth:1,pointRadius:0, borderDash:[4,4]} ]
    },
    options: { responsive:true, maintainAspectRatio:false, plugins:{ legend:{display:false}, tooltip:gBase.plugins.tooltip }, scales:{ x:{grid:{color:grd},ticks:{color:tkc,font:{family:"'Inter',sans-serif",size:9},maxTicksLimit:13}}, y:{grid:{color:grd},ticks:{color:tkc,font:{family:"'Inter',sans-serif",size:9},callback:function(v){return 'R$'+v.toLocaleString('pt-BR');}}} } }
  });
}

function openMo(id) { document.getElementById(id).classList.add('on'); }
function closeMo(id){ document.getElementById(id).classList.remove('on'); }
document.querySelectorAll('.ov').forEach(function(ov){
  ov.addEventListener('click', function(e){ if(e.target===ov) ov.classList.remove('on'); });
});

// ── DRILL-DOWN HELPER ─────────────────
function showChartModal(title, orders) {
  document.getElementById('mc-title').textContent = title;
  const tbody = document.getElementById('tb-chart-details').querySelector('tbody');
  
  // Drill-down Summary Header
  const q3 = orders.filter(p => p.produto === '3kg').reduce((s, p) => s + p.quantidade, 0);
  const q5 = orders.filter(p => p.produto === '5kg').reduce((s, p) => s + p.quantidade, 0);
  const q10 = orders.filter(p => p.produto === '10kg').reduce((s, p) => s + p.quantidade, 0);
  const totalR = orders.reduce((s, p) => s + p.total, 0);

  // Adicionar summary bar antes da tabela se houver um container, ou via JS
  let headerHtml = `
    <div style="display:flex;gap:10px;margin-bottom:15px;background:rgba(0,180,230,0.08);padding:10px;border-radius:8px;border:1px solid rgba(0,180,230,0.2)">
      <div style="flex:1"><div style="font-size:10px;color:var(--mu)">TOTAL</div><div style="font-size:14px;font-weight:700;color:var(--ice)">${fmtR(totalR)}</div></div>
      <div style="flex:1"><div style="font-size:10px;color:var(--mu)">3KG</div><div style="font-size:14px;font-weight:700;color:#fff">${q3} <small style="font-weight:400;font-size:10px">un</small></div></div>
      <div style="flex:1"><div style="font-size:10px;color:var(--mu)">5KG</div><div style="font-size:14px;font-weight:700;color:#fff">${q5} <small style="font-weight:400;font-size:10px">un</small></div></div>
      <div style="flex:1"><div style="font-size:10px;color:var(--mu)">10KG</div><div style="font-size:14px;font-weight:700;color:#fff">${q10} <small style="font-weight:400;font-size:10px">un</small></div></div>
    </div>
  `;

  if (orders.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:15px">Sem pedidos listados.</td></tr>';
  } else {
    // Injetar o header no início do modal se desejado (usando prepend num container fixo)
    const modalBody = document.getElementById('mo-chart-details').querySelector('.modal');
    const existingHeader = modalBody.querySelector('.drill-summary');
    if(existingHeader) existingHeader.remove();
    
    const div = document.createElement('div');
    div.className = 'drill-summary';
    div.innerHTML = headerHtml;
    modalBody.querySelector('.tbl-wrap').insertAdjacentElement('beforebegin', div);

    tbody.innerHTML = orders.map(function(v){
      return `<tr><td>${fmtDate(v.data)}</td><td>${v.cliente}</td><td><span class="bx bx-ice">${v.produto}</span> (${v.quantidade})</td><td style="color:var(--mint);font-weight:700">${fmtR(v.total)}</td></tr>`;
    }).join('');
  }
  
  openMo('mo-chart-details');
}

// ── ADMIN & CONFIG ────────────────────
function toggleAdminTab(tab) {
  document.getElementById('tab-adm-users').classList.remove('on');
  document.getElementById('tab-adm-logs').classList.remove('on');
  document.getElementById('adm-users-sec').style.display = 'none';
  document.getElementById('adm-logs-sec').style.display = 'none';
  
  document.getElementById('tab-adm-'+tab).classList.add('on');
  document.getElementById('adm-'+tab+'-sec').style.display = 'block';
}

async function renderAdmin() {
  showLoading();
  
  const { data: profs } = await sb.from('profiles').select('*').order('created_at', {ascending: false});
  if(profs) {
    let html = '';
    profs.forEach(p => {
      let c = p.status === 'approved' ? 'var(--mint)' : (p.status === 'pending' ? 'var(--warn)' : 'var(--red)');
      let acts = '';
      if(p.role !== 'admin') {
         if(p.status === 'pending' || p.status === 'suspended') acts += `<button class="btn btn-sm btn-ice" onclick="approveUser('${p.id}')">Aprovar</button>`;
         if(p.status === 'approved') acts += `<button class="btn btn-sm" style="background:rgba(230,59,90,.15);color:var(--red);border:none" onclick="suspendUser('${p.id}')">Suspender</button>`;
      } else {
        acts = '<span style="color:var(--mu);font-size:12px">Admin</span>';
      }
      
      html += `<tr><td>${p.email}</td><td>${p.role}</td><td style="color:${c};font-weight:600">${p.status.toUpperCase()}</td><td>${acts}</td></tr>`;
    });
    document.getElementById('tb-adm-users').querySelector('tbody').innerHTML = html || '<tr><td colspan="4" style="text-align:center">Nenhum registro</td></tr>';
  }
  
  const { data: logs } = await sb.from('audit_logs').select('*').order('created_at', {ascending: false}).limit(50);
  if(logs) {
    let html = '';
    logs.forEach(l => {
      let dt = new Date(l.created_at).toLocaleString('pt-BR');
      let actClr = l.acao === 'DELETE' ? 'var(--red)' : (l.acao === 'UPDATE' ? 'var(--warn)' : 'var(--mint)');
      html += `<tr><td style="font-size:12px">${dt}</td><td><b>${l.tabela}</b> <br> <span style="color:${actClr};font-size:10px">${l.acao}</span></td><td style="color:var(--ice);font-size:12px">${l.usuario_email}</td><td><pre style="font-size:10px;color:var(--mu);margin:0;max-width:180px;white-space:pre-wrap;word-wrap:break-word;">${JSON.stringify(l.detalhes, null, 2)}</pre></td></tr>`;
    });
    document.getElementById('tb-adm-logs').querySelector('tbody').innerHTML = html || '<tr><td colspan="4" style="text-align:center">Nenhum log registrado</td></tr>';
  }

  hideLoading();
}

async function approveUser(id) {
  if(!confirm('Aprovar este usuário? Ele terá acesso total ao sistema.')) return;
  showLoading();
  await sb.from('profiles').update({status: 'approved'}).eq('id', id);
  await renderAdmin();
}

async function suspendUser(id) {
  if(!confirm('Suspender este usuário? Ele perderá o acesso imediatamente.')) return;
  showLoading();
  await sb.from('profiles').update({status: 'suspended'}).eq('id', id);
  await renderAdmin();
}

// ── CLIENTES ──────────────────────────
function renderClientesList() {
  const tbody = document.getElementById('tb-clientes-body');
  if(!tbody) return;
  
  if (CLIENTES.length === 0) {
    tbody.innerHTML = '<tr><td colspan="2" style="text-align:center;padding:15px">Nenhum cliente cadastrado.</td></tr>';
  } else {
    tbody.innerHTML = CLIENTES.map(function(c){
      return `<tr>
        <td>${c.nome}</td>
        <td><button class="btn btn-sm" style="background:rgba(230,59,90,.15);color:var(--red);border:none" onclick="deleteCliente('${c.id}', '${c.nome}')">✕</button></td>
      </tr>`;
    }).join('');
  }

  // Popular select do PDF também
  const pdfCliSel = document.getElementById('pdf-cli-sel');
  if(pdfCliSel) {
    pdfCliSel.innerHTML = '<option value="todos">Todos os Clientes (Geral)</option>' + 
      CLIENTES.map(c => `<option value="${c.nome}">${c.nome}</option>`).join('');
  }
}

// ── EXPORTS ───────────────────────────
async function exportarLogsCsv() {
  showLoading();
  const { data: logs } = await sb.from('audit_logs').select('*').order('created_at', {ascending: false});
  if(!logs || logs.length === 0) {
    hideLoading();
    return alert('Nenhum log para exportar.');
  }

  let csv = 'Data;Tabela;Acao;Usuario;Detalhes\n';
  logs.forEach(l => {
    const dt = new Date(l.created_at).toLocaleString('pt-BR');
    const det = JSON.stringify(l.detalhes).replace(/;/g, ',');
    csv += `${dt};${l.tabela};${l.acao};${l.usuario_email};${det}\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `audit_logs_${today()}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  hideLoading();
}

function confirmarGerarPDF() {
  const mes = document.getElementById('pdf-mes-sel').value;
  const cli = document.getElementById('pdf-cli-sel').value;
  closeMo('mo-pdf-sel');
  gerarCaixaPDF(mes, cli);
}

function gerarCaixaPDF(mesAtual, clienteAtual) {
  const isGeral = clienteAtual === 'todos';
  const isAllMonths = mesAtual === 'todos';
  let vendasMes = isAllMonths ? PEDIDOS : PEDIDOS.filter(p => p.mes === mesAtual);

  
  if(!isGeral) {
    vendasMes = vendasMes.filter(p => p.cliente === clienteAtual);
  }

  const monthMapping = {
    '01':'Janeiro','02':'Fevereiro','03':'Março','04':'Abril','05':'Maio','06':'Junho',
    '07':'Julho','08':'Agosto','09':'Setembro','10':'Outubro','11':'Novembro','12':'Dezembro'
  };
  const despesasMes = isGeral ? DESPESAS.filter(d => {
    if (isAllMonths) return true;
    const m = monthMapping[d.data.split('-')[1]];
    return m === mesAtual;
  }) : [];


  const totalVendas = vendasMes.reduce((s, p) => s + p.total, 0);
  const totalDespesas = despesasMes.reduce((s, d) => s + d.valor, 0);

  const container = document.createElement('div');
  container.style.padding = '40px';
  container.style.color = '#333';
  container.style.fontFamily = 'sans-serif';
  
  const tituloRelatorio = isGeral ? 'Fechamento Mensal - Geral' : `Fechamento de Cliente: ${clienteAtual}`;

  container.innerHTML = `
    <h1 style="color:#000; border-bottom: 2px solid #000; padding-bottom: 10px;">${tituloRelatorio}</h1>
    <p><b>Período:</b> ${isAllMonths ? 'Geral (Todos os Meses)' : mesAtual + ' 2026'}</p>
    <p><b>Data do Relatório:</b> ${new Date().toLocaleDateString('pt-BR')}</p>
    
    <h2 style="margin-top: 30px;">Relatório de Vendas</h2>
    <table style="width:100%; border-collapse: collapse; margin-bottom: 20px;">
      <thead>
        <tr style="background: #f0f0f0;">
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Data</th>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Cliente</th>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Valor</th>
        </tr>
      </thead>
      <tbody>
        ${vendasMes.length === 0 ? '<tr><td colspan="3" style="text-align:center;padding:10px">Nenhuma venda encontrada para os filtros selecionados.</td></tr>' : vendasMes.map(v => `
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">${fmtDate(v.data)}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${v.cliente}</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${fmtR(v.total)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    ${isGeral ? `
    <h2 style="margin-top: 30px;">Relatório de Despesas</h2>
    <table style="width:100%; border-collapse: collapse; margin-bottom: 20px;">
      <thead>
        <tr style="background: #f0f0f0;">
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Data</th>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Categoria</th>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Valor</th>
        </tr>
      </thead>
      <tbody>
        ${despesasMes.length === 0 ? '<tr><td colspan="3" style="text-align:center;padding:10px">Nenhuma despesa registrada</td></tr>' : despesasMes.map(d => `
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">${fmtDate(d.data)}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${d.categoria}</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${fmtR(d.valor)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    ` : ''}

    <div style="margin-top: 40px; text-align: right; font-size: 18px;">
      <p><b>Total Vendas:</b> ${fmtR(totalVendas)}</p>
      ${isGeral ? `<p><b>Total Despesas:</b> - ${fmtR(totalDespesas)}</p>` : ''}
      <p style="border-top: 2px solid #000; padding-top: 10px;"><b>Saldo Líquido:</b> ${fmtR(totalVendas - totalDespesas)}</p>
    </div>
  `;

  const opt = {
    margin: 10,
    filename: isGeral ? `Fechamento_Geral_${mesAtual}.pdf` : `Fechamento_${clienteAtual.replace(/\s+/g, '_')}_${mesAtual}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  html2pdf().from(container).set(opt).save();
}



