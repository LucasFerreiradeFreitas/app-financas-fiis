from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from conexao import obter_conexao

app = FastAPI()

app.add_middleware(
  CORSMiddleware,
  allow_origins=["*"],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

conexao_banco = obter_conexao()

class Transacao(BaseModel):
  descricao: str
  valor: float

@app.get("/")
def read_root():
  if conexao_banco and conexao_banco.is_connected():
    status_banco = "🟢 Banco conectado com sucesso!"
  else:
    status_banco = "🔴 Falha na conexão com o banco. Verifique a senha em conexao.py"

  return {
    "mensagem" : "O servidor Python do seu App financeiro está online!",
    "status_banco": status_banco
    }

@app.post("/transacoes")
def adicionar_transacao(transacao: Transacao):
  if not conexao_banco or not conexao_banco.is_connected():
    raise HTTPException(satatus_code=500, detail="Banco de dados desconectado")
  
  try:
    cursor = conexao_banco.cursor()

    sql = "INSERT INTO transacoes (descricao, valor) VALUES (%s, %s)"
    valores = (transacao.descricao, transacao.valor)

    cursor.execute(sql, valores)
    conexao_banco.commit()
    cursor.close()

    return {"mensagem": f"Sucesso! {transacao.descricao} registrada no banco."}
  
  except Exception as e:
    raise HTTPException(status_code=500, detail=f"Erro ao salvar: {e}")
  
@app.get("/transacoes")
def listar_transacoes():
  if not conexao_banco or not conexao_banco.is_connected():
    raise HTTPException(status_code=500, detail="Banco desconectado")
  
  try:
    cursor = conexao_banco.cursor(dictionary=True)
    cursor.execute("SELECT * FROM transacoes ORDER BY id DESC")
    resultados = cursor.fetchall()
    cursor.close()

    return resultados
  except Exception as e:
    raise HTTPException(status_code=500, detail=f"Erro ao buscar: {e}")
  
class CompraFii(BaseModel):
    ticker: str
    quantidade: int
    preco: float

@app.get("/carteira")
def listar_carteira():
  if not conexao_banco or not conexao_banco.is_connected():
    raise HTTPException(status_code=500, detail="Banco desconectado")
  
  try:
    cursor = conexao_banco.cursor(dictionary=True)
    cursor.execute("SELECT * FROM carteira ORDER BY total_investido DESC")
    resultados = cursor.fetchall()
    cursor.close()

    return resultados
  except Exception as e:
    raise HTTPException(status_code=500, detail=f"Erro ao buscar carteira: {e}")

@app.post("/carteira")
def registrar_compra(compra: CompraFii):
  if not conexao_banco or not conexao_banco.is_connected():
    raise HTTPException(status_code=500, detail="Banco desconectado")
  
  try:
    cursor = conexao_banco.cursor(dictionary=True)
    ticker_upper = compra.ticker.upper()

    cursor.execute("SELECT * FROM carteira WHERE ticker = %s", (ticker_upper,))
    fii_existente = cursor.fetchone()

    if fii_existente:
      nova_qtd = fii_existente['quantidade'] + compra.quantidade
      novo_total = float(fii_existente['total_investido']) + (compra.quantidade * compra.preco)
      novo_pm = novo_total / nova_qtd

      sql_update = "UPDATE carteira SET quantidade = %s, preco_medio = %s, total_investido = %s WHERE id = %s"
      cursor.execute(sql_update, (nova_qtd, novo_pm, novo_total, fii_existente['id']))
      mensagem = f"Sucesso! Posição de {ticker_upper} atualizada na carteira."
    
    else:
      total = compra.quantidade * compra.preco
      sql_insert = "INSERT INTO carteira (ticker, quantidade, preco_medio, total_investido) VALUES (%s, %s, %s, %s)"
      cursor.execute(sql_insert, (ticker_upper, compra.quantidade, compra.preco, total))
      mensagem = f"Sucesso! {ticker_upper} adicionado à carteira."
    
    conexao_banco.commit()
    cursor.close()
    return {"mensagem": mensagem}
  
  except Exception as e:
    raise HTTPException(status_code=500, detail=f"Erro ao registrar compra: {e}")