import { useState } from "react";
import "./index.css";

function App() {
  const [saldo, setSaldo] = useState(0);
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");

  const [transacoes, setTransacoes] = useState([]);

  function adicionarTransacao(event) {
    event.preventDefault();

    const valorNumero = parseFloat(valor);

    if (!isNaN(valorNumero)) {
      setSaldo(saldo + valorNumero);

      const novaTransacao = {
        id: Math.random().toString(),
        descricao: descricao,
        valor: valorNumero,
      };

      setTransacoes([novaTransacao, ...transacoes]);

      setDescricao("");
      setValor("");
    }
  }

  return (
    <div className="container">
      <header>
        <h1>Meu App Financeiro</h1>
        <p>Controle seu orçamento e construa patrimônio com FIIs.</p>
      </header>

      <main>
        <section className="resumo">
          <h2>Resumo do Mês</h2>
          <p>Saldo livre para investir: R$ {saldo.toFixed(2)}</p>
        </section>

        <section>
          <h3>Nova Movimentação</h3>
          <form onSubmit={adicionarTransacao}>
            <input
              type="text"
              placeholder="Ex: Salário, Curso, etc."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              required
            />
            <input
              type="number"
              step={0.01}
              placeholder="Valor (use sinal - para despesa"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              required
            />
            <button type="submit">Adicionar</button>
          </form>
        </section>

        <section className="extrato">
          <h3>Extrato de Movimentações</h3>

          {transacoes.length === 0 ? (
            <p>Nenhuma movimentação registrada ainda.</p>
          ) : (
            <ul className="lista-transacoes">
              {transacoes.map((t) => (
                <li key={t.id} className="item-transacao">
                  <span className="desc">{t.descricao}</span>
                  <span
                    className={t.valor >= 0 ? "valor receita" : "valor despesa"}
                  >
                    R$ {t.valor.toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
