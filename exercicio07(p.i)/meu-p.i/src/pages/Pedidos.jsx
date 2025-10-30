export default function Pedidos() {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-[#FFF7E6] text-center">
            <h1 className="text-3xl font-bold text-[#FF7A7A] mb-4">Pedidos</h1>
            <p className="text-gray-700">Bem-vindo à nossa lanchonete 🍔</p>
            <button
                onClick={() => (window.location.href = "/")}
                className="mt-6 bg-[#4DE0E0] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#3ac0c0]"
            >
                Sair
            </button>
        </div>
    );
}
