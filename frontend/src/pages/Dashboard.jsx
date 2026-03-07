import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "../index.css";

function Dashboard() {
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [transacoes, setTransacoes] = useState([]);

  // ==========================================
  // ESTADOS DE DATA E NAVEGAÇÃO
  // ==========================================
  const hoje = new Date();
  const [mesAtual, setMesAtual] = useState(hoje.getMonth()); // 0 (Jan) a 11 (Dez)
  const [anoAtual, setAnoAtual] = useState(hoje.getFullYear());
  const [dataNova, setDataNova] = useState(hoje.toISOString().split("T")[0]); // YYYY-MM-DD

  const nomesMeses = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  const token = localStorage.getItem("token");

  async function buscarTransacoes() {
    try {
      const resposta = await fetch(
        "https://app-financas-fiis.onrender.com/transacoes",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!resposta.ok) return;

      const dados = await resposta.json();
      setTransacoes(dados);
    } catch (erro) {
      console.error("Erro ao buscar transações:", erro);
    }
  }

  useEffect(() => {
    buscarTransacoes();
  }, []);

  async function adicionarTransacao(event) {
    event.preventDefault();
    const valorNumero = parseFloat(valor);

    if (!isNaN(valorNumero) && dataNova) {
      // Agora enviamos a data junto no pacote
      const novaTransacao = {
        descricao: descricao,
        valor: valorNumero,
        data: dataNova,
      };
      try {
        await fetch("https://app-financas-fiis.onrender.com/transacoes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(novaTransacao),
        });
        setDescricao("");
        setValor("");
        buscarTransacoes();
        toast.success("Transação registada com sucesso!");
      } catch (erro) {
        toast.error("Erro ao conectar com o servidor.");
      }
    }
  }

  async function excluirTransacao(id) {
    const confirmar = window.confirm(
      "Tem a certeza que deseja apagar este registo?",
    );
    if (confirmar) {
      try {
        await fetch(`https://app-financas-fiis.onrender.com/transacoes/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        buscarTransacoes();
        toast.info("Transação excluída.");
      } catch (erro) {
        toast.error("Erro ao excluir transação.");
      }
    }
  }

  // ==========================================
  // LÓGICA DO FILTRO DE MÊS
  // ==========================================
  function mesAnterior() {
    if (mesAtual === 0) {
      setMesAtual(11);
      setAnoAtual(anoAtual - 1);
    } else {
      setMesAtual(mesAtual - 1);
    }
  }

  function mesProximo() {
    if (mesAtual === 11) {
      setMesAtual(0);
      setAnoAtual(anoAtual + 1);
    } else {
      setMesAtual(mesAtual + 1);
    }
  }

  // Filtra as transações para mostrar apenas as do mês/ano selecionado
  const transacoesFiltradas = transacoes.filter((t) => {
    if (!t.data) return true; // Segurança para transações muito antigas
    const [ano, mes] = t.data.split("-");
    return parseInt(ano) === anoAtual && parseInt(mes) - 1 === mesAtual;
  });

  // =======================================================
  // MATEMÁTICA DO GRÁFICO (AGORA APENAS COM O MÊS ATUAL)
  // =======================================================
  const totalReceitas = transacoesFiltradas
    .filter((t) => parseFloat(t.valor) > 0)
    .reduce((acc, curr) => acc + parseFloat(curr.valor), 0);

  const totalDespesas = transacoesFiltradas
    .filter((t) => parseFloat(t.valor) < 0)
    .reduce((acc, curr) => acc + Math.abs(parseFloat(curr.valor)), 0);

  const saldoFiltrado = totalReceitas - totalDespesas;

  const dadosGrafico = [
    {
      name: "Resumo do Mês",
      Receitas: totalReceitas,
      Despesas: totalDespesas,
    },
  ];

  // Estilo para os botões do mês
  const btnMesStyle = {
    background: "rgba(255,255,255,0.2)",
    border: "none",
    color: "white",
    padding: "6px 14px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "1.2rem",
  };

  return (
    <div className="container">
      <header>
        <h1>Meu App Financeiro</h1>
        <p>Controle o seu orçamento do dia a dia.</p>
      </header>

      {/* PAINEL AZUL NO TOPO COM O SELETOR DE MÊS */}
      <section
        className="resumo"
        style={{ flexDirection: "column", alignItems: "center" }}
      >
        {/* NAVEGAÇÃO DE MESES */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            marginBottom: "10px",
          }}
        >
          <button onClick={mesAnterior} style={btnMesStyle}>
            &lt;
          </button>
          <h2 style={{ fontSize: "1.2rem", margin: 0 }}>
            {nomesMeses[mesAtual]} {anoAtual}
          </h2>
          <button onClick={mesProximo} style={btnMesStyle}>
            &gt;
          </button>
        </div>

        <div style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: "0.85rem", opacity: 0.9 }}>SALDO DESTE MÊS</h2>
          <p>R$ {saldoFiltrado.toFixed(2)}</p>
        </div>
      </section>

      <main className="painel-fiis">
        {/* COLUNA ESQUERDA: Formulário */}
        <section className="formulario">
          <h3>Nova Movimentação</h3>
          <form className="grid-form-vertical" onSubmit={adicionarTransacao}>
            <div className="input-group">
              <label>Data</label>
              <input
                type="date"
                value={dataNova}
                onChange={(e) => setDataNova(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label>Descrição</label>
              <input
                type="text"
                placeholder="Ex: Salário, Luz"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label>Valor (R$)</label>
              <input
                type="number"
                step="0.01"
                placeholder="Use sinal - para despesa"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                required
              />
            </div>
            <button type="submit">Registar</button>
          </form>
        </section>

        {/* COLUNA DIREITA: Gráfico e Extrato */}
        <section className="extrato">
          <h3>Balanço de {nomesMeses[mesAtual]}</h3>

          {transacoesFiltradas.length === 0 ? (
            <p className="vazio">Nenhuma movimentação registada neste mês.</p>
          ) : (
            <>
              <div
                className="grafico-container"
                style={{
                  marginBottom: "40px",
                  backgroundColor: "#f9f9f9",
                  padding: "20px",
                  borderRadius: "10px",
                }}
              >
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart
                    data={dadosGrafico}
                    margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#e0e0e0"
                    />
                    <XAxis dataKey="name" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip
                      formatter={(value) => `R$ ${value.toFixed(2)}`}
                      cursor={{ fill: "transparent" }}
                    />
                    <Legend />
                    <Bar
                      dataKey="Receitas"
                      fill="#2ecc71"
                      radius={[6, 6, 0, 0]}
                      barSize={60}
                    />
                    <Bar
                      dataKey="Despesas"
                      fill="#e74c3c"
                      radius={[6, 6, 0, 0]}
                      barSize={60}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <h3
                style={{ marginTop: "20px", fontSize: "1.1rem", color: "#666" }}
              >
                Histórico Detalhado
              </h3>
              <ul className="lista-transacoes">
                {transacoesFiltradas.map((t) => {
                  // Formatando a data de YYYY-MM-DD para DD/MM
                  const dataFormatada = t.data
                    ? `${t.data.split("-")[2]}/${t.data.split("-")[1]}`
                    : "";

                  return (
                    <li key={t.id} className="item-transacao">
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span className="desc" style={{ fontWeight: "600" }}>
                          {t.descricao}
                        </span>
                        <span style={{ fontSize: "0.75rem", color: "#999" }}>
                          {dataFormatada}
                        </span>
                      </div>
                      <div className="valores-acoes">
                        <span
                          className={
                            parseFloat(t.valor) >= 0
                              ? "valor receita"
                              : "valor despesa"
                          }
                        >
                          R$ {parseFloat(t.valor).toFixed(2)}
                        </span>
                        <button
                          onClick={() => excluirTransacao(t.id)}
                          className="btn-excluir"
                          title="Excluir registo"
                        >
                          🗑️
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
