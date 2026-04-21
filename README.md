# Sistema de Avaliações — TALP 2026.1

Sistema web para gerenciamento de alunos, turmas e avaliações com notificação por email.

## Deploy

| Serviço | URL |
|---------|-----|
| **Frontend** (Vercel) | _adicione aqui o link da Vercel_ |
| **Backend** (Railway) | https://segundo-experimento-pratico-talp-production.up.railway.app |

## Stack

- **Frontend:** React 19 + TypeScript + Vite
- **Backend:** Node.js + Express 5 + TypeScript
- **Testes:** Cucumber (Gherkin)
- **Persistência:** JSON (arquivos no servidor)
- **Email:** Resend API

## Funcionalidades

- CRUD de alunos (nome, CPF, email)
- CRUD de turmas (descrição, ano, semestre) com matrícula de alunos
- Lançamento de avaliações por competência (Requisitos, Testes, Implementação, Documentação)
- Valores: MA (Melhor que o Esperado), MPA (Parcialmente Atendido), MANA (Não Atendeu)
- Notificação por email ao aluno quando avaliações são alteradas (máx. 1 email/dia, consolidado)

## Rodar localmente

```bash
# Backend
cd sistema/backend
npm install
npm run dev        # http://localhost:3001

# Frontend (outro terminal)
cd sistema/frontend
npm install
npm run dev        # http://localhost:5173

# Testes
cd sistema/testes
npm install
npm test
```

### Variáveis de ambiente (backend)

Crie `sistema/backend/.env` baseado em `.env.example`:

```
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_USER=resend
SMTP_PASS=sua_api_key_resend
SMTP_FROM=seu_email@dominio.com
```

Sem as variáveis SMTP, o sistema funciona normalmente mas os emails são apenas logados no console.
