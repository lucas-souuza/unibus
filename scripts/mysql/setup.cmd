@echo off
setlocal EnableExtensions
cd /d "%~dp0"

set "MYSQL_BIN=C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
if not exist "%MYSQL_BIN%" (
  echo mysql.exe nao encontrado em:
  echo   %MYSQL_BIN%
  exit /b 1
)

set "MYSQL_USER=root"
set /p MYSQL_USER=Usuario MySQL [root]: 
if "%MYSQL_USER%"=="" set "MYSQL_USER=root"

echo.
echo Vai pedir a senha do MySQL duas vezes (schema + linhas).
echo.

echo ^>^>^> Criando schema...
"%MYSQL_BIN%" -u%MYSQL_USER% -p --default-character-set=utf8mb4 < "01-schema.sql"
if errorlevel 1 (
  echo Falha em 01-schema.sql
  exit /b 1
)

echo ^>^>^> Inserindo linhas iniciais...
"%MYSQL_BIN%" -u%MYSQL_USER% -p --default-character-set=utf8mb4 < "02-seed-linhas.sql"
if errorlevel 1 (
  echo Falha em 02-seed-linhas.sql
  exit /b 1
)

echo ^>^>^> Verificando...
"%MYSQL_BIN%" -u%MYSQL_USER% -p --default-character-set=utf8mb4 -e "USE unibus; SHOW TABLES; SELECT id_linha, numero_linha, nome_linha FROM linha;"

echo.
echo OK. Banco unibus pronto.
echo Copie application.properties.example para unibus-app\src\main\resources\application.properties
echo e ajuste a senha do MySQL.
endlocal
