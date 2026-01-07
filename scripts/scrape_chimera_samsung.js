
(async () => {
    console.log("Starting ChimeraTool Samsung Scraper...");
    const allModels = [];
    const brandName = "SAMSUNG";
    // We know roughly 3000 models, 30 per page -> 100 pages. Safety buffer to 110.
    const maxPages = 110;

    for (let p = 0; p < maxPages; p++) {
        console.log(`Fetching page ${p}...`);
        const url = `https://chimeratool.com/en/models/samsung?p=${p}`;
        try {
            const response = await fetch(url);
            const text = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, 'text/html');

            const cards = Array.from(doc.querySelectorAll('.sm-v2__index__model'));

            if (cards.length === 0) {
                console.log(`No cards on page ${p}, stopping.`);
                break;
            }

            cards.forEach(card => {
                const modelNameEl = card.querySelector('.sm-v2__index__model__name');
                const typeEl = card.querySelector('.sm-v2__index__model__type');
                const features = Array.from(card.querySelectorAll('.sm-v2__index__model__feature span'))
                    .map(s => s.innerText.trim());

                if (modelNameEl) {
                    const rawName = modelNameEl.innerText.trim();
                    let modelName = rawName;
                    // Clean "Samsung" prefix if present
                    if (modelName.toUpperCase().startsWith("SAMSUNG ")) {
                        modelName = modelName.substring(8).trim();
                    }

                    allModels.push({
                        brand: brandName,
                        model: modelName,
                        codename: typeEl ? typeEl.innerText.trim() : '',
                        operations: features,
                        status: 'Supported',
                        tool: 'ChimeraTool'
                    });
                }
            });

        } catch (e) {
            console.error(`Error fetching page ${p}:`, e);
        }

        // Polite delay
        await new Promise(r => setTimeout(r, 500));
    }

    console.log(`Finished! Found ${allModels.length} Samsung models.`);

    // Download
    const data = {
        mobileData_chimeratool_samsung: allModels
    };

    const blob = new Blob([JSON.stringify(data, null, 4)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "chimera_samsung.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
})();
