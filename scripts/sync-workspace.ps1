param(
  [string]$Source = (Split-Path -Parent $PSScriptRoot),
  [string]$Destination = 'C:\_Work\__OPENFREE_AI\.opencode\plugins\free-models',
  [switch]$DryRun
)

$ErrorActionPreference = 'Stop'
$files = @('index.js', 'package.json', 'README.md')
foreach ($file in $files) {
  $path = Join-Path $Source $file
  if (-not (Test-Path -LiteralPath $path -PathType Leaf)) {
    throw "Required source file not found: $path"
  }
}
$sourceSrc = Join-Path $Source 'src'
if (-not (Test-Path -LiteralPath $sourceSrc -PathType Container)) {
  throw "Required source directory not found: $sourceSrc"
}

$Source = (Resolve-Path -LiteralPath $Source).Path.TrimEnd('\', '/')
$Destination = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($Destination).TrimEnd('\', '/')
if ($Source -eq $Destination -or $Source.StartsWith($Destination + '\', [StringComparison]::OrdinalIgnoreCase) -or $Destination.StartsWith($Source + '\', [StringComparison]::OrdinalIgnoreCase)) {
  throw 'Source and destination must be separate, non-nested directories.'
}
$sourceSrc = Join-Path $Source 'src'
$destinationSrc = Join-Path $Destination 'src'

Write-Output "Ensure directory: $Destination"
if (-not $DryRun) {
  New-Item -ItemType Directory -Force -Path $Destination | Out-Null
}
Write-Output "Remove directory if present: $destinationSrc"
if (-not $DryRun -and (Test-Path -LiteralPath $destinationSrc)) {
  Remove-Item -LiteralPath $destinationSrc -Recurse -Force
}
foreach ($file in $files) {
  $path = Join-Path $Source $file
  Write-Output "Copy file: $path -> $Destination"
  if (-not $DryRun) {
    Copy-Item -LiteralPath $path -Destination $Destination -Force
  }
}
Write-Output "Copy directory: $sourceSrc -> $destinationSrc"
if (-not $DryRun) {
  Copy-Item -LiteralPath $sourceSrc -Destination $destinationSrc -Recurse -Force
}
