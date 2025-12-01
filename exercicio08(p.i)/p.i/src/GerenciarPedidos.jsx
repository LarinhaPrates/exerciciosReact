import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import senac from './Image/senacBranco.png';
import sesc from './Image/sescBranco.png';

function GerenciarPedidos() {
  const [filtroAtivo, setFiltroAtivo] = useState('todos');
  const [pedidos, setPedidos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [usuarioNome, setUsuarioNome] = useState('');

  // Formata data/hora para pt-BR
  const formatarDataHora = (iso) => {
    if (!iso) return '-';
    try {
      const d = new Date(iso);
      return d.toLocaleString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return iso;
    }
  };

  // Converte o campo itens para string amigável
  const itensParaTexto = (itens) => {
    if (!itens) return '-';
    if (Array.isArray(itens)) {
      // Pode ser array de strings ou objetos
      return itens
        .map((it) => {
          if (typeof it === 'string') return it;
          if (typeof it === 'object' && it) {
            const nome = it.nome || it.produto || it.item || 'Item';
            const qtd = it.quantidade || it.qtd || 1;
            return `${nome} x${qtd}`;
          }
          return String(it);
        })
        .join(', ');
    }
    if (typeof itens === 'string') {
      // Se for JSON válido, tenta parsear
      const s = itens.trim();
      if ((s.startsWith('{') && s.endsWith('}')) || (s.startsWith('[') && s.endsWith(']'))) {
        try {
          const parsed = JSON.parse(s);
          return itensParaTexto(parsed);
        } catch {
          return s;
        }
      }
      return s;
    }
    // Qualquer outro tipo
    try {
      return JSON.stringify(itens);
    } catch {
      return String(itens);
    }
  };

  // Carregar pedidos do Supabase
  useEffect(() => {
    const carregarPedidos = async () => {
      setErro('');
      setCarregando(true);
      try {
        // Seleciona com possíveis variações de PK
        const { data, error } = await supabase
          .from('pedido')
          .select('id_pedido, id_user_cliente, itens, status_pedido, created_at')
          .order('created_at', { ascending: false });
          console.log(data)
        if (error) {
          console.error('Erro ao carregar pedidos:', error.message);
          setErro('Falha ao carregar pedidos.');
          setPedidos([]);
          return;
        }
        const rows = data || [];
        const mapeados = rows.map((r, idx) => ({
          id: r.id_pedido ?? idx,
          numero: String(r.id_pedido ?? idx).padStart(3, '0'),
          aluno: r.id_user_cliente || '-',
          produtos: itensParaTexto(r.itens),
          rawItens: r.itens,
          status: r.status_pedido || '-',
          dataHora: formatarDataHora(r.created_at),
        }));
        setPedidos(mapeados);
      } catch (ex) {
        console.error('Exceção ao carregar pedidos:', ex);
        setErro('Erro inesperado ao carregar pedidos.');
        setPedidos([]);
      } finally {
        setCarregando(false);
      }
    };
    carregarPedidos();
  }, []);

  // Carregar nome do usuário autenticado (perfil.nome)
  useEffect(() => {
    const carregarUsuario = async () => {
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) {
          console.warn('Falha ao obter usuário autenticado:', userError.message);
          return;
        }
        const user = userData?.user;
        if (!user) return;

        const { data: perfilData, error: perfilError } = await supabase
          .from('perfil')
          .select('nome')
          .eq('id_user', user.id)
          .maybeSingle();
        if (perfilError) {
          console.warn('Falha ao carregar perfil:', perfilError.message);
          setUsuarioNome(user.email || 'USUÁRIO');
        } else {
          setUsuarioNome(perfilData?.nome || user.email || 'USUÁRIO');
        }
      } catch (ex) {
        console.warn('Exceção ao carregar usuário:', ex);
      }
    };
    carregarUsuario();
  }, []);

  const filtrarPedidos = () => {
    if (filtroAtivo === 'todos') return pedidos;
    const statusLc = (s) => (s || '').toLowerCase();
    if (filtroAtivo === 'emAndamento') return pedidos.filter(p => statusLc(p.status).includes('andament'));
    if (filtroAtivo === 'Pendente') return pedidos.filter(p => statusLc(p.status).includes('pend'));
    if (filtroAtivo === 'concluidos') return pedidos.filter(p => statusLc(p.status).includes('conclu'));
    if (filtroAtivo === 'cancelados') return pedidos.filter(p => statusLc(p.status).includes('cancel'));
    return pedidos;
  };

  const pedidosFiltrados = filtrarPedidos();

  const getStatusColor = (status) => {
    // Normaliza: remove acentos, espaços extras e coloca em minúsculas
    let s = (status || '').trim().toLowerCase();
    s = s.normalize('NFD').replace(/\p{Diacritic}/gu, '');

    if (s.includes('pend')) return 'bg-yellow-300 text-yellow-900';      // Pendente
    if (s.includes('andament')) return 'bg-blue-500 text-white';          // Em Andamento
    if (s.includes('conclu')) return 'bg-green-600 text-white';           // Concluido/Concluído
    if (s.includes('cancel')) return 'bg-red-500 text-white';             // Cancelado
    return 'bg-gray-400 text-white';                                      // Desconhecido / outro
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
  <header className="bg-[#004d9d] text-white app-header">
        <div className="flex items-center gap-4">
          <div className="border-2 border-white rounded-full p-2 w-12 h-12 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
            </svg>
          </div>
          <span className="font-semibold">{usuarioNome || 'USUÁRIO'}</span>
        </div>
        
        <nav className="flex gap-8">
          <Link to="/EscolhaAdm" className="hover:underline">ESCOLHA</Link>
          <Link to="/GerenciarPedidos" className="hover:underline">PEDIDOS</Link>
          <Link to="/GerenciarAlunos" className="hover:underline">ALUNOS</Link>
        </nav>

        <div className="flex gap-4">
          <img src={senac} alt="Senac" className="h-8" />
          <img src={sesc} alt="Sesc" className="h-8" />
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="px-8 py-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-center text-5xl font-bold text-[#004d9d] mb-8 font-lobster">
            Gerênciar Pedidos
          </h1>
          {erro && (
            <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg mb-4 text-sm">{erro}</div>
          )}
          {carregando && (
            <div className="text-center text-gray-600 mb-4">Carregando pedidos...</div>
          )}

          {/* Botões de Filtro */}
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => setFiltroAtivo('todos')}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                filtroAtivo === 'todos' 
                  ? 'bg-[#004d9d] text-white' 
                  : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFiltroAtivo('Pendente')}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                filtroAtivo === 'Pendente' 
                  ? 'bg-yellow-400 text-yellow-900' 
                  : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
              }`}
            >
              Pendente
            </button>
            <button
              onClick={() => setFiltroAtivo('concluidos')}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                filtroAtivo === 'concluidos' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
              }`}
            >
              Concluidos
            </button>
            <button
              onClick={() => setFiltroAtivo('cancelados')}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                filtroAtivo === 'cancelados' 
                  ? 'bg-red-500 text-white' 
                  : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
              }`}
            >
              Cancelados
            </button>
          </div>

          {/* Tabela de Pedidos */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-[#004d9d]">
                  <th className="py-4 px-6 text-[#004d9d] font-bold text-lg text-left">N° do Pedido</th>
                  <th className="py-4 px-6 text-[#004d9d] font-bold text-lg text-left border-l-2 border-[#004d9d]">Aluno</th>
                  <th className="py-4 px-6 text-[#004d9d] font-bold text-lg text-left border-l-2 border-[#004d9d]">Produto(s)</th>
                  <th className="py-4 px-6 text-[#004d9d] font-bold text-lg text-left border-l-2 border-[#004d9d]">Status</th>
                  <th className="py-4 px-6 text-[#004d9d] font-bold text-lg text-left border-l-2 border-[#004d9d]">Data/Hora</th>
                </tr>
              </thead>
              <tbody>
                {pedidosFiltrados.map((pedido, index) => (
                  <tr 
                    key={pedido.id} 
                    className={`border-b-2 border-[#004d9d] ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <td className="py-4 px-6 text-gray-800 font-semibold">{pedido.numero}</td>
                    <td className="py-4 px-6 text-gray-800 border-l-2 border-[#004d9d]">{pedido.aluno}</td>
                    <td className="py-4 px-6 text-gray-800 border-l-2 border-[#004d9d]">
                      <Link
                        to={`/ItensPedido/${pedido.id}`}
                        state={{ itens: pedido.rawItens, numero: pedido.numero }}
                        className="text-[#004d9d] hover:underline font-semibold"
                      >
                        veja
                      </Link>
                    </td>
                    <td className="py-4 px-6 border-l-2 border-[#004d9d]">
                      <span className={`px-4 py-1 rounded-full text-sm font-semibold ${getStatusColor(pedido.status)}`}>
                        {pedido.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-800 border-l-2 border-[#004d9d]">{pedido.dataHora}</td>
                  </tr>
                ))}
                
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default GerenciarPedidos;