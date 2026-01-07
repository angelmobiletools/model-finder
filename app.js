document.addEventListener('DOMContentLoaded', () => {
    const brandGrid = document.getElementById('brand-grid');
    const brandSelect = document.getElementById('brand-select');
    const modelsTableBody = document.getElementById('models-body');
    const mainSearch = document.getElementById('main-search');
    const modelCount = document.getElementById('model-count');
    const noResultsDiv = document.getElementById('no-results');
    const modelFilterInput = document.getElementById('model-filter');

    // Aggregate Data Sources
    // Add new data arrays here as they become available
    const dataSources = [
        { name: 'AMT', data: mobileData_amt },
        { name: 'UnlockTool', data: mobileData_unlocktool },
        { name: 'ChimeraTool', data: mobileData_chimeratool },
        { name: 'TSM Tool', data: mobileData_tsm }
    ];

    // Merge Brands
    const brandsMap = new Map();
    [...brands_amt, ...brands_unlocktool, ...brands_chimeratool, ...brands_tsm].forEach(b => {
        if (!brandsMap.has(b.name)) {
            brandsMap.set(b.name, b);
        }
    }); // Add future brand arrays here: ...brands_newtool
    const brands = Array.from(brandsMap.values());

    // Merge Mobile Data
    // Key: Brand|Model|Codename (normalized)
    // Key: Brand|Model (normalized)
    const modelsMap = new Map();

    dataSources.forEach(source => {
        source.data.forEach(item => {
            // Create a unique key
            const brand = (item.brand || '').trim().toUpperCase();
            const model = (item.model || '').trim().toUpperCase();
            const key = `${brand}|${model}`;

            if (modelsMap.has(key)) {
                const existing = modelsMap.get(key);

                // Merge Tool Name string for search
                if (!existing.tool.includes(item.tool)) {
                    existing.tool += `, ${item.tool}`;
                }

                // Merge Operations (Master Set)
                const existingOps = new Set(existing.operations);
                item.operations.forEach(op => existingOps.add(op));
                existing.operations = Array.from(existingOps);

                // Granular Tool Details
                if (!existing.toolDetails) existing.toolDetails = {};
                existing.toolDetails[item.tool] = item.operations;

                // Merge Codenames
                const newCodename = (item.codename || '').trim();
                if (newCodename && !existing.codename.toUpperCase().includes(newCodename.toUpperCase())) {
                    existing.codename += ` / ${newCodename}`;
                }

            } else {
                // New Item
                const newItem = { ...item };
                newItem.toolDetails = {};
                newItem.toolDetails[item.tool] = item.operations;
                modelsMap.set(key, newItem);
            }
        });
    });

    const mobileData = Array.from(modelsMap.values());

    let activeBrand = 'all';
    let searchQuery = '';

    // Initialize Brands
    // Priority Brands Configuration
    const priorityBrands = [
        'Xiaomi', 'Samsung', 'Huawei', 'Oppo', 'Realme', 'Vivo',
        'Asus', 'Tecno', 'Lenovo', 'Infinix', 'Nokia'
    ];

    const brandLogos = {
        'Xiaomi': 'logos/xiaomi.png',
        'Samsung': 'logos/samsung.png',
        'Huawei': 'logos/huawei.png',
        'Oppo': 'logos/oppo.png',
        'Realme': 'logos/realme.png',
        'Vivo': 'logos/vivo.png',
        'Asus': 'logos/asus.png',
        'Tecno': 'logos/tecno.png',
        'Lenovo': 'logos/lenovo.png',
        'Infinix': 'logos/infinix.png',
        'Nokia': 'logos/nokia.png',
        'Vsmart': 'logos/vsmart.png',
        'LG': 'logos/lg.png',
        'Meizu': 'logos/meizu.png'
    };

    const initBrands = () => {
        brandGrid.innerHTML = '';
        brandSelect.innerHTML = '<option value="all">All Brands</option>';

        // 1. Render Priority Brands
        priorityBrands.forEach(name => {
            const card = document.createElement('div');
            card.className = 'brand-card';
            if (activeBrand.toLowerCase() === name.toLowerCase()) card.classList.add('active');

            card.innerHTML = `
                <img src="${brandLogos[name]}" alt="${name}" class="brand-logo-img">
            `;

            card.onclick = () => filterByBrand(name);
            brandGrid.appendChild(card);

            // Add to dropdown
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            brandSelect.appendChild(option);
        });

        // 2. Render "Others" Card
        const othersCard = document.createElement('div');
        othersCard.className = 'brand-card other-card';
        if (activeBrand === 'Others') othersCard.classList.add('active');
        othersCard.onclick = () => filterByBrand('Others');
        othersCard.innerHTML = `
            <div class="brand-logo-text">Others</div>
        `;
        brandGrid.appendChild(othersCard);

        const otherOption = document.createElement('option');
        otherOption.value = 'Others';
        otherOption.textContent = 'Others';
        brandSelect.appendChild(otherOption);
    };

    const filterByBrand = (brand) => {
        activeBrand = brand;

        // Update Grid UI
        document.querySelectorAll('.brand-card').forEach(card => {
            card.classList.remove('active');
            const img = card.querySelector('img');
            if (brand === 'Others') {
                if (card.classList.contains('other-card')) card.classList.add('active');
            } else if (img && img.alt.toLowerCase() === brand.toLowerCase()) {
                card.classList.add('active');
            }
        });

        // Update Select UI
        // Try to match value exactly, or 'Others'
        const matchedOption = Array.from(brandSelect.options).find(o => o.value.toLowerCase() === brand.toLowerCase());
        if (matchedOption) brandSelect.value = matchedOption.value;
        else brandSelect.value = 'Others'; // Fallback if user clicked a specific brand that is somehow not in select? No, priority brands are in select.

        renderModels();

        if (window.innerWidth < 768) {
            document.getElementById('models').scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Modal Elements
    const modal = document.getElementById('ops-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const modalClose = document.getElementById('modal-close');

    // Modal Functions
    const openModal = (toolName, ops) => {
        if (!modal || !modalTitle || !modalBody) {
            console.error('Modal elements not found');
            return;
        }
        modalTitle.textContent = `${toolName} - Supported Operations`;
        if (Array.isArray(ops) && ops.length > 0) {
            modalBody.innerHTML = ops.map(op => `<span class="tag status-supported">${op}</span>`).join('');
        } else {
            modalBody.innerHTML = '<p>No specific operations listed.</p>';
        }
        modal.classList.remove('hidden');
    };

    const closeModal = () => {
        modal.classList.add('hidden');
    };

    if (modalClose) modalClose.addEventListener('click', closeModal);

    if (modal) modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Check Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) closeModal();
    });

    // Pagination State
    let currentPage = 1;
    const itemsPerPage = 10;
    const paginationControls = document.getElementById('pagination-controls');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const pageInfo = document.getElementById('page-info');

    const updatePagination = (totalItems) => {
        const totalPages = Math.ceil(totalItems / itemsPerPage);

        if (totalItems <= itemsPerPage) {
            paginationControls.classList.add('hidden');
        } else {
            paginationControls.classList.remove('hidden');
        }

        pageInfo.textContent = `Page ${currentPage} of ${totalPages || 1}`;
        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = currentPage === totalPages || totalPages === 0;
    };

    if (prevBtn) prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderModels(false);
            // Scroll to top of table
            const table = document.getElementById('models-table');
            if (table) table.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });

    if (nextBtn) nextBtn.addEventListener('click', () => {
        // Calculate max pages based on current filtered count (need access to it?)
        // We will handle safety in renderModels by checking limit.
        currentPage++;
        renderModels(false);
        const table = document.getElementById('models-table');
        if (table) table.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    const renderModels = (resetPage = false) => {
        if (resetPage) currentPage = 1;

        modelsTableBody.innerHTML = '';
        let filtered = mobileData;

        // 1. Brand Filter
        if (activeBrand !== 'all') {
            if (activeBrand === 'Others') {
                const prioritySet = new Set(priorityBrands.map(b => b.toLowerCase()));
                filtered = filtered.filter(item => !prioritySet.has(item.brand.toLowerCase()));
            } else {
                filtered = filtered.filter(item => item.brand.toLowerCase() === activeBrand.toLowerCase());
            }
        }
        // 2. Main Search
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(item =>
                item.brand.toLowerCase().includes(q) ||
                item.model.toLowerCase().includes(q) ||
                (item.codename && item.codename.toLowerCase().includes(q))
            );
        }
        // 3. Model Filter
        if (modelFilterInput) {
            const modelFilterValue = modelFilterInput.value.trim().toLowerCase();
            if (modelFilterValue) {
                filtered = filtered.filter(item =>
                    item.model.toLowerCase().includes(modelFilterValue) ||
                    (item.codename && item.codename.toLowerCase().includes(modelFilterValue))
                );
            }
        }

        modelCount.textContent = filtered.length;

        // Update Pagination Controls
        updatePagination(filtered.length);
        const totalPages = Math.ceil(filtered.length / itemsPerPage);
        if (currentPage > totalPages && totalPages > 0) currentPage = totalPages; // Safety reset if current page is beyond new total
        if (currentPage === 0 && totalPages > 0) currentPage = 1; // Safety reset if current page is 0

        if (filtered.length === 0) {
            noResultsDiv.classList.remove('hidden');
            paginationControls.classList.add('hidden');
            return;
        } else {
            noResultsDiv.classList.add('hidden');

            // Paginate
            const start = (currentPage - 1) * itemsPerPage;
            const end = start + itemsPerPage;
            const paginatedItems = filtered.slice(start, end);

            paginatedItems.forEach((item, index) => {
                const row = document.createElement('tr');

                // Tool Badges
                const tools = item.toolDetails ? Object.keys(item.toolDetails) : item.tool.split(',').map(t => t.trim());

                // Cells
                const brandCell = `<td><span class="brand-badge">${item.brand}</span></td>`;
                const modelCell = `<td><div class="model-name">${item.model}</div></td>`;
                const codeCell = `<td><code class="codename">${item.codename || '-'}</code></td>`;
                // Operations Cell
                const opsCell = `<td class="ops-display-cell"><span class="text-muted" style="font-size:0.8rem; color: #aaa;">Click a tool to view operations</span></td>`;

                row.innerHTML = brandCell + modelCell + codeCell + opsCell;

                // Tool Cell with Buttons
                const toolTd = document.createElement('td');
                tools.forEach(toolName => {
                    const btn = document.createElement('button');
                    let cls = 'status-beta tool-btn';
                    if (['AMT Tool', 'UnlockTool', 'ChimeraTool', 'TSM Tool', 'AMT', 'UnlockTool', 'Chimera', 'TSM'].includes(toolName.trim())) {
                        cls = 'status-supported tool-btn';
                    }
                    btn.className = cls;
                    btn.textContent = toolName;

                    btn.onclick = (e) => {
                        e.stopPropagation();
                        // Clear active
                        toolTd.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');

                        // Get Ops
                        let ops = [];
                        if (item.toolDetails && item.toolDetails[toolName]) {
                            ops = item.toolDetails[toolName];
                        } else if (item.operations) {
                            ops = item.operations;
                        }

                        // Update Cell Directly
                        const targetCell = row.querySelector('.ops-display-cell');
                        if (targetCell) {
                            if (Array.isArray(ops) && ops.length > 0) {
                                targetCell.innerHTML = ops.map(op => `<span class="tag status-supported">${op}</span>`).join('');
                            } else {
                                targetCell.innerHTML = '<span class="text-muted">No details available</span>';
                            }
                        }
                    };
                    toolTd.appendChild(btn);
                });

                row.appendChild(toolTd);
                row.appendChild(document.createElement('td')).innerHTML = `<span class="status-supported">Supported</span>`;

                modelsTableBody.appendChild(row);
            });
        }
    };

    brandSelect.addEventListener('change', (e) => {
        activeBrand = e.target.value;
        document.querySelectorAll('.brand-card').forEach(c => {
            c.classList.toggle('active', c.dataset.brand === activeBrand);
        });
        renderModels(true);
    });

    // Autocomplete Logic
    const suggestionsBox = document.getElementById('search-suggestions');

    const showSuggestions = (query) => {
        if (!query || query.length < 2) {
            suggestionsBox.classList.add('hidden');
            return;
        }

        const normalizedQuery = query.toLowerCase();

        // Limit matches
        const matches = mobileData.filter(item => {
            const str = `${item.brand} ${item.model}`.toLowerCase();
            return str.includes(normalizedQuery);
        }).slice(0, 10);

        if (matches.length === 0) {
            suggestionsBox.classList.add('hidden');
            return;
        }

        suggestionsBox.innerHTML = '';
        matches.forEach(match => {
            const div = document.createElement('div');
            div.className = 'suggestion-item';
            div.innerHTML = `
                <div>
                    <span class="suggestion-brand">${match.brand}</span>
                    <span class="suggestion-model">${match.model}</span>
                </div>
            `;
            div.addEventListener('click', () => {
                const fullName = `${match.brand} ${match.model}`;
                mainSearch.value = fullName;
                searchQuery = fullName;
                renderModels(true);
                suggestionsBox.classList.add('hidden');
            });
            suggestionsBox.appendChild(div);
        });

        suggestionsBox.classList.remove('hidden');
    };

    document.addEventListener('click', (e) => {
        if (!mainSearch.contains(e.target) && !suggestionsBox.contains(e.target)) {
            suggestionsBox.classList.add('hidden');
        }
    });

    // Model Search Button Listener
    const modelSearchBtn = document.getElementById('model-search-btn');
    if (modelSearchBtn) {
        modelSearchBtn.addEventListener('click', () => {
            renderModels(true);
        });
    }

    // New Listener for Input (Real-time)
    if (modelFilterInput) {
        modelFilterInput.addEventListener('input', () => {
            renderModels(true);
        });
        modelFilterInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') renderModels(true);
        });
    }

    mainSearch.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        renderModels(true);
        showSuggestions(searchQuery);
    });

    mainSearch.addEventListener('focus', (e) => {
        if (searchQuery.length >= 2) {
            showSuggestions(searchQuery);
        }
    });

    // Initialize
    initBrands();
    renderModels();
});
