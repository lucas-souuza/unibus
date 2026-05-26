package br.com.unibus.unibus_app.controller;

import br.com.unibus.unibus_app.dto.LinhaResponse;
import br.com.unibus.unibus_app.service.LinhaService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/linhas")
@RequiredArgsConstructor
public class LinhaController {

    private final LinhaService linhaService;

    @GetMapping
    public List<LinhaResponse> buscar(
            @RequestParam(name = "q") String q,
            @RequestParam(defaultValue = "12") int limit
    ) {
        return linhaService.buscar(q, limit);
    }

}
