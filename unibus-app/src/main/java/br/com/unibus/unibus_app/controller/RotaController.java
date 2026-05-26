package br.com.unibus.unibus_app.controller;

import br.com.unibus.unibus_app.dto.RotaRequest;
import br.com.unibus.unibus_app.dto.RotaResponse;
import br.com.unibus.unibus_app.service.RotaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rotas")
@RequiredArgsConstructor
public class RotaController {

    private final RotaService rotaService;

    @GetMapping("/localidades")
    public List<String> buscarLocalidades(
            @RequestParam(name = "q") String q,
            @RequestParam(defaultValue = "origem") String tipo
    ) {
        return rotaService.buscarLocalidades(q, tipo);
    }

    @PostMapping
    public ResponseEntity<RotaResponse> compartilhar(
            @Valid @RequestBody RotaRequest request,
            Authentication authentication
    ) {
        RotaResponse response = rotaService.compartilhar(authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleErro(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", ex.getMessage()));
    }

}
