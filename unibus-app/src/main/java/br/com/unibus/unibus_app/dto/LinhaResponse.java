package br.com.unibus.unibus_app.dto;

import br.com.unibus.unibus_app.model.Linha;

public record LinhaResponse(
        Integer idLinha,
        String numeroLinha,
        String nomeLinha,
        String origem,
        String destino,
        String trajeto
) {

    public static LinhaResponse from(Linha linha) {
        return new LinhaResponse(
                linha.getIdLinha(),
                linha.getNumeroLinha(),
                linha.getNomeLinha(),
                linha.getOrigem(),
                linha.getDestino(),
                formatarTrajeto(linha)
        );
    }

    private static String formatarTrajeto(Linha linha) {
        String origem = linha.getOrigem() != null ? linha.getOrigem().trim() : "";
        String destino = linha.getDestino() != null ? linha.getDestino().trim() : "";

        if (!origem.isEmpty() && !destino.isEmpty()) {
            return origem + " → " + destino;
        }
        if (linha.getNomeLinha() != null && !linha.getNomeLinha().isBlank()) {
            return linha.getNomeLinha().trim();
        }
        return "";
    }

}
