-- ============================================================
-- WR GELO — SETUP DA TABELA DE CLIENTES (Módulo Dinâmico)
-- Execute este script no SQL Editor do Supabase
-- ============================================================

CREATE TABLE IF NOT EXISTS clientes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ativar segurança
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

-- Política: Qualquer usuário Aprovado pode LER os clientes
DROP POLICY IF EXISTS "clientes_read_approved" ON clientes;
CREATE POLICY "clientes_read_approved" ON clientes
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.status = 'approved'));

-- Política: Qualquer usuário Aprovado pode INSERIR clientes
DROP POLICY IF EXISTS "clientes_insert_approved" ON clientes;
CREATE POLICY "clientes_insert_approved" ON clientes
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.status = 'approved'));

-- Política: Qualquer usuário Aprovado pode DELETAR clientes
DROP POLICY IF EXISTS "clientes_delete_approved" ON clientes;
CREATE POLICY "clientes_delete_approved" ON clientes
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.status = 'approved'));

-- 2. CADASTRO INICIAL OBRIGATÓRIO DOS CLIENTES ATUAIS (Migração de dados)
-- ============================================================
INSERT INTO clientes (nome) VALUES 
  ('BAR CARECA'),
  ('ALEX'),
  ('SILAS'),
  ('VENDA VAREJO'),
  ('ZE-MARIA (CONS.)'),
  ('OUTRO')
ON CONFLICT (nome) DO NOTHING;
