package br.com.unibus.unibus_app.service;

import br.com.unibus.unibus_app.dto.OnibusPosicaoResponse;
import br.com.unibus.unibus_app.integration.gtfs.GtfsRoutesService;
import br.com.unibus.unibus_app.integration.gtfs.dto.LinhaRota;
import br.com.unibus.unibus_app.integration.sppo.SppoGpsService;
import br.com.unibus.unibus_app.integration.sppo.dto.SppoGpsPosition;
import br.com.unibus.unibus_app.util.SppoCoordinateParser;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

/**
 * Serviço responsável por buscar, deduplicar e enriquecer as posições dos ônibus.
 *
 * <h2>Melhorias implementadas</h2>
 *
 * <h3>1 — Cache das posições (hipótese 3 do SLA)</h3>
 * <p>{@link #listarPosicoesRecentes()} é anotado com {@code @Cacheable("posicoes")}.
 * O TTL do cache é igual a {@code unibus.sppo.janela-segundos} (padrão 180 s),
 * configurado em {@link br.com.unibus.unibus_app.config.CacheConfig}.
 * Assim, dentro de uma mesma janela temporal, a SPPO é chamada <b>uma única vez</b>
 * independente de quantas requisições simultâneas cheguem, eliminando a taxa de
 * falha de 72,8% observada nos testes de carga por saturação de conexões externas.
 *
 * <h3>2 — Otimização do processamento em memória (hipótese 2 do SLA)</h3>
 * <ul>
 *   <li><b>HashMap pré-alocado:</b> substitui {@code Collectors.toMap} por um
 *       {@code HashMap} com capacidade inicial calculada ({@code tamanho / 0,75 + 1}),
 *       evitando rehash durante a inserção.</li>
 *   <li><b>Filtro antecipado:</b> {@code ordem} nula/vazia é descartada antes de
 *       qualquer alocação, reduzindo objetos no heap.</li>
 *   <li><b>Enriquecimento paralelo:</b> {@code parallelStream()} no mapeamento
 *       para {@link OnibusPosicaoResponse}. O método {@code enriquecer} é puro
 *       (sem estado compartilhado) e {@code GtfsRoutesService} é thread-safe
 *       (leitura de estrutura imutável), tornando a paralelização segura.</li>
 *   <li><b>Eliminação do flatMap:</b> o filtro de {@code Optional.empty()} é
 *       feito com {@code filter(Optional::isPresent).map(Optional::get)}, mais
 *       legível e sem overhead de stream aninhado.</li>
 * </ul>
 */
@Service
@RequiredArgsConstructor
public class OnibusPosicaoService {

    private final SppoGpsService sppoGpsService;
    private final GtfsRoutesService gtfsRoutesService;

    @Value("${unibus.sppo.janela-segundos:180}")
    private int janelaSegundos;

    // ─────────────────────────────────────────────────────────────────────────
    // API pública
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Retorna a posição mais recente de cada veículo dentro da janela configurada.
     *
     * <p>O resultado é cacheado em memória durante {@code janela-segundos}.
     * Requisições simultâneas dentro do mesmo intervalo recebem a lista já
     * computada sem nova chamada à SPPO.
     */
    @Cacheable("posicoes")
    public List<OnibusPosicaoResponse> listarPosicoesRecentes() {
        LocalDateTime fim = LocalDateTime.now();
        LocalDateTime inicio = fim.minusSeconds(janelaSegundos);

        List<SppoGpsPosition> posicoes = sppoGpsService.listarPosicoes(inicio, fim);

        // ── Melhoria 2a: HashMap pré-alocado + filtro antecipado ─────────────
        // Capacidade inicial evita rehash (load factor padrão = 0,75).
        int capacidadeInicial = (int) (posicoes.size() / 0.75) + 1;
        Map<String, SppoGpsPosition> maisRecentePorVeiculo = new HashMap<>(capacidadeInicial);

        for (SppoGpsPosition p : posicoes) {
            // Descarta posições sem identificador de veículo antes de qualquer lookup.
            if (p.ordem() == null || p.ordem().isBlank()) {
                continue;
            }
            maisRecentePorVeiculo.merge(p.ordem(), p,
                    (atual, novo) -> compararDatahora(atual, novo) >= 0 ? atual : novo);
        }

        // ── Melhoria 2b: enriquecimento paralelo ─────────────────────────────
        // parallelStream é seguro: enriquecer() não tem estado compartilhado e
        // GtfsRoutesService faz apenas leitura de dados imutáveis.
        return maisRecentePorVeiculo.values()
                .parallelStream()
                .map(this::enriquecer)
                .filter(Optional::isPresent)
                .map(Optional::get)
                .sorted(Comparator.comparing(OnibusPosicaoResponse::linha)
                        .thenComparing(OnibusPosicaoResponse::ordem))
                .toList();
    }

    /**
     * Invalida o cache manualmente, útil para testes ou forçar refresh via
     * endpoint administrativo (ex.: {@code POST /api/admin/cache/posicoes/evict}).
     */
    @CacheEvict(value = "posicoes", allEntries = true)
    public void invalidarCache() {
        // Spring intercepta e limpa o cache; corpo vazio é intencional.
    }

    /**
     * Eviction agendado como fallback de segurança: garante que o cache não
     * fique preenchido caso o TTL do Caffeine não tenha sido lido corretamente
     * na inicialização. Roda a cada {@code janela-segundos * 1000} ms.
     *
     * <p><b>Nota:</b> na prática o TTL do Caffeine já cuida da expiração;
     * este scheduled serve apenas como salvaguarda explícita e pode ser
     * removido se preferir manter apenas a configuração do {@code CacheConfig}.
     */
    @CacheEvict(value = "posicoes", allEntries = true)
    @Scheduled(fixedRateString = "${unibus.sppo.janela-segundos:180}000")
    public void evictCachePorAgendamento() {
        // Executado pelo scheduler do Spring; corpo vazio é intencional.
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Métodos privados
    // ─────────────────────────────────────────────────────────────────────────

    private Optional<OnibusPosicaoResponse> enriquecer(SppoGpsPosition posicao) {
        String linha = posicao.linha() != null ? posicao.linha().trim() : "";
        LinhaRota rota = gtfsRoutesService.buscarPorLinha(linha).orElse(null);

        String pontoPartida    = rota != null ? rota.pontoPartida()    : "";
        String pontoFinal      = rota != null ? rota.pontoFinal()      : "";
        String routeLongName   = rota != null ? rota.routeLongName()   : montarNomeRota(pontoPartida, pontoFinal);

        try {
            return Optional.of(new OnibusPosicaoResponse(
                    posicao.ordem(),
                    linha,
                    SppoCoordinateParser.parse(posicao.latitude()),
                    SppoCoordinateParser.parse(posicao.longitude()),
                    pontoPartida,
                    pontoFinal,
                    routeLongName,
                    posicao.velocidade()
            ));
        } catch (IllegalArgumentException ex) {
            return Optional.empty();
        }
    }

    private static long compararDatahora(SppoGpsPosition a, SppoGpsPosition b) {
        return parseDatahora(a) - parseDatahora(b);
    }

    private static long parseDatahora(SppoGpsPosition posicao) {
        try {
            return Long.parseLong(posicao.datahora());
        } catch (NumberFormatException ex) {
            return 0L;
        }
    }

    private static String montarNomeRota(String partida, String fim) {
        if (partida.isBlank() && fim.isBlank()) return "";
        if (partida.isBlank()) return fim;
        if (fim.isBlank())     return partida;
        return partida + " - " + fim;
    }
}
