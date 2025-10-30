import React from "react";
import AccordionItem from "./components/AcocordionItem";

const faqs = [
  {
    pergunta: "O que é React?",
    resposta:
      "O React é uma biblioteca JavaScript para construir interfaces de usuário de maneira declarativa e eficiente.",
  },
  {
    pergunta: "O que é um Hook em React?",
    resposta:
      'Hooks são funções especiais que permitem "conectar-se" aos recursos de estado  e ciclo de vida do React."',
  },
  {
    pergunta: "O que é useState?",
    resposta:
      'O useState é um Hook que permite adicionar uma variavel de estado a componentes de função, tornando-os "stateful".',
  },
  {
    pergunta: "O que é Tailwind CSS?",
    resposta:
      "Tailwind CSS é um framework CSS utilitário que permite construir rapidamente interfaces personalizadas diretamente no HTML.",
  },
  {
    pergunta: "Como funciona o sistema de classes do Tailwind?",
    resposta:
      "O Tailwind utiliza classes utilitárias que aplicam estilos específicos, permitindo a composição rápida de estilos sem escrever CSS personalizado.",
  },
  {
    pergunta: "O que é Vite?",
    resposta:
      "Vite é uma ferramenta de construção rápida para projetos web modernos, oferecendo um ambiente de desenvolvimento otimizado e construção eficiente.",
  },
];

function App() {
  return (
    <div className="min-h-screen bg-pink-100 flex  items-center justify-center p-4">
      <div className="bg-pink-500 rounded-X1 shadow-lg w-full max-w-2xl overflow-hidden">
        <h1 className="text-3xl font-bold text-center text-pink-800 py-6  border-b border-pink-400">
          Perguntas Frequentes 
        </h1>
        <div className="py-4">
          {faqs.map((faq, index) => (
          <AccordionItem
            key={index}
            pergunta={faq.pergunta}
            resposta={faq.resposta}
          />
        ))}
        </div>
      </div>
    </div>
  );
};

export default App;