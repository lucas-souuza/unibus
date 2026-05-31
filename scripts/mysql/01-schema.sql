-- Schema UNIBUS — derivado das entidades JPA (ddl-auto=validate)
-- Executar: scripts/mysql/setup.ps1

CREATE DATABASE IF NOT EXISTS unibus
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE unibus;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS ocorrencia;
DROP TABLE IF EXISTS rota;
DROP TABLE IF EXISTS linha;
DROP TABLE IF EXISTS usuario;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE usuario (
    id_usuario           INT          NOT NULL AUTO_INCREMENT,
    email                VARCHAR(255) NULL,
    nome                 VARCHAR(255) NULL,
    senha                VARCHAR(255) NULL,
    notificacoes_ativas  TINYINT      NULL,
    criado_em            DATETIME(6)  NULL,
    PRIMARY KEY (id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE linha (
    id_linha      INT          NOT NULL AUTO_INCREMENT,
    numero_linha  VARCHAR(100) NULL,
    nome_linha    VARCHAR(100) NULL,
    origem        VARCHAR(100) NULL,
    destino       VARCHAR(100) NULL,
    PRIMARY KEY (id_linha),
    KEY idx_linha_numero (numero_linha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE ocorrencia (
    id_ocorrencia  INT          NOT NULL AUTO_INCREMENT,
    id_usuario     INT          NOT NULL,
    id_linha       INT          NOT NULL,
    tipo           VARCHAR(30)  NOT NULL,
    descricao      VARCHAR(500) NULL,
    criado_em      DATETIME(6)  NOT NULL,
    PRIMARY KEY (id_ocorrencia),
    CONSTRAINT fk_ocorrencia_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuario (id_usuario),
    CONSTRAINT fk_ocorrencia_linha
        FOREIGN KEY (id_linha) REFERENCES linha (id_linha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE rota (
    id_rota      INT          NOT NULL AUTO_INCREMENT,
    id_usuario   INT          NOT NULL,
    origem       VARCHAR(255) NOT NULL,
    destino      VARCHAR(255) NOT NULL,
    descricao    VARCHAR(500) NOT NULL,
    criado_em    DATETIME(6)  NOT NULL,
    PRIMARY KEY (id_rota),
    CONSTRAINT fk_rota_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuario (id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
