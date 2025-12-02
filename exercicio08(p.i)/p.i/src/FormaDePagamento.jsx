import React, { useState, useEffect } from "react";
import { useCarrinho } from "./CarrinhoContext";
import { supabase } from "../lib/supabase.js";
import { Link, useNavigate } from "react-router-dom";
import "./Lobster.css";

function FormaDePagamento() {
    const { carrinho, calcularTotal, limparCarrinho } = useCarrinho();
    const [metodoPagamento, setMetodoPagamento] = useState("");
    const [nomeUsuario, setNomeUsuario] = useState("");
    const [salvando, setSalvando] = useState(false);
    const [erroSalvar, setErroSalvar] = useState("");
    const navigate = useNavigate();

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

    // Salvar pedido no Supabase
    const handleFinalizar = async () => {
        if (!metodoPagamento || carrinho.length === 0 || salvando) return;
        setErroSalvar("");
        
        // Validar se todos os produtos são da mesma lanchonete
        const lanchonetes = [...new Set(carrinho.map(item => item.id_lanchonete).filter(Boolean))];
        if (lanchonetes.length > 1) {
            setErroSalvar('Erro: O carrinho contém produtos de diferentes lanchonetes. Por favor, escolha produtos de apenas uma lanchonete.');
            return;
        }
        if (lanchonetes.length === 0) {
            setErroSalvar('Erro: Nenhum produto no carrinho possui lanchonete associada.');
            return;
        }
        
        setSalvando(true);
        try {
            const TABLE_PEDIDOS = import.meta.env.VITE_TB_PEDIDOS || 'pedido';
            const { data: userData } = await supabase.auth.getUser();
            const user = userData?.user;
            if (!user) {
                setErroSalvar('Usuário não autenticado.');
                setSalvando(false);
                return;
            }

            // Tenta buscar id_escola na tabela perfil; se não houver linha, faz fallback para user_metadata
            const { data: perfilRows, error: erroPerfil } = await supabase
                .from('perfil')
                .select('id_escola')
                .eq('id_user', user.id)
                .limit(1);

            let idEscola = perfilRows?.[0]?.id_escola;
            if (erroPerfil) {
                // Se for erro de RLS/permissão ou outro, apenas registra e tenta fallback
                console.warn('Falha ao consultar perfil, usando fallback user_metadata:', erroPerfil);
            }
            if (!idEscola) {
                idEscola = user.user_metadata?.id_escola || user.user_metadata?.escola_id || user.user_metadata?.idEscola || null;
            }
            // Fallback extra: derivar id_escola via lanchonete do carrinho (primeiro item)
            if (!idEscola && carrinho.length > 0) {
                const primeiro = carrinho[0];
                const idLanchonete = primeiro.id_lanchonete;
                if (idLanchonete) {
                    const { data: dadosLanchonete, error: erroLanch } = await supabase
                        .from('lanchonete')
                        .select('id_escola')
                        .eq('id_lanchonete', idLanchonete)
                        .single();
                    if (erroLanch) {
                        console.warn('Falha ao buscar lanchonete para obter id_escola:', erroLanch);
                    } else {
                        idEscola = dadosLanchonete?.id_escola || idEscola;
                    }
                }
            }
            if (!idEscola) {
                setErroSalvar('Não foi possível buscar seu perfil ou identificar id_escola no usuário.');
                setSalvando(false);
                return;
            }

            // Serializa itens do carrinho (schema tem coluna itens text)
            const itensArray = carrinho.map(({ id_produto, nome, preco, quantidade, id_lanchonete }) => ({
                id_produto: id_produto || null,
                nome_produto: nome,
                id_lanchonete: id_lanchonete || null,
                quantidade,
                preco_unitario: preco,
                subtotal: Number((preco * quantidade).toFixed(2))
            }));
            const itensStr = JSON.stringify(itensArray);
            const total = Number(calcularTotal().toFixed(2));

            // Obter id_lanchonete do primeiro item do carrinho
            const idLanchonete = carrinho.length > 0 ? carrinho[0].id_lanchonete : null;

            const payload = {
                id_escola: idEscola,          // Conforme solicitado: vindo do perfil
                id_user_cliente: user.id,     // FK para auth.users
                id_lanchonete: idLanchonete,  // FK para tabela lanchonete
                status_pedido: 'Esperando Pagamento',
                valor_total: total,
                itens: itensStr,
            };

            const { data: insertedPedido, error: erroPedido } = await supabase
                .from(TABLE_PEDIDOS)
                .insert([payload])
                .select('id_pedido');

            if (erroPedido) {
                console.error('Erro ao salvar pedido:', erroPedido);
                setErroSalvar(erroPedido.message || 'Não foi possível salvar o pedido.');
                setSalvando(false);
                return;
            }

            const idPedido = insertedPedido?.[0]?.id_pedido;
            if (!idPedido) {
                setErroSalvar('Pedido salvo sem retorno de id_pedido.');
                setSalvando(false);
                return;
            }

            // Inserir itens normalizados na tabela itens_pedido
            const itensPedidoRows = carrinho
                .filter(item => Number.isFinite(Number(item.id_produto)))
                .map(item => ({
                    id_pedido: idPedido,
                    id_produto: item.id_produto,
                    quantidade: item.quantidade,
                    preco_unitario: item.preco,
                }));

            if (itensPedidoRows.length === 0) {
                console.warn('Nenhum item com id_produto válido para inserir em itens_pedido.');
            } else {
                const { error: erroItens } = await supabase
                    .from('itens_pedido')
                    .insert(itensPedidoRows);
                if (erroItens) {
                    console.error('Erro ao salvar itens_pedido:', erroItens);
                    setErroSalvar('Pedido criado, mas falha ao salvar itens: ' + (erroItens.message || '')); // continua fluxo
                }
            }
            limparCarrinho();
            navigate('/Confirmado');
        } catch (e) {
            console.error('Exceção ao salvar pedido:', e);
            setErroSalvar(e.message || String(e));
            setSalvando(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen w-screen bg-[#9ba4d0]">
            {/* Header */}
            <header className="bg-[#005a8c] text-white app-header">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-[#005a8c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <span className="text-xl">{nomeUsuario || "*USUÁRIO*"}</span>
                </div>
                <nav className="flex gap-12 text-lg">
                    <Link to="/Pedidos" className="hover:underline">PEDIDOS</Link>
                    <Link to="/Pagamento" className="hover:underline">CONTA</Link>
                    <button onClick={() => navigate(-1)} className="hover:underline">VOLTAR</button>
                </nav>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center px-8">
                {/* Título */}
                <h1 className="text-7xl font-bold text-white font-lobster mb-8">
                    PAGAMENTO
                </h1>

                {/* Ícone de pagamento */}
                <div className="w-48 h-48 bg-white rounded-full flex items-center justify-center mb-12 border-8 border-[#005a8c]">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-28 h-28 text-[#005a8c]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                    </svg>
                </div>

                {/* Botões de Pagamento */}
                <div className="grid grid-cols-2 gap-8 mb-12">
                    {/* PIX */}
                    <button
                        onClick={() => setMetodoPagamento("PIX")}
                        className={`${metodoPagamento === "PIX"
                                ? "bg-white text-[#005a8c]"
                                : "bg-[#005a8c] text-white"
                            } font-bold text-2xl py-4 px-16 rounded-lg shadow-lg hover:bg-white hover:text-[#005a8c] transition-all duration-300 flex items-center gap-4`}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-8 h-8"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path d="M7.4 2.5l-1.9 1.9 5.5 5.5-5.5 5.5 1.9 1.9 5.5-5.5 5.5 5.5 1.9-1.9-5.5-5.5 5.5-5.5-1.9-1.9-5.5 5.5z" />
                        </svg>
                        PIX
                    </button>

                    {/* CRÉDITO */}
                    <button
                        onClick={() => setMetodoPagamento("CREDITO")}
                        className={`${metodoPagamento === "CREDITO"
                                ? "bg-white text-[#005a8c]"
                                : "bg-[#005a8c] text-white"
                            } font-bold text-2xl py-4 px-16 rounded-lg shadow-lg hover:bg-white hover:text-[#005a8c] transition-all duration-300 flex items-center gap-4`}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-8 h-8"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                            />
                        </svg>
                        CRÉDITO
                    </button>

                    {/* DÉBITO */}
                    <button
                        onClick={() => setMetodoPagamento("DEBITO")}
                        className={`${metodoPagamento === "DEBITO"
                                ? "bg-white text-[#005a8c]"
                                : "bg-[#005a8c] text-white"
                            } font-bold text-2xl py-4 px-16 rounded-lg shadow-lg hover:bg-white hover:text-[#005a8c] transition-all duration-300 flex items-center gap-4`}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-8 h-8"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                            />
                        </svg>
                        DÉBITO
                    </button>


                    {/* DINHEIRO */}
                    <button
                        onClick={() => setMetodoPagamento("DINHEIRO")}
                        className={`${metodoPagamento === "DINHEIRO"
                            ? "bg-white text-[#005a8c]"
                            : "bg-[#005a8c] text-white"
                            } font-bold text-2xl py-4 px-16 rounded-lg shadow-lg hover:bg-white hover:text-[#005a8c] transition-all duration-300 flex items-center gap-4`}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-8 h-8"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0-00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                        </svg>
                        DINHEIRO
                    </button>

                </div>

                {/* Resumo do Carrinho */}
                {carrinho.length > 0 && (
                    <div className="bg-white rounded-lg shadow-lg p-6 mb-8 max-w-2xl w-full">
                        <h2 className="text-2xl font-bold text-[#005a8c] mb-4">Itens do Pedido:</h2>
                        {carrinho.map((item, index) => (
                            <div key={index} className="flex justify-between items-center py-2 border-b">
                                <span className="text-gray-700">{item.nome} x{item.quantidade}</span>
                                <span className="text-gray-900 font-semibold">R$ {(item.preco * item.quantidade).toFixed(2)}</span>
                            </div>
                        ))}
                        {!!erroSalvar && (
                            <p className="text-red-600 mt-4">{erroSalvar}</p>
                        )}
                    </div>
                )}

                {/* Footer com Total e Finalizar */}
                <div className="flex gap-12 items-center">
                    {/* Total */}
                    <div className="bg-[#005a8c] text-white font-bold text-2xl py-4 px-12 rounded-lg shadow-lg">
                        TOTAL = R$ {calcularTotal().toFixed(2)}
                    </div>

                    {/* Botão Finalizar */}
                    <button
                        disabled={!metodoPagamento || carrinho.length === 0 || salvando}
                        onClick={handleFinalizar}
                        className={`${!metodoPagamento || carrinho.length === 0
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-green-600 hover:bg-green-700'} text-white font-bold text-xl py-4 px-12 rounded-lg shadow-lg flex items-center gap-3 transition-all duration-300`}
                    >
                        {salvando ? 'Salvando...' : 'Finalizar Pedido'}
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </button>
                </div>
            </main>
        </div>
    );
}

export default FormaDePagamento;
