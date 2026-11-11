$files = Get-ChildItem -Path "C:\Users\andre\.gemini\antigravity\scratch\jovens-sarados-web" -Include "*.js","*.html" -Recurse
foreach ($f in $files) {
    $lines = Get-Content -Path $f.FullName
    for ($i = 0; $i -lt $lines.Count; $i++) {
        if ($lines[$i] -match 'Miss') {
            Write-Host "$($f.Name) line $($i+1): $($lines[$i].Trim())"
        }
    }
}
