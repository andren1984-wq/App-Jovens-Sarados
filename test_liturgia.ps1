try {
    $res = Invoke-RestMethod -Uri "https://liturgia.up.railway.app/?dia=20&mes=10" -UseBasicParsing -TimeoutSec 10
    Write-Host "Liturgia: $($res.liturgia)"
    Write-Host "Cor: $($res.cor)"
    Write-Host "Evangelho: $($res.evangelho.referencia)"
} catch {
    Write-Host "Error: $_"
}
