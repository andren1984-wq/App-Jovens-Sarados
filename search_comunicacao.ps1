$dirs = Get-ChildItem -Path "C:\Users\andre\Desktop\Andre" -Directory
foreach ($d in $dirs) {
    if ($d.Name -like "Comunica*") {
        Write-Host "Found directory: $($d.FullName)"
        Get-ChildItem -Path $d.FullName -Recurse | Where-Object { -not $_.PSIsContainer } | Select-Object -Property Name, FullName, Length | Format-Table -AutoSize
    }
}
