package br.com.unibus.unibus_app.service;

import br.com.unibus.unibus_app.dto.LinhaResponse;
import br.com.unibus.unibus_app.model.Linha;
import br.com.unibus.unibus_app.repository.LinhaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LinhaService {

    private static final int MIN_TERM_LENGTH = 1;
    private static final int MAX_LIMIT = 20;

    private final LinhaRepository linhaRepository;

    public List<LinhaResponse> buscar(String termo, int limit) {
        String normalizado = termo != null ? termo.trim() : "";
        if (normalizado.length() < MIN_TERM_LENGTH) {
            return List.of();
        }

        int limiteSeguro = Math.min(Math.max(limit, 1), MAX_LIMIT);
        List<Linha> linhas = linhaRepository.buscarPorTermo(
                normalizado,
                PageRequest.of(0, limiteSeguro)
        );

        return linhas.stream().map(LinhaResponse::from).toList();
    }

}
