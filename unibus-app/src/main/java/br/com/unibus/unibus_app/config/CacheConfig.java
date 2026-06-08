package br.com.unibus.unibus_app.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

/**
 * Configuração de cache em memória usando Caffeine.
 *
 * <p>Estratégia: o resultado de {@code GET /api/onibus/posicoes} é cacheado
 * durante {@code unibus.sppo.janela-segundos} (padrão 180 s), que é exatamente
 * a janela temporal consultada na SPPO. Isso garante que:
 * <ul>
 *   <li>Requisições simultâneas dentro da janela retornam a lista já computada,
 *       sem disparar novas chamadas HTTP à SPPO.</li>
 *   <li>Ao expirar o TTL, a próxima requisição consulta dados frescos e
 *       reabastece o cache automaticamente.</li>
 * </ul>
 *
 * <p>O nome {@code "posicoes"} é o mesmo usado em
 * {@link br.com.unibus.unibus_app.service.OnibusPosicaoService#listarPosicoesRecentes()}.
 */
@Configuration
@EnableCaching
public class CacheConfig {

    /**
     * TTL alinhado à janela SPPO: não faz sentido cachear por mais tempo do que
     * o intervalo de dados consultado.
     */
    @Value("${unibus.sppo.janela-segundos:180}")
    private int janelaSegundos;

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager manager = new CaffeineCacheManager("posicoes");
        manager.setCaffeine(
                Caffeine.newBuilder()
                        // Expira após a gravação, não após o acesso, para garantir
                        // que o dado seja sempre no máximo "janelaSegundos" antigo.
                        .expireAfterWrite(janelaSegundos, TimeUnit.SECONDS)
                        // Tamanho máximo: protege contra consumo de heap em caso de
                        // múltiplas chaves (aqui só há uma, mas é boa prática).
                        .maximumSize(1)
                        // Registra estatísticas acessíveis via /actuator/caches (se
                        // spring-boot-starter-actuator estiver presente).
                        .recordStats()
        );
        return manager;
    }
}
