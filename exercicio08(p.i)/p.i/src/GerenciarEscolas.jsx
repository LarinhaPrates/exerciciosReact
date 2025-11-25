import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';
import senac from './Image/senacBranco.png';
import sesc from './Image/sescBranco.png';

function GerenciarEscolas() {
  const [escolas, setEscolas] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [erroDelete, setErroDelete] = useState(null);
  // Nome do usuário
  const [userNome, setUserNome] = useState('');
  const [carregandoUserNome, setCarregandoUserNome] = useState(true);

  // Carrega escolas do Supabase
  useEffect(() => {
    const carregar = async () => {
      setLoading(true);
      setErro(null);
      try {
        const { data, error } = await supabase
          .from('escola')
          .select('id_escola, nome_escola, cidade, admResponsavel');
          console.log(data);
        if (error) throw error;
        // Normaliza campos para UI
        const normalizados = (data || []).map(row => ({
          id: row.id_escola,
          nome: row.nome_escola,
          cidade: row.cidade || '-',
          administrador: row.admResponsavel || '—'
        }));
        // Ordena por nome
        normalizados.sort((a, b) => a.nome.localeCompare(b.nome));
        setEscolas(normalizados);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('Falha ao carregar escolas:', e);
        setErro('Não foi possível carregar as escolas');
      } finally {
        setLoading(false);
      }
    };
    carregar();
  }, []);

  // Carrega nome do usuário autenticado
  useEffect(() => {
    let unsubscribe = null;
    const carregarUsuario = async () => {
      setCarregandoUserNome(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setUserNome('');
          return;
        }
        const { data: perfil, error: erroPerfil } = await supabase
          .from('perfil')
          .select('nome, nome_completo, username, email')
          .eq('id_user', user.id)
          .single();
        if (!erroPerfil && perfil) {
          const nomeDisplay = perfil.nome || perfil.nome_completo || perfil.username || (perfil.email ? perfil.email.split('@')[0] : '') || 'Usuário';
          setUserNome(nomeDisplay);
        } else {
          const meta = user.user_metadata || {};
          const nomeDisplay = meta.nome || meta.nome_completo || meta.username || (user.email ? user.email.split('@')[0] : 'Usuário');
          setUserNome(nomeDisplay);
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('Falha ao carregar nome do usuário (GerenciarEscolas):', e);
        setUserNome('Usuário');
      } finally {
        setCarregandoUserNome(false);
      }
    };
    carregarUsuario();
    unsubscribe = supabase.auth.onAuthStateChange((_evt, session) => {
      if (!session?.user) {
        setUserNome('');
      } else {
        carregarUsuario();
      }
    }).data.subscription.unsubscribe;
    return () => { if (unsubscribe) unsubscribe(); };
  }, []);

  const handleEdit = (id) => {
    navigate(`/EditarEscola/${id}`);
  };

  const handleDelete = async (id) => {
    setErroDelete(null);
    const escola = escolas.find(esc => esc.id === id);
    if (!escola) return;
    if (!window.confirm(`Tem certeza que deseja excluir a escola \"${escola.nome}\"?`)) return;
    setDeletingId(id);
    try {
      // Para confirmar retorno, usamos select após delete
      const { error, count } = await supabase
        .from('escola')
        .delete({ count: 'exact' })
        .eq('id_escola', id);
      if (error) throw error;
      if (count === 0) {
        // Pode ser RLS bloqueando ou id já removido
        setErroDelete('Nenhuma linha removida (verifique permissões/RLS).');
      } else {
        setEscolas(prev => prev.filter(esc => esc.id !== id));
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('Erro ao excluir escola:', e);
      setErroDelete(e.message || 'Falha ao excluir.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCriarEscola = () => {
    // Redirecionar para a página de criação de escola
    window.location.href = '/CriarEscola';
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
          <span className="font-semibold">{carregandoUserNome ? '...' : (userNome || 'Usuário')}</span>
        </div>
        
        <nav className="flex gap-8">
          <a href="/GerenciarEscolas" className="hover:underline ">ESCOLA</a>
          <a href="/GerenciarAdm" className="hover:underline">ADMINISTRADOR</a>
          <a href="/GerenciarLanchonete" className="hover:underline">LANCHONETES</a>
          <a href="/RelatoriosGerais" className="hover:underline">RELATÓRIOS</a>
        </nav>

        <div className="flex gap-4">
          <img src={senac} alt="Senac" className="h-8" />
          <img src={sesc} alt="Sesc" className="h-8" />
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="px-8 py-12">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-center text-5xl font-bold text-[#004d9d] mb-8 font-lobster">
            Gerênciar Escolas
          </h1>

          {/* Botão Criar Escola */}
          <div className="flex justify-center mb-8">
            <button
              onClick={handleCriarEscola}
              className="bg-[#004d9d] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#003d7d] transition-colors flex items-center gap-2"
            >
              <span className="text-2xl">+</span>
              Criar Escola
            </button>
          </div>

          {/* Estado de carregamento / erro */}
          {loading && (
            <p className="text-center text-gray-600 mb-4">Carregando escolas...</p>
          )}
          {erro && (
            <p className="text-center text-red-600 mb-4">{erro}</p>
          )}
          {erroDelete && (
            <p className="text-center text-red-600 mb-4">{erroDelete}</p>
          )}
          {/* Tabela de Escolas */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-[#004d9d]">
                  <th className="py-4 px-6 text-[#004d9d] font-bold text-lg text-left">Nome da Escola</th>
                  <th className="py-4 px-6 text-[#004d9d] font-bold text-lg text-left border-l-2 border-[#004d9d]">Cidade</th>
                  <th className="py-4 px-6 text-[#004d9d] font-bold text-lg text-left border-l-2 border-[#004d9d]">Administador</th>
                  <th className="py-4 px-6 text-[#004d9d] font-bold text-lg text-center border-l-2 border-[#004d9d]">Ações</th>
                </tr>
              </thead>
              <tbody>
                {escolas.map((escola, index) => (
                  <tr 
                    key={escola.id} 
                    className={`border-b-2 border-[#004d9d] ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <td className="py-4 px-6 text-gray-800">{escola.nome}</td>
                    <td className="py-4 px-6 text-gray-800 border-l-2 border-[#004d9d]">{escola.cidade}</td>
                    <td className="py-4 px-6 text-gray-800 border-l-2 border-[#004d9d]">{escola.administrador}</td>
                    <td className="py-4 px-6 border-l-2 border-[#004d9d]">
                      <div className="flex justify-center gap-4">
                        {/* Botão Editar */}
                        <button
                          onClick={() => handleEdit(escola.id)}
                          className="text-gray-600 hover:text-[#004d9d] transition-colors"
                          title="Editar"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        {/* Botão Excluir */}
                        <button
                          onClick={() => handleDelete(escola.id)}
                          disabled={deletingId === escola.id}
                          className={`text-gray-600 transition-colors ${deletingId === escola.id ? 'opacity-40 cursor-not-allowed' : 'hover:text-red-600'}`}
                          title="Excluir"
                        >
                          {deletingId === escola.id ? (
                            <svg className="w-6 h-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="10" strokeWidth="4" className="opacity-25" />
                              <path className="opacity-75" strokeWidth="4" d="M4 12a8 8 0 018-8" />
                            </svg>
                          ) : (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {(!loading && escolas.length === 0) && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-gray-500">Nenhuma escola cadastrada.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default GerenciarEscolas;