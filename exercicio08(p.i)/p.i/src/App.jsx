import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import React from "react";
import sesc from "./Image/sesc.png";
import senac from "./Image/senac.png";
import bolo from "./Image/bolo.png";
import melancia from "./Image/melancia.png";
import "./Lobster.css"

function App() {
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

        {/* Usuário */}
        <label className="text-gray-600 text-sm mb-1">USUARIO</label>
        <input
          type="text"
          className="w-full mb-4 px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        />

        {/* Senha */}
        <label className="text-gray-600 text-sm mb-1">SENHA</label>
        <input
          type="password"
          className="w-full mb-2 px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        />

        {/* Esqueceu a senha */}
        <a href="#" className="text-xs text-gray-500 mb-3 hover:underline self-start">
          Esqueceu a senha?
        </a>

        {/* Botão */}
        <button className="bg-red-400 hover:bg-red-500 text-white font-semibold py-2 px-6 rounded-full shadow">
          Entrar
        </button>

        {/* Logo Sesc */}
        <img
          src={sesc}
          alt="Sesc"
          className="w-20 mt-5"
        />
      </div>

      {/* Criar conta */}
      <p className="absolute bottom-45 text-white">
        Não tem conta?{" "}
        <a href="./Cadastrar" className="text-cyan-300 font-semibold hover:underline">
          Criar
        </a>
      </p>

      {/* Imagem esquerda - bolo */}
      <img
        src={bolo}
        alt="Bolo"
        className="absolute -bottom-10 left-0  w-100"
      />

      {/* Imagem direita - prato de melancia */}
      <img
        src={melancia}
        alt="Melancia"
        className="absolute -bottom-10 right-0 w-100"
      />
    </div>
  );
}

export default App;
