Add-Type -AssemblyName System.IO.Compression.FileSystem

$docxFiles = Get-ChildItem -Path "C:\Users\andre\Desktop\Andre" -Filter "*.docx" -Recurse
foreach ($file in $docxFiles) {
    try {
        $zip = [System.IO.Compression.ZipFile]::OpenRead($file.FullName)
        $docEntry = $zip.GetEntry("word/document.xml")
        if ($docEntry) {
            $stream = $docEntry.Open()
            $reader = New-Object System.IO.StreamReader($stream)
            $text = $reader.ReadToEnd()
            $reader.Close()
            $stream.Close()
            if ($text -like "*pedrinha*") {
                Write-Host "FOUND in DOCX: $($file.FullName)"
                # Extract snippets
                $clean = [regex]::Replace($text, "<[^>]+>", " ")
                $matches = [regex]::Matches($clean, ".{0,100}pedrinha.{0,150}", [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
                foreach ($m in $matches) {
                    Write-Host "   -> $($m.Value)"
                }
            }
        }
        $zip.Dispose()
    } catch {}
}
