import React from "react";
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import Bolo from "./Image/bolo.png";
import Melancia from "./Image/melancia.png";
import "./Lobster.css";
import Lanche from "./Image/lanche.png";
import Cafe from "./Image/cafe.png";

function EsqueceuSenha() {
    const navigate = useNavigate();
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#FFD26F] overflow-hidden relative">
            {/* Imagem decorativa - Melancia (canto inferior esquerdo) */}
            <img
                src={Cafe}
                alt="cafe"
                className="absolute z-10 bottom-4 -left-25 w-130 "
            />

            {/* Imagem decorativa - Lanche (canto superior direito) */}
            <img
                src={Lanche}
                alt="lanche"
                className="absolute z-10 -top-5 -right-10  w-140"
            />

            {/* Título */}
            <h1 className="relative z-9 text-6xl font-lobster text-[#536DBF] -mt-20 text-center">
                REDEFINIR
            </h1>
            <h1 className="relative z-9 text-6xl font-lobster text-[#536DBF] mb-30 text-center">
                SENHA:
            </h1>

            {/* Card */}
            <div className="bg-white p-8 rounded-2xl relative z-9 shadow-lg w-140 h-120 text-center">
                <form className="flex flex-col justify-center items-center gap-4">
                    {/* Campo Nova Senha */}
                    <label className="text-black mt-15 text-2xl">
                        NOVA SENHA:
                    </label>
                    <input
                        type="password"
                        className="rounded-md w-full bg-white p-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
                        placeholder="••••••••••••••••"
                    />

                    {/* Campo Confirmar Senha */}
                    <label className="ttext-black  text-2xl">
                        CONFIRMAR SENHA:
                    </label>
                    <input
                        type="password"
                        className="rounded-md w-full bg-white p-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
                        placeholder="••••••••••••••••"
                    />

                    {/* Botão Entrar */}
                    <button
                        type="submit"
                        className="bg-[#FF6B6B] text-white text-2xl font-semibold rounded-full w-32 mt-6 py-2 hover:bg-[#FF5252] transition shadow-md"
                    >
                        Entrar
                    </button>

                    {/* Botão Voltar */}
                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="text-[#FF6B6B] text-2xl mt-2 hover:underline"
                    >
                        Voltar
                    </button>
                </form>
            </div>

            {/* Links inferiores */}
            <div className="relative z-10 mt-6 text-center">
                <a href="#" className="text-[#8B7355] text-2xl hover:underline mx-2">
                    Sesc
                </a>
                <span className="text-[#8B7355]">-</span>
                <a href="#" className="text-[#8B7355] text-2xl hover:underline mx-2">
                    Senac
                </a>
            </div>
        </div>
    );
}

export default EsqueceuSenha;
