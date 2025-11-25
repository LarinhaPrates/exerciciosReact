import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import senac from './Image/senacBranco.png';
import sesc from './Image/sescBranco.png';

function GerenciarAlunos() {
  const [alunos, setAlunos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [usuarioNome, setUsuarioNome] = useState('');

  useEffect(() => {
    const carregarAlunos = async () => {
      setErro('');
      setCarregando(true);
      try {
        // Buscar apenas perfis com tipoConta = 'aluno' (case-insensitive)
        const { data, error } = await supabase
          .from('perfil')
          .select('id_user, nome, email, tipoConta, id_escola')
          .eq('tipoConta', 'aluno')
          .order('nome', { ascending: true });
        if (error) {
          console.error('Erro ao carregar alunos:', error.message);
          setErro('Falha ao carregar alunos.');
        } else {
          const perfis = data || [];
          const userIds = perfis.map((p) => p.id_user).filter(Boolean);

          // Mapa de contagem de pedidos por usuário (com fallback de coluna)
          let pedidosCountMap = {};
          if (userIds.length > 0) {
            const tentarConsulta = async (col) => {
              try {
                const { data: dados, error: err } = await supabase
                  .from('pedido')
                  .select(col)
                  .in(col, userIds);
                if (err) return { ok: false, error: err };
                return { ok: true, data: dados, col };
              } catch (ex) {
                return { ok: false, error: ex };
              }
            };

            // Tenta nas possíveis colunas que relacionam pedido ao usuário
            let res = await tentarConsulta('id_user_cliente');
            if (!res.ok || !res.data || res.data.length === 0) {
              res = await tentarConsulta('id_user');
            }
            if (!res.ok || !res.data || res.data.length === 0) {
              res = await tentarConsulta('id_cliente');
            }

            if (res.ok && res.data && res.data.length > 0) {
              pedidosCountMap = res.data.reduce((acc, ped) => {
                const uid = ped[res.col];
                if (!uid) return acc;
                acc[uid] = (acc[uid] || 0) + 1;
                return acc;
              }, {});
            } else if (!res.ok && res.error) {
              console.warn('Falha ao buscar pedidos:', res.error.message || res.error);
            }
          }

          const mapeados = perfis.map((p) => ({
            id: p.id_user,
            nome: p.nome || '-',
            id_escola: p.id_escola ?? '-',
            pedidosFeitos: pedidosCountMap[p.id_user] || 0,
            status: 'Ativo',
          }));
          setAlunos(mapeados);
        }
      } catch (ex) {
        console.error('Exceção ao carregar alunos:', ex);
        setErro('Erro inesperado ao carregar alunos.');
      } finally {
        setCarregando(false);
      }
    };
    carregarAlunos();
  }, []);

  // Carregar nome do usuário autenticado a partir da tabela perfil
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
          console.warn('Falha ao carregar nome do perfil:', perfilError.message);
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

  const handleEdit = (id) => {
    // Aqui você pode redirecionar para uma página de edição ou abrir um modal
    console.log('Editar aluno com ID:', id);
    const aluno = alunos.find(a => a.id === id);
    alert(`Editar aluno: ${aluno.nome}`);
    // window.location.href = `/editar-aluno/${id}`;
  };

  const handleDelete = async (id) => {
    const aluno = alunos.find((a) => a.id === id);
    if (!aluno) {
      setErro('Aluno não encontrado.');
      return;
    }
    const confirmar = window.confirm(`Tem certeza que deseja excluir ${aluno.nome}?`);
    if (!confirmar) return;

    setErro('');
    try {
      // Tenta excluir pelo campo id_user (principal usado na listagem)
      let { error } = await supabase
        .from('perfil')
        .delete()
        .eq('id_user', id);

      // Se falhar, tenta pelo campo id (alguns esquemas usam id como PK)
      if (error) {
        console.warn('Falha ao excluir por id_user, tentando por id:', error.message);
        const { error: fallbackError } = await supabase
          .from('perfil')
          .delete()
          .eq('id', id);
        if (fallbackError) {
          console.error('Erro ao excluir perfil:', fallbackError.message);
          setErro('Falha ao excluir aluno. Verifique se há pedidos vinculados ou permissões insuficientes.');
          return;
        }
      }

      // Remover da UI após sucesso
      setAlunos((prev) => prev.filter((a) => a.id !== id));
      alert('Aluno excluído com sucesso!');
    } catch (ex) {
      console.error('Exceção ao excluir aluno:', ex);
      setErro('Erro inesperado ao tentar excluir aluno.');
    }
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
          <a href="/EscolhaAdm" className="hover:underline">ESCOLHA</a>
          <a href="/GerenciarPedidos" className="hover:underline">PEDIDOS</a>
          <a href="/GerenciarAlunos" className="hover:underline">ALUNOS</a>
        </nav>

        <div className="flex gap-4">
          <img src={senac} alt="Senac" className="h-8" />
          <img src={sesc} alt="Sesc" className="h-8" />
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="px-8 py-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-center text-5xl font-bold text-[#004d9d] mb-12 font-lobster">
            Gerênciar Alunos
          </h1>
          {erro && (
            <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg mb-4 text-sm">{erro}</div>
          )}
          {carregando && (
            <div className="text-center text-gray-600 mb-4">Carregando alunos...</div>
          )}

          {/* Tabela de Alunos */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-[#004d9d]">
                  <th className="py-4 px-6 text-[#004d9d] font-bold text-lg text-left">Nome do Aluno</th>
                  <th className="py-4 px-6 text-[#004d9d] font-bold text-lg text-left border-l-2 border-[#004d9d]">Escola</th>
                  <th className="py-4 px-6 text-[#004d9d] font-bold text-lg text-left border-l-2 border-[#004d9d]">Pedidos Feitos</th>
                  <th className="py-4 px-6 text-[#004d9d] font-bold text-lg text-left border-l-2 border-[#004d9d]">Status</th>
                  <th className="py-4 px-6 text-[#004d9d] font-bold text-lg text-center border-l-2 border-[#004d9d]">Ações</th>
                </tr>
              </thead>
              <tbody>
                {alunos.length === 0 && !carregando && (
                  <tr>
                    <td colSpan={5} className="py-6 px-6 text-center text-gray-500">Nenhum aluno cadastrado.</td>
                  </tr>
                )}
                {alunos.map((aluno, index) => (
                  <tr 
                    key={aluno.id} 
                    className={`border-b-2 border-[#004d9d] ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <td className="py-4 px-6 text-gray-800">{aluno.nome}</td>
                    <td className="py-4 px-6 text-gray-800 border-l-2 border-[#004d9d]">{aluno.id_escola}</td>
                    <td className="py-4 px-6 text-gray-800 border-l-2 border-[#004d9d]">{aluno.pedidosFeitos}</td>
                    <td className={`py-4 px-6 border-l-2 border-[#004d9d] ${
                      aluno.status === 'Ativo' ? 'text-green-600' : 'text-red-600'
                    } font-semibold`}>
                      {aluno.status}
                    </td>
                    <td className="py-4 px-6 border-l-2 border-[#004d9d]">
                      <div className="flex justify-center gap-4">
                        {/* Botão Excluir */}
                        <button
                          onClick={() => handleDelete(aluno.id)}
                          className="text-gray-600 hover:text-red-600 transition-colors"
                          title="Excluir"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
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

export default GerenciarAlunos;