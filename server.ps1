$port = 8080
$prefix = "http://localhost:$port/"
$root = "C:\Users\andre\.gemini\antigravity\scratch\jovens-sarados-web"
$dbFile = Join-Path $root "data\membros.json"

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)
$listener.Start()
Write-Host "Servidor Jovens Sarados rodando em $prefix"

$mimeTypes = @{
    ".html"   = "text/html; charset=utf-8"
    ".htm"    = "text/html; charset=utf-8"
    ".css"    = "text/css; charset=utf-8"
    ".js"     = "application/javascript; charset=utf-8"
    ".json"   = "application/json; charset=utf-8"
    ".png"    = "image/png"
    ".jpg"    = "image/jpeg"
    ".jpeg"   = "image/jpeg"
    ".gif"    = "image/gif"
    ".svg"    = "image/svg+xml"
    ".woff"   = "font/woff"
    ".woff2"  = "font/woff2"
    ".ttf"    = "font/ttf"
    ".ico"    = "image/x-icon"
}

$fileCache = @{}

function Get-RequestBody($request) {
    try {
        $len = $request.ContentLength64
        if ($len -gt 0) {
            $buffer = New-Object byte[] $len
            $totalRead = 0
            while ($totalRead -lt $len) {
                $r = $request.InputStream.Read($buffer, $totalRead, $len - $totalRead)
                if ($r -le 0) { break }
                $totalRead += $r
            }
            return [System.Text.Encoding]::UTF8.GetString($buffer, 0, $totalRead)
        }
    } catch {}
    return ""
}

function Format-AsJsonArray($list) {
    if ($null -eq $list -or $list.Count -eq 0) {
        return "[]"
    }
    if ($list.Count -eq 1) {
        $single = $list[0] | ConvertTo-Json -Depth 10
        return "[" + $single + "]"
    }
    return ($list | ConvertTo-Json -Depth 10)
}

function Handle-Context($context) {
    try {
        $request = $context.Request
        $response = $context.Response

        $urlPath = $request.Url.LocalPath.TrimStart('/')
        if ([string]::IsNullOrWhiteSpace($urlPath)) {
            $urlPath = "index.html"
        }

        $urlPath = [System.Uri]::UnescapeDataString($urlPath)

        # 1. CORS Preflight
        if ($request.HttpMethod -eq "OPTIONS") {
            $response.Headers.Add("Access-Control-Allow-Origin", "*")
            $response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, OPTIONS, DELETE")
            $response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, Accept, Authorization")
            $response.StatusCode = 200
            $response.Close()
            return
        }

        # 2. REST API: /api/membros
        if ($urlPath -eq "api/membros" -or $urlPath -eq "api/membros/") {
            $response.Headers.Add("Access-Control-Allow-Origin", "*")
            $response.Headers.Add("Cache-Control", "no-cache, no-store, must-revalidate")
            $response.ContentType = "application/json; charset=utf-8"

            if ($request.HttpMethod -eq "GET") {
                if (Test-Path $dbFile) {
                    $raw = [System.IO.File]::ReadAllText($dbFile, [System.Text.Encoding]::UTF8).Trim()
                    if ($raw.StartsWith("{")) {
                        $raw = "[$raw]"
                        [System.IO.File]::WriteAllText($dbFile, $raw, [System.Text.Encoding]::UTF8)
                    }
                    $jsonBytes = [System.Text.Encoding]::UTF8.GetBytes($raw)
                } else {
                    $jsonBytes = [System.Text.Encoding]::UTF8.GetBytes("[]")
                }
                $response.ContentLength64 = $jsonBytes.Length
                $response.OutputStream.Write($jsonBytes, 0, $jsonBytes.Length)
                $response.Close()
                return
            }

            if ($request.HttpMethod -eq "POST") {
                $body = Get-RequestBody $request

                $membrosList = New-Object System.Collections.ArrayList
                if (Test-Path $dbFile) {
                    $existingRaw = [System.IO.File]::ReadAllText($dbFile, [System.Text.Encoding]::UTF8).Trim()
                    if ($existingRaw.StartsWith("{")) {
                        $existingRaw = "[$existingRaw]"
                    }
                    if (-not [string]::IsNullOrWhiteSpace($existingRaw)) {
                        $parsedArr = $existingRaw | ConvertFrom-Json
                        foreach ($it in $parsedArr) {
                            $membrosList.Add($it) | Out-Null
                        }
                    }
                }

                $newMember = $body | ConvertFrom-Json
                $existsIdx = -1
                for ($i = 0; $i -lt $membrosList.Count; $i++) {
                    $cur = $membrosList[$i]
                    if (($newMember.email -and $cur.email -and $cur.email.ToString().ToLower() -eq $newMember.email.ToString().ToLower()) -or
                        ($newMember.id -and $cur.id -and $cur.id.ToString() -eq $newMember.id.ToString())) {
                        $existsIdx = $i
                        break
                    }
                }

                if ($existsIdx -ge 0) {
                    $membrosList[$existsIdx] = $newMember
                } else {
                    $membrosList.Insert(0, $newMember)
                }

                if ($membrosList.Count -eq 0) {
                    $updatedJson = "[]"
                } elseif ($membrosList.Count -eq 1) {
                    $updatedJson = "[`r`n" + ($membrosList[0] | ConvertTo-Json -Depth 10) + "`r`n]"
                } else {
                    $updatedJson = $membrosList | ConvertTo-Json -Depth 10
                }
                [System.IO.File]::WriteAllText($dbFile, $updatedJson, [System.Text.Encoding]::UTF8)

                $respBytes = [System.Text.Encoding]::UTF8.GetBytes($updatedJson)
                $response.ContentLength64 = $respBytes.Length
                $response.OutputStream.Write($respBytes, 0, $respBytes.Length)
                $response.Close()
                return
            }

            if ($request.HttpMethod -eq "DELETE") {
                $body = Get-RequestBody $request

                $membrosList = New-Object System.Collections.ArrayList
                if (Test-Path $dbFile) {
                    $existingRaw = [System.IO.File]::ReadAllText($dbFile, [System.Text.Encoding]::UTF8).Trim()
                    if ($existingRaw.StartsWith("{")) {
                        $existingRaw = "[$existingRaw]"
                    }
                    if (-not [string]::IsNullOrWhiteSpace($existingRaw)) {
                        $parsedArr = $existingRaw | ConvertFrom-Json
                        foreach ($it in $parsedArr) {
                            $membrosList.Add($it) | Out-Null
                        }
                    }
                }

                $delId = $null
                if ($body) {
                    try {
                        $delObj = $body | ConvertFrom-Json
                        if ($delObj -and $delObj.id) { $delId = $delObj.id.ToString() }
                    } catch {}
                }
                if (-not $delId -and $request.QueryString["id"]) {
                    $delId = $request.QueryString["id"].ToString()
                }

                $newList = New-Object System.Collections.ArrayList
                foreach ($m in $membrosList) {
                    if ($m.id.ToString() -ne $delId) {
                        $newList.Add($m) | Out-Null
                    }
                }

                if ($newList.Count -eq 0) {
                    $updatedJson = "[]"
                } elseif ($newList.Count -eq 1) {
                    $updatedJson = "[`r`n" + ($newList[0] | ConvertTo-Json -Depth 10) + "`r`n]"
                } else {
                    $updatedJson = $newList | ConvertTo-Json -Depth 10
                }
                [System.IO.File]::WriteAllText($dbFile, $updatedJson, [System.Text.Encoding]::UTF8)

                $respBytes = [System.Text.Encoding]::UTF8.GetBytes($updatedJson)
                $response.ContentLength64 = $respBytes.Length
                $response.OutputStream.Write($respBytes, 0, $respBytes.Length)
                $response.Close()
                return
            }
        }

        # 2.5 REST API: /api/pedrinhas (Acompanhamento e sincronização de pedrinhas)
        if ($urlPath -eq "api/pedrinhas" -or $urlPath -eq "api/pedrinhas/") {
            $response.Headers.Add("Access-Control-Allow-Origin", "*")
            $response.Headers.Add("Cache-Control", "no-cache, no-store, must-revalidate")
            $response.ContentType = "application/json; charset=utf-8"

            $pedrinhasFile = Join-Path $root "data\pedrinhas.json"

            if ($request.HttpMethod -eq "GET") {
                $emailParam = $request.QueryString["email"]
                $pedrinhasDb = $null
                if (Test-Path $pedrinhasFile) {
                    $raw = [System.IO.File]::ReadAllText($pedrinhasFile, [System.Text.Encoding]::UTF8).Trim()
                    if (-not [string]::IsNullOrWhiteSpace($raw)) {
                        try { $pedrinhasDb = $raw | ConvertFrom-Json } catch {}
                    }
                }
                if ($emailParam) {
                    $emailClean = $emailParam.Trim().ToLower()
                    $userPedrinhas = $null
                    if ($pedrinhasDb -and $pedrinhasDb.PSObject.Properties[$emailClean]) {
                        $userPedrinhas = $pedrinhasDb.$emailClean
                    }
                    if (-not $userPedrinhas) {
                        $userPedrinhas = @{
                            records = @{}
                            cumpridas = @{
                                oracaoPessoal = 14
                                terco = 20
                                biblia = 11
                                jejumPenitencia = 5
                                missa = 26
                            }
                        }
                    }
                    $jsonOut = $userPedrinhas | ConvertTo-Json -Depth 10
                } else {
                    $jsonOut = if ($pedrinhasDb) { $pedrinhasDb | ConvertTo-Json -Depth 10 } else { "{}" }
                }
                $jsonBytes = [System.Text.Encoding]::UTF8.GetBytes($jsonOut)
                $response.ContentLength64 = $jsonBytes.Length
                $response.OutputStream.Write($jsonBytes, 0, $jsonBytes.Length)
                $response.Close()
                return
            }

            if ($request.HttpMethod -eq "POST") {
                $body = Get-RequestBody $request

                $payload = $body | ConvertFrom-Json
                $userEmail = if ($payload.email) { $payload.email.ToString().Trim().ToLower() } else { "geral" }
                $userStore = $payload.store

                $pedrinhasDb = $null
                if (Test-Path $pedrinhasFile) {
                    $raw = [System.IO.File]::ReadAllText($pedrinhasFile, [System.Text.Encoding]::UTF8).Trim()
                    if (-not [string]::IsNullOrWhiteSpace($raw)) {
                        try { $pedrinhasDb = $raw | ConvertFrom-Json } catch {}
                    }
                }
                if (-not $pedrinhasDb) {
                    $pedrinhasDb = [PSCustomObject]@{}
                }
                Add-Member -InputObject $pedrinhasDb -NotePropertyName $userEmail -NotePropertyValue $userStore -Force

                $updatedJson = $pedrinhasDb | ConvertTo-Json -Depth 10
                [System.IO.File]::WriteAllText($pedrinhasFile, $updatedJson, [System.Text.Encoding]::UTF8)

                $respBytes = [System.Text.Encoding]::UTF8.GetBytes($updatedJson)
                $response.ContentLength64 = $respBytes.Length
                $response.OutputStream.Write($respBytes, 0, $respBytes.Length)
                $response.Close()
                return
            }
        }

        # 2.55 REST API: /api/diario (Meu Diário Bíblico - Estritamente Pessoal e Privado por Usuário)
        if ($urlPath -eq "api/diario" -or $urlPath -eq "api/diario/") {
            $response.Headers.Add("Access-Control-Allow-Origin", "*")
            $response.Headers.Add("Cache-Control", "no-cache, no-store, must-revalidate")
            $response.ContentType = "application/json; charset=utf-8"

            $diarioFile = Join-Path $root "data\diario_biblico.json"

            if ($request.HttpMethod -eq "GET") {
                $emailParam = $request.QueryString["email"]
                $diarioDb = $null
                if (Test-Path $diarioFile) {
                    $raw = [System.IO.File]::ReadAllText($diarioFile, [System.Text.Encoding]::UTF8).Trim()
                    if (-not [string]::IsNullOrWhiteSpace($raw)) {
                        try { $diarioDb = $raw | ConvertFrom-Json } catch {}
                    }
                }
                $userDiario = @()
                if ($emailParam) {
                    $emailClean = $emailParam.Trim().ToLower()
                    if ($diarioDb -and $diarioDb.PSObject.Properties[$emailClean]) {
                        $userDiario = $diarioDb.$emailClean
                    }
                }
                $jsonOut = if ($userDiario) { $userDiario | ConvertTo-Json -Depth 10 } else { "[]" }
                if ($jsonOut.StartsWith("{")) { $jsonOut = "[$jsonOut]" }
                $jsonBytes = [System.Text.Encoding]::UTF8.GetBytes($jsonOut)
                $response.ContentLength64 = $jsonBytes.Length
                $response.OutputStream.Write($jsonBytes, 0, $jsonBytes.Length)
                $response.Close()
                return
            }

            if ($request.HttpMethod -eq "POST") {
                $body = Get-RequestBody $request

                $payload = $body | ConvertFrom-Json
                $userEmail = if ($payload.email) { $payload.email.ToString().Trim().ToLower() } else { "anonimo" }
                
                $diarioDb = $null
                if (Test-Path $diarioFile) {
                    $raw = [System.IO.File]::ReadAllText($diarioFile, [System.Text.Encoding]::UTF8).Trim()
                    if (-not [string]::IsNullOrWhiteSpace($raw)) {
                        try { $diarioDb = $raw | ConvertFrom-Json } catch {}
                    }
                }
                if (-not $diarioDb) {
                    $diarioDb = [PSCustomObject]@{}
                }

                $userList = New-Object System.Collections.ArrayList
                if ($diarioDb.PSObject.Properties[$userEmail]) {
                    $existingItems = $diarioDb.$userEmail
                    if ($existingItems -is [System.Array]) {
                        foreach ($it in $existingItems) { $userList.Add($it) | Out-Null }
                    } elseif ($existingItems) {
                        $userList.Add($existingItems) | Out-Null
                    }
                }

                if ($payload.action -eq "delete" -and $payload.id) {
                    $toRemove = -1
                    for ($i = 0; $i -lt $userList.Count; $i++) {
                        if ($userList[$i].id -and $userList[$i].id.ToString() -eq $payload.id.ToString()) {
                            $toRemove = $i
                            break
                        }
                    }
                    if ($toRemove -ge 0) {
                        $userList.RemoveAt($toRemove)
                    }
                } elseif ($payload.entry) {
                    $userList.Insert(0, $payload.entry)
                } elseif ($payload.entries) {
                    $userList.Clear()
                    foreach ($it in $payload.entries) { $userList.Add($it) | Out-Null }
                }

                Add-Member -InputObject $diarioDb -NotePropertyName $userEmail -NotePropertyValue $userList -Force
                $updatedJson = $diarioDb | ConvertTo-Json -Depth 10
                [System.IO.File]::WriteAllText($diarioFile, $updatedJson, [System.Text.Encoding]::UTF8)

                $respBytes = [System.Text.Encoding]::UTF8.GetBytes($updatedJson)
                $response.ContentLength64 = $respBytes.Length
                $response.OutputStream.Write($respBytes, 0, $respBytes.Length)
                $response.Close()
                return
            }
        }

        # 2.6 REST API: /api/feed (Feed de Notícias Geral e Centralizado)
        if ($urlPath -eq "api/feed" -or $urlPath -eq "api/feed/") {
            $response.Headers.Add("Access-Control-Allow-Origin", "*")
            $response.Headers.Add("Cache-Control", "no-cache, no-store, must-revalidate")
            $response.ContentType = "application/json; charset=utf-8"

            $noticiasFile = Join-Path $root "data\noticias.json"
            $notifFile = Join-Path $root "data\notificacoes.json"

            if ($request.HttpMethod -eq "GET") {
                if (Test-Path $noticiasFile) {
                    $raw = [System.IO.File]::ReadAllText($noticiasFile, [System.Text.Encoding]::UTF8).Trim()
                    $jsonBytes = [System.Text.Encoding]::UTF8.GetBytes($raw)
                } else {
                    $jsonBytes = [System.Text.Encoding]::UTF8.GetBytes("[]")
                }
                $response.ContentLength64 = $jsonBytes.Length
                $response.OutputStream.Write($jsonBytes, 0, $jsonBytes.Length)
                $response.Close()
                return
            }

            if ($request.HttpMethod -eq "POST") {
                $body = Get-RequestBody $request

                $feedItem = $body | ConvertFrom-Json
                $feedsList = New-Object System.Collections.ArrayList
                if (Test-Path $noticiasFile) {
                    $raw = [System.IO.File]::ReadAllText($noticiasFile, [System.Text.Encoding]::UTF8).Trim()
                    if (-not [string]::IsNullOrWhiteSpace($raw)) {
                        $arr = $raw | ConvertFrom-Json
                        foreach ($it in $arr) { $feedsList.Add($it) | Out-Null }
                    }
                }

                $existingIdx = -1
                for ($i = 0; $i -lt $feedsList.Count; $i++) {
                    $cur = $feedsList[$i]
                    if ($feedItem.id -and $cur.id -and $cur.id.ToString() -eq $feedItem.id.ToString()) {
                        $existingIdx = $i
                        break
                    }
                }

                $isNewPost = ($existingIdx -lt 0)
                if ($existingIdx -ge 0) {
                    $feedsList[$existingIdx] = $feedItem
                } else {
                    $feedsList.Insert(0, $feedItem)
                }

                $updatedJson = $feedsList | ConvertTo-Json -Depth 10
                [System.IO.File]::WriteAllText($noticiasFile, $updatedJson, [System.Text.Encoding]::UTF8)

                # Se for post novo, gerar notificacao para todos os membros
                if ($isNewPost) {
                    $notifsList = New-Object System.Collections.ArrayList
                    if (Test-Path $notifFile) {
                        $notifRaw = [System.IO.File]::ReadAllText($notifFile, [System.Text.Encoding]::UTF8).Trim()
                        if (-not [string]::IsNullOrWhiteSpace($notifRaw)) {
                            $nArr = $notifRaw | ConvertFrom-Json
                            foreach ($nit in $nArr) { $notifsList.Add($nit) | Out-Null }
                        }
                    }

                    $pTitle = if ($feedItem.feedData -and $feedItem.feedData.title) { $feedItem.feedData.title } else { "Nova noticia dos Jovens Sarados" }
                    $pImg = if ($feedItem.feedData -and $feedItem.feedData.postImagem) { $feedItem.feedData.postImagem } else { "img/logo-splash.png" }
                    $nowTs = [Math]::Floor([double]([DateTimeOffset]::UtcNow.ToUnixTimeSeconds()))

                    $newNotif = [PSCustomObject]@{
                        id = "notify-" + [Guid]::NewGuid().ToString().Substring(0, 8)
                        tipo = "feed"
                        target = "todos"
                        feedId = if ($feedItem.id) { $feedItem.id } else { "" }
                        title = "Nova Publicacao no Feed!"
                        titleInt = $pTitle
                        body = "Confira a nova publicacao no Feed: '" + $pTitle + "'. Toque para abrir e curtir!"
                        imgThumb = $pImg
                        dateTime = $nowTs
                        isViewed = 0
                        url = "#/app/feed//"
                    }

                    $notifsList.Insert(0, $newNotif)
                    if ($notifsList.Count -gt 30) {
                        $notifsList = New-Object System.Collections.ArrayList(@($notifsList | Select-Object -First 30))
                    }
                    $notifJson = $notifsList | ConvertTo-Json -Depth 10
                    [System.IO.File]::WriteAllText($notifFile, $notifJson, [System.Text.Encoding]::UTF8)
                }

                $respBytes = [System.Text.Encoding]::UTF8.GetBytes($updatedJson)
                $response.ContentLength64 = $respBytes.Length
                $response.OutputStream.Write($respBytes, 0, $respBytes.Length)
                $response.Close()
                return
            }

            if ($request.HttpMethod -eq "DELETE") {
                $body = Get-RequestBody $request

                $delId = $null
                if ($body) {
                    try {
                        $delObj = $body | ConvertFrom-Json
                        if ($delObj -and $delObj.id) { $delId = $delObj.id.ToString() }
                    } catch {}
                }
                if (-not $delId -and $request.QueryString["id"]) {
                    $delId = $request.QueryString["id"].ToString()
                }

                $feedsList = New-Object System.Collections.ArrayList
                if (Test-Path $noticiasFile) {
                    $raw = [System.IO.File]::ReadAllText($noticiasFile, [System.Text.Encoding]::UTF8).Trim()
                    if (-not [string]::IsNullOrWhiteSpace($raw)) {
                        $arr = $raw | ConvertFrom-Json
                        foreach ($it in $arr) {
                            if ($it.id.ToString() -ne $delId) {
                                $feedsList.Add($it) | Out-Null
                            }
                        }
                    }
                }

                $updatedJson = $feedsList | ConvertTo-Json -Depth 10
                [System.IO.File]::WriteAllText($noticiasFile, $updatedJson, [System.Text.Encoding]::UTF8)

                $respBytes = [System.Text.Encoding]::UTF8.GetBytes($updatedJson)
                $response.ContentLength64 = $respBytes.Length
                $response.OutputStream.Write($respBytes, 0, $respBytes.Length)
                $response.Close()
                return
            }
        }

        # 2.7 REST API: /api/notificacoes
        if ($urlPath -eq "api/notificacoes" -or $urlPath -eq "api/notificacoes/") {
            $response.Headers.Add("Access-Control-Allow-Origin", "*")
            $response.Headers.Add("Cache-Control", "no-cache, no-store, must-revalidate")
            $response.ContentType = "application/json; charset=utf-8"

            $notifFile = Join-Path $root "data\notificacoes.json"

            if ($request.HttpMethod -eq "GET") {
                $userEmailParam = $null
                if ($request.QueryString["userEmail"]) { $userEmailParam = $request.QueryString["userEmail"].ToString().Trim().ToLower() }
                elseif ($request.QueryString["email"]) { $userEmailParam = $request.QueryString["email"].ToString().Trim().ToLower() }

                if (Test-Path $notifFile) {
                    $raw = [System.IO.File]::ReadAllText($notifFile, [System.Text.Encoding]::UTF8).Trim()
                    if (-not [string]::IsNullOrWhiteSpace($raw)) {
                        $parsedArr = $raw | ConvertFrom-Json
                        $filteredNotifs = New-Object System.Collections.ArrayList
                        foreach ($n in $parsedArr) {
                            $isOracao = ($n.tipo -and $n.tipo.ToString().ToLower() -eq "oracao")
                            if (-not $isOracao) {
                                # Notícias do feed e anúncios: TODOS recebem (incluindo admin)
                                $filteredNotifs.Add($n) | Out-Null
                            } else {
                                # Lembrete de oração: APENAS o usuário cadastrado específico que solicitou!
                                $target = ""
                                if ($n.targetUserEmail) { $target = $n.targetUserEmail.ToString().Trim().ToLower() }
                                elseif ($n.userEmail) { $target = $n.userEmail.ToString().Trim().ToLower() }
                                
                                if ($userEmailParam -and $target -eq $userEmailParam) {
                                    $filteredNotifs.Add($n) | Out-Null
                                }
                            }
                        }
                        $jsonBytes = [System.Text.Encoding]::UTF8.GetBytes(($filteredNotifs | ConvertTo-Json -Depth 10))
                    } else {
                        $jsonBytes = [System.Text.Encoding]::UTF8.GetBytes("[]")
                    }
                } else {
                    $jsonBytes = [System.Text.Encoding]::UTF8.GetBytes("[]")
                }
                $response.ContentLength64 = $jsonBytes.Length
                $response.OutputStream.Write($jsonBytes, 0, $jsonBytes.Length)
                $response.Close()
                return
            }

            if ($request.HttpMethod -eq "POST") {
                $body = Get-RequestBody $request

                $notifsList = New-Object System.Collections.ArrayList
                if (Test-Path $notifFile) {
                    $notifRaw = [System.IO.File]::ReadAllText($notifFile, [System.Text.Encoding]::UTF8).Trim()
                    if (-not [string]::IsNullOrWhiteSpace($notifRaw)) {
                        $nArr = $notifRaw | ConvertFrom-Json
                        foreach ($nit in $nArr) { $notifsList.Add($nit) | Out-Null }
                    }
                }

                $newNotif = $body | ConvertFrom-Json
                if (-not $newNotif.id) {
                    $newNotif | Add-Member -MemberType NoteProperty -Name "id" -Value ("notify-" + [Guid]::NewGuid().ToString().Substring(0, 8)) -Force
                }
                if (-not $newNotif.dateTime) {
                    $nowTs = [Math]::Floor([double]([DateTimeOffset]::UtcNow.ToUnixTimeSeconds()))
                    $newNotif | Add-Member -MemberType NoteProperty -Name "dateTime" -Value $nowTs -Force
                }
                $notifsList.Insert(0, $newNotif)

                if ($notifsList.Count -gt 50) {
                    $notifsList = New-Object System.Collections.ArrayList(@($notifsList | Select-Object -First 50))
                }

                $notifJson = $notifsList | ConvertTo-Json -Depth 10
                [System.IO.File]::WriteAllText($notifFile, $notifJson, [System.Text.Encoding]::UTF8)

                $respBytes = [System.Text.Encoding]::UTF8.GetBytes($notifJson)
                $response.ContentLength64 = $respBytes.Length
                $response.OutputStream.Write($respBytes, 0, $respBytes.Length)
                $response.Close()
                return
            }
        }

        # 2.75 REST API: /api/oracoes/agenda (Lembretes e Agenda de Orações)
        if ($urlPath -eq "api/oracoes/agenda" -or $urlPath -eq "api/oracoes/agenda/") {
            $response.Headers.Add("Access-Control-Allow-Origin", "*")
            $response.Headers.Add("Cache-Control", "no-cache, no-store, must-revalidate")
            $response.ContentType = "application/json; charset=utf-8"

            $agendaFile = Join-Path $root "data\oracoes_agenda.json"

            if ($request.HttpMethod -eq "GET") {
                $userEmailParam = $null
                if ($request.QueryString["userEmail"]) { $userEmailParam = $request.QueryString["userEmail"].ToString().Trim().ToLower() }
                elseif ($request.QueryString["email"]) { $userEmailParam = $request.QueryString["email"].ToString().Trim().ToLower() }

                if (Test-Path $agendaFile) {
                    $raw = [System.IO.File]::ReadAllText($agendaFile, [System.Text.Encoding]::UTF8).Trim()
                    if (-not [string]::IsNullOrWhiteSpace($raw)) {
                        $parsed = $raw | ConvertFrom-Json
                        $userAgenda = New-Object System.Collections.ArrayList
                        foreach ($it in $parsed) {
                            $itemEmail = ""
                            if ($it.userEmail) { $itemEmail = $it.userEmail.ToString().Trim().ToLower() }
                            if (-not $userEmailParam -or $itemEmail -eq $userEmailParam) {
                                $userAgenda.Add($it) | Out-Null
                            }
                        }
                        $jsonBytes = [System.Text.Encoding]::UTF8.GetBytes(($userAgenda | ConvertTo-Json -Depth 10))
                    } else {
                        $jsonBytes = [System.Text.Encoding]::UTF8.GetBytes("[]")
                    }
                } else {
                    $jsonBytes = [System.Text.Encoding]::UTF8.GetBytes("[]")
                }
                $response.ContentLength64 = $jsonBytes.Length
                $response.OutputStream.Write($jsonBytes, 0, $jsonBytes.Length)
                $response.Close()
                return
            }

            if ($request.HttpMethod -eq "POST") {
                $body = Get-RequestBody $request

                $item = $body | ConvertFrom-Json
                $agendaList = New-Object System.Collections.ArrayList
                if (Test-Path $agendaFile) {
                    $raw = [System.IO.File]::ReadAllText($agendaFile, [System.Text.Encoding]::UTF8).Trim()
                    if (-not [string]::IsNullOrWhiteSpace($raw)) {
                        $parsed = $raw | ConvertFrom-Json
                        foreach ($it in $parsed) { $agendaList.Add($it) | Out-Null }
                    }
                }

                if (-not $item.id) {
                    $item | Add-Member -MemberType NoteProperty -Name "id" -Value ("agenda-" + [Guid]::NewGuid().ToString().Substring(0, 8)) -Force
                }

                $existsIdx = -1
                for ($i = 0; $i -lt $agendaList.Count; $i++) {
                    $sameOracao = ($item.oracaoId -and $agendaList[$i].oracaoId -and $agendaList[$i].oracaoId.ToString() -eq $item.oracaoId.ToString())
                    $sameUser = ($item.userEmail -and $agendaList[$i].userEmail -and $agendaList[$i].userEmail.ToString().ToLower() -eq $item.userEmail.ToString().ToLower())
                    if ($sameOracao -and $sameUser) {
                        $existsIdx = $i
                        break
                    }
                }

                if ($existsIdx -ge 0) {
                    $agendaList[$existsIdx] = $item
                } else {
                    $agendaList.Add($item) | Out-Null
                }

                $updatedJson = $agendaList | ConvertTo-Json -Depth 10
                [System.IO.File]::WriteAllText($agendaFile, $updatedJson, [System.Text.Encoding]::UTF8)

                $respBytes = [System.Text.Encoding]::UTF8.GetBytes($updatedJson)
                $response.ContentLength64 = $respBytes.Length
                $response.OutputStream.Write($respBytes, 0, $respBytes.Length)
                $response.Close()
                return
            }

            if ($request.HttpMethod -eq "DELETE") {
                $delId = $request.QueryString["id"]
                $delUserEmail = $null
                if ($request.QueryString["userEmail"]) { $delUserEmail = $request.QueryString["userEmail"].ToString().Trim().ToLower() }

                $agendaList = New-Object System.Collections.ArrayList
                if (Test-Path $agendaFile) {
                    $raw = [System.IO.File]::ReadAllText($agendaFile, [System.Text.Encoding]::UTF8).Trim()
                    if (-not [string]::IsNullOrWhiteSpace($raw)) {
                        $parsed = $raw | ConvertFrom-Json
                        foreach ($it in $parsed) {
                            $matchId = ($delId -and ($it.id.ToString() -eq $delId.ToString() -or ($it.oracaoId -and $it.oracaoId.ToString() -eq $delId.ToString())))
                            $matchUser = (-not $delUserEmail) -or ($it.userEmail -and $it.userEmail.ToString().ToLower() -eq $delUserEmail)
                            if (-not ($matchId -and $matchUser)) {
                                $agendaList.Add($it) | Out-Null
                            }
                        }
                    }
                }

                $updatedJson = $agendaList | ConvertTo-Json -Depth 10
                [System.IO.File]::WriteAllText($agendaFile, $updatedJson, [System.Text.Encoding]::UTF8)

                $respBytes = [System.Text.Encoding]::UTF8.GetBytes($updatedJson)
                $response.ContentLength64 = $respBytes.Length
                $response.OutputStream.Write($respBytes, 0, $respBytes.Length)
                $response.Close()
                return
            }
        }

        # 2.8 REST API: /api/formacoes (Formacoes em Video e Texto centralizadas)
        if ($urlPath -eq "api/formacoes" -or $urlPath -eq "api/formacoes/") {
            $response.Headers.Add("Access-Control-Allow-Origin", "*")
            $response.Headers.Add("Cache-Control", "no-cache, no-store, must-revalidate")
            $response.ContentType = "application/json; charset=utf-8"

            $formacoesFile = Join-Path $root "data\formacoes.json"

            if ($request.HttpMethod -eq "GET") {
                if (Test-Path $formacoesFile) {
                    $raw = [System.IO.File]::ReadAllText($formacoesFile, [System.Text.Encoding]::UTF8).Trim()
                    $jsonBytes = [System.Text.Encoding]::UTF8.GetBytes($raw)
                } else {
                    $jsonBytes = [System.Text.Encoding]::UTF8.GetBytes('{"videos":[],"textos":[]}')
                }
                $response.ContentLength64 = $jsonBytes.Length
                $response.OutputStream.Write($jsonBytes, 0, $jsonBytes.Length)
                $response.Close()
                return
            }

            if ($request.HttpMethod -eq "POST") {
                $body = Get-RequestBody $request

                $postData = $body | ConvertFrom-Json
                $tipo = if ($postData.tipo) { $postData.tipo.ToString().ToLower() } else { "texto" }
                $item = if ($postData.item) { $postData.item } else { $postData }

                if (-not $item.id) {
                    $genId = "formacao-" + $tipo + "-" + [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
                    $item | Add-Member -MemberType NoteProperty -Name "id" -Value $genId -Force
                }

                $dataObj = @{ videos = @(); textos = @() }
                if (Test-Path $formacoesFile) {
                    $raw = [System.IO.File]::ReadAllText($formacoesFile, [System.Text.Encoding]::UTF8).Trim()
                    if (-not [string]::IsNullOrWhiteSpace($raw)) {
                        $parsed = $raw | ConvertFrom-Json
                        if ($parsed.videos) { $dataObj.videos = $parsed.videos }
                        if ($parsed.textos) { $dataObj.textos = $parsed.textos }
                    }
                }

                $targetList = New-Object System.Collections.ArrayList
                if ($tipo -eq "video") {
                    foreach ($v in $dataObj.videos) { $targetList.Add($v) | Out-Null }
                } else {
                    foreach ($t in $dataObj.textos) { $targetList.Add($t) | Out-Null }
                }

                $existingIdx = -1
                for ($i = 0; $i -lt $targetList.Count; $i++) {
                    if ($targetList[$i].id.ToString() -eq $item.id.ToString()) {
                        $existingIdx = $i
                        break
                    }
                }

                if ($existingIdx -ge 0) {
                    $targetList[$existingIdx] = $item
                } else {
                    $targetList.Insert(0, $item)
                }

                if ($tipo -eq "video") {
                    $dataObj.videos = $targetList
                } else {
                    $dataObj.textos = $targetList
                }

                $updatedJson = $dataObj | ConvertTo-Json -Depth 10
                [System.IO.File]::WriteAllText($formacoesFile, $updatedJson, [System.Text.Encoding]::UTF8)

                $respBytes = [System.Text.Encoding]::UTF8.GetBytes($updatedJson)
                $response.ContentLength64 = $respBytes.Length
                $response.OutputStream.Write($respBytes, 0, $respBytes.Length)
                $response.Close()
                return
            }

            if ($request.HttpMethod -eq "DELETE") {
                $delId = $request.QueryString["id"]

                $dataObj = @{ videos = @(); textos = @() }
                if (Test-Path $formacoesFile) {
                    $raw = [System.IO.File]::ReadAllText($formacoesFile, [System.Text.Encoding]::UTF8).Trim()
                    if (-not [string]::IsNullOrWhiteSpace($raw)) {
                        $parsed = $raw | ConvertFrom-Json
                        if ($parsed.videos) { $dataObj.videos = $parsed.videos }
                        if ($parsed.textos) { $dataObj.textos = $parsed.textos }
                    }
                }

                if ($delId) {
                    $vList = New-Object System.Collections.ArrayList
                    foreach ($v in $dataObj.videos) {
                        if ($v.id.ToString() -ne $delId.ToString()) { $vList.Add($v) | Out-Null }
                    }
                    $tList = New-Object System.Collections.ArrayList
                    foreach ($t in $dataObj.textos) {
                        if ($t.id.ToString() -ne $delId.ToString()) { $tList.Add($t) | Out-Null }
                    }
                    $dataObj.videos = $vList
                    $dataObj.textos = $tList
                    $updatedJson = $dataObj | ConvertTo-Json -Depth 10
                    [System.IO.File]::WriteAllText($formacoesFile, $updatedJson, [System.Text.Encoding]::UTF8)
                }

                $respBytes = [System.Text.Encoding]::UTF8.GetBytes('{"success":true}')
                $response.ContentLength64 = $respBytes.Length
                $response.OutputStream.Write($respBytes, 0, $respBytes.Length)
                $response.Close()
                return
            }
        }

        # 2.9 REST API: /api/pedidosOracao (Mural de Pedidos de Oração com Sigilo Total e Moderação)
        if ($urlPath -eq "api/pedidosOracao" -or $urlPath -eq "api/pedidosOracao/" -or $urlPath.StartsWith("api/pedidosOracao")) {
            $response.Headers.Add("Access-Control-Allow-Origin", "*")
            $response.Headers.Add("Cache-Control", "no-cache, no-store, must-revalidate")
            $response.ContentType = "application/json; charset=utf-8"

            $pedidosFile = Join-Path $root "data\pedidosOracao.json"

            if ($request.HttpMethod -eq "GET") {
                $pedidosList = New-Object System.Collections.ArrayList
                if (Test-Path $pedidosFile) {
                    $raw = [System.IO.File]::ReadAllText($pedidosFile, [System.Text.Encoding]::UTF8).Trim()
                    if (-not [string]::IsNullOrWhiteSpace($raw) -and $raw -ne "[]") {
                        $parsed = $raw | ConvertFrom-Json
                        $items = if ($parsed -is [System.Array]) { $parsed } else { @($parsed) }
                        foreach ($it in $items) {
                            if ($null -ne $it -and $it.id) { $pedidosList.Add($it) | Out-Null }
                        }
                    }
                }
                $arrJson = Format-AsJsonArray $pedidosList
                $jsonBytes = [System.Text.Encoding]::UTF8.GetBytes($arrJson)
                $response.ContentLength64 = $jsonBytes.Length
                $response.OutputStream.Write($jsonBytes, 0, $jsonBytes.Length)
                $response.Close()
                return
            }

            if ($request.HttpMethod -eq "POST") {
                $body = Get-RequestBody $request

                $pedidosList = New-Object System.Collections.ArrayList
                if (Test-Path $pedidosFile) {
                    $raw = [System.IO.File]::ReadAllText($pedidosFile, [System.Text.Encoding]::UTF8).Trim()
                    if (-not [string]::IsNullOrWhiteSpace($raw) -and $raw -ne "[]") {
                        $parsed = $raw | ConvertFrom-Json
                        $items = if ($parsed -is [System.Array]) { $parsed } else { @($parsed) }
                        foreach ($it in $items) {
                            if ($null -ne $it -and $it.id) { $pedidosList.Add($it) | Out-Null }
                        }
                    }
                }

                $payload = $body | ConvertFrom-Json

                # Se for incremento de intercessao ("rezar por este irmao")
                if ($payload.action -eq "rezar" -or $payload.op -eq "rezar") {
                    $pId = $payload.id.ToString().Trim()
                    foreach ($p in $pedidosList) {
                        if ($p.id.ToString().Trim() -eq $pId) {
                            $curInt = 0
                            if ($p.intercessoes) { $curInt = [int]$p.intercessoes }
                            $p.intercessoes = $curInt + 1
                            break
                        }
                    }
                    $novoPedido = $null
                } else {
                    # Novo Pedido de Oração
                    # SIGILO TOTAL: Se for anônimo, NUNCA grava dados identificáveis (nome pessoal, foto, e-mail)
                    $isAnonimo = [bool]($payload.anonimo -eq $true)
                    $textoConteudo = ""
                    if ($payload.pedido) { $textoConteudo = $payload.pedido.ToString() }
                    elseif ($payload.texto) { $textoConteudo = $payload.texto.ToString() }

                    $novoPedido = [PSCustomObject]@{
                        id = "pedido-" + [Guid]::NewGuid().ToString().Substring(0, 8)
                        pedido = $textoConteudo
                        anonimo = $isAnonimo
                        nome = if ($isAnonimo) { "Irmao(a) em Cristo (Anonimo)" } else { $payload.nome }
                        foto = if ($isAnonimo) { "" } else { $payload.foto }
                        intercessoes = 0
                        dateTime = [Math]::Floor([double]([DateTimeOffset]::UtcNow.ToUnixTimeSeconds()))
                        dataCadastro = "Hoje as " + (Get-Date -Format "HH:mm")
                    }
                    $pedidosList.Insert(0, $novoPedido)
                }

                $savedJson = Format-AsJsonArray $pedidosList
                [System.IO.File]::WriteAllText($pedidosFile, $savedJson, [System.Text.Encoding]::UTF8)

                $respObj = [PSCustomObject]@{
                    success = $true
                    pedido = $novoPedido
                    pedidos = $pedidosList
                }
                $respJson = $respObj | ConvertTo-Json -Depth 10
                $respBytes = [System.Text.Encoding]::UTF8.GetBytes($respJson)
                $response.ContentLength64 = $respBytes.Length
                $response.OutputStream.Write($respBytes, 0, $respBytes.Length)
                $response.Close()
                return
            }

            if ($request.HttpMethod -eq "DELETE") {
                $body = Get-RequestBody $request

                $delId = $null
                if ($body) {
                    try {
                        $delObj = $body | ConvertFrom-Json
                        if ($delObj -and $delObj.id) { $delId = $delObj.id.ToString().Trim() }
                    } catch {}
                }
                if (-not $delId -and $request.QueryString["id"]) {
                    $delId = $request.QueryString["id"].ToString().Trim()
                }

                $pedidosList = New-Object System.Collections.ArrayList
                if (Test-Path $pedidosFile) {
                    $raw = [System.IO.File]::ReadAllText($pedidosFile, [System.Text.Encoding]::UTF8).Trim()
                    if (-not [string]::IsNullOrWhiteSpace($raw) -and $raw -ne "[]") {
                        $parsed = $raw | ConvertFrom-Json
                        $items = if ($parsed -is [System.Array]) { $parsed } else { @($parsed) }
                        foreach ($it in $items) {
                            if ($null -ne $it -and $it.id) {
                                # Só ignora estritamente o comentário com o id selecionado para exclusão!
                                if ($delId -and ($it.id.ToString().Trim() -eq $delId)) {
                                    # Removido pelo administrador - não adiciona
                                } else {
                                    $pedidosList.Add($it) | Out-Null
                                }
                            }
                        }
                    }
                }

                $savedJson = Format-AsJsonArray $pedidosList
                [System.IO.File]::WriteAllText($pedidosFile, $savedJson, [System.Text.Encoding]::UTF8)

                $respObj = [PSCustomObject]@{
                    success = $true
                    deletedId = $delId
                    pedidos = $pedidosList
                }
                $respJson = $respObj | ConvertTo-Json -Depth 10
                $respBytes = [System.Text.Encoding]::UTF8.GetBytes($respJson)
                $response.ContentLength64 = $respBytes.Length
                $response.OutputStream.Write($respBytes, 0, $respBytes.Length)
                $response.Close()
                return
            }
        }

        # 2.96 REST API: /api/musicas (Músicas, Louvores, Shows JS e Comentários)
        if ($urlPath -eq "api/musicas" -or $urlPath -eq "api/musicas/" -or $urlPath.StartsWith("api/musicas")) {
            $musicasFile = Join-Path $root "data\musicas.json"

            if ($request.HttpMethod -eq "OPTIONS") {
                $response.StatusCode = 200
                $response.Headers.Add("Access-Control-Allow-Origin", "*")
                $response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
                $response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
                $response.Close()
                return
            }

            if ($request.HttpMethod -eq "GET") {
                $response.ContentType = "application/json; charset=utf-8"
                $response.Headers.Add("Access-Control-Allow-Origin", "*")
                $response.Headers.Add("Cache-Control", "no-cache, no-store, must-revalidate")

                if (Test-Path $musicasFile) {
                    $raw = [System.IO.File]::ReadAllText($musicasFile, [System.Text.Encoding]::UTF8)
                } else {
                    $raw = '{"musicas":[]}'
                }
                $respBytes = [System.Text.Encoding]::UTF8.GetBytes($raw)
                $response.ContentLength64 = $respBytes.Length
                $response.OutputStream.Write($respBytes, 0, $respBytes.Length)
                $response.Close()
                return
            }

            if ($request.HttpMethod -eq "POST") {
                $response.ContentType = "application/json; charset=utf-8"
                $response.Headers.Add("Access-Control-Allow-Origin", "*")
                $response.Headers.Add("Cache-Control", "no-cache, no-store, must-revalidate")

                $body = Get-RequestBody $request
                if ($body) {
                    try {
                        $payload = $body | ConvertFrom-Json
                        $currentData = if (Test-Path $musicasFile) {
                            [System.IO.File]::ReadAllText($musicasFile, [System.Text.Encoding]::UTF8) | ConvertFrom-Json
                        } else {
                            [PSCustomObject]@{ musicas = @() }
                        }

                        if ($payload.action -eq "comentar") {
                            # Adicionar comentário em música específica
                            $musica = $currentData.musicas | Where-Object { $_.id -eq $payload.musicaId } | Select-Object -First 1
                            if ($musica) {
                                if (-not $musica.comentarios) {
                                    $musica | Add-Member -MemberType NoteProperty -Name "comentarios" -Value @() -Force
                                }
                                $novoComentario = $payload.comentario
                                $cList = [System.Collections.ArrayList]@($musica.comentarios)
                                $cList.Add($novoComentario) | Out-Null
                                $musica.comentarios = $cList
                            }
                        }
                        elseif ($payload.action -eq "excluirComentario") {
                            # Exclusão cirúrgica de um único comentário (somente autor ou admin)
                            $musica = $currentData.musicas | Where-Object { $_.id -eq $payload.musicaId } | Select-Object -First 1
                            if ($musica -and $musica.comentarios) {
                                $cList = [System.Collections.ArrayList]@($musica.comentarios)
                                $itemToRemove = $null
                                foreach ($c in $cList) {
                                    if ($c.id -eq $payload.comentarioId) {
                                        if ($payload.isAdmin -or $c.usuarioId -eq $payload.usuarioId) {
                                            $itemToRemove = $c
                                            break
                                        }
                                    }
                                }
                                if ($itemToRemove) {
                                    $cList.Remove($itemToRemove)
                                    $musica.comentarios = $cList
                                }
                            }
                        }
                        elseif ($payload.action -eq "adicionarMusica") {
                            # Administrador adicionando nova música / show
                            $mList = [System.Collections.ArrayList]@($currentData.musicas)
                            $novaMusica = $payload.musica
                            if (-not $novaMusica.id) {
                                $novaMusica | Add-Member -MemberType NoteProperty -Name "id" -Value ("js-mus-" + (Get-Date).Ticks) -Force
                            }
                            if (-not $novaMusica.comentarios) {
                                $novaMusica | Add-Member -MemberType NoteProperty -Name "comentarios" -Value @() -Force
                            }
                            $mList.Add($novaMusica) | Out-Null
                            $currentData.musicas = $mList
                        }
                        elseif ($payload.action -eq "editarMusica") {
                            # Administrador editando música existente
                            $idx = -1
                            for ($i = 0; $i -lt $currentData.musicas.Count; $i++) {
                                if ($currentData.musicas[$i].id -eq $payload.musica.id) {
                                    $idx = $i
                                    break
                                }
                            }
                            if ($idx -ge 0) {
                                $oldComms = $currentData.musicas[$idx].comentarios
                                $payload.musica.comentarios = $oldComms
                                $currentData.musicas[$idx] = $payload.musica
                            }
                        }
                        elseif ($payload.action -eq "excluirMusica") {
                            # Administrador excluindo música
                            $mList = [System.Collections.ArrayList]@($currentData.musicas)
                            $toRem = $null
                            foreach ($m in $mList) {
                                if ($m.id -eq $payload.musicaId) {
                                    $toRem = $m
                                    break
                                }
                            }
                            if ($toRem) {
                                $mList.Remove($toRem)
                                $currentData.musicas = $mList
                            }
                        }
                        elseif ($payload.musicas) {
                            $currentData = $payload
                        }

                        $formattedJson = $currentData | ConvertTo-Json -Depth 15
                        [System.IO.File]::WriteAllText($musicasFile, $formattedJson, [System.Text.Encoding]::UTF8)

                        $respObj = [PSCustomObject]@{
                            success = $true
                            data = $currentData
                        }
                    } catch {
                        $respObj = [PSCustomObject]@{
                            success = $false
                            error = $_.Exception.Message
                        }
                    }
                } else {
                    $respObj = [PSCustomObject]@{
                        success = $false
                        error = "Corpo vazio"
                    }
                }

                $respJson = $respObj | ConvertTo-Json -Depth 10
                $respBytes = [System.Text.Encoding]::UTF8.GetBytes($respJson)
                $response.ContentLength64 = $respBytes.Length
                $response.OutputStream.Write($respBytes, 0, $respBytes.Length)
                $response.Close()
                return
            }
        }

        # 2.95 REST API: /api/quemSomos (Conteúdo Dinâmico Institucional Quem Somos)
        if ($urlPath -eq "api/quemSomos" -or $urlPath -eq "api/quemSomos/") {
            $quemSomosFile = Join-Path $root "data\quemSomos.json"

            if ($request.HttpMethod -eq "OPTIONS") {
                $response.StatusCode = 200
                $response.Headers.Add("Access-Control-Allow-Origin", "*")
                $response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
                $response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
                $response.Close()
                return
            }

            if ($request.HttpMethod -eq "GET") {
                $response.ContentType = "application/json; charset=utf-8"
                $response.Headers.Add("Access-Control-Allow-Origin", "*")
                $response.Headers.Add("Cache-Control", "no-cache, no-store, must-revalidate")

                if (Test-Path $quemSomosFile) {
                    $raw = [System.IO.File]::ReadAllText($quemSomosFile, [System.Text.Encoding]::UTF8)
                } else {
                    $raw = "{}"
                }
                $respBytes = [System.Text.Encoding]::UTF8.GetBytes($raw)
                $response.ContentLength64 = $respBytes.Length
                $response.OutputStream.Write($respBytes, 0, $respBytes.Length)
                $response.Close()
                return
            }

            if ($request.HttpMethod -eq "POST") {
                $response.ContentType = "application/json; charset=utf-8"
                $response.Headers.Add("Access-Control-Allow-Origin", "*")
                $response.Headers.Add("Cache-Control", "no-cache, no-store, must-revalidate")

                $body = Get-RequestBody $request
                if ($body) {
                    try {
                        # Validate JSON
                        $parsed = $body | ConvertFrom-Json
                        $formattedJson = $parsed | ConvertTo-Json -Depth 15
                        [System.IO.File]::WriteAllText($quemSomosFile, $formattedJson, [System.Text.Encoding]::UTF8)
                        $respObj = [PSCustomObject]@{
                            success = $true
                            data = $parsed
                        }
                    } catch {
                        $respObj = [PSCustomObject]@{
                            success = $false
                            error = $_.Exception.Message
                        }
                    }
                } else {
                    $respObj = [PSCustomObject]@{
                        success = $false
                        error = "Corpo vazio"
                    }
                }

                $respJson = $respObj | ConvertTo-Json -Depth 10
                $respBytes = [System.Text.Encoding]::UTF8.GetBytes($respJson)
                $response.ContentLength64 = $respBytes.Length
                $response.OutputStream.Write($respBytes, 0, $respBytes.Length)
                $response.Close()
                return
            }
        }

        # 2.955 REST API: /api/guiaCatequetico (Conteúdo Dinâmico e Editável do Guia Catequético)
        if ($urlPath -eq "api/guiaCatequetico" -or $urlPath -eq "api/guiaCatequetico/" -or $urlPath -eq "api/guia-catequetico") {
            $guiaFile = Join-Path $root "data\guiaCatequetico.json"

            if ($request.HttpMethod -eq "OPTIONS") {
                $response.StatusCode = 200
                $response.Headers.Add("Access-Control-Allow-Origin", "*")
                $response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
                $response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
                $response.Close()
                return
            }

            if ($request.HttpMethod -eq "GET") {
                $response.ContentType = "application/json; charset=utf-8"
                $response.Headers.Add("Access-Control-Allow-Origin", "*")
                $response.Headers.Add("Cache-Control", "no-cache, no-store, must-revalidate")

                if (Test-Path $guiaFile) {
                    $raw = [System.IO.File]::ReadAllText($guiaFile, [System.Text.Encoding]::UTF8)
                } else {
                    $raw = "{}"
                }
                $respBytes = [System.Text.Encoding]::UTF8.GetBytes($raw)
                $response.ContentLength64 = $respBytes.Length
                $response.OutputStream.Write($respBytes, 0, $respBytes.Length)
                $response.Close()
                return
            }

            if ($request.HttpMethod -eq "POST") {
                $response.ContentType = "application/json; charset=utf-8"
                $response.Headers.Add("Access-Control-Allow-Origin", "*")
                $response.Headers.Add("Cache-Control", "no-cache, no-store, must-revalidate")

                $body = Get-RequestBody $request
                if ($body) {
                    try {
                        $parsed = $body | ConvertFrom-Json
                        $formattedJson = $parsed | ConvertTo-Json -Depth 15
                        [System.IO.File]::WriteAllText($guiaFile, $formattedJson, [System.Text.Encoding]::UTF8)
                        $respObj = [PSCustomObject]@{
                            success = $true
                            data = $parsed
                        }
                    } catch {
                        $respObj = [PSCustomObject]@{
                            success = $false
                            error = $_.Exception.Message
                        }
                    }
                } else {
                    $respObj = [PSCustomObject]@{
                        success = $false
                        error = "Corpo vazio"
                    }
                }

                $respJson = $respObj | ConvertTo-Json -Depth 10
                $respBytes = [System.Text.Encoding]::UTF8.GetBytes($respJson)
                $response.ContentLength64 = $respBytes.Length
                $response.OutputStream.Write($respBytes, 0, $respBytes.Length)
                $response.Close()
                return
            }
        }

        # 2.97 REST API: /api/missoes (Missões JS, Atualização e Sincronização)
        if ($urlPath -eq "api/missoes" -or $urlPath -eq "api/missoes/" -or $urlPath.StartsWith("api/missoes")) {
            $missoesFile = Join-Path $root "data\missoes.json"
            $missoesJsFile = Join-Path $root "js\missoes-data.json"
            $missoesJsCode = Join-Path $root "js\missoes-data.js"
            $xlsxFile = Join-Path $root "missoes_download.xlsx"

            if ($request.HttpMethod -eq "OPTIONS") {
                $response.StatusCode = 200
                $response.Headers.Add("Access-Control-Allow-Origin", "*")
                $response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
                $response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
                $response.Close()
                return
            }

            if ($request.HttpMethod -eq "GET") {
                $response.ContentType = "application/json; charset=utf-8"
                $response.Headers.Add("Access-Control-Allow-Origin", "*")
                $response.Headers.Add("Cache-Control", "no-cache, no-store, must-revalidate")

                $target = if (Test-Path $missoesFile) { $missoesFile } else { $missoesJsFile }
                if (Test-Path $target) {
                    $raw = [System.IO.File]::ReadAllText($target, [System.Text.Encoding]::UTF8)
                } else {
                    $raw = "[]"
                }
                $respBytes = [System.Text.Encoding]::UTF8.GetBytes($raw)
                $response.ContentLength64 = $respBytes.Length
                $response.OutputStream.Write($respBytes, 0, $respBytes.Length)
                $response.Close()
                return
            }

            if ($request.HttpMethod -eq "POST") {
                $response.ContentType = "application/json; charset=utf-8"
                $response.Headers.Add("Access-Control-Allow-Origin", "*")
                $response.Headers.Add("Cache-Control", "no-cache, no-store, must-revalidate")

                $body = Get-RequestBody $request
                if ($body) {
                    try {
                        $payload = $body | ConvertFrom-Json
                        $target = if (Test-Path $missoesFile) { $missoesFile } else { $missoesJsFile }
                        $currentData = if (Test-Path $target) {
                            [System.IO.File]::ReadAllText($target, [System.Text.Encoding]::UTF8) | ConvertFrom-Json
                        } else {
                            @()
                        }

                        $mList = [System.Collections.ArrayList]@($currentData)

                        if ($payload.action -eq "editarMissao") {
                            # Alterar dados de missão existente (endereço, dia e hora, nome, etc)
                            $editada = $payload.missao
                            $idx = -1
                            for ($i = 0; $i -lt $mList.Count; $i++) {
                                if ([string]$mList[$i].id -eq [string]$editada.id) {
                                    $idx = $i
                                    break
                                }
                            }
                            if ($idx -ge 0) {
                                $mList[$idx] = $editada
                            }
                        }
                        elseif ($payload.action -eq "adicionarMissao") {
                            # Inserir cadastro de nova missão
                            $nova = $payload.missao
                            if (-not $nova.id) {
                                $maxId = 0
                                foreach ($m in $mList) {
                                    if ([int]$m.id -gt $maxId) { $maxId = [int]$m.id }
                                }
                                $nova | Add-Member -MemberType NoteProperty -Name "id" -Value ($maxId + 1) -Force
                            }
                            if (-not $nova.logoUrl) {
                                $nova | Add-Member -MemberType NoteProperty -Name "logoUrl" -Value "img/logo-js-azul-escuro.png" -Force
                            }
                            $mList.Insert(0, $nova)
                        }
                        elseif ($payload.action -eq "excluirMissao") {
                            # Excluir missão
                            $itemRem = $null
                            foreach ($m in $mList) {
                                if ([string]$m.id -eq [string]$payload.missaoId) {
                                    $itemRem = $m
                                    break
                                }
                            }
                            if ($itemRem) {
                                $mList.Remove($itemRem)
                            }
                        }
                        elseif ($payload.action -eq "sincronizarPlanilha") {
                            # Re-sincronizar da planilha oficial com log de atualização
                            # Se novos dados forem passados no payload, usa eles; senão re-lê do json
                            if ($payload.missoesNovas) {
                                $mList = [System.Collections.ArrayList]@($payload.missoesNovas)
                            }
                        }
                        elseif ($payload -is [System.Array]) {
                            $mList = [System.Collections.ArrayList]@($payload)
                        }

                        # Salva nos arquivos
                        $formattedJson = $mList | ConvertTo-Json -Depth 10
                        [System.IO.File]::WriteAllText($missoesFile, $formattedJson, [System.Text.Encoding]::UTF8)
                        [System.IO.File]::WriteAllText($missoesJsFile, $formattedJson, [System.Text.Encoding]::UTF8)
                        $jsCodeStr = "window.JS_MISSOES_DATA = " + $formattedJson + ";"
                        [System.IO.File]::WriteAllText($missoesJsCode, $jsCodeStr, [System.Text.Encoding]::UTF8)

                        $respObj = [PSCustomObject]@{
                            success = $true
                            total = $mList.Count
                            data = $mList
                        }
                    } catch {
                        $respObj = [PSCustomObject]@{
                            success = $false
                            error = $_.Exception.Message
                        }
                    }
                } else {
                    $respObj = [PSCustomObject]@{
                        success = $false
                        error = "Corpo vazio"
                    }
                }

                $respJson = $respObj | ConvertTo-Json -Depth 10
                $respBytes = [System.Text.Encoding]::UTF8.GetBytes($respJson)
                $response.ContentLength64 = $respBytes.Length
                $response.OutputStream.Write($respBytes, 0, $respBytes.Length)
                $response.Close()
                return
            }
        }

        # 2.98 REST API: /api/chat (Bate-papo Geral da Comunidade JS)
        if ($urlPath -eq "api/chat" -or $urlPath -eq "api/chat/" -or $urlPath.StartsWith("api/chat")) {
            $chatFile = Join-Path $root "data\chat.json"

            if ($request.HttpMethod -eq "OPTIONS") {
                $response.StatusCode = 200
                $response.Headers.Add("Access-Control-Allow-Origin", "*")
                $response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, OPTIONS, DELETE")
                $response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
                $response.Close()
                return
            }

            if ($request.HttpMethod -eq "GET") {
                $response.ContentType = "application/json; charset=utf-8"
                $response.Headers.Add("Access-Control-Allow-Origin", "*")
                $response.Headers.Add("Cache-Control", "no-cache, no-store, must-revalidate")

                if (Test-Path $chatFile) {
                    $raw = [System.IO.File]::ReadAllText($chatFile, [System.Text.Encoding]::UTF8)
                } else {
                    $raw = "[]"
                }
                $respBytes = [System.Text.Encoding]::UTF8.GetBytes($raw)
                $response.ContentLength64 = $respBytes.Length
                $response.OutputStream.Write($respBytes, 0, $respBytes.Length)
                $response.Close()
                return
            }

            if ($request.HttpMethod -eq "POST") {
                $response.ContentType = "application/json; charset=utf-8"
                $response.Headers.Add("Access-Control-Allow-Origin", "*")
                $response.Headers.Add("Cache-Control", "no-cache, no-store, must-revalidate")

                $body = Get-RequestBody $request
                if ($body) {
                    try {
                        $payload = $body | ConvertFrom-Json
                        $currentMsgs = if (Test-Path $chatFile) {
                            $r = [System.IO.File]::ReadAllText($chatFile, [System.Text.Encoding]::UTF8)
                            if ($r.Trim()) { @($r | ConvertFrom-Json) } else { @() }
                        } else {
                            @()
                        }
                        $msgList = [System.Collections.ArrayList]@($currentMsgs)

                        if ($payload.action -eq "enviar") {
                            $novaMsg = $payload.mensagem
                            if ($novaMsg) {
                                $id = "chat-" + [System.DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds() + "-" + (Get-Random -Minimum 100 -Maximum 999)
                                $obj = [PSCustomObject]@{
                                    id = $id
                                    data = (Get-Date).ToString("o")
                                    texto = [string]$novaMsg.texto
                                    imagemUrl = [string]$novaMsg.imagemUrl
                                    gifUrl = [string]$novaMsg.gifUrl
                                    emailAutor = [string]$novaMsg.emailAutor
                                    nomeAutor = [string]$novaMsg.nomeAutor
                                    isAdmin = [bool]($novaMsg.isAdmin -or $novaMsg.emailAutor -eq "andre.n1984@gmail.com" -or $novaMsg.emailAutor -eq "admin")
                                }
                                $msgList.Add($obj) | Out-Null

                                if ($msgList.Count -gt 300) {
                                    $msgList.RemoveRange(0, $msgList.Count - 300)
                                }
                            }
                        }
                        elseif ($payload.action -eq "apagar") {
                            $targetId = [string]$payload.msgId
                            $reqEmail = [string]$payload.emailSolicitante
                            $isReqAdmin = [bool]($payload.isAdmin -or $reqEmail -eq "andre.n1984@gmail.com" -or $reqEmail -eq "admin")

                            $itemRemover = $null
                            foreach ($m in $msgList) {
                                if ($m.id -eq $targetId) {
                                    if ($isReqAdmin -or ($m.emailAutor -and $m.emailAutor.ToLower().Trim() -eq $reqEmail.ToLower().Trim())) {
                                        $itemRemover = $m
                                    }
                                    break
                                }
                            }
                            if ($itemRemover) {
                                $msgList.Remove($itemRemover)
                            }
                        }

                        $formattedJson = $msgList | ConvertTo-Json -Depth 10
                        [System.IO.File]::WriteAllText($chatFile, $formattedJson, [System.Text.Encoding]::UTF8)

                        $respObj = [PSCustomObject]@{
                            success = $true
                            total = $msgList.Count
                            data = $msgList
                        }
                    } catch {
                        $respObj = [PSCustomObject]@{
                            success = $false
                            error = $_.Exception.Message
                        }
                    }
                } else {
                    $respObj = [PSCustomObject]@{
                        success = $false
                        error = "Corpo vazio"
                    }
                }

                $respJson = $respObj | ConvertTo-Json -Depth 10
                $respBytes = [System.Text.Encoding]::UTF8.GetBytes($respJson)
                $response.ContentLength64 = $respBytes.Length
                $response.OutputStream.Write($respBytes, 0, $respBytes.Length)
                $response.Close()
                return
            }
        }

        # 2.99 REST API: /api/calendario (Calendário de Atividades, Retiros, Kairós e Eventos JS)
        if ($urlPath -eq "api/calendario" -or $urlPath -eq "api/calendario/" -or $urlPath.StartsWith("api/calendario")) {
            $calFile = Join-Path $root "data\calendario.json"
            $notifFile = Join-Path $root "data\notificacoes.json"

            if ($request.HttpMethod -eq "OPTIONS") {
                $response.StatusCode = 200
                $response.Headers.Add("Access-Control-Allow-Origin", "*")
                $response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, OPTIONS, DELETE")
                $response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
                $response.Close()
                return
            }

            if ($request.HttpMethod -eq "GET") {
                $response.ContentType = "application/json; charset=utf-8"
                $response.Headers.Add("Access-Control-Allow-Origin", "*")
                $response.Headers.Add("Cache-Control", "no-cache, no-store, must-revalidate")

                if (Test-Path $calFile) {
                    $raw = [System.IO.File]::ReadAllText($calFile, [System.Text.Encoding]::UTF8)
                } else {
                    $raw = "[]"
                }
                $respBytes = [System.Text.Encoding]::UTF8.GetBytes($raw)
                $response.ContentLength64 = $respBytes.Length
                $response.OutputStream.Write($respBytes, 0, $respBytes.Length)
                $response.Close()
                return
            }

            if ($request.HttpMethod -eq "POST") {
                $response.ContentType = "application/json; charset=utf-8"
                $response.Headers.Add("Access-Control-Allow-Origin", "*")
                $response.Headers.Add("Cache-Control", "no-cache, no-store, must-revalidate")

                $body = Get-RequestBody $request
                if ($body) {
                    try {
                        $payload = $body | ConvertFrom-Json
                        $currentEvents = if (Test-Path $calFile) {
                            $r = [System.IO.File]::ReadAllText($calFile, [System.Text.Encoding]::UTF8)
                            if ($r.Trim()) { @($r | ConvertFrom-Json) } else { @() }
                        } else {
                            @()
                        }
                        $eventList = [System.Collections.ArrayList]@($currentEvents)

                        if ($payload.action -eq "salvarEvento") {
                            $evt = $payload.evento
                            if ($evt) {
                                $existingIndex = -1
                                for ($i = 0; $i -lt $eventList.Count; $i++) {
                                    if ($evt.id -and $eventList[$i].id -eq $evt.id) {
                                        $existingIndex = $i
                                        break
                                    }
                                }

                                if (-not $evt.id) {
                                    $evt | Add-Member -NotePropertyName "id" -NotePropertyValue ("cal-evt-" + [System.DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()) -Force
                                }

                                if ($existingIndex -ge 0) {
                                    $eventList[$existingIndex] = $evt
                                } else {
                                    $eventList.Add($evt) | Out-Null
                                }
                            }
                        }
                        elseif ($payload.action -eq "excluirEvento") {
                            $targetId = [string]$payload.eventoId
                            $itemRemover = $null
                            foreach ($e in $eventList) {
                                if ($e.id -eq $targetId) {
                                    $itemRemover = $e
                                    break
                                }
                            }
                            if ($itemRemover) {
                                $eventList.Remove($itemRemover)
                            }
                        }
                        elseif ($payload.action -eq "notificarEvento") {
                            # Adiciona alerta oficial na bandeja de Notificações
                            if (Test-Path $notifFile) {
                                $notifsRaw = [System.IO.File]::ReadAllText($notifFile, [System.Text.Encoding]::UTF8)
                                $notifArr = if ($notifsRaw.Trim()) { @($notifsRaw | ConvertFrom-Json) } else { @() }
                                $notifList = [System.Collections.ArrayList]@($notifArr)

                                $badgeText = if ($payload.categoria -eq "kairos") { "Kairós de Missão" } else { "Calendário JS" }
                                $novaNotif = [PSCustomObject]@{
                                    id = "notify-cal-" + (Get-Random -Minimum 10000 -Maximum 99999)
                                    tipo = "evento"
                                    target = "todos"
                                    title = "Lembrete de Calendário JS"
                                    titleInt = [string]$payload.eventoTitulo
                                    body = "Evento: " + [string]$payload.eventoTitulo + " em " + [string]$payload.eventoData + " (" + [string]$payload.eventoLocal + "). Prepare o seu coração!"
                                    badge = $badgeText
                                    dateTime = [int][double]::Parse((Get-Date -UFormat %s))
                                    isViewed = 0
                                    imgThumb = "img/brand/insta-profile-logo.jpg"
                                }
                                $notifList.Insert(0, $novaNotif)
                                $notifJson = $notifList | ConvertTo-Json -Depth 10
                                [System.IO.File]::WriteAllText($notifFile, $notifJson, [System.Text.Encoding]::UTF8)
                            }
                        }

                        $formattedJson = $eventList | ConvertTo-Json -Depth 10
                        [System.IO.File]::WriteAllText($calFile, $formattedJson, [System.Text.Encoding]::UTF8)

                        $respObj = [PSCustomObject]@{
                            success = $true
                            total = $eventList.Count
                            data = $eventList
                        }
                    } catch {
                        $respObj = [PSCustomObject]@{
                            success = $false
                            error = $_.Exception.Message
                        }
                    }
                } else {
                    $respObj = [PSCustomObject]@{
                        success = $false
                        error = "Corpo vazio"
                    }
                }

                $respJson = $respObj | ConvertTo-Json -Depth 10
                $respBytes = [System.Text.Encoding]::UTF8.GetBytes($respJson)
                $response.ContentLength64 = $respBytes.Length
                $response.OutputStream.Write($respBytes, 0, $respBytes.Length)
                $response.Close()
                return
            }
        }

        # 3. Static Files
        $localPath = Join-Path $root ($urlPath -replace '/', '\')

        if (Test-Path $localPath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($localPath).ToLower()
            $mime = if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { "application/octet-stream" }
            $lastWrite = [System.IO.File]::GetLastWriteTimeUtc($localPath)

            if ($fileCache.ContainsKey($localPath) -and $fileCache[$localPath].LastWrite -eq $lastWrite) {
                $cached = $fileCache[$localPath]
                $response.ContentType = $cached.ContentType
                $response.Headers.Add("Access-Control-Allow-Origin", "*")
                $response.Headers.Add("Cache-Control", "no-cache")
                $response.ContentLength64 = $cached.Bytes.Length
                $response.OutputStream.Write($cached.Bytes, 0, $cached.Bytes.Length)
            } else {
                $bytes = [System.IO.File]::ReadAllBytes($localPath)
                if ($bytes.Length -lt 10485760) {
                    $fileCache[$localPath] = @{
                        ContentType = $mime
                        Bytes = $bytes
                        LastWrite = $lastWrite
                    }
                }
                $response.ContentType = $mime
                $response.Headers.Add("Access-Control-Allow-Origin", "*")
                $response.Headers.Add("Cache-Control", "no-cache")
                $response.ContentLength64 = $bytes.Length
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
            }
        } else {
            $response.StatusCode = 404
            $msg = [System.Text.Encoding]::UTF8.GetBytes("Arquivo nao encontrado: $urlPath")
            $response.ContentLength64 = $msg.Length
            $response.OutputStream.Write($msg, 0, $msg.Length)
        }
    } catch {
        # ignore client disconnects
    } finally {
        try {
            if ($context -and $context.Response) {
                $context.Response.Close()
            }
        } catch {}
    }
}

try {
    while ($listener.IsListening) {
        try {
            $context = $listener.GetContext()
            Handle-Context $context
        } catch {
            # continue loop on any error
        }
    }
} finally {
    try { $listener.Stop() } catch {}
    try { $listener.Close() } catch {}
}
