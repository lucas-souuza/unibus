package br.com.unibus.unibus_app.controller;

import br.com.unibus.unibus_app.dto.OnibusPosicaoResponse;
import br.com.unibus.unibus_app.integration.sppo.SppoGpsException;
import br.com.unibus.unibus_app.service.OnibusPosicaoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/onibus")
@RequiredArgsConstructor
public class OnibusPosicaoController {

    private final OnibusPosicaoService onibusPosicaoService;

    @GetMapping("/posicoes")
    public List<OnibusPosicaoResponse> listarPosicoes() {
        return onibusPosicaoService.listarPosicoesRecentes();
    }

    @ExceptionHandler(SppoGpsException.class)
    public ResponseEntity<Map<String, String>> handleSppo(SppoGpsException ex) {
        ex.printStackTrace();

        return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                .body(Map.of(
                        "message", "Falha ao consultar dados de GPS em tempo real",
                        "cause", ex.getCause() != null ? ex.getCause().toString() : "sem causa"
                ));
    }
}
