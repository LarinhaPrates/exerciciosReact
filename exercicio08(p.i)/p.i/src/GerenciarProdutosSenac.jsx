import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import senac from './Image/senacBranco.png';
import sesc from './Image/sescBranco.png';

function GerenciarProdutos() {
    const navigate = useNavigate();
    const [produtos, setProdutos] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');
    const [userNome, setUserNome] = useState('');
    const [carregandoUser, setCarregandoUser] = useState(true);

    // Carregar nome do usuário
    useEffect(() => {
        const carregarUsuario = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;
                const { data: perfil } = await supabase
                    .from('perfil')
                    .select('nome')
                    .eq('id_user', user.id)
                    .maybeSingle();
                if (perfil && perfil.nome) setUserNome(perfil.nome);
            } catch (e) {
                console.error('Erro ao carregar usuário:', e);
            } finally {
                setCarregandoUser(false);
            }
        };
        carregarUsuario();
    }, []);

    // Carregar produtos da lanchonete id_lanchonete = 1 (tratando variação de nome de PK)
    useEffect(() => {
        const carregarProdutos = async () => {
            setErro('');
            setCarregando(true);
            try {
                // Primeiro tenta com id_produto
                let query = supabase
                    .from('produto')
                    .select('id_produto, nome_produto, descricao, preco, id_lanchonete, foto')
                    .eq('id_lanchonete', 2)
                    .order('id_produto', { ascending: true });

                let { data, error } = await query;
                // Se a coluna id_produto não existir, tenta fallback para id
                if (error && /id_produto/.test(error.message)) {
                    console.warn('Coluna id_produto não encontrada. Tentando fallback para id.');
                    const fallback = await supabase
                        .from('produto')
                        .select('id, nome_produto, descricao, preco, id_lanchonete, foto')
                        .eq('id_lanchonete', 2)
                        .order('id', { ascending: true });
                    data = fallback.data;
                    error = fallback.error;
                }

                if (error) {
                    console.error('Erro ao buscar produtos:', error.message);
                    setErro('Falha ao carregar produtos.');
                } else {
                    setProdutos(data || []);
                }
            } catch (ex) {
                console.error('Exceção ao carregar produtos:', ex);
                setErro('Erro inesperado ao carregar produtos.');
            } finally {
                setCarregando(false);
            }
        };
        carregarProdutos();
    }, []);

    const handleAdicionarProdutosSenac = () => {
        navigate('/AdicionarProdutosSenac');
    };

    const formatarPreco = (valor) => {
        if (valor === null || valor === undefined) return '-';
        if (typeof valor === 'number') {
            return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        }
        // Tentar converter string para número
        const num = parseFloat(String(valor).replace('R$', '').replace(',', '.'));
        return isNaN(num) ? String(valor) : num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-[#004d9d] text-white app-header">
                <div className="flex items-center gap-4">
                    <div className="border-2 border-white rounded-full p-2 w-12 h-12 flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                        </svg>
                    </div>
                    <span className="font-semibold">{carregandoUser ? 'Carregando...' : (userNome || 'USUÁRIO')}</span>
                </div>

                <nav className="flex gap-8">
                    <a href="/GerenciarProdutosSenac" className="hover:underline">PRODUTOS</a>
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
                    <h1 className="text-center text-5xl font-bold text-[#004d9d] mb-8 font-lobster">
                        Gerênciar Produtos
                    </h1>
                    <h1 className="text-center text-5xl font-bold text-[#004d9d] mb-8 font-lobster">Senac</h1>

                    {/* Botão Adicionar Produto */}
                    <div className="flex justify-center mb-8">
                        <button
                            onClick={handleAdicionarProdutosSenac}
                            className="bg-[#004d9d] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#003d7d] transition-colors flex items-center gap-2"
                        >
                            <span className="text-2xl">+</span>
                            Adicionar Produto
                        </button>
                    </div>

                    {/* Área de status / erros */}
                    {erro && (
                        <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                            {erro}
                        </div>
                    )}
                    {carregando && (
                        <div className="text-center text-gray-600 mb-4">Carregando produtos...</div>
                    )}

                    {/* Tabela de Produtos */}
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b-2 border-[#004d9d]">
                                    <th className="py-4 px-6 text-[#004d9d] font-bold text-lg text-left w-1/5">Produto</th>
                                    <th className="py-4 px-6 text-[#004d9d] font-bold text-lg text-left border-l-2 border-[#004d9d] w-2/5">Descrição</th>
                                    <th className="py-4 px-6 text-[#004d9d] font-bold text-lg text-left border-l-2 border-[#004d9d] w-1/5">Preço</th>
                                    <th className="py-4 px-6 text-[#004d9d] font-bold text-lg text-left border-l-2 border-[#004d9d] w-1/5">id_lanchonete</th>
                                </tr>
                            </thead>
                            <tbody>
                                {produtos.length === 0 && !carregando && (
                                    <tr>
                                        <td colSpan={4} className="py-6 px-6 text-center text-gray-500">Nenhum produto cadastrado.</td>
                                    </tr>
                                )}
                                {produtos.map((produto, index) => (
                                    <tr
                                        key={produto.id_produto || id_produto || index}
                                        className={`border-b-2 border-[#004d9d] ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                                    >
                                        <td className="py-4 px-6 text-gray-800 font-medium">
                                            <div className="flex items-center gap-3">
                                                {produto.foto && (
                                                    <img src={produto.foto} alt={produto.nome_produto} className="w-12 h-12 object-cover rounded-md border" />
                                                )}
                                                {produto.nome_produto}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-gray-700 text-sm border-l-2 border-[#004d9d]">{produto.descricao}</td>
                                        <td className="py-4 px-6 text-gray-800 font-semibold border-l-2 border-[#004d9d]">{formatarPreco(produto.preco)}</td>
                                        <td className="py-4 px-6 text-gray-800 border-l-2 border-[#004d9d]">{produto.id_lanchonete || '-'}</td>
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

export default GerenciarProdutos;