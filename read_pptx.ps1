Add-Type -AssemblyName System.IO.Compression.FileSystem

$item = Get-ChildItem -Path "C:\Users\andre\Desktop\Andre" -Filter "*EDICOM*.pptx" -Recurse | Select-Object -First 1
if ($item) {
    Write-Host "Found PPTX: $($item.FullName)"
    $zip = [System.IO.Compression.ZipFile]::OpenRead($item.FullName)
    foreach ($entry in $zip.Entries) {
        if ($entry.FullName -like "ppt/slides/slide*.xml") {
            $stream = $entry.Open()
            $reader = New-Object System.IO.StreamReader($stream)
            $xmlText = $reader.ReadToEnd()
            $reader.Close()
            $stream.Close()
            $matches = [regex]::Matches($xmlText, "<a:t>([^<]+)</a:t>")
            if ($matches.Count -gt 0) {
                $slideText = ($matches | ForEach-Object { $_.Groups[1].Value }) -join " "
                Write-Host ("=== " + $entry.Name + " ===")
                Write-Host $slideText
            }
        }
    }
    $zip.Dispose()
} else {
    Write-Host "File not found"
}
