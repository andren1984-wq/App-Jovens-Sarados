$edgePath = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
$profileDir = "C:\Users\andre\.gemini\antigravity\scratch\jovens-sarados-web\edge-profile"
$logFile = "C:\Users\andre\.gemini\antigravity\scratch\jovens-sarados-web\edge_stderr.log"

$p = Start-Process -FilePath $edgePath -ArgumentList "--headless=new", "--user-data-dir=$profileDir", "--enable-logging=stderr", "--v=1", "http://localhost:8080/index.html" -PassThru -RedirectStandardError $logFile
Start-Sleep -Seconds 3
Stop-Process -Id $p.Id -Force -ErrorAction SilentlyContinue

if (Test-Path $logFile) {
    Get-Content $logFile | Select-String -Pattern "CONSOLE|error|Error|Uncaught" | ForEach-Object { $_.Line }
} else {
    Write-Host "Log file not created"
}
