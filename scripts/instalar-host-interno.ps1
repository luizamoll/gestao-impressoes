param([int]$Port = 8080)
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$HostScript = Join-Path $PSScriptRoot "host-interno.ps1"
$TaskName = "UNH - Gestao de Impressoes"
$FirewallName = "UNH Sistemas Internos - Porta $Port"

$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) { Write-Host "Execute este instalador como Administrador." -ForegroundColor Yellow; exit 1 }
if (-not (Get-Command java -ErrorAction SilentlyContinue)) { throw "Java nao encontrado. O host interno precisa de Java 21." }
if (-not (Get-Command git -ErrorAction SilentlyContinue)) { throw "Git nao encontrado. Instale o Git no computador servidor." }

if (-not (Get-NetFirewallRule -DisplayName $FirewallName -ErrorAction SilentlyContinue)) {
  New-NetFirewallRule -DisplayName $FirewallName -Direction Inbound -Action Allow -Protocol TCP -LocalPort $Port -Profile Domain,Private | Out-Null
  Write-Host "Firewall liberado para redes Domain/Private na porta $Port." -ForegroundColor Green
} else { Write-Host "Regra de firewall ja configurada." }

Push-Location $Root
try {
  & (Join-Path $Root "mvnw.cmd") -DskipTests package
  if ($LASTEXITCODE -ne 0) { throw "Falha ao compilar o projeto." }
} finally { Pop-Location }

$taskArgs = "-NoProfile -ExecutionPolicy Bypass -File `"$HostScript`" start -Port $Port"
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument $taskArgs
$trigger = New-ScheduledTaskTrigger -AtStartup
$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -RestartCount 5 -RestartInterval (New-TimeSpan -Minutes 1)
Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Force | Out-Null
Write-Host "Inicializacao automatica configurada." -ForegroundColor Green

& powershell.exe -NoProfile -ExecutionPolicy Bypass -File $HostScript restart -Port $Port
Write-Host ""
Write-Host "HOST INTERNO PRONTO." -ForegroundColor Green
Write-Host "Para endereco permanente, solicite a TI um IP reservado ou nome DNS interno para este computador."
