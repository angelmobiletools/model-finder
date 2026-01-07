
# Set encoding
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$baseJsonFile = "chimeratool_full_data.json"
$samsungJsonFile = "chimera_samsung.json"
$outputFile = "data_chimeratool.js"

if (-not (Test-Path $baseJsonFile)) { Write-Error "$baseJsonFile missing"; exit 1 }
if (-not (Test-Path $samsungJsonFile)) { Write-Error "$samsungJsonFile missing"; exit 1 }

$baseData = Get-Content -Raw -Encoding utf8 $baseJsonFile | ConvertFrom-Json
$samsungData = Get-Content -Raw -Encoding utf8 $samsungJsonFile | ConvertFrom-Json

$brands = $baseData.brands_chimeratool
$models = $baseData.mobileData_chimeratool
$newModels = $samsungData.mobileData_chimeratool_samsung

Write-Host "Base models: $($models.Count)"
Write-Host "New Samsung models: $($newModels.Count)"

# Add Samsung to models list
$models += $newModels

# Add Samsung to brands list if missing (it likely exists but check)
$samsungBrand = $brands | Where-Object { $_.name -eq "SAMSUNG" }
if (-not $samsungBrand) {
    $brands += [PSCustomObject]@{
        icon = [char]::ConvertFromUtf32(0x1F981)
        name = "SAMSUNG"
    }
}

# Ensure properties
foreach ($m in $models) {
    if (-not $m.tool) { $m | Add-Member -MemberType NoteProperty -Name "tool" -Value "ChimeraTool" -Force }
}

Write-Host "Total models after merge: $($models.Count)"

$brandsJson = $brands | ConvertTo-Json -Depth 10
$modelsJson = $models | ConvertTo-Json -Depth 10

$jsContent = @"
const brands_chimeratool = $brandsJson;

const mobileData_chimeratool = $modelsJson;
"@

$jsContent | Set-Content -Encoding utf8 $outputFile
Write-Host "Updated $outputFile"
