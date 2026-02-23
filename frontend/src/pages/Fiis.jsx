import { useState } from "react";
import "../index.css";

function Fiis() {
  const [fii, setFii] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [preco, setPreco] = useState("");

  // A memória agora guarda a sua Carteira inteira
  const [carteira, setCarteira] = useState([]);

  function adicionarFii(event) {
    event.preventDefault();

    const qtdNum = parseInt(quantidade);
    const precoNum = parseFloat(preco);
    const fiiUpper = fii.toUpperCase();

    if (qtdNum > 0 && precoNum > 0 && fiiUpper) {
      // O app procura se esse FII já existe na sua lista
      const fiiExistente = carteira.find((item) => item.ticker === fiiUpper);

      if (fiiExistente) {
        // Se já existe, atualiza as cotas e o Preço Médio
        const novaCarteira = carteira.map((item) => {
          if (item.ticker === fiiUpper) {
            const novoTotalInvestido = item.totalInvestido + qtdNum * precoNum; 
            const novaQuantidade = item.quantidade + qtdNum;
            return {
              ...item,
              quantidade: novaQuantidade,
              totalInvestido: novoTotalInvestido,
              // O novo Preço Médio é o dinheiro total dividido pelo total de cotas
              precoMedio: novoTotalInvestido / novaQuantidade,
            };
          }
          return item;
        });
        setCarteira(novaCarteira);
      } else {
        // Se é a primeira vez comprando esse FII, adiciona na lista
        const novoFii = {
          id: Math.random().toString(),
          ticker: fiiUpper,
          quantidade: qtdNum,
          precoMedio: precoNum,
          totalInvestido: qtdNum * precoNum,
        };
        setCarteira([...carteira, novoFii]);
      }

      // Limpa o formulário para a próxima compra
      setFii("");
      setQuantidade("");
      setPreco("");
    }
  }

  // Calcula o patrimônio total somando todos os FIIs da lista
  const totalCarteira = carteira.reduce(
    (acumulador, item) => acumulador + item.totalInvestido,
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
                  <div className="fii-valores">
                    <span className="fii-pm">
                      PM: R$ {item.precoMedio.toFixed(2)}
                    </span>
                    <span className="valor receita">
                      R$ {item.totalInvestido.toFixed(2)}
                    </span>
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
