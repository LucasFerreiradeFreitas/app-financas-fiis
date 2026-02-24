import { useState, useEffect } from "react";
import "../index.css";

function Fiis() {
  const [fii, setFii] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [preco, setPreco] = useState("");
  const [carteira, setCarteira] = useState([]);

  async function buscarCarteira() {
    try {
      const resposta = await fetch("http://127.0.0.1:8000/carteira");
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
        await fetch("http://127.0.0.1:8000/carteira", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(novaCompra),
        });

        setFii("");
        setQuantidade("");
        setPreco("");
        buscarCarteira();
      } catch (erro) {
        console.error("Erro ao salvar FII:", erro);
      }
    }
  }

  // Pede para o Python deletar o FII pelo ID
  async function excluirFii(id) {
    const confirmar = window.confirm(
      "Tem certeza que deseja apagar este fundo da sua carteira?",
    );
    if (confirmar) {
      try {
        await fetch(`http://127.0.0.1:8000/carteira/${id}`, {
          method: "DELETE",
        });
        // Atualiza a lista na tela logo após apagar no banco
        buscarCarteira();
      } catch (erro) {
        console.error("Erro ao excluir FII:", erro);
      }
    }
  }

  const totalCarteira = carteira.reduce(
    (acumulador, item) => acumulador + parseFloat(item.total_investido),
    0,
  );

  return (
    <div className="container">
      <header>
        <h1>Minha Carteira de FIIs</h1>
        <p>Registre suas compras e acompanhe seu patrimônio.</p>
      </header>

      <main>
        <section className="formulario fiis-form">
          <h3>Registrar Nova Compra</h3>
          <form className="grid-form" onSubmit={adicionarFii}>
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
              <label>Preço Pago por Cota (R$)</label>
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
                Adicionar à Carteira
              </button>
            </div>
          </form>
        </section>

        <section className="extrato carteira-lista">
          <h3>Meus Investimentos</h3>

          <div className="resumo-carteira">
            <p>
              Patrimônio Total Investido:{" "}
              <strong>R$ {totalCarteira.toFixed(2)}</strong>
            </p>
          </div>

          {carteira.length === 0 ? (
            <p className="vazio">
              Você ainda não possui cotas na sua carteira.
            </p>
          ) : (
            <ul className="lista-transacoes">
              {carteira.map((item) => (
                <li key={item.id} className="item-transacao fii-item">
                  <div className="fii-info">
                    <span className="desc fii-ticker">{item.ticker}</span>
                    <span className="fii-qtd">{item.quantidade} cotas</span>
                  </div>
                  {/* A lixeira agrupada com os valores para manter o alinhamento */}
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
          )}
        </section>
      </main>
    </div>
  );
}

export default Fiis;
