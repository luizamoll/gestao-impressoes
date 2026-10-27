# Portal UNH — inicializacao local com Nexo sempre disponivel.
# Uso:
#   .\iniciar-portal.ps1
#   .\iniciar-portal.ps1 -ComIALocal   (opcional, somente dados de laboratorio)
# O assistente por regras fica ativo em todas as paginas independentemente da ponte.

[CmdletBinding()]
param([switch]$ComIALocal)

$ErrorActionPreference = "Stop"
$portalRoot = $PSScriptRoot
$bridgeProcess = $null

if (-not (Test-Path (Join-Path $portalRoot "mvnw.cmd"))) {
    throw "Execute este script dentro do projeto Portal UNH (mvnw.cmd nao encontrado)."
}

Push-Location $portalRoot
try {
    if ($ComIALocal) {
        $bridgeScript = Join-Path $portalRoot "laboratorio\nexo-local\servidor_nexo.py"
        $python = Get-Command py -ErrorAction SilentlyContinue
        $agent = Join-Path $HOME "Nexo-Lab\nexo_unh.py"

        if (-not $python -or -not (Test-Path $bridgeScript) -or -not (Test-Path $agent)) {
            Write-Warning "IA local nao preparada: confira Python, laboratorio/nexo-local e ~/Nexo-Lab/nexo_unh.py. O Nexo de navegacao funcionara normalmente."
        } else {
            # Nunca iniciar uma segunda ponte se a porta ja estiver ocupada.
            $existing = @(Get-NetTCPConnection -LocalPort 18767 -State Listen -ErrorAction SilentlyContinue)
            if ($existing.Count -gt 0) {
                Write-Host "Uma ponte ja ocupa a porta 18767. Ela nao sera encerrada por este script." -ForegroundColor Yellow
            } else {
                $quotedScript = '"' + $bridgeScript + '"'
                $bridgeProcess = Start-Process -FilePath $python.Source -ArgumentList @("-3", $quotedScript) -PassThru -WindowStyle Minimized
                Write-Host "Ponte experimental iniciada somente no computador local (127.0.0.1:18767)." -ForegroundColor Cyan
                Write-Host "Para usa-la, ative 'IA local (laboratorio)' no painel do Nexo. Nao envie dados reais." -ForegroundColor Yellow
                Write-Host "A ponte depende do Ollama/modelo local configurados separadamente." -ForegroundColor Yellow
            }
        }
    }

    Write-Host "Iniciando o Portal UNH com Nexo de navegacao ativo..." -ForegroundColor Green
    & .\mvnw.cmd spring-boot:run
} finally {
    if ($null -ne $bridgeProcess) {
        try {
            if (-not $bridgeProcess.HasExited) {
                Stop-Process -Id $bridgeProcess.Id -Force -ErrorAction SilentlyContinue
                Write-Host "Ponte de laboratorio iniciada por este script encerrada."
            }
        } catch {
            Write-Warning "Nao foi possivel verificar o encerramento da ponte de laboratorio."
        }
    }
    Pop-Location
}
