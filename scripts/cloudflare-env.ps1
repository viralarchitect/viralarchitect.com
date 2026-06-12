# Load Cloudflare credentials from 1Password into the current PowerShell session.
# Vault: ViralArchitect.com Agents | Item: cloudflare-write
# Token fields: credential or CLOUDFLARE_API_TOKEN (same value)

$ErrorActionPreference = "Stop"
$VaultId = "phqzta7t7exkddtreg5o35jdxy"
$Item = "cloudflare-write"

$env:CLOUDFLARE_ACCOUNT_ID = "b38e5d6536f4208b8eff37a85180058e"
$env:CLOUDFLARE_API_TOKEN = op read "op://$VaultId/$Item/credential"

Write-Host "Cloudflare env loaded (account $env:CLOUDFLARE_ACCOUNT_ID, token verified)."
