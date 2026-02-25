import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import Fiis from "./pages/Fiis";
import Auth from "./pages/Auth"; // Importando a nova tela!
import "./index.css";

function App() {
  const [abaAtiva, setAbaAtiva] = useState("extrato");

  // O React procura o crachá no navegador assim que a tela abre
  const [token, setToken] = useState(localStorage.getItem("token"));
  const nomeUsuario = localStorage.getItem("nome_usuario");

  // Função para rasgar o crachá e sair do sistema
  function fazerLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("nome_usuario");
    setToken(null);
  }

  // O GUARDIÃO: Se não tem crachá, mostra SOMENTE a tela de Login
  if (!token) {
    return <Auth onLogin={setToken} />;
  }

  // Se tem crachá, mostra o aplicativo completo!
  return (
    <div>
      <nav className="menu-navegacao">
        <div className="menu-esq">
          <button
            className={abaAtiva === "extrato" ? "ativo" : ""}
            onClick={() => setAbaAtiva("extrato")}
          >
            📊 Orçamento Mensal
          </button>
          <button
            className={abaAtiva === "carteira" ? "ativo" : ""}
            onClick={() => setAbaAtiva("carteira")}
          >
            🏢 Carteira de FIIs
          </button>
        </div>

        <div className="menu-dir">
          <span className="saudacao">Olá, {nomeUsuario}!</span>
          <button onClick={fazerLogout} className="btn-sair">
            Sair 🚪
          </button>
        </div>
      </nav>

      {/* Mostra a tela correta dependendo do botão clicado */}
      {abaAtiva === "extrato" && <Dashboard />}
      {abaAtiva === "carteira" && <Fiis />}
    </div>
  );
}

export default App;
