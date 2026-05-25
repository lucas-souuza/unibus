package br.com.unibus.unibus_app.integration.sppo;

/**
 * Erro de integração com a API de GPS do SPPO.
 */
public class SppoGpsException extends RuntimeException {

    public SppoGpsException(String message, Throwable cause) {
        super(message, cause);
    }
}
