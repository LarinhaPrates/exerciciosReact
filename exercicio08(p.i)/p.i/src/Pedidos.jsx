import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import { useCarrinho } from "./CarrinhoContext";
import { supabase } from "../lib/supabase.js";
import "./Lobster.css";

function Pedidos() {
    const navigate = useNavigate();
    const { carrinho, adicionarProduto, removerProduto, calcularTotal } = useCarrinho();
    const [nomeUsuario, setNomeUsuario] = useState("");

    const handleVoltar = () => {
        window.history.back();
    };

    // Carregar e manter sincronizado o nome do usuário logado
    useEffect(() => {
        let mounted = true;

        const carregarUsuario = async () => {
            const { data, error } = await supabase.auth.getUser();
            if (error) return;
            const user = data?.user;
            if (mounted && user) {
                const nome = user.user_metadata?.nome || user.email?.split("@")[0] || "";
                setNomeUsuario(nome);
            }
        };
        carregarUsuario();

        const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
            const user = session?.user;
            const nome = user?.user_metadata?.nome || user?.email?.split("@")[0] || "";
            setNomeUsuario(nome);
        });

        return () => {
            mounted = false;
            sub?.subscription?.unsubscribe?.();
        };
    }, []);

    return (
        <div className="flex flex-col min-h-screen w-screen bg-[#B1BFEA] font-sans">
            {/* Barra superior */}
            <header className="bg-[#1E5A8E] text-white app-header">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 border-2 border-white rounded-full flex items-center justify-center text-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                    </div>
                    <span className="text-xl">{nomeUsuario || "*USUÁRIO*"}</span>
                </div>

                <nav className="flex gap-12 text-lg">
                    <button className="hover:underline">PEDIDOS</button>
                    <Link to="/Pagamento" className="hover:underline">CONTA</Link>
                    <button
                        onClick={handleVoltar}
                        className="hover:underline"
                    >
                        VOLTAR
                    </button>
                </nav>
            </header>

            {/* Conteúdo principal */}
            <main className="flex flex-col items-center justify-start flex-1 pt-12 px-6">
                <h1 className="text-7xl font-lobster text-white mb-12 drop-shadow-lg">
                    PEDIDOS
                </h1>

                {/* Lista de Pedidos */}
                <div className="w-full max-w-3xl space-y-4 mb-10">
                    {carrinho.map((item, index) => (
                        <div
                            key={`${item.nome}-${index}`}
                            className="bg-white rounded-2xl shadow-lg p-6 flex items-center gap-6"
                        >
                            {/* Caixa laranja (placeholder para imagem do produto) */}
                            {item.imagem ? (
                                <img src={item.imagem} alt={item.nome} className="rounded-xl w-64 h-32 object-cover" />
                            ) : (
                                <div className="bg-[#FF8C42] rounded-xl w-64 h-32 flex items-center justify-center text-white/80">
                                    Sem imagem
                                </div>
                            )}

                            {/* Informações do pedido */}
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-700 font-medium">NOME:</span>
                                    <span className="text-gray-600">{item.nome}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-700 font-medium">PREÇO:</span>
                                    <span className="text-gray-600">R$ {(Number(item.preco) || 0).toFixed(2).replace('.', ',')}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-700 font-medium">QUANTIDADE:</span>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => removerProduto(item.nome)}
                                            className="w-9 h-9 bg-white border-2 border-gray-600 rounded-full flex items-center justify-center hover:bg-gray-100"
                                            title="Remover 1"
                                        >
                                            −
                                        </button>
                                        <span className="min-w-6 text-center font-semibold">{item.quantidade}</span>
                                        <button
                                            onClick={() => adicionarProduto({ nome: item.nome, preco: item.preco, imagem: item.imagem })}
                                            className="w-9 h-9 bg-white border-2 border-gray-600 rounded-full flex items-center justify-center hover:bg-gray-100"
                                            title="Adicionar 1"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Botão de deletar */}
                            <button
                                onClick={() => {
                                    // Remove uma unidade por clique; clique múltiplo remove tudo
                                    removerProduto(item.nome);
                                }}
                                className="bg-[#1E5A8E] hover:bg-[#2B6FA8] text-white p-3 rounded-lg transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>

                {/* Rodapé com total e pagamento */}
                <div className="w-full max-w-3xl flex justify-between items-center">
                    {/* Total */}
                    <div className="bg-[#1E5A8E] text-white rounded-2xl px-10 py-4 shadow-lg">
                        <span className="text-2xl font-medium">
                            TOTAL = R$ {calcularTotal().toFixed(2).replace('.', ',')}
                        </span>
                    </div>

                    {/* Método de Pagamento */}
                    <button
                        onClick={() => navigate('/FormaDePagamento')}
                        disabled={carrinho.length === 0}
                        className={`rounded-2xl px-8 py-4 shadow-lg flex items-center gap-3 transition-colors ${carrinho.length === 0 ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-[#1E5A8E] hover:bg-[#2B6FA8] text-white'}`}
                    >
                        <span className="text-xl font-medium">Método de Pagamento</span>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </button>
                </div>
            </main>
        </div>
    );
}

export default Pedidos;
