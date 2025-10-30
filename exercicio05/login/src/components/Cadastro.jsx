// criar a pagina de cadastro 
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);

function Cadastro() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    async function handleSubmit(event) {
        event.preventDefault();
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) {
            setMessage(error.message);
        } else {
            setMessage("Cadastro realizado com sucesso! Verifique seu email para confirmação.");
        }
    }

    return (            
        <div>
            <h2>Cadastro</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Cadastrar</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
}
export default Cadastro;

