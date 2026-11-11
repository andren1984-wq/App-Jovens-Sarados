$enc1252 = [System.Text.Encoding]::GetEncoding(1252)
$encUtf8 = [System.Text.Encoding]::UTF8

$test = "CanÃ§Ã£o Nova â€¢ OraÃ§Ãµes e Santo TerÃ§o"
$b = $enc1252.GetBytes($test)
$result = $encUtf8.GetString($b)
Write-Host "Original: $test"
Write-Host "Result:   $result"
