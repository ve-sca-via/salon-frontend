#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Cleanup unused dependencies and optimize package.json

.DESCRIPTION
    This script removes unused packages from the project that are
    currently installed but not being used in the bundle:
    - moment.js (2.3 MB) - date-fns is already being used
    - react-big-calendar (200 KB) - not being used anywhere
    - recharts (500 KB) - not being used anywhere
    
.EXAMPLE
    .\cleanup-dependencies.ps1
#>

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  DEPENDENCY CLEANUP SCRIPT" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$projectRoot = Split-Path -Parent $PSScriptRoot

# Check if package.json exists
$packageJsonPath = Join-Path $projectRoot "package.json"
if (-not (Test-Path $packageJsonPath)) {
    Write-Host "❌ Error: package.json not found at $packageJsonPath" -ForegroundColor Red
    exit 1
}

Write-Host "📦 Current package.json location: $packageJsonPath" -ForegroundColor Yellow
Write-Host ""

# Packages to remove
$packagesToRemove = @(
    "moment",
    "react-big-calendar",
    "recharts"
)

Write-Host "🗑️  Packages to remove:" -ForegroundColor Yellow
foreach ($package in $packagesToRemove) {
    Write-Host "   - $package" -ForegroundColor Gray
}
Write-Host ""

# Prompt for confirmation
Write-Host "⚠️  This will permanently remove these packages." -ForegroundColor Yellow
$confirmation = Read-Host "Continue? (y/N)"

if ($confirmation -ne 'y' -and $confirmation -ne 'Y') {
    Write-Host ""
    Write-Host "❌ Operation cancelled." -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "🚀 Starting cleanup..." -ForegroundColor Green
Write-Host ""

# Change to project directory
Set-Location $projectRoot

# Remove each package
$successCount = 0
$failCount = 0

foreach ($package in $packagesToRemove) {
    Write-Host "📦 Removing $package..." -ForegroundColor Cyan
    
    try {
        $output = npm uninstall $package 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✅ Successfully removed $package" -ForegroundColor Green
            $successCount++
        } else {
            Write-Host "   ⚠️  Package $package might not be installed" -ForegroundColor Yellow
            Write-Host "   Output: $output" -ForegroundColor Gray
            $failCount++
        }
    } catch {
        Write-Host "   ❌ Error removing $package : $_" -ForegroundColor Red
        $failCount++
    }
    
    Write-Host ""
}

# Remove unused CSS import for react-big-calendar
$indexCssPath = Join-Path $projectRoot "src\index.css"
if (Test-Path $indexCssPath) {
    Write-Host "📝 Checking src/index.css for unused imports..." -ForegroundColor Cyan
    
    $cssContent = Get-Content $indexCssPath -Raw
    $updatedCssContent = $cssContent -replace '@import\s+"react-big-calendar/lib/css/react-big-calendar\.css";?\s*\n?', ''
    
    if ($cssContent -ne $updatedCssContent) {
        Set-Content $indexCssPath -Value $updatedCssContent -NoNewline
        Write-Host "   ✅ Removed react-big-calendar CSS import" -ForegroundColor Green
    } else {
        Write-Host "   ℹ️  No react-big-calendar CSS import found" -ForegroundColor Gray
    }
    Write-Host ""
}

# Summary
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  CLEANUP SUMMARY" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Successful removals: $successCount" -ForegroundColor Green
if ($failCount -gt 0) {
    Write-Host "⚠️  Failed/Skipped: $failCount" -ForegroundColor Yellow
}
Write-Host ""

# Show package.json size reduction
$packageJson = Get-Content $packageJsonPath | ConvertFrom-Json
$remainingDeps = $packageJson.dependencies.PSObject.Properties.Name.Count
Write-Host "📊 Remaining dependencies: $remainingDeps" -ForegroundColor Cyan
Write-Host ""

# Recommend next steps
Write-Host "🎯 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Run 'npm install' to clean up node_modules" -ForegroundColor Gray
Write-Host "   2. Run 'npm run build' to verify everything still works" -ForegroundColor Gray
Write-Host "   3. Run the image optimization script" -ForegroundColor Gray
Write-Host "   4. Test your application thoroughly" -ForegroundColor Gray
Write-Host ""

Write-Host "✨ Cleanup complete!" -ForegroundColor Green
Write-Host ""
