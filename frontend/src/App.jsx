import { useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Fiis from "./pages/Fiis";
import Caixinhas from "./pages/Caixinhas";
import Sidebar from "./Sidebar";
import "./index.css";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [paginaAtiva, setPaginaAtiva] = useState("dashboard");

  // Controla o que aparece quando o usuário NÃO está logado
  const [viewDeslogado, setViewDeslogado] = useState("landing"); // 'landing', 'login' ou 'cadastro'

  const nomeUsuario = localStorage.getItem("nome_usuario") || "Usuário";

  function handleLogin(novoToken) {
    setToken(novoToken);
    setPaginaAtiva("dashboard");
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("nome_usuario");
    setToken(null);
    setViewDeslogado("landing"); // Volta pra Landing ao sair
  }

  // Se não autenticado, gerencia as telas de fora do sistema
  if (!token) {
    if (viewDeslogado === "landing") {
      return (
        <Landing
          onEntrar={() => setViewDeslogado("login")}
          onCadastrar={() => setViewDeslogado("cadastro")}
        />
      );
    }

    return (
      <>
        <Auth
          onLogin={handleLogin}
          modoInicial={viewDeslogado === "login"}
          onVoltar={() => setViewDeslogado("landing")}
        />
        <ToastContainer position="top-right" autoClose={3000} />
      </>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar
        paginaAtiva={paginaAtiva}
        setPaginaAtiva={setPaginaAtiva}
        nomeUsuario={nomeUsuario}
        onLogout={handleLogout}
      />
      <main className="main-content">
        {paginaAtiva === "dashboard" && <Dashboard />}
        {paginaAtiva === "fiis" && <Fiis />}
        {paginaAtiva === "caixinhas" && <Caixinhas />}
      </main>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default App;
