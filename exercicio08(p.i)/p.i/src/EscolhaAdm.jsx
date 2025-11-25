import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import senacBranco from './Image/senacBranco.png';
import sescBranco from './Image/sescBranco.png';
import cafeImg from "./Image/croisant.png";

function EscolhaAdm() {
    const navigate = useNavigate();
    const [saindo, setSaindo] = useState(false);
    const [userNome, setUserNome] = useState('');
    const [carregandoNome, setCarregandoNome] = useState(true);

    useEffect(() => {
        const carregarNome = async () => {
            try {
                const { data: { user }, error: userError } = await supabase.auth.getUser();
                if (userError) {
                    console.error('Erro ao obter usuário autenticado:', userError.message);
                }
                if (!user) {
                    navigate('/');
                    return;
                }
                // Buscar nome na tabela perfil
                const { data: perfil, error: perfilError } = await supabase
                    .from('perfil')
                    .select('nome')
                    .eq('id_user', user.id)
                    .maybeSingle();
                if (perfilError) {
                    console.error('Erro ao buscar perfil:', perfilError.message);
                } else if (perfil && perfil.nome) {
                    setUserNome(perfil.nome);
                }
            } catch (e) {
                console.error('Exceção ao carregar nome do usuário:', e);
            } finally {
                setCarregandoNome(false);
            }
        };
        carregarNome();
    }, [navigate]);

    const handleLogout = async () => {
        if (saindo) return;
        setSaindo(true);
        try {
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error('Erro ao deslogar:', error.message);
                alert('Erro ao sair. Tente novamente.');
            } else {
                navigate('/'); // Volta para App.jsx (rota raiz)
            }
        } catch (e) {
            console.error('Exceção no logout:', e);
            alert('Erro inesperado ao sair.');
        } finally {
            setSaindo(false);
        }
    };
    const handleSenacClick = () => {
        // Redirecionar para gerenciamento de produtos Senac
        navigate('/GerenciarProdutosSenac');
    };

    const handleSescClick = () => {
        // Redirecionar para gerenciamento de produtos Sesc
        navigate('/GerenciarProdutosSesc');
    };

    return (
        <div className="min-h-screen bg-[#D2DAF4]">
            {/* Header */}
            <header className="bg-[#1e5a8e] text-white app-header">
                <div className="flex items-center gap-4">
                    <div className="border-2 border-white rounded-full p-2 w-12 h-12 flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                        </svg>
                    </div>
                    <span className="font-semibold">
                        {carregandoNome ? 'Carregando...' : (userNome || 'USUÁRIO')}
                    </span>
                </div>
                <nav className="flex gap-8">
                    <button
                        onClick={handleLogout}
                        disabled={saindo}
                        className={`px-4 py-2 rounded ${saindo ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'} text-white font-semibold transition-colors`}
                    >
                        {saindo ? 'SAINDO...' : 'SAIR'}
                    </button>
                </nav>
            </header>

            {/* Conteúdo Principal */}
            <main className="flex flex-col items-center justify-center px-8 py-16">
                {/* Título */}
                <h1 className="text-center text-7xl font-bold text-[#004d9d] mb-16 font-lobster">
                    ESCOLHA A<br />LANCHONETE
                </h1>

                {/* Botões de Escola */}
                <div className="flex gap-16 mb-12">
                    {/* Botão Senac */}
                    <button
                        onClick={handleSenacClick}
                        className="bg-[#004d9d] hover:bg-[#003d7d] transition-all duration-300 rounded-2xl shadow-2xl p-8 w-64 h-40 flex items-center justify-center transform hover:scale-105"
                    >
                        <img src={senacBranco} alt="Senac" className="w-full h-auto max-h-32" />
                    </button>

                    {/* Botão Sesc */}
                    <button
                        onClick={handleSescClick}
                        className="bg-[#004d9d] hover:bg-[#003d7d] transition-all duration-300 rounded-2xl shadow-2xl p-8 w-64 h-40 flex items-center justify-center transform hover:scale-105"
                    >
                        <img src={sescBranco} alt="Sesc" className="w-full h-auto max-h-32" />
                    </button>
                </div>

                {/* Imagem decorativa */}
                <div className="mt-8">
                    <img
                        src={cafeImg}
                        alt="Café e croissant"
                        className="w-80 h-auto drop-shadow-md"
                    />
                </div>
            </main>
        </div>
    );
}

export default EscolhaAdm;