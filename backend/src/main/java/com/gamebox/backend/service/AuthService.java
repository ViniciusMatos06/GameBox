package com.gamebox.backend.service;

import com.gamebox.backend.domain.User;
import com.gamebox.backend.dto.auth.AuthDtos.AuthResponse;
import com.gamebox.backend.dto.auth.AuthDtos.LoginRequest;
import com.gamebox.backend.dto.auth.AuthDtos.RegisterRequest;
import com.gamebox.backend.dto.user.UserResponse;
import com.gamebox.backend.exception.ApiExceptions.ConflictException;
import com.gamebox.backend.exception.ApiExceptions.UnauthorizedException;
import com.gamebox.backend.repository.UserRepository;
import com.gamebox.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsernameIgnoreCase(request.username())) {
            throw new ConflictException("Este nome de usuário já está em uso.");
        }
        if (userRepository.existsByEmailIgnoreCase(request.email())) {
            throw new ConflictException("Este email já está cadastrado.");
        }

        String defaultAvatar = "https://api.dicebear.com/7.x/identicon/svg?seed=" + request.username();

        User user = User.builder()
                .name(request.name())
                .username(request.username())
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .bio("")
                .avatarUrl(defaultAvatar)
                .build();

        user = userRepository.save(user);

        String token = jwtService.generateToken(user.getUsername());
        return new AuthResponse(token, toResponse(user));
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsernameIgnoreCase(request.identifier())
                .or(() -> userRepository.findByEmailIgnoreCase(request.identifier()))
                .orElseThrow(() -> new UnauthorizedException("Email/usuário ou senha inválidos."));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new UnauthorizedException("Email/usuário ou senha inválidos.");
        }

        String token = jwtService.generateToken(user.getUsername());
        return new AuthResponse(token, toResponse(user));
    }

    public static UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getUsername(),
                user.getEmail(),
                user.getBio(),
                user.getAvatarUrl(),
                user.getCreatedAt()
        );
    }
}
