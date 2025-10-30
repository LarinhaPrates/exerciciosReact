import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Cadastro from "./components/Cadastro";

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);

function App() {
  const [instruments, setInstruments] = useState([]);

  useEffect(() => {
    getInstruments();
  }, []);

  async function getInstruments() {
    const { data } = await supabase.from("instruments").select();
    setInstruments(data);
  }

  return (
  <div>
    <h1>Lista de instrumentos</h1>
    <ul>
      {instruments.map((instrument) => (
        <li key={instrument.name}>{instrument.name}</li>
      ))}
    </ul>

    <hr className="my-6" />

    <Cadastro />
  </div>


);
}

export default App;
