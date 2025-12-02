import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import senac from './Image/senacBranco.png';
import sesc from './Image/sescBranco.png';

function RelatoriosGerais() {
    const navigate = useNavigate();
    const [usuarioNome, setUsuarioNome] = useState('');
    const [totalPedidos, setTotalPedidos] = useState(0);
    const [totalVendas, setTotalVendas] = useState(0);
    const [totalLanchonetes, setTotalLanchonetes] = useState(0);
    const [totalAdministradores, setTotalAdministradores] = useState(0);

    const formatCurrency = (valor) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0);

    // Carregar/atualizar nome do usuário para header (robusto a mudanças de sessão)
    useEffect(() => {
        let isMounted = true;

        const carregarPorUser = async (user) => {
            try {
                if (!user) return;
                const { data: perfil, error: perfilError } = await supabase
                    .from('perfil')
                    .select('nome')
                    .eq('id_user', user.id)
                    .maybeSingle();
                if (perfilError) {
                    console.warn('Perfil não encontrado ou erro:', perfilError.message);
                }
                if (isMounted) {
                    setUsuarioNome(perfil?.nome || user.email || 'USUÁRIO');
                }
            } catch (e) {
                console.warn('Falha ao carregar perfil do usuário:', e);
            }
        };

        const bootstrap = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                const user = session?.user;
                if (user) await carregarPorUser(user);
            } catch (e) {
                console.warn('Falha ao obter sessão:', e);
            }
        };

        bootstrap();

        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            const user = session?.user;
            if (user) carregarPorUser(user);
            else if (isMounted) setUsuarioNome('');
        });

        return () => {
            isMounted = false;
            authListener?.subscription?.unsubscribe?.();
        };
    }, []);

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
        } catch (e) {
            console.warn('Erro ao deslogar:', e);
        } finally {
            // redireciona para a rota da página inicial (componente App)
            navigate('/');
        }
    };

    // Carrega o total de pedidos (contagem de linhas na tabela 'pedido')
    useEffect(() => {
        let isMounted = true;
        const carregarTotalPedidos = async () => {
            try {
                // Usa head:true para retornar apenas a contagem, sem payload
                const { count, error } = await supabase
                    .from('pedido')
                    .select('*', { count: 'exact', head: true });
                if (error) {
                    console.warn('Erro ao contar pedidos:', error.message);
                    return;
                }
                if (isMounted && typeof count === 'number') {
                    setTotalPedidos(count);
                }
            } catch (e) {
                console.warn('Falha ao carregar total de pedidos:', e);
            }
        };
        carregarTotalPedidos();
        return () => { isMounted = false; };
    }, []);

    // Conta lanchonetes ativas (quantidade de registros na tabela 'lanchonete')
    useEffect(() => {
        let isMounted = true;
        const carregarTotalLanchonetes = async () => {
            try {
                const { count, error } = await supabase
                    .from('lanchonete')
                    .select('*', { count: 'exact', head: true });
                if (error) {
                    console.warn('Erro ao contar lanchonetes:', error.message);
                    return;
                }
                if (isMounted && typeof count === 'number') {
                    setTotalLanchonetes(count);
                }
            } catch (e) {
                console.warn('Falha ao carregar total de lanchonetes:', e);
            }
        };
        carregarTotalLanchonetes();
        return () => { isMounted = false; };
    }, []);

    // Conta administradores ativos (perfil.tipoConta = 'adm')
    useEffect(() => {
        let isMounted = true;
        const carregarTotalAdministradores = async () => {
            try {
                const { count, error } = await supabase
                    .from('perfil')
                    .select('*', { count: 'exact', head: true })
                    .eq('tipoConta', 'adm');
                if (error) {
                    console.warn('Erro ao contar administradores:', error.message);
                    return;
                }
                if (isMounted && typeof count === 'number') {
                    setTotalAdministradores(count);
                }
            } catch (e) {
                console.warn('Falha ao carregar total de administradores:', e);
            }
        };
        carregarTotalAdministradores();
        return () => { isMounted = false; };
    }, []);

    // Carrega o total de vendas somando 'valor_total' da tabela 'pedido'
    useEffect(() => {
        let isMounted = true;
        const carregarTotalVendas = async () => {
            try {
                const { data, error } = await supabase
                    .from('pedido')
                    .select('valor_total');
                if (error) {
                    console.warn('Erro ao somar vendas:', error.message);
                    return;
                }
                const total = (data || []).reduce((acc, row) => {
                    const v = Number(row?.valor_total);
                    return acc + (Number.isFinite(v) ? v : 0);
                }, 0);
                if (isMounted) setTotalVendas(total);
            } catch (e) {
                console.warn('Falha ao carregar total de vendas:', e);
            }
        };
        carregarTotalVendas();
        return () => { isMounted = false; };
    }, []);

    return (
        <div className="min-h-screen bg-[#B1BFEA]">
            {/* Header */}
            <header className="bg-[#004d9d] text-white app-header">
                <div className="flex items-center gap-4">
                    <div className="bg-white rounded-full p-2 w-12 h-12 flex items-center justify-center">
                        <svg className="w-6 h-6 text-[#004d9d]" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                        </svg>
                    </div>
                    <span className="font-semibold">{usuarioNome || 'USUÁRIO'}</span>
                </div>

                <nav className="flex gap-8">
                    <Link to="/GerenciarEscolas" className="hover:underline">ESCOLA</Link>
                    <Link to="/GerenciarAdm" className="hover:underline">ADMINISTRADOR</Link>
                    <Link to="/GerenciarLanchonete" className="hover:underline">LANCHONETES</Link>
                    <Link to="/RelatoriosGerais" className="hover:underline">RELATÓRIOS</Link>
                    <Link to="/GerenciarAlunos" className="hover:underline">ALUNOS</Link>

                    <button
                        onClick={handleLogout}
                        className="hover:underline text-left"
                        type="button"
                    >
                        SAIR
                    </button>
                </nav>

                <div className="flex gap-4">
                    <img src={senac} alt="Senac" className="h-8" />
                    <img src={sesc} alt="Sesc" className="h-8" />
                </div>
            </header>

            {/* Conteúdo Principal */}
            <main className="px-8 py-6">
                <h1 className="text-center text-5xl font-bold text-[#004d9d] mb-10 font-lobster">
                    Relatórios Gerais
                </h1>

                {/* Wrapper centralizado dos cards */}
                <section className="flex flex-col items-center justify-center min-h-[70vh] gap-8">
                    {/* Linha 1 - Cards de Totais */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-5xl mx-auto items-stretch justify-items-center">
                        {/* Total de Pedidos */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 h-[220px] w-full flex flex-col justify-between">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="bg-[#6b7bc4] p-3 rounded-lg">
                                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1s-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm0 4c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm6 12H6v-1.4c0-2 4-3.1 6-3.1s6 1.1 6 3.1V19z" />
                                    </svg>
                                </div>
                                <h2 className="text-xl text-[#6b7bc4] font-semibold">Total de Pedidos</h2>
                            </div>
                            <p className="text-5xl font-bold text-center mt-4">{totalPedidos}</p>
                        </div>

                        {/* Total de Vendas */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 h-[220px] w-100 flex flex-col justify-between">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="bg-[#6b7bc4] p-3 rounded-lg">
                                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z" />
                                    </svg>
                                </div>
                                <h2 className="text-xl text-[#6b7bc4] font-semibold">Total de Vendas</h2>
                            </div>
                            <p className="text-5xl font-bold text-center mt-4">{formatCurrency(totalVendas)}</p>
                        </div>
                    </div>

                    {/* Linha 2 - Lanchonetes e Administradores Ativos */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-5xl mx-auto items-stretch justify-items-center">
                        {/* Lanchonetes Ativas */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 h-[220px] w-full flex flex-col justify-between">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="bg-[#6b7bc4] p-3 rounded-lg">
                                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 4h2v5l-1-.75L9 9V4zm9 16H6V4h1v9l3-2.25L13 13V4h5v16z" />
                                    </svg>
                                </div>
                                <h2 className="text-xl text-[#6b7bc4] font-semibold">Lanchonetes Ativas</h2>
                            </div>
                            <p className="text-5xl font-bold text-center mt-4">{totalLanchonetes}</p>
                        </div>

                        {/* Administradores Ativos */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 h-[220px] w-100 flex flex-col justify-between">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="bg-[#6b7bc4] p-3 rounded-lg">
                                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                                    </svg>
                                </div>
                                <h2 className="text-xl text-[#6b7bc4] font-semibold">Administradores Ativos</h2>
                            </div>
                            <p className="text-5xl font-bold text-center mt-4">{totalAdministradores}</p>
                        </div>
                    </div>
                </section>

            </main>
        </div>
    );
}

export default RelatoriosGerais;
