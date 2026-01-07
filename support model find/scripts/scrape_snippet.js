
// Paste this code into the Console tab (F12) of the UnlockTool models page
(async () => {
    const totalPages = 23;
    let allModels = [];
    const brandsSet = new Set();

    console.log("Starting scraping...");

    for (let i = 1; i <= totalPages; i++) {
        console.log(`fetching page ${i}...`);
        try {
            const response = await fetch(`https://unlocktool.net/models/?page=${i}`);
            const text = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, 'text/html');

            const rows = Array.from(doc.querySelectorAll('table tbody tr'));

            rows.forEach(row => {
                const cells = row.querySelectorAll('td');
                if (cells.length >= 4) {
                    const modelNameRaw = cells[0].innerText.trim();
                    const codename = cells[1].innerText.trim();
                    // cell 2 is SoC
                    const badges = Array.from(cells[3].querySelectorAll('.badge')).map(b => b.innerText.trim());

                    if (modelNameRaw) {
                        // Extract Brand
                        // Heuristic: First word is brand
                        let brand = modelNameRaw.split(' ')[0].toUpperCase();
                        let model = modelNameRaw;

                        // Clean model name if it starts with Brand
                        if (model.toUpperCase().startsWith(brand + ' ')) {
                            model = model.substring(brand.length).trim();
                        }

                        brandsSet.add(brand);

                        allModels.push({
                            brand: brand,
                            model: model,
                            codename: codename,
                            operations: badges,
                            status: 'Supported',
                            tool: 'UnlockTool'
                        });
                    }
                }
            });

        } catch (e) {
            console.error(`Error fetching page ${i}:`, e);
        }

        // Polite delay
        await new Promise(r => setTimeout(r, 1000));
    }

    console.log(`Finished! Found ${allModels.length} models.`);

    // Prepare Data for Download
    const brandsArray = Array.from(brandsSet).sort().map(b => ({
        icon: '🔧', // or use a specific one
        name: b
    }));

    const finalData = {
        brands_unlocktool: brandsArray,
        mobileData_unlocktool: allModels
    };

    // Trigger Download
    const blob = new Blob([JSON.stringify(finalData, null, 4)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "unlocktool_full_data.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
})();
