-- ============================================================
-- WR GELO — SUPABASE SETUP
-- Execute este SQL no Supabase SQL Editor
-- ============================================================

-- 1. TABELAS
-- ============================================================

CREATE TABLE IF NOT EXISTS pedidos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  data DATE NOT NULL,
  cliente TEXT NOT NULL,
  produto TEXT NOT NULL,
  quantidade INTEGER NOT NULL DEFAULT 0,
  valor_unitario NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(10,2) DEFAULT 0,
  mes TEXT NOT NULL,
  pagamento TEXT DEFAULT 'Dinheiro',
  is_historico BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS estoque (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  produto TEXT UNIQUE NOT NULL,
  quantidade INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS estoque_movimentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  data DATE NOT NULL,
  produto TEXT NOT NULL,
  tipo TEXT NOT NULL,
  quantidade INTEGER NOT NULL DEFAULT 0,
  observacao TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS despesas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  data DATE NOT NULL,
  descricao TEXT NOT NULL,
  valor NUMERIC(10,2) NOT NULL DEFAULT 0,
  categoria TEXT DEFAULT '',
  pagamento TEXT DEFAULT 'Dinheiro',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ROW LEVEL SECURITY (apenas usuários autenticados)
-- ============================================================

ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_all_pedidos" ON pedidos FOR ALL
  TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE estoque ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_all_estoque" ON estoque FOR ALL
  TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE estoque_movimentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_all_estoque_mov" ON estoque_movimentos FOR ALL
  TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE despesas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_all_despesas" ON despesas FOR ALL
  TO authenticated USING (true) WITH CHECK (true);

-- 3. ESTOQUE INICIAL
-- ============================================================

INSERT INTO estoque (produto, quantidade) VALUES
  ('s3', 200),
  ('s5', 150),
  ('s10', 80)
ON CONFLICT (produto) DO NOTHING;

-- 4. SEED — VENDAS HISTÓRICAS
-- ============================================================

INSERT INTO pedidos (data, cliente, produto, quantidade, valor_unitario, total, mes, is_historico) VALUES
  ('2026-02-24','BAR CARECA','5kg',12,5,60,'Fevereiro',true),
  ('2026-02-24','VENDA VAREJO','5kg',1,8,8,'Fevereiro',true),
  ('2026-02-24','VENDA VAREJO','5kg',5,10,50,'Fevereiro',true),
  ('2026-02-24','BAR CARECA','5kg',10,5,50,'Fevereiro',true),
  ('2026-02-24','BAR CARECA','10kg',2,9.5,19,'Fevereiro',true),
  ('2026-02-24','BAR CARECA','3kg',5,3.5,17.5,'Fevereiro',true),
  ('2026-02-25','ALEX','3kg',10,5,50,'Fevereiro',true),
  ('2026-02-26','SILAS','5kg',5,5,25,'Fevereiro',true),
  ('2026-02-26','SILAS','3kg',5,3.5,17.5,'Fevereiro',true),
  ('2026-02-25','ZE-MARIA (CONSIG.)','5kg',6,0,0,'Fevereiro',true),
  ('2026-02-25','ZE-MARIA (CONSIG.)','3kg',6,0,0,'Fevereiro',true),
  ('2026-03-02','SILAS','5kg',5,5,25,'Março',true),
  ('2026-03-02','SILAS','3kg',5,3.5,17.5,'Março',true),
  ('2026-03-02','BAR CARECA','10kg',3,9.5,28.5,'Março',true),
  ('2026-03-04','BAR CARECA','10kg',4,9.5,38,'Março',true),
  ('2026-03-04','BAR CARECA','5kg',7,5,35,'Março',true),
  ('2026-03-04','BAR CARECA','3kg',6,3.5,21,'Março',true),
  ('2026-03-06','SILAS','5kg',10,5,50,'Março',true),
  ('2026-03-06','SILAS','3kg',5,3.5,17.5,'Março',true),
  ('2026-03-09','ALEX','3kg',10,3.5,35,'Março',true),
  ('2026-03-11','SILAS','5kg',5,5,25,'Março',true),
  ('2026-03-11','SILAS','3kg',5,3.5,17.5,'Março',true),
  ('2026-03-14','SILAS','3kg',10,3.5,35,'Março',true),
  ('2026-03-14','BAR CARECA','10kg',4,9.5,38,'Março',true),
  ('2026-03-14','BAR CARECA','5kg',8,5,40,'Março',true),
  ('2026-03-14','BAR CARECA','3kg',7,3.5,24.5,'Março',true),
  ('2026-03-21','BAR CARECA','10kg',4,9.5,38,'Março',true),
  ('2026-03-28','SILAS','3kg',15,3.5,52.5,'Março',true);
