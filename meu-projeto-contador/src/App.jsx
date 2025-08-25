import { useState } from "react";

function App(){
  const [count, setCount] = useState(0);
  const incrementCount = () => {
    setCount(count + 1)
  };
  const decrementCount = () => {
    setCount(count - 1)
  }; 
  // resetar o contador
  const resetCount = () => {
    setCount(0)
  };
  return (
    <div className="contador-container">
    <h1>Contador de Cliques</h1>
    <p>Cliques: {count} </p>
    <button className="btn-incrementar" onClick={incrementCount}>Clique Aqui</button>
    <button className="btn-decrementar" onClick={decrementCount}>Decrementar</button>
    <button className="btn-resetar" onClick={resetCount}>Resetar</button>
    </div>
  );
}

export default App;