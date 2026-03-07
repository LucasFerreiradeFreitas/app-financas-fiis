import { useState, useEffect } from "react";
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
  const [viewDeslogado, setViewDeslogado] = useState("landing");
  const nomeUsuario = localStorage.getItem("nome_usuario") || "Usuário";

  // ==========================================
  // MODO ESCURO (MEMÓRIA)
  // ==========================================
  const [temaEscuro, setTemaEscuro] = useState(() => {
    return localStorage.getItem("tema") === "dark";
  });

  useEffect(() => {
    if (temaEscuro) {
      document.body.classList.add("dark");
      localStorage.setItem("tema", "dark");
    } else {
      document.body.classList.remove("dark");
      localStorage.setItem("tema", "light");
    }
  }, [temaEscuro]);

  function alternarTema() {
    setTemaEscuro(!temaEscuro);
  }

  // ==========================================
  // FUNÇÕES DE LOGIN/LOGOUT
  // ==========================================
  function handleLogin(novoToken) {
    setToken(novoToken);
    setPaginaAtiva("dashboard");
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("nome_usuario");
    setToken(null);
    setViewDeslogado("landing");
  }

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
        temaEscuro={temaEscuro} 
        alternarTema={alternarTema} 
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
