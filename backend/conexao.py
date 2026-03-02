import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv

load_dotenv()

def obter_conexao():
    try:
        conexao = mysql.connector.connect(
            host=os.getenv("DB_HOST"),
            database=os.getenv("DB_NAME"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            port=os.getenv("DB_PORT"),
            ssl_ca="ca.pem",
            use_pure=True
        )
        return conexao
    except Exception as e:
        print(f"❌ ERRO FATAL NO BANCO: {e}") 
        raise e