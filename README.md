# GameBox

Letterboxd para jogos — descubra, organize e avalie jogos reais usando a RAWG API.

## Como rodar

1. `npm install`
2. Copie `.env.example` para `.env` e adicione sua chave gratuita da RAWG
   (crie uma em https://rawg.io/apidocs):
   ```
   VITE_RAWG_API_KEY=sua_chave_aqui
   ```
3. `npm run dev`
4. Abra o endereço que aparecer no terminal (normalmente http://localhost:5173)

Sem a chave configurada, o app roda normalmente (login, cadastro, listas), mas
mostra um aviso claro no lugar do catálogo de jogos — nenhuma tela quebra.

## Fluxo completo já funcionando

- Landing pública → Criar conta / Entrar (simulado com localStorage)
- Home autenticada: suas listas, jogos populares e próximos lançamentos (RAWG real), atividade recente
- Explorar: busca real na RAWG com debounce, filtros (gênero, plataforma, ordenação) e paginação
- Detalhes do jogo: capa, descrição, screenshots, nota RAWG e Metacritic sempre
  separados da nota GameBox
- Minhas Listas: pessoais e de grupo, com filtros
- Criar lista (pessoal ou grupo)
- Página da lista:
  - Pessoal: grid de jogos, avaliação em estrelas própria, remover jogo
  - Grupo: participantes, jogos com média GameBox e quantidade de avaliações,
    clique abre modal com a avaliação de cada participante
- Convite por link (`/invite/:code`) → entrar no grupo
- Compartilhar lista de grupo (copiar link)
- Perfil público (estatísticas, listas, jogos avaliados recentemente, atividade)
- Editar perfil, Configurações (privacidade/notificações/aparência/sessão), Logout

## Arquitetura

- `src/services/rawgApi.ts` — única camada que fala com a RAWG API real
  (busca, detalhes, screenshots, populares, próximos lançamentos, gêneros,
  plataformas), com cache simples em memória.
- `src/services/{auth,list,rating,user,activity}Service.ts` — dados próprios
  do GameBox, hoje em localStorage (`src/services/storage.ts`), isolados para
  facilitar a troca por um backend real depois (ver comentários no topo de
  cada arquivo).
- `src/context` — AuthContext e ToastContext.
- `src/components` — componentes reutilizáveis (StarRating, GameCard,
  GlobalSearch, modais, Navbar, etc).
- `src/pages` — uma página por rota, todas conectadas em `src/App.tsx`.

## Observações

- Autenticação é simulada no front-end (senha com hash trivial só para não
  gravar texto puro no localStorage) — não é segura e deve ser substituída
  por um backend real antes de qualquer uso com usuários reais.
- IDs de jogos salvos nas listas são sempre os IDs reais da RAWG; os dados de
  cada jogo (capa, nota, gêneros etc.) são sempre buscados da API, nunca
  duplicados em localStorage.
