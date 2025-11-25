import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase.js";
import Limao from "./Image/lemon.webp";
import "./Lobster.css";

function Cadastrar() {
    const navigate = useNavigate();
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState("");
    const [sucesso, setSucesso] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErro("");
        setSucesso("");

        if (!email || !senha || !nome) {
            setErro("Preencha nome, e-mail e senha.");
            return;
        }
        if (senha !== confirmarSenha) {
            setErro("As senhas não coincidem.");
            return;
        }

        setLoading(true);
        try {
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                email,
                password: senha,
                options: {
                    data: { nome },
                },
            });

            if (signUpError) {
                setErro(signUpError.message);
                return;
            }

            const userId = signUpData?.user?.id;

            if (!userId) {
                setErro('Não foi possível obter o ID do usuário após cadastro.');
                return;
            }

            // Inserir perfil associado (tratando possíveis falhas de RLS)
            try {
                const { error: perfilError } = await supabase
                    .from('perfil')
                    .insert({
                        id_user: userId,
                        nome: nome,
                        tipoConta: 'aluno',
                    });
                if (perfilError) {
                    // Loga mas não bloqueia fluxo de cadastro básico
                    // eslint-disable-next-line no-console
                    console.warn('Falha ao inserir perfil:', perfilError);
                }
            } catch (eInserir) {
                // eslint-disable-next-line no-console
                console.warn('Exceção ao inserir perfil:', eInserir);
            }

            setSucesso(
                'Cadastro realizado com sucesso! Verifique seu e-mail para confirmar a conta, se necessário.'
            );

            // Redireciona após pequeno atraso
            setTimeout(() => navigate('/'), 1200);
        } catch (err) {
            setErro('Erro inesperado ao cadastrar. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const voltar = () => navigate(-1);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white overflow-hidden">
            {/* Imagens decorativas */}
            <img
                src={Limao}
                alt="limão esquerdo"
                className="absolute bottom-0 left-0 justify-items-start w-190 "
            />
            
            <img
                src={Limao}
                alt="limão direito"
                className="absolute -top-6 z-9 right-0 w-190 rotate-180"
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
                <form className="flex flex-col justify-center items-center gap-3" onSubmit={handleSubmit}>
                    <label className="text-black text-2xl">
                        NOME DO USUÁRIO
                    </label>
                    <input
                        type="text"
                        className="rounded-md flex w-150 bg-white p-2 focus:outline-none"
                        placeholder="Digite seu nome"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                    />

                    <label className="text-black text-2xl ">EMAIL</label>
                    <input
                        type="email"
                        className="rounded-md w-150 flex bg-white p-2 focus:outline-none"
                        placeholder="Digite seu email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <label className="text-black  text-2xl">SENHA</label>
                    <input
                        type="password"
                        className="rounded-md w-150 flex bg-white p-2 focus:outline-none"
                        placeholder="Digite sua senha"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                    />

                    <label className="text-black text-2xl">
                        CONFIRMAR SENHA
                    </label>
                    <input
                        type="password"
                        className="rounded-md w-150 p-2 focus:outline-none bg-white"
                        placeholder="Confirme sua senha"
                        value={confirmarSenha}
                        onChange={(e) => setConfirmarSenha(e.target.value)}
                    />

                    {erro && (
                        <p className="text-red-600 text-sm mt-1 max-w-88">{erro}</p>
                    )}
                    {sucesso && (
                        <p className="text-green-700 text-sm mt-1 max-w-88">{sucesso}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-[#FFF7DE] text-2xl text-black font-semibold rounded-md w-40 mt-4 py-1 hover:bg-gray-100 transition h-10 disabled:opacity-50"
                    >
                        {loading ? "Cadastrando..." : "Cadastrar"}
                    </button>
                    <button
                        type="button"
                        onClick={voltar}
                        className="bg-white w-30 h-10 text-[#FFDD7A] text-sm rounded-full px-4 py-0.5 mt-1 border border-orange-300 hover:bg-orange-50 transition"
                    >
                        Voltar
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Cadastrar;
