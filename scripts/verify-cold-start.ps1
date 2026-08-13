$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

$requiredFiles = @(
  "yawn.yawn",
  "readme.yawn",
  "questions/node.yawn",
  "questions/open-questions.yawn",
  "core/co-orientation-loop.yawn",
  "agents/yawn.bot.yawn",
  "agents/repo-contributor.yawn",
  "automation/yawn-bot-repo-contributor-loop.yawn",
  "records/yawn-bot-runtime-promotion-2026-07-11.yawn",
  "examples/cold-start-agent.yawn"
)

$missing = $requiredFiles | Where-Object { -not (Test-Path -LiteralPath $_) }
if ($missing) {
  throw "Cold-start contract is missing: $($missing -join ', ')"
}

$checks = @(
  @{ File = "yawn.yawn"; Pattern = "core_loop: core/co-orientation-loop.yawn" },
  @{ File = "yawn.yawn"; Pattern = "repository: https://github.com/yawn-ai/web-game" },
  @{ File = "agents/yawn.bot.yawn"; Pattern = "status: official" },
  @{ File = "agents/yawn.bot.yawn"; Pattern = "kind: co-orientation-runtime-identity" },
  @{ File = "core-loop.yawn"; Pattern = "status: superseded" },
  @{ File = "core-loop.yawn"; Pattern = "automation/yawn-bot-repo-contributor-loop.yawn" },
  @{ File = "questions/open-questions.yawn"; Pattern = "runtime/protocol-pin" },
  @{ File = "questions/where-am-i.yawn"; Pattern = "device_orientation:" },
  @{ File = "questions/where-am-i.yawn"; Pattern = "shared_orientation:" },
  @{ File = "README.md"; Pattern = "YAWN.bot is the official co-orientation runtime" }
)

foreach ($check in $checks) {
  if (-not (Select-String -LiteralPath $check.File -SimpleMatch $check.Pattern -Quiet)) {
    throw "Cold-start assertion failed: $($check.File) must contain '$($check.Pattern)'"
  }
}

$forbiddenIdentity = "YAWN.bot is a draft-PR observer"
if (Select-String -LiteralPath "README.md", "readme.yawn" -SimpleMatch $forbiddenIdentity -Quiet) {
  throw "Legacy YAWN.bot identity is still promoted as canonical."
}

[pscustomobject]@{
  status = "passed"
  repository = "yawn-ai/.yawn"
  runtime = "YAWN.bot"
  runtimeRepository = "yawn-ai/web-game"
  protocolLoop = "core/co-orientation-loop.yawn"
  requiredFiles = $requiredFiles.Count
  assertions = $checks.Count + 1
} | ConvertTo-Json
