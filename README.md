# API

> API REST do Projeto Mobo, responsável pela autenticação, gerenciamento de dados, regras de negócio e comunicação entre as aplicações do sistema.

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)
![Node.js](https://img.shields.io/badge/Node.js-24-339933?logo=node.js)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript)
![Express](https://img.shields.io/badge/Express-API-000000?logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)
![JWT](https://img.shields.io/badge/JWT-autenticação-000000?logo=jsonwebtokens)

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
api/
├── src/
│   ├── config/
│   ├── middlewares/
│   ├── modules/
|   |   ├── companies/
|   |   ├── harvest-images/
|   |   ├── harvests/
|   |   ├── plantings/
|   |   ├── sensor-data/
|   |   ├── sensors/
|   |   └── users/
|   |       └── auth/
|   ├── utils/
│   └── index.ts
├── tests/
|   ├── integration/
|   └── unit/
|       ├── companies/
|       ├── harvest-images/
|       ├── harvests/
|       ├── plantings/
|       ├── sensor-data/
|       ├── sensors/
|       └── users/
|           └── auth/
├── .env.example
├── .gitignore
├── LICENSE
├── package.json
├── package-lock.json
├── README.md
├── tsconfig.json
└── vitest.config.ts
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

### 2. Instalar Dependências 

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

### 3. Executar a API

```bash
npm run dev
```

A API ficará disponível em `http://localhost:5000`.

---

## 📚 Documentação da API

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
