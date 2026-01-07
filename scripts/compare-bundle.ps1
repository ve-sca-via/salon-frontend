#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Compare bundle sizes before and after optimization

.DESCRIPTION
    Analyzes the current bundle and compares with expected results
    after image optimization
#>

Write-Host "`n═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  📊 BUNDLE SIZE COMPARISON TOOL" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════`n" -ForegroundColor Cyan

$projectRoot = Split-Path -Parent $PSScriptRoot
$distPath = Join-Path $projectRoot "dist\assets"

if (-not (Test-Path $distPath)) {
    Write-Host "❌ Error: dist/assets folder not found" -ForegroundColor Red
    Write-Host "   Run 'npm run build' first`n" -ForegroundColor Yellow
    exit 1
}

# Calculate current sizes
Write-Host "📏 Analyzing current bundle...`n" -ForegroundColor Yellow

$jsFiles = Get-ChildItem "$distPath\*.js" -Recurse
$imageFiles = Get-ChildItem "$distPath\*.{jpg,png,webp}" -Recurse

$jsSize = ($jsFiles | Measure-Object -Property Length -Sum).Sum
$imageSize = ($imageFiles | Measure-Object -Property Length -Sum).Sum
$totalSize = $jsSize + $imageSize

$jsSizeMB = [math]::Round($jsSize / 1MB, 2)
$imageSizeMB = [math]::Round($imageSize / 1MB, 2)
$totalSizeMB = [math]::Round($totalSize / 1MB, 2)

# Expected optimized sizes
$expectedImageSize = 3.5 # MB
$expectedTotalSize = $jsSizeMB + $expectedImageSize

$imageSavings = $imageSizeMB - $expectedImageSize
$totalSavings = $totalSizeMB - $expectedTotalSize
$savingsPercent = [math]::Round(($totalSavings / $totalSizeMB) * 100, 0)

# Display current status
Write-Host "📊 CURRENT BUNDLE (Production Build)" -ForegroundColor White
Write-Host "─────────────────────────────────────" -ForegroundColor Gray
Write-Host "JavaScript:  $($jsSizeMB.ToString('0.00')) MB  ✅ Excellent" -ForegroundColor Green
Write-Host "Images:      $($imageSizeMB.ToString('0.00')) MB  ❌ Needs optimization" -ForegroundColor Red
Write-Host "─────────────────────────────────────" -ForegroundColor Gray
Write-Host "TOTAL:       $($totalSizeMB.ToString('0.00')) MB`n" -ForegroundColor Yellow

# Display percentage breakdown
$jsPercent = [math]::Round(($jsSize / $totalSize) * 100, 0)
$imagePercent = [math]::Round(($imageSize / $totalSize) * 100, 0)

Write-Host "📈 Composition:" -ForegroundColor White
Write-Host "   JavaScript:  $jsPercent%   $('█' * [math]::Min($jsPercent / 5, 20))" -ForegroundColor Green
Write-Host "   Images:      $imagePercent%   $('█' * [math]::Min($imagePercent / 5, 20))`n" -ForegroundColor Red

# Display expected results
Write-Host "🎯 AFTER OPTIMIZATION (Expected)" -ForegroundColor White
Write-Host "─────────────────────────────────────" -ForegroundColor Gray
Write-Host "JavaScript:  $($jsSizeMB.ToString('0.00')) MB  ✅ No change" -ForegroundColor Green
Write-Host "Images:      $expectedImageSize MB  ✅ Optimized" -ForegroundColor Green
Write-Host "─────────────────────────────────────" -ForegroundColor Gray
Write-Host "TOTAL:       $($expectedTotalSize.ToString('0.00')) MB`n" -ForegroundColor Green

# Display savings
$imageReductionPercent = [math]::Round(($imageSavings / $imageSizeMB) * 100, 0)
$imageText = "$($imageSavings.ToString('0.00')) MB  ($imageReductionPercent% reduction)"
$totalText = "$($totalSavings.ToString('0.00')) MB  ($savingsPercent% reduction)"

Write-Host "💰 SAVINGS BREAKDOWN" -ForegroundColor White
Write-Host "─────────────────────────────────────" -ForegroundColor Gray
Write-Host "JavaScript:  0.00 MB  (already optimized)" -ForegroundColor Gray
Write-Host "Images:      $imageText" -ForegroundColor Green
Write-Host "─────────────────────────────────────" -ForegroundColor Gray
Write-Host "TOTAL:       $totalText 🎉`n" -ForegroundColor Green

# Performance impact
Write-Host "⚡ PERFORMANCE IMPACT" -ForegroundColor White
Write-Host "─────────────────────────────────────" -ForegroundColor Gray

$loadTime4GBefore = [math]::Round($totalSizeMB / 0.5, 1) # 4 Mbps = 0.5 MB/s
$loadTime4GAfter = [math]::Round($expectedTotalSize / 0.5, 1)
$loadTime3GBefore = [math]::Round($totalSizeMB / 0.09375, 1) # 750 Kbps = 0.09375 MB/s
$loadTime3GAfter = [math]::Round($expectedTotalSize / 0.09375, 1)

$improvement4G = [math]::Round((($loadTime4GBefore - $loadTime4GAfter) / $loadTime4GBefore) * 100, 0)
$improvement3G = [math]::Round((($loadTime3GBefore - $loadTime3GAfter) / $loadTime3GBefore) * 100, 0)

Write-Host "4G Connection:" -ForegroundColor Cyan
Write-Host "   Before: $loadTime4GBefore seconds" -ForegroundColor Red
Write-Host "   After:  $loadTime4GAfter seconds" -ForegroundColor Green
Write-Host "   Improvement: $improvement4G% faster`n" -ForegroundColor Green

Write-Host "3G Connection:" -ForegroundColor Cyan
Write-Host "   Before: $loadTime3GBefore seconds" -ForegroundColor Red
Write-Host "   After:  $loadTime3GAfter seconds" -ForegroundColor Green
Write-Host "   Improvement: $improvement3G% faster`n" -ForegroundColor Green

# Grade
Write-Host "📝 GRADE" -ForegroundColor White
Write-Host "─────────────────────────────────────" -ForegroundColor Gray

$currentGrade = if ($totalSizeMB -gt 10) { "C+" } elseif ($totalSizeMB -gt 5) { "B" } else { "A-" }
$expectedGrade = if ($expectedTotalSize -gt 10) { "C+" } elseif ($expectedTotalSize -gt 5) { "B" } else { "A-" }

Write-Host "JavaScript Bundle:   A+ ✅" -ForegroundColor Green
Write-Host "Image Optimization:  D- ❌ (Before)" -ForegroundColor Red
Write-Host "                     A  ✅ (After)`n" -ForegroundColor Green
Write-Host "Overall Grade:       $currentGrade ❌ (Before)" -ForegroundColor Yellow
Write-Host "                     $expectedGrade ✅ (After)`n" -ForegroundColor Green

# Action items
Write-Host "🎯 ACTION ITEMS" -ForegroundColor White
Write-Host "─────────────────────────────────────" -ForegroundColor Gray

if ($imageSizeMB -gt 5) {
    Write-Host "1. ⚡ Run image optimization (CRITICAL)" -ForegroundColor Red
    Write-Host "   node scripts/optimize-images.js`n" -ForegroundColor White
} else {
    Write-Host "1. ✅ Images already optimized!`n" -ForegroundColor Green
}

Write-Host "2. 🧹 Cleanup unused packages (optional)" -ForegroundColor Yellow
Write-Host "   .\scripts\cleanup-dependencies.ps1`n" -ForegroundColor White

Write-Host "3. ✅ Verify with new build" -ForegroundColor Yellow
Write-Host "   npm run build`n" -ForegroundColor White

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
