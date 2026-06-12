package br.com.unibus.unibus_app.controller;

import br.com.unibus.unibus_app.dto.HorariosLinhaResponse;
import br.com.unibus.unibus_app.dto.LinhaResponse;
import br.com.unibus.unibus_app.integration.gtfs.GtfsHorariosService;
import br.com.unibus.unibus_app.service.LinhaService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/linhas")
@RequiredArgsConstructor
public class LinhaController {

    private final LinhaService linhaService;
    private final GtfsHorariosService gtfsHorariosService;

    @GetMapping
    public List<LinhaResponse> buscar(
            @RequestParam(name = "q") String q,
            @RequestParam(defaultValue = "12") int limit
    ) {
        return linhaService.buscar(q, limit);
    }

    @GetMapping("/{numero}/horarios")
    public HorariosLinhaResponse buscarHorarios(@PathVariable String numero) {
        return gtfsHorariosService.buscarHorariosPorLinha(numero);
    }
}