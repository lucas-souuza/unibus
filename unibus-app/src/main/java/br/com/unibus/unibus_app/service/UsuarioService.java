package br.com.unibus.unibus_app.service;

import br.com.unibus.unibus_app.model.Usuario;
import br.com.unibus.unibus_app.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository repository;
    private final PasswordEncoder passwordEncoder;

    public Usuario cadastrar(Usuario usuario){

        if (repository.existsByEmail(usuario.getEmail()))
            throw new RuntimeException("E-mail já cadastrado"); // RN01

        usuario.setSenha(passwordEncoder.encode(usuario.getSenha()));
        usuario.setCriadoEm(LocalDateTime.now());
        usuario.setNotificacoesAtivas(true);

        return repository.save(usuario);
    }

    public Usuario buscarPorEmail(String email) {
        return repository.findByEmail(email).orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
    }
}
