import { useState, useEffect } from "react";
import { toast } from "react-toastify";
// Importando as ferramentas do Gráfico de Barras
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
  const [saldo, setSaldo] = useState(0);
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [transacoes, setTransacoes] = useState([]);

  const token = localStorage.getItem("token");

  async function buscarTransacoes() {
    try {
      const resposta = await fetch("http://127.0.0.1:8000/transacoes", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!resposta.ok) return;

      const dados = await resposta.json();
      setTransacoes(dados);
      const saldoCalculado = dados.reduce(
        (acumulador, item) => acumulador + parseFloat(item.valor),
        0,
      );
      setSaldo(saldoCalculado);
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

    if (!isNaN(valorNumero)) {
      const novaTransacao = { descricao: descricao, valor: valorNumero };
      try {
        await fetch("http://127.0.0.1:8000/transacoes", {
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
        toast.success("Transação registrada com sucesso!");
      } catch (erro) {
        toast.error("Erro ao conectar com o servidor.");
      }
    }
  }

  async function excluirTransacao(id) {
    const confirmar = window.confirm(
      "Tem certeza que deseja apagar este registro?",
    );
    if (confirmar) {
      try {
        await fetch(`http://127.0.0.1:8000/transacoes/${id}`, {
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

  // =======================================================
  // MATEMÁTICA DO GRÁFICO: Separando Receitas de Despesas
  // =======================================================
  const totalReceitas = transacoes
    .filter((t) => parseFloat(t.valor) > 0)
    .reduce((acc, curr) => acc + parseFloat(curr.valor), 0);

  const totalDespesas = transacoes
    .filter((t) => parseFloat(t.valor) < 0)
    .reduce((acc, curr) => acc + Math.abs(parseFloat(curr.valor)), 0); // Transforma em número positivo para a barra subir

  // O molde de dados que o Recharts exige
  const dadosGrafico = [
    {
      name: "Resumo do Mês",
      Receitas: totalReceitas,
      Despesas: totalDespesas,
    },
  ];

  return (
    <div className="container">
      <header>
        <h1>Meu App Financeiro</h1>
        <p>Controle seu orçamento do dia a dia.</p>
      </header>

      {/* PAINEL AZUL NO TOPO */}
      <section className="resumo">
        <h2>Saldo livre do mês</h2>
        <p>R$ {saldo.toFixed(2)}</p>
      </section>

      {/* Usando a mesma classe 'painel-fiis' para dividir a tela 30/70 */}
      <main className="painel-fiis">
        {/* COLUNA ESQUERDA: Formulário Travado */}
        <section className="formulario">
          <h3>Nova Movimentação</h3>
          <form className="grid-form-vertical" onSubmit={adicionarTransacao}>
            <div className="input-group">
              <label>Descrição</label>
              <input
                type="text"
                placeholder="Ex: Salário, Conta de Luz"
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
            <button type="submit">Registrar</button>
          </form>
        </section>

        {/* COLUNA DIREITA: Gráfico e Extrato */}
        <section className="extrato">
          <h3>Balanço Mensal</h3>

          {transacoes.length === 0 ? (
            <p className="vazio">Nenhuma movimentação registrada ainda.</p>
          ) : (
            <>
              {/* O GRÁFICO DE BARRAS */}
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

              {/* O EXTRATO LOGO ABAIXO */}
              <h3
                style={{ marginTop: "20px", fontSize: "1.1rem", color: "#666" }}
              >
                Histórico Detalhado
              </h3>
              <ul className="lista-transacoes">
                {transacoes.map((t) => (
                  <li key={t.id} className="item-transacao">
                    <span className="desc" style={{ fontWeight: "600" }}>
                      {t.descricao}
                    </span>
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
                        title="Excluir registro"
                      >
                        🗑️
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
