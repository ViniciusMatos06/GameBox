# GameBox — Front-end

Letterboxd para jogos — descubra, organize e avalie jogos reais usando a RAWG API.

Este é o front-end (React + TypeScript + Vite). Ele **não** fala mais direto
com a RAWG nem guarda dados em localStorage — tudo isso agora vive no
backend, na pasta `backend/` ao lado desta.

> Pra rodar tudo (banco + backend + front) com um único comando, veja o
> `README.md` na raiz do projeto (`docker compose up --build`). As
> instruções abaixo são pra quem quer rodar só o front separadamente, fora
> do Docker, durante o desenvolvimento (hot-reload mais rápido).

## Como rodar

1. Suba o backend primeiro (veja o README de `gamebox-backend`) — ele expõe
   a API em `http://localhost:8080/api`.
2. Nesta pasta:
   ```
   npm install
   ```
3. Copie `.env.example` para `.env`. O valor padrão já aponta pro backend
   local (`http://localhost:8080/api`); só mude se você rodar o backend em
   outra porta/endereço.
4. ```
   npm run dev
   ```
5. Abra o endereço que aparecer no terminal (normalmente http://localhost:5173)

Se o backend não estiver no ar, as telas mostram uma mensagem de erro clara
(via `ErrorState`) em vez de quebrar.

## Fluxo completo

- Landing pública → Criar conta / Entrar (autenticação real via JWT, emitido
  pelo backend)
- Home autenticada: suas listas, jogos populares e próximos lançamentos
  (RAWG via proxy do backend), atividade recente
- Explorar: busca real na RAWG com debounce, filtros (gênero, plataforma,
  ordenação) e paginação
- Detalhes do jogo: capa, descrição, screenshots, nota RAWG e Metacritic
  sempre separados da nota GameBox
- Minhas Listas: pessoais e de grupo, com filtros
- Criar lista (pessoal ou grupo)
- Página da lista:
  - Pessoal: grid de jogos, avaliação em estrelas própria, remover jogo
  - Grupo: participantes, jogos com média GameBox e quantidade de
    avaliações, clique abre modal com a avaliação de cada participante
- Convite por link (`/invite/:code`) → entrar no grupo
- Compartilhar lista de grupo (copiar link)
- Perfil público (estatísticas, listas, jogos avaliados recentemente,
  atividade)
- Editar perfil, Configurações, Logout

## Arquitetura

- `src/services/apiClient.ts` — wrapper único de `fetch` para o backend;
  injeta o token JWT automaticamente e normaliza erros.
- `src/services/rawgApi.ts` — chama `/rawg/*` no backend (que faz proxy pra
  RAWG de verdade). Nenhum componente fala com a RAWG diretamente.
- `src/services/{auth,list,rating,user,activity}Service.ts` — chamam os
  respectivos endpoints REST do backend.
- `src/context` — `AuthContext` (token + usuário logado, validados contra o
  backend ao carregar a página) e `ToastContext`.
- `src/components` — componentes reutilizáveis (StarRating, GameCard,
  GlobalSearch, modais, Navbar, etc).
- `src/pages` — uma página por rota, todas conectadas em `src/App.tsx`.
