import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { CarrinhoProvider } from './CarrinhoContext.jsx'
import { ToastProvider } from './ToastContext.jsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import Cadastrar from './Cadastrar.jsx'
import EsqueceuSenha from './EsqueceuSenha.jsx'
import Escolhe from './Escolhe.jsx'
import Pedidos from './Pedidos.jsx'
import Pagamento from './FormaDePagamento.jsx'
import Confirmado from './Confirmado.jsx'
import ProdutosSesc from './ProdutosSesc.jsx'
import ProdutosSenac from './ProdutosSenac.jsx'
import RelatoriosGerais from './RelatoriosGerais.jsx'
import Descricao from './Descricao.jsx'
import CadastrarAdm from './CadastrarAdm.jsx'
import GerenciarAdm from './GerenciarAdm.jsx'
import EditarAdm from './EditarAdm.jsx'
import CriarEscola from './CriarEscola.jsx'
import GerenciarEscolas from './GerenciarEscolas.jsx'
import EditarEscola from './EditarEscola.jsx'
import CriarLanchonete from './CriarLanchonete.jsx'
import GerenciarLanchonete from './GerenciarLanchonete.jsx'
import EditarLanchonete from './EditarLanchonete.jsx'
import EscolhaAdm from './EscolhaAdm.jsx'
import GerenciarProdutos from './GerenciarProdutosSesc.jsx'
import GerenciarProdutosSenac from './GerenciarProdutosSenac.jsx'
import GerenciarProdutosSesc from './GerenciarProdutosSesc.jsx'
import GerenciarPedidos from './GerenciarPedidos.jsx'
import AdicionarProdutos from './AdicionarProdutosSesc.jsx'
import AdicionarProdutosSenac from './AdicionarProdutosSenac.jsx'
import GerenciarAlunos from './GerenciarAlunos.jsx'
import EditarAluno from './EditarAluno.jsx'
import ItensPedido from './ItensPedido.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider>
      <CarrinhoProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
          <Route path="/" element={<App />} />
          <Route path="/Cadastrar" element={<Cadastrar />} />
          <Route path="/EsqueceuSenha" element={<EsqueceuSenha />} />
          <Route path="/Escolhe" element={<Escolhe />} />
          <Route path="/Pedidos" element={<Pedidos />} />
          <Route path="/Pagamento" element={<Pagamento />} />
          {/* Alias para usuários que acessam diretamente /FormaDePagamento */}
          <Route path="/FormaDePagamento" element={<Pagamento />} />
          <Route path="/Confirmado" element={<Confirmado />} />
          {/* Rota legada para compatibilidade: aponta para Sesc */}
          <Route path="/Produtos" element={<ProdutosSesc />} />
          <Route path="/ProdutosSesc" element={<ProdutosSesc />} />
          <Route path="/ProdutosSenac" element={<ProdutosSenac />} />
          <Route path="/RelatoriosGerais" element={<RelatoriosGerais />} />
          <Route path="/Descricao/:id" element={<Descricao />} />
          <Route path="/CadastrarAdm" element={<CadastrarAdm />} />
          <Route path="/GerenciarAdm" element={<GerenciarAdm />} />
          <Route path="/EditarAdm/:id" element={<EditarAdm />} />
          <Route path="/CriarEscola" element={<CriarEscola />} />
          <Route path="/EditarEscola/:id" element={<EditarEscola />} />
          <Route path="/GerenciarEscolas" element={<GerenciarEscolas />} />
          <Route path="/CriarLanchonete" element={<CriarLanchonete />} />
          <Route path="/GerenciarLanchonete" element={<GerenciarLanchonete />} />
          <Route path="/EditarLanchonete/:id" element={<EditarLanchonete />} />
          <Route path="/EscolhaAdm" element={<EscolhaAdm />} />
          <Route path="/GerenciarProdutos" element={<GerenciarProdutos />} />
          <Route path="/GerenciarProdutosSenac" element={<GerenciarProdutosSenac />} />
          <Route path="/GerenciarProdutosSesc" element={<GerenciarProdutosSesc />} />
          <Route path="/GerenciarPedidos" element={<GerenciarPedidos />} />
          <Route path="/AdicionarProdutos" element={<AdicionarProdutos />} />
          <Route path="/AdicionarProdutosSesc" element={<AdicionarProdutos />} />
          <Route path="/AdicionarProdutosSenac" element={<AdicionarProdutosSenac />} />
          <Route path="/GerenciarAlunos" element={<GerenciarAlunos />} />
          <Route path="/EditarAluno/:id" element={<EditarAluno />} />
          <Route path="/ItensPedido/:id" element={<ItensPedido />} />
          </Routes>
        </BrowserRouter>
      </CarrinhoProvider>
    </ToastProvider>
  </StrictMode>
)
