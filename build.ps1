<#
.SYNOPSIS
    Linkbio - ローカルビルドスクリプト (Windows PowerShell用)
.DESCRIPTION
    ローカル環境で node build.js を呼び出して静的サイト (dist/) を生成します。
#>

[CmdletBinding()]
param()

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $ScriptDir

# Node.js 実行可能ファイルの探索
$nodeExe = $null

$nodeCmd = Get-Command "node" -ErrorAction SilentlyContinue
if ($nodeCmd) {
    $nodeExe = $nodeCmd.Source
} elseif (Test-Path "C:\Program Files\nodejs\node.exe") {
    $nodeExe = "C:\Program Files\nodejs\node.exe"
} elseif (Test-Path "$env:LOCALAPPDATA\Programs\node\node.exe") {
    $nodeExe = "$env:LOCALAPPDATA\Programs\node\node.exe"
}

if (-not $nodeExe) {
    Write-Error "[エラー] Node.js が見つかりませんでした。winget install OpenJS.NodeJS.LTS でインストールできます。"
    exit 1
}

Write-Host "----------------------------------------------------" -ForegroundColor Cyan
Write-Host "Node.js を検出しました: $nodeExe" -ForegroundColor Cyan
Write-Host "静的サイトのビルドを開始します..." -ForegroundColor Cyan
Write-Host "----------------------------------------------------" -ForegroundColor Cyan

& $nodeExe "$ScriptDir\build.js"
if ($LASTEXITCODE -eq 0) {
    Write-Host "`nブラウザで確認するには: dist/index.html または dist/siyou/index.html を開いてください。" -ForegroundColor Green
}
exit $LASTEXITCODE
