package br.com.unibus.unibus_app.integration.gtfs;

import br.com.unibus.unibus_app.integration.gtfs.dto.LinhaRota;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Repository;

import java.util.Map;
import java.util.Optional;

/**
 * Repositório em memória do GTFS {@code routes.txt}, chaveado por {@code route_short_name}.
 */
@Repository
public class GtfsRoutesRepository {

    private final GtfsRoutesLoader loader;
    private Map<String, LinhaRota> indicePorLinha = Map.of();

    public GtfsRoutesRepository(GtfsRoutesLoader loader) {
        this.loader = loader;
    }

    @PostConstruct
    void inicializar() {
        this.indicePorLinha = loader.carregarIndice();
    }

    public Optional<LinhaRota> buscarPorLinha(String linha) {
        if (linha == null || linha.isBlank()) {
            return Optional.empty();
        }
        return Optional.ofNullable(indicePorLinha.get(linha.trim()));
    }

    public int totalLinhas() {
        return indicePorLinha.size();
    }
}
