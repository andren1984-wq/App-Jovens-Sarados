$pdfFiles = Get-ChildItem -Path "C:\Users\andre\Desktop\Andre\Documento JS" -Filter "*.pdf"
foreach ($pdf in $pdfFiles) {
    Write-Host "Scanning: $($pdf.Name)"
    $bytes = [System.IO.File]::ReadAllBytes($pdf.FullName)
    $text = [System.Text.Encoding]::ASCII.GetString($bytes)
    if ($text -match "pedrinha|PEDRINHA|bloco 1|Bloco 1") {
        Write-Host "   -> Match found in $($pdf.Name)!"
    }
}
