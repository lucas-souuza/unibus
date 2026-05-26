package br.com.unibus.unibus_app.repository;

import br.com.unibus.unibus_app.model.Ocorrencia;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OcorrenciaRepository extends JpaRepository<Ocorrencia, Integer> {
}
