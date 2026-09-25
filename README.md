# API

> API REST do Projeto Mobo, responsável pela autenticação, gerenciamento de dados, regras de negócio e comunicação entre as aplicações do sistema.

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)
![Node.js](https://img.shields.io/badge/Node.js-24-339933?logo=node.js)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript)
![Express](https://img.shields.io/badge/Express-API-000000?logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)
![JWT](https://img.shields.io/badge/JWT-autenticação-000000?logo=jsonwebtokens)
![Swagger](https://img.shields.io/badge/Swagger-OpenAPI%203.0-85EA2D?logo=swagger&logoColor=black)
![Vitest](https://img.shields.io/badge/Vitest-6E9F18?logo=vitest&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Container-2496ED?logo=docker&logoColor=white)

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
- 📚 Documentação da API através do Swagger/OpenAPI

---

## 🛠️ Tecnologias

- **Node.js** — ambiente de execução
- **TypeScript** — linguagem e tipagem estática
- **Express** — framework para construção da API REST
- **MongoDB Atlas** — hospedagem do banco de dados
- **JWT** — autenticação baseada em tokens
- **Swagger / OpenAPI 3.0** — documentação e exploração interativa da API
- **Axios** — comunicação com serviços externos
- **Cloudinary** — armazenamento e gerenciamento de imagens
- **dotenv** — gerenciamento de variáveis de ambiente
- **Vitest** — testes automatizados
- **Docker** — containerização e padronização do ambiente de execução

---

## 🧪 Testes

A API possui testes automatizados utilizando **Vitest**, com testes unitários e de integração para os principais módulos da aplicação.

A cobertura atual do projeto é de aproximadamente:

* **94,02%** — Statements
* **94,28%** — Lines
* **93,26%** — Functions
* **85,31%** — Branches

Para executar os testes:

```bash
npm test
```

Para executar os testes uma única vez:

```bash
npm run test:run
```

Para gerar o relatório de cobertura:

```bash
npm run test:coverage
```

---

## 🏗️ Arquitetura

```text
api/
├── scripts/
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
|   ├── swagger/
|   |   ├── parameters/
|   |   ├── routes/
|   |   ├── schemas/
|   |   └── swagger.config.ts
|   ├── utils/
|   ├── app.ts
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
├── .dockerignore
├── .env.example
├── .gitignore
├── docker-compose.yml
├── Dockerfile
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

Para executar a API diretamente com Node.js, instale:

- [Node.js](https://nodejs.org/) v20 LTS (recomendado)
- [Git](https://git-scm.com/)
- [MongoDB](https://www.mongodb.com/) local **ou** conta no [MongoDB Atlas](https://www.mongodb.com/atlas)

Para executar a API utilizando Docker, instale também:

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

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

## 🐳 Executando com Docker

A API também pode ser executada utilizando Docker. A containerização permite reproduzir o ambiente da aplicação de forma isolada e padronizada, sem a necessidade de instalar Node.js e as dependências da API diretamente no ambiente de execução.

### Pré-requisitos

Antes de executar a aplicação com Docker, instale e inicie o **Docker Desktop**.

Também é necessário possuir um arquivo `.env` na raiz do projeto, contendo as variáveis necessárias para a aplicação.

O arquivo `.env` **não é incluído na imagem Docker**. As variáveis são disponibilizadas ao container durante sua execução.

### Executar com Docker Compose

Para construir a imagem e iniciar a API:

```bash
docker compose up --build
```

A API ficará disponível em:

`http://localhost:5000`

O Docker Compose utiliza o Dockerfile para:

1. Utilizar Node.js 24 como ambiente base;
2. Instalar as dependências do projeto;
3. Copiar o código da aplicação;
4. Compilar o projeto TypeScript;
5. Executar a API a partir do código compilado.

Como o projeto utiliza o **MongoDB Atlas**, não é necessário executar um container local do MongoDB. A API se conecta ao banco utilizando as variáveis de ambiente configuradas no `.env`.

### Parar o container

Para parar os serviços:

```bash
docker compose down
```

Caso existam containers órfãos de versões anteriores do Compose:

```bash
docker compose down --remove-orphans
```

### Reconstruir a imagem

Sempre que houver alterações que precisem ser incorporadas à imagem, utilize:

```bash
docker compose up --build
```

O uso de Docker é opcional. A API também pode ser executada diretamente utilizando Node.js

Dessa forma, o Docker é utilizado como uma alternativa para containerização e padronização do ambiente de execução, enquanto o modo tradicional continua disponível para desenvolvimento.

---

## 📚 Documentação da API

A API possui documentação interativa utilizando **Swagger UI** baseada na especificação **OpenAPI 3.0**.

A documentação inclui:

- Endpoints disponíveis na API
- Parâmetros de requisição
- Schemas de dados
- Exemplos de requisições e respostas
- Códigos de status HTTP
- Autenticação por JWT
- Autenticação através de cookies
- Organização da documentação por módulos

### Swagger UI

**Desenvolvimento:**

http://localhost:5000/api-docs

**Produção:** 

https://mobo-m9ug.onrender.com/api-docs

---

## 🌐 Deploy

A API está hospedada no Render.

**Produção:** https://mobo-m9ug.onrender.com

---

## 📄 Licença

Este projeto está sob a licença MIT.

Consulte o arquivo LICENSE para mais informações.
