param(
  [ValidateSet("start","stop","restart","update","status")]
  [string]$Action = "start",
  [int]$Port = 8080
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$Runtime = Join-Path $Root ".runtime"
$PidFile = Join-Path $Runtime "gestao-impressoes.pid"
$Stdout = Join-Path $Runtime "gestao-impressoes.out.log"
$Stderr = Join-Path $Runtime "gestao-impressoes.err.log"
$Branch = "feat/estrutura-mvp-esg"
New-Item -ItemType Directory -Force -Path $Runtime | Out-Null

function Get-AppProcess {
  if (-not (Test-Path $PidFile)) { return $null }
  $savedPid = Get-Content $PidFile -ErrorAction SilentlyContinue | Select-Object -First 1
  if (-not $savedPid) { return $null }
  return Get-Process -Id ([int]$savedPid) -ErrorAction SilentlyContinue
}

function Find-Jar {
  return Get-ChildItem (Join-Path $Root "target") -Filter "*.jar" -ErrorAction SilentlyContinue | Where-Object { $_.Name -notlike "*.original" } | Sort-Object LastWriteTime -Descending | Select-Object -First 1
}

function Build-App {
  Write-Host ""
  Write-Host "Compilando a versao interna..." -ForegroundColor Cyan
  Push-Location $Root
  try {
    & (Join-Path $Root "mvnw.cmd") -DskipTests package
    if ($LASTEXITCODE -ne 0) { throw "Falha ao compilar o projeto." }
  } finally { Pop-Location }
}

function Show-Access {
  Write-Host ""
  Write-Host "Neste computador:" -ForegroundColor Cyan
  Write-Host "  http://127.0.0.1:$Port/"
  Write-Host ""
  Write-Host "Na rede interna da UNH:" -ForegroundColor Cyan
  $ips = Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue | Where-Object { $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.254*" -and $_.InterfaceAlias -notmatch "Loopback|Bluetooth" } | Sort-Object InterfaceMetric
  foreach ($ip in $ips) { Write-Host "  http://$($ip.IPAddress):$Port/" }
  Write-Host ""
}

function Start-App {
  $existing = Get-AppProcess
  if ($existing) { Write-Host "O sistema ja esta em execucao (PID $($existing.Id))." -ForegroundColor Yellow; Show-Access; return }
  $jar = Find-Jar
  if (-not $jar) { Build-App; $jar = Find-Jar }
  if (-not $jar) { throw "Arquivo JAR nao encontrado." }
  $java = Get-Command java -ErrorAction SilentlyContinue
  if (-not $java) { throw "Java nao encontrado. Instale Java 21 no computador servidor." }
  Remove-Item $Stdout,$Stderr -ErrorAction SilentlyContinue
  $args = @("-jar",$jar.FullName,"--server.address=0.0.0.0","--server.port=$Port")
  $proc = Start-Process -FilePath $java.Source -ArgumentList $args -WorkingDirectory $Root -RedirectStandardOutput $Stdout -RedirectStandardError $Stderr -WindowStyle Hidden -PassThru
  $proc.Id | Set-Content $PidFile
  Start-Sleep -Seconds 3
  if (-not (Get-Process -Id $proc.Id -ErrorAction SilentlyContinue)) { Write-Host "O servidor nao iniciou. Consulte: $Stderr" -ForegroundColor Red; exit 1 }
  Write-Host "Servidor interno iniciado." -ForegroundColor Green
  Show-Access
}

function Stop-App {
  $proc = Get-AppProcess
  if ($proc) { Write-Host "Encerrando servidor interno..."; Stop-Process -Id $proc.Id -Force }
  Remove-Item $PidFile -ErrorAction SilentlyContinue
  Write-Host "Servidor parado." -ForegroundColor Green
}

function Update-App {
  Write-Host "Buscando atualizacoes do GitHub..." -ForegroundColor Cyan
  Push-Location $Root
  try {
    git fetch origin
    if ($LASTEXITCODE -ne 0) { throw "Falha no git fetch." }
    git switch $Branch
    if ($LASTEXITCODE -ne 0) { throw "Falha ao selecionar a branch $Branch." }
    git pull --ff-only origin $Branch
    if ($LASTEXITCODE -ne 0) { throw "Falha no git pull." }
  } finally { Pop-Location }
  Build-App
  Stop-App
  Start-App
}

switch ($Action) {
  "start" { Start-App }
  "stop" { Stop-App }
  "restart" { Stop-App; Start-App }
  "update" { Update-App }
  "status" { $proc = Get-AppProcess; if ($proc) { Write-Host "ONLINE - PID $($proc.Id)" -ForegroundColor Green; Show-Access } else { Write-Host "OFFLINE" -ForegroundColor Yellow } }
}
