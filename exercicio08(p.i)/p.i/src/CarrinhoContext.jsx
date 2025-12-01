import React, { createContext, useState, useContext } from 'react';
import { Link } from 'react-router-dom';

const CarrinhoContext = createContext();

export function CarrinhoProvider({ children }) {
    const [carrinho, setCarrinho] = useState([]);

    const adicionarProduto = (produto) => {
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
