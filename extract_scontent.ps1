$content = [System.IO.File]::ReadAllText("C:\Users\andre\.gemini\antigravity\scratch\jovens-sarados-web\insta_dump.html", [System.Text.Encoding]::UTF8)

$matches = [regex]::Matches($content, 'https://scontent[^\s"''<>\\]+cdninstagram\.com[^\s"''<>\\]+')
Write-Host "Total scontent URLs: $($matches.Count)"

$outDir = "C:\Users\andre\.gemini\antigravity\scratch\jovens-sarados-web\img\instagram"
if (!(Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir -Force }

$unique = $matches | ForEach-Object { $_.Value } | Select-Object -Unique

$idx = 1
foreach ($u in $unique) {
    $clean = $u.Replace("\u0026", "&").Replace("&amp;", "&").Replace("\/", "/")
    Write-Host "URL $idx : $clean"
    $outFile = "$outDir\insta-img-$idx.jpg"
    try {
        Invoke-WebRequest -Uri $clean -OutFile $outFile -UseBasicParsing -UserAgent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        Write-Host "Salvo: $outFile (tamanho: $((Get-Item $outFile).Length))"
        $idx++
    } catch {
        Write-Host "Erro: $($_.Exception.Message)"
    }
}
