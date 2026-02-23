import { useState, useEffect } from "react";
import "../index.css";

function Dashboard() {
  const [saldo, setSaldo] = useState(0);
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [transacoes, setTransacoes] = useState([]);

  // Função para buscar os dados do Python (GET)
  async function buscarTransacoes() {
    try {
      const resposta = await fetch("http://127.0.0.1:8000/transacoes");
      const dados = await resposta.json();

      setTransacoes(dados);

      // Recalcula o saldo total somando tudo que veio do banco
      const saldoCalculado = dados.reduce(
        (acumulador, item) => acumulador + parseFloat(item.valor),
        0,
      );
      setSaldo(saldoCalculado);
    } catch (erro) {
      console.error("Erro ao buscar transações:", erro);
    }
  }

  // useEffect faz a busca rodar automaticamente quando a tela abre
  useEffect(() => {
    buscarTransacoes();
  }, []);

  // Função para enviar uma nova transação para o Python (POST)
  async function adicionarTransacao(event) {
    event.preventDefault();

    const valorNumero = parseFloat(valor);

    if (!isNaN(valorNumero)) {
      const novaTransacao = {
        descricao: descricao,
        valor: valorNumero,
      };

      try {
        // Envia os dados para a API
        await fetch("http://127.0.0.1:8000/transacoes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(novaTransacao),
        });

        // Limpa os campos da tela
        setDescricao("");
        setValor("");

        // Pede para o React buscar a lista atualizada no banco
        buscarTransacoes();
      } catch (erro) {
        console.error("Erro ao salvar transação:", erro);
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
              {/* Agora o React lê as transações direto do banco de dados! */}
              {transacoes.map((t) => (
                <li key={t.id} className="item-transacao">
                  <span className="desc">{t.descricao}</span>
                  <span
                    className={
                      parseFloat(t.valor) >= 0
                        ? "valor receita"
                        : "valor despesa"
                    }
                  >
                    R$ {parseFloat(t.valor).toFixed(2)}
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

export default Dashboard;
