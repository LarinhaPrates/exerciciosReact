-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.escola (
  id_escola bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  nome_escola text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  cidade text,
  admResponsavel uuid,
  CONSTRAINT escola_pkey PRIMARY KEY (id_escola)
);
CREATE TABLE public.itens_pedido (
  id_pedido bigint NOT NULL,
  id_produto bigint NOT NULL,
  quantidade integer NOT NULL CHECK (quantidade > 0),
  preco_unitario numeric NOT NULL,
  CONSTRAINT itens_pedido_pkey PRIMARY KEY (id_pedido, id_produto),
  CONSTRAINT itens_pedido_id_pedido_fkey FOREIGN KEY (id_pedido) REFERENCES public.pedido(id_pedido),
  CONSTRAINT itens_pedido_id_produto_fkey FOREIGN KEY (id_produto) REFERENCES public.produto(id_produto)
);
CREATE TABLE public.lanchonete (
  id_lanchonete bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  id_escola bigint NOT NULL,
  nome_lanchonete text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT lanchonete_pkey PRIMARY KEY (id_lanchonete),
  CONSTRAINT lanchonete_id_escola_fkey FOREIGN KEY (id_escola) REFERENCES public.escola(id_escola)
);
CREATE TABLE public.pedido (
  id_pedido bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  id_user_cliente uuid NOT NULL,
  status_pedido text DEFAULT 'Pendente'::text,
  valor_total numeric NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  itens text,
  id_escola bigint,
  CONSTRAINT pedido_pkey PRIMARY KEY (id_pedido),
  CONSTRAINT pedido_id_user_cliente_fkey FOREIGN KEY (id_user_cliente) REFERENCES auth.users(id)
);
CREATE TABLE public.perfil (
  id_user uuid NOT NULL,
  nome text,
  bairro text,
  complemento text,
  sexo text,
  telefone text,
  data_nascimento date,
  foto text,
  id_escola bigint,
  tipoConta text,
  CONSTRAINT perfil_pkey PRIMARY KEY (id_user),
  CONSTRAINT perfil_id_user_fkey FOREIGN KEY (id_user) REFERENCES auth.users(id)
);
CREATE TABLE public.produto (
  id_produto bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  nome_produto text NOT NULL,
  descricao text,
  preco numeric NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  foto character varying,
  id_lanchonete smallint,
  CONSTRAINT produto_pkey PRIMARY KEY (id_produto)
);