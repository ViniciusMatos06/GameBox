package com.gamebox.backend.service;

import com.gamebox.backend.domain.*;
import com.gamebox.backend.dto.list.AddGameRequest;
import com.gamebox.backend.dto.list.CreateListRequest;
import com.gamebox.backend.dto.list.InvitePreviewResponse;
import com.gamebox.backend.dto.list.ListResponse;
import com.gamebox.backend.exception.ApiExceptions.ConflictException;
import com.gamebox.backend.exception.ApiExceptions.ForbiddenException;
import com.gamebox.backend.exception.ApiExceptions.NotFoundException;
import com.gamebox.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ListService {

    private static final String INVITE_CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    private final GameListRepository gameListRepository;
    private final ListMemberRepository listMemberRepository;
    private final GameListItemRepository gameListItemRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final ActivityService activityService;

    @Transactional
    public ListResponse createList(String ownerUsername, CreateListRequest request) {
        User owner = userService.getByUsernameOrThrow(ownerUsername);

        GameList list = GameList.builder()
                .name(request.name())
                .description(request.description() == null ? "" : request.description())
                .type(request.type())
                .ownerId(owner.getId())
                .inviteCode(generateUniqueInviteCode())
                .build();
        list = gameListRepository.save(list);

        listMemberRepository.save(ListMember.builder().listId(list.getId()).userId(owner.getId()).build());

        activityService.log(owner.getId(), ActivityType.CREATED_LIST, list.getId(), list.getName(), null, null, null);

        return toResponse(list);
    }

    @Transactional(readOnly = true)
    public ListResponse getById(UUID listId) {
        GameList list = getListOrThrow(listId);
        return toResponse(list);
    }

    @Transactional(readOnly = true)
    public List<ListResponse> getListsForUsername(String username) {
        User user = userService.getByUsernameOrThrow(username);
        List<UUID> listIds = listMemberRepository.findByUserId(user.getId()).stream()
                .map(ListMember::getListId)
                .toList();
        return gameListRepository.findAllById(listIds).stream()
                .map(this::toResponse)
                .sorted((a, b) -> b.updatedAt().compareTo(a.updatedAt()))
                .toList();
    }

    @Transactional
    public ListResponse addGame(UUID listId, String requesterUsername, AddGameRequest request) {
        GameList list = getListOrThrow(listId);
        User requester = userService.getByUsernameOrThrow(requesterUsername);
        requireCanEdit(list, requester);

        if (gameListItemRepository.existsByListIdAndGameId(listId, request.gameId())) {
            throw new ConflictException("Este jogo já está nesta lista.");
        }

        GameListItem item = GameListItem.builder()
                .listId(listId)
                .gameId(request.gameId())
                .addedByUserId(requester.getId())
                .build();
        gameListItemRepository.save(item);
        touch(list);

        activityService.log(requester.getId(), ActivityType.ADDED_GAME, list.getId(), list.getName(),
                request.gameId(), request.gameName(), null);

        return toResponse(list);
    }

    @Transactional
    public void removeGame(UUID listId, String requesterUsername, Long gameId) {
        GameList list = getListOrThrow(listId);
        User requester = userService.getByUsernameOrThrow(requesterUsername);
        requireCanEdit(list, requester);

        gameListItemRepository.deleteByListIdAndGameId(listId, gameId);
        touch(list);
    }

    @Transactional(readOnly = true)
    public InvitePreviewResponse getInvitePreview(String inviteCode) {
        GameList list = gameListRepository.findByInviteCode(inviteCode)
                .orElseThrow(() -> new NotFoundException("Convite inválido ou expirado."));
        User owner = userRepository.findById(list.getOwnerId())
                .orElseThrow(() -> new NotFoundException("Usuário não encontrado."));

        return new InvitePreviewResponse(
                list.getId(),
                list.getName(),
                list.getDescription(),
                owner.getUsername(),
                gameListItemRepository.countByListId(list.getId()),
                listMemberRepository.countByListId(list.getId())
        );
    }

    @Transactional
    public ListResponse joinByInviteCode(String inviteCode, String username) {
        GameList list = gameListRepository.findByInviteCode(inviteCode)
                .orElseThrow(() -> new NotFoundException("Convite inválido ou expirado."));

        if (list.getType() != ListType.GROUP) {
            throw new ForbiddenException("Este link de convite não é válido.");
        }

        User user = userService.getByUsernameOrThrow(username);

        if (!listMemberRepository.existsByListIdAndUserId(list.getId(), user.getId())) {
            listMemberRepository.save(ListMember.builder().listId(list.getId()).userId(user.getId()).build());
            activityService.log(user.getId(), ActivityType.JOINED_LIST, list.getId(), list.getName(), null, null, null);
        }

        return toResponse(list);
    }

    // --- helpers -----------------------------------------------------------

    private GameList getListOrThrow(UUID listId) {
        return gameListRepository.findById(listId)
                .orElseThrow(() -> new NotFoundException("Lista não encontrada."));
    }

    private void requireCanEdit(GameList list, User requester) {
        boolean canEdit = list.getType() == ListType.PERSONAL
                ? list.getOwnerId().equals(requester.getId())
                : listMemberRepository.existsByListIdAndUserId(list.getId(), requester.getId());
        if (!canEdit) {
            throw new ForbiddenException("Você não tem permissão para editar esta lista.");
        }
    }

    private void touch(GameList list) {
        gameListRepository.save(list); // triggers @PreUpdate -> updatedAt
    }

    private String generateUniqueInviteCode() {
        String code;
        do {
            StringBuilder sb = new StringBuilder(8);
            for (int i = 0; i < 8; i++) sb.append(INVITE_CHARS.charAt(RANDOM.nextInt(INVITE_CHARS.length())));
            code = sb.toString();
        } while (gameListRepository.existsByInviteCode(code));
        return code;
    }

    private ListResponse toResponse(GameList list) {
        Map<UUID, String> usernamesById = userRepository.findAllById(
                listMemberRepository.findByListId(list.getId()).stream().map(ListMember::getUserId).toList()
        ).stream().collect(Collectors.toMap(User::getId, User::getUsername));

        User owner = userRepository.findById(list.getOwnerId())
                .orElseThrow(() -> new NotFoundException("Usuário não encontrado."));

        List<String> memberUsernames = listMemberRepository.findByListId(list.getId()).stream()
                .map(m -> usernamesById.getOrDefault(m.getUserId(), "desconhecido"))
                .toList();

        List<ListResponse.GameItem> games = gameListItemRepository.findByListIdOrderByAddedAtAsc(list.getId()).stream()
                .map(item -> new ListResponse.GameItem(
                        item.getGameId(),
                        userRepository.findById(item.getAddedByUserId()).map(User::getUsername).orElse("desconhecido"),
                        item.getAddedAt()
                ))
                .toList();

        return new ListResponse(
                list.getId(),
                list.getName(),
                list.getDescription(),
                list.getType(),
                owner.getUsername(),
                memberUsernames,
                games,
                list.getInviteCode(),
                list.getCreatedAt(),
                list.getUpdatedAt()
        );
    }
}
