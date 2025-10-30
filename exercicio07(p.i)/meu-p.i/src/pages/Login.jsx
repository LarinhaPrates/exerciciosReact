import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const navigate = useNavigate();
    const [usuario, setUsuario] = useState("");
    const [senha, setSenha] = useState("");

    const handleLogin = (e) => {
        e.preventDefault();
        if (usuario && senha) {
            navigate("/pedidos");
        } else {
            alert("Preencha todos os campos!");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen relative text-center">
            {/* Título */}
            <h1 className="text-4xl font-bold text-white mb-8">LANCHONETE</h1>

            {/* Card central */}
            <div className="bg-white p-8 rounded-xl shadow-md w-80">
                <img
                    src="https://upload.wikimedia.org/wikipedia/commons/8/8a/Senac_logo.svg"
                    alt="Senac"
                    className="w-24 mx-auto mb-4"
                />

                <form onSubmit={handleLogin}>
                    <input
                        type="text"
                        placeholder="USUÁRIO"
                        className="w-full mb-4 px-4 py-2 rounded-md shadow-sm border focus:outline-none"
                        value={usuario}
                        onChange={(e) => setUsuario(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="SENHA"
                        className="w-full mb-2 px-4 py-2 rounded-md shadow-sm border focus:outline-none"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                    />

                    <a
                        href="#"
                        className="text-xs text-gray-500 underline hover:text-gray-700"
                    >
                        Esqueceu a senha?
                    </a>

                    <button
                        type="submit"
                        className="mt-4 bg-[#FF7A7A] hover:bg-[#ff5959] text-white w-full py-2 rounded-md font-semibold"
                    >
                        Entrar
                    </button>
                </form>

                <img
                    src="https://upload.wikimedia.org/wikipedia/commons/d/d9/SESC_logo.svg"
                    alt="Sesc"
                    className="w-24 mx-auto mt-4"
                />

                <p className="text-sm mt-4 text-gray-700">
                    Não tem conta?{" "}
                    <a href="#" className="text-[#4DE0E0] hover:underline">
                        Criar
                    </a>
                </p>
            </div>

            {/* Decorações */}
            <img
                src="https://cdn-icons-png.flaticon.com/512/2290/2290982.png"
                alt="Bolo"
                className="absolute bottom-0 left-10 w-32"
            />
            <img
                src="https://cdn-icons-png.flaticon.com/512/415/415682.png"
                alt="Melancia"
                className="absolute bottom-0 right-10 w-32"
            />
        </div>
    );
}
