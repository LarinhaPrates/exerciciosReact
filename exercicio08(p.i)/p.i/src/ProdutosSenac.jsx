import React, { useEffect, useState } from "react";
import { useCarrinho } from "./CarrinhoContext";
import senac from "./Image/senac.png";
import "./Lobster.css";
import { supabase } from "../lib/supabase.js";
import { Link } from "react-router-dom";

function Produtos() {
    const { carrinho, adicionarProduto, removerProduto } = useCarrinho();
    const [nomeUsuario, setNomeUsuario] = useState("");
    const [produtos, setProdutos] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const TABLE_NAME = import.meta.env.VITE_TB_PRODUTOS || 'produto';

    useEffect(() => {
        const fetchProdutos = async () => {
            setCarregando(true);
            setErro("");
            // Seleciona todas as colunas para evitar erro quando o PK não se chama "id"
            const resp = await supabase
                .from(TABLE_NAME)
                .select('*')
                .or('id_lanchonete.eq.2,id_lanchonete.eq.2');

            if (resp.error) {
                console.error('Erro ao carregar produtos:', resp.error, 'Tabela usada:', TABLE_NAME);
                setErro(`Não foi possível carregar os produtos (tabela: ${TABLE_NAME}). Detalhe: ${resp.error.message}`);
                setProdutos([]);
            } else {
                setProdutos(resp.data || []);
            }
            setCarregando(false);
        };
        fetchProdutos();
    }, [TABLE_NAME]);

    // Carregar nome do usuário logado (user_metadata.nome) e manter sincronizado com a sessão
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

    const getQuantidade = (nomeProduto) => {
        const produto = carrinho.find(item => item.nome === nomeProduto);
        return produto ? produto.quantidade : 0;
    };

    return (
        <div className="flex flex-col min-h-screen w-screen bg-[#FFF7DE]">
            {/* Header */}
            <header className="bg-[#005a8c] text-white app-header">
                <div className="flex items-center gap-4">
                    {/* Ícone de usuário */}
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-8 h-8 text-[#005a8c]"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                        </svg>
                    </div>
                    <span className="text-xl">{nomeUsuario || "*USUÁRIO*"}</span>
                </div>

                <nav className="flex gap-12 text-lg">
                    <Link to="/Pedidos" className="hover:underline">PEDIDOS</Link>
                    <Link to="/FormaDePagamento" className="hover:underline">CONTA</Link>
                    <Link to="/" className="hover:underline">VOLTAR</Link>
                </nav>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center py-8 px-4">
                {/* Logo SESC */}
                <img
                    src={senac}
                    alt="Senac"
                    className="w-48 mb-8"
                />

                {/* Grid de Produtos */}
                {carregando && (
                    <p className="text-gray-600">Carregando produtos...</p>
                )}
                {erro && !carregando && (
                    <p className="text-red-600">{erro}</p>
                )}
                {!carregando && !erro && (
                    <div className="grid grid-cols-3 gap-8 max-w-7xl w-full mb-12">
                        {produtos.map((produto, idx) => {
                            const nome = produto.nome || produto.nome_produto || produto.nomeProduto || produto.titulo || produto.name || `produto-${idx}`;
                            // Resolve URL da imagem a partir de vários formatos possíveis (URL direta ou caminho do Storage)
                            const rawImg = produto.imagem || produto.imagem_url || produto.imagemUrl || produto.url_imagem || produto.foto || produto.foto_url || produto.imagem_produto || produto.img || produto.image || produto.url || '';
                            let imagemSrc = '';
                            if (rawImg) {
                                if (/^https?:\/\//i.test(rawImg)) {
                                    imagemSrc = rawImg; // Já é uma URL completa
                                } else {
                                    // Gerar URL pública do Supabase Storage
                                    let bucket = import.meta.env.VITE_SUPABASE_BUCKET || 'public';
                                    let path = rawImg;
                                    if (!import.meta.env.VITE_SUPABASE_BUCKET && rawImg.includes('/')) {
                                        const [maybeBucket, ...rest] = rawImg.split('/');
                                        if (maybeBucket && rest.length) {
                                            bucket = maybeBucket;
                                            path = rest.join('/');
                                        }
                                    }
                                    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
                                    imagemSrc = data?.publicUrl || '';
                                }
                            }
                            const precoRaw = produto.preco ?? produto.valor ?? produto.preco_unitario ?? produto.precoUnitario;
                            const precoNum = typeof precoRaw === 'string'
                                ? Number(precoRaw.replace(',', '.')) || 0
                                : Number(precoRaw) || 0;
                            const idProduto = produto.id_produto || produto.id || produto.produto_id || produto.codigo || `${nome}-${idx}`;
                            const idLanchonete = produto.id_lanchonete || 2; // default Senac = 2
                            const quantidade = getQuantidade(nome);
                            return (
                                <div
                                    key={idProduto}
                                    className="bg-[#FFDD7A] rounded-lg shadow-lg p-6 flex flex-col items-center"
                                >
                                    {/* Imagem do Produto */}
                                    {imagemSrc ? (
                                        <Link to={`/Descricao/${idProduto}`}>
                                            <img
                                                src={imagemSrc}
                                                alt={nome}
                                                className="w-40 h-32 object-cover rounded-lg mb-4 hover:opacity-90 transition"
                                            />
                                        </Link>
                                    ) : (
                                        <div className="w-40 h-32 bg-white/70 rounded-lg mb-4 flex items-center justify-center text-gray-500 text-sm">
                                            Sem imagem
                                        </div>
                                    )}

                                    {/* Nome do Produto */}
                                    <p className="text-gray-700 font-semibold text-sm mb-2">
                                        NOME: <span className="font-normal">{nome}</span>
                                    </p>

                                    {/* Preço */}
                                    <p className="text-gray-700 font-semibold text-sm mb-4">
                                        PREÇO: <span className="font-normal">{precoNum.toFixed(2)}</span>
                                    </p>
                                    <Link to={`/Descricao/${idProduto}`} className="text-[#005a8c] text-sm underline mb-2">Ver detalhes</Link>

                                    {/* Botões de Quantidade */}
                                    <div className="flex items-center gap-4">
                                        {/* Botão + */}
                                        <button
                                            onClick={() => adicionarProduto({ nome, preco: precoNum, imagem: imagemSrc, id_produto: idProduto, id_lanchonete: idLanchonete })}
                                            className="w-10 h-10 bg-white border-2 border-black rounded-full flex items-center justify-center hover:bg-gray-100 transition-all"
                                        >
                                            <span className="text-2xl font-bold">+</span>
                                        </button>

                                        {/* Quantidade */}
                                        <span className="text-2xl font-bold min-w-8 text-center">
                                            {quantidade}
                                        </span>

                                        {/* Botão - */}
                                        <button
                                            onClick={() => removerProduto(nome)}
                                            className="w-10 h-10 bg-white border-2 border-black rounded-full flex items-center justify-center hover:bg-gray-100 transition-all"
                                        >
                                            <span className="text-2xl font-bold">−</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
                {!carregando && !erro && produtos.length === 0 && (
                    <p className="text-gray-700">Nenhum produto encontrado para esta lanchonete.</p>
                )}

                {/* Botão Continuar */}
                {carrinho.length > 0 && (
                    <Link
                        to="/Pedidos"
                        className="bg-[#005a8c] hover:bg-[#004870] text-white font-bold text-xl py-4 px-16 rounded-lg shadow-lg transition-all duration-300"
                    >
                        Continuar para Pagamento
                    </Link>
                )}
            </main>
        </div>
    );
}

export default Produtos;
