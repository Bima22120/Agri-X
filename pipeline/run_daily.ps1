# =====================================================
# AgriX Daily Data Pipeline — Windows Task Scheduler
# Runs once per day at 07:30 WIB
# Fetches from PIHPS (Bank Indonesia) & SISKAPERBAPO (Disperindag Jatim)
# =====================================================

$ProjectRoot = "F:\AgriX\system"
$LogDir      = "$ProjectRoot\pipeline\data\logs"
$LogFile     = "$LogDir\daily_$(Get-Date -Format 'yyyy-MM-dd').log"
$PythonExe   = "python"

if (-not (Test-Path $LogDir)) { New-Item -ItemType Directory -Force -Path $LogDir | Out-Null }

function Write-Log {
    param([string]$Message)
    $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $line = "[$ts] $Message"
    Write-Host $line
    Add-Content -Path $LogFile -Value $line -Encoding UTF8
}

Write-Log "===== AgriX Daily Pipeline Start ====="
Write-Log "Project Root : $ProjectRoot"
Write-Log "Log File     : $LogFile"

Set-Location $ProjectRoot

Write-Log "Collecting from PIHPS (Bank Indonesia) & SISKAPERBAPO (Disperindag Jatim)..."
$result = & $PythonExe -m pipeline.runner 2>&1
foreach ($line in $result) { Write-Log "  [PIPELINE] $line" }

if ($LASTEXITCODE -eq 0) {
    Write-Log "Pipeline SUCCESS — data updated."
} else {
    Write-Log "ERROR: Pipeline exited with code $LASTEXITCODE"
}

Write-Log "===== AgriX Daily Pipeline End ====="
