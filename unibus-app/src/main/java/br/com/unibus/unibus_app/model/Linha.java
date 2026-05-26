package br.com.unibus.unibus_app.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Entity
@Table(name = "linha")
public class Linha {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_linha")
    private Integer idLinha;

    @Column(name = "numero_linha", length = 100)
    private String numeroLinha;

    @Column(name = "nome_linha", length = 100)
    private String nomeLinha;

    @Column(name = "origem", length = 100)
    private String origem;

    @Column(name = "destino", length = 100)
    private String destino;

}
