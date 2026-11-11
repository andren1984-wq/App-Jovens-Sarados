Add-Type -AssemblyName System.IO.Compression.FileSystem

$file = Get-ChildItem -Path "C:\Users\andre\Desktop\Andre\Documento JS" -Filter "*roteiro*.docx" | Select-Object -First 1
if ($file) {
    $zip = [System.IO.Compression.ZipFile]::OpenRead($file.FullName)
    $docEntry = $zip.GetEntry("word/document.xml")
    if ($docEntry) {
        $stream = $docEntry.Open()
        $reader = New-Object System.IO.StreamReader($stream)
        $text = $reader.ReadToEnd()
        $reader.Close()
        $stream.Close()
        $clean = [regex]::Replace($text, "<w:p[^>]*>", "`r`n")
        $clean = [regex]::Replace($clean, "<[^>]+>", "")
        $clean = [System.Web.HttpUtility]::HtmlDecode($clean)
        [System.IO.File]::WriteAllText("C:\Users\andre\.gemini\antigravity\scratch\jovens-sarados-web\roteiro_extracted.txt", $clean, [System.Text.Encoding]::UTF8)
        Write-Host "Extracted roteiro text, length: $($clean.Length)"
        # Search for pedrinhas
        $clean | Select-String -Pattern "pedrinha" -Context 3,10
    }
    $zip.Dispose()
}
