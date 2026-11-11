$files = @(
    "C:\Users\andre\.gemini\antigravity\scratch\jovens-sarados-web\js\app.js",
    "C:\Users\andre\.gemini\antigravity\scratch\jovens-sarados-web\js\missoes-data.js",
    "C:\Users\andre\.gemini\antigravity\scratch\jovens-sarados-web\js\oracoes-data.js",
    "C:\Users\andre\.gemini\antigravity\scratch\jovens-sarados-web\js\formacoes-data.js",
    "C:\Users\andre\.gemini\antigravity\scratch\jovens-sarados-web\js\santos-data.js",
    "C:\Users\andre\.gemini\antigravity\scratch\jovens-sarados-web\js\controllers.js",
    "C:\Users\andre\.gemini\antigravity\scratch\jovens-sarados-web\js\services.js",
    "C:\Users\andre\.gemini\antigravity\scratch\jovens-sarados-web\js\browser-adapter.js"
)

# Test with headless Edge/Chrome using a quick script
# or test using mshta
foreach ($f in $files) {
    $code = [System.IO.File]::ReadAllText($f, [System.Text.Encoding]::UTF8)
    $testHtml = "C:\Users\andre\.gemini\antigravity\scratch\jovens-sarados-web\test_js.html"
    $html = @"
<!DOCTYPE html>
<html>
<head>
<script>
window.onerror = function(msg, url, line) {
    document.title = 'ERR:' + msg + ':' + line;
};
</script>
<script src="$([System.IO.Path]::GetFileName($f))"></script>
</head>
<body onload="if(document.title.indexOf('ERR:')===-1) document.title = 'OK';">
</body>
</html>
"@
    [System.IO.File]::WriteAllText($testHtml, $html, [System.Text.Encoding]::UTF8)
}
Write-Host "Created test html"
