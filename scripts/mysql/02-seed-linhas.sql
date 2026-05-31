-- Amostra minima (5 linhas). Para TODAS as linhas do GTFS, use import-linhas-gtfs.cmd
USE unibus;

INSERT INTO linha (numero_linha, nome_linha, origem, destino) VALUES
('636', 'Merck - Saens Peña', 'Merck', 'Saens Peña'),
('805', 'Terminal Alvorada - Jardim Oceânico', 'Terminal Alvorada', 'Jardim Oceânico'),
('497', 'Penha - Largo do Machado', 'Penha', 'Largo do Machado'),
('302', 'Terminal Gentileza - Terminal Alvorada', 'Terminal Gentileza', 'Terminal Alvorada'),
('415', 'Usina - Leblon', 'Usina', 'Leblon');
