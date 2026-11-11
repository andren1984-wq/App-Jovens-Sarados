$urlO = "https://drive.google.com/thumbnail?id=1OlIbpU9ZgtD9vvOSqNI2SY13qZScko1S&sz=w400"
$urlP = "https://drive.google.com/thumbnail?id=1htdC4CMThH0b6Y3rIptb4JyvULnqYa6N&sz=w400"

Invoke-WebRequest -Uri $urlO -OutFile "C:\Users\andre\.gemini\antigravity\scratch\jovens-sarados-web\logo_O.png" -UseBasicParsing -UserAgent "Mozilla/5.0"
Invoke-WebRequest -Uri $urlP -OutFile "C:\Users\andre\.gemini\antigravity\scratch\jovens-sarados-web\logo_P.png" -UseBasicParsing -UserAgent "Mozilla/5.0"

Write-Host "Downloaded logo_O.png: $((Get-Item 'C:\Users\andre\.gemini\antigravity\scratch\jovens-sarados-web\logo_O.png').Length) bytes"
Write-Host "Downloaded logo_P.png: $((Get-Item 'C:\Users\andre\.gemini\antigravity\scratch\jovens-sarados-web\logo_P.png').Length) bytes"
