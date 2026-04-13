$app = Get-Content 'app.js' -Raw -Encoding UTF8
$logo = Get-Content 'logo_b64_utf8.txt' -Raw -Encoding UTF8
$logo = $logo.Trim()
$idx = $app.IndexOf("const SUPABASE_URL")
if ($idx -ge 0) {
    $new = "const LOGO_B64 = 'data:image/png;base64," + $logo + "';" + [Environment]::NewLine + $app.Substring($idx)
    [IO.File]::WriteAllText('app.js', $new, [System.Text.Encoding]::UTF8)
    Write-Host "Success"
} else {
    Write-Host "SUPABASE_URL not found"
}
