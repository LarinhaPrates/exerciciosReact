import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import senac from './Image/senacBranco.png';
import sesc from './Image/sescBranco.png';
import { useToast } from './ToastContext';

function GerenciarLanchonete() {
  const navigate = useNavigate();
  const toast = useToast();
  const [lanchonetes, setLanchonetes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  const [escolasMap, setEscolasMap] = useState({});
  const [adminsMap, setAdminsMap] = useState({});
  const [deletingId, setDeletingId] = useState(null);

  const [userNome, setUserNome] = useState('');
  const [carregandoUserNome, setCarregandoUserNome] = useState(true);

  // Carrega nome do usuário logado para header
  useEffect(() => {
    const carregarUsuario = async () => {
      setCarregandoUserNome(true);
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        setUserNome('Usuário');
        setCarregandoUserNome(false);
        return;
      }
      const userId = userData.user.id;
      const { data: perfilData, error: perfilError } = await supabase
        .from('perfil')
        .select('nome')
        .eq('id_user', userId)
        .limit(1)
        .maybeSingle();
      if (!perfilError && perfilData?.nome) setUserNome(perfilData.nome);
      else setUserNome(userData.user.user_metadata?.nomeCompleto || userData.user.email || 'Usuário');
      setCarregandoUserNome(false);
    };
    carregarUsuario();
  }, []);

  // Carrega escolas e admins para mapear nomes
  useEffect(() => {
    const carregarReferencias = async () => {
      const [{ data: escolasData }, { data: adminsData }] = await Promise.all([
        supabase.from('escola').select('id_escola, nome_escola'),
        supabase.from('perfil').select('id_user, nome, email').eq('tipoConta', 'adm')
      ]);
      const escolasObj = {};
      (escolasData || []).forEach(e => { escolasObj[e.id_escola] = e.nome_escola; });
      setEscolasMap(escolasObj);
      const adminsObj = {};
      (adminsData || []).forEach(a => { adminsObj[a.id_user] = a.nome || a.email; });
      setAdminsMap(adminsObj);
    };
    carregarReferencias();
  }, []);

  // Carrega lanchonetes
  useEffect(() => {
    const carregarLanchonetes = async () => {
      setLoading(true);
      // Seleciona apenas colunas usadas; evita ordenar por coluna inexistente
      const { data, error } = await supabase
        .from('lanchonete')
        .select('id_lanchonete, nome_lanchonete, id_escola, id_user');
      if (error) setErro(error.message); else setLanchonetes(data || []);
      setLoading(false);
    };
    carregarLanchonetes();
  }, []);

  const handleEdit = (id) => {
    navigate(`/EditarLanchonete/${id}`);
  };

  const handleDelete = async (id) => {
    if (deletingId) return; // evita múltiplos cliques
    const l = lanchonetes.find(item => (item.id_lanchonete ?? item.id) === id);
    if (!l) return;
    const nome = l.nome_lanchonete || l.nome || 'Esta lanchonete';
    if (!window.confirm(`Tem certeza que deseja excluir ${nome}?`)) return;
    setDeletingId(id);
    try {
      // Descobre nome da coluna de chave primária
      const pkColumn = l.id_lanchonete !== undefined ? 'id_lanchonete' : 'id';
      const { error } = await supabase
        .from('lanchonete')
        .delete()
        .eq(pkColumn, id);
      if (error) throw new Error(error.message);
      // Remover da lista após sucesso
      setLanchonetes(prev => prev.filter(item => (item.id_lanchonete ?? item.id) !== id));
      toast.success('Lanchonete excluída com sucesso!');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      toast.error(`Erro ao excluir: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleCriarLanchonete = () => {
    navigate('/CriarLanchonete');
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
                    <Link to="/GerenciarEscolas" className="hover:underline">ESCOLA</Link>
                    <Link to="/GerenciarAdm" className="hover:underline">ADMINISTRADOR</Link>
                    <Link to="/GerenciarLanchonete" className="hover:underline">LANCHONETES</Link>
                    <Link to="/RelatoriosGerais" className="hover:underline">RELATÓRIOS</Link>
                    <Link to="/GerenciarAlunos" className="hover:underline">ALUNOS</Link>
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
            Gerênciar Lanchonetes
          </h1>

          {/* Botão Criar Lanchonete */}
          <div className="flex justify-center mb-8">
            <button
              onClick={handleCriarLanchonete}
              className="bg-[#004d9d] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#003d7d] transition-colors flex items-center gap-2"
            >
              <span className="text-2xl">+</span>
              Criar Lanchonete
            </button>
          </div>

          {/* Tabela de Lanchonetes */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-[#004d9d]">
                  <th className="py-4 px-6 text-[#004d9d] font-bold text-lg text-left">Nome</th>
                  <th className="py-4 px-6 text-[#004d9d] font-bold text-lg text-left border-l-2 border-[#004d9d]">Escola</th>
                  <th className="py-4 px-6 text-[#004d9d] font-bold text-lg text-left border-l-2 border-[#004d9d]">
                    Administador<br />Responsável
                  </th>
                  <th className="py-4 px-6 text-[#004d9d] font-bold text-lg text-center border-l-2 border-[#004d9d]">Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan="4" className="py-6 px-6 text-center text-gray-600">Carregando lanchonetes...</td></tr>
                )}
                {(!loading && erro) && (
                  <tr><td colSpan="4" className="py-6 px-6 text-center text-red-600">Erro: {erro}</td></tr>
                )}
                {(!loading && !erro && lanchonetes.length === 0) && (
                  <tr><td colSpan="4" className="py-6 px-6 text-center text-gray-600">Nenhuma lanchonete cadastrada.</td></tr>
                )}
                {(!loading && !erro) && lanchonetes.map((lanchonete, index) => {
                  const id = lanchonete.id_lanchonete ?? lanchonete.id; // flexível caso schema use id
                  const nome = lanchonete.nome_lanchonete || lanchonete.nome || 'Sem nome';
                  const escolaNome = escolasMap[lanchonete.id_escola] || '—';
                  const adminNome = adminsMap[lanchonete.id_user] || '—';
                  return (
                    <tr
                      key={id}
                      className={`border-b-2 border-[#004d9d] ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                    >
                      <td className="py-4 px-6 text-gray-800">{nome}</td>
                      <td className="py-4 px-6 text-gray-800 border-l-2 border-[#004d9d]">{escolaNome}</td>
                      <td className="py-4 px-6 text-gray-800 border-l-2 border-[#004d9d]">{adminNome}</td>
                      <td className="py-4 px-6 border-l-2 border-[#004d9d]">
                        <div className="flex justify-center gap-4">
                          <button
                            onClick={() => handleEdit(id)}
                            className="text-gray-600 hover:text-[#004d9d] transition-colors"
                            title="Editar"
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(id)}
                            disabled={deletingId === id}
                            className={`text-gray-600 transition-colors ${deletingId === id ? 'opacity-50 cursor-not-allowed' : 'hover:text-red-600'}`}
                            title={deletingId === id ? 'Excluindo...' : 'Excluir'}
                          >
                            {deletingId === id ? (
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
                  );
                })}
                
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default GerenciarLanchonete;