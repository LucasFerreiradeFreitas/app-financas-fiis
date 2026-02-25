import os
from datetime import datetime, timedelta
import jwt
import bcrypt
from dotenv import load_dotenv

load_dotenv()

CHAVE_SECRETA = os.getenv("SECRET_KEY", "chave_reserva_caso_o_env_falhe")
ALGORITMO = "HS256"
TEMPO_EXPIRACAO_MINUTOS = 60 * 24 * 7 

# 1. Função que embaralha a senha
def gerar_hash_senha(senha: str):
    # Transforma o texto em bytes e usa o bcrypt puro para embaralhar
    senha_bytes = senha.encode('utf-8')
    sal = bcrypt.gensalt()
    hash_senha = bcrypt.hashpw(senha_bytes, sal)
    
    # Retorna como texto normal para salvar no banco
    return hash_senha.decode('utf-8')

# 2. Função que testa a senha no Login
def verificar_senha(senha_pura: str, senha_hash: str):
    senha_pura_bytes = senha_pura.encode('utf-8')
    senha_hash_bytes = senha_hash.encode('utf-8')
    return bcrypt.checkpw(senha_pura_bytes, senha_hash_bytes)

# 3. Imprime o Crachá Virtual
def criar_token_acesso(dados: dict):
    copia_dados = dados.copy()
    expiracao = datetime.utcnow() + timedelta(minutes=TEMPO_EXPIRACAO_MINUTOS)
    copia_dados.update({"exp": expiracao})
    token_codificado = jwt.encode(copia_dados, CHAVE_SECRETA, algorithm=ALGORITMO)
    return token_codificado