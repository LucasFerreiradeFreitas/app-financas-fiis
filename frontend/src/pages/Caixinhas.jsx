import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "../index.css";

function Caixinhas() {
  const [caixinhas, setCaixinhas] = useState([]);
  const [nome, setNome] = useState("");
  const [metaTotal, setMetaTotal] = useState("");
  const [metaMensal, setMetaMensal] = useState("");

  // Guardamos o valor que o usuário digita no input de cada caixinha separadamente
  const [valorDeposito, setValorDeposito] = useState({});

  const token = localStorage.getItem("token");

  async function buscarCaixinhas() {
    try {
      const resposta = await fetch("http://127.0.0.1:8000/caixinhas", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resposta.ok) {
        const dados = await resposta.json();
        setCaixinhas(dados);
      }
    } catch (erro) {
      console.error("Erro ao buscar caixinhas", erro);
    }
  }

  useEffect(() => {
    buscarCaixinhas();
  }, []);

  async function criarCaixinha(event) {
    event.preventDefault();
    const novaCaixinha = {
      nome,
      meta_total: metaTotal ? parseFloat(metaTotal) : 0,
      meta_mensal: parseFloat(metaMensal),
    };

    try {
      const resposta = await fetch("http://127.0.0.1:8000/caixinhas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(novaCaixinha),
      });

      if (resposta.ok) {
        toast.success("Caixinha criada com sucesso!");
        setNome("");
        setMetaTotal("");
        setMetaMensal("");
        buscarCaixinhas();
      } else {
        toast.error("Erro ao criar caixinha.");
      }
    } catch (erro) {
      toast.error("Erro de conexão com o servidor.");
    }
  }

  async function depositar(id, metaMensalCaixinha) {
    const valor = parseFloat(valorDeposito[id]);

    if (!valor || isNaN(valor) || valor <= 0) {
      toast.error("Digite um valor válido para guardar.");
      return;
    }

    try {
      const resposta = await fetch(
        `http://127.0.0.1:8000/caixinhas/${id}/depositar`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ valor }),
        },
      );

      if (resposta.ok) {
        const dados = await resposta.json();
        const novoSaldo = dados.novo_saldo;

        // =======================================================
        // A MÁGICA DA NOTIFICAÇÃO INTELIGENTE AQUI!
        // =======================================================
        if (novoSaldo >= metaMensalCaixinha) {
          toast.success(
            `🎉 Parabéns! Você alcançou a meta mensal da caixinha!`,
          );
        } else {
          const falta = metaMensalCaixinha - novoSaldo;
          toast.warning(
            `Bom trabalho! Mas ainda faltam R$ ${falta.toFixed(2)} para a meta do mês.`,
          );
        }

        // Limpa o input específico dessa caixinha
        setValorDeposito({ ...valorDeposito, [id]: "" });
        buscarCaixinhas();
      } else {
        toast.error("Erro ao movimentar o dinheiro.");
      }
    } catch (erro) {
      toast.error("Erro de conexão.");
    }
  }

  function handleValorChange(id, valor) {
    setValorDeposito({ ...valorDeposito, [id]: valor });
  }

  return (
    <div className="container">
      <header className="page-header">
        <h1>Minhas Caixinhas</h1>
        <p>Guarde dinheiro para os seus objetivos e sonhos.</p>
      </header>

      <main className="painel-fiis">
        {/* COLUNA ESQUERDA: Formulário Travado */}
        <section className="formulario">
          <h3>Nova Caixinha</h3>
          <form className="grid-form-vertical" onSubmit={criarCaixinha}>
            <div className="input-group">
              <label>Objetivo (Nome)</label>
              <input
                type="text"
                placeholder="Ex: Reserva, Viagem, Obra"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label>Meta Mensal (R$)</label>
              <input
                type="number"
                step="0.01"
                placeholder="Quanto guardar por mês?"
                value={metaMensal}
                onChange={(e) => setMetaMensal(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label>Meta Total (Opcional - R$)</label>
              <input
                type="number"
                step="0.01"
                placeholder="Valor final desejado"
                value={metaTotal}
                onChange={(e) => setMetaTotal(e.target.value)}
              />
            </div>
            <button type="submit">Criar Caixinha</button>
          </form>
        </section>

        {/* COLUNA DIREITA: Cartões das Caixinhas */}
        <section
          className="extrato"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            backgroundColor: "transparent",
            border: "none",
            padding: "0",
            boxShadow: "none",
          }}
        >
          {caixinhas.length === 0 ? (
            <div className="formulario" style={{ textAlign: "center" }}>
              <p className="vazio">
                Você ainda não tem caixinhas. Crie sua primeira meta ao lado!
              </p>
            </div>
          ) : (
            caixinhas.map((caixinha) => {
              // Calcula a porcentagem para a barra de progresso (trava em 100% no máximo)
              const porcentagem =
                Math.min((caixinha.saldo / caixinha.meta_mensal) * 100, 100) ||
                0;

              return (
                <div
                  key={caixinha.id}
                  className="formulario"
                  style={{ marginBottom: "0" }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "15px",
                    }}
                  >
                    <h4
                      style={{
                        fontSize: "1.2rem",
                        color: "var(--brand-primary)",
                        margin: 0,
                      }}
                    >
                      🎯 {caixinha.nome}
                    </h4>
                    <span
                      style={{
                        fontWeight: "bold",
                        fontSize: "1.4rem",
                        color: "var(--color-receita)",
                      }}
                    >
                      R$ {parseFloat(caixinha.saldo).toFixed(2)}
                    </span>
                  </div>

                  {/* Barra de Progresso Visual */}
                  <div style={{ marginBottom: "15px" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "0.85rem",
                        color: "var(--text-secondary)",
                        marginBottom: "8px",
                        fontWeight: "600",
                      }}
                    >
                      <span>Progresso do Mês</span>
                      <span>
                        Meta: R$ {parseFloat(caixinha.meta_mensal).toFixed(2)}
                      </span>
                    </div>
                    <div
                      style={{
                        width: "100%",
                        backgroundColor: "#e2e8f0",
                        borderRadius: "10px",
                        height: "14px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${porcentagem}%`,
                          backgroundColor:
                            porcentagem >= 100
                              ? "var(--color-receita)"
                              : "var(--brand-secondary)",
                          height: "100%",
                          transition: "width 0.5s ease-in-out",
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Botão de Guardar Dinheiro */}
                  <div
                    style={{ display: "flex", gap: "10px", marginTop: "20px" }}
                  >
                    <input
                      type="number"
                      step="0.01"
                      placeholder="R$ Valor para guardar"
                      value={valorDeposito[caixinha.id] || ""}
                      onChange={(e) =>
                        handleValorChange(caixinha.id, e.target.value)
                      }
                      style={{ flex: "1" }}
                    />
                    <button
                      onClick={() =>
                        depositar(caixinha.id, caixinha.meta_mensal)
                      }
                      style={{
                        padding: "0 24px",
                        backgroundColor: "var(--color-receita)",
                        color: "white",
                        border: "none",
                        borderRadius: "var(--radius-sm)",
                        cursor: "pointer",
                        fontWeight: "bold",
                        transition: "0.2s",
                        width: "auto",
                      }}
                      onMouseOver={(e) =>
                        (e.target.style.transform = "scale(1.02)")
                      }
                      onMouseOut={(e) =>
                        (e.target.style.transform = "scale(1)")
                      }
                    >
                      Guardar
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </section>
      </main>
    </div>
  );
}

export default Caixinhas;
