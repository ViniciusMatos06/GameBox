# GameBox

Letterboxd para jogos — descubra, organize e avalie jogos reais usando a RAWG API.

Front-end (React + TypeScript + Vite) + backend (Java + Spring Boot) +
PostgreSQL, tudo sobe junto com **um único comando** via Docker Compose.

## Pré-requisito

- Docker Desktop instalado e aberto (é a única coisa que você precisa ter
  instalado — nem Java, nem Node, nem Maven, nem Postgres).

## Como rodar

1. Copie `.env.example` para `.env` (mesma pasta deste README) e preencha:
   ```
   RAWG_API_KEY=sua_chave_da_rawg
   ```
   (chave gratuita em https://rawg.io/apidocs)

2. Na raiz do projeto:
   ```
   docker compose up --build
   ```
   Isso builda e sobe os três serviços: banco de dados, backend e front-end.
   A primeira vez demora alguns minutos (baixando imagens e dependências);
   as próximas são bem mais rápidas.

3. Quando o terminal parar de mostrar logs novos e o backend disser algo
   como `Started GameboxBackendApplication`, abra:
   ```
   http://localhost:5173
   ```

4. Pra desligar tudo: `Ctrl+C` no terminal, depois `docker compose down`
   (os dados do banco continuam salvos; `docker compose down -v` apaga tudo
   também, incluindo o banco, se você quiser começar do zero).

## O que cada serviço é

| Serviço | Porta no seu computador | O que é |
|---|---|---|
| `frontend` | `5173` | O site (React), servido por Nginx dentro do container |
| `backend` | `8080` | A API (Spring Boot) |
| `postgres` | `5432` | O banco de dados |

## Ver o banco de dados

Com os containers rodando:
```
docker exec -it gamebox-postgres psql -U gamebox -d gamebox
```
Dentro do psql: `\dt` lista as tabelas, `SELECT * FROM users;` mostra os
usuários cadastrados, etc. Ou conecte um cliente gráfico (DBeaver, pgAdmin)
em `localhost:5432`, banco `gamebox`, usuário/senha `gamebox`.

## Rodando sem Docker (desenvolvimento)

Se preferir rodar cada parte separadamente (hot-reload mais rápido durante
o desenvolvimento), veja o README dentro de `backend/` e `frontend/` — cada
um explica como rodar standalone (`./mvnw spring-boot:run` e `npm run dev`).

## Estrutura

```
gamebox/
├── docker-compose.yml   ← sobe tudo
├── .env.example
├── backend/             ← Spring Boot + Dockerfile
└── frontend/            ← React/Vite + Dockerfile + Nginx
```
