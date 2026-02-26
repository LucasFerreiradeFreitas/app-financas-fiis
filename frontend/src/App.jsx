import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import Fiis from "./pages/Fiis";
import Auth from "./pages/Auth";
import "./index.css";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [abaAtiva, setAbaAtiva] = useState("extrato");
  const [menuAberto, setMenuAberto] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const nomeUsuario = localStorage.getItem("nome_usuario");

  function fazerLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("nome_usuario");
    setToken(null);
  }

  function mudarAba(aba) {
    setAbaAtiva(aba);
    setMenuAberto(false);
  }

  return (
    <>
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        theme="colored"
      />

      {/* 2. Lógica de exibição: Se NÃO tem token, mostra o Auth. Se TEM token, mostra o painel. */}
      {!token ? (
        <Auth onLogin={setToken} />
      ) : (
        <div>
          <nav className="menu-navegacao">
            <button
              className="menu-hamburguer"
              onClick={() => setMenuAberto(!menuAberto)}
            >
              {menuAberto ? "✖" : "☰"}
            </button>

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
      )}
    </>
  );
}

export default App;
