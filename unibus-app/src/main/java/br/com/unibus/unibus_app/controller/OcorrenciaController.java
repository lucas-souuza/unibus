package br.com.unibus.unibus_app.controller;

import br.com.unibus.unibus_app.dto.OcorrenciaRequest;
import br.com.unibus.unibus_app.dto.OcorrenciaResponse;
import br.com.unibus.unibus_app.service.OcorrenciaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/ocorrencias")
@RequiredArgsConstructor
public class OcorrenciaController {

    private final OcorrenciaService ocorrenciaService;

    @PostMapping
    public ResponseEntity<OcorrenciaResponse> registrar(
            @Valid @RequestBody OcorrenciaRequest request,
            Authentication authentication
    ) {
        OcorrenciaResponse response = ocorrenciaService.registrar(authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleErro(RuntimeException ex) {
        HttpStatus status = ex.getMessage() != null && ex.getMessage().contains("não encontrad")
                ? HttpStatus.NOT_FOUND
                : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(Map.of("message", ex.getMessage()));
    }

}
