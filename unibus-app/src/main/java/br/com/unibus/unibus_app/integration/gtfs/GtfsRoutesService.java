package br.com.unibus.unibus_app.integration.gtfs;

import br.com.unibus.unibus_app.integration.gtfs.dto.LinhaRota;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * Serviço de consulta de rotas GTFS por {@code linha} (route_short_name / campo {@code linha} da API SPPO).
 * Ainda sem uso em controllers ou regras de negócio.
 */
@Service
@RequiredArgsConstructor
public class GtfsRoutesService {

    private final GtfsRoutesRepository repository;

    /**
     * Resolve ponto de partida e ponto final a partir do código da linha.
     * Ex.: {@code "636"} → Merck / Saens Peña.
     */
    public Optional<LinhaRota> buscarPorLinha(String linha) {
        return repository.buscarPorLinha(linha);
    }
}
