[CmdletBinding(DefaultParameterSetName = 'File')]
param(
  [Parameter(Mandatory = $true, ParameterSetName = 'File')][string]$ModelsFile,
  [Parameter(Mandatory = $true)][string]$OutFile,
  [Parameter(Mandatory = $true)][string]$SummaryFile,
  [int]$TimeoutSec = 60,
  [Parameter(Mandatory = $true, ParameterSetName = 'All')][switch]$All,
  [string]$Directory = (Get-Location).Path
)

$ErrorActionPreference = "Stop"
$opencode = (Get-Command opencode.cmd -ErrorAction Stop).Source

$candidate = $Directory
if (-not (Test-Path -LiteralPath (Join-Path $candidate '.opencode\plugins\free-models'))) {
  $parent = Split-Path -Parent $candidate
  if ($parent -and (Test-Path -LiteralPath (Join-Path $parent '.opencode\plugins\free-models'))) {
    $candidate = $parent
  }
}
$Directory = (Resolve-Path -LiteralPath $candidate).Path
Write-Output "Workspace directory: $Directory"

if ($All) {
  Push-Location $Directory
  try {
    $listedModels = & $opencode models --standalone
  } finally {
    Pop-Location
  }
  if ($LASTEXITCODE -ne 0) {
    throw "opencode models --standalone failed with exit code $LASTEXITCODE"
  }
  $models = @($listedModels | Where-Object { $_ -match '^free-' } | ForEach-Object { $_.Trim() })
} else {
  $models = @(Get-Content -LiteralPath $ModelsFile | Where-Object { $_.Trim() } | ForEach-Object { $_.Trim() })
}
$work = Join-Path $env:TEMP "openfree-smoke"
New-Item -ItemType Directory -Force -Path $work | Out-Null
Set-Content -Path $OutFile -Value ""

$results = @()
$index = 0
foreach ($model in $models) {
  $index++
  $safe = ($model -replace '[^A-Za-z0-9._-]', '_')
  $out = Join-Path $work "$safe.out.txt"
  $err = Join-Path $work "$safe.err.txt"
  Remove-Item $out, $err -ErrorAction SilentlyContinue

  $sw = [Diagnostics.Stopwatch]::StartNew()
  $text = ""
  $status = "FAIL"

  $process = Start-Process -FilePath $opencode `
    -ArgumentList @("run", "--standalone", "--agent", "general", "-m", $model, "Reply with exactly OK and nothing else.") `
    -WorkingDirectory $Directory `
    -RedirectStandardOutput $out -RedirectStandardError $err -NoNewWindow -PassThru

  $finished = $process.WaitForExit($TimeoutSec * 1000)
  if (-not $finished) {
    & taskkill /PID $process.Id /T /F 2>$null | Out-Null
    $status = "TIMEOUT"
  } else {
    $text = (Get-Content $out -Raw -ErrorAction SilentlyContinue) + "`n" + (Get-Content $err -Raw -ErrorAction SilentlyContinue)
    $text = $text -replace "$([char]27)\[[0-9;]*[A-Za-z]", ""
    if ($text -match "payment method is required") {
      $status = "BILLING"
    } elseif ($text -match "not included in your free usage|not available on the .*Free plan|upgrade for included usage") {
      $status = "PLAN_LIMIT"
    } elseif ($text -match "Type mismatch of '/messages") {
      $status = "PROTOCOL"
    } elseif ($text -match "RESOURCE_EXHAUSTED|rate limit|too many requests|quota exceeded|TPM|RPM") {
      $status = "RATE_LIMIT"
    } elseif ($text -match "content after the finish reason|stream ended without finish_reason") {
      $status = "STREAM_ERROR"
    } elseif ($text -match "unauthorized|invalid api key|authentication failed") {
      $status = "AUTH"
    } elseif ($text -match "not found|does not exist|unknown model|HTTP 404|status 404") {
      $status = "MODEL_ERROR"
    } elseif ($text -match "Error:|AiError") {
      $status = "ERROR"
    } elseif ($text -match "\bOK\b") {
      $status = "OK"
    } elseif ($text.Trim()) {
      $status = "RESPONDS"
    } else {
      $status = "EMPTY"
    }
  }
  $sw.Stop()

  $excerpt = $text.Trim()
  if ($excerpt.Length -gt 600) { $excerpt = $excerpt.Substring($excerpt.Length - 600) }
  $row = [pscustomobject]@{ model = $model; status = $status; ms = $sw.ElapsedMilliseconds; excerpt = $excerpt }
  Add-Content -Path $OutFile -Value ($row | ConvertTo-Json -Compress)
  $results += $row
  "[{0}/{1}] {2}`t{3}`t{4}ms" -f $index, $models.Count, $status, $model, $sw.ElapsedMilliseconds
}

$counts = @{}
foreach ($row in $results) {
  if (-not $counts.ContainsKey($row.status)) { $counts[$row.status] = 0 }
  $counts[$row.status]++
}
$summary = [pscustomobject]@{ generatedAt = (Get-Date).ToUniversalTime().ToString("o"); counts = $counts; results = $results }
$summary | ConvertTo-Json -Depth 6 | Set-Content -Path $SummaryFile
"summary: $($counts | ConvertTo-Json -Compress)"
