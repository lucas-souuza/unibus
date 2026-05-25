package br.com.unibus.unibus_app.service;

import br.com.unibus.unibus_app.dto.OnibusPosicaoResponse;
import br.com.unibus.unibus_app.integration.gtfs.GtfsRoutesService;
import br.com.unibus.unibus_app.integration.gtfs.dto.LinhaRota;
import br.com.unibus.unibus_app.integration.sppo.SppoGpsService;
import br.com.unibus.unibus_app.integration.sppo.dto.SppoGpsPosition;
import br.com.unibus.unibus_app.util.SppoCoordinateParser;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OnibusPosicaoService {

    private final SppoGpsService sppoGpsService;
    private final GtfsRoutesService gtfsRoutesService;

    @Value("${unibus.sppo.janela-segundos:180}")
    private int janelaSegundos;

    public List<OnibusPosicaoResponse> listarPosicoesRecentes() {
        LocalDateTime fim = LocalDateTime.now();
        LocalDateTime inicio = fim.minusSeconds(janelaSegundos);

        List<SppoGpsPosition> posicoes = sppoGpsService.listarPosicoes(inicio, fim);

        Map<String, SppoGpsPosition> maisRecentePorVeiculo = posicoes.stream()
                .filter(p -> p.ordem() != null && !p.ordem().isBlank())
                .collect(Collectors.toMap(
                        SppoGpsPosition::ordem,
                        p -> p,
                        (atual, novo) -> compararDatahora(atual, novo) >= 0 ? atual : novo
                ));

        return maisRecentePorVeiculo.values().stream()
                .map(this::enriquecer)
                .flatMap(java.util.Optional::stream)
                .sorted(Comparator.comparing(OnibusPosicaoResponse::linha)
                        .thenComparing(OnibusPosicaoResponse::ordem))
                .toList();
    }

    private java.util.Optional<OnibusPosicaoResponse> enriquecer(SppoGpsPosition posicao) {
        String linha = posicao.linha() != null ? posicao.linha().trim() : "";
        LinhaRota rota = gtfsRoutesService.buscarPorLinha(linha).orElse(null);

        String pontoPartida = rota != null ? rota.pontoPartida() : "";
        String pontoFinal = rota != null ? rota.pontoFinal() : "";
        String routeLongName = rota != null ? rota.routeLongName() : montarNomeRota(pontoPartida, pontoFinal);

        try {
            return java.util.Optional.of(new OnibusPosicaoResponse(
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
            return java.util.Optional.empty();
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
        if (partida.isBlank() && fim.isBlank()) {
            return "";
        }
        if (partida.isBlank()) {
            return fim;
        }
        if (fim.isBlank()) {
            return partida;
        }
        return partida + " - " + fim;
    }
}
