
# Set encoding
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$jsonFile = "tsm_full_data.json"
$outputFile = "data_tsm.js"

if (-not (Test-Path $jsonFile)) {
    Write-Error "File $jsonFile not found!"
    exit 1
}

$jsonData = Get-Content -Raw -Encoding utf8 $jsonFile | ConvertFrom-Json

$brands = $jsonData.brands_tsm
$models = $jsonData.mobileData_tsm

Write-Host "Processing $($models.Count) models..."

# Ensure icons/tool property
$defaultIcon = [char]::ConvertFromUtf32(0x1F527) # Wrench for TSM
foreach ($b in $brands) {
    if (-not $b.icon) {
        $b | Add-Member -MemberType NoteProperty -Name "icon" -Value $defaultIcon
    }
}

foreach ($m in $models) {
    if (-not $m.tool) {
        $m | Add-Member -MemberType NoteProperty -Name "tool" -Value "TSM Tool"
    }
    else {
        $m.tool = "TSM Tool"
    }
}

$brandsJson = $brands | ConvertTo-Json -Depth 10
$modelsJson = $models | ConvertTo-Json -Depth 10

$jsContent = @"
const brands_tsm = $brandsJson;

const mobileData_tsm = $modelsJson;
"@

$jsContent | Set-Content -Encoding utf8 $outputFile
Write-Host "Created $outputFile with $($models.Count) models."
