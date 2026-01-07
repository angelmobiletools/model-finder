
// Paste this in the Console at https://chimeratool.com/en/models
(async () => {
    console.log("Starting ChimeraTool Scraper...");
    const allModels = [];
    const brandsSet = new Set();

    // 1. Get Brands
    const brandLinks = Array.from(document.querySelectorAll('.sm-v2__index__brand'));
    const brands = brandLinks.map(b => {
        const href = b.getAttribute('href');
        const name = href.split('/').pop().toUpperCase();

        // Count is usually in a strong tag, e.g. "Samsung <strong>2915</strong>"
        // Clean text to get number
        let countText = b.innerText.replace(b.getAttribute('data-name') || '', '').trim();
        // Fallback or regex to extract number if structure varies
        const match = b.innerText.match(/(\d+)/);
        const count = match ? parseInt(match[0], 10) : 0;

        return { name, href, count };
    });

    console.log(`Found ${brands.length} brands.`);

    // 2. Iterate Brands
    for (const brand of brands) {
        console.log(`Scraping ${brand.name} (${brand.count} models)...`);
        brandsSet.add(brand.name);

        const totalPages = Math.ceil(brand.count / 30); // 30 items per page based on observation

        for (let p = 0; p < totalPages; p++) {
            const url = `https://chimeratool.com${brand.href}?p=${p}`;
            try {
                const response = await fetch(url);
                const text = await response.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(text, 'text/html');

                const cards = Array.from(doc.querySelectorAll('.sm-v2__index__model'));

                cards.forEach(card => {
                    const modelNameEl = card.querySelector('.sm-v2__index__model__name');
                    const typeEl = card.querySelector('.sm-v2__index__model__type');
                    const features = Array.from(card.querySelectorAll('.sm-v2__index__model__feature span'))
                        .map(s => s.innerText.trim());

                    if (modelNameEl) {
                        const rawName = modelNameEl.innerText.trim();
                        let modelName = rawName;
                        if (modelName.toUpperCase().startsWith(brand.name + ' ')) {
                            modelName = modelName.substring(brand.name.length).trim();
                        }

                        allModels.push({
                            brand: brand.name,
                            model: modelName,
                            codename: typeEl ? typeEl.innerText.trim() : '',
                            operations: features,
                            status: 'Supported',
                            tool: 'ChimeraTool'
                        });
                    }
                });

            } catch (e) {
                console.error(`Error fetching ${brand.name} page ${p}:`, e);
            }
            // Rate limit courtesy
            await new Promise(r => setTimeout(r, 200));
        }
    }

    console.log(`Finished! Found ${allModels.length} models.`);

    // 3. Download
    const data = {
        brands_chimeratool: Array.from(brandsSet).sort().map(b => ({ icon: '🦁', name: b })),
        mobileData_chimeratool: allModels
    };

    const blob = new Blob([JSON.stringify(data, null, 4)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "chimeratool_full_data.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
})();
