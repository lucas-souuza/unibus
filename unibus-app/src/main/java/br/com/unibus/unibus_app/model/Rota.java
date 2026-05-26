package br.com.unibus.unibus_app.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Setter
@Getter
@Entity
@Table(name = "rota")
public class Rota {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_rota")
    private Integer idRota;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @Column(name = "origem", nullable = false, length = 255)
    private String origem;

    @Column(name = "destino", nullable = false, length = 255)
    private String destino;

    @Column(name = "descricao", nullable = false, length = 500)
    private String descricao;

    @Column(name = "criado_em", nullable = false)
    private LocalDateTime criadoEm;

}
