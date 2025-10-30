import Card from "./assets/Card";

function App() {
  //mapear uma lista de produtos
  const produtos = [
    {
      nome: "Laptop Ultra",
      preco: "5.499,00",
      descricao: "Um laptop potente de alta performace com 16GB de RAM e 1Tb SSD."
    },
    {
      nome: "Smartphone Pro",
      preco: "3.299,00",
      descricao: "Um smartphone com câmera de alta resolução e bateria de longa duração."
    },
    {
      nome: "Tablet Max",
      preco: "2.199,00",
      descricao: "Um tablet leve e versátil, perfeito para trabalho e entretenimento."
    },
    {
      nome: "Smartwatch X",
      preco: "1.299,00",
      descricao: "Um smartwatch com monitoramento de saúde e notificações inteligentes."
    },
    {
      nome: "Fone de Ouvido NoiseCancel",
      preco: "899,00",
      descricao: "Fones de ouvido com cancelamento de ruído ativo e som de alta qualidade." 
    }
  ]; 
  return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        {produtos.map((produto) => (
        <Card
          key={produto.id}
          nome={produto.nome}
          preco={produto.preco}
          descricao={produto.descricao}
        />
      ))}
      </div> 
      
      
  );
}

export default App;
