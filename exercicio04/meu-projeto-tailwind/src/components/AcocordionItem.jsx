import React, {useState} from "react";

const AccordionItem = ({ pergunta, resposta }) => {
    const [isExpanded, setExpanded] = useState(false);

    return (
        <div className="border-b border-pink-400">
            <button onClick={() => setExpanded(!isExpanded)} className="flex justify-between items-center w-full py-4 
            text-left font-medium text-lg text-gray-50 focus:outline-none">
                <span>{pergunta}</span>
                <svg className={`h-6 w-6 transform transition-transform 
                    duration-200 ${isExpanded ? 'rotate-180' : 
                    'rotate-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out 
                ${isExpanded ? 'max-h-96' : 'max-h-0'}`}>
                <div className="py-2 text-pink-800">
                    <p>{resposta}</p>
                </div>
            </div>
        </div>
    )
}
export default AccordionItem;