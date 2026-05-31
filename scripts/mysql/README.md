# MySQL local — UNIBUS

Scripts gerados a partir das entidades JPA (`usuario`, `linha`, `ocorrencia`, `rota`).

## Pré-requisito

Serviço **MySQL80** rodando no Windows.

## 1. Criar banco e tabelas

**Opção A — CMD (recomendado no Windows; evita bloqueio de scripts):**

```cmd
cd D:\PI2\unibus\scripts\mysql
setup.cmd
```

O MySQL pedirá a senha (Enter = usuário `root`).

**Opção B — PowerShell** (se `.\setup.ps1` der erro de política de execução):

```powershell
cd D:\PI2\unibus\scripts\mysql
powershell -ExecutionPolicy Bypass -File .\setup.ps1
```

Ou só para esta sessão: `Set-ExecutionPolicy -Scope Process Bypass` e depois `.\setup.ps1`.

## 2. Configurar a aplicação

```powershell
Copy-Item D:\PI2\unibus\scripts\mysql\application.properties.example `
  D:\PI2\unibus\unibus-app\src\main\resources\application.properties
```

Edite `application.properties` e coloque sua senha real do MySQL.

## 3. Subir o Spring Boot

```powershell
cd D:\PI2\unibus\unibus-app
.\mvnw.cmd spring-boot:run
```

## 4. Usuário

Cadastre em http://localhost:8080/cadastro — a senha é gravada com BCrypt pelo app.

### Linhas na tabela `linha`

O `setup.cmd` insere só **5 linhas de exemplo** (`02-seed-linhas.sql`).

No código do app:

| Funcionalidade | Fonte de dados |
|----------------|----------------|
| **Mapa / posições** (`/api/onibus/posicoes`) | API SPPO + arquivo `routes.txt` (memória, **não** usa tabela `linha`) |
| **Ocorrências**, busca `/api/linhas` | Tabela MySQL **`linha`** |

Para popular o MySQL com **todas as ~516 linhas** do `routes.txt` (mesmo catálogo GTFS do projeto):

```cmd
cd D:\PI2\unibus\scripts\mysql
import-linhas-gtfs.cmd
```

Isso apaga ocorrências existentes e recarrega `linha` do GTFS. Para regerar o SQL após mudar `routes.txt`: `python generate-linhas-gtfs.py`.
