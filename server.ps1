param (
    [int]$Port = 8080
)

$root = $PSScriptRoot
$portsToTry = @($Port, 8081, 8000, 5000, 3000)
$listener = $null
$activePort = $null

foreach ($p in $portsToTry) {
    try {
        $l = New-Object System.Net.HttpListener
        $l.Prefixes.Add("http://localhost:$p/")
        $l.Prefixes.Add("http://127.0.0.1:$p/")
        $l.Start()
        $listener = $l
        $activePort = $p
        break
    } catch {
        if ($l) { try { $l.Close() } catch {} }
    }
}

if (-not $listener) {
    Write-Error "Could not bind to any test ports ($($portsToTry -join ', '))."
    exit 1
}

$url = "http://localhost:$activePort/"
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "  JARVIS'26 Local Web Server Running" -ForegroundColor Green
Write-Host "  Directory: $root" -ForegroundColor Yellow
Write-Host "  Local URL: $url" -ForegroundColor Cyan
Write-Host "  Press Ctrl+C to stop the server." -ForegroundColor Gray
Write-Host "=================================================" -ForegroundColor Cyan

# Open default browser
try {
    Start-Process $url
} catch {
    Write-Warning "Could not automatically launch browser. Please open $url manually."
}

$mimeTypes = @{
    ".html"  = "text/html; charset=utf-8"
    ".htm"   = "text/html; charset=utf-8"
    ".css"   = "text/css; charset=utf-8"
    ".js"    = "application/javascript; charset=utf-8"
    ".png"   = "image/png"
    ".jpg"   = "image/jpeg"
    ".jpeg"  = "image/jpeg"
    ".gif"   = "image/gif"
    ".svg"   = "image/svg+xml"
    ".ico"   = "image/x-icon"
    ".json"  = "application/json; charset=utf-8"
    ".txt"   = "text/plain; charset=utf-8"
    ".woff"  = "font/woff"
    ".woff2" = "font/woff2"
    ".ttf"   = "font/ttf"
}

try {
    while ($listener.IsListening) {
        $context = $null
        try {
            $context = $listener.GetContext()
        } catch {
            break
        }

        if (-not $context) { continue }

        try {
            $request = $context.Request
            $response = $context.Response

            # Support CORS
            $response.AddHeader("Access-Control-Allow-Origin", "*")

            $reqPath = $request.Url.LocalPath
            if ($reqPath -eq "/" -or [string]::IsNullOrWhiteSpace($reqPath)) {
                $reqPath = "/index.html"
            }

            $decoded = [System.Uri]::UnescapeDataString($reqPath.TrimStart('/'))
            $targetPath = Join-Path $root $decoded
            $targetFullPath = [System.IO.Path]::GetFullPath($targetPath)

            # Security: ensure file resides inside root folder
            if (-not $targetFullPath.StartsWith($root, [System.StringComparison]::OrdinalIgnoreCase)) {
                $response.StatusCode = 403
                $response.Close()
                continue
            }

            if (Test-Path $targetFullPath -PathType Leaf) {
                $ext = [System.IO.Path]::GetExtension($targetFullPath).ToLower()
                $mime = if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { "application/octet-stream" }
                $response.ContentType = $mime

                $bytes = [System.IO.File]::ReadAllBytes($targetFullPath)
                $response.ContentLength64 = $bytes.Length
                $response.StatusCode = 200

                if ($request.HttpMethod -ne "HEAD") {
                    $response.OutputStream.Write($bytes, 0, $bytes.Length)
                }
            } else {
                $response.StatusCode = 404
                $msg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $reqPath")
                $response.ContentType = "text/plain; charset=utf-8"
                $response.ContentLength64 = $msg.Length
                if ($request.HttpMethod -ne "HEAD") {
                    $response.OutputStream.Write($msg, 0, $msg.Length)
                }
            }
        } catch {
            # Catch client socket drops, aborted requests, etc.
        } finally {
            try {
                if ($context -and $context.Response) {
                    $context.Response.OutputStream.Flush()
                    $context.Response.Close()
                }
            } catch {}
        }
    }
} finally {
    try {
        $listener.Stop()
        $listener.Close()
    } catch {}
}
