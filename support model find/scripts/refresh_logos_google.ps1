
# Retry downloading clean logos using Google Favicon Service (High Res)

function Download-Logo {
    param ($Url, $Path)
    try {
        Invoke-WebRequest -Uri $Url -OutFile $Path -UserAgent "Mozilla/5.0"
        Write-Host "Downloaded: $Path"
    }
    catch {
        Write-Host "Failed: $Path"
    }
}

# Tecno - Google Large Favicon (usually clean)
Download-Logo "https://www.google.com/s2/favicons?domain=tecno-mobile.com&sz=256" "logos\tecno.png"

# Infinix - Google Large Favicon
Download-Logo "https://www.google.com/s2/favicons?domain=infinixmobility.com&sz=256" "logos\infinix.png"

# Realme - Google Large Favicon (Clean Yellow 'r')
Download-Logo "https://www.google.com/s2/favicons?domain=realme.com&sz=256" "logos\realme.png"

# Vsmart
Download-Logo "https://www.google.com/s2/favicons?domain=vsmart.net&sz=256" "logos\vsmart.png"
