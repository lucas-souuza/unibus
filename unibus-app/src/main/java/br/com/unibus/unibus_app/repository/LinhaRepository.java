package br.com.unibus.unibus_app.repository;

import br.com.unibus.unibus_app.model.Linha;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface LinhaRepository extends JpaRepository<Linha, Integer> {

    Optional<Linha> findByNumeroLinha(String numeroLinha);


    @Query("""
            SELECT l FROM Linha l
            WHERE LOWER(l.numeroLinha) LIKE LOWER(CONCAT('%', :termo, '%'))
               OR LOWER(l.nomeLinha) LIKE LOWER(CONCAT('%', :termo, '%'))
               OR LOWER(l.origem) LIKE LOWER(CONCAT('%', :termo, '%'))
               OR LOWER(l.destino) LIKE LOWER(CONCAT('%', :termo, '%'))
            ORDER BY
              CASE WHEN LOWER(l.numeroLinha) = LOWER(:termo) THEN 0
                   WHEN LOWER(l.numeroLinha) LIKE LOWER(CONCAT(:termo, '%')) THEN 1
                   ELSE 2 END,
              l.numeroLinha
            """)
    List<Linha> buscarPorTermo(@Param("termo") String termo, Pageable pageable);

    @Query("""
            SELECT DISTINCT l.origem FROM Linha l
            WHERE l.origem IS NOT NULL AND l.origem <> ''
              AND LOWER(l.origem) LIKE LOWER(CONCAT('%', :termo, '%'))
            ORDER BY l.origem
            """)
    List<String> buscarOrigens(@Param("termo") String termo, Pageable pageable);

    @Query("""
            SELECT DISTINCT l.destino FROM Linha l
            WHERE l.destino IS NOT NULL AND l.destino <> ''
              AND LOWER(l.destino) LIKE LOWER(CONCAT('%', :termo, '%'))
            ORDER BY l.destino
            """)
    List<String> buscarDestinos(@Param("termo") String termo, Pageable pageable);

}
