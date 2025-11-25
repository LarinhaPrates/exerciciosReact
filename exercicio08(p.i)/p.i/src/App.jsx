import './App.css';
import React, { useState } from "react";
import sesc from "./Image/sesc.png";
import senac from "./Image/senac.png";
import bolo from "./Image/bolo.png";
import melancia from "./Image/melancia.png";
import "./Lobster.css";
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { supabase } from "../lib/supabase.js";

function App() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro("");
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });
      if (error) {
        setErro(error.message);
        return;
      }
      // Obtém usuário logado
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      let tipoConta = null;

      // Tenta buscar no perfil
      if (user?.id) {
        const { data: perfilRows, error: erroPerfil } = await supabase
          .from('perfil')
          .select('tipoConta')
          .eq('id_user', user.id)
          .limit(1);

        if (!erroPerfil) {
          tipoConta = perfilRows?.[0]?.tipoConta || null;
        }
        // Fallback: user metadata
        if (!tipoConta) {
          const metaTipo = user.user_metadata?.tipoConta || user.user_metadata?.tipoconta || null;
          tipoConta = metaTipo;
        }
      }

      // Decide rota por tipoConta
      if (typeof tipoConta === 'string') {
        const tcLower = tipoConta.toLowerCase();
        if (tcLower === 'admmaster') {
          navigate('/RelatoriosGerais');
        } else if (tcLower === 'adm') {
          navigate('/EscolhaAdm');
        } else {
          navigate('/EscolheAdm');
        }
      } else {
        // Sem tipo definido cai no fluxo padrão de usuário comum
        navigate('/Escolhe');
      }
    } catch (err) {
      setErro('Não foi possível entrar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-screen bg-[#9ba4d0] ">
      {/* Título */}
      <h1 className="absolute text-6xl font-bold text-white font-lobster top-40">
        LANCHONETE
      </h1>

      {/* Card de Login */}
      <div className="bg-white rounded-xl shadow-lg w-[350px] p-8 flex flex-col items-center text-center ">
        {/* Logo Senac */}
        <img
          src={senac}
          alt="Senac"
          className="w-24 mb-4"
        />

        <form onSubmit={handleLogin} className="w-full flex flex-col items-center">
          {/* Usuário */}
          <label className="text-gray-600 text-sm mb-1 self-start">EMAIL</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mb-4 px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />

          {/* Senha */}
          <label className="text-gray-600 text-sm mb-1 self-start">SENHA</label>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full mb-2 px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />

          {/* Esqueceu a senha */}
          <Link to="/EsqueceuSenha" className="text-xs text-gray-500 mb-3 hover:underline self-start">
            Esqueceu a senha?
          </Link>

          {erro && <p className="text-red-100 bg-red-500/80 rounded px-3 py-1 text-xs mb-2 w-full text-left">{erro}</p>}

          {/* Botão */}
          <button type="submit" disabled={loading} className="bg-red-400 hover:bg-red-500 disabled:opacity-60 text-white font-semibold py-2 px-6 rounded-full shadow inline-block w-full">
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        {/* Logo Sesc */}
        <img
          src={sesc}
          alt="Sesc"
          className="w-20 mt-5"
        />
      </div>

      {/* Criar conta */}
      <p className="absolute bottom-12 text-white">
        Não tem conta?{" "}
        <Link to="/Cadastrar" className="text-cyan-300 font-semibold hover:underline">
          Criar
        </Link>
      </p>

      {/* Imagem esquerda - bolo */}
      <img
        src={bolo}
        alt="Bolo"
        className="absolute bottom-0 left-0 w-64"
      />

      {/* Imagem direita - prato de melancia */}
      <img
        src={melancia}
        alt="Melancia"
        className="absolute bottom-0 right-0 w-64"
      />
    </div>
  );
}

export default App;
