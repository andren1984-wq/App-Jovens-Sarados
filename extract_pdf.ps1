function Extract-PdfText($filePath) {
    $bytes = [System.IO.File]::ReadAllBytes($filePath)
    $len = $bytes.Length
    $i = 0
    $fullText = New-Object System.Text.StringBuilder
    
    while ($i -lt $len - 6) {
        # Search for "stream\r\n" or "stream\n"
        if ($bytes[$i] -eq 115 -and $bytes[$i+1] -eq 116 -and $bytes[$i+2] -eq 114 -and $bytes[$i+3] -eq 101 -and $bytes[$i+4] -eq 97 -and $bytes[$i+5] -eq 109) {
            $streamStart = $i + 6
            if ($streamStart -lt $len -and $bytes[$streamStart] -eq 13) { $streamStart++ }
            if ($streamStart -lt $len -and $bytes[$streamStart] -eq 10) { $streamStart++ }
            
            # Find endstream
            $streamEnd = $streamStart
            while ($streamEnd -lt $len - 9) {
                if ($bytes[$streamEnd] -eq 101 -and $bytes[$streamEnd+1] -eq 110 -and $bytes[$streamEnd+2] -eq 100 -and $bytes[$streamEnd+3] -eq 115 -and $bytes[$streamEnd+4] -eq 116 -and $bytes[$streamEnd+5] -eq 114 -and $bytes[$streamEnd+6] -eq 101 -and $bytes[$streamEnd+7] -eq 97 -and $bytes[$streamEnd+8] -eq 109) {
                    break
                }
                $streamEnd++
            }
            
            if ($streamEnd -gt $streamStart) {
                $compressedLength = $streamEnd - $streamStart
                # Strip leading whitespace or newline if any
                if ($bytes[$streamEnd-1] -eq 10) { $streamEnd-- }
                if ($bytes[$streamEnd-1] -eq 13) { $streamEnd-- }
                $compressedLength = $streamEnd - $streamStart
                
                # Check for zlib header 0x78
                if ($compressedLength -gt 2 -and $bytes[$streamStart] -eq 0x78) {
                    try {
                        $ms = New-Object System.IO.MemoryStream($bytes, $streamStart + 2, $compressedLength - 6)
                        $ds = New-Object System.IO.Compression.DeflateStream($ms, [System.IO.Compression.CompressionMode]::Decompress)
                        $outMs = New-Object System.IO.MemoryStream
                        $ds.CopyTo($outMs)
                        $ds.Close()
                        $decomp = [System.Text.Encoding]::UTF8.GetString($outMs.ToArray())
                        $matches = [regex]::Matches($decomp, "\(([^\)]+)\)\s*Tj|\[([^\]]+)\]\s*TJ")
                        foreach ($m in $matches) {
                            $t = if ($m.Groups[1].Success) { $m.Groups[1].Value } else { $m.Groups[2].Value }
                            [void]$fullText.Append($t + " ")
                        }
                    } catch {}
                }
            }
            $i = $streamEnd + 9
        } else {
            $i++
        }
    }
    return $fullText.ToString()
}

$target = Get-ChildItem -Path "C:\Users\andre\Desktop\Andre\Documento JS" -Filter "*Cartilha*Orac*.pdf" | Select-Object -First 1
if ($target) {
    Write-Host "Extracting from $($target.Name)..."
    $txt = Extract-PdfText $target.FullName
    Write-Host "Extracted length: $($txt.Length)"
    if ($txt -match "pedrinha|Pedrinha") {
        Write-Host "Pedrinhas found!"
        $matches = [regex]::Matches($txt, ".{0,80}pedrinha.{0,150}", [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
        foreach ($m in $matches | Select-Object -First 10) {
            Write-Host " -> $($m.Value)"
        }
    } else {
        Write-Host "Snippet: $($txt.Substring(0, [Math]::Min(500, $txt.Length)))"
    }
}
