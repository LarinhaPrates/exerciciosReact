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
  const [lanchonetes, setLanchonetes] = useState([]);
  const [lanchonetesSelecionada, setLanchoneteSelecionada] = useState('todas');

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

  // Carregar lanchonetes
  useEffect(() => {
    const carregarLanchonetes = async () => {
      try {
        const { data, error } = await supabase
          .from('lanchonete')
          .select('id_lanchonete, nome_lanchonete')
          .order('nome_lanchonete', { ascending: true });
        
        if (!error && data) {
          setLanchonetes(data);
        }
      } catch (err) {
        console.warn('Erro ao carregar lanchonetes:', err);
      }
    };
    carregarLanchonetes();
  }, []);

  // Carregar pedidos do Supabase
  useEffect(() => {
    const carregarPedidos = async () => {
      setErro('');
      setCarregando(true);
      try {
        // Primeiro, buscar todos os pedidos (incluindo id_lanchonete se existir)
        const { data, error } = await supabase
          .from('pedido')
          .select('id_pedido, id_user_cliente, itens, status_pedido, created_at, id_lanchonete')
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error('Erro ao carregar pedidos:', error.message);
          setErro('Falha ao carregar pedidos.');
          setPedidos([]);
          return;
        }
        
        const rows = data || [];
        
        // Buscar os nomes dos alunos para cada pedido
        const idsUnicos = [...new Set(rows.map(r => r.id_user_cliente).filter(Boolean))];
        const perfisMap = {};
        
        if (idsUnicos.length > 0) {
          // Tentar buscar perfis por id_user (UUID do auth)
          const { data: perfisData } = await supabase
            .from('perfil')
            .select('id_user, nome, email')
            .in('id_user', idsUnicos);
            
          if (perfisData && perfisData.length > 0) {
            perfisData.forEach(p => {
              perfisMap[p.id_user] = p.nome;
            });
          }
          
          // Se não encontrou nada, buscar por email (caso id_user_cliente seja email)
          if (perfisData && perfisData.length === 0) {
            const { data: perfilsPorEmail } = await supabase
              .from('perfil')
              .select('email, nome')
              .in('email', idsUnicos);
            
            if (perfilsPorEmail && perfilsPorEmail.length > 0) {
              perfilsPorEmail.forEach(p => {
                perfisMap[p.email] = p.nome;
              });
            }
          }
          
        }
        
        const mapeados = rows.map((r, idx) => ({
          id: r.id_pedido ?? idx,
          numero: String(r.id_pedido ?? idx).padStart(3, '0'),
          aluno: perfisMap[r.id_user_cliente] || 'Usuário sem cadastro',
          produtos: itensParaTexto(r.itens),
          rawItens: r.itens,
          status: r.status_pedido || '-',
          dataHora: formatarDataHora(r.created_at),
          idLanchonete: r.id_lanchonete,
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
    let resultado = pedidos;

    // Filtrar por status
    if (filtroAtivo !== 'todos') {
      const statusLc = (s) => (s || '').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
      if (filtroAtivo === 'emAndamento') resultado = resultado.filter(p => statusLc(p.status).includes('andament'));
      else if (filtroAtivo === 'Pendente') resultado = resultado.filter(p => 
        statusLc(p.status).includes('pend') || 
        statusLc(p.status).includes('esperando') ||
        statusLc(p.status).includes('pagamento')
      );
      else if (filtroAtivo === 'concluidos') resultado = resultado.filter(p => statusLc(p.status).includes('conclu'));
      else if (filtroAtivo === 'cancelados') resultado = resultado.filter(p => statusLc(p.status).includes('cancel'));
    }

    // Filtrar por lanchonete
    if (lanchonetesSelecionada !== 'todas') {
      const idLanchonete = parseInt(lanchonetesSelecionada, 10);
      resultado = resultado.filter(p => p.idLanchonete === idLanchonete);
    }

    return resultado;
  };

  const pedidosFiltrados = filtrarPedidos();

  const getStatusColor = (status) => {
    // Normaliza: remove acentos, espaços extras e coloca em minúsculas
    let s = (status || '').trim().toLowerCase();
    s = s.normalize('NFD').replace(/\p{Diacritic}/gu, '');

    if (s.includes('esperando') || s.includes('pagamento')) return 'bg-yellow-300 text-yellow-900'; // Esperando Pagamento
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

          {/* Filtro por Lanchonete */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-3">
              <label htmlFor="filtroLanchonete" className="text-lg font-semibold text-[#004d9d]">
                Filtrar por Lanchonete:
              </label>
              <select
                id="filtroLanchonete"
                value={lanchonetesSelecionada}
                onChange={(e) => setLanchoneteSelecionada(e.target.value)}
                className="px-4 py-2 border-2 border-[#004d9d] rounded-lg font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#004d9d] bg-white"
              >
                <option value="todas">Todas as Lanchonetes</option>
                {lanchonetes.map((lanch) => (
                  <option key={lanch.id_lanchonete} value={lanch.id_lanchonete}>
                    {lanch.nome_lanchonete}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Botões de Filtro por Status */}
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
              Esperando Pagamento
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