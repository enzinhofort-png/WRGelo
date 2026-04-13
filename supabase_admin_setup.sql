-- ============================================================
-- WR GELO — ADMIN & AUDIT LOGS SETUP
-- Execute este script no SQL Editor do Supabase E MANTENHA-O
-- ============================================================

-- 1. TABELA DE PERFIS (Aprovações)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'suspended')),
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ativar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Política: Usuário autenticado pode ler SEU PRÓPRIO perfil
CREATE POLICY "user_read_own_profile" ON profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

-- Política: Apenas o Administrador pode ler todos os perfis e atualizar status
CREATE POLICY "admin_all_profiles" ON profiles
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );


-- 2. TRIGGER PARA NOVOS USUÁRIOS
-- Cria perfil automático assim que a conta é registrada. Se for o seu email, já entra aprovado como admin.
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, status, role)
  VALUES (
    NEW.id,
    NEW.email,
    CASE WHEN NEW.email = 'enzopelegrino6@gmail.com' THEN 'approved' ELSE 'pending' END,
    CASE WHEN NEW.email = 'enzopelegrino6@gmail.com' THEN 'admin' ELSE 'user' END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Exclui a trigger caso já exista para recriá-la limpa
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 3. TABELA DE AUDITORIA (LOGS)
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tabela TEXT NOT NULL,
  acao TEXT NOT NULL,
  usuario_email TEXT NOT NULL,
  detalhes JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Política: Apenas ADMIN pode enxergar os logs
CREATE POLICY "admin_read_logs" ON audit_logs
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- Política: Qualquer usuário Aprovado pode inserir logs (pois o sistema fará automaticamente ao salvar)
CREATE POLICY "approved_insert_logs" ON audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.status = 'approved'));


-- 4. ATUALIZAR ACESSO DAS TABELAS EXISTENTES
-- Remove o acesso liberar geral para "apenas usuários APROVADOS"
-- ============================================================

-- Remover antigas ("auth_all_XXX"):
DROP POLICY IF EXISTS "auth_all_pedidos" ON pedidos;
DROP POLICY IF EXISTS "auth_all_estoque" ON estoque;
DROP POLICY IF EXISTS "auth_all_estoque_mov" ON estoque_movimentos;
DROP POLICY IF EXISTS "auth_all_despesas" ON despesas;

-- Novas Políticas:
CREATE POLICY "pedidos_approved_only" ON pedidos FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.status = 'approved'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.status = 'approved'));

CREATE POLICY "estoque_approved_only" ON estoque FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.status = 'approved'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.status = 'approved'));

CREATE POLICY "est_mov_approved_only" ON estoque_movimentos FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.status = 'approved'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.status = 'approved'));

CREATE POLICY "despesas_approved_only" ON despesas FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.status = 'approved'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.status = 'approved'));

-- CASO você ou alguém já estejam cadastrados na Auth e as tabelas perfis ficaram vazias:
-- (Esse bloco preenche perfis antigos órfãos baseados nos dados da auth.users)
INSERT INTO profiles (id, email, status, role)
SELECT id, email, 
  CASE WHEN email = 'enzopelegrino6@gmail.com' THEN 'approved' ELSE 'pending' END,
  CASE WHEN email = 'enzopelegrino6@gmail.com' THEN 'admin' ELSE 'user' END
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles)
ON CONFLICT (id) DO NOTHING;
