// Global variables
let dashboardData = null;

// Global variables
let charts = {};
let filteredData = {};
let currentFilters = {
    communes: [],
    status: ''
};

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    showLoadingState();
    loadDataFromJSON().then(() => {
        initializeFilters();
        initializeTabs();
        initializeModal();
        loadDashboardData();
        setupEventListeners();
        updateLastModified();
        hideLoadingState();
    }).catch(error => {
        showErrorState(error);
    });
});

// Load data from JSON file
async function loadDataFromJSON() {
    try {
        const response = await fetch('Rapport Post traitement.json');
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
        }
        
        dashboardData = await response.json();
        
        // Validate data structure
        if (!dashboardData || typeof dashboardData !== 'object') {
            throw new Error('Format de données JSON invalide');
        }
        
        // Check for required sections
        const requiredSections = [
            'Rapport sommaire',
            'Tableau PostProcess par Commune',
            'Jointures'
        ];
        
        const missingSections = requiredSections.filter(section => !dashboardData[section]);
        if (missingSections.length > 0) {
            throw new Error(`Sections manquantes dans le JSON: ${missingSections.join(', ')}`);
        }
        
        console.log('Données JSON chargées avec succès', dashboardData);
        
        // Update last modified date from JSON timestamp if available
        updateLastModifiedFromJSON();
        
        return dashboardData;
        
    } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        throw error;
    }
}

// Show loading state
function showLoadingState() {
    const dashboard = document.querySelector('.dashboard-container');
    const loadingHTML = `
        <div class="loading-overlay">
            <div class="loading-content">
                <div class="spinner"></div>
                <h2>Chargement des données...</h2>
                <p>Récupération du fichier JSON en cours</p>
            </div>
        </div>
    `;
    
    dashboard.insertAdjacentHTML('afterbegin', loadingHTML);
}

// Hide loading state
function hideLoadingState() {
    const loadingOverlay = document.querySelector('.loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.remove();
    }
}

// Show error state
function showErrorState(error) {
    hideLoadingState();
    
    const dashboard = document.querySelector('.dashboard-container');
    const errorHTML = `
        <div class="error-overlay">
            <div class="error-content">
                <div class="error-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h2>Erreur de chargement</h2>
                <p class="error-message">${error.message}</p>
                <div class="error-details">
                    <h3>Solutions possibles :</h3>
                    <ul>
                        <li>Vérifiez que le fichier "Rapport Post traitement.json" existe dans le même dossier</li>
                        <li>Assurez-vous que le serveur web est en cours d'exécution</li>
                        <li>Vérifiez la structure du fichier JSON</li>
                        <li>Consultez la console développeur pour plus de détails</li>
                    </ul>
                </div>
                <button class="retry-btn" onclick="location.reload()">
                    <i class="fas fa-redo"></i> Réessayer
                </button>
            </div>
        </div>
    `;
    
    dashboard.insertAdjacentHTML('afterbegin', errorHTML);
}

// Update last modified from JSON data
function updateLastModifiedFromJSON() {
    try {
        // Extract timestamp from JSON data structure
        const firstEntry = dashboardData["Rapport sommaire"]?.[0];
        if (firstEntry && firstEntry["2025_08_19_19_17_47"]) {
            // Parse the timestamp from the key name
            const timestampKey = Object.keys(firstEntry).find(key => key.includes('2025_08_19_19_17_47'));
            if (timestampKey) {
                // Extract date and time from the key
                const dateMatch = timestampKey.match(/(\d{4})_(\d{2})_(\d{2})_(\d{2})_(\d{2})_(\d{2})/);
                if (dateMatch) {
                    const [, year, month, day, hour, minute, second] = dateMatch;
                    const lastModDate = new Date(year, month - 1, day, hour, minute, second);
                    
                    const formatted = lastModDate.toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                    
                    const lastUpdateElement = document.getElementById('lastUpdate');
                    if (lastUpdateElement) {
                        lastUpdateElement.textContent = formatted;
                    }
                }
            }
        }
    } catch (error) {
        console.warn('Impossible d\'extraire la date de modification du JSON:', error);
        updateLastModified(); // Fallback to current date
    }
}

// Refresh data from JSON
async function refreshData() {
    try {
        showLoadingState();
        await loadDataFromJSON();
        
        // Reload current tab data
        const activeTab = document.querySelector('.tab-btn.active')?.dataset.tab || 'overview';
        loadTabData(activeTab);
        
        // Update KPIs
        updateKPIs();
        
        // Update filters if needed
        updateFiltersFromData();
        
        hideLoadingState();
        
        // Show success message
        showSuccessMessage('Données mises à jour avec succès!');
        
    } catch (error) {
        showErrorState(error);
    }
}

// Update filters based on new data
function updateFiltersFromData() {
    const communeFilter = document.getElementById('communeFilter');
    if (communeFilter && dashboardData["Tableau PostProcess par Commune"]) {
        // Clear existing options except the first one
        while (communeFilter.children.length > 1) {
            communeFilter.removeChild(communeFilter.lastChild);
        }
        
        // Add new communes
        const communes = [...new Set(dashboardData["Tableau PostProcess par Commune"].map(item => item.commune))];
        communes.forEach(commune => {
            const option = document.createElement('option');
            option.value = commune;
            option.textContent = commune;
            communeFilter.appendChild(option);
        });
    }
}

// Show success message
function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(successDiv);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}

// Auto-refresh functionality
function startAutoRefresh(intervalMinutes = 5) {
    setInterval(async () => {
        try {
            console.log('Auto-refreshing data...');
            await refreshData();
        } catch (error) {
            console.error('Auto-refresh failed:', error);
        }
    }, intervalMinutes * 60 * 1000);
}

// Add refresh button to header
function addRefreshButton() {
    const headerInfo = document.querySelector('.header-info');
    if (headerInfo) {
        const refreshBtn = document.createElement('button');
        refreshBtn.className = 'help-btn refresh-btn';
        refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Actualiser';
        refreshBtn.onclick = refreshData;
        
        headerInfo.insertBefore(refreshBtn, headerInfo.firstChild);
    }
}

// Validate JSON data integrity
function validateDataIntegrity() {
    if (!dashboardData) return false;
    
    try {
        // Check if all required sections exist and have data
        const checks = [
            dashboardData["Rapport sommaire"]?.length > 0,
            dashboardData["Tableau PostProcess par Commune"]?.length > 0,
            dashboardData["Jointures"]?.length > 0
        ];
        
        const isValid = checks.every(check => check === true);
        
        if (!isValid) {
            console.warn('Data integrity check failed');
        }
        
        return isValid;
    } catch (error) {
        console.error('Error during data validation:', error);
        return false;
    }
}

// Initialize filters
function initializeFilters() {
    if (!dashboardData || !dashboardData["Tableau PostProcess par Commune"]) {
        console.warn('Cannot initialize filters: data not loaded');
        return;
    }
    
    const communeFilter = document.getElementById('communeFilter');
    const communes = [...new Set(dashboardData["Tableau PostProcess par Commune"].map(item => item.commune))];
    
    // Clear existing options except the first one
    while (communeFilter.children.length > 1) {
        communeFilter.removeChild(communeFilter.lastChild);
    }
    
    communes.forEach(commune => {
        const option = document.createElement('option');
        option.value = commune;
        option.textContent = commune;
        communeFilter.appendChild(option);
    });
}

// Initialize tabs
function initializeTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const targetTab = this.dataset.tab;
            
            // Update active tab button
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Update active tab content
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === targetTab) {
                    content.classList.add('active');
                }
            });
            
            // Load tab-specific data
            loadTabData(targetTab);
        });
    });
}

// Initialize modal
function initializeModal() {
    const modal = document.getElementById('helpModal');
    const helpBtn = document.getElementById('helpBtn');
    const closeBtn = document.querySelector('.close');
    
    helpBtn.addEventListener('click', () => {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    });
    
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
}

// Load dashboard data
function loadDashboardData() {
    if (!validateDataIntegrity()) {
        showErrorState(new Error('Données JSON invalides ou incomplètes'));
        return;
    }
    
    updateKPIs();
    loadTabData('overview');
    addRefreshButton();
}

// Update KPIs
function updateKPIs() {
    if (!dashboardData || !dashboardData["Rapport sommaire"]) {
        console.warn('Cannot update KPIs: data not available');
        return;
    }
    
    const summary = dashboardData["Rapport sommaire"];
    
    // Update KPI values with error handling
    const totalFilesElement = document.getElementById('totalFiles');
    const totalParcelsElement = document.getElementById('totalParcels');
    const totalConflictsElement = document.getElementById('totalConflicts');
    const cleaningRateElement = document.getElementById('cleaningRate');
    const successRateElement = document.getElementById('successRate');
    const conflictRateElement = document.getElementById('conflictRate');
    
    if (totalFilesElement) totalFilesElement.textContent = getValueFromSummary(summary, "Fichiers traités") || 'N/A';
    if (totalParcelsElement) totalParcelsElement.textContent = formatNumber(getValueFromSummary(summary, "Total enregistrement (Parcelles apres netoyage)")) || 'N/A';
    if (totalConflictsElement) totalConflictsElement.textContent = getValueFromSummary(summary, "Conflits globaux") || 'N/A';
    if (cleaningRateElement) cleaningRateElement.textContent = getValueFromSummary(summary, "Taux de suppression des doublons") || 'N/A';
    
    // Calculate success rate
    const totalFiles = getValueFromSummary(summary, "Fichiers traités");
    const successFiles = getValueFromSummary(summary, "Succès");
    if (totalFiles && successFiles && successRateElement) {
        const successRate = ((successFiles / totalFiles) * 100).toFixed(1);
        successRateElement.textContent = successRate + '%';
    }
    
    const conflictRate = getValueFromSummary(summary, "Taux des parcelles conflictuelles");
    if (conflictRateElement) conflictRateElement.textContent = conflictRate || 'N/A';
}

// Load tab-specific data
function loadTabData(tabName) {
    if (!dashboardData) {
        console.warn(`Cannot load ${tabName} tab: data not available`);
        return;
    }
    
    try {
        switch(tabName) {
            case 'overview':
                createParcelTypeChart();
                createProcessingChart();
                break;
            case 'communes':
                createCommuneComparisonChart();
                populateCommuneTable();
                break;
            case 'quality':
                createQualityChart();
                createJoinStatusChart();
                break;
            case 'duplicates':
                createDuplicateFrequencyChart();
                populateDuplicatesTable();
                break;
        }
    } catch (error) {
        console.error(`Error loading ${tabName} tab:`, error);
    }
}

// Create parcel type chart
function createParcelTypeChart() {
    const ctx = document.getElementById('parcelTypeChart').getContext('2d');
    
    if (charts.parcelTypeChart) {
        charts.parcelTypeChart.destroy();
    }
    
    const summary = dashboardData["Rapport sommaire"];
    const individuelles = getValueFromSummary(summary, "Parcelles individuelles");
    const collectives = getValueFromSummary(summary, "Parcelles collectiveses");
    const conflits = getValueFromSummary(summary, "Conflits (Parcelles à la fois individuelle et collecvive)");
    const sansJointure = getValueFromSummary(summary, "Pas de Jointure (Pas d'idup ou ancien  Idup Ndoga)");
    
    charts.parcelTypeChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Individuelles', 'Collectives', 'Conflits', 'Sans jointure'],
            datasets: [{
                data: [individuelles, collectives, conflits, sansJointure],
                backgroundColor: ['#3498db', '#2ecc71', '#e74c3c', '#f39c12'],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${formatNumber(value)} (${percentage}%)`;
                        }
                    }
                }
            },
            animation: {
                animateRotate: true,
                duration: 2000
            }
        }
    });
}

// Create processing chart
function createProcessingChart() {
    const ctx = document.getElementById('processingChart').getContext('2d');
    
    if (charts.processingChart) {
        charts.processingChart.destroy();
    }
    
    const communeData = dashboardData["Tableau PostProcess par Commune"];
    const labels = communeData.map(item => item.commune);
    const brutes = communeData.map(item => item.brutes);
    const traitees = communeData.map(item => item.post_traitees_lot_1_46);
    
    charts.processingChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Parcelles Brutes',
                    data: brutes,
                    backgroundColor: 'rgba(52, 152, 219, 0.7)',
                    borderColor: '#3498db',
                    borderWidth: 1
                },
                {
                    label: 'Parcelles Traitées',
                    data: traitees,
                    backgroundColor: 'rgba(46, 204, 113, 0.7)',
                    borderColor: '#2ecc71',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${formatNumber(context.parsed.y)}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatNumber(value);
                        }
                    }
                },
                x: {
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            }
        }
    });
}

// Create commune comparison chart
function createCommuneComparisonChart() {
    const ctx = document.getElementById('communeComparisonChart').getContext('2d');
    const metricSelector = document.getElementById('metricSelector');
    
    function updateChart() {
        if (charts.communeComparisonChart) {
            charts.communeComparisonChart.destroy();
        }
        
        const selectedMetric = metricSelector.value;
        const communeData = dashboardData["Tableau PostProcess par Commune"];
        
        const labels = communeData.map(item => item.commune);
        const data = communeData.map(item => item[selectedMetric]);
        
        const colors = getMetricColors(selectedMetric);
        
        charts.communeComparisonChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: getMetricLabel(selectedMetric),
                    data: data,
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${getMetricLabel(selectedMetric)}: ${formatNumber(context.parsed.y)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return formatNumber(value);
                            }
                        }
                    },
                    x: {
                        ticks: {
                            maxRotation: 45,
                            minRotation: 45
                        }
                    }
                }
            }
        });
    }
    
    metricSelector.addEventListener('change', updateChart);
    updateChart();
}

// Populate commune table
function populateCommuneTable() {
    const tableBody = document.getElementById('communeTableBody');
    const communeData = dashboardData["Tableau PostProcess par Commune"];
    const jointures = dashboardData["Jointures"];
    
    // Clear existing content
    tableBody.innerHTML = '';
    
    communeData.forEach(commune => {
        const jointure = jointures.find(j => j.commune === commune.commune);
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td><strong>${commune.commune}</strong></td>
            <td>${formatNumber(commune.brutes)}</td>
            <td>${formatNumber(commune.parcelles_individuelles)}</td>
            <td>${formatNumber(commune.parcelles_collectives)}</td>
            <td>${formatNumber(commune.parcelles_en_conflits)}</td>
            <td>${formatNumber(commune.pas_de_jointure)}</td>
            <td>
                <span class="status-badge ${jointure.statut_jointure === 'SUCCÈS' ? 'status-success' : 'status-error'}">
                    ${jointure.statut_jointure}
                </span>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Setup table search and sort
    setupTableControls();
}

// Create quality chart
function createQualityChart() {
    const ctx = document.getElementById('qualityChart').getContext('2d');
    
    if (charts.qualityChart) {
        charts.qualityChart.destroy();
    }
    
    const qualityData = dashboardData["Rapport Doublons Geometrique"];
    const labels = qualityData.map(item => item.commune);
    const rates = qualityData.map(item => parseFloat(item.taux_de_suppression_doublons.replace('%', '')));
    
    charts.qualityChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Taux de suppression (%)',
                data: rates,
                backgroundColor: rates.map(rate => rate > 15 ? 'rgba(231, 76, 60, 0.7)' : 
                                              rate > 8 ? 'rgba(243, 156, 18, 0.7)' : 'rgba(46, 204, 113, 0.7)'),
                borderColor: rates.map(rate => rate > 15 ? '#e74c3c' : 
                                             rate > 8 ? '#f39c12' : '#2ecc71'),
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Taux de suppression: ${context.parsed.y.toFixed(2)}%`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                },
                x: {
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            }
        }
    });
}

// Create join status chart
function createJoinStatusChart() {
    const ctx = document.getElementById('joinStatusChart').getContext('2d');
    
    if (charts.joinStatusChart) {
        charts.joinStatusChart.destroy();
    }
    
    const jointures = dashboardData["Jointures"];
    const success = jointures.filter(j => j.statut_jointure === 'SUCCÈS').length;
    const error = jointures.filter(j => j.statut_jointure === 'ERREUR').length;
    
    charts.joinStatusChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Succès', 'Erreurs'],
            datasets: [{
                data: [success, error],
                backgroundColor: ['#2ecc71', '#e74c3c'],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = success + error;
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return `${context.label}: ${context.parsed} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Create duplicate frequency chart
function createDuplicateFrequencyChart() {
    const ctx = document.getElementById('duplicateFrequencyChart').getContext('2d');
    
    if (charts.duplicateFrequencyChart) {
        charts.duplicateFrequencyChart.destroy();
    }
    
    const duplicateData = dashboardData["Details doublons Attributaire"];
    const frequencies = duplicateData.map(item => item.frequence);
    const frequencyGroups = {};
    
    frequencies.forEach(freq => {
        if (freq >= 10) frequencyGroups['10+'] = (frequencyGroups['10+'] || 0) + 1;
        else if (freq >= 5) frequencyGroups['5-9'] = (frequencyGroups['5-9'] || 0) + 1;
        else if (freq >= 3) frequencyGroups['3-4'] = (frequencyGroups['3-4'] || 0) + 1;
        else frequencyGroups['2'] = (frequencyGroups['2'] || 0) + 1;
    });
    
    const labels = Object.keys(frequencyGroups);
    const data = Object.values(frequencyGroups);
    
    charts.duplicateFrequencyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Nombre de doublons',
                data: data,
                backgroundColor: 'rgba(231, 76, 60, 0.7)',
                borderColor: '#e74c3c',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        title: function(tooltipItems) {
                            return `Fréquence: ${tooltipItems[0].label}`;
                        },
                        label: function(context) {
                            return `Nombre de doublons: ${context.parsed.y}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Fréquence des doublons'
                    }
                }
            }
        }
    });
}

// Populate duplicates table
function populateDuplicatesTable() {
    const tableBody = document.getElementById('duplicatesTableBody');
    const duplicateData = dashboardData["Details doublons Attributaire"];
    
    // Clear existing content
    tableBody.innerHTML = '';
    
    // Sort by frequency (descending) and take top 20
    const sortedDuplicates = duplicateData
        .sort((a, b) => b.frequence - a.frequence)
        .slice(0, 20);
    
    sortedDuplicates.forEach(duplicate => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td><code>${duplicate.valeur}</code></td>
            <td><span class="badge">${duplicate.frequence}</span></td>
            <td>${duplicate.commune}</td>
            <td>
                <button class="action-btn view" onclick="viewDuplicateDetails('${duplicate.valeur}')">
                    <i class="fas fa-eye"></i> Voir
                </button>
                <button class="action-btn resolve" onclick="resolveDuplicate('${duplicate.valeur}')">
                    <i class="fas fa-wrench"></i> Résoudre
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Setup table controls
function setupTableControls() {
    const searchInput = document.getElementById('communeSearch');
    const sortSelect = document.getElementById('sortBy');
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            filterCommuneTable(this.value);
        });
    }
    
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            sortCommuneTable(this.value);
        });
    }
}

// Setup event listeners
function setupEventListeners() {
    // Filter controls
    document.getElementById('communeFilter').addEventListener('change', applyFilters);
    document.getElementById('statusFilter').addEventListener('change', applyFilters);
    document.getElementById('resetFilters').addEventListener('click', resetFilters);
    document.getElementById('exportData').addEventListener('click', exportToPDF);
    
    // Chart type toggles
    document.querySelectorAll('.chart-toggle').forEach(btn => {
        btn.addEventListener('click', function() {
            const chartType = this.dataset.type;
            toggleChartType(chartType);
        });
    });
}

// Helper functions
function getValueFromSummary(summary, key) {
    const item = summary.find(s => s.date === key);
    return item ? item["2025_08_19_19_17_47"] : 0;
}

function formatNumber(num) {
    if (typeof num === 'string') return num;
    return new Intl.NumberFormat('fr-FR').format(num);
}

function getMetricLabel(metric) {
    const labels = {
        'parcelles_individuelles': 'Parcelles Individuelles',
        'parcelles_collectives': 'Parcelles Collectives',
        'parcelles_en_conflits': 'Parcelles en Conflits',
        'pas_de_jointure': 'Parcelles sans Jointure'
    };
    return labels[metric] || metric;
}

function getMetricColors(metric) {
    const colors = {
        'parcelles_individuelles': { background: 'rgba(52, 152, 219, 0.7)', border: '#3498db' },
        'parcelles_collectives': { background: 'rgba(46, 204, 113, 0.7)', border: '#2ecc71' },
        'parcelles_en_conflits': { background: 'rgba(231, 76, 60, 0.7)', border: '#e74c3c' },
        'pas_de_jointure': { background: 'rgba(243, 156, 18, 0.7)', border: '#f39c12' }
    };
    return colors[metric] || { background: 'rgba(149, 165, 166, 0.7)', border: '#95a5a6' };
}

function applyFilters() {
    const communeFilter = document.getElementById('communeFilter');
    const statusFilter = document.getElementById('statusFilter');
    
    currentFilters.communes = Array.from(communeFilter.selectedOptions).map(option => option.value);
    currentFilters.status = statusFilter.value;
    
    // Reapply filters to current tab
    const activeTab = document.querySelector('.tab-btn.active').dataset.tab;
    loadTabData(activeTab);
}

function resetFilters() {
    document.getElementById('communeFilter').selectedIndex = -1;
    document.getElementById('statusFilter').selectedIndex = 0;
    currentFilters = { communes: [], status: '' };
    
    // Reload current tab
    const activeTab = document.querySelector('.tab-btn.active').dataset.tab;
    loadTabData(activeTab);
}

function filterCommuneTable(searchTerm) {
    const tableRows = document.querySelectorAll('#communeTableBody tr');
    
    tableRows.forEach(row => {
        const communeName = row.cells[0].textContent.toLowerCase();
        const isVisible = communeName.includes(searchTerm.toLowerCase());
        row.style.display = isVisible ? '' : 'none';
    });
}

function sortCommuneTable(sortBy) {
    const tableBody = document.getElementById('communeTableBody');
    const rows = Array.from(tableBody.querySelectorAll('tr'));
    
    rows.sort((a, b) => {
        let aValue, bValue;
        
        switch(sortBy) {
            case 'commune':
                aValue = a.cells[0].textContent;
                bValue = b.cells[0].textContent;
                return aValue.localeCompare(bValue);
            case 'brutes':
                aValue = parseInt(a.cells[1].textContent.replace(/\s/g, ''));
                bValue = parseInt(b.cells[1].textContent.replace(/\s/g, ''));
                return bValue - aValue;
            case 'parcelles_individuelles':
                aValue = parseInt(a.cells[2].textContent.replace(/\s/g, ''));
                bValue = parseInt(b.cells[2].textContent.replace(/\s/g, ''));
                return bValue - aValue;
            case 'parcelles_collectives':
                aValue = parseInt(a.cells[3].textContent.replace(/\s/g, ''));
                bValue = parseInt(b.cells[3].textContent.replace(/\s/g, ''));
                return bValue - aValue;
            default:
                return 0;
        }
    });
    
    // Clear and re-append sorted rows
    tableBody.innerHTML = '';
    rows.forEach(row => tableBody.appendChild(row));
}

function toggleChartType(chartType) {
    // Toggle chart type for parcel distribution
    if (chartType === 'doughnut' || chartType === 'bar') {
        const ctx = document.getElementById('parcelTypeChart').getContext('2d');
        
        if (charts.parcelTypeChart) {
            const data = charts.parcelTypeChart.data;
            charts.parcelTypeChart.destroy();
            
            charts.parcelTypeChart = new Chart(ctx, {
                type: chartType,
                data: data,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: chartType === 'bar'
                        }
                    }
                }
            });
        }
        
        // Update active toggle button
        document.querySelectorAll('.chart-toggle').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-type="${chartType}"]`).classList.add('active');
    }
}

function updateLastModified() {
    const lastUpdate = document.getElementById('lastUpdate');
    const now = new Date();
    const formatted = now.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    lastUpdate.textContent = formatted;
}

function exportToPDF() {
    // Show loading state
    const exportBtn = document.getElementById('exportData');
    const originalText = exportBtn.textContent;
    exportBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Export...';
    exportBtn.disabled = true;
    
    // Simulate PDF generation
    setTimeout(() => {
        // In a real implementation, you would use libraries like jsPDF or html2pdf
        alert('Fonctionnalité d\'export PDF en cours de développement.\nLes données peuvent être imprimées via Ctrl+P.');
        
        // Reset button
        exportBtn.innerHTML = originalText;
        exportBtn.disabled = false;
    }, 1500);
}

function viewDuplicateDetails(value) {
    if (!dashboardData || !dashboardData["Details doublons Attributaire"]) {
        alert('Données non disponibles');
        return;
    }
    
    const duplicate = dashboardData["Details doublons Attributaire"].find(d => d.valeur.toString() === value);
    if (duplicate) {
        const details = `
            Valeur: ${duplicate.valeur}
            Fréquence: ${duplicate.frequence}
            Commune: ${duplicate.commune}
            FIDs: ${duplicate.fid}
        `;
        alert(details);
    } else {
        alert('Détails du doublon non trouvés');
    }
}

function resolveDuplicate(value) {
    const confirmed = confirm(`Êtes-vous sûr de vouloir marquer le doublon ${value} comme résolu?`);
    if (confirmed) {
        // In a real implementation, this would trigger a resolution workflow
        alert('Action de résolution déclenchée. Le doublon sera traité par l\'équipe technique.');
    }
}

// Animation and performance optimizations
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Optimize search with debouncing
const debouncedSearch = debounce(filterCommuneTable, 300);

// Replace direct search event listener with debounced version
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('communeSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            debouncedSearch(this.value);
        });
    }
});

// Add smooth animations to charts
Chart.defaults.animation.duration = 1500;
Chart.defaults.animation.easing = 'easeOutQuart';

// Add tooltips for better UX
function addTooltips() {
    document.querySelectorAll('[title]').forEach(el => {
        el.classList.add('tooltip');
        const tooltipText = el.getAttribute('title');
        el.removeAttribute('title');
        
        const tooltipDiv = document.createElement('div');
        tooltipDiv.className = 'tooltiptext';
        tooltipDiv.textContent = tooltipText;
        el.appendChild(tooltipDiv);
    });
}

// Initialize tooltips after DOM content loaded
document.addEventListener('DOMContentLoaded', addTooltips);

// Auto-refresh data every 5 minutes (in production, this would fetch from an API)
setInterval(async () => {
    try {
        console.log('Auto-checking for data updates...');
        await refreshData();
    } catch (error) {
        console.warn('Auto-refresh failed:', error);
    }
}, 300000);

// Start auto-refresh on page load (disabled by default, can be enabled)
// document.addEventListener('DOMContentLoaded', () => {
//     startAutoRefresh(5); // Refresh every 5 minutes
// });

// Handle window resize for responsive charts
window.addEventListener('resize', debounce(() => {
    Object.values(charts).forEach(chart => {
        if (chart && typeof chart.resize === 'function') {
            chart.resize();
        }
    });
}, 250));

// Performance monitoring
const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
            console.log(`Dashboard loaded in ${entry.loadEventEnd - entry.loadEventStart}ms`);
        }
    }
});

observer.observe({ entryTypes: ['navigation'] });

// Service Worker registration for offline functionality (if needed)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
