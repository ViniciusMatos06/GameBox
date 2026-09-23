import { GameList, GameReview, ListGame, ListMember, ListType, User, UserActivity } from '../types/gamebox';

const STORAGE_KEYS = {
  USERS: 'gamebox_users',
  SESSION: 'gamebox_session',
  LISTS: 'gamebox_lists',
  REVIEWS: 'gamebox_reviews',
  ACTIVITIES: 'gamebox_activities',
};

// Dados de exemplo para simulação inicial realista
const INITIAL_USERS: User[] = [
  {
    id: 'user-vinicius',
    name: 'Vinicius Matos',
    username: 'vinicius',
    email: 'vinicius@gamebox.dev',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    bio: 'Apaixonado por Soulslike, RPGs épicos e indie games inovadores.',
    createdAt: '2025-01-10T12:00:00.000Z',
  },
  {
    id: 'user-joao',
    name: 'João Silva',
    username: 'joao',
    email: 'joao@gamebox.dev',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    bio: 'Jogador competitivo de FPS e apreciador de campanhas narrativas.',
    createdAt: '2025-01-15T14:30:00.000Z',
  },
  {
    id: 'user-maria',
    name: 'Maria Clara',
    username: 'maria',
    email: 'maria@gamebox.dev',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    bio: 'Explorando mundos abertos e jogos com trilhas sonoras memoráveis.',
    createdAt: '2025-02-01T09:15:00.000Z',
  },
  {
    id: 'user-pedro',
    name: 'Pedro Henrique',
    username: 'pedro',
    email: 'pedro@gamebox.dev',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    bio: 'Amante de clássicos retro e RPGs táticos.',
    createdAt: '2025-02-10T18:00:00.000Z',
  },
];

// Avaliações de exemplo para demonstrar a nota GameBox
const INITIAL_REVIEWS: GameReview[] = [
  {
    id: 'rev-1',
    rawgGameId: 3272, // Elden Ring
    gameTitle: 'Elden Ring',
    gameCover: 'https://media.rawg.io/media/games/b29/b29377a0662d51119b99ecba809c9527.jpg',
    gameYear: '2022',
    userId: 'user-vinicius',
    username: 'vinicius',
    userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    comment: 'Uma obra-prima absoluta do design de mundo aberto e combate desafiador.',
    createdAt: '2025-02-12T10:00:00.000Z',
  },
  {
    id: 'rev-2',
    rawgGameId: 3272, // Elden Ring
    gameTitle: 'Elden Ring',
    gameCover: 'https://media.rawg.io/media/games/b29/b29377a0662d51119b99ecba809c9527.jpg',
    gameYear: '2022',
    userId: 'user-joao',
    username: 'joao',
    userAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    rating: 4,
    comment: 'Excelente, embora a dificuldade no terço final seja um pouco punitiva.',
    createdAt: '2025-02-14T15:20:00.000Z',
  },
  {
    id: 'rev-3',
    rawgGameId: 3272, // Elden Ring
    gameTitle: 'Elden Ring',
    gameCover: 'https://media.rawg.io/media/games/b29/b29377a0662d51119b99ecba809c9527.jpg',
    gameYear: '2022',
    userId: 'user-maria',
    username: 'maria',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    comment: 'A direção artística e a sensação de descoberta são incomparáveis!',
    createdAt: '2025-02-18T19:40:00.000Z',
  },
  {
    id: 'rev-4',
    rawgGameId: 28, // Red Dead Redemption 2
    gameTitle: 'Red Dead Redemption 2',
    gameCover: 'https://media.rawg.io/media/games/511/5118aff5091cb3efec399c808f8c598f.jpg',
    gameYear: '2018',
    userId: 'user-vinicius',
    username: 'vinicius',
    userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    comment: 'Arthur Morgan é um dos melhores protagonistas já criados na história dos videogames.',
    createdAt: '2025-02-20T21:00:00.000Z',
  },
  {
    id: 'rev-5',
    rawgGameId: 244800, // Hades
    gameTitle: 'Hades',
    gameCover: 'https://media.rawg.io/media/games/1f4/1f4dd01d2d0d88b65e1b6f0d7e3541e3.jpg',
    gameYear: '2020',
    userId: 'user-pedro',
    username: 'pedro',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    comment: 'Roguelike perfeito em narrativa, combate e trilha sonora.',
    createdAt: '2025-02-25T11:15:00.000Z',
  },
];

const INITIAL_LISTS: GameList[] = [
  {
    id: 'list-group-2026',
    name: 'Jogos para zerar em 2026',
    description: 'Nossa lista coletiva com os maiores desafios e lançamentos que planejamos finalizar juntos.',
    type: 'group',
    ownerId: 'user-vinicius',
    ownerUsername: 'vinicius',
    ownerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    createdAt: '2025-01-10T14:00:00.000Z',
    updatedAt: '2025-03-01T18:00:00.000Z',
    inviteCode: 'abc123',
    members: [
      {
        userId: 'user-vinicius',
        username: 'vinicius',
        name: 'Vinicius Matos',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        joinedAt: '2025-01-10T14:00:00.000Z',
        addedGamesCount: 2,
        reviewsCount: 2,
      },
      {
        userId: 'user-joao',
        username: 'joao',
        name: 'João Silva',
        avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
        joinedAt: '2025-01-12T16:20:00.000Z',
        addedGamesCount: 1,
        reviewsCount: 1,
      },
      {
        userId: 'user-maria',
        username: 'maria',
        name: 'Maria Clara',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        joinedAt: '2025-01-14T11:00:00.000Z',
        addedGamesCount: 1,
        reviewsCount: 1,
      },
    ],
    games: [
      {
        rawgId: 3272,
        title: 'Elden Ring',
        coverUrl: 'https://media.rawg.io/media/games/b29/b29377a0662d51119b99ecba809c9527.jpg',
        releaseYear: '2022',
        genres: ['Action', 'RPG'],
        platforms: ['PC', 'PlayStation 5', 'Xbox Series S/X'],
        addedByUserId: 'user-vinicius',
        addedByUsername: 'vinicius',
        addedAt: '2025-01-10T14:10:00.000Z',
      },
      {
        rawgId: 28,
        title: 'Red Dead Redemption 2',
        coverUrl: 'https://media.rawg.io/media/games/511/5118aff5091cb3efec399c808f8c598f.jpg',
        releaseYear: '2018',
        genres: ['Action', 'Adventure'],
        platforms: ['PC', 'PlayStation 4', 'Xbox One'],
        addedByUserId: 'user-vinicius',
        addedByUsername: 'vinicius',
        addedAt: '2025-01-10T14:20:00.000Z',
      },
      {
        rawgId: 244800,
        title: 'Hades',
        coverUrl: 'https://media.rawg.io/media/games/1f4/1f4dd01d2d0d88b65e1b6f0d7e3541e3.jpg',
        releaseYear: '2020',
        genres: ['Action', 'Indie', 'RPG'],
        platforms: ['PC', 'Nintendo Switch', 'PlayStation 5'],
        addedByUserId: 'user-joao',
        addedByUsername: 'joao',
        addedAt: '2025-01-12T16:30:00.000Z',
      },
      {
        rawgId: 3328,
        title: 'The Witcher 3: Wild Hunt',
        coverUrl: 'https://media.rawg.io/media/games/618/618c2031a070923e5e703e214c69f5d7.jpg',
        releaseYear: '2015',
        genres: ['Action', 'RPG'],
        platforms: ['PC', 'PlayStation 5', 'Xbox Series S/X'],
        addedByUserId: 'user-maria',
        addedByUsername: 'maria',
        addedAt: '2025-01-14T11:15:00.000Z',
      },
    ],
  },
  {
    id: 'list-personal-vinicius',
    name: 'Meus RPGs Favoritos de Todos os Tempos',
    description: 'Jogos que marcaram minha jornada como jogador com narrativas inesquecíveis.',
    type: 'personal',
    ownerId: 'user-vinicius',
    ownerUsername: 'vinicius',
    ownerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    createdAt: '2025-01-20T10:00:00.000Z',
    updatedAt: '2025-02-15T17:00:00.000Z',
    inviteCode: 'p-vini123',
    members: [
      {
        userId: 'user-vinicius',
        username: 'vinicius',
        name: 'Vinicius Matos',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        joinedAt: '2025-01-20T10:00:00.000Z',
        addedGamesCount: 2,
        reviewsCount: 2,
      },
    ],
    games: [
      {
        rawgId: 3272,
        title: 'Elden Ring',
        coverUrl: 'https://media.rawg.io/media/games/b29/b29377a0662d51119b99ecba809c9527.jpg',
        releaseYear: '2022',
        genres: ['Action', 'RPG'],
        platforms: ['PC', 'PlayStation 5'],
        addedByUserId: 'user-vinicius',
        addedByUsername: 'vinicius',
        addedAt: '2025-01-20T10:05:00.000Z',
      },
      {
        rawgId: 3328,
        title: 'The Witcher 3: Wild Hunt',
        coverUrl: 'https://media.rawg.io/media/games/618/618c2031a070923e5e703e214c69f5d7.jpg',
        releaseYear: '2015',
        genres: ['Action', 'RPG'],
        platforms: ['PC', 'PlayStation 5'],
        addedByUserId: 'user-vinicius',
        addedByUsername: 'vinicius',
        addedAt: '2025-01-20T10:10:00.000Z',
      },
    ],
  },
];

const INITIAL_ACTIVITIES: UserActivity[] = [
  {
    id: 'act-1',
    userId: 'user-vinicius',
    username: 'vinicius',
    userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    type: 'rated',
    gameId: 3272,
    gameTitle: 'Elden Ring',
    gameCover: 'https://media.rawg.io/media/games/b29/b29377a0662d51119b99ecba809c9527.jpg',
    rating: 5,
    timestamp: '2025-02-12T10:00:00.000Z',
  },
  {
    id: 'act-2',
    userId: 'user-joao',
    username: 'joao',
    userAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    type: 'added_to_list',
    gameId: 244800,
    gameTitle: 'Hades',
    gameCover: 'https://media.rawg.io/media/games/1f4/1f4dd01d2d0d88b65e1b6f0d7e3541e3.jpg',
    listId: 'list-group-2026',
    listName: 'Jogos para zerar em 2026',
    timestamp: '2025-01-12T16:30:00.000Z',
  },
  {
    id: 'act-3',
    userId: 'user-maria',
    username: 'maria',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    type: 'rated',
    gameId: 3272,
    gameTitle: 'Elden Ring',
    gameCover: 'https://media.rawg.io/media/games/b29/b29377a0662d51119b99ecba809c9527.jpg',
    rating: 5,
    timestamp: '2025-02-18T19:40:00.000Z',
  },
  {
    id: 'act-4',
    userId: 'user-vinicius',
    username: 'vinicius',
    userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    type: 'rated',
    gameId: 28,
    gameTitle: 'Red Dead Redemption 2',
    gameCover: 'https://media.rawg.io/media/games/511/5118aff5091cb3efec399c808f8c598f.jpg',
    rating: 5,
    timestamp: '2025-02-20T21:00:00.000Z',
  },
];

// Inicialização segura do localStorage
function initializeStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.LISTS)) {
    localStorage.setItem(STORAGE_KEYS.LISTS, JSON.stringify(INITIAL_LISTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.REVIEWS)) {
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(INITIAL_REVIEWS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ACTIVITIES)) {
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(INITIAL_ACTIVITIES));
  }
}

// Chamar inicializador
initializeStorage();

// Helpers para leitura e gravação
function getItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (err) {
    console.error(`Erro lendo localStorage [${key}]:`, err);
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Erro salvando em localStorage [${key}]:`, err);
  }
}

/* ==========================================================================
   USUÁRIOS & SESSÃO
   ========================================================================== */

export function getUsers(): User[] {
  return getItem<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
}

export function getCurrentUser(): User | null {
  const session = localStorage.getItem(STORAGE_KEYS.SESSION);
  if (!session) {
    // Por conveniência para demonstração, se não houver sessão ativa, definimos Vinicius como padrão
    const defaultUser = getUsers()[0];
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(defaultUser));
    return defaultUser;
  }
  try {
    return JSON.parse(session);
  } catch {
    return null;
  }
}

export function setCurrentUser(user: User | null): void {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  }
}

export function findUserByUsername(username: string): User | undefined {
  const users = getUsers();
  return users.find((u) => u.username.toLowerCase() === username.toLowerCase());
}

export function findUserByEmail(email: string): User | undefined {
  const users = getUsers();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function registerUser(userData: Omit<User, 'id' | 'createdAt'>): User {
  const users = getUsers();
  const existingEmail = findUserByEmail(userData.email);
  if (existingEmail) {
    throw new Error('Já existe uma conta com este e-mail.');
  }
  const existingUsername = findUserByUsername(userData.username);
  if (existingUsername) {
    throw new Error('Este nome de usuário já está em uso.');
  }

  const newUser: User = {
    ...userData,
    id: `user-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  setItem(STORAGE_KEYS.USERS, users);
  setCurrentUser(newUser);
  return newUser;
}

export function updateUserProfile(userId: string, data: Partial<User>): User {
  const users = getUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index === -1) throw new Error('Usuário não encontrado.');

  const updatedUser: User = { ...users[index], ...data };
  users[index] = updatedUser;
  setItem(STORAGE_KEYS.USERS, users);

  const currentUser = getCurrentUser();
  if (currentUser && currentUser.id === userId) {
    setCurrentUser(updatedUser);
  }

  return updatedUser;
}

/* ==========================================================================
   LISTAS (PESSOAIS E DE GRUPO)
   ========================================================================== */

export function getAllLists(): GameList[] {
  return getItem<GameList[]>(STORAGE_KEYS.LISTS, INITIAL_LISTS);
}

export function getListById(id: string): GameList | null {
  const lists = getAllLists();
  return lists.find((l) => l.id === id) || null;
}

export function getListByInviteCode(inviteCode: string): GameList | null {
  const lists = getAllLists();
  return lists.find((l) => l.inviteCode.toLowerCase() === inviteCode.toLowerCase()) || null;
}

export function getUserLists(userId: string): GameList[] {
  const lists = getAllLists();
  return lists.filter(
    (l) => l.ownerId === userId || l.members.some((m) => m.userId === userId)
  );
}

export function createList(
  data: {
    name: string;
    description: string;
    type: ListType;
  },
  owner: User
): GameList {
  const lists = getAllLists();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const newList: GameList = {
    id: `list-${Date.now()}`,
    name: data.name.trim(),
    description: data.description.trim(),
    type: data.type,
    ownerId: owner.id,
    ownerUsername: owner.username,
    ownerAvatar: owner.avatar,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    inviteCode: randomSuffix,
    members: [
      {
        userId: owner.id,
        username: owner.username,
        name: owner.name,
        avatar: owner.avatar,
        joinedAt: new Date().toISOString(),
        addedGamesCount: 0,
        reviewsCount: 0,
      },
    ],
    games: [],
  };

  lists.unshift(newList);
  setItem(STORAGE_KEYS.LISTS, lists);

  // Registrar atividade
  addActivity({
    userId: owner.id,
    username: owner.username,
    userAvatar: owner.avatar,
    type: 'created_list',
    listId: newList.id,
    listName: newList.name,
  });

  return newList;
}

export function deleteList(listId: string, userId: string): boolean {
  const lists = getAllLists();
  const list = lists.find((l) => l.id === listId);
  if (!list) return false;
  if (list.ownerId !== userId) {
    throw new Error('Somente o proprietário pode excluir esta lista.');
  }

  const filtered = lists.filter((l) => l.id !== listId);
  setItem(STORAGE_KEYS.LISTS, filtered);
  return true;
}

export function addGameToList(
  listId: string,
  game: {
    rawgId: number;
    title: string;
    coverUrl: string | null;
    releaseYear: string;
    genres: string[];
    platforms: string[];
  },
  user: User
): { success: boolean; message: string } {
  const lists = getAllLists();
  const listIndex = lists.findIndex((l) => l.id === listId);

  if (listIndex === -1) {
    return { success: false, message: 'Lista não encontrada.' };
  }

  const list = lists[listIndex];

  // Regra de permissão:
  // Lista Pessoal: somente dono
  // Lista de Grupo: qualquer membro participante
  const isOwner = list.ownerId === user.id;
  const isMember = list.members.some((m) => m.userId === user.id);

  if (list.type === 'personal' && !isOwner) {
    return { success: false, message: 'Somente o proprietário pode adicionar jogos a esta lista pessoal.' };
  }

  if (list.type === 'group' && !isMember && !isOwner) {
    return { success: false, message: 'Você precisa entrar neste grupo para adicionar jogos.' };
  }

  // REGRA 18: NÃO DUPLICAR JOGOS
  const alreadyExists = list.games.some((g) => g.rawgId === game.rawgId);
  if (alreadyExists) {
    return { success: false, message: 'Este jogo já está nesta lista.' };
  }

  const newGameEntry: ListGame = {
    rawgId: game.rawgId,
    title: game.title,
    coverUrl: game.coverUrl,
    releaseYear: game.releaseYear,
    genres: game.genres,
    platforms: game.platforms,
    addedByUserId: user.id,
    addedByUsername: user.username,
    addedAt: new Date().toISOString(),
  };

  list.games.push(newGameEntry);
  list.updatedAt = new Date().toISOString();

  // Atualizar contador do membro
  const memberIndex = list.members.findIndex((m) => m.userId === user.id);
  if (memberIndex !== -1) {
    list.members[memberIndex].addedGamesCount = (list.members[memberIndex].addedGamesCount || 0) + 1;
  }

  lists[listIndex] = list;
  setItem(STORAGE_KEYS.LISTS, lists);

  // Registrar atividade
  addActivity({
    userId: user.id,
    username: user.username,
    userAvatar: user.avatar,
    type: 'added_to_list',
    gameId: game.rawgId,
    gameTitle: game.title,
    gameCover: game.coverUrl,
    listId: list.id,
    listName: list.name,
  });

  return { success: true, message: `✓ ${game.title} foi adicionado à lista.` };
}

export function removeGameFromList(
  listId: string,
  rawgId: number,
  user: User
): { success: boolean; message: string } {
  const lists = getAllLists();
  const listIndex = lists.findIndex((l) => l.id === listId);

  if (listIndex === -1) {
    return { success: false, message: 'Lista não encontrada.' };
  }

  const list = lists[listIndex];
  const isOwner = list.ownerId === user.id;

  // Em lista pessoal, apenas o dono. Em grupo, o dono da lista ou quem adicionou o jogo
  const game = list.games.find((g) => g.rawgId === rawgId);
  if (!game) {
    return { success: false, message: 'Jogo não encontrado na lista.' };
  }

  const canRemove = isOwner || (list.type === 'group' && game.addedByUserId === user.id);
  if (!canRemove) {
    return { success: false, message: 'Você não tem permissão para remover este jogo.' };
  }

  list.games = list.games.filter((g) => g.rawgId !== rawgId);
  list.updatedAt = new Date().toISOString();

  // Decrementar contagem
  const memberIndex = list.members.findIndex((m) => m.userId === game.addedByUserId);
  if (memberIndex !== -1 && list.members[memberIndex].addedGamesCount > 0) {
    list.members[memberIndex].addedGamesCount -= 1;
  }

  lists[listIndex] = list;
  setItem(STORAGE_KEYS.LISTS, lists);

  return { success: true, message: 'Jogo removido da lista.' };
}

export function joinGroupList(inviteCode: string, user: User): { success: boolean; message: string; list?: GameList } {
  const lists = getAllLists();
  const listIndex = lists.findIndex((l) => l.inviteCode.toLowerCase() === inviteCode.toLowerCase());

  if (listIndex === -1) {
    return { success: false, message: 'Convite inválido ou expirado.' };
  }

  const list = lists[listIndex];
  if (list.type !== 'group') {
    return { success: false, message: 'Esta lista é pessoal e não aceita participantes.' };
  }

  const alreadyMember = list.members.some((m) => m.userId === user.id);
  if (alreadyMember) {
    return { success: true, message: 'Você já faz parte deste grupo!', list };
  }

  const newMember: ListMember = {
    userId: user.id,
    username: user.username,
    name: user.name,
    avatar: user.avatar,
    joinedAt: new Date().toISOString(),
    addedGamesCount: 0,
    reviewsCount: 0,
  };

  list.members.push(newMember);
  list.updatedAt = new Date().toISOString();
  lists[listIndex] = list;
  setItem(STORAGE_KEYS.LISTS, lists);

  // Atividade
  addActivity({
    userId: user.id,
    username: user.username,
    userAvatar: user.avatar,
    type: 'joined_group',
    listId: list.id,
    listName: list.name,
  });

  return { success: true, message: '✓ Você entrou no grupo!', list };
}

/* ==========================================================================
   AVALIAÇÕES (GAMEBOX REVIEWS)
   ========================================================================== */

export function getAllReviews(): GameReview[] {
  return getItem<GameReview[]>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
}

export function getReviewsForGame(rawgId: number): GameReview[] {
  const reviews = getAllReviews();
  return reviews.filter((r) => r.rawgGameId === rawgId);
}

export function getUserReviewForGame(rawgId: number, userId: string): GameReview | undefined {
  const reviews = getAllReviews();
  return reviews.find((r) => r.rawgGameId === rawgId && r.userId === userId);
}

export function getGameBoxRatingSummary(rawgId: number): {
  average: number;
  count: number;
  reviews: GameReview[];
} {
  const reviews = getReviewsForGame(rawgId);
  if (reviews.length === 0) {
    return { average: 0, count: 0, reviews: [] };
  }

  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  const average = Number((sum / reviews.length).toFixed(1));

  return {
    average,
    count: reviews.length,
    reviews,
  };
}

export function addOrUpdateReview(review: {
  rawgGameId: number;
  gameTitle: string;
  gameCover?: string | null;
  gameYear?: string;
  user: User;
  rating: number;
  comment?: string;
}): GameReview {
  const reviews = getAllReviews();
  const existingIndex = reviews.findIndex(
    (r) => r.rawgGameId === review.rawgGameId && r.userId === review.user.id
  );

  let updatedReview: GameReview;

  if (existingIndex !== -1) {
    // Atualizar avaliação existente
    updatedReview = {
      ...reviews[existingIndex],
      rating: review.rating,
      comment: review.comment || reviews[existingIndex].comment,
      createdAt: new Date().toISOString(),
    };
    reviews[existingIndex] = updatedReview;
  } else {
    // Nova avaliação
    updatedReview = {
      id: `rev-${Date.now()}`,
      rawgGameId: review.rawgGameId,
      gameTitle: review.gameTitle,
      gameCover: review.gameCover,
      gameYear: review.gameYear,
      userId: review.user.id,
      username: review.user.username,
      userAvatar: review.user.avatar,
      rating: review.rating,
      comment: review.comment,
      createdAt: new Date().toISOString(),
    };
    reviews.unshift(updatedReview);
  }

  setItem(STORAGE_KEYS.REVIEWS, reviews);

  // Atualizar contadores em listas onde o usuário é membro
  const lists = getAllLists();
  lists.forEach((l) => {
    const mem = l.members.find((m) => m.userId === review.user.id);
    if (mem) {
      mem.reviewsCount = reviews.filter((r) => r.userId === review.user.id).length;
    }
  });
  setItem(STORAGE_KEYS.LISTS, lists);

  // Registrar atividade
  addActivity({
    userId: review.user.id,
    username: review.user.username,
    userAvatar: review.user.avatar,
    type: 'rated',
    gameId: review.rawgGameId,
    gameTitle: review.gameTitle,
    gameCover: review.gameCover,
    rating: review.rating,
  });

  return updatedReview;
}

/* ==========================================================================
   FEED DE ATIVIDADES
   ========================================================================== */

export function getActivities(limit: number = 20): UserActivity[] {
  const activities = getItem<UserActivity[]>(STORAGE_KEYS.ACTIVITIES, INITIAL_ACTIVITIES);
  return activities.slice(0, limit);
}

export function getUserActivities(userId: string, limit: number = 20): UserActivity[] {
  const activities = getItem<UserActivity[]>(STORAGE_KEYS.ACTIVITIES, INITIAL_ACTIVITIES);
  return activities.filter((a) => a.userId === userId).slice(0, limit);
}

export function addActivity(activity: Omit<UserActivity, 'id' | 'timestamp'>): void {
  const activities = getItem<UserActivity[]>(STORAGE_KEYS.ACTIVITIES, INITIAL_ACTIVITIES);
  const newActivity: UserActivity = {
    ...activity,
    id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
  };

  activities.unshift(newActivity);
  // Manter no máximo 100 atividades
  if (activities.length > 100) activities.pop();
  setItem(STORAGE_KEYS.ACTIVITIES, activities);
}

/* ==========================================================================
   ESTATÍSTICAS DO USUÁRIO
   ========================================================================== */

export function getUserStats(userId: string) {
  const reviews = getAllReviews().filter((r) => r.userId === userId);
  const lists = getAllLists();
  const createdLists = lists.filter((l) => l.ownerId === userId);

  let addedGamesCount = 0;
  lists.forEach((list) => {
    addedGamesCount += list.games.filter((g) => g.addedByUserId === userId).length;
  });

  const avgRating =
    reviews.length > 0
      ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1))
      : 0;

  return {
    ratedGamesCount: reviews.length,
    createdListsCount: createdLists.length,
    addedGamesCount,
    averageRating: avgRating,
    recentReviews: reviews.slice(0, 8),
  };
}
