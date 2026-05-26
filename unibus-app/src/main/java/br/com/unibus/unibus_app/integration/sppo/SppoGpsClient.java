package br.com.unibus.unibus_app.integration.sppo;

import br.com.unibus.unibus_app.integration.sppo.dto.SppoGpsPosition;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Component
@RequiredArgsConstructor
public class SppoGpsClient {

    private static final DateTimeFormatter FORMATTER =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final RestClient restClient;
    private final SppoGpsProperties properties;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<SppoGpsPosition> buscarPosicoes(LocalDateTime dataInicial, LocalDateTime dataFinal) {
        try {
            String resposta = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path(properties.getGpsPath())
                            .queryParam("dataInicial", dataInicial.format(FORMATTER))
                            .queryParam("dataFinal", dataFinal.format(FORMATTER))
                            .build())
                    .retrieve()
                    .body(String.class);

            return objectMapper.readValue(
                    resposta,
                    new TypeReference<List<SppoGpsPosition>>() {}
            );

        } catch (Exception ex) {
            throw new SppoGpsException("Falha ao consultar API SPPO", ex);
        }
    }
}