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