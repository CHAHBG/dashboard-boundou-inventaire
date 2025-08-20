// Global variables
let dashboardData = null;
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
    if (loadingOverlay) loadingOverlay.remove();
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
        const firstEntry = dashboardData["Rapport sommaire"]?.[0];
        if (firstEntry && firstEntry["2025_08_19_19_17_47"]) {
            const timestampKey = Object.keys(firstEntry).find(key => key.includes('2025_08_19_19_17_47'));
            if (timestampKey) {
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
                    document.getElementById('lastUpdate').textContent = formatted;
                }
            }
        }
    } catch (error) {
        console.warn('Impossible d\'extraire la date de modification du JSON:', error);
        updateLastModified();
    }
}

// Refresh data from JSON
async function refreshData() {
    try {
        showLoadingState();
        await loadDataFromJSON();
        const activeTab = document.querySelector('.tab-btn.active')?.dataset.tab || 'overview';
        loadTabData(activeTab);
        updateKPIs();
        updateFiltersFromData();
        hideLoadingState();
        showSuccessMessage('Données mises à jour avec succès!');
    } catch (error) {
        showErrorState(error);
    }
}

// Update filters based on new data
function updateFiltersFromData() {
    const communeFilter = document.getElementById('communeFilter');
    if (communeFilter && dashboardData["Tableau PostProcess par Commune"]) {
        while (communeFilter.children.length > 1) communeFilter.removeChild(communeFilter.lastChild);
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
    successDiv.innerHTML = `<i class="fas fa-check-circle"></i><span>${message}</span>`;
    document.body.appendChild(successDiv);
    setTimeout(() => successDiv.remove(), 3000);
}

// Initialize filters
function initializeFilters() {
    if (!dashboardData || !dashboardData["Tableau PostProcess par Commune"]) {
        console.warn('Cannot initialize filters: data not loaded');
        return;
    }
    const communeFilter = document.getElementById('communeFilter');
    const communes = [...new Set(dashboardData["Tableau PostProcess par Commune"].map(item => item.commune))];
    communes.forEach(commune => {
        const option = document.createElement('option');
        option.value = commune;
        option.textContent = commune;
        communeFilter.appendChild(option);
    });
}

// Initialize tabs
function initializeTabs() {
    document.querySelectorAll('.tab-btn').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            button.classList.add('active');
            const tabId = button.dataset.tab;
            document.getElementById(tabId).classList.add('active');
            loadTabData(tabId);
        });
    });
}

// Initialize modal
function initializeModal() {
    const modal = document.getElementById('helpModal');
    window.openModal = () => modal.style.display = 'block';
    window.closeModal = () => modal.style.display = 'none';
    window.onclick = (event) => { if (event.target == modal) modal.style.display = 'none'; };
}

// Load dashboard data
function loadDashboardData() {
    updateKPIs();
    loadTabData('overview');
}

// Update KPIs
function updateKPIs() {
    if (!dashboardData || !dashboardData["Rapport sommaire"]) return;
    const summary = dashboardData["Rapport sommaire"].find(item => item["2025_08_19_19_17_47"]);
    if (summary) {
        document.getElementById('kpiFilesProcessed').textContent = summary["2025_08_19_19_17_47"] || '--';
        document.getElementById('kpiTotalParcels').textContent = dashboardData["Rapport sommaire"].find(item => item.date === "Total enregistrement (Parcelles apres netoyage)")?.["2025_08_19_19_17_47"] || '--';
        document.getElementById('kpiConflicts').textContent = dashboardData["Rapport sommaire"].find(item => item.date === "Conflits globaux")?.["2025_08_19_19_17_47"] || '--';
        const success = summary["2025_08_19_19_17_47"] ? (summary["Succès"] / summary["Fichiers traités"] * 100).toFixed(2) : '--';
        document.getElementById('kpiFilesSuccess').textContent = `${success}% de succès`;
        const totalParcels = parseInt(document.getElementById('kpiTotalParcels').textContent) || 0;
        const conflicts = parseInt(document.getElementById('kpiConflicts').textContent) || 0;
        document.getElementById('kpiConflictPercentage').textContent = totalParcels ? `${((conflicts / totalParcels) * 100).toFixed(2)}% du total` : '--% du total';
        const duplicateRate = dashboardData["Rapport sommaire"].find(item => item.date === "Taux des parcelles conflictuelles")?.["2025_08_19_19_17_47"] || '--';
        document.getElementById('kpiCleaningRate').textContent = duplicateRate;
    }
}

// Load tab data
function loadTabData(tabId) {
    try {
        if (!dashboardData) throw new Error('Données non chargées');
        switch (tabId) {
            case 'overview':
                createParcelTypeChart();
                createCommuneTrendChart();
                break;
            case 'communes':
                createCommuneComparisonChart();
                updateCommuneTable();
                break;
            case 'quality':
                createDuplicateRemovalChart();
                createJointureStatusChart();
                updateQualityMetrics();
                break;
            case 'duplicates':
                createDuplicateFrequencyChart();
                updateDuplicateTable();
                break;
        }
    } catch (error) {
        console.error(`Error loading ${tabId} tab:`, error);
    }
}

// Create parcel type chart
function createParcelTypeChart() {
    const ctx = document.getElementById('parcelTypeChart').getContext('2d');
    if (charts.parcelTypeChart) charts.parcelTypeChart.destroy();
    const data = {
        labels: ['Individuelles', 'Collectives', 'Conflits', 'Sans Jointure'],
        datasets: [{
            data: [
                dashboardData["Rapport sommaire"].find(item => item.date === "Parcelles individuelles")?.["2025_08_19_19_17_47"] || 0,
                dashboardData["Rapport sommaire"].find(item => item.date === "Parcelles collectiveses")?.["2025_08_19_19_17_47"] || 0,
                dashboardData["Rapport sommaire"].find(item => item.date === "Conflits (Parcelles à la fois individuelle et collecvive)")?.["2025_08_19_19_17_47"] || 0,
                dashboardData["Rapport sommaire"].find(item => item.date === "Pas de Jointure (Pas d'idup ou ancien  Idup Ndoga)")?.["2025_08_19_19_17_47"] || 0
            ],
            backgroundColor: ['rgba(74, 144, 226, 0.7)', 'rgba(80, 227, 194, 0.7)', 'rgba(241, 196, 15, 0.7)', 'rgba(243, 156, 18, 0.7)'],
            borderColor: ['#4A90E2', '#50E3C2', '#F1C40F', '#F39C12'],
            borderWidth: 1
        }]
    };
    charts.parcelTypeChart = new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: { 
            responsive: true, 
            maintainAspectRatio: false,
            aspectRatio: 1,
            plugins: { legend: { position: 'top' } }
        }
    });
}

// Create commune trend chart
function createCommuneTrendChart() {
    const ctx = document.getElementById('communeTrendChart').getContext('2d');
    if (charts.communeTrendChart) charts.communeTrendChart.destroy();
    const communes = dashboardData["Tableau PostProcess par Commune"].map(item => item.commune);
    const metric = document.getElementById('metricSelector').value;
    const data = {
        labels: communes,
        datasets: [{
            label: getMetricLabel(metric),
            data: dashboardData["Tableau PostProcess par Commune"].map(item => item[metric] || 0),
            backgroundColor: 'rgba(74, 144, 226, 0.6)',
            borderColor: '#4A90E2',
            borderWidth: 1
        }]
    };
    charts.communeTrendChart = new Chart(ctx, {
        type: 'bar',
        data: data,
        options: { 
            responsive: true, 
            maintainAspectRatio: false,
            aspectRatio: 2,
            scales: { y: { beginAtZero: true } },
            plugins: { legend: { display: false } }
        }
    });
}

// Create commune comparison chart
function createCommuneComparisonChart() {
    const ctx = document.getElementById('communeComparisonChart').getContext('2d');
    if (charts.communeComparisonChart) charts.communeComparisonChart.destroy();
    const metric = document.getElementById('metricSelectorComparative').value;
    const data = {
        labels: dashboardData["Tableau PostProcess par Commune"].map(item => item.commune),
        datasets: [{
            label: getMetricLabel(metric),
            data: dashboardData["Tableau PostProcess par Commune"].map(item => item[metric] || 0),
            backgroundColor: getMetricColors(metric).background,
            borderColor: getMetricColors(metric).border,
            borderWidth: 1
        }]
    };
    charts.communeComparisonChart = new Chart(ctx, {
        type: 'bar',
        data: data,
        options: { 
            responsive: true, 
            maintainAspectRatio: false,
            aspectRatio: 2,
            scales: { y: { beginAtZero: true } }
        }
    });
}

// Create duplicate removal chart
function createDuplicateRemovalChart() {
    const ctx = document.getElementById('duplicateRemovalChart').getContext('2d');
    if (charts.duplicateRemovalChart) charts.duplicateRemovalChart.destroy();
    const data = {
        labels: dashboardData["Tableau PostProcess par Commune"].map(item => item.commune),
        datasets: [{
            label: 'Taux de Suppression des Doublons',
            data: dashboardData["Tableau PostProcess par Commune"].map(item => {
                const brutes = item.brutes || 0;
                const cleaned = item.sans_doublon_attributaire || 0;
                return brutes ? ((brutes - cleaned) / brutes * 100).toFixed(2) : 0;
            }),
            backgroundColor: 'rgba(241, 196, 15, 0.6)',
            borderColor: '#F1C40F',
            borderWidth: 1
        }]
    };
    charts.duplicateRemovalChart = new Chart(ctx, {
        type: 'bar',
        data: data,
        options: { 
            responsive: true, 
            maintainAspectRatio: false,
            aspectRatio: 2,
            scales: { y: { beginAtZero: true, title: { display: true, text: '%' } } }
        }
    });
}

// Create jointure status chart
function createJointureStatusChart() {
    const ctx = document.getElementById('jointureStatusChart').getContext('2d');
    if (charts.jointureStatusChart) charts.jointureStatusChart.destroy();
    const success = dashboardData["Rapport sommaire"].find(item => item.date === "Succès")?.["2025_08_19_19_17_47"] || 0;
    const failures = dashboardData["Rapport sommaire"].find(item => item.date === "Échecs")?.["2025_08_19_19_17_47"] || 0;
    const data = {
        labels: ['Succès', 'Échecs'],
        datasets: [{
            data: [success, failures],
            backgroundColor: ['rgba(80, 227, 194, 0.7)', 'rgba(231, 76, 60, 0.7)'],
            borderColor: ['#50E3C2', '#e74c3c'],
            borderWidth: 1
        }]
    };
    charts.jointureStatusChart = new Chart(ctx, {
        type: 'pie',
        data: data,
        options: { 
            responsive: true, 
            maintainAspectRatio: false,
            aspectRatio: 1,
            plugins: { legend: { position: 'top' } }
        }
    });
}

// Create duplicate frequency chart
function createDuplicateFrequencyChart() {
    const ctx = document.getElementById('duplicateFrequencyChart').getContext('2d');
    if (charts.duplicateFrequencyChart) charts.duplicateFrequencyChart.destroy();
    const duplicates = dashboardData["Rapport Doublons attributaire"] || [];
    const data = {
        labels: duplicates.map(item => item.valeur),
        datasets: [{
            label: 'Fréquence des Doublons',
            data: duplicates.map(item => item.frequence),
            backgroundColor: 'rgba(241, 196, 15, 0.6)',
            borderColor: '#F1C40F',
            borderWidth: 1
        }]
    };
    charts.duplicateFrequencyChart = new Chart(ctx, {
        type: 'bar',
        data: data,
        options: { 
            responsive: true, 
            maintainAspectRatio: false,
            aspectRatio: 2,
            scales: { y: { beginAtZero: true } }
        }
    });
}

// Update commune table
function updateCommuneTable() {
    const tableBody = document.getElementById('communeTableBody');
    tableBody.innerHTML = '';
    (dashboardData["Tableau PostProcess par Commune"] || []).forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.commune}</td>
            <td>${item.brutes || 0}</td>
            <td>${item.parcelles_individuelles || 0}</td>
            <td>${item.parcelles_collectives || 0}</td>
            <td>${item.parcelles_en_conflits || 0}</td>
            <td>${item.pas_de_jointure || 0}</td>
            <td>${item.pas_de_jointure > 0 ? 'Erreur' : 'Succès'}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Update quality metrics
function updateQualityMetrics() {
    const metricsDiv = document.getElementById('qualityMetrics');
    metricsDiv.innerHTML = `
        <p>Taux de doublons géométriques: Variable par commune</p>
        <p>Taux de doublons attributaires: ${dashboardData["Rapport sommaire"].find(item => item.date === "Taux des parcelles conflictuelles")?.["2025_08_19_19_17_47"] || '--'}</p>
        <p>Fichiers avec erreurs de jointure: 1 (NDOGA_BABACAR)</p>
    `;
}

// Update duplicate table
function updateDuplicateTable() {
    const tableBody = document.getElementById('duplicateTableBody');
    tableBody.innerHTML = '';
    (dashboardData["Rapport Doublons attributaire"] || []).forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.valeur}</td>
            <td>${item.frequence}</td>
            <td>${item.commune}</td>
            <td><button onclick="resolveDuplicate(${item.valeur})">Résoudre</button></td>
        `;
        tableBody.appendChild(row);
    });
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('communeFilter').addEventListener('change', applyFilters);
    document.getElementById('statusFilter').addEventListener('change', applyFilters);
    document.getElementById('resetFilters').addEventListener('click', resetFilters);
    document.getElementById('exportData').addEventListener('click', exportToPDF);
    document.getElementById('metricSelector').addEventListener('change', createCommuneTrendChart);
    document.getElementById('metricSelectorComparative').addEventListener('change', createCommuneComparisonChart);
    document.querySelectorAll('.chart-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.chart-toggle').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            toggleChartType(btn.dataset.type);
        });
    });
    const searchInput = document.getElementById('communeSearch');
    if (searchInput) searchInput.addEventListener('input', debounce(filterCommuneTable, 300));
}

// Apply filters
function applyFilters() {
    const communeFilter = document.getElementById('communeFilter');
    const statusFilter = document.getElementById('statusFilter');
    currentFilters.communes = [communeFilter.value]; // Single value for dropdown
    currentFilters.status = statusFilter.value;
    loadTabData(document.querySelector('.tab-btn.active').dataset.tab);
}

// Reset filters
function resetFilters() {
    document.getElementById('communeFilter').selectedIndex = 0;
    document.getElementById('statusFilter').selectedIndex = 0;
    currentFilters = { communes: [], status: '' };
    loadTabData(document.querySelector('.tab-btn.active').dataset.tab);
}

// Filter commune table
function filterCommuneTable(searchTerm) {
    const tableRows = document.querySelectorAll('#communeTableBody tr');
    tableRows.forEach(row => {
        const communeName = row.cells[0].textContent.toLowerCase();
        row.style.display = communeName.includes(searchTerm.toLowerCase()) ? '' : 'none';
    });
}

// Sort commune table
function sortCommuneTable(sortBy) {
    const tableBody = document.getElementById('communeTableBody');
    const rows = Array.from(tableBody.querySelectorAll('tr'));
    rows.sort((a, b) => {
        let aValue, bValue;
        switch(sortBy) {
            case 'commune': aValue = a.cells[0].textContent; bValue = b.cells[0].textContent; return aValue.localeCompare(bValue);
            case 'brutes': aValue = parseInt(a.cells[1].textContent); bValue = parseInt(b.cells[1].textContent); return bValue - aValue;
            case 'parcelles_individuelles': aValue = parseInt(a.cells[2].textContent); bValue = parseInt(b.cells[2].textContent); return bValue - aValue;
            case 'parcelles_collectives': aValue = parseInt(a.cells[3].textContent); bValue = parseInt(b.cells[3].textContent); return bValue - aValue;
            default: return 0;
        }
    });
    tableBody.innerHTML = '';
    rows.forEach(row => tableBody.appendChild(row));
}

// Toggle chart type
function toggleChartType(chartType) {
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
                    aspectRatio: 1,
                    plugins: { legend: { display: chartType === 'bar' } }
                }
            });
        }
    }
}

// Update last modified
function updateLastModified() {
    const lastUpdate = document.getElementById('lastUpdate');
    const now = new Date();
    lastUpdate.textContent = now.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Export to PDF
function exportToPDF() {
    const exportBtn = document.getElementById('exportData');
    const originalText = exportBtn.textContent;
    exportBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Export...';
    exportBtn.disabled = true;
    setTimeout(() => {
        alert('Fonctionnalité d\'export PDF en cours de développement.\nLes données peuvent être imprimées via Ctrl+P.');
        exportBtn.innerHTML = originalText;
        exportBtn.disabled = false;
    }, 1500);
}

// View duplicate details
function viewDuplicateDetails(value) {
    if (!dashboardData || !dashboardData["Rapport Doublons attributaire"]) {
        alert('Données non disponibles');
        return;
    }
    const duplicate = dashboardData["Rapport Doublons attributaire"].find(d => d.valeur.toString() === value);
    if (duplicate) alert(`Valeur: ${duplicate.valeur}\nFréquence: ${duplicate.frequence}\nCommune: ${duplicate.commune}\nFIDs: ${duplicate.fid}`);
    else alert('Détails du doublon non trouvés');
}

// Resolve duplicate
function resolveDuplicate(value) {
    if (confirm(`Êtes-vous sûr de vouloir marquer le doublon ${value} comme résolu?`)) {
        alert('Action de résolution déclenchée. Le doublon sera traité par l\'équipe technique.');
    }
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

function formatNumber(num) {
    if (typeof num !== 'string') return num;
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
        'parcelles_individuelles': { background: 'rgba(74, 144, 226, 0.7)', border: '#4A90E2' },
        'parcelles_collectives': { background: 'rgba(80, 227, 194, 0.7)', border: '#50E3C2' },
        'parcelles_en_conflits': { background: 'rgba(241, 196, 15, 0.7)', border: '#F1C40F' },
        'pas_de_jointure': { background: 'rgba(243, 156, 18, 0.7)', border: '#F39C12' }
    };
    return colors[metric] || { background: 'rgba(149, 165, 166, 0.7)', border: '#95a5a6' };
}

// Initialize tooltips
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[title]').forEach(el => {
        el.classList.add('tooltip');
        const tooltipText = el.getAttribute('title');
        el.removeAttribute('title');
        const tooltipDiv = document.createElement('div');
        tooltipDiv.className = 'tooltiptext';
        tooltipDiv.textContent = tooltipText;
        el.appendChild(tooltipDiv);
    });
});

// Handle window resize
window.addEventListener('resize', debounce(() => {
    Object.values(charts).forEach(chart => chart?.resize());
}, 250));
