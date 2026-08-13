[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [string]$OutputRoot,

  [switch]$CreateBundles
)

$ErrorActionPreference = 'Stop'

$repositories = @(
  [pscustomobject]@{ Name = 'protocol'; Path = 'C:\Users\dave\OneDrive\Desktop\.yawn' },
  [pscustomobject]@{ Name = 'field'; Path = 'C:\Users\dave\OneDrive\Desktop\yawn.ai\web-game' },
  [pscustomobject]@{ Name = 'legacy-homebase'; Path = 'C:\Users\dave\OneDrive\Desktop\Nestheads-Homebase' },
  [pscustomobject]@{ Name = 'app'; Path = 'C:\Users\dave\OneDrive\Desktop\yawn.ai\Yawn-company-main' },
  [pscustomobject]@{ Name = 'bot-console'; Path = 'C:\Users\dave\OneDrive\Desktop\yawn-bot' }
)

function Invoke-Git {
  param(
    [Parameter(Mandatory = $true)][string]$RepositoryPath,
    [Parameter(Mandatory = $true)][string[]]$Arguments
  )

  $output = & git -C $RepositoryPath @Arguments 2>&1
  if ($LASTEXITCODE -ne 0) {
    throw "git $($Arguments -join ' ') failed in $RepositoryPath`n$output"
  }

  return @($output)
}

function Get-PathClassification {
  param([Parameter(Mandatory = $true)][string]$Path)

  if ($Path -match '(^|/)(\.env($|\.)|.*credential.*)' -and $Path -notmatch '\.env\.example$') {
    return 'secret-configuration'
  }

  if ($Path -match '(^|/)(\.tmp|\.codex-tmp)/|(^|/)(debug|tmp-|\.codex-).*\.(log|out)$|\.(err\.log|out\.log)$|^(lobby|root)\.html$|^tmp-.*\.html$') {
    return 'runtime-log-or-temporary'
  }

  if ($Path -match '^automation-artifacts/' -or $Path -match '^(build|output)/') {
    return 'generated-output'
  }

  if ($Path -match '^deliverables/' -or $Path -match '^public/.+\.(png|jpg|jpeg|gif|webp|ico|svg|mp3|wav|ogg)$') {
    return 'selected-media'
  }

  if ($Path -match '(^|/)(tests?|__tests__)/|\.(spec|test)\.[cm]?[jt]sx?$') {
    return 'test'
  }

  if ($Path -match '(^|/)(fixtures?|YAWNS|questions|q-space)/|\.yawn$') {
    return 'fixture-or-contract'
  }

  if ($Path -match '(^|/)docs?/|\.(md|docx|pdf)$') {
    return 'documentation'
  }

  if ($Path -match '(^|/)(src|app|components|lib|scripts|contracts|supabase)/|\.(ts|tsx|js|mjs|cjs|css|scss|sql|ps1)$') {
    return 'intentional-source'
  }

  if ($Path -match '(^|/)(\.github|\.agents|\.yawn)/|(^|/)(package|next|playwright|vitest|tsconfig|eslint)|(^|/)LICENSE$') {
    return 'configuration'
  }

  return 'review-required'
}

$resolvedOutputRoot = [System.IO.Path]::GetFullPath($OutputRoot)
New-Item -ItemType Directory -Path $resolvedOutputRoot -Force | Out-Null

$workspaceManifest = [ordered]@{
  schemaVersion = 'yawn.workspace-preservation.v1'
  createdAt = (Get-Date).ToUniversalTime().ToString('o')
  outputRoot = $resolvedOutputRoot
  repositories = @()
}

foreach ($repository in $repositories) {
  $resolvedRepositoryPath = (Resolve-Path -LiteralPath $repository.Path).Path
  $repositoryOutput = Join-Path $resolvedOutputRoot $repository.Name
  New-Item -ItemType Directory -Path $repositoryOutput -Force | Out-Null

  $branch = (Invoke-Git -RepositoryPath $resolvedRepositoryPath -Arguments @('branch', '--show-current') | Select-Object -First 1).ToString().Trim()
  $head = (Invoke-Git -RepositoryPath $resolvedRepositoryPath -Arguments @('rev-parse', 'HEAD') | Select-Object -First 1).ToString().Trim()
  $remotes = @(Invoke-Git -RepositoryPath $resolvedRepositoryPath -Arguments @('remote', '-v'))
  $statusLines = @(Invoke-Git -RepositoryPath $resolvedRepositoryPath -Arguments @('status', '--short', '--untracked-files=all'))
  $untrackedPaths = @(Invoke-Git -RepositoryPath $resolvedRepositoryPath -Arguments @('ls-files', '--others', '--exclude-standard'))

  $pathEntries = @()
  foreach ($path in $untrackedPaths) {
    $classification = Get-PathClassification -Path $path
    $absolutePath = Join-Path $resolvedRepositoryPath $path
    $size = if (Test-Path -LiteralPath $absolutePath -PathType Leaf) {
      (Get-Item -LiteralPath $absolutePath).Length
    } else {
      $null
    }

    $pathEntries += [ordered]@{
      path = $path
      classification = $classification
      bytes = $size
      commitEligible = $classification -notin @('secret-configuration', 'runtime-log-or-temporary', 'generated-output')
    }
  }

  $bundle = $null
  if ($CreateBundles) {
    $bundlePath = Join-Path $repositoryOutput "$($repository.Name).bundle"
    Invoke-Git -RepositoryPath $resolvedRepositoryPath -Arguments @('bundle', 'create', $bundlePath, '--all') | Out-Null
    $bundle = [ordered]@{
      path = $bundlePath
      sha256 = (Get-FileHash -LiteralPath $bundlePath -Algorithm SHA256).Hash.ToLowerInvariant()
      bytes = (Get-Item -LiteralPath $bundlePath).Length
    }
  }

  $repositoryManifest = [ordered]@{
    name = $repository.Name
    path = $resolvedRepositoryPath
    branch = $branch
    head = $head
    remotes = $remotes
    dirtyState = $statusLines
    untracked = $pathEntries
    excludedPaths = @($pathEntries | Where-Object { -not $_.commitEligible } | ForEach-Object { $_.path })
    bundle = $bundle
  }

  $repositoryManifest | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath (Join-Path $repositoryOutput 'manifest.json') -Encoding utf8
  $statusLines | Set-Content -LiteralPath (Join-Path $repositoryOutput 'status.txt') -Encoding utf8
  $workspaceManifest.repositories += $repositoryManifest
}

$workspaceManifest | ConvertTo-Json -Depth 10 | Set-Content -LiteralPath (Join-Path $resolvedOutputRoot 'workspace-manifest.json') -Encoding utf8

$checksums = Get-ChildItem -LiteralPath $resolvedOutputRoot -Recurse -File |
  Where-Object { $_.Name -ne 'SHA256SUMS.txt' } |
  Sort-Object FullName |
  ForEach-Object {
    $relative = $_.FullName.Substring($resolvedOutputRoot.Length).TrimStart([char[]]@('\', '/')).Replace('\\', '/')
    "{0}  {1}" -f (Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash.ToLowerInvariant(), $relative
  }
$checksums | Set-Content -LiteralPath (Join-Path $resolvedOutputRoot 'SHA256SUMS.txt') -Encoding utf8

Write-Output (Join-Path $resolvedOutputRoot 'workspace-manifest.json')
