import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase.js";
import "./Lobster.css";

function Descricao() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [produto, setProduto] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [nomeUsuario, setNomeUsuario] = useState("");
    const TABLE_NAME = import.meta.env.VITE_TB_PRODUTOS || 'produto';

    // Carrega usuário para header
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

    // Busca produto por id
    useEffect(() => {
        const carregar = async () => {
            setCarregando(true);
            setErro("");
            const { data, error } = await supabase
                .from(TABLE_NAME)
                .select('*')
                .eq('id_produto', id)
                .single();
            if (error) {
                console.error('Erro ao carregar produto:', error);
                setErro('Não foi possível carregar o produto.');
                setProduto(null);
            } else {
                setProduto(data);
            }
            setCarregando(false);
        };
        if (id) carregar();
    }, [id, TABLE_NAME]);

    // Resolve imagem (URL direta ou caminho no Storage)
    const resolveImagem = (rawImg) => {
        if (!rawImg) return '';
        if (/^https?:\/\//i.test(rawImg)) return rawImg;
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
        return data?.publicUrl || '';
    };

    const nome = produto?.nome_produto || produto?.nome || 'Produto';
    const descricao = produto?.descricao || 'Sem descrição disponível.';
    const precoRaw = produto?.preco ?? produto?.valor ?? produto?.preco_unitario;
    const precoNum = typeof precoRaw === 'string' ? Number(precoRaw.replace(',', '.')) || 0 : Number(precoRaw) || 0;
    const imgSrc = resolveImagem(produto?.foto || produto?.imagem || produto?.imagem_url || produto?.url);

    return (
        <div className="flex flex-col min-h-screen w-screen bg-[#FFF7DE] text-[#002C5F]">
            {/* Header */}
            <header className="bg-[#005a8c] text-white app-header">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-[#005a8c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <span className="text-xl">{nomeUsuario || '*USUÁRIO*'}</span>
                </div>
                <nav className="flex gap-12 text-lg">
                    <Link to="/Pedidos" className="hover:underline">PEDIDOS</Link>
                    <Link to="/FormaDePagamento" className="hover:underline">CONTA</Link>
                    <button onClick={() => navigate(-1)} className="hover:underline">VOLTAR</button>
                </nav>
            </header>

            {/* Conteúdo principal */}
            <main className="flex flex-col items-center justify-center flex-1 px-8 py-12">
                {carregando && (<p className="text-gray-600">Carregando...</p>)}
                {erro && !carregando && (<p className="text-red-600">{erro}</p>)}
                {!carregando && !erro && produto && (
                    <div className="flex flex-col md:flex-row bg-[#FFF7DE] max-w-5xl items-center gap-10 p-6 rounded-lg shadow-lg">
                        {/* Imagem do Produto */}
                        <div className="flex flex-col items-center">
                            {imgSrc ? (
                                <img src={imgSrc} alt={nome} className="w-80 h-auto object-contain rounded-lg border-4 border-[#FFDCA2]" />
                            ) : (
                                <div className="w-80 h-56 bg-white/70 rounded-lg mb-4 flex items-center justify-center text-gray-500 text-sm">
                                    Sem imagem
                                </div>
                            )}
                            <Link to="/Escolhe" className="bg-[#005a8c] text-white font-semibold text-lg py-2 px-10 mt-10 rounded-md hover:bg-[#00456b] transition-all duration-300">
                                Continuar
                            </Link>
                        </div>

                        {/* Texto do Produto */}
                        <div className="text-center md:text-left">
                            <h2 className="text-5xl font-bold text-black mb-4">{nome}</h2>
                            <p className="text-2xl text-black mb-4">
                                <span className="font-bold">PREÇO:</span> <span className="font-bold">{precoNum.toFixed(2)}</span>
                            </p>
                            <p className="text-[#005a8c] font-bold mb-2 text-2xl">Descrição:</p>
                            <p className="text-[#002C5F] leading-relaxed text-lg max-w-md">
                                {descricao}
                            </p>
                        </div>
                    </div>
                )}
            </main>

            {/* Rodapé */}
            <footer className="text-center text-[#005a8c] text-sm pb-4">Sesc–Senac</footer>
        </div>
    );
}

export default Descricao;
