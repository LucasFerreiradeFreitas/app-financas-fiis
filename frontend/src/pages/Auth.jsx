import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "../index.css";

function Auth({ onLogin, modoInicial, onVoltar }) {
  // 'login', 'cadastro', 'esqueci' (pedir email), 'redefinir' (digitar código e senha nova)
  const [tela, setTela] = useState(modoInicial ? "login" : "cadastro");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    setTela(modoInicial ? "login" : "cadastro");
  }, [modoInicial]);

  // Estados dos formulários
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [codigo, setCodigo] = useState("");
  const [novaSenha, setNovaSenha] = useState("");

  // ==========================================
  // FUNÇÃO 1: LOGIN E CADASTRO
  // ==========================================
  async function handleLoginCadastro(event) {
    event.preventDefault();
    setCarregando(true);

    const endpoint =
      tela === "login" ? "/usuarios/login" : "/usuarios/cadastrar";
    const payload =
      tela === "login" ? { email, senha } : { nome, email, senha };

    try {
      const resposta = await fetch(
        `https://app-financas-fiis.onrender.com${endpoint}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const dados = await resposta.json();

      if (resposta.ok) {
        if (tela === "login") {
          localStorage.setItem("token", dados.access_token);
          localStorage.setItem("nome_usuario", dados.nome);
          onLogin(dados.access_token);
          toast.success("Bem-vindo de volta!");
        } else {
          toast.success("Conta criada! Agora faça o login.");
          setTela("login");
          setSenha("");
        }
      } else {
        toast.error(dados.detail || "Erro na operação.");
      }
    } catch (erro) {
      toast.error("Erro ao conectar com o servidor.");
    } finally {
      setCarregando(false);
    }
  }

  // ==========================================
  // FUNÇÃO 2: PEDIR O CÓDIGO POR E-MAIL
  // ==========================================
  async function handlePedirCodigo(event) {
    event.preventDefault();
    setCarregando(true);
    toast.info("Enviando código para o seu e-mail...");

    try {
      const resposta = await fetch(
        "https://app-financas-fiis.onrender.com/usuarios/esqueci-senha",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        },
      );

      const dados = await resposta.json();

      if (resposta.ok) {
        toast.success(dados.mensagem);
        setTela("redefinir"); // Avança para a tela de digitar o código
      } else {
        toast.error(dados.detail || "Erro ao solicitar código.");
      }
    } catch (erro) {
      toast.error("Erro ao conectar com o servidor.");
    } finally {
      setCarregando(false);
    }
  }

  // ==========================================
  // FUNÇÃO 3: TROCAR A SENHA
  // ==========================================
  async function handleRedefinirSenha(event) {
    event.preventDefault();
    setCarregando(true);

    try {
      const resposta = await fetch(
        "https://app-financas-fiis.onrender.com/usuarios/redefinir-senha",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, codigo, nova_senha: novaSenha }),
        },
      );

      const dados = await resposta.json();

      if (resposta.ok) {
        toast.success(dados.mensagem);
        setTela("login"); // Volta para o login
        setSenha("");
        setCodigo("");
        setNovaSenha("");
      } else {
        toast.error(dados.detail || "Código inválido.");
      }
    } catch (erro) {
      toast.error("Erro ao conectar com o servidor.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-box">
        <button
          type="button"
          className="btn-voltar"
          onClick={onVoltar}
          disabled={carregando}
        >
          ⬅ Voltar ao início
        </button>

        {/* TÍTULOS DINÂMICOS */}
        <h2>
          {tela === "login" && "Entrar no Sistema"}
          {tela === "cadastro" && "Criar Nova Conta"}
          {tela === "esqueci" && "Recuperar Senha"}
          {tela === "redefinir" && "Criar Nova Senha"}
        </h2>

        {/* FORMULÁRIO 1: LOGIN / CADASTRO */}
        {(tela === "login" || tela === "cadastro") && (
          <form onSubmit={handleLoginCadastro} className="auth-form">
            {tela === "cadastro" && (
              <div className="input-group">
                <label>Nome</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
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

            {/* Link de Esqueci a Senha (Só aparece no Login) */}
            {tela === "login" && (
              <div
                style={{
                  textAlign: "right",
                  marginTop: "-5px",
                  marginBottom: "5px",
                }}
              >
                <span
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--brand-secondary)",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                  onClick={() => setTela("esqueci")}
                >
                  Esqueci minha senha
                </span>
              </div>
            )}

            <button type="submit" className="btn-comprar" disabled={carregando}>
              {carregando
                ? "Aguarde..."
                : tela === "login"
                  ? "Entrar"
                  : "Cadastrar"}
            </button>
          </form>
        )}

        {/* FORMULÁRIO 2: PEDIR CÓDIGO (ESQUECI A SENHA) */}
        {tela === "esqueci" && (
          <form onSubmit={handlePedirCodigo} className="auth-form">
            <p
              style={{
                fontSize: "0.9rem",
                color: "var(--text-secondary)",
                marginBottom: "10px",
                textAlign: "center",
              }}
            >
              Digite seu e-mail cadastrado. Vamos enviar um código de 6 dígitos
              para você.
            </p>
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
            <button type="submit" className="btn-comprar" disabled={carregando}>
              {carregando ? "Enviando..." : "Enviar Código"}
            </button>
          </form>
        )}

        {/* FORMULÁRIO 3: REDEFINIR SENHA (DIGITAR CÓDIGO) */}
        {tela === "redefinir" && (
          <form onSubmit={handleRedefinirSenha} className="auth-form">
            <p
              style={{
                fontSize: "0.9rem",
                color: "var(--text-secondary)",
                marginBottom: "10px",
                textAlign: "center",
              }}
            >
              Código enviado para <strong>{email}</strong>
            </p>
            <div className="input-group">
              <label>Código de 6 dígitos</label>
              <input
                type="text"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                required
                placeholder="Ex: 123456"
                maxLength={6}
              />
            </div>
            <div className="input-group">
              <label>Nova Senha</label>
              <input
                type="password"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                required
                placeholder="Sua nova senha secreta"
              />
            </div>
            <button type="submit" className="btn-comprar" disabled={carregando}>
              {carregando ? "Aguarde..." : "Redefinir Senha"}
            </button>
          </form>
        )}

        {/* RODAPÉ DE TROCA DE TELAS */}
        <p className="auth-toggle">
          {(tela === "login" || tela === "cadastro") && (
            <>
              {tela === "login"
                ? "Ainda não tem conta? "
                : "Já possui uma conta? "}
              <span
                onClick={() => setTela(tela === "login" ? "cadastro" : "login")}
              >
                {tela === "login" ? "Cadastre-se aqui" : "Faça login aqui"}
              </span>
            </>
          )}
          {(tela === "esqueci" || tela === "redefinir") && (
            <>
              Lembrou a senha?{" "}
              <span onClick={() => setTela("login")}>Voltar para o login</span>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

export default Auth;
