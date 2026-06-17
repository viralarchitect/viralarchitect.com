# lint-edited-file.ps1 — afterFileEdit hook
# Runs project linters/formatters on edited files and blocks until clean.

$ErrorActionPreference = 'Continue'

$inputJson = [Console]::In.ReadToEnd()
$data = $inputJson | ConvertFrom-Json
$filePath = $data.path

if (-not $filePath) {
    Write-Output '{ "continue": true }'
    exit 0
}

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$absPath = if ([System.IO.Path]::IsPathRooted($filePath)) {
    $filePath
} else {
    Join-Path $projectRoot $filePath
}

if (-not (Test-Path -LiteralPath $absPath)) {
    Write-Output '{ "continue": true }'
    exit 0
}

if ($filePath -match '(\\|/)(node_modules|\.next|out|build|\.git)(\\|/)') {
    Write-Output '{ "continue": true }'
    exit 0
}

if ($filePath -match '(\\|/)package-lock\.json$') {
    Write-Output '{ "continue": true }'
    exit 0
}

if ($filePath -match '\.(svg|png|jpe?g|gif|webp|ico|woff2?|ttf|eot|pem|jpg|mp4|webm)$') {
    Write-Output '{ "continue": true }'
    exit 0
}

if ($filePath -match '(\\|/)\.env(\.|$)|\.op\.env$') {
    Write-Output '{ "continue": true }'
    exit 0
}

function Write-BlockResponse {
    param([string[]]$Messages)

    $body = ($Messages -join "`n`n---`n`n").Trim()
    $response = @{
        continue      = $false
        agent_message = "Lint/format checks failed for $filePath. Fix all reported issues before continuing.`n`n$body"
    }

    Write-Output ($response | ConvertTo-Json -Compress -Depth 5)
    exit 1
}

function Invoke-ProjectBin {
    param(
        [string]$RelativeBinPath,
        [string]$NpxCommand,
        [string[]]$Arguments
    )

    $bin = Join-Path $projectRoot $RelativeBinPath
    $useNpx = -not (Test-Path -LiteralPath $bin)

    if ($useNpx) {
        $executable = (Get-Command npx.cmd -ErrorAction SilentlyContinue).Source
        if (-not $executable) {
            $executable = 'npx.cmd'
        }
        $allArgs = @($NpxCommand) + $Arguments
    } else {
        $executable = $bin
        $allArgs = $Arguments
    }

    $argumentString = ($allArgs | ForEach-Object {
        if ($_ -match '\s') { '"' + ($_.Replace('"', '\"')) + '"' } else { $_ }
    }) -join ' '

    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = $executable
    $psi.Arguments = $argumentString
    $psi.WorkingDirectory = $projectRoot
    $psi.RedirectStandardOutput = $true
    $psi.RedirectStandardError = $true
    $psi.UseShellExecute = $false
    $psi.CreateNoWindow = $true

    $process = New-Object System.Diagnostics.Process
    $process.StartInfo = $psi
    $null = $process.Start()
    $stdout = $process.StandardOutput.ReadToEnd()
    $stderr = $process.StandardError.ReadToEnd()
    $process.WaitForExit()

    $output = ($stdout + $stderr).Trim()

    return @{
        Output   = $output
        ExitCode = $process.ExitCode
    }
}

$failures = @()

if ($filePath -match '\.(ts|tsx|js|jsx|mjs|cjs)$') {
    $eslint = Invoke-ProjectBin -RelativeBinPath 'node_modules\.bin\eslint.cmd' -NpxCommand 'eslint' -Arguments @(
        $absPath,
        '--max-warnings', '0'
    )

    if ($eslint.ExitCode -ne 0) {
        $details = if ($eslint.Output) { $eslint.Output } else { "ESLint exited with code $($eslint.ExitCode)." }
        $failures += "ESLint`n$details"
    }
}

if ($filePath -match '\.css$') {
    $stylelint = Invoke-ProjectBin -RelativeBinPath 'node_modules\.bin\stylelint.cmd' -NpxCommand 'stylelint' -Arguments @($absPath)

    if ($stylelint.ExitCode -ne 0) {
        $details = if ($stylelint.Output) { $stylelint.Output } else { "Stylelint exited with code $($stylelint.ExitCode)." }
        $failures += "Stylelint`n$details"
    }
}

if ($filePath -match '\.md$') {
    $markdownlint = Invoke-ProjectBin -RelativeBinPath 'node_modules\.bin\markdownlint-cli2.cmd' -NpxCommand 'markdownlint-cli2' -Arguments @($absPath)

    if ($markdownlint.ExitCode -ne 0) {
        $details = if ($markdownlint.Output) { $markdownlint.Output } else { "markdownlint-cli2 exited with code $($markdownlint.ExitCode)." }
        $failures += "Markdownlint`n$details"
    }
}

if ($filePath -match '\.(ts|tsx|js|jsx|mjs|cjs|css|json|md|yaml|yml|html)$') {
    $prettier = Invoke-ProjectBin -RelativeBinPath 'node_modules\.bin\prettier.cmd' -NpxCommand 'prettier' -Arguments @(
        '--check',
        $absPath
    )

    if ($prettier.ExitCode -ne 0) {
        $details = if ($prettier.Output) { $prettier.Output } else { "Prettier exited with code $($prettier.ExitCode)." }
        $failures += "Prettier`n$details"
    }
}

if ($failures.Count -gt 0) {
    Write-BlockResponse -Messages $failures
}

Write-Output '{ "continue": true }'
exit 0
