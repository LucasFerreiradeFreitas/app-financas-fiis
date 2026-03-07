import os
import resend

def enviar_email_recuperacao(email_destino, codigo):
    # Pega a chave do cofre
    resend.api_key = os.getenv("RESEND_API_KEY")

    # Um e-mail bonito em HTML para o seu usuário
    corpo_html = f"""
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #2563eb;">FinançasApp</h2>
        <p>Olá!</p>
        <p>Você solicitou a recuperação de sua senha.</p>
        <p>Aqui está o seu código de verificação de 6 dígitos:</p>
        <h1 style="background: #f1f5f9; padding: 10px; text-align: center; letter-spacing: 5px; border-radius: 8px;">{codigo}</h1>
        <p style="font-size: 0.8rem; color: #666;">Se você não pediu isso, pode ignorar este e-mail com segurança.</p>
    </div>
    """

    try:
        # IMPORTANTE: O remetente TEM que ser onboarding@resend.dev no plano grátis
        resposta = resend.Emails.send({
            "from": "Suporte FinançasApp <onboarding@resend.dev>",
            "to": [email_destino],
            "subject": "Seu código de recuperação 🔒",
            "html": corpo_html
        })
        return True
    except Exception as e:
        print(f"Erro no Resend: {e}")
        return False