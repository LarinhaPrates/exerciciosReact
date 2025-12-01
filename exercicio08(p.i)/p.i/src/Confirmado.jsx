import React from "react";
import { Link } from "react-router-dom";
import "./Lobster.css";

function PedidoConfirmado() {
    return (
        <div className="flex flex-col min-h-screen w-screen bg-[#9dc6a7]">
            {/* Header */}
            <header className="app-header">
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center text-center px-6">
                {/* Título */}
                <h1 className="text-6xl font-bold text-white font-lobster mb-12">
                    SEU PEDIDO FOI CONFIRMADO!
                </h1>
                <h1 className="text-6xl font-bold text-white font-lobster mb-12">
                    FOI CONFIRMADO!
                </h1>

                {/* Ícone de confirmação */}
                <div className="w-44 h-44 bg-white rounded-full flex items-center justify-center mb-8 border-8 border-[#4b9c69]">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-24 h-24 text-[#4b9c69]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                </div>

                {/* Caixa de mensagem */}
                <div className="bg-white text-center rounded-xl shadow-lg px-8 py-8 max-w-lg">
                    <h2 className="text-2xl font-bold mb-4">
                        Seu pedido foi confirmado com sucesso!
                    </h2>
                    <p className="text-gray-700 mb-4">
                        Agora é só realizar o pagamento que você selecionou no pedido,
                        e retirar seu lanche!
                    </p>
                    <p className="italic font-bold text-gray-600 mb-6">
                        Obrigado pela compreensão!
                    </p>

                    {/* Botão voltar */}
                    <Link
                        to="/Escolhe"
                        className="bg-[#4b9c69] text-white font-semibold px-8 py-3 rounded-lg shadow hover:bg-[#3c8056] transition-all duration-300 inline-block"
                    >
                        Voltar
                    </Link>
                </div>

                {/* Rodapé */}
                <footer className="mt-12 text-white text-lg underline">
                    Sesc - Senac
                </footer>
            </main>
        </div>
    );
}

export default PedidoConfirmado;
