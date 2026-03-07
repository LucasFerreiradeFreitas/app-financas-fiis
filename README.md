# 💰 FinançasApp - Controle Financeiro e Carteira de FIIs

![Status](https://img.shields.io/badge/Status-Concluído-success)
![React](https://img.shields.io/badge/Frontend-React_18-61DAFB?logo=react&logoColor=black)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi&logoColor=white)
![MySQL](https://img.shields.io/badge/Database-MySQL-4479A1?logo=mysql&logoColor=white)

Uma aplicação Full-Stack completa para gestão financeira pessoal e acompanhamento de investimentos em Fundos Imobiliários (FIIs). Desenvolvida com uma arquitetura moderna, com autenticação segura e design responsivo.

## ✨ Funcionalidades

- **🔒 Autenticação e Segurança:**
  - Sistema de Login e Cadastro com criptografia de senhas (`bcrypt`).
  - Proteção de rotas utilizando tokens JWT.
  - Fluxo completo de Recuperação de Senha em 3 etapas com envio de código via e-mail real (integrado à API do Resend).
- **📊 Orçamento Mensal (Dashboard):**
  - Registro de receitas e despesas com filtro dinâmico por mês e ano.
  - Gráficos de barras interativos utilizando `recharts` para visualização de balanço.
- **📈 Carteira de FIIs:**
  - Registro de compras de Fundos Imobiliários (Tickers).
  - Cálculo automático de preço médio e patrimônio total investido.
  - Gráfico de pizza interativo exibindo a alocação da carteira.
- **🎯 Minhas Caixinhas:**
  - Criação de metas financeiras personalizadas (ex: Viagem, Reserva de Emergência).
  - Barra de progresso animada baseada no saldo e na meta.
  - Aportes e resgates integrados diretamente ao extrato principal.
- **🎨 Interface e Experiência do Usuário (UI/UX):**
  - Design responsivo (Mobile-first) com menu lateral (Sidebar/Drawer).
  - **Modo Escuro (Dark Mode)** com persistência de dados no `localStorage`.
  - Landing Page animada com efeitos visuais em Canvas.

## 🚀 Tecnologias Utilizadas

### Front-end

- **React.js** (com Vite)
- **Recharts** (Gráficos dinâmicos)
- **React Toastify** (Notificações e alertas amigáveis)
- **CSS3** (Variáveis CSS, Flexbox, CSS Grid, animações puras)

### Back-end

- **Python** com **FastAPI** (Alta performance e tipagem com Pydantic)
- **PyJWT** & **Bcrypt** (Segurança e Autenticação)
- **MySQL Connector** (Comunicação com o banco de dados)
- **Resend API** (Serviço transacional de e-mails)

### Infraestrutura / Banco de Dados

- **MySQL** (Hospedado na nuvem via Aiven)
- **Render** (Deploy do servidor Back-end)
- **Vercel** (Deploy da aplicação Front-end)

## ⚙️ Como executar o projeto localmente

### Pré-requisitos

- Node.js instalado
- Python 3.10+ instalado
- Um servidor MySQL rodando localmente ou na nuvem

### 1. Clonando o repositório

```bash
git clone [https://github.com/LucasFerreiradeFreitas/app-financas-fiis.git](https://github.com/LucasFerreiradeFreitas/app-financas-fiis.git)
cd app-financas-fiis
```
### 2. Configurar o Back-end

cd backend

# Crie e ative um ambiente virtual
python -m venv venv
source venv/bin/activate  # No Windows: venv\Scripts\activate

# Instale as dependências
pip install -r requirements.txt

### Crie um ficheiro .env na pasta backend com as seguintes variáveis:

DB_HOST=seu_host_mysql
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_NAME=seu_banco
DB_PORT=3306
SECRET_KEY=sua_chave_secreta_jwt
RESEND_API_KEY=sua_chave_do_resend

### Inicie o servidor local da API:

uvicorn main:app --reload

### 3. Configurar o Front-end

Abra um novo terminal e navegue para a pasta raiz (ou a pasta do frontend, se estiver separada):

# Instale as dependências do Node
npm install

# Inicie o servidor de desenvolvimento
npm run dev


👨‍💻 Autor

Desenvolvido por Lucas.