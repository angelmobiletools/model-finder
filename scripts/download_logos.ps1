
$logos = @{
    "xiaomi"  = "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Xiaomi_logo_%282021-%29.svg/1024px-Xiaomi_logo_%282021-%29.svg.png"
    "samsung" = "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Samsung_Logo.svg/1024px-Samsung_Logo.svg.png"
    "huawei"  = "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Huawei_Logo.svg/1024px-Huawei_Logo.svg.png"
    "oppo"    = "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Oppo_logo.svg/1024px-Oppo_logo.svg.png"
    "realme"  = "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Realme_logo.svg/1024px-Realme_logo.svg.png"
    "vivo"    = "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Vivo_logo_2019.svg/1024px-Vivo_logo_2019.svg.png"
    "vsmart"  = "https://upload.wikimedia.org/wikipedia/commons/2/2a/Vsmart_logo.png"
    "asus"    = "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/ASUS_Logo.svg/1024px-ASUS_Logo.svg.png"
    "tecno"   = "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Tecno_Mobile_logo.svg/1024px-Tecno_Mobile_logo.svg.png"
    "lenovo"  = "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Lenovo_logo_2015.svg/1024px-Lenovo_logo_2015.svg.png"
    "infinix" = "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Infinix.svg/1024px-Infinix.svg.png"
    "lg"      = "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/LG_logo_%282015%29.svg/1024px-LG_logo_%282015%29.svg.png"
    "meizu"   = "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Meizu_Logo.svg/1024px-Meizu_Logo.svg.png"
    "nokia"   = "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Nokia_wordmark.svg/1024px-Nokia_wordmark.svg.png"
}

foreach ($brand in $logos.Keys) {
    echo "Downloading $brand..."
    try {
        Invoke-WebRequest -Uri $logos[$brand] -OutFile "logos\$brand.png" -UserAgent "Mozilla/5.0"
    }
    catch {
        echo "Failed to download $brand"
    }
}
