import React from "react";
import Limao from "./Image/lemon.webp"
import "./Lobster.css"

function App({ goToApp }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white overflow-hidden">
            {/* Imagens decorativas */}
            <img
                src={Limao}
                alt="limão esquerdo"
                className="absolute -bottom-8 left-0 justify-items-start w-190 -z-10"
            />
            
            <img
                src={Limao}
                alt="limão direito"
                className="absolute -top-6 -z-10 right-0 w-190 rotate-180"
            />

            {/* Título */}
            <h1 className="relative z-10 text-7xl font-lobster font-bold text-black ">
                LANCHONETE
            </h1>
            <p className="relative z-10 text-orange-400 font-lobster text-3xl -mt-2 mb-8">
                criando usuário
            </p>

            {/* Card */}
            <div className="bg-[#FCD672] p-8 rounded-2xl z-10 shadow-md w-200 text-center">
                <form className="flex flex-col justify-center items-center gap-3">
                    <label className="text-black text-2xl">
                        NOME DO USUÁRIO
                    </label>
                    <input
                        type="text"
                        className="rounded-md w-150 bg-white p-2 focus:outline-none"
                        placeholder="Digite seu nome"
                    />

                    <label className="text-black text-2xl ">EMAIL</label>
                    <input
                        type="email"
                        className="rounded-md w-150 bg-white p-2 focus:outline-none"
                        placeholder="Digite seu email"
                    />

                    <label className="text-black  text-2xl">SENHA</label>
                    <input
                        type="password"
                        className="rounded-md w-150 bg-white p-2 focus:outline-none"
                        placeholder="Digite sua senha"
                    />

                    <label className="text-black text-2xl">
                        CONFIRMAR SENHA
                    </label>
                    <input
                        type="password"
                        className="rounded-md w-150 p-2 focus:outline-none bg-white"
                        placeholder="Confirme sua senha"
                    />

                    <button
                        type="submit"
                        className="bg-[#FFF7DE] text-2xl text-black font-semibold rounded-md w-40 mt-4 py-1 hover:bg-gray-100 transition h-10"
                    >
                        Entrar
                    </button>
                    <button
                        type="button"
                        onClick={goToApp}
                        className="bg-white w-30 h-10 text-[#FFDD7A] text-sm rounded-full px-4 py-0.5 mt-1 border border-orange-300 hover:bg-orange-50 transition"
                    >
                        Voltar
                    </button>
                </form>
            </div>
        </div>
    );
}

export default App;
