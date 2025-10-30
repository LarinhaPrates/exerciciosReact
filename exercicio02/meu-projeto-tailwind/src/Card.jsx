import { useState} from 'react';

const Card = ({ nome, preco, descricao }) =>{
    const [isSelected, setIsSelected] = useState(false);

    const handleClick = () =>{
        setIsSelected(!isSelected);
    }

    return(
        <div onClik={handleClick} className={`rounded-lg shadow-lg p-6 cursor-pointer transition-colors duration-300
            ${isSelected ? 'bg-indigo-200 border-2 border-indigo-500' : 'bg-white'}`}>
            <h2 className="text-xl font-semibold mb-2">{nome}</h2>
        <p className="text-gray-600 mb-4">{descricao}</p>
        <span className="text-2xl font-bold text-blue-600">
            R$ {preco}
        </span>
        </div>
    )
}

export default Card;