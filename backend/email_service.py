import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

def enviar_email_recuperacao(email_destino, codigo):
    # Pega os dados secretos do seu .env
    remetente = os.getenv("EMAIL_REMETENTE")
    senha = os.getenv("SENHA_EMAIL")

    # Monta a carta
    msg = MIMEMultipart()
    msg['From'] = remetente
    msg['To'] = email_destino
    msg['Subject'] = "Código de Recuperação - FinançasApp"

    # O texto do e-mail
    corpo = f"""
    Olá!
    
    Você solicitou a recuperação de senha no FinançasApp.
    Seu código de segurança de 6 dígitos é: {codigo}

    Se você não solicitou essa mudança, por favor ignore este e-mail.
    """
    
    msg.attach(MIMEText(corpo, 'plain'))

    try:
        # Conecta no servidor do Google e manda o e-mail
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls() # Liga a criptografia
        server.login(remetente, senha)
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        print(f"Erro ao enviar e-mail: {e}")
        return False