package br.com.unibus.unibus_app.integration.sppo.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Registro de posição GPS retornado pela API SPPO (Sistema de Transporte Público por Ônibus).
 * Fonte: https://dados.mobilidade.rio/gps/sppo
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record SppoGpsPosition(

        // Identificador do veículo na carroceria (ex.: C27078, B27001)
        @JsonProperty("ordem")
        String ordem,

        // Coordenadas no formato brasileiro (vírgula como separador decimal)
        @JsonProperty("latitude")
        String latitude,

        @JsonProperty("longitude")
        String longitude,

        // Unix time (ms) do instante da posição no GPS do veículo
        @JsonProperty("datahora")
        String datahora,

        @JsonProperty("velocidade")
        String velocidade,

        // Linha/serviço operado (ex.: 629, LECD146, SP629)
        @JsonProperty("linha")
        String linha,

        // Unix time (ms) em que a posição foi enviada à central (filtro da API)
        @JsonProperty("datahoraenvio")
        String datahoraenvio,

        // Unix time (ms) em que a posição ficou disponível no servidor
        @JsonProperty("datahoraservidor")
        String datahoraservidor
) {
}
