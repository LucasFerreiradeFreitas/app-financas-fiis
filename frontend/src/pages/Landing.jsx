import React from "react";
import "../index.css";

function Landing({ onEntrar, onCadastrar }) {
  return (
    <div className="landing-container">
      <header className="landing-header">
        <div className="landing-logo">
          <span className="logo-icon">💰</span> FinançasApp
        </div>
        <div className="landing-nav">
          <button onClick={onEntrar} className="btn-login-header">
            Entrar
          </button>
          <button onClick={onCadastrar} className="btn-cadastro-header">
            Cadastrar
          </button>
        </div>
      </header>

      <main className="landing-hero">
        <h1>Domine suas finanças de um jeito simples.</h1>
        <p>
          Controle seu orçamento mensal, gerencie sua carteira de FIIs e crie
          caixinhas para alcançar seus sonhos. Tudo em um só lugar.
        </p>
        <button onClick={onCadastrar} className="btn-hero">
          Começar agora gratuitamente
        </button>
      </main>
    </div>
  );
}

export default Landing;
