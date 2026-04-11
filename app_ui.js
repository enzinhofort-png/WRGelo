// ── HELPERS ───────────────────────────
function fmtDate(d) {
  if (!d) return '—';
  var p = d.split('-');
  return p[2]+'/'+p[1]+'/'+p[0];
}
function fmtR(v) {
  return 'R$ ' + Number(v).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
}
function today() { return new Date().toISOString().split('T')[0]; }

document.querySelectorAll('input[type=date]').forEach(function(i){ i.value = today(); });
document.getElementById('cur-date').textContent = new Date().toLocaleDateString('pt-BR',{day:'2-digit',month:'short',year:'numeric'});

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
  plugins: { legend: { labels: { color: tkc, font: { family: "'Inter',sans-serif", size: 10 }, boxWidth: 10 } }, tooltip: { backgroundColor: 'rgba(7,16,30,.95)', borderColor: 'rgba(0,180,230,.3)', borderWidth: 1 } },
  scales: { x: { grid: { color: grd }, ticks: { color: tkc, font: { family: "'Inter',sans-serif", size: 10 } } }, y: { grid: { color: grd }, ticks: { color: tkc, font: { family: "'Inter',sans-serif", size: 10 }, callback: function(v){ return 'R$'+v; } } } }
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
  if (id === 'sim')       { simUp(); renderProjChart(undefined, undefined); }
}

// ── UI REFRESHE (DASHBOARD) ─────────────────────────
function renderDash() {
  var tots = {s3:0,s5:0,s10:0};
  PEDIDOS.filter(p => !p.is_historico).forEach(function(v){
    if (v.produto === '3kg') tots.s3 += v.quantidade;
    else if (v.produto === '5kg') tots.s5 += v.quantidade;
    else if (v.produto === '10kg') tots.s10 += v.quantidade;
  });
  // Se quiser incluir históricos no resumo, pode ajustar o filtro
  var histPeds = PEDIDOS.filter(p => p.is_historico);
  
  var somaQtd = PEDIDOS.reduce((acc, curr) => acc + curr.quantidade, 0);

  document.getElementById('h-sacos').textContent = somaQtd;
  document.getElementById('d-estoque').textContent = (ESTOQUE.s3+ESTOQUE.s5+ESTOQUE.s10)+' un.';

  var cliTot = {};
  PEDIDOS.forEach(function(v){ cliTot[v.cliente] = (cliTot[v.cliente]||0) + v.total; });
  var cliKeys = Object.keys(cliTot);
  
  mkChart('ch-v', {
    type: 'bar',
    data: {
      labels: ['Fevereiro','Março','Abril','Maio','Junho'],
      datasets: [{
        label: 'Vendas (R$)',
        data: [297, 538, 0, 0, 0], // Você pode calcular o total dinamicamente por mês aqui
        backgroundColor: ['rgba(0,180,230,0.6)','rgba(0,212,160,0.6)','rgba(0,180,230,0.15)','rgba(0,180,230,0.15)','rgba(0,180,230,0.15)'],
        borderColor: ['rgba(0,180,230,1)','rgba(0,212,160,1)','rgba(0,180,230,0.3)','rgba(0,180,230,0.3)','rgba(0,180,230,0.3)'],
        borderWidth: 2, borderRadius: 6
      }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: gBase.plugins.tooltip }, scales: gBase.scales }
  });

  mkChart('ch-cli', {
    type: 'doughnut',
    data: {
      labels: cliKeys,
      datasets: [{
        data: cliKeys.map(k => cliTot[k]),
        backgroundColor: ['rgba(0,180,230,.7)','rgba(0,212,160,.7)','rgba(109,213,245,.7)','rgba(240,165,0,.7)','rgba(230,59,90,.5)'],
        borderColor: '#06101E', borderWidth: 2
      }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: tkc, font: { family: "'Inter',sans-serif", size: 9 }, boxWidth: 10 } }, tooltip: gBase.plugins.tooltip } }
  });

  var maxV = Math.max.apply(null, Object.values(cliTot));
  var clrs = {'BAR CARECA':'var(--ice)','ALEX':'var(--mint)','SILAS':'var(--ice2)','VENDA VAREJO':'var(--warn)'};
  document.getElementById('d-progs').innerHTML = Object.entries(cliTot).sort((a,b)=>b[1]-a[1]).map(function(e){
    var pct = Math.round(e[1]/maxV*100);
    var cl = clrs[e[0]] || 'var(--ice)';
    return '<div class="prow"><div class="plbl"><span>'+e[0]+'</span><span style="color:'+cl+'">'+fmtR(e[1])+'</span></div><div class="ptrack"><div class="pfil" style="width:'+pct+'%;background:'+cl+'"></div></div></div>';
  }).join('');

  var rec = PEDIDOS.slice(0, 8); // Top recentes pois já vieram ordenados
  document.getElementById('d-recentes').innerHTML = rec.map(function(v){
    return '<tr><td>'+fmtDate(v.data)+'</td><td><span class="bx bx-ice">'+v.cliente.split(' ')[0]+'</span></td><td>'+v.produto+'</td><td style="color:var(--mint);font-weight:700">'+fmtR(v.total)+'</td></tr>';
  }).join('');
}

// ── PEDIDOS ───────────────────────────
function renderPedidos(f) {
  var rows = f === 'todos' ? PEDIDOS : f === 'Novo' ? PEDIDOS.filter(p=>!p.is_historico) : PEDIDOS.filter(p=> p.mes === f);
  document.getElementById('p-count').textContent = rows.length + ' reg.';
  var paid = rows.filter(p => p.total > 0);
  document.getElementById('p-ticket').textContent = paid.length > 0 ? fmtR(paid.reduce((s,p) => s+p.total,0)/paid.length) : '—';
  
  document.getElementById('p-tbody').innerHTML = rows.map(function(v){
    var btn = `<button class="btn btn-sm" style="background:rgba(230,59,90,.15);color:var(--red);border:none" onclick="delPed('${v.id}')">✕</button>`;
    return `<tr><td>${fmtDate(v.data)}</td><td>${v.cliente}</td><td><span class="bx bx-ice">${v.produto}</span></td><td>${v.quantidade}</td><td style="color:${v.total>0?'var(--mint)':'var(--mu)'}">${fmtR(v.total)}</td><td><span class="bx bx-${v.mes==='Março'?'mint':'ice'}">${v.mes}</span></td><td>${!v.is_historico?btn:''}</td></tr>`;
  }).join('') || '<tr><td colspan="7" style="text-align:center;color:var(--mu);padding:20px">Nenhum registro.</td></tr>';
}

function filtPed(f, btn) {
  document.querySelectorAll('#ped-tabs .tab').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  renderPedidos(f);
}

// ── API MUTATIONS ─────────────────────
async function delPed(id) {
  if(!confirm('Deletar este pedido?')) return;
  showLoading();
  await supabase.from('pedidos').delete().eq('id', id);
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
  var mm = {'01':'Janeiro','02':'Fevereiro','03':'Março','04':'Abril','05':'Maio','06':'Junho','07':'Julho','08':'Agosto','09':'Setembro','10':'Outubro','11':'Novembro','12':'Dezembro'};
  var mes = mm[d.split('-')[1]] || 'Novo';
  
  var obj = {
    data: d, cliente: document.getElementById('np-c').value,
    produto: document.getElementById('np-p').value,
    quantidade: parseFloat(document.getElementById('np-q').value)||0,
    valor_unitario: parseFloat(document.getElementById('np-u').value)||0,
    total: parseFloat(document.getElementById('np-t').value)||0,
    pagamento: document.getElementById('np-pg').value,
    mes: mes, is_historico: false
  };
  
  showLoading();
  await supabase.from('pedidos').insert([obj]);
  closeMo('mo-ped');
  await loadData();
}

// ── ESTOQUE ───────────────────────────
function renderEstoque() {
  var itens = [ {k:'s3',n:'Sacos 3kg', max:500}, {k:'s5',n:'Sacos 5kg', max:400}, {k:'s10',n:'Sacos 10kg',max:200} ];
  document.getElementById('e-lista').innerHTML = itens.map(function(it){
    var q = ESTOQUE[it.k]||0;
    var pct = Math.min(100, Math.round(q/it.max*100));
    var cor = pct < 20 ? 'var(--red)' : pct < 40 ? 'var(--warn)' : 'var(--ice)';
    return '<div class="si"><div class="sico">🧊</div><div class="sinf"><div class="snm">'+it.n+'</div><div class="ssb">'+pct+'% do máximo</div><div class="sbar"><div class="sfil" style="width:'+pct+'%;background:'+cor+'"></div></div></div><div class="sqt" style="color:'+cor+'">'+q+'<br><span style="font-size:10px;color:var(--mu)">unid.</span></div></div>';
  }).join('');

  var getQtd = (p,m) => PEDIDOS.filter(v => v.produto===p && v.mes===m).reduce((s,v)=>s+v.quantidade,0);
  mkChart('ch-e', {
    type: 'bar',
    data: {
      labels: ['3kg','5kg','10kg'],
      datasets: [
        {label:'Fevereiro',data:[getQtd('3kg','Fevereiro'),getQtd('5kg','Fevereiro'),getQtd('10kg','Fevereiro')],backgroundColor:'rgba(0,180,230,.6)',borderRadius:4},
        {label:'Março',    data:[getQtd('3kg','Março'),    getQtd('5kg','Março'),    getQtd('10kg','Março')],    backgroundColor:'rgba(0,212,160,.6)',borderRadius:4}
      ]
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
  await supabase.from('estoque').upsert([{produto: p, quantidade: nq}], {onConflict: 'produto'});
  await supabase.from('estoque_movimentos').insert([{
    data: document.getElementById('ne-d').value, produto: p, tipo: t, quantidade: q, observacao: document.getElementById('ne-o').value
  }]);
  closeMo('mo-est');
  await loadData();
}

// ── CAIXA / DESPESAS ──────────────────
function renderCaixa() {
  var totDesp = DESPESAS.reduce((s,d) => s + Number(d.valor), 0);
  var saldo = TOTAL_INV + totDesp - TOTAL_ENT;
  var media = (297+538)/2;
  var mesesBe = Math.ceil(saldo/media);
  
  document.getElementById('c-saldo').textContent = fmtR(saldo);
  document.getElementById('c-be').textContent = '~'+mesesBe+' meses';
  
  mkChart('ch-cx', {
    type: 'line',
    data: {
      labels: ['Fev','Mar','Abr','Mai','Jun'],
      datasets: [{ label: 'Entradas (R$)', data: [297,538,0,0,0], borderColor:'rgba(0,180,230,1)', backgroundColor:'rgba(0,180,230,0.07)', borderWidth:2.5, fill:true, tension:.4, pointRadius:4, pointBackgroundColor:'rgba(0,180,230,1)' }]
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
  await supabase.from('despesas').insert([{
    data: document.getElementById('nd-d').value,
    categoria: document.getElementById('nd-c').value,
    descricao: document.getElementById('nd-ds').value || document.getElementById('nd-c').value,
    valor: parseFloat(document.getElementById('nd-v').value)||0,
    pagamento: document.getElementById('nd-p').value
  }]);
  closeMo('mo-desp');
  await loadData();
}

async function delDesp(id) {
  if(!confirm('Deletar esta despesa?')) return;
  showLoading();
  await supabase.from('despesas').delete().eq('id', id);
  await loadData();
}

// ── SIMULADOR ─────────────────────────
function simUp() {
  var q3 = +document.getElementById('sl3').value;
  var q5 = +document.getElementById('sl5').value;
  var q10= +document.getElementById('sl10').value;
  var p3 = parseFloat(document.getElementById('p3').value)||3.5;
  var p5 = parseFloat(document.getElementById('p5').value)||5;
  var p10= parseFloat(document.getElementById('p10').value)||9.5;
  var cf = parseFloat(document.getElementById('cfix').value)||0;
  var cp = parseFloat(document.getElementById('cprod').value)||0;

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

  document.getElementById('sr3').textContent  = fmtR(r3); document.getElementById('sr5').textContent  = fmtR(r5); document.getElementById('sr10').textContent = fmtR(r10);
  document.getElementById('srb').textContent  = fmtR(bruto); document.getElementById('srcp').textContent = '- '+fmtR(custoProd); document.getElementById('srcf').textContent = '- '+fmtR(cf);
  document.getElementById('srl').textContent  = fmtR(lucro); document.getElementById('srl').style.color  = lucro >= 0 ? 'var(--mint)' : 'var(--red)';
  document.getElementById('srbe').textContent = mBe < 9999 ? '~'+mBe+' meses' : 'Sem lucro';
  document.getElementById('srroi').textContent= roi12+'% a.a.'; document.getElementById('srmg').textContent = marg+'%';

  if (mBe < 600) {
    var dt = new Date(); dt.setMonth(dt.getMonth() + mBe);
    document.getElementById('srbed').textContent = dt.toLocaleDateString('pt-BR',{month:'short',year:'numeric'});
  } else { document.getElementById('srbed').textContent = 'Indefinido'; }

  document.getElementById('sc-c').textContent = fmtR(lucro*0.7); document.getElementById('sc-b').textContent = fmtR(lucro); document.getElementById('sc-o').textContent = fmtR(lucro*1.3);
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
