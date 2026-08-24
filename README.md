# API

> Interface web do Projeto Mobo para monitoramento, gerenciamento e visualização dos dados do sistema de colheita automatizada de lichia.

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)
![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript)

---

## 📋 Sobre

O **Mobo Web** é a aplicação web do Projeto Mobo, responsável pela interface de gerenciamento e monitoramento do sistema.

A aplicação permite visualizar informações coletadas pelo sistema, acompanhar dados da colheita, gerenciar usuários e acessar os recursos disponibilizados pela API do Mobo.

---

## ✨ Funcionalidades

- 🔐 Autenticação e gerenciamento de sessão
- 👤 Gerenciamento de usuários
- 📊 Dashboard com gráficos e indicadores
- 🌱 Visualização de dados relacionados à produção
- 🤖 Monitoramento do braço mecânico
- 📡 Visualização de dados IoT
- 📈 Visualização de histórico de dados
- 🖼️ Gerenciamento e visualização de imagens

---

## 🛠️ Tecnologias

- **Next.js** — framework da aplicação
- **React** — construção da interface
- **TypeScript** — tipagem estática
- **Axios** — comunicação com a API
- **React Chart.js** — gráficos e visualização de dados
- **Leaflet** — mapas e localização de dispositivos
- **Lucide React** — ícones
- **ESLint** — análise de código
- **Prettier** — formatação de código
- **Vitest** — testes

---
## 🏗️ Arquitetura

```text
api
├── src
│   ├── config
│   ├── controllers
│   ├── midllewares
│   ├── models
|   ├── routes
|   ├── services
|   ├── utils
│   └── index.ts
├── .env.example
├── package.json
├── package-lock.json
└── tsconfig.json

```

---

## 🚀 Como Rodar Localmente

### Pré-requisitos

Antes de começar, instale:

- [Node.js](https://nodejs.org/) v20 LTS (recomendado)
- [Git](https://git-scm.com/)
- [MongoDB](https://www.mongodb.com/) local **ou** conta no [MongoDB Atlas](https://www.mongodb.com/atlas)
- [Expo Go](https://expo.dev/go) no celular (para testar o app mobile)

### 1. Clonar o Repositório

```bash
git clone https://github.com/Cypher-Wave/Mobo.git
cd Mobo
```

---

### 2. Backend (Node.js + TypeScript)

```bash
cd backend
npm install
```

#### Configurar variáveis de ambiente

Na pasta `backend`, crie um arquivo `.env` baseado no `.env.example` disponível no repositório.

**Usando MongoDB local:**
```env
PORT=5000
DB_NAME=mobo
USE_LOCAL_DB=true
JWT_SECRET=minha_chave_super_secreta_123
NODE_ENV=development
```

A aplicação tentará conectar em `mongodb://127.0.0.1:27017/mobo`.

**Usando MongoDB Atlas:**
```env
PORT=5000
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_NAME=mobo
USE_LOCAL_DB=false
JWT_SECRET=minha_chave_super_secreta_123
NODE_ENV=development
```

#### Rodar o backend

```bash
npm run dev
```

A API ficará disponível em `http://localhost:5000`.
