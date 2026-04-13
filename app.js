const LOGO_B64 = 'data:image/png;base64,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';
const SUPABASE_URL = 'https://kwafyajlgrpragdvnrmu.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3YWZ5YWpsZ3JwcmFnZHZucm11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5MzgwODYsImV4cCI6MjA5MTUxNDA4Nn0.64VHTEjC7yequKGK-s0qeNo7EqiqWjQM2Hs40gpjID8';
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ── LOGO ──────────────────────────────
document.getElementById('tlogo').src = LOGO_B64;
document.getElementById('hlogo').src = LOGO_B64;
document.getElementById('authlogo').src = LOGO_B64;

// ── DATA ──────────────────────────────
const TOTAL_INV = 26743.03;
const TOTAL_ENT = 835; // Fev + Mar

let PEDIDOS = [];
let ESTOQUE = {s3:0, s5:0, s10:0};
let EST_HIST = [];
let DESPESAS = [];

// ── AUTHENTICATION ────────────────────
let currentUser = null;

async function initAuth() {
  const { data: { session } } = await sb.auth.getSession();
  updateAuthState(session);

  sb.auth.onAuthStateChange((_event, session) => {
    updateAuthState(session);
  });
}

function updateAuthState(session) {
  currentUser = session?.user || null;
  const authPage = document.getElementById('auth-page');
  const mainApp = document.getElementById('main-app');
  
  if (currentUser) {
    authPage.style.display = 'none';
    mainApp.style.display = 'block';
    if(document.getElementById('user-email')) {
      document.getElementById('user-email').textContent = currentUser.email;
    }
    loadData();
  } else {
    authPage.style.display = 'flex';
    mainApp.style.display = 'none';
  }
}

async function handleLogin() {
  const email = document.getElementById('auth-email').value;
  const pass = document.getElementById('auth-pass').value;
  const err = document.getElementById('auth-err');
  const btn = document.getElementById('btn-login');
  
  if(!email || !pass) { err.textContent = 'Preencha todos os campos'; return; }
  
  btn.classList.add('loading'); btn.disabled = true; err.textContent = '';
  
  const { data, error } = await sb.auth.signInWithPassword({ email, password: pass });
  
  btn.classList.remove('loading'); btn.disabled = false;
  if(error) err.textContent = error.message;
}

async function handleSignup() {
  const email = document.getElementById('auth-email').value;
  const pass = document.getElementById('auth-pass').value;
  const err = document.getElementById('auth-err');
  const btn = document.getElementById('btn-login');
  
  if(!email || !pass) { err.textContent = 'Preencha todos os campos'; return; }
  
  btn.classList.add('loading'); btn.disabled = true; err.textContent = '';
  
  const { data, error } = await sb.auth.signUp({ email, password: pass });
  
  btn.classList.remove('loading'); btn.disabled = false;
  
  if(error) {
    err.textContent = error.message;
  } else {
    err.style.color = 'var(--mint)';
    err.textContent = 'Conta criada! Você já pode entrar.';
    toggleAuth('login');
  }
}

async function handleLogout() {
  showLoading();
  await sb.auth.signOut();
  hideLoading();
}

function toggleAuth(type) {
  const isLogin = type === 'login';
  document.getElementById('tab-login').classList.toggle('on', isLogin);
  document.getElementById('tab-signup').classList.toggle('on', !isLogin);
  document.getElementById('btn-login').textContent = isLogin ? 'Entrar' : 'Criar Conta';
  document.getElementById('btn-login').onclick = isLogin ? handleLogin : handleSignup;
  document.getElementById('auth-err').textContent = '';
}

// ── LOADING / DATA FETCH ──────────────
function showLoading() { document.getElementById('global-loader').classList.add('on'); }
function hideLoading() { document.getElementById('global-loader').classList.remove('on'); }

async function loadData() {
  showLoading();
  try {
    const [peds, est, esth, desp] = await Promise.all([
      sb.from('pedidos').select('*').order('data', {ascending: false}),
      sb.from('estoque').select('*'),
      sb.from('estoque_movimentos').select('*').order('data', {ascending: false}),
      sb.from('despesas').select('*').order('data', {ascending: false})
    ]);

    PEDIDOS = peds.data || [];
    EST_HIST = esth.data || [];
    DESPESAS = desp.data || [];
    
    ESTOQUE = {s3:0, s5:0, s10:0};
    if(est.data) {
      est.data.forEach(e => { ESTOQUE[e.produto] = e.quantidade; });
    }

    renderDash();
    if(CUR === 'pedidos') renderPedidos('todos');
    if(CUR === 'estoque') renderEstoque();
    if(CUR === 'caixa') renderCaixa();
  } catch(err) {
    console.error('Erro ao carregar', err);
    alert('Erro de conexão. Verifique sua internet.');
  }
  hideLoading();
}

// ── INIT ──────────────────────────────
initAuth();
