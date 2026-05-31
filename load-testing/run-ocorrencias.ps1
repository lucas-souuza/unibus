#Requires -Version 5.1
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

if (-not (Test-Path '.env')) {
    Write-Warning 'Crie .env a partir de config.env.example (usuário de teste e linha válida no MySQL).'
}

if (Test-Path '.env') {
    Get-Content '.env' | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
            [Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim(), 'Process')
        }
    }
}

$ts = Get-Date -Format 'yyyy-MM-dd_HH-mm-ss'
$raw = "results/raw-ocorrencias-$ts.ndjson"

New-Item -ItemType Directory -Force -Path results | Out-Null

Write-Host ">>> k6 ocorrencias -> $raw"
k6 run `
    --out "json=$raw" `
    scripts/ocorrencias.js

$summary = Get-ChildItem results/summary-ocorrencias-*.json | Sort-Object LastWriteTime -Descending | Select-Object -First 1
if ($summary) {
    python tools/generate_report.py --service ocorrencias --summary $summary.FullName --raw $raw
}
