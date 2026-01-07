
(async () => {
    console.log("Starting TSM Tool Scraper...");
    const allModels = [];
    const brandsSet = new Set();

    // 1. Get Brands from Main Page
    // The main page has cards with class "card clickable" and data-url like "/SupportedModels/Ace"
    const brandCards = Array.from(document.querySelectorAll('.card.clickable[data-url]'));

    console.log(`Found ${brandCards.length} brands.`);

    for (const card of brandCards) {
        const brandUrl = card.getAttribute('data-url');
        const rawBrandName = card.querySelector('.device-name') ? card.querySelector('.device-name').innerText.trim() : '';
        const brandName = rawBrandName.replace(/[\u{1F300}-\u{1F6FF}]/gu, '').trim(); // Remove emojis if any

        // Skip correct URL check/validation if needed, but assuming valid
        if (!brandUrl) continue;

        console.log(`Scraping ${brandName} (${brandUrl})...`);
        brandsSet.add(brandName);

        try {
            const response = await fetch(brandUrl);
            const text = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, 'text/html');

            // 2. Extract Models from Brand Page
            // Models are in .card elements (not necessarily clickable) inside .card-container
            // But wait, the main page ALSO has .card elements. 
            // The brand page structure: .card-container > .card
            // Each card has h2.device-name, .device-models, .function

            const modelCards = Array.from(doc.querySelectorAll('.card-container .card'));

            modelCards.forEach(mc => {
                // Ignore if it's just a navigation card (check for device-models to be sure?)
                // Or check for h2.device-name
                const nameEl = mc.querySelector('.device-name');
                if (!nameEl) return;

                let modelName = nameEl.innerText.trim();
                // Clean brand name from model name if present
                if (modelName.toUpperCase().startsWith(brandName.toUpperCase() + ' ')) {
                    modelName = modelName.substring(brandName.length).trim();
                }

                // Get Model Number / Codename
                const modelsEl = mc.querySelector('.device-models');
                let codename = '';
                if (modelsEl) {
                    codename = modelsEl.innerText.replace('Models:', '').trim();
                }

                // Get Chip
                const chipEl = mc.querySelector('.device-chip');
                if (chipEl) {
                    // Normalize "Chip:MTK" -> "MTK"
                    // Add it to codename or just ignore? maybe useful for display.
                    // For now, ignore or append to codename?
                    // Let's append to codename for better search: "SM-G998B (Exynos)"
                }

                // Get Features
                const featureEls = Array.from(mc.querySelectorAll('.function .function-name'));
                const features = featureEls.map(f => f.innerText.trim());

                allModels.push({
                    brand: brandName,
                    model: modelName,
                    codename: codename,
                    operations: features,
                    status: 'Supported',
                    tool: 'TSM Tool'
                });
            });

            console.log(`  Found ${modelCards.length} models for ${brandName}.`);

        } catch (e) {
            console.error(`Error fetching ${brandName}:`, e);
        }

        // Polite delay
        await new Promise(r => setTimeout(r, 500));
    }

    console.log(`Finished! Found ${allModels.length} TSM models.`);

    // 3. Download
    // Sort brands
    const sortedBrands = Array.from(brandsSet).sort().map(b => ({ icon: '🔧', name: b }));

    const data = {
        brands_tsm: sortedBrands,
        mobileData_tsm: allModels
    };

    const blob = new Blob([JSON.stringify(data, null, 4)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "tsm_full_data.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
})();
