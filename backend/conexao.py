import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

load_dotenv()

def obter_conexao():
    try:
        # Conecta ao Supabase e já configura para devolver os dados como Dicionário
        conexao = psycopg2.connect(
            os.getenv("DATABASE_URL"),
            cursor_factory=RealDictCursor
        )
        return conexao
    except Exception as e:
        print(f"❌ ERRO FATAL NO SUPABASE: {e}") 
        raise e