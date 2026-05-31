#Requires -Version 5.1
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

& "$PSScriptRoot\run-posicoes.ps1"
& "$PSScriptRoot\run-ocorrencias.ps1"

Write-Host '>>> Relatório visual: docs/index.html'
