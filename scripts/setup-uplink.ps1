# End-to-end Uplink credential setup (Turnstile widget + Vercel env vars).
# Prerequisites (browser — tabs opened by setup-uplink-credentials.ps1):
#   1. Cloudflare API token with Account.Turnstile:Edit (+ Read) on account b38e5d6536f4208b8eff37a85180058e
#      Update 1Password item cloudflare-write credential if the token was rotated.
#   2. Google App Password in 1Password item gmail-app-password (ndq3qzvdspc6y5rmvsbvpgzp2m)
#
# Usage: pwsh -File scripts/setup-uplink.ps1

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

$VaultId = "phqzta7t7exkddtreg5o35jdxy"
$AccountId = "b38e5d6536f4208b8eff37a85180058e"
$WidgetName = "viralarchitect.com Uplink"

Write-Host "==> Loading Cloudflare credentials from 1Password..."
$cfToken = op read "op://$VaultId/cloudflare-write/credential"
$headers = @{
  Authorization = "Bearer $cfToken"
  "Content-Type" = "application/json"
}

Write-Host "==> Verifying Cloudflare API token..."
$verify = Invoke-RestMethod -Method Get -Headers @{ Authorization = "Bearer $cfToken" } `
  -Uri "https://api.cloudflare.com/client/v4/user/tokens/verify"
if (-not $verify.success) { throw "Cloudflare token verification failed." }

$listUri = "https://api.cloudflare.com/client/v4/accounts/$AccountId/challenges/widgets"
$list = Invoke-RestMethod -Method Get -Headers $headers -Uri $listUri
$widget = @($list.result | Where-Object { $_.name -eq $WidgetName }) | Select-Object -First 1

if (-not $widget) {
  Write-Host "==> Creating Turnstile widget '$WidgetName'..."
  $body = @{
    name = $WidgetName
    domains = @("viralarchitect.com", "www.viralarchitect.com", "localhost")
    mode = "managed"
    bot_fight_mode = $false
    region = "world"
  } | ConvertTo-Json
  try {
    $created = Invoke-RestMethod -Method Post -Headers $headers -Uri $listUri -Body $body
    $widget = $created.result
  } catch {
    throw @"
Turnstile widget creation failed (likely missing Account.Turnstile:Edit).
In the Cloudflare API Tokens page, edit cloudflare-write to add Turnstile Edit on this account, update 1Password, then re-run this script.
"@
  }
} else {
  Write-Host "==> Reusing existing Turnstile widget."
}

$siteKey = $widget.sitekey
$secret = $widget.secret
if (-not $secret) {
  $detail = Invoke-RestMethod -Method Get -Headers $headers -Uri "$listUri/$siteKey"
  $secret = $detail.result.secret
}
if (-not $secret) { throw "Could not retrieve Turnstile secret (token may need Account.Turnstile:Read)." }

Write-Host "==> Site key: $siteKey"

Write-Host "==> Writing .env.local (gitignored)..."
$gmailPass = ""
try {
  $gmailPass = op read "op://$VaultId/gmail-app-password/credential"
} catch {
  Write-Host "WARN: gmail-app-password not in 1Password yet — GMAIL_APP_PASSWORD omitted from .env.local"
}

$envLines = @(
  "NEXT_PUBLIC_TURNSTILE_SITE_KEY=$siteKey",
  "TURNSTILE_SECRET_KEY=$secret",
  "GMAIL_USER=viral.architect@gmail.com"
)
if ($gmailPass) { $envLines += "GMAIL_APP_PASSWORD=$gmailPass" }
$envLines -join "`n" | Set-Content -Path ".env.local" -Encoding utf8NoBOM

function Set-VercelEnv($name, $value) {
  Write-Host "==> vercel env add $name (production, preview, development)"
  foreach ($env in @("production", "preview", "development")) {
    vercel env add $name $env --value $value --yes --force --scope columbia-cloudworks-llc 2>&1 | Out-Null
  }
}

Set-VercelEnv "NEXT_PUBLIC_TURNSTILE_SITE_KEY" $siteKey
Set-VercelEnv "TURNSTILE_SECRET_KEY" $secret
Set-VercelEnv "GMAIL_USER" "viral.architect@gmail.com"
if ($gmailPass) {
  Set-VercelEnv "GMAIL_APP_PASSWORD" $gmailPass
} else {
  Write-Host "SKIP: GMAIL_APP_PASSWORD not set in Vercel (add gmail-app-password to 1Password and re-run)."
}

Write-Host ""
Write-Host "Done. Local .env.local updated; Vercel env vars pushed for viral-architect."
Write-Host "Redeploy production after merge for env vars to take effect on the live site."
