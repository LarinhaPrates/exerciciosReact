import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import senacLogo from "./Image/senac.png";
import sescLogo from "./Image/sesc.png";
import cafeImg from "./Image/croisant.png";
import "./Lobster.css"
import { supabase } from "../lib/supabase.js";

function App() {
    const [nomeUsuario, setNomeUsuario] = useState("");
    const navigate = useNavigate();
    // função simples pra voltar uma página
    const handleVoltar = () => {
        window.history.back();
    };

    const handleSair = async () => {
        const confirmar = window.confirm("Deseja realmente sair da sua conta?");
        if (!confirmar) return;
        try {
            await supabase.auth.signOut();
        } catch (e) {
            // opcional: exibir um toast/alerta
        } finally {
            navigate("/");
        }
    };

    useEffect(() => {
        let mounted = true;
        // busca inicial do usuário logado
        const fetchUser = async () => {
            const { data, error } = await supabase.auth.getUser();
            if (error) {
                // opcional: logar erro em dev
                return;
            }
            const user = data?.user;
            if (mounted && user) {
                const nome = user.user_metadata?.nome || user.email?.split("@")[0] || "";
                setNomeUsuario(nome);
            }
        };
        fetchUser();

        // subscrição para mudanças de auth
        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            const user = session?.user;
            const nome = user?.user_metadata?.nome || user?.email?.split("@")[0] || "";
            setNomeUsuario(nome);
        });

        return () => {
            mounted = false;
            listener?.subscription?.unsubscribe?.();
        };
    }, []);

    return (
        <div className="flex flex-col h-screen bg-[#FCD471] font-sans">
            {/* Barra superior */}
            <header className="bg-[#226CA7] text-white app-header">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 border-2 border-white rounded-full flex items-center justify-center text-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                    </div>
                    <span className="text-xl">{nomeUsuario || "*USUÁRIO*"}</span>
                </div>

                <nav className="flex gap-12 text-lg">
                    <Link to="/Pedidos" className="hover:underline">PEDIDOS</Link>
                    <Link to="/Pagamento" className="hover:underline">CONTA</Link>
                    <button
                        onClick={handleSair}
                        className="hover:underline text-[#FFDD7A]"
                    >
                        SAIR
                    </button>
                </nav>
            </header>

            {/* Conteúdo principal */}
            <main className="flex flex-col items-center justify-center flex-1 text-center">
                <h1 className="text-7xl font-lobster text-[#226CA7] mb-30 mt-0 leading-snug">
                    ESCOLHA O<br />ESTABELECIMENTO
                </h1>

                {/* Logos */}
                <div className="flex gap-12 mb-10">
                    <button onClick={() => navigate('/ProdutosSenac')} className="group">
                        <div className="w-64 h-48 bg-white rounded-xl p-3 shadow-md flex items-center justify-center group-hover:scale-105 transition-transform">
                            <img
                                src={senacLogo}
                                alt="Senac"
                                className="max-w-full max-h-full object-contain"
                            />
                        </div>
                    </button>

                    <button onClick={() => navigate('/ProdutosSesc')} className="group">
                        <div className="w-64 h-48 bg-white rounded-xl p-3 shadow-md flex items-center justify-center group-hover:scale-105 transition-transform">
                            <img
                                src={sescLogo}
                                alt="Sesc"
                                className="max-w-full max-h-full object-contain"
                            />
                        </div>
                    </button>
                </div>

                {/* Café e croissant */}
                <img
                    src={cafeImg}
                    alt="Café e croissant"
                    className="w-80 h-auto drop-shadow-md"
                />
            </main>
        </div>
    );
}

export default App;
