# Create the viralarchitect.com Uplink Turnstile widget via Cloudflare API.
# Requires CLOUDFLARE_API_TOKEN with Account.Turnstile:Edit (and Read for verification).
# Usage: op run --env-file=scripts/cloudflare.op.env -- pwsh -File scripts/create-turnstile-widget.ps1

$ErrorActionPreference = "Stop"

$headers = @{
  Authorization = "Bearer $env:CLOUDFLARE_API_TOKEN"
  "Content-Type" = "application/json"
}

$listUri = "https://api.cloudflare.com/client/v4/accounts/$env:CLOUDFLARE_ACCOUNT_ID/challenges/widgets"
$list = Invoke-RestMethod -Method Get -Headers $headers -Uri $listUri
$existing = @($list.result | Where-Object { $_.name -eq "viralarchitect.com Uplink" })

if ($existing.Count -gt 0) {
  Write-Host "Turnstile widget already exists."
  Write-Host "Site key: $($existing[0].sitekey)"
  Write-Host "Set NEXT_PUBLIC_TURNSTILE_SITE_KEY to the site key above."
  Write-Host "Set TURNSTILE_SECRET_KEY from the Cloudflare dashboard or API (secret is not printed here)."
  exit 0
}

$body = @{
  name = "viralarchitect.com Uplink"
  domains = @("viralarchitect.com", "www.viralarchitect.com", "localhost")
  mode = "managed"
  bot_fight_mode = $false
  region = "world"
} | ConvertTo-Json

try {
  $created = Invoke-RestMethod -Method Post -Headers $headers -Uri $listUri -Body $body
} catch {
  Write-Error @"
Failed to create Turnstile widget (HTTP $($_.Exception.Response.StatusCode.value__)).
Ensure the API token includes Account.Turnstile:Edit for account $env:CLOUDFLARE_ACCOUNT_ID.
"@
}

Write-Host "Turnstile widget created."
Write-Host "Site key: $($created.result.sitekey)"
Write-Host "Set NEXT_PUBLIC_TURNSTILE_SITE_KEY to the site key above."
Write-Host "Set TURNSTILE_SECRET_KEY from the API response secret (not echoed by this script)."
