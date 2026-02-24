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
      password=os.getenv("DB_PASSWORD")
    )

    if conexao.is_connected():
      print("🟢 Sucesso: Python conectado ao cofre do MySQL!")
      return conexao
  
  except Error as e:
    print(f"🔴 Erro ao conectar ao banco de dados: {e}")
    return None