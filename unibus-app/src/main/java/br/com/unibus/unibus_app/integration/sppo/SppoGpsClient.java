package br.com.unibus.unibus_app.integration.sppo;

import br.com.unibus.unibus_app.integration.sppo.dto.SppoGpsPosition;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Cliente HTTP para a API de GPS do SPPO.
 * Documentação: https://dados.mobilidade.rio/gps/sppo
 */
@Component
public class SppoGpsClient {

    private static final DateTimeFormatter API_DATE_TIME =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private static final ParameterizedTypeReference<List<SppoGpsPosition>> POSITION_LIST =
            new ParameterizedTypeReference<>() {};

    private final RestClient sppoRestClient;
    private final SppoGpsProperties properties;

    public SppoGpsClient(
            @Qualifier("sppoRestClient") RestClient sppoRestClient,
            SppoGpsProperties properties) {
        this.sppoRestClient = sppoRestClient;
        this.properties = properties;
    }

    /**
     * Consulta posições GPS no intervalo informado.
     *
     * @param dataInicial início do intervalo (inclusivo), formato exigido pela API
     * @param dataFinal   fim do intervalo (inclusivo), formato exigido pela API
     * @return lista de posições; vazia se a API não retornar registros
     */
    public List<SppoGpsPosition> buscarPosicoes(LocalDateTime dataInicial, LocalDateTime dataFinal) {
        String uri = UriComponentsBuilder
                .fromPath(properties.getGpsPath())
                .queryParam("dataInicial", formatarParametroData(dataInicial))
                .queryParam("dataFinal", formatarParametroData(dataFinal))
                .build()
                .encode()
                .toUriString();

        try {
            List<SppoGpsPosition> resposta = sppoRestClient
                    .get()
                    .uri(uri)
                    .retrieve()
                    .body(POSITION_LIST);

            return resposta != null ? resposta : List.of();
        } catch (RestClientException ex) {
            throw new SppoGpsException(
                    "Falha ao consultar API SPPO GPS entre %s e %s".formatted(dataInicial, dataFinal),
                    ex);
        }
    }

    private static String formatarParametroData(LocalDateTime dataHora) {
        return API_DATE_TIME.format(dataHora);
    }
}
