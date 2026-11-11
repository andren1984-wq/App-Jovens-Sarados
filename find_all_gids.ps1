$url = "https://docs.google.com/spreadsheets/d/1r9Yv1UmH4GK0TJuvMWplJllB8IkQfOTcQUIL1P5y8Gs/edit"
$resp = Invoke-WebRequest -Uri $url -UseBasicParsing -UserAgent "Mozilla/5.0"
$html = $resp.Content

# Find sheet names and gids
$matches = [regex]::Matches($html, 'gid=([0-9]+)')
$gids = @($matches | ForEach-Object { $_.Groups[1].Value } | Select-Object -Unique)
Write-Host "Found unique GIDs in HTML: $($gids -join ', ')"

# Check if there is bootstrap data or sheet names
$sheetMatches = [regex]::Matches($html, 'name&quot;:&quot;([^&]+)&quot;')
Write-Host "Found sheet names via &quot;: $($sheetMatches.Count)"
foreach ($sm in $sheetMatches) {
    Write-Host "  $($sm.Groups[1].Value)"
}

$sheetMatches2 = [regex]::Matches($html, '"name":"([^"]+)"')
Write-Host "Found sheet names via quote: $($sheetMatches2.Count)"
foreach ($sm in $sheetMatches2 | Select-Object -First 20) {
    Write-Host "  $($sm.Groups[1].Value)"
}
