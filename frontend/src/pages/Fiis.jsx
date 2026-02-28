import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "../index.css";

function Fiis() {
  const [fii, setFii] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [preco, setPreco] = useState("");
  const [carteira, setCarteira] = useState([]);

  const token = localStorage.getItem("token");

  const CORES = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8e44ad",
    "#2ecc71",
    "#e74c3c",
  ];

  async function buscarCarteira() {
    try {
      const resposta = await fetch(
        "https://app-financas-fiis.onrender.com/carteira",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!resposta.ok) return;
      const dados = await resposta.json();
      setCarteira(dados);
    } catch (erro) {
      console.error("Erro ao buscar carteira:", erro);
    }
  }

  useEffect(() => {
    buscarCarteira();
  }, []);

  async function adicionarFii(event) {
    event.preventDefault();
    const novaCompra = {
      ticker: fii,
      quantidade: parseInt(quantidade),
      preco: parseFloat(preco),
    };

    if (
      novaCompra.quantidade > 0 &&
      novaCompra.preco > 0 &&
      novaCompra.ticker
    ) {
      try {
        await fetch("https://app-financas-fiis.onrender.com/carteira", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(novaCompra),
        });
        setFii("");
        setQuantidade("");
        setPreco("");
        buscarCarteira();
        toast.success("Nova compra de FII registrada!");
      } catch (erro) {
        console.error("Erro ao salvar FII:", erro);
        toast.error("Erro ao registrar a compra.");
      }
    }
  }

  async function excluirFii(id) {
    const confirmar = window.confirm(
      "Tem certeza que deseja apagar este fundo?",
    );
    if (confirmar) {
      try {
        await fetch(`https://app-financas-fiis.onrender.com/carteira/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        buscarCarteira();
        toast.info("Fundo removido da sua carteira.");
      } catch (erro) {
        console.error("Erro ao excluir FII:", erro);
        toast.error("Erro ao excluir o fundo.");
      }
    }
  }

  const totalCarteira = carteira.reduce(
    (acumulador, item) => acumulador + parseFloat(item.total_investido),
    0,
  );

  const dadosGrafico = carteira.map((item) => ({
    name: item.ticker,
    value: parseFloat(item.total_investido),
  }));

  return (
    <div className="container">
      <header>
        <h1>Minha Carteira de FIIs</h1>
        <p>Registre suas compras e acompanhe seu patrimônio.</p>
      </header>

      {/* NOVO: Essa é a caixa principal que vai colocar tudo lado a lado */}
      <main className="painel-fiis">
        {/* COLUNA ESQUERDA: Formulário */}
        <section className="formulario fiis-form">
          <h3>Registrar Nova Compra</h3>
          <form className="grid-form-vertical" onSubmit={adicionarFii}>
            <div className="input-group">
              <label>Nome do FII</label>
              <input
                type="text"
                placeholder="Ex: MXRF11"
                value={fii}
                onChange={(e) => setFii(e.target.value.toUpperCase())}
                required
              />
            </div>
            <div className="input-group">
              <label>Quantidade de Cotas</label>
              <input
                type="number"
                step="1"
                placeholder="Ex: 10"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label>Preço (R$)</label>
              <input
                type="number"
                step="0.01"
                placeholder="Ex: 10.50"
                value={preco}
                onChange={(e) => setPreco(e.target.value)}
                required
              />
            </div>
            <div className="input-group btn-container">
              <button type="submit" className="btn-comprar">
                Comprar
              </button>
            </div>
          </form>
        </section>

        {/* COLUNA DIREITA: Investimentos (Gráfico e Lista) */}
        <section className="extrato carteira-lista">
          <h3>Meus Investimentos</h3>
          <div className="resumo-carteira">
            <p>
              Patrimônio Total: <strong>R$ {totalCarteira.toFixed(2)}</strong>
            </p>
          </div>

          {carteira.length === 0 ? (
            <p className="vazio">
              Você ainda não possui cotas na sua carteira.
            </p>
          ) : (
            <div className="conteudo-carteira">
              <div className="grafico-container">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={dadosGrafico}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {dadosGrafico.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CORES[index % CORES.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `R$ ${value.toFixed(2)}`} />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <ul className="lista-transacoes lista-fiis-lateral">
                {carteira.map((item) => (
                  <li key={item.id} className="item-transacao fii-item">
                    <div className="fii-info">
                      <span className="desc fii-ticker">{item.ticker}</span>
                      <span className="fii-qtd">{item.quantidade} cotas</span>
                    </div>
                    <div className="valores-acoes">
                      <div className="fii-valores">
                        <span className="fii-pm">
                          PM: R$ {parseFloat(item.preco_medio).toFixed(2)}
                        </span>
                        <span className="valor receita">
                          R$ {parseFloat(item.total_investido).toFixed(2)}
                        </span>
                      </div>
                      <button
                        onClick={() => excluirFii(item.id)}
                        className="btn-excluir"
                        title="Excluir Fundo"
                      >
                        🗑️
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Fiis;
