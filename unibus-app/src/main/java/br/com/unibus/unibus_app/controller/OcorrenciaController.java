package br.com.unibus.unibus_app.controller;

import br.com.unibus.unibus_app.dto.OcorrenciaRequest;
import br.com.unibus.unibus_app.dto.OcorrenciaResponse;
import br.com.unibus.unibus_app.service.OcorrenciaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ocorrencias")
@RequiredArgsConstructor
public class OcorrenciaController {

    private final OcorrenciaService ocorrenciaService;

    @GetMapping
    public List<OcorrenciaResponse> listar() {
        return ocorrenciaService.listarTodasPorRecencia();
    }

    @PostMapping
    public ResponseEntity<OcorrenciaResponse> registrar(
            @Valid @RequestBody OcorrenciaRequest request,
            Authentication authentication
    ) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        OcorrenciaResponse response = ocorrenciaService.registrar(authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleErro(RuntimeException ex) {
        HttpStatus status = ex.getMessage() != null && ex.getMessage().contains("não encontrada")
                ? HttpStatus.NOT_FOUND
                : HttpStatus.BAD_REQUEST;

        return ResponseEntity.status(status).body(Map.of("message", ex.getMessage()));
    }
}