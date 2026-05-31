@echo off
setlocal EnableExtensions
cd /d "%~dp0"

set "MYSQL_BIN=C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
if not exist "%MYSQL_BIN%" (
  echo mysql.exe nao encontrado.
  exit /b 1
)

if not exist "03-seed-linhas-gtfs.sql" (
  echo Gerando 03-seed-linhas-gtfs.sql ...
  python "%~dp0generate-linhas-gtfs.py"
  if errorlevel 1 exit /b 1
)

set "MYSQL_USER=root"
set /p MYSQL_USER=Usuario MySQL [root]: 
if "%MYSQL_USER%"=="" set "MYSQL_USER=root"

echo.
echo ATENCAO: apaga ocorrencias e recarrega TODAS as linhas do GTFS (routes.txt).
echo.
pause

echo ^>^>^> Importando linhas...
"%MYSQL_BIN%" -u%MYSQL_USER% -p --default-character-set=utf8mb4 < "03-seed-linhas-gtfs.sql"
if errorlevel 1 exit /b 1

echo ^>^>^> Total:
"%MYSQL_BIN%" -u%MYSQL_USER% -p --default-character-set=utf8mb4 -e "USE unibus; SELECT COUNT(*) AS total_linhas FROM linha;"
echo OK.
endlocal
