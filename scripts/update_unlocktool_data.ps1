
# Set encoding
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$jsonFile = "unlocktool_full_data.json"
$outputFile = "data_unlocktool.js"

if (-not (Test-Path $jsonFile)) {
    Write-Error "File $jsonFile not found!"
    exit 1
}

$jsonData = Get-Content -Raw -Encoding utf8 $jsonFile | ConvertFrom-Json

$brands = $jsonData.brands_unlocktool
$models = $jsonData.mobileData_unlocktool

Write-Host "Processing $($models.Count) models..."

# Ensure icons are correct (fix encoding if needed)
$defaultIcon = [char]::ConvertFromUtf32(0x1F527)
foreach ($b in $brands) {
    if (-not $b.icon) {
        $b | Add-Member -MemberType NoteProperty -Name "icon" -Value $defaultIcon
    }
}

# Ensure tool property is set
foreach ($m in $models) {
    if (-not $m.tool) {
        $m | Add-Member -MemberType NoteProperty -Name "tool" -Value "UnlockTool"
    }
}

$brandsJson = $brands | ConvertTo-Json -Depth 10
$modelsJson = $models | ConvertTo-Json -Depth 10

$jsContent = @"
const brands_unlocktool = $brandsJson;

const mobileData_unlocktool = $modelsJson;
"@

$jsContent | Set-Content -Encoding utf8 $outputFile
Write-Host "Updated $outputFile with full dataset."
