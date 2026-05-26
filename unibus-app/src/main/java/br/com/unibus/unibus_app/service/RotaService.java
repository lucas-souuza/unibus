package br.com.unibus.unibus_app.service;

import br.com.unibus.unibus_app.dto.RotaRequest;
import br.com.unibus.unibus_app.dto.RotaResponse;
import br.com.unibus.unibus_app.model.Rota;
import br.com.unibus.unibus_app.model.Usuario;
import br.com.unibus.unibus_app.repository.LinhaRepository;
import br.com.unibus.unibus_app.repository.RotaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RotaService {

    private static final int MAX_LOCALIDADES = 12;

    private final LinhaRepository linhaRepository;
    private final RotaRepository rotaRepository;
    private final UsuarioService usuarioService;

    public List<String> buscarLocalidades(String termo, String tipo) {
        String normalizado = termo != null ? termo.trim() : "";
        if (normalizado.length() < 1) {
            return List.of();
        }

        PageRequest page = PageRequest.of(0, MAX_LOCALIDADES);
        if ("destino".equalsIgnoreCase(tipo)) {
            return linhaRepository.buscarDestinos(normalizado, page);
        }
        return linhaRepository.buscarOrigens(normalizado, page);
    }

    @Transactional
    public RotaResponse compartilhar(String emailUsuario, RotaRequest request) {
        Usuario usuario = usuarioService.buscarPorEmail(emailUsuario);

        String origem = request.origem().trim();
        String destino = request.destino().trim();
        String descricao = request.descricao().trim();

        if (origem.equalsIgnoreCase(destino)) {
            throw new RuntimeException("Origem e destino devem ser diferentes");
        }

        Rota rota = new Rota();
        rota.setUsuario(usuario);
        rota.setOrigem(origem);
        rota.setDestino(destino);
        rota.setDescricao(descricao);
        rota.setCriadoEm(LocalDateTime.now());

        return RotaResponse.from(rotaRepository.save(rota));
    }

}
