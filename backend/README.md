# GameBox Backend

API REST em Spring Boot para o GameBox. Substitui o localStorage do front-end
por persistência real em PostgreSQL, autenticação com JWT, e move a chave da
RAWG API para o servidor (o front nunca mais precisa dela).

> Pra rodar tudo (banco + backend + front) com um único comando, veja o
> `README.md` na raiz do projeto (`docker compose up --build`). As
> instruções abaixo são pra quem quer rodar só o backend separadamente,
> fora do Docker, durante o desenvolvimento (hot-reload mais rápido).

> **Importante:** este projeto foi escrito neste ambiente sem acesso ao Maven
> Central, então não foi possível rodar `./mvnw clean install` aqui para
> confirmar a compilação (nem baixar o próprio Maven pelo wrapper). Testei o
> `mvnw` até o ponto em que ele tenta baixar o Maven — funcionou até onde deu
> pra verificar — mas a compilação em si eu não consegui rodar. Rode os
> passos abaixo na sua máquina — se aparecer algum erro, me mande a mensagem
> que eu corrijo.

## Pré-requisitos

- Java 21
- Docker (para o PostgreSQL) — ou um PostgreSQL local já instalado
- Maven **não precisa estar instalado** — o projeto já vem com o Maven
  Wrapper (`mvnw` / `mvnw.cmd`). Use `./mvnw` (Mac/Linux) ou `mvnw.cmd`
  (Windows) em vez de `mvn` nos comandos abaixo; na primeira execução ele
  baixa o Maven sozinho.

## Como rodar

1. Suba só o banco de dados (a partir da pasta raiz do projeto, um nível
   acima desta, onde fica o `docker-compose.yml` principal):
   ```
   cd ..
   docker compose up -d postgres
   cd backend
   ```
2. Copie `.env.example` para `.env` e preencha:
   ```
   RAWG_API_KEY=sua_chave_da_rawg
   JWT_SECRET=qualquer_string_longa_e_aleatoria
   ```
3. Exporte as variáveis (ou configure-as na sua IDE como "Environment
   variables" na run configuration):
   ```
   export $(cat .env | xargs)
   ```
4. Rode a aplicação:
   ```
   ./mvnw spring-boot:run
   ```
   (Windows: `mvnw.cmd spring-boot:run`). Ou, pela IDE, rode a classe
   `GameboxBackendApplication`.

5. A API sobe em `http://localhost:8080/api`. O Hibernate cria as tabelas
   automaticamente na primeira execução (`ddl-auto: update`).

## Endpoints principais

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| POST | `/api/auth/register` | não | Criar conta |
| POST | `/api/auth/login` | não | Login |
| GET | `/api/users/me` | sim | Usuário logado |
| PATCH | `/api/users/me` | sim | Editar perfil |
| GET | `/api/users/{username}` | não | Perfil público + estatísticas |
| GET | `/api/lists` | sim | Minhas listas |
| POST | `/api/lists` | sim | Criar lista |
| GET | `/api/lists/{id}` | não | Ver lista (link público) |
| POST | `/api/lists/{id}/games` | sim | Adicionar jogo |
| DELETE | `/api/lists/{id}/games/{gameId}` | sim | Remover jogo |
| GET | `/api/lists/invite/{code}` | não | Prévia do convite |
| POST | `/api/lists/invite/{code}/join` | sim | Entrar no grupo |
| GET | `/api/lists/{id}/games/{gameId}/ratings` | não | Avaliações do jogo na lista |
| POST | `/api/lists/{id}/games/{gameId}/ratings` | sim | Avaliar jogo |
| GET | `/api/activities/{username}` | não | Atividade do usuário |
| GET | `/api/rawg/games` | não | Proxy de busca RAWG |
| GET | `/api/rawg/games/{id}` | não | Proxy de detalhes RAWG |
| GET | `/api/rawg/games/{id}/screenshots` | não | Proxy de screenshots |
| GET | `/api/rawg/genres` / `/api/rawg/platforms` | não | Proxy de filtros |

Rotas autenticadas esperam `Authorization: Bearer <token>` — o token vem na
resposta de `/api/auth/login` e `/api/auth/register`.

## Arquitetura

- `domain/` — entidades JPA
- `repository/` — Spring Data JPA
- `security/` — JWT (geração, validação, filtro)
- `service/` — regras de negócio (inclui `RawgProxyService`, o único lugar
  que fala com a RAWG de verdade)
- `controller/` — endpoints REST
- `dto/` — objetos de request/response (nunca expõe as entidades JPA direto)
- `exception/` — exceções de negócio + handler global (retorna JSON `{message}`)

## Regras de permissão

- Lista **pessoal**: só o dono adiciona/remove/avalia jogos. Qualquer pessoa
  com o link pode visualizar (GET é público).
- Lista de **grupo**: qualquer membro adiciona jogos e avalia. Entrar exige o
  código de convite (`inviteCode`, gerado ao criar a lista).
