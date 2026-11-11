Add-Type -AssemblyName System.IO.Compression.FileSystem
$f = "C:\Users\andre\.gemini\antigravity\scratch\jovens-sarados-web\missoes_download.xlsx"
$zip = [System.IO.Compression.ZipFile]::OpenRead($f)

# Relationships
$rels = @{}
$relEntry = $zip.GetEntry("xl/worksheets/_rels/sheet1.xml.rels")
if ($relEntry) {
    $reader = New-Object System.IO.StreamReader($relEntry.Open(), [System.Text.Encoding]::UTF8)
    $relXml = [xml]$reader.ReadToEnd()
    $reader.Close()
    foreach ($r in $relXml.Relationships.Relationship) {
        $rels[$r.Id] = $r.Target
    }
}

# Shared strings
$strings = @()
$strEntry = $zip.GetEntry("xl/sharedStrings.xml")
if ($strEntry) {
    $reader = New-Object System.IO.StreamReader($strEntry.Open(), [System.Text.Encoding]::UTF8)
    $strRaw = $reader.ReadToEnd()
    $reader.Close()
    $siMatches = [regex]::Matches($strRaw, '(?s)<si>(.*?)</si>')
    foreach ($sm in $siMatches) {
        $clean = [regex]::Replace($sm.Groups[1].Value, '<[^>]+>', '')
        $clean = [System.Net.WebUtility]::HtmlDecode($clean)
        $strings += $clean
    }
}

# Sheet1
$sheetEntry = $zip.GetEntry("xl/worksheets/sheet1.xml")
$reader = New-Object System.IO.StreamReader($sheetEntry.Open(), [System.Text.Encoding]::UTF8)
$sheetXml = [xml]$reader.ReadToEnd()
$reader.Close()
$zip.Dispose()

$hyperlinks = @{}
if ($sheetXml.worksheet.hyperlinks) {
    foreach ($hl in $sheetXml.worksheet.hyperlinks.hyperlink) {
        $target = $rels[$hl.id]
        if (-not $target) { $target = $hl.location }
        $hyperlinks[$hl.ref] = $target
    }
}

function Get-Val($c, $strings) {
    if (-not $c) { return "" }
    if ($c.t -eq "s" -and $c.v -ne $null) {
        $idx = [int]$c.v
        if ($idx -ge 0 -and $idx -lt $strings.Count) { return $strings[$idx] }
    }
    if ($c.v -ne $null) { return [string]$c.v }
    return [string]$c.InnerText
}

$rows = $sheetXml.worksheet.sheetData.row
for ($i = 0; $i -lt [Math]::Min(25, $rows.Count); $i++) {
    $r = $rows[$i]
    $rowNum = $r.r
    $cells = @{}
    foreach ($c in $r.c) {
        $col = [regex]::Replace($c.r, '[0-9]', '')
        $cells[$col] = $c
    }
    $b = Get-Val $cells['B'] $strings
    $iVal = Get-Val $cells['I'] $strings
    $oVal = Get-Val $cells['O'] $strings
    $oLink = $hyperlinks["O$rowNum"]
    $pVal = Get-Val $cells['P'] $strings
    $pLink = $hyperlinks["P$rowNum"]
    Write-Host "Row $rowNum : Missao='$b' | Col I(Logo)='$iVal' | Col O='$oLink' | Col P='$pLink'"
}
