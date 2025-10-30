-- Criar tabela de produtos da lanchonete
CREATE TABLE public.products (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  price numeric(10, 2) NOT NULL,
  category text NOT NULL,
  image_url text,
  available boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Política para permitir que todos vejam os produtos (cardápio público)
CREATE POLICY "Produtos são visíveis para todos"
  ON public.products
  FOR SELECT
  USING (true);

-- Inserir alguns produtos de exemplo
INSERT INTO public.products (name, description, price, category, image_url, available) VALUES
  ('X-Burger Clássico', 'Hambúrguer suculento, queijo, alface, tomate e molho especial', 18.90, 'Hambúrgueres', null, true),
  ('X-Bacon', 'Hambúrguer, bacon crocante, queijo cheddar e molho barbecue', 22.90, 'Hambúrgueres', null, true),
  ('X-Salada', 'Hambúrguer, queijo, alface, tomate, milho e batata palha', 19.90, 'Hambúrgueres', null, true),
  ('Coca-Cola 350ml', 'Refrigerante gelado', 5.00, 'Bebidas', null, true),
  ('Suco Natural 500ml', 'Suco de laranja natural', 8.00, 'Bebidas', null, true),
  ('Batata Frita Grande', 'Porção generosa de batatas crocantes', 15.00, 'Porções', null, true);