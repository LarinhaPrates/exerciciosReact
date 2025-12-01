import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';
import senac from './Image/senacBranco.png';
import sesc from './Image/sescBranco.png';

function CriarEscola() {
  const [formData, setFormData] = useState({
    nomeEscola: '',
    cidade: '',
    administradorResponsavel: ''
  });
  const [salvando, setSalvando] = useState(false);
  const [erroSalvar, setErroSalvar] = useState(null);
  const [sucessoSalvar, setSucessoSalvar] = useState(null);
  // Nome do usuário logado (perfil)
  const [userNome, setUserNome] = useState('');
  const [carregandoUserNome, setCarregandoUserNome] = useState(true);
  // Lista dinâmica de administradores (perfil.tipoConta = 'admMaster')
  const [admins, setAdmins] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [erroAdmins, setErroAdmins] = useState(null);

  useEffect(() => {
    const carregarAdmins = async () => {
      setLoadingAdmins(true);
      setErroAdmins(null);
      try {
        // Busca administradores master independente de variação de caixa
        const { data, error, count } = await supabase
          .from('perfil')
          .select('id_user, nome, tipoConta', { count: 'exact' })
          // Todos perfis cujo tipoConta começa com 'adm' (inclui adm, admMaster, admMaster2, etc.)
          .ilike('tipoConta', 'admmaster');
        // Debug detalhado
        console.log('[Admins] total encontrados:', count, data);
        if (error) throw error;

        // Deduplica por id_user caso haja repetições
        const vistos = new Set();
        const normalizados = [];
        (data || []).forEach(row => {
          if (!row.id_user || vistos.has(row.id_user)) return;
          vistos.add(row.id_user);
          const display = row.nome || row.nome_completo || row.username || (row.email ? row.email.split('@')[0] : row.id_user.slice(0,8));
          normalizados.push({ id: row.id_user, display });
        });

        // Ordena alfabeticamente para ficar previsível
        normalizados.sort((a, b) => a.display.localeCompare(b.display));
        setAdmins(normalizados);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('Falha ao carregar administradores:', e);
        setErroAdmins('Não foi possível carregar a lista de administradores');
      } finally {
        setLoadingAdmins(false);
      }
    };
    carregarAdmins();
  }, []);

  // Carrega nome do usuário para o header
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
        // Tenta buscar no perfil
        const { data: perfil, error: erroPerfil } = await supabase
          .from('perfil')
          .select('nome, nome_completo, username, email')
          .eq('id_user', user.id)
          .single();
        if (!erroPerfil && perfil) {
          const nomeDisplay = perfil.nome || perfil.nome_completo || perfil.username || (perfil.email ? perfil.email.split('@')[0] : '') || 'Usuário';
          setUserNome(nomeDisplay);
        } else {
          // Fallback para user_metadata ou email
          const meta = user.user_metadata || {};
            const nomeDisplay = meta.nome || meta.nome_completo || meta.username || (user.email ? user.email.split('@')[0] : 'Usuário');
          setUserNome(nomeDisplay);
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('Falha ao carregar nome do usuário:', e);
        setUserNome('Usuário');
      } finally {
        setCarregandoUserNome(false);
      }
    };
    carregarUsuario();
    // Assina mudanças de auth para atualizar nome se usuário trocar
    unsubscribe = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setUserNome('');
      } else {
        carregarUsuario();
      }
    }).data.subscription.unsubscribe;
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErroSalvar(null);
    setSucessoSalvar(null);

    if (!formData.nomeEscola || !formData.cidade || !formData.administradorResponsavel) {
      setErroSalvar('Por favor, preencha todos os campos.');
      return;
    }

    setSalvando(true);
    try {
      // Inserção na tabela 'escola' (ajuste nomes de colunas conforme seu schema real)
      const { error } = await supabase
        .from('escola')
        .insert({
          nome_escola: formData.nomeEscola,
          cidade: formData.cidade,
          admResponsavel: formData.administradorResponsavel,
          created_at: new Date().toISOString()
        });
      if (error) throw error;

      setSucessoSalvar('Escola criada com sucesso!');
      setFormData({ nomeEscola: '', cidade: '', administradorResponsavel: '' });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('Erro ao salvar escola:', err);
      setErroSalvar(err.message || 'Falha ao salvar escola.');
    } finally {
      setSalvando(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      nomeEscola: '',
      cidade: '',
      administradorResponsavel: ''
    });
    // Opcional: redirecionar para outra página
    // window.location.href = '/Escolhe';
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
          <Link to="/GerenciarEscolas" className="hover:underline ">ESCOLA</Link>
          <Link to="/GerenciarAdm" className="hover:underline">ADMINISTRADOR</Link>
          <Link to="/GerenciarLanchonete" className="hover:underline">LANCHONETES</Link>
          <Link to="/RelatoriosGerais" className="hover:underline">RELATÓRIOS</Link>
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
            Criar Escola
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nome da Escola */}
            <div>
              <label htmlFor="nomeEscola" className="block text-gray-700 font-medium mb-2">
                Nome da Escola
              </label>
              <input
                type="text"
                id="nomeEscola"
                name="nomeEscola"
                value={formData.nomeEscola}
                onChange={handleChange}
                placeholder="*******************"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004d9d] focus:border-transparent"
              />
            </div>

            {/* Cidade */}
            <div>
              <label htmlFor="cidade" className="block text-gray-700 font-medium mb-2">
                Cidade
              </label>
              <select
                id="cidade"
                name="cidade"
                value={formData.cidade}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004d9d] focus:border-transparent appearance-none bg-white cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23004d9d' viewBox='0 0 24 24'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.5rem center',
                  backgroundSize: '1.5em 1.5em'
                }}
              >
                <option value="">Selecione uma cidade</option>
                <option value="sao-paulo">São Paulo</option>
                <option value="rio-de-janeiro">Rio de Janeiro</option>
                <option value="belo-horizonte">Belo Horizonte</option>
                <option value="curitiba">Curitiba</option>
                <option value="porto-alegre">Porto Alegre</option>
                <option value="brasilia">Brasília</option>
                <option value="salvador">Salvador</option>
                <option value="fortaleza">Fortaleza</option>
                <option value="recife">Recife</option>
              </select>
            </div>

            {/* Administrador Responsável */}
            <div>
              <label htmlFor="administradorResponsavel" className="block text-gray-700 font-medium mb-2">
                Administrador Responsavel
              </label>
              <select
                id="administradorResponsavel"
                name="administradorResponsavel"
                value={formData.administradorResponsavel}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004d9d] focus:border-transparent appearance-none bg-white cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23004d9d' viewBox='0 0 24 24'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.5rem center',
                  backgroundSize: '1.5em 1.5em'
                }}
              >
                <option value="">{loadingAdmins ? 'Carregando administradores...' : 'Selecione um administrador'}</option>
                {erroAdmins && (
                  <option value="" disabled>{erroAdmins}</option>
                )}
                {admins.length === 0 && !loadingAdmins && !erroAdmins && (
                  <option value="" disabled>Nenhum administrador encontrado</option>
                )}
                {admins.map(a => (
                  <option key={a.id} value={a.id}>{a.display}</option>
                ))}
              </select>
            </div>

            {/* Feedback */}
            {(erroSalvar || sucessoSalvar) && (
              <div>
                {erroSalvar && <p className="text-red-600 text-sm">{erroSalvar}</p>}
                {sucessoSalvar && <p className="text-green-600 text-sm">{sucessoSalvar}</p>}
              </div>
            )}

            {/* Botões */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={salvando}
                className="px-8 py-3 bg-[#004d9d] text-white font-semibold rounded-lg hover:bg-[#003d7d] transition-colors disabled:opacity-60"
              >
                {salvando ? 'Salvando...' : 'Salvar'}
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

export default CriarEscola;