# Testes de carga (k6) — UNIBUS

Pasta isolada para medições de SLA das APIs **posições** (leitura) e **ocorrências** (escrita no MySQL), sem alterar o código da aplicação.

## Pré-requisitos

1. **k6** instalado ([download](https://grafana.com/docs/k6/latest/set-up/install-k6/))  
   - Windows (winget): `winget install GrafanaLabs.k6`
2. **Python 3.10+** com dependências: `pip install -r tools/requirements.txt`
3. Aplicação rodando (`http://localhost:8080` por padrão), MySQL com schema e usuário de teste
4. Para **ocorrências**: usuário cadastrado e `K6_LINHA` existente na tabela `linha`

## Configuração rápida

```powershell
cd load-testing
Copy-Item config.env.example .env
# Edite .env (credenciais e linha válida)
```

## Executar

```powershell
.\run-posicoes.ps1      # GET /api/onibus/posicoes
.\run-ocorrencias.ps1   # POST /api/ocorrencias (autenticado)
.\run-all.ps1           # ambos + gráficos
```

## Documentação e visualização

| Artefato | Descrição |
|----------|-----------|
| [docs/MEDICOES-SLA.md](docs/MEDICOES-SLA.md) | Relatório estruturado (SLA, arquivos, hipóteses) |
| [docs/index.html](docs/index.html) | Página comparativa (abra no navegador após os testes) |
| `results/charts/` | PNGs gerados pelo `tools/generate_report.py` |

**Link sugerido no repositório (após commit na `main`):**  
`https://github.com/lucas-souuza/unibus/blob/main/load-testing/docs/MEDICOES-SLA.md`  
Para gráficos inline no GitHub, use as imagens em `load-testing/docs/charts/` após executar os testes.

## Perfil de carga

Os scripts usam rampa de **VUs** (concorrência) em `scripts/lib/options.js` (~5 → 30 VUs em ~3,5 min). Ajuste `stages` conforme o ambiente.

## Estrutura

```
load-testing/
  scripts/posicoes.js, ocorrencias.js
  tools/generate_report.py
  docs/MEDICOES-SLA.md, index.html
  run-*.ps1
```
