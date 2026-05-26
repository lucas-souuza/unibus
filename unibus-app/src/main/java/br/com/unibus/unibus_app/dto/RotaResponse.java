package br.com.unibus.unibus_app.dto;

import br.com.unibus.unibus_app.model.Rota;

import java.time.LocalDateTime;

public record RotaResponse(
        Integer id,
        String origem,
        String destino,
        String descricao,
        LocalDateTime criadoEm
) {

    public static RotaResponse from(Rota rota) {
        return new RotaResponse(
                rota.getIdRota(),
                rota.getOrigem(),
                rota.getDestino(),
                rota.getDescricao(),
                rota.getCriadoEm()
        );
    }

}
