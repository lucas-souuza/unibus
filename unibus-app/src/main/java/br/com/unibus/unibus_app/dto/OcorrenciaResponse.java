package br.com.unibus.unibus_app.dto;

import br.com.unibus.unibus_app.model.Linha;
import br.com.unibus.unibus_app.model.Ocorrencia;

import java.time.LocalDateTime;

public record OcorrenciaResponse(
        Integer id,
        String linha,
        String nomeLinha,
        String trajeto,
        String tipo,
        String descricao,
        LocalDateTime criadoEm,
        String nomeUsuario
) {
    public static OcorrenciaResponse from(Ocorrencia oc) {
        Linha linha = oc.getLinha();

        String numeroLinha = linha != null ? linha.getNumeroLinha() : null;
        String nomeLinha = linha != null ? linha.getNomeLinha() : null;

        String trajeto = null;
        if (linha != null) {
            String origem = linha.getOrigem();
            String destino = linha.getDestino();

            if (origem != null && !origem.isBlank() && destino != null && !destino.isBlank()) {
                trajeto = origem + " - " + destino;
            } else if (origem != null && !origem.isBlank()) {
                trajeto = origem;
            } else if (destino != null && !destino.isBlank()) {
                trajeto = destino;
            }
        }

        return new OcorrenciaResponse(
                oc.getIdOcorrencia(),
                numeroLinha,
                nomeLinha,
                trajeto,
                oc.getTipo() != null ? oc.getTipo().name().toLowerCase() : null,
                oc.getDescricao(),
                oc.getCriadoEm(),
                oc.getUsuario() != null ? oc.getUsuario().getNome() : null
        );
    }
}