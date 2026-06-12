package br.com.unibus.unibus_app.repository;

import br.com.unibus.unibus_app.model.Rota;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface RotaRepository extends JpaRepository<Rota, Integer> {
    @Query("SELECT r FROM Rota r JOIN FETCH r.usuario ORDER BY r.criadoEm DESC")
    List<Rota> findAllByOrderByCriadoEmDesc();
}
