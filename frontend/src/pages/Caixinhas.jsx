import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "../index.css";

function Caixinhas() {
  const [caixinhas, setCaixinhas] = useState([]);
  const [nome, setNome] = useState("");
  const [metaTotal, setMetaTotal] = useState("");
  const [metaMensal, setMetaMensal] = useState("");
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

  // NOVO: Função unificada para Guardar ou Resgatar
  async function movimentarCaixinha(caixinha, tipo) {
    const valorDigitado = parseFloat(valorDeposito[caixinha.id]);

    if (!valorDigitado || isNaN(valorDigitado) || valorDigitado <= 0) {
      toast.error("Digite um valor válido.");
      return;
    }

    if (tipo === "resgatar" && valorDigitado > caixinha.saldo) {
      toast.error("Saldo insuficiente na caixinha para esse resgate!");
      return;
    }

    // Se for resgate, manda o número negativo para o back-end fazer a mágica
    const valorFinal = tipo === "resgatar" ? -valorDigitado : valorDigitado;

    try {
      const resposta = await fetch(
        `http://127.0.0.1:8000/caixinhas/${caixinha.id}/depositar`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ valor: valorFinal }),
        },
      );

      if (resposta.ok) {
        const dados = await resposta.json();
        const novoSaldo = dados.novo_saldo;

        if (tipo === "guardar") {
          if (novoSaldo >= caixinha.meta_mensal) {
            toast.success(`🎉 Parabéns! Você alcançou a meta da caixinha!`);
          } else {
            toast.success(
              `Guardado! Faltam R$ ${(caixinha.meta_mensal - novoSaldo).toFixed(2)} para a meta.`,
            );
          }
        } else {
          toast.info(
            `Resgate de R$ ${valorDigitado.toFixed(2)} devolvido ao seu extrato.`,
          );
        }

        setValorDeposito({ ...valorDeposito, [caixinha.id]: "" });
        buscarCaixinhas();
      } else {
        toast.error("Erro ao movimentar o dinheiro.");
      }
    } catch (erro) {
      toast.error("Erro de conexão.");
    }
  }

  // NOVO: Função para excluir a caixinha
  async function excluirCaixinha(id) {
    const confirmar = window.confirm(
      "Excluir esta caixinha? O saldo guardado nela voltará para sua conta principal.",
    );
    if (confirmar) {
      try {
        const resposta = await fetch(`http://127.0.0.1:8000/caixinhas/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (resposta.ok) {
          toast.info("Caixinha excluída com sucesso.");
          buscarCaixinhas();
        } else {
          toast.error("Erro ao excluir caixinha.");
        }
      } catch (erro) {
        toast.error("Erro de conexão.");
      }
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
                      alignItems: "flex-start",
                      marginBottom: "15px",
                    }}
                  >
                    <div>
                      <h4
                        style={{
                          fontSize: "1.2rem",
                          color: "var(--brand-primary)",
                          margin: 0,
                        }}
                      >
                        🎯 {caixinha.nome}
                      </h4>
                      <div
                        style={{
                          fontWeight: "bold",
                          fontSize: "1.4rem",
                          color: "var(--color-receita)",
                          marginTop: "5px",
                        }}
                      >
                        R$ {parseFloat(caixinha.saldo).toFixed(2)}
                      </div>
                    </div>

                    {/* Botão de Excluir */}
                    <button
                      onClick={() => excluirCaixinha(caixinha.id)}
                      className="btn-excluir"
                      title="Excluir Caixinha"
                    >
                      🗑️
                    </button>
                  </div>

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

                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      marginTop: "20px",
                      flexWrap: "wrap",
                    }}
                  >
                    <input
                      type="number"
                      step="0.01"
                      placeholder="R$ Valor"
                      value={valorDeposito[caixinha.id] || ""}
                      onChange={(e) =>
                        handleValorChange(caixinha.id, e.target.value)
                      }
                      style={{ flex: "1", minWidth: "120px" }}
                    />

                    {/* Botão Guardar */}
                    <button
                      onClick={() => movimentarCaixinha(caixinha, "guardar")}
                      style={{
                        padding: "0 20px",
                        backgroundColor: "var(--color-receita)",
                        color: "white",
                        border: "none",
                        borderRadius: "var(--radius-sm)",
                        cursor: "pointer",
                        fontWeight: "bold",
                      }}
                    >
                      Guardar
                    </button>

                    {/* Botão Resgatar */}
                    <button
                      onClick={() => movimentarCaixinha(caixinha, "resgatar")}
                      style={{
                        padding: "10px 20px",
                        backgroundColor: "transparent",
                        color: "var(--brand-secondary)",
                        border: "1.5px solid var(--brand-secondary)",
                        borderRadius: "var(--radius-sm)",
                        cursor: "pointer",
                        fontWeight: "bold",
                        transition: "all var(--transition)",
                      }}
                    >
                      Resgatar
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
