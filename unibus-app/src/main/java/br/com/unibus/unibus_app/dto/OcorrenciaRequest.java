package br.com.unibus.unibus_app.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record OcorrenciaRequest(
        @NotBlank String numeroLinha,
        @NotBlank String tipo,
        @Size(max = 500) String descricao
) {
}
