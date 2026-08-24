# API

> API REST do Projeto Mobo, responsável pela autenticação, gerenciamento de dados, regras de negócio e comunicação entre as aplicações do sistema.

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)
![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript)

---

## 📋 Sobre

O Mobo API é o backend do Projeto Mobo. A aplicação fornece uma API REST responsável por centralizar as regras de negócio e disponibilizar os dados utilizados pelas aplicações Web e Mobile.

Entre suas responsabilidades estão autenticação, gerenciamento de usuários, armazenamento de dados, gerenciamento de imagens e comunicação com os demais componentes do sistema.

---

## ✨ Funcionalidades

- 🔐 Autenticação e autorização de usuários
- 👤 Gerenciamento de usuários
- 📊 Gerenciamento dos dados do sistema
- 🌱 Gerenciamento de informações relacionadas à produção
- 📡 Integração com dados de IoT
- 🤖 Comunicação com componentes do sistema
- 🖼️ Upload e gerenciamento de imagens
- 📈 Consulta de dados históricos
- 🔑 Controle de acesso baseado em autenticação
- ☁️ Integração com serviços de armazenamento em nuvem

---

## 🛠️ Tecnologias

- **Node.js** — ambiente de execução
- **TypeScript** — linguagem e tipagem estática
- **Express** — framework para construção da API REST
- **MongoDB Atlas** — hospedagem do banco de dados
- **JWT** — autenticação baseada em tokens
- **Axios** — comunicação com serviços externos
- **Cloudinary** — armazenamento e gerenciamento de imagens
- **dotenv** — gerenciamento de variáveis de ambiente
- **Vitest** — testes automatizados

---

## 🏗️ Arquitetura

```text
api
├── src
│   ├── config
│   ├── controllers
│   ├── middlewares
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

### 1. Clonar o Repositório

```bash
git clone https://github.com/CW-Mobo/api.git
cd api
```

---

### 2. Backend (Node.js + TypeScript)

```bash
npm install
```

#### Configurar variáveis de ambiente

Na pasta `api`, crie um arquivo `.env` baseado no `.env.example` disponível no repositório.

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
DB_USER=seu_usuario_do_banco_de_dados
DB_PASSWORD=sua_senha_do_banco_de_dados
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

---

## 📚 

A documentação dos endpoints da API será disponibilizada através do Swagger.

**Status:** Em desenvolvimento.

---

## 🌐 Deploy

A API está hospedada no Render.

**Produção:** https://mobo-m9ug.onrender.com

---

## 📄 Licença

Este projeto está sob a licença MIT.

Consulte o arquivo LICENSE para mais informações.


Do
