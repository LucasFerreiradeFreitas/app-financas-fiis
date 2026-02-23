import mysql.connector
from mysql.connector import Error

def obter_conexao():
  try:
    conexao = mysql.connector.connect(
      host='localhost',
      database='app_financas',
      user='root',
      password='Target96669542*'
    )

    if conexao.is_connected():
      print("🟢 Sucesso: Python conectado ao cofre do MySQL!")
      return conexao
  
  except Error as e:
    print(f"🔴 Erro ao conectar ao banco de dados: {e}")
    return None