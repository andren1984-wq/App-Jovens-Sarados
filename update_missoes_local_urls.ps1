$jsonPath = "C:\Users\andre\.gemini\antigravity\scratch\jovens-sarados-web\js\missoes-data.json"
$missoes = Get-Content -Raw $jsonPath -Encoding UTF8 | ConvertFrom-Json
$imgDir = "C:\Users\andre\.gemini\antigravity\scratch\jovens-sarados-web\img\missoes"

foreach ($m in $missoes) {
    $localFile = Join-Path $imgDir "$($m.id).png"
    if (Test-Path $localFile) {
        $m.logoUrl = "img/missoes/$($m.id).png"
    } else {
        $m.logoUrl = "img/logo-js-azul-escuro.png"
    }
}

$updatedJson = $missoes | ConvertTo-Json -Depth 5
[System.IO.File]::WriteAllText($jsonPath, $updatedJson, [System.Text.Encoding]::UTF8)

$jsContent = "window.JS_MISSOES_DATA = " + $updatedJson + ";"
[System.IO.File]::WriteAllText("C:\Users\andre\.gemini\antigravity\scratch\jovens-sarados-web\js\missoes-data.js", $jsContent, [System.Text.Encoding]::UTF8)

Write-Host "Updated missoes-data.json and missoes-data.js with local blue logo URLs!"
