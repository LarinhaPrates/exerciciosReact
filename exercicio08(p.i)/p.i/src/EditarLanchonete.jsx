import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import senac from './Image/senacBranco.png';
import sesc from './Image/sescBranco.png';
import { useToast } from './ToastContext';

function EditarLanchonete() {
  const { id } = useParams(); // id ou id_lanchonete
  const toast = useToast();
  const [formData, setFormData] = useState({
    nomeLanchonete: '',
    escolaVinculada: '', // id_escola
    administradorResponsavel: '', // id_user do admin
    descricao: ''
  });
  const [carregandoLanchonete, setCarregandoLanchonete] = useState(true);
  const [erroLanchonete, setErroLanchonete] = useState(null);

  const [escolas, setEscolas] = useState([]);
  const [loadingEscolas, setLoadingEscolas] = useState(true);
  const [erroEscolas, setErroEscolas] = useState(null);

  const [admins, setAdmins] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [erroAdmins, setErroAdmins] = useState(null);

  const [submitting, setSubmitting] = useState(false);

  const [userNome, setUserNome] = useState('');
  const [carregandoUserNome, setCarregandoUserNome] = useState(true);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // Carrega dados da lanchonete para edição
  useEffect(() => {
    const carregarLanchonete = async () => {
      if (!id) {
        setErroLanchonete('ID não fornecido.');
        setCarregandoLanchonete(false);
        return;
      }
      setCarregandoLanchonete(true);
      let data, error;
      // 1ª tentativa: coluna id_lanchonete
      ({ data, error } = await supabase
        .from('lanchonete')
        .select('id_lanchonete, nome_lanchonete, id_escola, id_user')
        .eq('id_lanchonete', id)
        .maybeSingle());
      // Se erro mencionar coluna inexistente, tenta fallback para 'id'
      if (error && /id_lanchonete/.test(error.message)) {
        ({ data, error } = await supabase
          .from('lanchonete')
          .select('id, nome_lanchonete, id_escola, id_user')
          .eq('id', id)
          .maybeSingle());
      }
      if (error) setErroLanchonete(error.message);
      else if (data) {
        setFormData(f => ({
          ...f,
          nomeLanchonete: data.nome_lanchonete || '',
          escolaVinculada: data.id_escola || '',
          administradorResponsavel: data.id_user || ''
        }));
      } else setErroLanchonete('Lanchonete não encontrada.');
      setCarregandoLanchonete(false);
    };
    carregarLanchonete();
  }, [id]);

  // Carrega escolas
  useEffect(() => {
    const carregarEscolas = async () => {
      setLoadingEscolas(true);
      const { data, error } = await supabase
        .from('escola')
        .select('id_escola, nome_escola')
        .order('nome_escola', { ascending: true });
      if (error) setErroEscolas(error.message); else setEscolas(data || []);
      setLoadingEscolas(false);
    };
    carregarEscolas();
  }, []);

  // Carrega administradores
  useEffect(() => {
    const carregarAdmins = async () => {
      setLoadingAdmins(true);
      const { data, error } = await supabase
        .from('perfil')
        .select('id_user, nome, email, id_escola')
        .eq('tipoConta', 'adm')
        .order('nome', { ascending: true });
      if (error) setErroAdmins(error.message); else setAdmins(data || []);
      setLoadingAdmins(false);
    };
    carregarAdmins();
  }, []);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting || carregandoLanchonete) return;
    if (!id) { toast.error('ID inválido.'); return; }
    if (!formData.nomeLanchonete || !formData.escolaVinculada || !formData.administradorResponsavel) {
      toast.warning('Por favor, preencha nome, escola e administrador.');
      return;
    }
    setSubmitting(true);
    try {
      let updateError;
      // 1ª tentativa: id_lanchonete
      ({ error: updateError } = await supabase
        .from('lanchonete')
        .update({
          nome_lanchonete: formData.nomeLanchonete,
          id_escola: formData.escolaVinculada,
          id_user: formData.administradorResponsavel
        })
        .eq('id_lanchonete', id));
      if (updateError && /id_lanchonete/.test(updateError.message)) {
        ({ error: updateError } = await supabase
          .from('lanchonete')
          .update({
            nome_lanchonete: formData.nomeLanchonete,
            id_escola: formData.escolaVinculada,
            id_user: formData.administradorResponsavel
          })
          .eq('id', id));
      }
      if (updateError) throw new Error(updateError.message);
      toast.success('Lanchonete atualizada com sucesso!');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      toast.error(`Erro ao atualizar lanchonete: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (submitting) return;
    window.history.back();
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
      <main className="flex items-center justify-center py-12 px-4">
        <div className="bg-white rounded-3xl shadow-xl p-12 w-full max-w-2xl">
          <h1 className="text-center text-5xl font-bold text-[#004d9d] mb-10 font-lobster">
            Editar Lanchonete
          </h1>

          {erroLanchonete && <p className="text-sm text-red-600 mb-4">Erro: {erroLanchonete}</p>}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nome da Lanchonete */}
            <div>
              <label htmlFor="nomeLanchonete" className="block text-gray-700 font-medium mb-2">
                Nome da Lanchonete
              </label>
              <input
                type="text"
                id="nomeLanchonete"
                name="nomeLanchonete"
                value={formData.nomeLanchonete}
                onChange={handleChange}
                placeholder="Nome"
                disabled={carregandoLanchonete}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004d9d] focus:border-transparent disabled:bg-gray-100"
              />
            </div>

            {/* Escola Vinculada */}
            <div>
              <label htmlFor="escolaVinculada" className="block text-gray-700 font-medium mb-2">Escola Vinculada</label>
              {erroEscolas && <p className="text-sm text-red-600 mb-2">Erro ao carregar escolas: {erroEscolas}</p>}
              <select
                id="escolaVinculada"
                name="escolaVinculada"
                value={formData.escolaVinculada}
                onChange={handleChange}
                disabled={loadingEscolas || !!erroEscolas || carregandoLanchonete}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004d9d] focus:border-transparent appearance-none bg-white cursor-pointer disabled:bg-gray-100 disabled:text-gray-500"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23004d9d' viewBox='0 0 24 24'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.5rem center',
                  backgroundSize: '1.5em 1.5em'
                }}
              >
                <option value="">{loadingEscolas ? 'Carregando escolas...' : 'Selecione uma escola'}</option>
                {escolas.map(esc => (
                  <option key={esc.id_escola} value={esc.id_escola}>{esc.nome_escola}</option>
                ))}
              </select>
            </div>

            {/* Administrador Responsável */}
            <div>
              <label htmlFor="administradorResponsavel" className="block text-gray-700 font-medium mb-2">Administrador Responsável</label>
              {erroAdmins && <p className="text-sm text-red-600 mb-2">Erro ao carregar administradores: {erroAdmins}</p>}
              <select
                id="administradorResponsavel"
                name="administradorResponsavel"
                value={formData.administradorResponsavel}
                onChange={handleChange}
                disabled={loadingAdmins || !!erroAdmins || carregandoLanchonete}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004d9d] focus:border-transparent appearance-none bg-white cursor-pointer disabled:bg-gray-100 disabled:text-gray-500"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23004d9d' viewBox='0 0 24 24'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.5rem center',
                  backgroundSize: '1.5em 1.5em'
                }}
              >
                <option value="">{loadingAdmins ? 'Carregando administradores...' : 'Selecione um administrador'}</option>
                {admins.map(adm => (
                  <option key={adm.id_user} value={adm.id_user}>{adm.nome || adm.email}</option>
                ))}
              </select>
            </div>



            {/* Botões */}
            <div className="flex gap-4 justify-end pt-4">
              <button
                type="submit"
                disabled={submitting || carregandoLanchonete}
                className={`px-8 py-3 text-white font-semibold rounded-lg transition-colors ${(submitting || carregandoLanchonete) ? 'bg-gray-500 cursor-not-allowed' : 'bg-[#004d9d] hover:bg-[#003d7d]'}`}
              >
                {carregandoLanchonete ? 'Carregando...' : (submitting ? 'Salvando...' : 'Salvar alterações')}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-8 py-3 bg-gray-400 text-white font-semibold rounded-lg hover:bg-gray-500 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default EditarLanchonete;