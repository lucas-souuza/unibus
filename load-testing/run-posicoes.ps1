#Requires -Version 5.1
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

if (Test-Path '.env') {
    Get-Content '.env' | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
            [Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim(), 'Process')
        }
    }
}

$base = if ($env:BASE_URL) { $env:BASE_URL } else { 'http://localhost:8080' }
$ts = Get-Date -Format 'yyyy-MM-dd_HH-mm-ss'
$raw = "results/raw-posicoes-$ts.ndjson"

New-Item -ItemType Directory -Force -Path results | Out-Null

Write-Host ">>> k6 posicoes -> $raw"
k6 run `
    --out "json=$raw" `
    scripts/posicoes.js

$summary = Get-ChildItem results/summary-posicoes-*.json | Sort-Object LastWriteTime -Descending | Select-Object -First 1
if ($summary) {
    python tools/generate_report.py --service posicoes --summary $summary.FullName --raw $raw
}
