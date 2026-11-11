$outDir = "C:\Users\andre\.gemini\antigravity\scratch\jovens-sarados-web\img\missoes"
if (-not (Test-Path $outDir)) {
    New-Item -ItemType Directory -Path $outDir -Force | Out-Null
}

$jsonPath = "C:\Users\andre\.gemini\antigravity\scratch\jovens-sarados-web\js\missoes-data.json"
$missoes = Get-Content -Raw $jsonPath | ConvertFrom-Json

$count = 0
$totalWithDrive = ($missoes | Where-Object { $_.logoDriveId }).Count
Write-Host "Total missions with Drive ID: $totalWithDrive"

# Download in parallel or fast batch
$tasks = @()
foreach ($m in $missoes) {
    if ($m.logoDriveId) {
        $dest = Join-Path $outDir "$($m.id).png"
        if (-not (Test-Path $dest) -or (Get-Item $dest).Length -eq 0) {
            $url = "https://drive.google.com/thumbnail?id=$($m.logoDriveId)&sz=w400"
            try {
                Invoke-WebRequest -Uri $url -OutFile $dest -UseBasicParsing -UserAgent "Mozilla/5.0" -TimeoutSec 10
                $count++
            } catch {
                # silently continue
            }
        }
    }
}

Write-Host "Finished downloading $count new logos to img/missoes/!"
$files = Get-ChildItem -Path $outDir -Filter "*.png"
Write-Host "Total files in img/missoes/: $($files.Count)"
