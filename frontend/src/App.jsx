import { useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Fiis from "./pages/Fiis";
import Caixinhas from "./pages/Caixinhas";
import Sidebar from "./Sidebar";
import "./index.css";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [paginaAtiva, setPaginaAtiva] = useState("dashboard");
  const nomeUsuario = localStorage.getItem("nome_usuario") || "Usuário";

  function handleLogin(novoToken) {
    setToken(novoToken);
    setPaginaAtiva("dashboard");
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("nome_usuario");
    setToken(null);
  }

  // Se não autenticado, mostra tela de Auth sem sidebar
  if (!token) {
    return (
      <>
        <Auth onLogin={handleLogin} />
        <ToastContainer position="top-right" autoClose={3000} />
      </>
    );
  }

  return (
    <div className="app-layout">
      {/* SIDEBAR (inclui topbar mobile internamente) */}
      <Sidebar
        paginaAtiva={paginaAtiva}
        setPaginaAtiva={setPaginaAtiva}
        nomeUsuario={nomeUsuario}
        onLogout={handleLogout}
      />

      {/* CONTEÚDO PRINCIPAL */}
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
