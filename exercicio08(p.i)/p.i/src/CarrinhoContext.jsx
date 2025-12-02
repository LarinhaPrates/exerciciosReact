import React, { createContext, useState, useContext } from 'react';
import { Link } from 'react-router-dom';

const CarrinhoContext = createContext();

export function CarrinhoProvider({ children }) {
    const [carrinho, setCarrinho] = useState([]);
    const [mensagemErro, setMensagemErro] = useState('');

    const adicionarProduto = (produto) => {
        // Validar lanchonete antes de adicionar
        if (carrinho.length > 0) {
            const idLanchoneteProduto = produto.id_lanchonete;
            const idLanchoneteCarrinho = carrinho[0].id_lanchonete;
            
            // Se o produto tem lanchonete diferente da que já está no carrinho
            if (idLanchoneteProduto && idLanchoneteCarrinho && idLanchoneteProduto !== idLanchoneteCarrinho) {
                setMensagemErro('Não é possível adicionar produtos de lanchonetes diferentes ao carrinho.');
                setTimeout(() => setMensagemErro(''), 4000);
                return false; // Retorna false para indicar que não foi adicionado
            }
        }

        setCarrinho(prev => {
            const idRef = produto.id_produto || produto.id || produto.nome; // fallback nome
            const produtoExistente = prev.find(item => (item.id_produto || item.id || item.nome) === idRef);
            if (produtoExistente) {
                return prev.map(item =>
                    (item.id_produto || item.id || item.nome) === idRef
                        ? { ...item, quantidade: item.quantidade + 1 }
                        : item
                );
            }
            return [...prev, { ...produto, quantidade: 1 }];
        });
        return true; // Retorna true para indicar que foi adicionado com sucesso
    };

    const removerProduto = (identificador) => {
        setCarrinho(prev => {
            const produto = prev.find(item => (item.id_produto || item.id || item.nome) === identificador || item.nome === identificador);
            if (produto && produto.quantidade > 1) {
                return prev.map(item =>
                    ((item.id_produto || item.id || item.nome) === identificador || item.nome === identificador)
                        ? { ...item, quantidade: item.quantidade - 1 }
                        : item
                );
            }
            return prev.filter(item => !((item.id_produto || item.id || item.nome) === identificador || item.nome === identificador));
        });
    };

    const calcularTotal = () => {
        return carrinho.reduce((total, item) => total + (item.preco * item.quantidade), 0);
    };

    const limparCarrinho = () => {
        setCarrinho([]);
    };

    return (
        <CarrinhoContext.Provider value={{ 
            carrinho, 
            adicionarProduto, 
            removerProduto, 
            calcularTotal, 
            limparCarrinho 
        }}>
            {children}
            
            {/* Mensagem de erro flutuante */}
            {mensagemErro && (
                <div className="fixed top-24 right-8 z-50 bg-red-500 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 animate-slideIn">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-semibold">{mensagemErro}</span>
                </div>
            )}
        </CarrinhoContext.Provider>
    );
}

export function useCarrinho() {
    const context = useContext(CarrinhoContext);
    if (!context) {
        throw new Error('useCarrinho deve ser usado dentro de um CarrinhoProvider');
    }
    return context;
}
