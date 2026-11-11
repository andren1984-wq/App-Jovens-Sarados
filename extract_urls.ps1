$content = [System.IO.File]::ReadAllText("C:\Users\andre\.gemini\antigravity\scratch\jovens-sarados-web\insta_dump.html", [System.Text.Encoding]::UTF8)

$matches = [regex]::Matches($content, 'https://[^\s"''<>\\]+cdninstagram\.com[^\s"''<>\\]+')
Write-Host "Total cdninstagram URLs: $($matches.Count)"

$unique = $matches | ForEach-Object { $_.Value } | Select-Object -Unique

Write-Host "Unique URLs: $($unique.Count)"

$outDir = "C:\Users\andre\.gemini\antigravity\scratch\jovens-sarados-web\img\instagram"
if (!(Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir -Force }

$idx = 1
foreach ($u in $unique) {
    # Limpa &amp; e barras escapadas
    $cleanUrl = $u.Replace("\u0026", "&").Replace("&amp;", "&").Replace("\/", "/")
    
    # Baixa imagens (evita miniaturas menores de 150px)
    if ($cleanUrl -notmatch "s150x150" -and $cleanUrl -notmatch "150x150") {
        $dest = "$outDir\post-$idx.jpg"
        try {
            Write-Host "Tentando baixar $idx : $cleanUrl"
            Invoke-WebRequest -Uri $cleanUrl -OutFile $dest -UseBasicParsing -UserAgent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            Write-Host "Salvo: $dest"
            $idx++
            if ($idx -gt 15) { break }
        } catch {
            Write-Host "Erro: $($_.Exception.Message)"
        }
    }
}
