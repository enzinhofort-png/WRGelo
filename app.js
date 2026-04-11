const LOGO_B64="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAB4CAIAAAC2BqGFAABZCklEQVR42u19d5xcR5XuOVV1Q+eenBVGo5yjZck5yzjiiAHjBR5g0u7CLumx2AsLCyzJZGOiE8Y5R8mSLVuycs4z0owmp87dN1XVeX/0KNmGhfeWt/AeVzM/3Q7Tfe93v/udU6fOOYVEBH/KNuIW43bYJJCgH9h8+B9XDoyoOCh99gRc2BLa1ums62a+sJAkIipAKDgzm+mOK8Y3x8N3bR+WXDRX2h09hXzAhSU4I9AiQMx5PnBLGyLr+lZ+aHZDZFxjHSlVKDkyCEgDEUlNkogItAYgIgIgjQREwIgACAiUUp7ra8fVnlS+JKmQALXSmoAIiMZ2tAbSWmkplVJUdOTASD5fdEAFyvekG6Rzedf3r79i/ifff8H4yqQhGBeMI0fCsIFbjw6f+7GH8wWTSDZXiVuumPD1X+7+6efP+/d7dnQOBraJSiuG6DswrUGvuvP66mhUdPeOMIaMMQICAAIiDYwxzhkiIyQAIK2QM8Y5aUIGBVkgJZOJ+OXzJk2oqXzqcKombjLCn20YOTAsuCkYSORMusqE/K1nJf75nEn78vTL3SPLmqPLmuM2wraIWnkwva1TlRiYoXDRo9FiCRnY8WggrGK30/PQw2dPqbvsgtMWLWhNxhOIjCMyAAQkIAQAAA1IAGWaIAAHBMBjTxzfyu+lYztv2sqnjAFAwfWl1AgkVRAoSucKRcdP5dx8Pl+KhSOGDUCB8pUvpSdmtlQunlq96vVhETb6R0ubDpaiYZzZVllbZXX0Oso0NSIRiLCx+2j6jge3fPWD52LFtA+pwMs7LjAGDAkAgQMwQIUIgIBKR6sqfWKqUBSmsGzBAtcQYlJd5fe+/oFFcycBwK+39v3do30QjpucEKSnOJScM1rgGyvG1zYl73596Gff/y0b6I35OceVisiyUIKR98KYiNaedZaubwyUVsQ1IhOmFuHiof2Z390HXr62paYyEfKcUrFYYpwhozHuEgBHHDtEAgKGnFAQIAJyQkLQCAiggYgxjqwMNRIAlfkDyJCAFALj3EDkgJpIIZiGiIXDFXG7sioajVqxaLilPjlpXO3k1voJLdUx0wKAz9+1+us/2yoSUSVlRWU0isWd973vo99de/+zh+2KiFIkAy0YaWIVhrfyR1eLdG/6<line_truncated_7295_characters>...f+f8H0P8vjD6p8T918K+NPrG9Nn/09Lp3fPeRL9z+/o++9/pLzpj9rkvOWDxtSqmkaZpKK8MwfN/XWvteYHh+T9/+7Tvf6DraY5Nhhwzf9TzfsYxYfW2ypvGzX//Y6tf7XnjscYvA/xfX6H8Boz/O8/A+A/+e4f5vAPo/ZfTPFf6fOegX0F4vN6iAnO0M9vT1v7JjR89wR01Z3NREpLVhGIZpGshI6+C7vvvK7td27D7WkzYMc9L4xpZJDU0NidpoRPlSSf1ffn3vxsfX53L5Awd9IvwfAbGvO+Xv7P/9K7D8A1HnDBmdY2f7tO7C9vWv7NnTMeoNnzS++fIr5qOtfR/8QCst9zVfS+kXvX95Z/+G7u6BvM1ZJBKqqqlOnNjQ0BBtqI05RujL+zce6erq6uoe6R/MDXUPU6D8U//4O3f/1xR/+mH05x7vQ0YjYJ89I3HPB846tGfL2j0De/e92t6e16F95rxI7VlV9XU1Vcm62uraWKI8S+vK8/Tvf/Tsr9bv3fPysfTIGM06s85etHBe05IFrXOnT007TtdQbtdvdu/Zf+RIZ8+Rw8O5zFDg+66rfP+/g/EvAPo/ZfTPFf6fOegX0F4vN6iAnO0M9vT1v7JjR89wR01Z3NREpLVhGIZpGshI6+C7vvvK7td27D7WkzYMc9L4xpZJDU0NidpoRPlSSf1ffn3vxsfX53L5Awd9IvwfAbGvO+Xv7P/9K7D8A1HnDBmdY2f7tO7C9vWv7NnTMeoNnzS++fIr5qOtfR/8QCst9zVfS+kXvX95Z/+G7u6BvM1ZJBKqqqlOnNjQ0BBtqI05RujL+zce6erq6uoe6R/MDXUPU6D8U//4O3f/1xR/+mH05x7vQ0YjYJ89I3HPB846tGfL2j0De/e92t6e16F95rxI7VlV9XU1Vcm62uraWKI8S+vK8/Tvf/Tsr9bv3fPysfTIGM06s85etHBe05IFrXOnT007TtdQbtdvdu/Zf+RIZ8+Rw8O5zFDg+66rfP+/g/EvAPo/ZfTPFf6fOegX0F4vN6iAnO0M9vT1v7JjR89wR01Z3NREpLVhGIZpGshI6+C7vvvK7td27D7WkzYMc9L4xpZJDU0NidpoRPlSSf1ffn3vxsfX53L5Awd9IvwfAbGvO+Xv7P/9K7D8A1HnDBmdY2f7tO7C9vWv7NnTMeoNnzS++fIr5qOtfR/8QCst9zVfS+kXvX95Z/+G7u6BvM1ZJBKqqqlOnNjQ0BBtqI05RujL+zce6erq6uoe6R/MDXUPU6D8U//4O3f/1xR/+mH05x7vQ0YjYJ89I3HPB846tGfL2j0De/e92t6e16F95rxI7VlV9XU1Vcm62uraWKI8S+vK8/Tvf/Tsr9bv3fPysfTIGM06s85etHBe05IFrXOnT007TtdQbtdvdu/Zf+RIZ8+Rw8O5zFDg+66rfP+/g/EvAPo52f+P8X/7+D/H8r0qon3pTMAAAAASUVORK5CYII=";
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
