import { useState, useEffect } from "react";
import "../index.css";

function Dashboard() {
  const [saldo, setSaldo] = useState(0);
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [transacoes, setTransacoes] = useState([]);

  async function buscarTransacoes() {
    try {
      const resposta = await fetch("http://127.0.0.1:8000/transacoes");
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
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(novaTransacao),
        });
        setDescricao("");
        setValor("");
        buscarTransacoes();
      } catch (erro) {
        console.error("Erro ao salvar:", erro);
      }
    }
  }

  async function excluirTransacao(id) {
    // Um pequeno aviso para evitar exclusões acidentais
    const confirmar = window.confirm(
      "Tem certeza que deseja apagar este registro?",
    );
    if (confirmar) {
      try {
        await fetch(`http://127.0.0.1:8000/transacoes/${id}`, {
          method: "DELETE",
        });
        // Atualiza a lista na tela logo após apagar no banco
        buscarTransacoes();
      } catch (erro) {
        console.error("Erro ao excluir:", erro);
      }
    }
  }

  return (
    <div className="container">
      <header>
        <h1>Meu App Financeiro</h1>
        <p>Controle seu orçamento do dia a dia.</p>
      </header>

      <main>
        <section className="resumo">
          <h2>Resumo do Mês</h2>
          <p>Saldo livre: R$ {saldo.toFixed(2)}</p>
        </section>

        <section className="formulario">
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
              step="0.01"
              placeholder="Valor (use sinal - para despesa)"
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
            <p className="vazio">Nenhuma movimentação registrada ainda.</p>
          ) : (
            <ul className="lista-transacoes">
              {transacoes.map((t) => (
                <li key={t.id} className="item-transacao">
                  <span className="desc">{t.descricao}</span>
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
                    {/* O botão de excluir que passa o ID da transação */}
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
          )}
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
