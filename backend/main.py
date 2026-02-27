from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import jwt
from conexao import obter_conexao
from seguranca import gerar_hash_senha, verificar_senha, criar_token_acesso, CHAVE_SECRETA, ALGORITMO 

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

conexao_banco = obter_conexao()

# ==========================================
# MOLDES DE DADOS
# ==========================================
class UsuarioCriar(BaseModel):
    nome: str
    email: str
    senha: str

class UsuarioLogin(BaseModel):
    email: str
    senha: str

class Transacao(BaseModel):
    descricao: str
    valor: float

class CompraFii(BaseModel):
    ticker: str
    quantidade: int
    preco: float

class CaixinhaCriar(BaseModel):
    nome: str
    meta_total: float = 0.0
    meta_mensal: float

class CaixinhaMovimentacao(BaseModel):
    valor: float

# ==========================================
# O SEGURANÇA DA PORTA (Lê o Crachá)
# ==========================================
def obter_usuario_logado(authorization: str = Header(None)):
    # 1. Verifica se a pessoa trouxe o crachá
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Acesso negado. Faça login para continuar.")
    
    token = authorization.split(" ")[1] # Pega só o código maluco, tira a palavra "Bearer "
    
    try:
        # 2. Desembaralha o crachá e pega o ID do usuário que está lá dentro
        payload = jwt.decode(token, CHAVE_SECRETA, algorithms=[ALGORITMO])
        return int(payload.get("sub"))
    except:
        raise HTTPException(status_code=401, detail="Crachá inválido ou expirado. Faça login novamente.")

# ==========================================
# ROTAS DE AUTENTICAÇÃO
# ==========================================
@app.post("/usuarios/cadastrar")
def cadastrar_usuario(usuario: UsuarioCriar):
    if not conexao_banco or not conexao_banco.is_connected():
        raise HTTPException(status_code=500, detail="Banco desconectado")
    try:
        cursor = conexao_banco.cursor(dictionary=True)
        cursor.execute("SELECT * FROM usuarios WHERE email = %s", (usuario.email,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Este e-mail já está cadastrado.")
        
        senha_segura = gerar_hash_senha(usuario.senha)
        cursor.execute("INSERT INTO usuarios (nome, email, senha) VALUES (%s, %s, %s)", (usuario.nome, usuario.email, senha_segura))
        conexao_banco.commit()
        cursor.close()
        return {"mensagem": f"Sucesso! Conta criada para {usuario.nome}."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao cadastrar: {e}")

@app.post("/usuarios/login")
def login_usuario(usuario: UsuarioLogin):
    if not conexao_banco or not conexao_banco.is_connected():
        raise HTTPException(status_code=500, detail="Banco desconectado")
    try:
        cursor = conexao_banco.cursor(dictionary=True)
        cursor.execute("SELECT * FROM usuarios WHERE email = %s", (usuario.email,))
        usuario_db = cursor.fetchone()
        cursor.close()
        
        if not usuario_db or not verificar_senha(usuario.senha, usuario_db['senha']):
            raise HTTPException(status_code=401, detail="E-mail ou senha incorretos.")
        
        token = criar_token_acesso({"sub": str(usuario_db['id']), "nome": usuario_db['nome']})
        return {"access_token": token, "token_type": "bearer", "nome": usuario_db['nome']}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro no login: {e}")

# ==========================================
# ROTAS DO EXTRATO 
# ==========================================
@app.get("/transacoes")
def listar_transacoes(usuario_id: int = Depends(obter_usuario_logado)):
    cursor = conexao_banco.cursor(dictionary=True)
    # Só busca as transações que pertencem a este usuário
    cursor.execute("SELECT * FROM transacoes WHERE usuario_id = %s ORDER BY id DESC", (usuario_id,))
    resultados = cursor.fetchall()
    cursor.close()
    return resultados

@app.post("/transacoes")
def adicionar_transacao(transacao: Transacao, usuario_id: int = Depends(obter_usuario_logado)):
    cursor = conexao_banco.cursor()
    # Salva a transação e carimba com o ID do usuário dono dela
    sql = "INSERT INTO transacoes (descricao, valor, usuario_id) VALUES (%s, %s, %s)"
    cursor.execute(sql, (transacao.descricao, transacao.valor, usuario_id))
    conexao_banco.commit() 
    cursor.close()
    return {"mensagem": "Transação registrada."}

@app.delete("/transacoes/{id_transacao}")
def deletar_transacao(id_transacao: int, usuario_id: int = Depends(obter_usuario_logado)):
    cursor = conexao_banco.cursor()
    # Garante que ele só pode apagar se o ID for dele
    cursor.execute("DELETE FROM transacoes WHERE id = %s AND usuario_id = %s", (id_transacao, usuario_id))
    conexao_banco.commit()
    cursor.close()
    return {"mensagem": "Transação excluída!"}

# ==========================================
# ROTAS DA CARTEIRA DE FIIs
# ==========================================
@app.get("/carteira")
def listar_carteira(usuario_id: int = Depends(obter_usuario_logado)):
    cursor = conexao_banco.cursor(dictionary=True)
    cursor.execute("SELECT * FROM carteira WHERE usuario_id = %s ORDER BY total_investido DESC", (usuario_id,))
    resultados = cursor.fetchall()
    cursor.close()
    return resultados

@app.post("/carteira")
def registrar_compra(compra: CompraFii, usuario_id: int = Depends(obter_usuario_logado)):
    cursor = conexao_banco.cursor(dictionary=True)
    ticker_upper = compra.ticker.upper()

    cursor.execute("SELECT * FROM carteira WHERE ticker = %s AND usuario_id = %s", (ticker_upper, usuario_id))
    fii_existente = cursor.fetchone()

    if fii_existente:
        nova_qtd = fii_existente['quantidade'] + compra.quantidade
        novo_total = float(fii_existente['total_investido']) + (compra.quantidade * compra.preco)
        novo_pm = novo_total / nova_qtd
        sql_update = "UPDATE carteira SET quantidade = %s, preco_medio = %s, total_investido = %s WHERE id = %s AND usuario_id = %s"
        cursor.execute(sql_update, (nova_qtd, novo_pm, novo_total, fii_existente['id'], usuario_id))
    else:
        total = compra.quantidade * compra.preco
        sql_insert = "INSERT INTO carteira (ticker, quantidade, preco_medio, total_investido, usuario_id) VALUES (%s, %s, %s, %s, %s)"
        cursor.execute(sql_insert, (ticker_upper, compra.quantidade, compra.preco, total, usuario_id))

    conexao_banco.commit()
    cursor.close()
    return {"mensagem": "FII atualizado."}

@app.delete("/carteira/{id_fii}")
def deletar_fii(id_fii: int, usuario_id: int = Depends(obter_usuario_logado)):
    cursor = conexao_banco.cursor()
    cursor.execute("DELETE FROM carteira WHERE id = %s AND usuario_id = %s", (id_fii, usuario_id))
    conexao_banco.commit()
    cursor.close()
    return {"mensagem": "FII excluído!"}

# ==========================================
# ROTAS DAS CAIXINHAS
# ==========================================
@app.get("/caixinhas")
def listar_caixinhas(usuario_id: int = Depends(obter_usuario_logado)):
    cursor = conexao_banco.cursor(dictionary=True)
    cursor.execute("SELECT * FROM caixinhas WHERE usuario_id = %s ORDER BY id DESC", (usuario_id,))
    resultados = cursor.fetchall()
    cursor.close()
    return resultados

@app.post("/caixinhas")
def criar_caixinha(caixinha: CaixinhaCriar, usuario_id: int = Depends(obter_usuario_logado)):
    cursor = conexao_banco.cursor()
    sql = "INSERT INTO caixinhas (nome, meta_total, meta_mensal, saldo, usuario_id) VALUES (%s, %s, %s, %s, %s)"
    cursor.execute(sql, (caixinha.nome, caixinha.meta_total, caixinha.meta_mensal, 0.0, usuario_id))
    conexao_banco.commit()
    cursor.close()
    return {"mensagem": "Caixinha criada com sucesso!"}

@app.post("/caixinhas/{id_caixinha}/depositar")
def movimentar_caixinha(id_caixinha: int, mov: CaixinhaMovimentacao, usuario_id: int = Depends(obter_usuario_logado)):
    cursor = conexao_banco.cursor(dictionary=True)
    
    # 1. Verifica se a caixinha existe e pertence a este utilizador
    cursor.execute("SELECT * FROM caixinhas WHERE id = %s AND usuario_id = %s", (id_caixinha, usuario_id))
    caixinha = cursor.fetchone()
    
    if not caixinha:
        cursor.close()
        raise HTTPException(status_code=404, detail="Caixinha não encontrada")
    
    # 2. Atualiza o saldo dentro da caixinha
    novo_saldo = float(caixinha['saldo']) + mov.valor
    cursor.execute("UPDATE caixinhas SET saldo = %s WHERE id = %s", (novo_saldo, id_caixinha))
    
    # 3. Se guardou dinheiro, cria uma despesa no extrato. Se resgatou, cria uma receita.
    descricao_transacao = f"Depósito Caixinha: {caixinha['nome']}" if mov.valor > 0 else f"Resgate Caixinha: {caixinha['nome']}"
    # Invertemos o sinal matemático (ex: depositou +100 na caixinha, vira -100 no saldo livre)
    valor_transacao = -mov.valor 
    
    cursor.execute("INSERT INTO transacoes (descricao, valor, usuario_id) VALUES (%s, %s, %s)", (descricao_transacao, valor_transacao, usuario_id))
    
    conexao_banco.commit()
    cursor.close()
    
    return {"mensagem": "Movimentação realizada com sucesso!", "novo_saldo": novo_saldo}