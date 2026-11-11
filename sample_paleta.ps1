Add-Type -AssemblyName System.Drawing

$paletaPath = Get-ChildItem -Path "C:\Users\andre\Desktop\Andre" -Filter "PALETA.png" -Recurse | Select-Object -First 1
if ($paletaPath) {
    Write-Host "Paleta found at: $($paletaPath.FullName)"
    $bmp = [System.Drawing.Bitmap]::FromFile($paletaPath.FullName)
    Write-Host "Dimensions: $($bmp.Width) x $($bmp.Height)"
    
    $y = [int]($bmp.Height / 2)
    for ($x = 10; $x -lt $bmp.Width; $x += [int]($bmp.Width / 10)) {
        $c = $bmp.GetPixel($x, $y)
        $hex = "#{0:X2}{1:X2}{2:X2}" -f $c.R, $c.G, $c.B
        Write-Host "x=$x : $hex (R=$($c.R), G=$($c.G), B=$($c.B))"
    }
    $bmp.Dispose()
} else {
    Write-Host "PALETA.png not found"
}
