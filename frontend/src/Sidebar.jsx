import { useState } from "react";

function Sidebar({
  paginaAtiva,
  setPaginaAtiva,
  nomeUsuario,
  onLogout,
  temaEscuro,
  alternarTema,
}) {
  const [aberta, setAberta] = useState(false);

  const iniciais = nomeUsuario
    ? nomeUsuario
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  function navegar(pagina) {
    setPaginaAtiva(pagina);
    setAberta(false);
  }

  const itensNav = [
    { id: "dashboard", label: "Orçamento Mensal", icon: "📊" },
    { id: "fiis", label: "Carteira de FIIs", icon: "📈" },
    { id: "caixinhas", label: "Minhas Caixinhas", icon: "🎯" },
  ];

  return (
    <>
      <div className="topbar-mobile">
        <div className="topbar-logo">
          <div className="logo-icon">💰</div>
          <span>FinançasApp</span>
        </div>
        <button
          className="btn-hamburguer"
          onClick={() => setAberta(!aberta)}
          aria-label="Abrir menu"
        >
          {aberta ? "✕" : "☰"}
        </button>
      </div>

      <div
        className={`sidebar-overlay ${aberta ? "visivel" : ""}`}
        onClick={() => setAberta(false)}
      />

      <aside className={`sidebar ${aberta ? "aberta" : ""}`}>
        <div className="sidebar-logo">
          <div className="logo-icon">💰</div>
          <div>
            <h2>FinançasApp</h2>
            <p>Controle financeiro</p>
          </div>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-section-label">Menu</div>
          <nav className="sidebar-nav">
            {itensNav.map((item) => (
              <button
                key={item.id}
                className={`sidebar-btn ${paginaAtiva === item.id ? "ativo" : ""}`}
                onClick={() => navegar(item.id)}
              >
                <span className="sidebar-icon">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="user-avatar">{iniciais}</div>
            <div className="user-info">
              <div className="user-name">{nomeUsuario || "Usuário"}</div>
              <div className="user-role">Conta pessoal</div>
            </div>
          </div>

          {/* O NOSSO NOVO BOTÃO DE MODO ESCURO VEM AQUI */}
          <button className="btn-tema" onClick={alternarTema}>
            <span>{temaEscuro ? "☀️" : "🌙"}</span>
            {temaEscuro ? "Modo Claro" : "Modo Escuro"}
          </button>

          <button className="btn-sair" onClick={onLogout}>
            <span>🚪</span>
            Sair da conta
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
