import React, { useState, useEffect } from 'react';
import senac from './Image/senacBranco.png';
import sesc from './Image/sescBranco.png';
import { supabase } from '../lib/supabase';

function CadastrarAdm() {
  // Estado do formulário (mantém nomes consistentes com os inputs)
  const [formData, setFormData] = useState({
    nomeCompleto: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    escolaVinculada: '' // armazenará id_escola
  });

  // Lista dinâmica de escolas
  const [escolas, setEscolas] = useState([]);
  const [loadingEscolas, setLoadingEscolas] = useState(true);
  const [erroEscolas, setErroEscolas] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  // Nome do usuário logado (perfil)
  const [userNome, setUserNome] = useState('');
  const [carregandoUserNome, setCarregandoUserNome] = useState(true);
  useEffect(() => {
    const carregarEscolas = async () => {
      setLoadingEscolas(true);
      const { data, error } = await supabase
        .from('escola')
        .select('id_escola, nome_escola')
        .order('nome_escola', { ascending: true });
      if (error) {
        setErroEscolas(error.message);
      } else {
        setEscolas(data || []);
      }
      setLoadingEscolas(false);
    };
    carregarEscolas();
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
      // Tenta buscar na tabela perfil
      const { data: perfilData, error: perfilError } = await supabase
        .from('perfil')
        .select('nome')
        .eq('id_user', userId)
        .limit(1)
        .maybeSingle();
      if (!perfilError && perfilData && perfilData.nome) {
        setUserNome(perfilData.nome);
      } else {
        // Fallback: metadata ou email
        setUserNome(userData.user.user_metadata?.nomeCompleto || userData.user.email || 'Usuário');
      }
      setCarregandoUserNome(false);
    };
    carregarUsuario();
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
    if (submitting) return; // evita duplo envio

    // Validações básicas (usar nomes corretos)
    if (!formData.nomeCompleto || !formData.email || !formData.senha || !formData.confirmarSenha || !formData.escolaVinculada) {
      alert('Por favor, preencha todos os campos!');
      return;
    }
    if (formData.senha !== formData.confirmarSenha) {
      alert('As senhas não coincidem!');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Cria usuário de autenticação (signUp)
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.senha,
        options: {
          data: { nomeCompleto: formData.nomeCompleto }
        }
      });
      if (signUpError) {
        throw new Error(`Erro ao criar usuário: ${signUpError.message}`);
      }
      const userId = signUpData?.user?.id;
      if (!userId) {
        throw new Error('ID do usuário não retornado pelo signUp.');
      }

      // 2. Insere registro na tabela perfil
      const { error: perfilError } = await supabase
        .from('perfil')
        .insert({
          id_user: userId,
          nome: formData.nomeCompleto,
          email: formData.email,
          tipoConta: 'adm',
          id_escola: formData.escolaVinculada
        });
      if (perfilError) {
        throw new Error(`Erro ao inserir perfil: ${perfilError.message}`);
      }

      alert('Administrador cadastrado com sucesso!');
      // Reset
      setFormData({
        nomeCompleto: '',
        email: '',
        senha: '',
        confirmarSenha: '',
        escolaVinculada: ''
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      nomeCompleto: '',
      email: '',
      senha: '',
      confirmarSenha: '',
      escolaVinculada: ''
    });
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
          <a href="/GerenciarEscolas" className="hover:underline">ESCOLA</a>
          <a href="/GerenciarAdm" className="hover:underline ">ADMINISTRADOR</a>
          <a href="/GerenciarLanchonete" className="hover:underline">LANCHONETES</a>
          <a href="/RelatoriosGerais" className="hover:underline">RELATÓRIOS</a>
        </nav>

        <div className="flex gap-4">
          <img src={senac} alt="Senac" className="h-8" />
          <img src={sesc} alt="Sesc" className="h-8" />
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex items-center justify-center py-12 px-4">
        <div className="bg-white rounded-3xl shadow-xl p-12 w-full max-w-2xl">
          <h1 className="text-center text-4xl font-bold text-[#004d9d] mb-8 font-lobster">
            Cadastrar Novo<br />Adiministrador
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nome Completo */}
            <div>
              <label htmlFor="nomeCompleto" className="block text-gray-700 font-medium mb-2">
                Nome Completo
              </label>
              <input
                type="text"
                id="nomeCompleto"
                name="nomeCompleto"
                value={formData.nomeCompleto}
                onChange={handleChange}
                placeholder="Nome"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004d9d] focus:border-transparent"
              />
            </div>

            {/* E-mail */}
            <div>
              <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                E-mail
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="E-mail"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004d9d] focus:border-transparent"
              />
            </div>

            {/* Senha e Confirmar Senha */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="senha" className="block text-gray-700 font-medium mb-2">
                  Senha
                </label>
                <input
                  type="password"
                  id="senha"
                  name="senha"
                  value={formData.senha}
                  onChange={handleChange}
                  placeholder="Senha"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004d9d] focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="confirmarSenha" className="block text-gray-700 font-medium mb-2">
                  Confirmar Senha
                </label>
                <input
                  type="password"
                  id="confirmarSenha"
                  name="confirmarSenha"
                  value={formData.confirmarSenha}
                  onChange={handleChange}
                  placeholder="Confirmar Senha"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004d9d] focus:border-transparent"
                />
              </div>
            </div>

            {/* Escola Vinculada */}
            <div>
              <label htmlFor="escolaVinculada" className="block text-gray-700 font-medium mb-2">
                Escola Vinculada
              </label>
              {erroEscolas && (
                <p className="text-sm text-red-600 mb-2">Erro ao carregar escolas: {erroEscolas}</p>
              )}
              <select
                id="escolaVinculada"
                name="escolaVinculada"
                value={formData.escolaVinculada}
                onChange={handleChange}
                disabled={loadingEscolas || !!erroEscolas}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004d9d] focus:border-transparent appearance-none bg-white cursor-pointer disabled:bg-gray-100 disabled:text-gray-500"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23004d9d' viewBox='0 0 24 24'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.5rem center',
                  backgroundSize: '1.5em 1.5em'
                }}
              >
                <option value="">{loadingEscolas ? 'Carregando escolas...' : 'Selecione uma escola'}</option>
                {escolas.map((esc) => (
                  <option key={esc.id_escola} value={esc.id_escola}>{esc.nome_escola}</option>
                ))}
              </select>
            </div>

            {/* Botões */}
            <div className="flex gap-4 justify-end pt-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-8 py-3 bg-gray-400 text-white font-semibold rounded-lg hover:bg-gray-500 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className={`px-8 py-3 text-white font-semibold rounded-lg transition-colors ${submitting ? 'bg-gray-500 cursor-not-allowed' : 'bg-[#004d9d] hover:bg-[#003d7d]'}`}
              >
                {submitting ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default CadastrarAdm;
