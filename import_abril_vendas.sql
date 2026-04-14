-- Script de Importação dos dados da Planilha att1 (Deltas de Abril)
-- Execute este script no SQL Editor do Supabase

INSERT INTO pedidos (data, cliente, produto, quantidade, valor_unitario, total, mes, is_historico) VALUES
  ('2026-04-01','SILAS','5kg',10,5.00,50.00,'Abril',true),
  ('2026-04-01','SILAS','3kg',10,3.50,35.00,'Abril',true),
  ('2026-04-01','SILAS','3kg',10,3.50,35.00,'Abril',true),
  ('2026-04-01','SILAS','3kg',5,3.50,17.50,'Abril',true),
  ('2026-04-01','SILAS','5kg',5,5.00,25.00,'Abril',true),
  ('2026-04-01','ALEX','3kg',10,3.50,35.00,'Abril',true),
  ('2026-04-01','BAR CARECA','10kg',7,9.50,66.50,'Abril',true),
  ('2026-04-01','BAR CARECA','5kg',6,5.00,30.00,'Abril',true);

-- Atualização de Estoque Inicial (se necessário baseada na planilha)
-- Nota: A planilha não indica níveis atuais de estoque, apenas movimentações passadas.
