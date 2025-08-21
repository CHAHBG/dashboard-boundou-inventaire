// Variables globales
let dashboardData = null;
let charts = {};
let currentTheme = 'light';
let currentFilters = {
    commune: '',
    status: '',
    date: ''
};

// Couleurs du thème
const themeColors = {
    procasf: {
        rouge: '#A4161A',
        vert: '#2E7D32',
        bleu: '#003087',
        jaune: '#FFC107',
        brun: '#4E342E'
    },
    betplus: {
        bleu: '#1E40AF',
        jaune: '#FBBF24',
        gris: '#1F2937'
    },
    gradients: {
        primary: ['#1E40AF', '#003087'],
        secondary: ['#2E7D32', '#4CAF50'],
        warning: ['#A4161A', '#F44336'],
        success: ['#FFC107', '#FBBF24']
    }
};

// Données réelles extraites du JSON
const realData = {
    summary: {
        totalFiles: 15,
        success: 14,
        failures: 1,
        globalConflicts: 213,
        totalParcels: 36471,
        indivParcels: 25090,
        collParcels: 5366,
        conflictParcels: 135,
        noJoinParcels: 5880,
        indivRate: 68.8,
        collRate: 14.7,
        conflictRate: 0.4,
        noJoinRate: 16.1,
        successRate: (14 / 15 * 100).toFixed(1),
        cleaningRate: 9.93
    },
    communes: [
        { nom: 'BALA', brutes: 912, individuelles: 718, collectives: 144, conflits: 0, qualite: 96, statut: 'SUCCÈS' },
        { nom: 'BALLOU', brutes: 1551, individuelles: 359, collectives: 277, conflits: 0, qualite: 70, statut: 'SUCCÈS' },
        { nom: 'BANDAFASSI', brutes: 11731, individuelles: 2681, collectives: 736, conflits: 15, qualite: 92, statut: 'SUCCÈS' },
        { nom: 'BEMBOU', brutes: 5885, individuelles: 1542, collectives: 407, conflits: 5, qualite: 93, statut: 'SUCCÈS' },
        { nom: 'DIMBOLI', brutes: 6474, individuelles: 2409, collectives: 410, conflits: 2, qualite: 90, statut: 'SUCCÈS' },
        { nom: 'DINDEFELLO', brutes: 5725, individuelles: 1492, collectives: 249, conflits: 10, qualite: 95, statut: 'SUCCÈS' },
        { nom: 'FONGOLEMBI', brutes: 5001, individuelles: 870, collectives: 541, conflits: 1, qualite: 94, statut: 'SUCCÈS' },
        { nom: 'GABOU', brutes: 2003, individuelles: 601, collectives: 301, conflits: 0, qualite: 75, statut: 'SUCCÈS' },
        { nom: 'KOAR', brutes: 101, individuelles: 58, collectives: 30, conflits: 0, qualite: 92, statut: 'SUCCÈS' },
        { nom: 'MISSIRAH', brutes: 6844, individuelles: 3548, collectives: 781, conflits: 34, qualite: 88, statut: 'SUCCÈS' },
        { nom: 'MOUDERY', brutes: 1009, individuelles: 419, collectives: 310, conflits: 3, qualite: 80, statut: 'SUCCÈS' },
        { nom: 'NDOGA_BABACAR', brutes: 4759, individuelles: 0, collectives: 0, conflits: 0, qualite: 50, statut: 'ERREUR' },
        { nom: 'NETTEBOULOU', brutes: 3919, individuelles: 840, collectives: 538, conflits: 56, qualite: 65, statut: 'SUCCÈS' },
        { nom: 'SINTHIOU_MALEME', brutes: 2778, individuelles: 1348, collectives: 103, conflits: 0, qualite: 85, statut: 'SUCCÈS' },
        { nom: 'TOMBORONKOTO', brutes: 56834, individuelles: 8205, collectives: 539, conflits: 9, qualite: 98, statut: 'SUCCÈS' }
    ],
    quality: {
        validationRate: 93.3,
        criticalErrors: 9,
        consistency: 92.87
    },
    reportsHistory: [
        { date: '2025-08-21 14:30', type: 'Résumé exécutif', format: 'PDF', statut: 'Terminé', size: '2.3 MB' },
        { date: '2025-08-21 10:15', type: 'Rapport détaillé', format: 'Excel', statut: 'En cours', size: '--' }
    ],
    iaAnalysis: {
        correlation: {
            brutes_conflits: 0.067,
            indiv_conflits: 0.186,
            coll_conflits: 0.587
        },
        regression: {
            slope: 0.0000765,
            intercept: 8.41,
            r_value: 0.067,
            p_value: 0.812
        },
        forecast: 9.18,
        quality: {
            validation: 26.36,
            consistency: 92.87,
            critical: 9
        }
    }
};

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    setupEventListeners();
    loadData();

    const exportBtn = document.getElementById('exportCommuneTableBtn');
    if (exportBtn) {
        exportBtn.onclick = () => exportTableToCSV('communeTableBody', 'communes.csv');
    }
});

function initializeDashboard() {
    // Initialiser les onglets
    setupTabs();
    
    // Initialiser le thème
    const savedTheme = localStorage.getItem('dashboard-theme') || 'light';
    setTheme(savedTheme);
    
    // Animer l'entrée
    gsap.from('.kpi-card', {
        duration: 0.6,
        y: 30,
        opacity: 0,
        stagger: 0.1,
        ease: 'power2.out'
    });
}

function setupTabs() {
    document.querySelectorAll('.tab-btn').forEach(button => {
        button.addEventListener('click', () => {
            // Désactiver tous les onglets
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            
            // Activer l'onglet cliqué
            button.classList.add('active');
            const tabId = button.dataset.tab;
            document.getElementById(tabId).classList.add('active');
            
            // Charger les données de l'onglet
            loadTabData(tabId);
        });
    });
}

function setupEventListeners() {
    // Recherche en temps réel
    const searchInput = document.getElementById('communeSearch');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(filterTable, 300));
    }

    // Changement de métrique
    const metricSelector = document.getElementById('metricSelector');
    if (metricSelector) {
        metricSelector.addEventListener('change', updateCommuneChart);
    }

    // Changement de type de graphique
    const chartTypeSelector = document.getElementById('chartTypeSelector');
    if (chartTypeSelector) {
        chartTypeSelector.addEventListener('change', updateParcelChart);
    }

    // Écouteur pour les boutons de détail
    document.addEventListener('click', function(e) {
        if (e.target.closest('.fa-eye')) {
            const row = e.target.closest('tr');
            alert('Détail Commune: ' + row.cells[0].innerText + '\n(À personnaliser)');
        }
    });
}

function loadData() {
    dashboardData = realData;
    updateDashboard();
    updateHeaderStats();
    populateReportHistory();
}

function updateDashboard() {
    if (!dashboardData) return;

    // Mettre à jour les KPI
    updateKPIs();
    
    // Créer les graphiques
    createParcelDistributionChart();
    createMonthlyTrendChart();
    createCommunePerformanceChart();
    createQualityCharts();
    
    // Remplir le tableau des communes
    populateCommuneTable();
}

function updateHeaderStats() {
    if (!dashboardData) return;

    const { totalFiles, totalParcels, successRate } = dashboardData.summary;
    
    animateValue('headerTotalFiles', 0, totalFiles, 1000);
    animateValue('headerTotalParcels', 0, totalParcels, 1000);
    animateValue('headerSuccessRate', 0, successRate, 1000, '%');
}

function updateKPIs() {
    const summary = dashboardData.summary;
    
    animateValue('kpiFilesProcessed', 0, summary.totalFiles, 1000);
    animateValue('kpiTotalParcels', 0, summary.totalParcels, 1000);
    animateValue('kpiGlobalConflicts', 0, summary.globalConflicts, 1000);
    animateValue('kpiIndivParcels', 0, summary.indivParcels, 1000);
    animateValue('kpiCollParcels', 0, summary.collParcels, 1000);
    animateValue('kpiConflictParcels', 0, summary.conflictParcels, 1000);
    animateValue('kpiNoJoinParcels', 0, summary.noJoinParcels, 1000);
    
    document.getElementById('kpiFilesSuccess').textContent = `${summary.success} succès / ${summary.failures} échecs`;
    document.getElementById('kpiCleaningRate').textContent = `${summary.cleaningRate}%`;
    document.getElementById('kpiConflictPercentage').textContent = `${((summary.globalConflicts / summary.totalParcels)*100).toFixed(1)}% du total`;
    document.getElementById('kpiIndivRate').textContent = `${summary.indivRate}%`;
    document.getElementById('kpiCollRate').textContent = `${summary.collRate}%`;
    document.getElementById('kpiConflictRate').textContent = `${summary.conflictRate}%`;
    document.getElementById('kpiNoJoinRate').textContent = `${summary.noJoinRate}%`;
    
    // Qualité based on real data
    const quality = dashboardData.quality;
    animateValue('validationRate', 0, summary.successRate, 1000, '%');
    animateValue('criticalErrors', 0, summary.failures, 1000);
    animateValue('dataConsistency', 0, quality.consistency, 1000, '%');
}

function createParcelDistributionChart() {
    const ctx = document.getElementById('parcelDistributionChart').getContext('2d');
    if (!ctx || !dashboardData) return;

    if (charts.parcelDistribution) {
        charts.parcelDistribution.destroy();
    }

    const summary = dashboardData.summary;

    const data = {
        labels: ['Individuelles', 'Collectives', 'Conflits', 'Sans Jointure'],
        datasets: [{
            data: [summary.indivParcels, summary.collParcels, summary.conflictParcels, summary.noJoinParcels],
            backgroundColor: [
                createGradient(ctx, themeColors.gradients.primary),
                createGradient(ctx, themeColors.gradients.secondary),
                createGradient(ctx, themeColors.gradients.warning),
                createGradient(ctx, themeColors.gradients.success)
            ],
            borderWidth: 0,
            hoverOffset: 10
        }]
    };

    const chartType = document.getElementById('chartTypeSelector').value || 'doughnut';

    charts.parcelDistribution = new Chart(ctx, {
        type: chartType,
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        font: { size: 12 }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    cornerRadius: 8
                }
            },
            cutout: chartType === 'doughnut' ? '60%' : 0,
            animation: {
                animateRotate: true,
                duration: 1000
            }
        }
    });
}

function createMonthlyTrendChart() {
    const ctx = document.getElementById('monthlyTrendChart').getContext('2d');
    if (!ctx) return;

    if (charts.monthlyTrend) {
        charts.monthlyTrend.destroy();
    }

    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'];
    const data = months.map(() => Math.floor(Math.random() * 1000) + 500);

    charts.monthlyTrend = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [{
                label: 'Parcelles traitées',
                data: data,
                borderColor: themeColors.betplus.bleu,
                backgroundColor: `${themeColors.betplus.bleu}20`,
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: themeColors.betplus.bleu,
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    grid: { display: false },
                    border: { display: false }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)',
                        drawBorder: false
                    },
                    border: { display: false }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeInOutQuart'
            }
        }
    });
}

function createCommunePerformanceChart() {
    const ctx = document.getElementById('communePerformanceChart').getContext('2d');
    if (!ctx || !dashboardData) return;

    if (charts.communePerformance) {
        charts.communePerformance.destroy();
    }

    const communes = dashboardData.communes.map(c => c.nom);
    const metric = document.getElementById('metricSelector').value || 'individuelles';
    const data = dashboardData.communes.map(c => c[metric]);

    charts.communePerformance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: communes,
            datasets: [{
                label: getMetricLabel(metric),
                data: data,
                backgroundColor: communes.map((_, i) => 
                    `linear-gradient(135deg, ${themeColors.gradients.primary[0]}, ${themeColors.gradients.primary[1]})`
                ),
                borderRadius: 8,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    grid: { display: false },
                    border: { display: false }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)',
                        drawBorder: false
                    },
                    border: { display: false }
                }
            },
            animation: {
                duration: 1000,
                delay: (context) => context.dataIndex * 100
            }
        }
    });
}

function createCommuneConflictChart(topData) {
    const ctx = document.getElementById('communeConflictChart').getContext('2d');
    if (window.charts && window.charts.communeConflict) window.charts.communeConflict.destroy();
    window.charts = window.charts || {};
    window.charts.communeConflict = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: topData.map(c => c.name),
            datasets: [{
                label: 'Taux de conflits (%)',
                data: topData.map(c => c.taux.toFixed(2)),
                backgroundColor: '#A4161A',
                borderRadius: 7
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, max: Math.max(...topData.map(c=>c.taux))+1 }
            }
        }
    });
}

function createQualityCharts() {
    const ctx = document.getElementById('qualityMetricsChart').getContext('2d');
    if (!ctx || !dashboardData.quality) return;

    if (charts.qualityMetrics) {
        charts.qualityMetrics.destroy();
    }

    charts.qualityMetrics = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Validation', 'Cohérence', 'Complétude', 'Précision', 'Intégrité'],
            datasets: [{
                label: 'Score de qualité',
                data: [dashboardData.quality.validationRate, dashboardData.quality.consistency, 92.1, 87.5, 91.3],
                backgroundColor: `${themeColors.procasf.vert}40`,
                borderColor: themeColors.procasf.vert,
                borderWidth: 2,
                pointBackgroundColor: themeColors.procasf.vert
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    grid: { color: 'rgba(0, 0, 0, 0.1)' }
                }
            }
        }
    });
}

function createIAGauges() {
    // Placeholder pour les jauges IA (non implémenté dans cette version)
}

function populateCommuneTable() {
    const tbody = document.getElementById('communeTableBody');
    if (!tbody || !dashboardData) return;

    tbody.innerHTML = '';
    
    dashboardData.communes.forEach(commune => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${commune.nom}</strong></td>
            <td>${formatNumber(commune.brutes)}</td>
            <td>${formatNumber(commune.individuelles)}</td>
            <td>${formatNumber(commune.collectives)}</td>
            <td>${formatNumber(commune.conflits)}</td>
            <td>${commune.qualite}%</td>
            <td>
                <span class="status-badge ${commune.statut.toLowerCase()}">
                    ${commune.statut}
                </span>
            </td>
            <td>
                <button class="btn-icon" title="Voir détails">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-icon" title="Modifier">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function populateReportHistory() {
    const tbody = document.getElementById('reposrtHistoryBody');
    if (!tbody) return;

    tbody.innerHTML = '';
    
    dashboardData.reportsHistory.forEach(report => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${report.date}</td>
            <td>${report.type}</td>
            <td>${report.format}</td>
            <td><span class="status-badge ${report.statut.toLowerCase().replace(' ', '-') }">${report.statut}</span></td>
            <td>${report.size}</td>
            <td>
                <button class="btn-icon" title="Télécharger">
                    <i class="fas fa-download"></i>
                </button>
                <button class="btn-icon" title="Partager">
                    <i class="fas fa-share"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function loadTabData(tabId) {
    switch(tabId) {
        case 'dashboard':
            updateDashboard();
            break;
        case 'analysis':
            loadAnalysisTab();
            break;
        case 'communes':
            populateCommuneTable();
            break;
        case 'quality':
            createQualityCharts();
            break;
        case 'reports':
            populateReportHistory();
            break;
    }
}

function loadAnalysisTab() {
    const insightsDiv = document.getElementById('iaInsights');
    if (!insightsDiv) return;
    const analysis = dashboardData.iaAnalysis;
    const communes = dashboardData.communes;

    const conflictRates = communes.map(c => ({
        name: c.nom,
        taux: c.conflits && c.brutes ? (c.conflits / c.brutes * 100) : 0,
        brutes: c.brutes,
        conflits: c.conflits,
        pas_de_jointure: c.pas_de_jointure || 0,
        individuelles: c.individuelles,
        collectives: c.collectives
    }));
    conflictRates.sort((a, b) => b.taux - a.taux);
    const topConflict = conflictRates.slice(0, 5);

    const anomalies = [];
    communes.forEach(c => {
        if (c.conflits > 10 || (c.conflits/c.brutes)*100 > 1)
            anomalies.push(`Commune <b>${c.nom}</b> : taux de conflits élevé (${c.conflits} conflits, ${((c.conflits/c.brutes)*100).toFixed(2)}%)`);
        if ((c.individuelles + c.collectives) < 0.7 * c.brutes)
            anomalies.push(`Commune <b>${c.nom}</b> : complétude faible (${c.individuelles + c.collectives}/${c.brutes})`);
        if (c.pas_de_jointure && c.pas_de_jointure > 0.2 * c.brutes)
            anomalies.push(`Commune <b>${c.nom}</b> : beaucoup de parcelles sans jointure (${c.pas_de_jointure}/${c.brutes})`);
    });

    const topIndiv = [...communes].sort((a, b) => b.individuelles - a.individuelles).slice(0, 3);
    const topColl = [...communes].sort((a, b) => b.collectives - a.collectives).slice(0, 3);

    const regression = analysis.regression;
    const forecast10000 = regression.intercept + regression.slope * 10000;

    insightsDiv.innerHTML = `
        <h3><i class="fas fa-lightbulb"></i> Insights IA avancés</h3>
        <table>
            <tr><th>Corrélation Brutes / Conflits</th><td>${analysis.correlation.brutes_conflits.toFixed(3)}</td></tr>
            <tr><th>Corrélation Individuelles / Conflits</th><td>${analysis.correlation.indiv_conflits.toFixed(3)}</td></tr>
            <tr><th>Corrélation Collectives / Conflits</th><td>${analysis.correlation.coll_conflits.toFixed(3)}</td></tr>
            <tr><th>Prévision Conflits (10 000 brutes)</th><td>${forecast10000.toFixed(2)}</td></tr>
            <tr><th>Commune la + "conflictuelle"</th><td>${topConflict[0].name} (${topConflict[0].taux.toFixed(2)}%)</td></tr>
            <tr><th>Top 3 Individuelles</th><td>
                ${topIndiv.map(c => `${c.nom} (${c.individuelles})`).join(', ')}
            </td></tr>
            <tr><th>Top 3 Collectives</th><td>
                ${topColl.map(c => `${c.nom} (${c.collectives})`).join(', ')}
            </td></tr>
        </table>
        <div style="margin-top:1.5rem;">
            <b>Recommandations IA :</b>
            <ul>
                <li>Surveillez particulièrement les communes à taux de conflits ou "sans jointure" élevés.</li>
                <li>Renforcez la complétude là où <b>moins de 70% des brutes</b> sont attribuées.</li>
                <li>Optimisez la détection des doublons dans les communes à fort volume.</li>
            </ul>
        </div>
    `;

    const anomalyList = document.getElementById('iaAnomalyList');
    anomalyList.innerHTML = anomalies.length
        ? anomalies.map(a => `<li>${a}</li>`).join('')
        : `<li style="color:var(--procasf-vert)">Aucune anomalie majeure détectée !</li>`;

    setTimeout(() => createCommuneConflictChart(topConflict), 50);
    setTimeout(createIAGauges, 10);
}

function exportTableToCSV(tbodyId, filename) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;
    let csv = [];
    let headers = Array.from(tbody.parentElement.querySelectorAll('thead th')).map(cell => `"${cell.innerText}"`);
    csv.push(headers.join(","));
    for (let row of tbody.rows) {
        let rowData = [];
        for (let cell of row.cells) {
            rowData.push('"' + cell.innerText.replace(/"/g, '""') + '"');
        }
        csv.push(rowData.join(","));
    }
    const blob = new Blob([csv.join("\n")], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function runAdvancedAnalysis() {
    // Simuler chargement IA
    const insightsDiv = document.getElementById('iaInsights');
    insightsDiv.innerHTML = '<div class="spinner"></div><p>Analyse IA en cours...</p>';
    
    setTimeout(() => {
        loadAnalysisTab();
    }, 1500);
}

function updateParcelChart() {
    createParcelDistributionChart();
}

function updateCommuneChart() {
    createCommunePerformanceChart();
}

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(currentTheme);
}

function setTheme(theme) {
    document.body.dataset.theme = theme;
    currentTheme = theme;
    localStorage.setItem('dashboard-theme', theme);
    
    const icon = document.getElementById('themeIcon');
    if (icon) {
        icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }
}

function refreshData() {
    // Animation de rotation
    const refreshBtn = document.querySelector('.refresh-btn i');
    refreshBtn.style.animation = 'spin 1s linear infinite';
    
    setTimeout(() => {
        loadData();
        refreshBtn.style.animation = '';
    }, 1000);
}

function resetFilters() {
    document.getElementById('communeFilter').selectedIndex = 0;
    document.getElementById('statusFilter').selectedIndex = 0;
    document.getElementById('dateFilter').value = '';
    currentFilters = { commune: '', status: '', date: '' };
    populateCommuneTable();
}

function applyFilters() {
    currentFilters.commune = document.getElementById('communeFilter').value;
    currentFilters.status = document.getElementById('statusFilter').value;
    currentFilters.date = document.getElementById('dateFilter').value;
    
    // Appliquer les filtres au tableau
    filterTable();
}

function filterTable() {
    const searchTerm = document.getElementById('communeSearch')?.value.toLowerCase() || '';
    const rows = document.querySelectorAll('#communeTableBody tr');
    
    rows.forEach(row => {
        const communeName = row.cells[0]?.textContent.toLowerCase() || '';
        const status = row.cells[6]?.textContent.toLowerCase() || '';
        
        const matchesSearch = communeName.includes(searchTerm);
        const matchesStatus = !currentFilters.status || status.includes(currentFilters.status);
        const matchesCommune = !currentFilters.commune || communeName.includes(currentFilters.commune.toLowerCase());
        
        row.style.display = matchesSearch && matchesStatus && matchesCommune ? '' : 'none';
    });
}

function generateReport() {
    const reportType = document.getElementById('reportType').value;
    const format = document.getElementById('reportFormat').value;
    
    // Simuler la génération de rapport
    alert(`Génération du ${reportType} en format ${format.toUpperCase()}...`);
}

function animateValue(elementId, start, end, duration, suffix = '') {
    const element = document.getElementById(elementId);
    if (!element) return;

    const range = end - start;
    const startTime = performance.now();
    
    function updateValue(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const current = Math.floor(start + range * easeOutCubic(progress));
        
        element.textContent = formatNumber(current) + suffix;
        
        if (progress < 1) {
            requestAnimationFrame(updateValue);
        }
    }
    
    requestAnimationFrame(updateValue);
}

function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

function formatNumber(num) {
    return new Intl.NumberFormat('fr-FR').format(num);
}

function getMetricLabel(metric) {
    const labels = {
        individuelles: 'Parcelles Individuelles',
        collectives: 'Parcelles Collectives',
        conflits: 'Conflits',
        qualite: 'Indice de Qualité'
    };
    return labels[metric] || metric;
}

function createGradient(ctx, colors) {
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(1, colors[1]);
    return gradient;
}

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
