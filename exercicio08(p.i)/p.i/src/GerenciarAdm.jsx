import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import senac from './Image/senacBranco.png';
import sesc from './Image/sescBranco.png';
import { supabase } from '../lib/supabase';
import { useToast } from './ToastContext';

function GerenciarAdm() {
  const navigate = useNavigate();
  const toast = useToast();
  const [administradores, setAdministradores] = useState([]); // carregados da tabela perfil
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [deletingId, setDeletingId] = useState(null); // id sendo excluído
  const [userNome, setUserNome] = useState('');
  const [carregandoUserNome, setCarregandoUserNome] = useState(true);

  // Tornamos a função reutilizável para recarregar após exclusões
  const carregarAdmins = async () => {
    setLoading(true);
    setErro(null);
    // Busca perfis tipoConta = 'adm'
    const { data: perfis, error: perfisError } = await supabase
      .from('perfil')
      .select('id_user, nome, email, id_escola')
      .eq('tipoConta', 'adm')
      .order('nome', { ascending: true });
    if (perfisError) {
      setErro(perfisError.message);
      setLoading(false);
      return;
    }
    // Busca nomes das escolas para mapear
    const { data: escolasData, error: escolasError } = await supabase
      .from('escola')
      .select('id_escola, nome_escola');
    if (escolasError) {
      // Se der erro nas escolas ainda mostramos os admins sem nome de escola
      // eslint-disable-next-line no-console
      console.warn('Erro ao carregar escolas:', escolasError.message);
    }
    const escolasMap = (escolasData || []).reduce((acc, esc) => {
      acc[esc.id_escola] = esc.nome_escola;
      return acc;
    }, {});
    // Monta lista final
    const lista = (perfis || []).map(p => ({
      id: p.id_user, // usar id_user como identificador
      nome: p.nome || '(Sem nome)',
      email: p.email || '(Sem email)',
      escolaVinculada: escolasMap[p.id_escola] || '—'
    }));
    setAdministradores(lista);
    setLoading(false);
  };

  useEffect(() => {
    carregarAdmins();
  }, []);

  // Carrega nome do usuário autenticado para o header
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
      if (!perfilError && perfilData?.nome) {
        setUserNome(perfilData.nome);
      } else {
        setUserNome(userData.user.user_metadata?.nomeCompleto || userData.user.email || 'Usuário');
      }
      setCarregandoUserNome(false);
    };
    carregarUsuario();
  }, []);

  const handleEdit = (id) => {
    navigate(`/EditarAdm/${id}`);
  };

  const handleDelete = async (id) => {
    if (deletingId) return; // evita múltiplos cliques
    const admin = administradores.find(adm => adm.id === id);
    if (!admin) return;
    if (!window.confirm(`Tem certeza que deseja excluir ${admin.nome}? Esta ação removerá o perfil definitivamente.`)) return;
    setDeletingId(id);
    const { data: deletedRows, error } = await supabase
      .from('perfil')
      .delete()
      .eq('id_user', id)
      .eq('tipoConta', 'adm')
      .select('id_user'); // retorna linhas afetadas para checar se algo foi apagado
    if (error) {
      toast.error(`Erro ao excluir: ${error.message}`);
      setDeletingId(null);
      return;
    }
    if (!deletedRows || deletedRows.length === 0) {
      toast.warning('Nenhuma linha foi excluída. Verifique permissões (RLS) ou se o registro existe.');
      // Recarrega lista para garantir sincronização
      await carregarAdmins();
      setDeletingId(null);
      return;
    }
    // Recarrega a lista a partir do backend para evitar divergência
    await carregarAdmins();
    setDeletingId(null);
    toast.success('Administrador excluído com sucesso!');
  };

  const handleCadastrar = () => {
    navigate('/CadastrarAdm');
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
        <div className="max-w-6xl mx-auto">
          <h1 className="text-center text-5xl font-bold text-[#004d9d] mb-8 font-lobster">
            Gerenciar Administradores
          </h1>

          {/* Botão Cadastrar */}
          <div className="flex justify-center mb-8">
            <button
              onClick={handleCadastrar}
              className="bg-[#004d9d] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#003d7d] transition-colors flex items-center gap-2"
            >
              <span className="text-2xl">+</span>
              Cadastrar Admininstrador
            </button>
          </div>

          {/* Tabela de Administradores */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-[#004d9d]">
                  <th className="py-4 px-6 text-[#004d9d] font-bold text-lg text-left">Nome</th>
                  <th className="py-4 px-6 text-[#004d9d] font-bold text-lg text-left border-l-2 border-[#004d9d]">E-mail</th>
                  <th className="py-4 px-6 text-[#004d9d] font-bold text-lg text-left border-l-2 border-[#004d9d]">Escola Vinculada</th>
                  <th className="py-4 px-6 text-[#004d9d] font-bold text-lg text-center border-l-2 border-[#004d9d]">Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr className="border-b-2 border-[#004d9d]"><td className="py-4 px-6" colSpan={4}>Carregando administradores...</td></tr>
                )}
                {erro && (
                  <tr className="border-b-2 border-[#004d9d]"><td className="py-4 px-6 text-red-600" colSpan={4}>Erro: {erro}</td></tr>
                )}
                {!loading && !erro && administradores.length === 0 && (
                  <tr className="border-b-2 border-[#004d9d]"><td className="py-4 px-6" colSpan={4}>Nenhum administrador encontrado.</td></tr>
                )}
                {administradores.map((admin, index) => (
                  <tr 
                    key={admin.id} 
                    className={`border-b-2 border-[#004d9d] ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <td className="py-4 px-6 text-gray-800">{admin.nome}</td>
                    <td className="py-4 px-6 text-gray-800 border-l-2 border-[#004d9d]">{admin.email}</td>
                    <td className="py-4 px-6 text-gray-800 border-l-2 border-[#004d9d]">{admin.escolaVinculada}</td>
                    <td className="py-4 px-6 border-l-2 border-[#004d9d]">
                      <div className="flex justify-center gap-4">
                        {/* Botão Editar */}
                        <button
                          onClick={() => handleEdit(admin.id)}
                          className="text-gray-600 hover:text-[#004d9d] transition-colors"
                          title="Editar"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        {/* Botão Excluir */}
                        <button
                          onClick={() => handleDelete(admin.id)}
                          className={`transition-colors ${deletingId === admin.id ? 'text-red-400 cursor-not-allowed' : 'text-gray-600 hover:text-red-600'}`}
                          title={deletingId === admin.id ? 'Excluindo...' : 'Excluir'}
                          disabled={deletingId === admin.id}
                        >
                          {deletingId === admin.id ? (
                            <svg className="w-6 h-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="10" strokeWidth="4" className="opacity-25" />
                              <path className="opacity-75" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M4 12a8 8 0 018-8" />
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
                
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default GerenciarAdm;