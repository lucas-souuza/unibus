package br.com.unibus.unibus_app.service;

import br.com.unibus.unibus_app.dto.OcorrenciaRequest;
import br.com.unibus.unibus_app.dto.OcorrenciaResponse;
import br.com.unibus.unibus_app.model.Linha;
import br.com.unibus.unibus_app.model.Ocorrencia;
import br.com.unibus.unibus_app.model.TipoOcorrencia;
import br.com.unibus.unibus_app.model.Usuario;
import br.com.unibus.unibus_app.repository.LinhaRepository;
import br.com.unibus.unibus_app.repository.OcorrenciaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class OcorrenciaService {

    private final OcorrenciaRepository ocorrenciaRepository;
    private final LinhaRepository linhaRepository;
    private final UsuarioService usuarioService;

    @Transactional
    public OcorrenciaResponse registrar(String emailUsuario, OcorrenciaRequest request) {
        Usuario usuario = usuarioService.buscarPorEmail(emailUsuario);

        String numeroLinha = request.numeroLinha().trim();
        Linha linha = linhaRepository.findByNumeroLinha(numeroLinha)
                .orElseThrow(() -> new RuntimeException("Linha não encontrada: " + numeroLinha));

        TipoOcorrencia tipo = parseTipo(request.tipo());
        String descricao = normalizarDescricao(request.descricao());

        Ocorrencia ocorrencia = new Ocorrencia();
        ocorrencia.setUsuario(usuario);
        ocorrencia.setLinha(linha);
        ocorrencia.setTipo(tipo);
        ocorrencia.setDescricao(descricao);
        ocorrencia.setCriadoEm(LocalDateTime.now());

        Ocorrencia salva = ocorrenciaRepository.save(ocorrencia);
        return OcorrenciaResponse.from(salva);
    }

    private static TipoOcorrencia parseTipo(String tipo) {
        if (tipo == null || tipo.isBlank()) {
            throw new RuntimeException("Tipo de ocorrência é obrigatório");
        }

        return switch (tipo.trim().toLowerCase()) {
            case "superlotacao" -> TipoOcorrencia.SUPERLOTACAO;
            case "atraso" -> TipoOcorrencia.ATRASO;
            case "acidente" -> TipoOcorrencia.ACIDENTE;
            case "interrupcao" -> TipoOcorrencia.INTERRUPCAO;
            default -> throw new RuntimeException("Tipo de ocorrência inválido");
        };
    }

    private static String normalizarDescricao(String descricao) {
        if (descricao == null) {
            return null;
        }
        String texto = descricao.trim();
        return texto.isEmpty() ? null : texto;
    }

}
