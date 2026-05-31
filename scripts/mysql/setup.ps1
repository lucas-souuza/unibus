#Requires -Version 5.1
<#
  Cria o banco `unibus` no MySQL local (serviço MySQL80).

  Se der "execução de scripts foi desabilitada", use setup.cmd ou:
    powershell -ExecutionPolicy Bypass -File .\setup.ps1

  Uso:
    .\setup.ps1
    .\setup.ps1 -User root -Password 'sua_senha'
    $env:MYSQL_PASSWORD='sua_senha'; .\setup.ps1
#>
param(
    [string]$User = 'root',
    [string]$Password = $env:MYSQL_PASSWORD,
    [string]$MysqlBin = 'C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe'
)

$ErrorActionPreference = 'Stop'
$here = $PSScriptRoot

if (-not (Test-Path $MysqlBin)) {
    throw "mysql.exe não encontrado em: $MysqlBin"
}

if (-not $Password) {
    $secure = Read-Host "Senha do MySQL (usuário $User)" -AsSecureString
    $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    try {
        $Password = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
    } finally {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
    }
}

$mysqlArgs = @("-u$User", "-p$Password", "--default-character-set=utf8mb4")

function Invoke-SqlFile([string]$file) {
    $sql = Get-Content -Path $file -Raw -Encoding UTF8
    $sql | & $MysqlBin @mysqlArgs 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Falha ao executar $file"
    }
}

Write-Host ">>> Criando schema..."
Invoke-SqlFile (Join-Path $here '01-schema.sql')

Write-Host ">>> Inserindo linhas iniciais..."
Invoke-SqlFile (Join-Path $here '02-seed-linhas.sql')

Write-Host ">>> Verificando..."
& $MysqlBin @mysqlArgs -e "USE unibus; SHOW TABLES; SELECT id_linha, numero_linha, nome_linha FROM linha;"

Write-Host ""
Write-Host "OK. Banco 'unibus' pronto."
Write-Host "Copie scripts/mysql/application.properties.example para unibus-app/src/main/resources/application.properties"
Write-Host "e ajuste spring.datasource.password."
