# Inicia Servidor Local e Túnel HTTPS para Compartilhamento do App Jovens Sarados
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# 1. Inicia o servidor se ainda não estiver rodando
$testPort = Test-NetConnection -ComputerName localhost -Port 8080 -InformationLevel Quiet
if (-not $testPort) {
    Write-Host "Iniciando servidor local na porta 8080..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-ExecutionPolicy Bypass -File `"$scriptDir\server.ps1`"" -WindowStyle Hidden
    Start-Sleep -Seconds 2
}

# 2. Inicia o Cloudflare Tunnel
$cfExe = "$scriptDir\..\cloudflared.exe"
if (Test-Path $cfExe) {
    Write-Host "Iniciando túnel seguro HTTPS para celulares..." -ForegroundColor Green
    & $cfExe tunnel --url http://localhost:8080 --http-host-header "localhost:8080"
} else {
    Write-Host "Executável cloudflared.exe não encontrado em $cfExe" -ForegroundColor Red
}
