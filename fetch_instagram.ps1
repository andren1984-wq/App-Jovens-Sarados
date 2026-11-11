$edgePath = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
$proc = Start-Process -FilePath $edgePath -ArgumentList "--headless=new", "--remote-debugging-port=9222", "--disable-gpu", "https://www.instagram.com/jovens.sarados/" -PassThru
Start-Sleep -Seconds 6

try {
    $tabs = Invoke-RestMethod -Uri "http://localhost:9222/json" -UseBasicParsing
    $targetTab = $tabs | Where-Object { $_.url -like "*instagram.com*" } | Select-Object -First 1

    if ($targetTab) {
        $wsUri = $targetTab.webSocketDebuggerUrl
        $ws = New-Object System.Net.WebSockets.ClientWebSocket
        $ct = New-Object System.Threading.CancellationToken
        $ws.ConnectAsync([Uri]$wsUri, $ct).Wait()

        function Send-CDP ($method, $params) {
            $id = Get-Random -Minimum 1000 -Maximum 9999
            $msg = @{ id = $id; method = $method; params = $params } | ConvertTo-Json -Compress
            $bytes = [System.Text.Encoding]::UTF8.GetBytes($msg)
            $segment = New-Object System.ArraySegment[byte] -ArgumentList @(,$bytes)
            $ws.SendAsync($segment, [System.Net.WebSockets.WebSocketMessageType]::Text, $true, $ct).Wait()

            $buffer = New-Object byte[] 524288
            $segRecv = New-Object System.ArraySegment[byte] -ArgumentList @(,$buffer)
            $res = $ws.ReceiveAsync($segRecv, $ct)
            $res.Wait()
            $jsonStr = [System.Text.Encoding]::UTF8.GetString($buffer, 0, $res.Result.Count)
            return $jsonStr | ConvertFrom-Json
        }

        # Extrai todas as imagens e links
        $jsCode = @"
            (function() {
                var imgs = document.querySelectorAll('img');
                var list = [];
                for (var i = 0; i < imgs.length; i++) {
                    var img = imgs[i];
                    var a = img.closest('a');
                    list.push({
                        src: img.src,
                        alt: img.alt || '',
                        href: a ? a.href : ''
                    });
                }
                return list;
            })()
"@
        $evalRes = Send-CDP -method "Runtime.evaluate" -params @{ expression = $jsCode; returnByValue = $true }
        
        $outDir = "C:\Users\andre\.gemini\antigravity\scratch\jovens-sarados-web\img\instagram"
        $idx = 1
        $savedList = @()
        foreach ($item in $evalRes.result.value) {
            if ($item.src -and $item.src -like "http*" -and ($item.href -like "*/p/*" -or $item.alt -like "*Foto*" -or $item.alt -like "*imagem*")) {
                Write-Host "Post $idx : $($item.href)"
                Write-Host "Alt: $($item.alt)"
                $outFile = "$outDir\post-$idx.jpg"
                try {
                    Invoke-WebRequest -Uri $item.src -OutFile $outFile -UseBasicParsing -UserAgent "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
                    Write-Host "Salvo com sucesso: $outFile"
                    $savedList += @{
                        idx = $idx
                        url = $item.href
                        alt = $item.alt
                        src = $item.src
                        localImg = "img/instagram/post-$idx.jpg"
                    }
                    $idx++
                } catch {
                    Write-Host "Erro ao salvar imagem: $_"
                }
            }
        }
        $savedList | ConvertTo-Json -Depth 5 | Out-File -FilePath "$outDir\posts.json" -Encoding UTF8

        $ws.CloseAsync([System.Net.WebSockets.WebSocketCloseStatus]::NormalClosure, "Done", $ct).Wait()
    }
} finally {
    Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
}
