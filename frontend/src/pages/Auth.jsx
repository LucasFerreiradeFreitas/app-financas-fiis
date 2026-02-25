import { useState } from "react";
import "../index.css";

function Auth({ onLogin }) {
  // Estado para controlar se estamos na tela de Login ou de Cadastro
  const [isLogin, setIsLogin] = useState(true);

  // Estados para guardar o que a pessoa digita
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mensagem, setMensagem] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setMensagem("");

    // Escolhe a rota certa do Python dependendo se é Login ou Cadastro
    const endpoint = isLogin ? "/usuarios/login" : "/usuarios/cadastrar";

    // O Cadastro exige o nome, o Login não
    const payload = isLogin ? { email, senha } : { nome, email, senha };

    try {
      const resposta = await fetch(`http://127.0.0.1:8000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const dados = await resposta.json();

      if (resposta.ok) {
        if (isLogin) {
          // Se for Login, guarda o crachá e o nome no navegador!
          localStorage.setItem("token", dados.access_token);
          localStorage.setItem("nome_usuario", dados.nome);
          onLogin(dados.access_token); // Libera o acesso avisando o aplicativo
        } else {
          // Se for Cadastro, avisa que deu certo e muda para a tela de Login
          setMensagem("Conta criada com sucesso! Agora faça o login.");
          setIsLogin(true);
          setSenha(""); // Limpa a senha por segurança
        }
      } else {
        // Mostra o erro que o Python mandou (ex: "Senha incorreta")
        setMensagem(dados.detail || "Erro na operação.");
      }
    } catch (erro) {
      setMensagem("Erro ao conectar com o servidor.");
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>{isLogin ? "Entrar no Sistema" : "Criar Nova Conta"}</h2>

        {mensagem && <div className="mensagem-alerta">{mensagem}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="input-group">
              <label>Nome</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required={!isLogin}
                placeholder="Seu nome completo"
              />
            </div>
          )}

          <div className="input-group">
            <label>E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="seu@email.com"
            />
          </div>

          <div className="input-group">
            <label>Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              placeholder="Sua senha secreta"
            />
          </div>

          <button type="submit" className="btn-comprar">
            {isLogin ? "Entrar" : "Cadastrar"}
          </button>
        </form>

        <p className="auth-toggle">
          {isLogin ? "Ainda não tem conta? " : "Já possui uma conta? "}
          <span
            onClick={() => {
              setIsLogin(!isLogin);
              setMensagem("");
            }}
          >
            {isLogin ? "Cadastre-se aqui" : "Faça login aqui"}
          </span>
        </p>
      </div>
    </div>
  );
}

export default Auth;
