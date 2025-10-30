import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Pedidos from "./pages/Pedidos";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/pedidos" element={<Pedidos />} />
      </Routes>
    </Router>
  );
}
