
$logos = @{
    "samsung" = "https://logo.clearbit.com/samsung.com"
    "huawei"  = "https://logo.clearbit.com/huawei.com"
    "oppo"    = "https://logo.clearbit.com/oppo.com"
    "vsmart"  = "https://logo.clearbit.com/vsmart.net" 
    "nokia"   = "https://logo.clearbit.com/nokia.com"
    "infinix" = "https://logo.clearbit.com/infinixmobility.com"
    "meizu"   = "https://logo.clearbit.com/meizu.com"
    "lg"      = "https://logo.clearbit.com/lg.com"
}

foreach ($brand in $logos.Keys) {
    if (-not (Test-Path "logos\$brand.png")) {
        echo "Retrying $brand..."
        try {
            Invoke-WebRequest -Uri $logos[$brand] -OutFile "logos\$brand.png" -UserAgent "Mozilla/5.0"
        }
        catch {
            echo "Failed again: $brand"
        }
    }
}
