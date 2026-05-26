package br.com.unibus.unibus_app.dto;

import br.com.unibus.unibus_app.model.Ocorrencia;
import br.com.unibus.unibus_app.model.TipoOcorrencia;

import java.time.LocalDateTime;

public record OcorrenciaResponse(
        Integer id,
        Integer idLinha,
        String numeroLinha,
        String tipo,
        String descricao,
        LocalDateTime criadoEm
) {

    public static OcorrenciaResponse from(Ocorrencia ocorrencia) {
        TipoOcorrencia tipo = ocorrencia.getTipo();
        String descricao = ocorrencia.getDescricao();

        return new OcorrenciaResponse(
                ocorrencia.getIdOcorrencia(),
                ocorrencia.getLinha().getIdLinha(),
                ocorrencia.getLinha().getNumeroLinha(),
                tipo != null ? tipo.name() : null,
                descricao != null ? descricao : "",
                ocorrencia.getCriadoEm()
        );
    }

}
