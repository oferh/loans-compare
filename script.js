// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Company data with logo placeholders
    const companies = {
        bank1: { name: 'בנק לאומי', logo: 'logos/leumi-logo.png' },
        bank2: { name: 'הבנק הבינלאומי', logo: 'logos/poalim-logo.png' },
        bank3: { name: 'בנק הפועלים', logo: 'logos/migdal-logo.png' },
        bank4: { name: 'בנק דיסקונט', logo: 'logos/isracart-logo.png' },
        credit1: { name: 'ישראכרט', logo: 'logos/cal-logo.png' },
        credit2: { name: 'לאומי קארד', logo: 'logos/mimun-yashir-logo.png' },
        other1: { name: 'חברת אשראי', logo: 'logos/phonix-logo.png' }
    };

    // Loan products data with company associations
    const loanProducts = [
        {
            name: 'משכנתא',
            terms: [false, true, true],  // [קצר, בינוני, ארוך]
            amounts: [false, true, true],  // [נמוך, בינוני, גבוה]
            color: '#FF6384',
            companies: ['bank1', 'bank2', 'bank3', 'bank4']
        },
        {
            name: 'משכנתא משלימה',
            terms: [false, true, true],
            amounts: [false, true, true],
            color: '#36A2EB',
            companies: ['bank1', 'bank3']
        },
        {
            name: 'הלוואה לרכישת רכב',
            terms: [false, true, false],
            amounts: [true, true, false],
            color: '#FFCE56',
            companies: ['bank1', 'bank2', 'credit1', 'credit2']
        },
        {
            name: 'הלוואת גישור',
            terms: [true, false, false],
            amounts: [false, true, false],
            color: '#4BC0C0',
            companies: ['bank1', 'other1']
        },
        {
            name: 'הלוואה חוץ בנקאית',
            terms: [false, true, false],
            amounts: [false, true, false],
            color: '#9966FF',
            companies: ['credit1', 'credit2', 'other1']
        },
        {
            name: 'הלוואת גישור כנגד בטוחה',
            terms: [true, false, false],
            amounts: [false, false, true],
            color: '#8A2BE2',
            companies: ['bank4', 'other1']
        },
        {
            name: 'אשראי צרכני ללא בטוחה',
            terms: [false, true, false],
            amounts: [true, false, false],
            color: '#FF9F40',
            companies: ['credit1', 'credit2']
        }
    ];
    
    // Helper function to get company logos HTML
    function getCompanyLogos(companyIds) {
        if (!companyIds || companyIds.length === 0) return '';
        
        // Generate a unique ID for each logo container to prevent conflicts
        const containerId = 'logos-' + Math.random().toString(36).substr(2, 9);
        
        // Create a style element to ensure our logos are displayed correctly
        const style = document.createElement('style');
        style.textContent = `
            #${containerId} {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                margin-top: 8px;
            }
            #${containerId} .company-logo {
                width: 30px;
                height: 30px;
                border-radius: 4px;
                overflow: hidden;
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            #${containerId} .company-logo img {
                max-width: 100%;
                max-height: 100%;
                object-fit: contain;
            }
        `;
        document.head.appendChild(style);
        
        // Generate the HTML for the logos
        const logosHTML = companyIds.map(companyId => {
            const company = companies[companyId];
            if (!company) return '';
            
            // Create SVG with proper encoding for Hebrew characters
            const svg = `<svg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'>
                <rect width='40' height='40' fill='#e2e8f0'/>
                <text x='20' y='25' font-family='Arial' font-size='12' text-anchor='middle' direction='rtl' unicode-bidi='bidi-override' 
                      fill='#264d7c'>
                    ${company.name.substring(0, 2).split('').reverse().join('')}
                </text>
            </svg>`;
            
            // Encode the SVG properly
            const encodedSvg = encodeURIComponent(svg)
                .replace(/'/g, '%27')
                .replace(/"/g, '%22');
                
            return `
                <div class="company-logo" title="${company.name}">
                    <img src="${company.logo}" 
                         alt="${company.name}" 
                         onerror="this.onerror=null; this.src='data:image/svg+xml;utf8,${encodedSvg}'">
                </div>
            `;
        }).join('');
        
        return `
            <div id="${containerId}" class="company-logos">
                ${logosHTML}
            </div>
        `;
    }

    const container = document.getElementById('chart-container');
    let currentChart = null;

    // Prepare data for charts
    const categories = [
        'טווח קצר', 'טווח בינוני', 'טווח ארוך',
        'סכום נמוך', 'סכום בינוני', 'סכום גבוה'
    ];

    // Initialize with bar chart
    createChart('heatmap');

    // Add event listeners for chart type buttons
    document.querySelectorAll('.chart-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // Update active button
            document.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Create the selected chart
            createChart(this.dataset.chartType);
        });
    });

    function createChart(type) {
        // Clear previous chart
        if (currentChart && currentChart.destroy) {
            currentChart.destroy();
        }
        
        // Clear container and prepare for new visualization
        container.innerHTML = '';
        
        switch (type) {
            case 'bar':
                container.innerHTML = '<canvas></canvas>';
                createBarChart(container.querySelector('canvas').getContext('2d'));
                break;
            case 'heatmap':
                container.innerHTML = '<canvas></canvas>';
                createHeatmap(container.querySelector('canvas').getContext('2d'));
                break;
            case 'parallel':
                container.innerHTML = '<canvas></canvas>';
                createParallelCoordinates(container.querySelector('canvas').getContext('2d'));
                break;
            case 'dotmatrix':
                createDotMatrix();
                break;
            case 'table':
                const tableContainer = createComparisonTable();
                container.appendChild(tableContainer);
                break;
            case 'smallmultiples':
                createSmallMultiples();
                break;
        }
    }

    function createBarChart(ctx) {
        // Group data by category (terms and amounts)
        const categoryGroups = [
            { name: 'טווח קצר', key: 'terms', index: 0 },
            { name: 'טווח בינוני', key: 'terms', index: 1 },
            { name: 'טווח ארוך', key: 'terms', index: 2 },
            { name: 'סכום נמוך', key: 'amounts', index: 0 },
            { name: 'סכום בינוני', key: 'amounts', index: 1 },
            { name: 'סכום גבוה', key: 'amounts', index: 2 }
        ];

        // Prepare datasets
        const datasets = loanProducts.map(product => ({
            label: product.name,
            data: categoryGroups.map(group => product[group.key][group.index] ? 1 : 0),
            backgroundColor: product.color + '80',
            borderColor: product.color,
            borderWidth: 1,
            barThickness: 'flex',
            maxBarThickness: 30,
            minBarLength: 5
        }));


        currentChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: categoryGroups.map(g => g.name),
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'x',
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            autoSkip: false,
                            maxRotation: 45,
                            minRotation: 45
                        }
                    },
                    y: {
                        beginAtZero: true,
                        max: 1,
                        ticks: {
                            stepSize: 1,
                            callback: value => value === 1 ? 'כן' : 'לא'
                        },
                        grid: {
                            display: true,
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                        rtl: true,
                        labels: {
                            usePointStyle: true,
                            boxWidth: 10,
                            padding: 20,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.raw ? 'כן' : 'לא'}`;
                            }
                        },
                        rtl: true,
                        displayColors: false
                    },
                    title: {
                        display: true,
                        text: 'זמינות מוצרי ההלוואה לפי קטגוריה',
                        font: {
                            size: 16,
                            weight: 'bold'
                        },
                        padding: {
                            bottom: 20
                        }
                    }
                },
                layout: {
                    padding: {
                        left: 10,
                        right: 10,
                        top: 10,
                        bottom: 10
                    }
                },
                barPercentage: 0.8,
                categoryPercentage: 0.8
            }
        });
    }


    function createHeatmap(ctx) {
        // Prepare data with company information for tooltips
        const data = {
            labels: categories,
            datasets: loanProducts.map((product, i) => ({
                label: product.name,
                data: [
                    ...product.terms.map((t, j) => ({
                        x: t ? j+1 : 0,
                        y: t ? 1 : 0,
                        companies: product.companies,
                    })),
                    ...product.amounts.map((a, j) => ({
                        x: a ? j+4 : 0,
                        y: a ? 1 : 0,
                        companies: product.companies,
                    })),
                ],
                backgroundColor: product.color + '80',
                borderColor: product.color,
                borderWidth: 1,
                companies: product.companies
            }))
        };

        currentChart = new Chart(ctx, {
            type: 'bar',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                    tooltip: {
                        enabled: false,
                        external: function(context) {
                            // Tooltip element
                            let tooltipEl = document.getElementById('chartjs-tooltip');
                            
                            // Create tooltip on first render
                            if (!tooltipEl) {
                                tooltipEl = document.createElement('div');
                                tooltipEl.id = 'chartjs-tooltip';
                                tooltipEl.style.background = 'rgba(255, 255, 255, 0.95)';
                                tooltipEl.style.borderRadius = '8px';
                                tooltipEl.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
                                tooltipEl.style.padding = '12px';
                                tooltipEl.style.pointerEvents = 'none';
                                tooltipEl.style.position = 'absolute';
                                tooltipEl.style.transform = 'translate(-50%, 0)';
                                tooltipEl.style.transition = 'all .1s ease';
                                tooltipEl.style.zIndex = '1000';
                                tooltipEl.style.maxWidth = '300px';
                                tooltipEl.style.border = '1px solid #e2e8f0';
                                document.body.appendChild(tooltipEl);
                            }

                            // Hide if no tooltip
                            const tooltipModel = context.tooltip;
                            if (tooltipModel.opacity === 0) {
                                tooltipEl.style.opacity = '0';
                                return;
                            }

                            // Set caret position
                            tooltipEl.classList.remove('above', 'below', 'no-transform');
                            if (tooltipModel.yAlign) {
                                tooltipEl.classList.add(tooltipModel.yAlign);
                            } else {
                                tooltipEl.classList.add('no-transform');
                            }

                            // Get the data point
                            const dataPoint = tooltipModel.dataPoints?.[0];
                            if (!dataPoint) {
                                tooltipEl.style.display = 'none';
                                return;
                            }

                            const companyIds = dataPoint.raw?.companies || [];
                            if (companyIds.length === 0) {
                                tooltipEl.style.display = 'none';
                                return;
                            }

                            // Create tooltip content
                            const productName = dataPoint.dataset.label || '';
                            let innerHtml = `
                                <div style="
                                    margin-bottom: 8px;
                                    font-weight: bold;
                                    text-align: center;
                                    font-size: 14px;
                                    color: #1a365d;
                                ">
                                    ${productName}
                                </div>
                                <div style="display: flex; flex-wrap: wrap; gap: 8px; justify-content: center;">
                            `;
                            
                            companyIds.forEach(companyId => {
                                const company = companies[companyId];
                                if (company) {
                                    const fallbackSvg = `<svg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'><rect width='40' height='40' fill='#e2e8f0'/><text x='20' y='25' font-family='Arial' font-size='12' text-anchor='middle' direction='rtl' unicode-bidi='bidi-override' fill='#264d7c'>${company.name.substring(0, 2).split('').reverse().join('')}</text></svg>`;
                                    const fallbackUrl = 'data:image/svg+xml;utf8,' + encodeURIComponent(fallbackSvg);
                                    
                                    innerHtml += `
                                        <div style="
                                            width: 32px;
                                            height: 32px;
                                            border-radius: 4px;
                                            overflow: hidden;
                                            background: #f8fafc;
                                            border: 1px solid #e2e8f0;
                                            display: flex;
                                            align-items: center;
                                            justify-content: center;
                                        ">
                                            <img 
                                                src="${company.logo}" 
                                                alt="${company.name}" 
                                                title="${company.name}" 
                                                style="
                                                    width: 100%;
                                                    height: 100%;
                                                    object-fit: contain;
                                                    display: block;
                                                "
                                                onerror="this.src='${fallbackUrl}'"
                                            >
                                        </div>
                                    `;
                                }
                            });
                            
                            innerHtml += '</div>';
                            tooltipEl.innerHTML = innerHtml;
                            
                            // Position the tooltip
                            const position = context.chart.canvas.getBoundingClientRect();
                            tooltipEl.style.opacity = '1';
                            tooltipEl.style.left = position.left + window.pageXOffset + tooltipModel.caretX + 'px';
                            tooltipEl.style.top = position.top + window.pageYOffset + tooltipModel.caretY + 'px';
                            tooltipEl.style.font = tooltipModel.options.bodyFont.string;
                            tooltipEl.style.padding = tooltipModel.padding + 'px ' + tooltipModel.padding + 'px';
                            tooltipEl.style.pointerEvents = 'none';
                        },
                        rtl: true,
                        usePointStyle: true,
                        boxWidth: 10,
                        boxHeight: 10,
                        padding: 0,
                        displayColors: false,
                        backgroundColor: '#ffffff',
                        borderColor: '#e2e8f0',
                        borderWidth: 1,
                        cornerRadius: 8,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                        position: 'nearest',
                        intersect: false
                    },
                    legend: {
                        position: 'right',
                        rtl: true,
                        labels: {
                            usePointStyle: true,
                            boxWidth: 10,
                            padding: 20
                        },
                        onClick: function(e, legendItem) {
                            var index = legendItem.datasetIndex;
                            var ci = this.chart;
                            var alreadyHidden = (ci.getDatasetMeta(index).hidden === null) ? false : ci.getDatasetMeta(index).hidden;
                            var anyOthersAlreadyHidden = false;
                            var allOthersHidden = true;
                    
                            ci.data.datasets.forEach(function(e, i) {
                              var meta = ci.getDatasetMeta(i);
                    
                              if (i !== index) {
                                if (meta.hidden) {
                                  anyOthersAlreadyHidden = true;
                                } else {
                                  allOthersHidden = false;
                                }
                              }
                            });
                    
                            if (alreadyHidden) {
                              ci.getDatasetMeta(index).hidden = null;
                            } else {
                              ci.data.datasets.forEach(function(e, i) {
                                var meta = ci.getDatasetMeta(i);
                    
                                if (i !== index) {
                                  if (anyOthersAlreadyHidden && !allOthersHidden) {
                                    meta.hidden = true;
                                  } else {
                                    meta.hidden = meta.hidden === null ? !meta.hidden : null;
                                  }
                                } else {
                                  meta.hidden = null;
                                }
                              });
                            }
                    
                            ci.update();
                          }
                    },
                    tooltips: {
                        mode: 'nearest',
                        intersect: false
                    }
                },
                scales: {
                    x: {
                        stacked: true,
                        display: false
                    },
                    y: {
                        stacked: true
                    }
                },
                hover: {
                    mode: 'nearest',
                    intersect: false
                },
                onHover: (event, elements) => {
                    if (elements.length > 0) {
                        const element = elements[0];
                        const dataset = currentChart.data.datasets[element.datasetIndex];
                        const dataPoint = dataset.data[element.index];
                        
                        if (dataPoint && dataPoint.companies && dataPoint.companies.length > 0) {
                            event.native.target.style.cursor = 'pointer';
                        } else {
                            event.native.target.style.cursor = 'default';
                        }
                    } else {
                        event.native.target.style.cursor = 'default';
                    }
                }
            }
        });
    }


    function createParallelCoordinates(ctx) {
        // Create a line chart that mimics parallel coordinates
        const labels = categories;
        
        // Prepare datasets for each product
        const datasets = loanProducts.map(product => {
            const data = [
                ...product.terms.map(t => t ? 1 : 0),
                ...product.amounts.map(a => a ? 1 : 0)
            ];
            
            return {
                label: product.name,
                data: data,
                borderColor: product.color,
                backgroundColor: 'transparent',
                borderWidth: 2,
                pointBackgroundColor: product.color,
                pointBorderColor: '#fff',
                pointRadius: 5,
                pointHoverRadius: 7,
                tension: 0.3
            };
        });

        currentChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                scales: {
                    y: {
                        min: -0.2,
                        max: 1.2,
                        ticks: {
                            stepSize: 1,
                            callback: function(value) {
                                return value === 1 ? 'כן' : (value === 0 ? 'לא' : '');
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                        rtl: true,
                        labels: {
                            usePointStyle: true,
                            boxWidth: 10,
                            padding: 20
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.dataset.label || '';
                                const value = context.parsed.y === 1 ? 'כן' : 'לא';
                                return `${label}: ${value}`;
                            }
                        },
                        rtl: true
                    }
                },
                layout: {
                    padding: 20
                }
            }
        });
    }
    
    function createDotMatrix() {
        const termLabels = ['קצר', 'בינוני', 'ארוך'];
        const amountLabels = ['נמוך', 'בינוני', 'גבוה'];
        
        const matrixContainer = document.createElement('div');
        matrixContainer.className = 'dot-matrix';
        
        // Create header with category labels
        const header = document.createElement('div');
        header.className = 'dot-matrix-header';
        header.innerHTML = `
            <div class="dot-matrix-category">
                <div class="dot-matrix-category-title">טווחי זמן</div>
                <div class="dot-matrix-labels">
                    ${termLabels.map(label => `<span class="dot-label">${label}</span>`).join('')}
                </div>
            </div>
            <div class="dot-matrix-category">
                <div class="dot-matrix-category-title">סכומים</div>
                <div class="dot-matrix-labels">
                    ${amountLabels.map(label => `<span class="dot-label">${label}</span>`).join('')}
                </div>
            </div>
        `;
        matrixContainer.appendChild(header);
        
        // Create product rows
        loanProducts.forEach(product => {
            const productDiv = document.createElement('div');
            productDiv.className = 'dot-matrix-item';
            productDiv.innerHTML = `
                <div class="dot-matrix-title">${product.name}</div>
                <div class="dot-matrix-categories">
                    <div class="dot-matrix-category">
                        <div class="dot-matrix-dots">
                            ${product.terms.map((term, i) => 
                                `<div class="dot ${term ? 'active' : ''}" title="${termLabels[i]}">
                                    <span class="dot-text">${termLabels[i]}</span>
                                </div>`
                            ).join('')}
                        </div>
                    </div>
                    <div class="dot-matrix-category">
                        <div class="dot-matrix-dots">
                            ${product.amounts.map((amount, i) => 
                                `<div class="dot ${amount ? 'active' : ''}" title="${amountLabels[i]}">
                                    <span class="dot-text">${amountLabels[i]}</span>
                                </div>`
                            ).join('')}
                        </div>
                    </div>
                </div>
            `;
            matrixContainer.appendChild(productDiv);
        });
        
        container.appendChild(matrixContainer);
    }
    
    function createComparisonTable() {
        const termLabels = ['קצר', 'בינוני', 'ארוך'];
        const amountLabels = ['נמוך', 'בינוני', 'גבוה'];
        
        const container = document.createElement('div');
        container.className = 'comparison-table-container';
        const table = document.createElement('table');
        table.className = 'comparison-table';
        
        // Create header row
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        headerRow.innerHTML = `
            <th>טווח / סכום</th>
            ${amountLabels.map(amount => `<th>${amount}</th>`).join('')}
        `;
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // Create table body
        const tbody = document.createElement('tbody');
        
        // For each term (row)
        termLabels.forEach((term, termIndex) => {
            const row = document.createElement('tr');
            row.innerHTML = `<th>${term}</th>`;
            
            // For each amount (column)
            amountLabels.forEach((_, amountIndex) => {
                const cell = document.createElement('td');
                const matchingProducts = loanProducts.filter(product => 
                    product.terms[termIndex] && product.amounts[amountIndex]
                );
                
                if (matchingProducts.length > 0) {
                    const productsList = document.createElement('div');
                    productsList.className = 'product-list';
                    
                    matchingProducts.forEach(product => {
                        // Create container for product and its tooltip
                        const productContainer = document.createElement('div');
                        productContainer.className = 'product-container';
                        
                        // Create product badge
                        const productBadge = document.createElement('span');
                        productBadge.className = 'product-badge';
                        productBadge.style.backgroundColor = product.color + '33';
                        productBadge.style.borderLeft = `3px solid ${product.color}`;
                        productBadge.textContent = product.name;
                        
                        // Create tooltip with company logos
                        if (product.companies && product.companies.length > 0) {
                            const tooltip = document.createElement('div');
                            tooltip.className = 'product-tooltip';
                            tooltip.innerHTML = `
                                <div class="company-logos-title">חברות מספקות:</div>
                                ${getCompanyLogos(product.companies)}
                            `;
                            
                            productContainer.appendChild(productBadge);
                            productContainer.appendChild(tooltip);
                            productsList.appendChild(productContainer);
                        } else {
                            productContainer.appendChild(productBadge);
                            productsList.appendChild(productContainer);
                        }
                    });
                    
                    cell.appendChild(productsList);
                    cell.classList.add('has-products');
                } else {
                    cell.textContent = '-';
                    cell.classList.add('no-products');
                }
                
                row.appendChild(cell);
            });
            
            tbody.appendChild(row);
        });
        
        table.appendChild(tbody);
        container.appendChild(table);
        return container;
    }
    
    function createSmallMultiples() {
        const multiplesContainer = document.createElement('div');
        multiplesContainer.className = 'small-multiples';
        
        loanProducts.forEach(product => {
            const multiple = document.createElement('div');
            multiple.className = 'small-multiple';
            multiple.innerHTML = `
                <div class="small-multiple-title">${product.name}</div>
                <div class="small-multiple-chart">
                    <canvas></canvas>
                </div>
            `;
            
            multiplesContainer.appendChild(multiple);
            
            // Create mini chart for each product
            const ctx = multiple.querySelector('canvas').getContext('2d');
            createMiniChart(ctx, product);
        });
        
        container.appendChild(multiplesContainer);
    }
    
    function createMiniChart(ctx, product) {
        const categories = ['קצר', 'בינוני', 'ארוך', 'נמוך', 'בינוני', 'גבוה'];
        const data = [
            ...product.terms.map(t => t ? 1 : 0),
            ...product.amounts.map(a => a ? 1 : 0)
        ];
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: categories,
                datasets: [{
                    data: data,
                    backgroundColor: product.color + '80',
                    borderColor: product.color,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
                },
                scales: {
                    y: { display: false },
                    x: {
                        ticks: { display: true },
                        grid: { display: false }
                    }
                },
                layout: { padding: 5 }
            }
        });
    }
});
