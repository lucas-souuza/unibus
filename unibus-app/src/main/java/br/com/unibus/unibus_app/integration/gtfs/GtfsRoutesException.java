package br.com.unibus.unibus_app.integration.gtfs;

/**
 * Erro ao carregar ou consultar o índice GTFS de rotas.
 */
public class GtfsRoutesException extends RuntimeException {

    public GtfsRoutesException(String message, Throwable cause) {
        super(message, cause);
    }
}
