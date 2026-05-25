package br.com.unibus.unibus_app.integration.gtfs;

import br.com.unibus.unibus_app.integration.gtfs.dto.LinhaRota;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Carrega {@code routes.txt} e indexa rotas por {@code route_short_name} (= {@code linha} na API SPPO).
 */
@Component
public class GtfsRoutesLoader {

    private static final int COL_ROUTE_ID = 0;
    private static final int COL_ROUTE_SHORT_NAME = 2;
    private static final int COL_ROUTE_LONG_NAME = 3;
    private static final int MIN_COLUNAS = 4;

    private final ResourceLoader resourceLoader;
    private final GtfsRoutesProperties properties;

    public GtfsRoutesLoader(ResourceLoader resourceLoader, GtfsRoutesProperties properties) {
        this.resourceLoader = resourceLoader;
        this.properties = properties;
    }

    Map<String, LinhaRota> carregarIndice() {
        Resource resource = resourceLoader.getResource(properties.getClasspathLocation());
        Map<String, LinhaRota> indice = new HashMap<>();

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8))) {

            String linhaArquivo;
            boolean cabecalhoIgnorado = false;

            while ((linhaArquivo = reader.readLine()) != null) {
                if (linhaArquivo.isBlank()) {
                    continue;
                }
                if (!cabecalhoIgnorado) {
                    cabecalhoIgnorado = true;
                    continue;
                }

                Optional<LinhaRota> rota = parseLinhaCsv(linhaArquivo);
                rota.ifPresent(r -> indice.putIfAbsent(r.linha(), r));
            }
        } catch (IOException ex) {
            throw new GtfsRoutesException(
                    "Falha ao ler arquivo GTFS routes: " + properties.getClasspathLocation(), ex);
        }

        return Map.copyOf(indice);
    }

    private static Optional<LinhaRota> parseLinhaCsv(String linhaCsv) {
        String[] colunas = linhaCsv.split(",", -1);
        if (colunas.length < MIN_COLUNAS) {
            return Optional.empty();
        }

        String routeId = colunas[COL_ROUTE_ID].trim();
        String routeShortName = colunas[COL_ROUTE_SHORT_NAME].trim();
        String routeLongName = colunas[COL_ROUTE_LONG_NAME].trim();

        if (routeShortName.isEmpty()) {
            return Optional.empty();
        }

        RouteLongNameParser.ParsedRouteLongName extremidades =
                RouteLongNameParser.parse(routeLongName);

        return Optional.of(new LinhaRota(
                routeShortName,
                extremidades.pontoPartida(),
                extremidades.pontoFinal(),
                routeLongName,
                routeId
        ));
    }
}
