# Opens browser pages for Uplink credential setup, then runs setup-uplink.ps1 when ready.
# Run: pwsh -File scripts/setup-uplink-credentials.ps1

Write-Host @"

Uplink credential setup — grant these in your browser:

[1] Cloudflare API token (tab: dash.cloudflare.com/profile/api-tokens)
    - Edit your existing token OR create Custom token
    - Permissions: Account > Turnstile > Edit (and Read recommended)
    - Account resources: Viral.architect@gmail.com's Account
    - If the token value changes, paste it into 1Password item: cloudflare-write

[2] Gmail App Password (tab: myaccount.google.com/apppasswords)
    - Create password for Mail / Other (Viral Architect Uplink)
    - Save in 1Password vault ViralArchitect.com Agents as item: gmail-uplink
      Field: credential (or password)

Note: wrangler login does NOT include Turnstile permissions — use the API token above.

"@

Start-Process "https://dash.cloudflare.com/profile/api-tokens"
Start-Process "https://myaccount.google.com/apppasswords"

$createGmail = Read-Host "Create empty 1Password item 'gmail-uplink' now? (y/n)"
if ($createGmail -eq "y") {
  op item create --vault phqzta7t7exkddtreg5o35jdxy --category password `
    --title "gmail-uplink" `
    "username=viral.architect@gmail.com" 2>$null
  if ($LASTEXITCODE -eq 0) {
    Write-Host "Created gmail-uplink — paste the App Password into 1Password, then continue."
  } else {
    Write-Host "gmail-uplink may already exist; update it in 1Password."
  }
}

Read-Host "Press Enter after 1Password is updated to run setup-uplink.ps1"
& "$PSScriptRoot/setup-uplink.ps1"
