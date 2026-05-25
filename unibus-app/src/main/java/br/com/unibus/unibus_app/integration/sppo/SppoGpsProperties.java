package br.com.unibus.unibus_app.integration.sppo;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Propriedades da integração com a API de GPS dos ônibus (SPPO) da SMTR.
 */
@ConfigurationProperties(prefix = "unibus.sppo")
public class SppoGpsProperties {

    /**
     * URL base do portal de dados de mobilidade (sem barra final).
     */
    private String baseUrl = "https://dados.mobilidade.rio";

    /**
     * Caminho do endpoint de posições GPS do SPPO.
     */
    private String gpsPath = "/gps/sppo";

    /** Timeout de conexão HTTP em milissegundos. */
    private int connectTimeoutMs = 10_000;

    /** Timeout de leitura HTTP em milissegundos (respostas podem ser grandes). */
    private int readTimeoutMs = 120_000;

    public String getBaseUrl() {
        return baseUrl;
    }

    public void setBaseUrl(String baseUrl) {
        this.baseUrl = baseUrl;
    }

    public String getGpsPath() {
        return gpsPath;
    }

    public void setGpsPath(String gpsPath) {
        this.gpsPath = gpsPath;
    }

    public int getConnectTimeoutMs() {
        return connectTimeoutMs;
    }

    public void setConnectTimeoutMs(int connectTimeoutMs) {
        this.connectTimeoutMs = connectTimeoutMs;
    }

    public int getReadTimeoutMs() {
        return readTimeoutMs;
    }

    public void setReadTimeoutMs(int readTimeoutMs) {
        this.readTimeoutMs = readTimeoutMs;
    }
}
