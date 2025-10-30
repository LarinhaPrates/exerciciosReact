import { useState } from 'react';
import { HeartIcon } from "@heroicons/react";




const Card = ({ nome, preco, descricao }) => {

    //icone de coracao quando clicar no card
    const [isFavorite, setIsFavorite] = useState(false);

    const toggleFavorite = () => {
        setIsFavorite(!isFavorite);
    };


    return (
        <div  className={`relative rounded-lg shadow-lg p-6 cursor-pointer transition-colors duration-300 m-4
            ${isFavorite ? 'bg-red-100 border-2 border-red-500' : 'bg-white'}`}>
            <button
                onClick={toggleFavorite}
                className="absolute top-2 right-2 focus:outline-none focus">
                <HeartIcon className={`h-6 w-6 ${isFavorite ? 'text-red-500' : 'text-gray-300 hover:text-red-400'}`} />
            </button>
            <h2 className="text-xl font-semibold mb-2">{nome}</h2>
            <p className="text-gray-600 mb-4">{descricao}</p>
            <span className="text-2xl font-bold text-red-800">
                R$ {preco}
            </span>
        </div>
    )
}

export default Card;