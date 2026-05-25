package br.com.unibus.unibus_app.integration.sppo;

import br.com.unibus.unibus_app.integration.sppo.dto.SppoGpsPosition;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Camada de serviço da integração SPPO GPS.
 * Ponto de entrada para o restante da aplicação — ainda sem uso em controllers ou regras de negócio.
 */
@Service
@RequiredArgsConstructor
public class SppoGpsService {

    private final SppoGpsClient sppoGpsClient;

    /**
     * Obtém posições de ônibus no intervalo [dataInicial, dataFinal].
     */
    public List<SppoGpsPosition> listarPosicoes(LocalDateTime dataInicial, LocalDateTime dataFinal) {
        validarIntervalo(dataInicial, dataFinal);
        return sppoGpsClient.buscarPosicoes(dataInicial, dataFinal);
    }

    private static void validarIntervalo(LocalDateTime dataInicial, LocalDateTime dataFinal) {
        if (dataInicial == null || dataFinal == null) {
            throw new IllegalArgumentException("dataInicial e dataFinal são obrigatórios");
        }
        if (dataFinal.isBefore(dataInicial)) {
            throw new IllegalArgumentException("dataFinal deve ser igual ou posterior a dataInicial");
        }
    }
}
