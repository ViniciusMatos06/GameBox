# GameBox

Letterboxd para jogos — descubra, organize e avalie jogos reais usando a RAWG API.

## Status atual

Já funcionando: landing page, cadastro/login (simulados com localStorage), Explorar
(busca real na RAWG com filtros/ordenação/paginação), página de detalhes do jogo
(com nota RAWG separada da nota GameBox), e Minhas Listas (leitura).

Ainda em construção: criar lista, página da lista (pessoal/grupo com avaliações),
perfil, editar perfil, configurações e página de convite. As rotas já existem e
mostram uma tela "em breve" por enquanto.

## Como rodar

1. `npm install`
2. Copie `.env.example` para `.env` e adicione sua chave gratuita da RAWG
   (crie uma em https://rawg.io/apidocs):
   ```
   VITE_RAWG_API_KEY=sua_chave_aqui
   ```
3. `npm run dev`
4. Abra o endereço que aparecer no terminal (normalmente http://localhost:5173)

Sem a chave configurada, o app roda normalmente mas mostra um aviso no lugar do
catálogo de jogos — nenhuma tela quebra.

## Arquitetura

- `src/services/rawgApi.ts` — única camada que fala com a RAWG API real.
- `src/services/{auth,list,rating,user,activity}Service.ts` — dados próprios do
  GameBox, hoje em localStorage (`src/services/storage.ts`), pensados para
  trocar por chamadas a um backend depois.
- `src/context` — AuthContext e ToastContext.
- `src/components` — componentes reutilizáveis (StarRating, GameCard, modais etc).
- `src/pages` — uma página por rota.
