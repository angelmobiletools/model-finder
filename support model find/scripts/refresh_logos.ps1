
# Download clean, transparent PNGs/SVGs for problematic logos

# Tecno - Get a text logo or simple icon, not the blue box one
Invoke-WebRequest -Uri "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Tecno_Mobile_logo.svg/512px-Tecno_Mobile_logo.svg.png" -OutFile "logos\tecno.png"

# Infinix - Get the text logo, not the icon
Invoke-WebRequest -Uri "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Infinix.svg/512px-Infinix.svg.png" -OutFile "logos\infinix.png"

# Realme - Get strict yellow background or text? 
# The user's image shows the yellow box. I'll stick with the favicon I pulled earlier unless they want text.
# Let's actually get the text version for consistency with Samsung/Oppo/Vivo
Invoke-WebRequest -Uri "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Realme_logo.svg/512px-Realme_logo.svg.png" -OutFile "logos\realme.png"

# Vsmart - Ensure it's clean
Invoke-WebRequest -Uri "https://upload.wikimedia.org/wikipedia/commons/2/2a/Vsmart_logo.png" -OutFile "logos\vsmart.png"
