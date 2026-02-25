import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import Fiis from "./pages/Fiis";
import Auth from "./pages/Auth";
import "./index.css";

function App() {
  const [abaAtiva, setAbaAtiva] = useState("extrato");

  // Estado que controla o menu no celular
  const [menuAberto, setMenuAberto] = useState(false);

  const [token, setToken] = useState(localStorage.getItem("token"));
  const nomeUsuario = localStorage.getItem("nome_usuario");

  function fazerLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("nome_usuario");
    setToken(null);
  }

  // Função para mudar de aba e fechar o menu automaticamente no celular
  function mudarAba(aba) {
    setAbaAtiva(aba);
    setMenuAberto(false);
  }

  if (!token) {
    return <Auth onLogin={setToken} />;
  }

  return (
    <div>
      <nav className="menu-navegacao">
        {/* O BOTÃO HAMBÚRGUER (Só aparece no celular via CSS) */}
        <button
          className="menu-hamburguer"
          onClick={() => setMenuAberto(!menuAberto)}
        >
          {menuAberto ? "✖" : "☰"}
        </button>

        {/* A CAIXA QUE GUARDA OS BOTÕES */}
        <div className={`menu-itens ${menuAberto ? "aberto" : ""}`}>
          <div className="menu-esq">
            <button
              className={abaAtiva === "extrato" ? "ativo" : ""}
              onClick={() => mudarAba("extrato")}
            >
              📊 Orçamento Mensal
            </button>
            <button
              className={abaAtiva === "carteira" ? "ativo" : ""}
              onClick={() => mudarAba("carteira")}
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
        </div>
      </nav>

      {abaAtiva === "extrato" && <Dashboard />}
      {abaAtiva === "carteira" && <Fiis />}
    </div>
  );
}

export default App;
