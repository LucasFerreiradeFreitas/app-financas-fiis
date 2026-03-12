from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import jwt
import random
from conexao import obter_conexao
from seguranca import gerar_hash_senha, verificar_senha, criar_token_acesso, CHAVE_SECRETA, ALGORITMO 
from email_service import enviar_email_recuperacao

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# GESTOR DE CONEXÕES (O Fim das Quedas!)
# ==========================================
def get_db():
    conexao = obter_conexao()
    try:
        yield conexao
    finally:
        conexao.close() # Fecha sempre a porta depois de usar

@app.head("/")
@app.get("/")
def health_check():
    return {"status": "API Finanças está online no Supabase!"}

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

class EsqueciSenha(BaseModel):
    email: str

class ValidarCodigo(BaseModel):
    email: str
    codigo: str

class RedefinirSenha(BaseModel):
    email: str
    codigo: str
    nova_senha: str

class Transacao(BaseModel):
    descricao: str
    valor: float
    data: str 

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
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Acesso negado. Faça login para continuar.")
    
    token = authorization.split(" ")[1] 
    
    try:
        payload = jwt.decode(token, CHAVE_SECRETA, algorithms=[ALGORITMO])
        return int(payload.get("sub"))
    except:
        raise HTTPException(status_code=401, detail="Crachá inválido ou expirado. Faça login novamente.")

# ==========================================
# ROTAS DE AUTENTICAÇÃO E RECUPERAÇÃO
# ==========================================
@app.post("/usuarios/cadastrar")
def cadastrar_usuario(usuario: UsuarioCriar, db = Depends(get_db)):
    try:
        cursor = db.cursor()
        cursor.execute("SELECT * FROM usuarios WHERE email = %s", (usuario.email,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Este e-mail já está cadastrado.")
        
        senha_segura = gerar_hash_senha(usuario.senha)
        cursor.execute("INSERT INTO usuarios (nome, email, senha) VALUES (%s, %s, %s)", (usuario.nome, usuario.email, senha_segura))
        db.commit()
        return {"mensagem": f"Sucesso! Conta criada para {usuario.nome}."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao cadastrar: {e}")

@app.post("/usuarios/login")
def login_usuario(usuario: UsuarioLogin, db = Depends(get_db)):
    try:
        cursor = db.cursor()
        cursor.execute("SELECT * FROM usuarios WHERE email = %s", (usuario.email,))
        usuario_db = cursor.fetchone()
        
        if not usuario_db or not verificar_senha(usuario.senha, usuario_db['senha']):
            raise HTTPException(status_code=401, detail="E-mail ou senha incorretos.")
        
        token = criar_token_acesso({"sub": str(usuario_db['id']), "nome": usuario_db['nome']})
        return {"access_token": token, "token_type": "bearer", "nome": usuario_db['nome']}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro no login: {e}")

@app.post("/usuarios/esqueci-senha")
def esqueci_senha(req: EsqueciSenha, db = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT id FROM usuarios WHERE email = %s", (req.email,))
    usuario = cursor.fetchone()

    if not usuario:
        raise HTTPException(status_code=404, detail="E-mail não encontrado.")

    codigo = str(random.randint(100000, 999999))
    cursor.execute("UPDATE usuarios SET codigo_recuperacao = %s WHERE email = %s", (codigo, req.email))
    db.commit()

    sucesso = enviar_email_recuperacao(req.email, codigo)
    if sucesso:
        return {"mensagem": "Código enviado! Verifique seu e-mail."}
    else:
        raise HTTPException(status_code=500, detail="Erro ao enviar o e-mail pela API.")

@app.post("/usuarios/validar-codigo")
def validar_codigo(req: ValidarCodigo, db = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT id FROM usuarios WHERE email = %s AND codigo_recuperacao = %s", (req.email, req.codigo))
    usuario = cursor.fetchone()

    if not usuario:
        raise HTTPException(status_code=400, detail="Código inválido ou expirado.")
        
    return {"mensagem": "Código validado com sucesso! Pode redefinir a senha."}

@app.post("/usuarios/redefinir-senha")
def redefinir_senha(req: RedefinirSenha, db = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT id FROM usuarios WHERE email = %s AND codigo_recuperacao = %s", (req.email, req.codigo))
    usuario = cursor.fetchone()

    if not usuario:
        raise HTTPException(status_code=400, detail="Não foi possível redefinir. Código inválido.")

    senha_segura = gerar_hash_senha(req.nova_senha)
    cursor.execute("UPDATE usuarios SET senha = %s, codigo_recuperacao = NULL WHERE email = %s", (senha_segura, req.email))
    db.commit()

    return {"mensagem": "Senha atualizada com sucesso!"}

# ==========================================
# ROTAS DO EXTRATO 
# ==========================================
@app.get("/transacoes")
def listar_transacoes(usuario_id: int = Depends(obter_usuario_logado), db = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM transacoes WHERE usuario_id = %s ORDER BY id DESC", (usuario_id,))
    return cursor.fetchall()

@app.post("/transacoes")
def adicionar_transacao(transacao: Transacao, usuario_id: int = Depends(obter_usuario_logado), db = Depends(get_db)):
    cursor = db.cursor()
    sql = "INSERT INTO transacoes (descricao, valor, data, usuario_id) VALUES (%s, %s, %s, %s)"
    cursor.execute(sql, (transacao.descricao, transacao.valor, transacao.data, usuario_id))
    db.commit() 
    return {"mensagem": "Transação registrada."}

@app.delete("/transacoes/{id_transacao}")
def deletar_transacao(id_transacao: int, usuario_id: int = Depends(obter_usuario_logado), db = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("DELETE FROM transacoes WHERE id = %s AND usuario_id = %s", (id_transacao, usuario_id))
    db.commit()
    return {"mensagem": "Transação excluída!"}

# ==========================================
# ROTAS DA CARTEIRA DE FIIs
# ==========================================
@app.get("/carteira")
def listar_carteira(usuario_id: int = Depends(obter_usuario_logado), db = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM carteira WHERE usuario_id = %s ORDER BY total_investido DESC", (usuario_id,))
    return cursor.fetchall()

@app.post("/carteira")
def registrar_compra(compra: CompraFii, usuario_id: int = Depends(obter_usuario_logado), db = Depends(get_db)):
    cursor = db.cursor()
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

    db.commit()
    return {"mensagem": "FII atualizado."}

@app.delete("/carteira/{id_fii}")
def deletar_fii(id_fii: int, usuario_id: int = Depends(obter_usuario_logado), db = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("DELETE FROM carteira WHERE id = %s AND usuario_id = %s", (id_fii, usuario_id))
    db.commit()
    return {"mensagem": "FII excluído!"}

# ==========================================
# ROTAS DAS CAIXINHAS
# ==========================================
@app.get("/caixinhas")
def listar_caixinhas(usuario_id: int = Depends(obter_usuario_logado), db = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM caixinhas WHERE usuario_id = %s ORDER BY id DESC", (usuario_id,))
    return cursor.fetchall()

@app.post("/caixinhas")
def criar_caixinha(caixinha: CaixinhaCriar, usuario_id: int = Depends(obter_usuario_logado), db = Depends(get_db)):
    cursor = db.cursor()
    sql = "INSERT INTO caixinhas (nome, meta_total, meta_mensal, saldo, usuario_id) VALUES (%s, %s, %s, %s, %s)"
    cursor.execute(sql, (caixinha.nome, caixinha.meta_total, caixinha.meta_mensal, 0.0, usuario_id))
    db.commit()
    return {"mensagem": "Caixinha criada com sucesso!"}

@app.post("/caixinhas/{id_caixinha}/depositar")
def movimentar_caixinha(id_caixinha: int, mov: CaixinhaMovimentacao, usuario_id: int = Depends(obter_usuario_logado), db = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM caixinhas WHERE id = %s AND usuario_id = %s", (id_caixinha, usuario_id))
    caixinha = cursor.fetchone()
    
    if not caixinha:
        raise HTTPException(status_code=404, detail="Caixinha não encontrada")
    
    novo_saldo = float(caixinha['saldo']) + mov.valor
    cursor.execute("UPDATE caixinhas SET saldo = %s WHERE id = %s", (novo_saldo, id_caixinha))
    
    descricao_transacao = f"Depósito Caixinha: {caixinha['nome']}" if mov.valor > 0 else f"Resgate Caixinha: {caixinha['nome']}"
    valor_transacao = -mov.valor 
    
    cursor.execute("INSERT INTO transacoes (descricao, valor, data, usuario_id) VALUES (%s, %s, CURRENT_DATE, %s)", (descricao_transacao, valor_transacao, usuario_id))
    
    db.commit()
    return {"mensagem": "Movimentação realizada com sucesso!", "novo_saldo": novo_saldo}

@app.delete("/caixinhas/{id_caixinha}")
def deletar_caixinha(id_caixinha: int, usuario_id: int = Depends(obter_usuario_logado), db = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM caixinhas WHERE id = %s AND usuario_id = %s", (id_caixinha, usuario_id))
    caixinha = cursor.fetchone()
    
    if not caixinha:
        raise HTTPException(status_code=404, detail="Caixinha não encontrada")
    
    if float(caixinha['saldo']) > 0:
        descricao = f"Resgate Automático (Caixinha Excluída: {caixinha['nome']})"
        cursor.execute("INSERT INTO transacoes (descricao, valor, data, usuario_id) VALUES (%s, %s, CURRENT_DATE, %s)", (descricao, caixinha['saldo'], usuario_id))
        
    cursor.execute("DELETE FROM caixinhas WHERE id = %s", (id_caixinha,))
    db.commit()
    return {"mensagem": "Caixinha excluída e saldo devolvido!"}