
$logos = @{
    "xiaomi"  = "https://cdn.simpleicons.org/xiaomi"
    "samsung" = "https://cdn.simpleicons.org/samsung"
    "huawei"  = "https://cdn.simpleicons.org/huawei"
    "oppo"    = "https://cdn.simpleicons.org/oppo"
    "realme"  = "https://www.google.com/s2/favicons?domain=realme.com&sz=128"
    "vivo"    = "https://cdn.simpleicons.org/vivo"
    "asus"    = "https://cdn.simpleicons.org/asus"
    "tecno"   = "https://www.google.com/s2/favicons?domain=tecno-mobile.com&sz=128"
    "lenovo"  = "https://cdn.simpleicons.org/lenovo"
    "infinix" = "https://www.google.com/s2/favicons?domain=infinixmobility.com&sz=128"
    "nokia"   = "https://cdn.simpleicons.org/nokia"
    "vsmart"  = "https://www.google.com/s2/favicons?domain=vsmart.net&sz=128"
    "lg"      = "https://cdn.simpleicons.org/lg"
    "meizu"   = "https://cdn.simpleicons.org/meizu"
}

# Ensure directory exists
New-Item -ItemType Directory -Force -Path "logos"

foreach ($brand in $logos.Keys) {
    $url = $logos[$brand]
    $ext = "svg"
    if ($url -like "*google.com*") { $ext = "png" }
    
    $output = "logos\$brand.$ext"
    echo "Downloading $brand to $output..."
    
    try {
        Invoke-WebRequest -Uri $url -OutFile $output -UserAgent "Mozilla/5.0"
    }
    catch {
        echo "Failed to download $brand"
    }
}
