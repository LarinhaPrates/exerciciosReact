import Card from "./Card";


function App() {
  return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <Card
          nome="Laptop Ultra"
          preco="5.499,00"
          descricao="Um laptop potente de alta performace com 16GB de RAM e 1Tb SSD."
        />
      </div>  
  );
}

export default App;