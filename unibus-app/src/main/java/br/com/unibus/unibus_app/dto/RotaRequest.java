package br.com.unibus.unibus_app.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RotaRequest(
        @NotBlank @Size(max = 255) String origem,
        @NotBlank @Size(max = 255) String destino,
        @NotBlank @Size(max = 500) String descricao
) {
}
