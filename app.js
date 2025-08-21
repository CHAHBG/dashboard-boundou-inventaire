// script.js
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
        totalParcels: 36471,
        processedFiles: 14,
        conflicts: 213,
        successRate: 93.3,
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
        criticalErrors: 1,
        consistency: 90.07
    },
    reportsHistory: [
        { date: '2025-08-21 14:30', type: 'Résumé exécutif', format: 'PDF', statut: 'Terminé', size: '2.3 MB' },
        { date: '2025-08-21 10:15', type: 'Rapport détaillé', format: 'Excel', statut: 'En cours', size: '--' }
    ]
};

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    setupEventListeners();
    loadData();
});

function initializeDashboard() {
    // Initialiser les onglets
    setupTabs();
    
    // Initialiser le thème
    const savedTheme = localStorage.getItem('dashboard-theme') || 'light';
    setTheme(savedTheme);
    
    // Animer l'entrée avec GSAP amélioré
    gsap.from('.kpi-card', {
        duration: 0.8,
        y: 50,
        opacity: 0,
        stagger: 0.15,
        ease: 'back.out(1.7)'
    });
    
    gsap.from('.chart-card', {
        duration: 0.8,
        y: 50,
        opacity: 0,
        stagger: 0.2,
        ease: 'back.out(1.7)',
        delay: 0.5
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
    
    // Filtres pour communes
    const communeFilter = document.getElementById('communeFilter');
    if (communeFilter) {
        realData.communes.forEach(commune => {
            const option = document.createElement('option');
            option.value = commune.nom;
            option.textContent = commune.nom;
            communeFilter.appendChild(option);
        });
    }
}

function loadData() {
    // Utiliser les données réelles
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
    const { totalFiles, totalParcels, conflicts, successRate, cleaningRate } = dashboardData.summary;
    
    animateValue('kpiFilesProcessed', 0, totalFiles, 1000);
    animateValue('kpiTotalParcels', 0, totalParcels, 1000);
    animateValue('kpiConflicts', 0, conflicts, 1000);
    
    document.getElementById('kpiFilesSuccess').textContent = `${successRate}% de succès`;
    document.getElementById('kpiCleaningRate').textContent = `${cleaningRate}%`;
    document.getElementById('kpiConflictPercentage').textContent = `${((conflicts/totalParcels)*100).toFixed(1)}% du total`;
    
    // Mettre à jour les KPI de qualité
    if (dashboardData.quality) {
        const { validationRate, criticalErrors, consistency } = dashboardData.quality;
        animateValue('validationRate', 0, validationRate, 1000, '%');
        animateValue('criticalErrors', 0, criticalErrors, 1000);
        animateValue('dataConsistency', 0, consistency, 1000, '%');
    }
}

function createParcelDistributionChart() {
    const ctx = document.getElementById('parcelDistributionChart').getContext('2d');
    if (!ctx || !dashboardData) return;

    if (charts.parcelDistribution) {
        charts.parcelDistribution.destroy();
    }

    const totalIndiv = dashboardData.communes.reduce((sum, c) => sum + c.individuelles, 0);
    const totalColl = dashboardData.communes.reduce((sum, c) => sum + c.collectives, 0);
    const totalConflits = dashboardData.communes.reduce((sum, c) => sum + c.conflits, 0);

    const data = {
        labels: ['Individuelles', 'Collectives', 'Conflits'],
        datasets: [{
            data: [totalIndiv, totalColl, totalConflits],
            backgroundColor: [
                createGradient(ctx, themeColors.gradients.primary),
                createGradient(ctx, themeColors.gradients.secondary),
                createGradient(ctx, themeColors.gradients.warning)
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
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            let label = context.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed !== null) {
                                label += new Intl.NumberFormat('fr-FR').format(context.parsed);
                            }
                            return label;
                        }
                    }
                }
            },
            cutout: chartType === 'doughnut' ? '60%' : 0,
            animation: {
                animateRotate: true,
                duration: 1500,
                easing: 'easeInOutQuart'
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

    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Août'];
    // Simuler tendance avec augmentation vers août
    const base = 4000;
    const data = months.map((_, i) => base + i * 500 + Math.random() * 300);

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
                legend: { display: false },
                annotation: {
                    annotations: {
                        line1: {
                            type: 'line',
                            yMin: base,
                            yMax: base,
                            borderColor: 'rgba(255, 99, 132, 0.3)',
                            borderWidth: 2,
                            label: {
                                content: 'Moyenne',
                                enabled: true,
                                position: 'top'
                            }
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    border: { display: false }
                },
                y: {
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)',
                        drawBorder: false
                    },
                    border: { display: false }
                }
            },
            animation: {
                duration: 1500,
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

    let filteredCommunes = dashboardData.communes;
    if (currentFilters.commune) {
        filteredCommunes = filteredCommunes.filter(c => c.nom === currentFilters.commune);
    }

    const communes = filteredCommunes.map(c => c.nom);
    const metric = document.getElementById('metricSelector').value || 'individuelles';
    const data = filteredCommunes.map(c => c[metric]);

    charts.communePerformance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: communes,
            datasets: [{
                label: getMetricLabel(metric),
                data: data,
                backgroundColor: communes.map((_, i) => 
                    createGradient(ctx, themeColors.gradients.primary)
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
                duration: 1500,
                delay: (context) => context.dataIndex * 150,
                easing: 'easeOutBounce'
            }
        }
    });
}

function createQualityCharts() {
    // Graphique des métriques de qualité
    const ctx1 = document.getElementById('qualityMetricsChart').getContext('2d');
    if (ctx1 && dashboardData.quality) {
        if (charts.qualityMetrics) charts.qualityMetrics.destroy();
        
        charts.qualityMetrics = new Chart(ctx1, {
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
                },
                animation: {
                    duration: 1500,
                    easing: 'easeInOutQuart'
                }
            }
        });
    }

    // Graphique de tendance qualité
    const ctx2 = document.getElementById('qualityTrendChart').getContext('2d');
    if (ctx2) {
        if (charts.qualityTrend) charts.qualityTrend.destroy();
        
        const trendData = Array.from({length: 12}, (_, i) => 
            85 + Math.sin(i * 0.5) * 5 + Math.random() * 3
        );
        
        charts.qualityTrend = new Chart(ctx2, {
            type: 'line',
            data: {
                labels: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
                datasets: [{
                    label: 'Score qualité mensuel',
                    data: trendData,
                    borderColor: themeColors.procasf.jaune,
                    backgroundColor: `${themeColors.procasf.jaune}20`,
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { display: false } },
                    y: { 
                        beginAtZero: false,
                        min: 80,
                        max: 100,
                        grid: { color: 'rgba(0, 0, 0, 0.1)' }
                    }
                },
                animation: {
                    duration: 1500,
                    easing: 'easeInOutQuart'
                }
            }
        });
    }
}

function populateCommuneTable() {
    const tbody = document.getElementById('communeTableBody');
    if (!tbody || !dashboardData) return;

    tbody.innerHTML = '';
    
    let filteredCommunes = dashboardData.communes;
    if (currentFilters.commune) {
        filteredCommunes = filteredCommunes.filter(c => c.nom === currentFilters.commune);
    }
    if (currentFilters.status) {
        filteredCommunes = filteredCommunes.filter(c => c.statut.toLowerCase() === currentFilters.status);
    }
    // Ajouter filtre date si applicable (simulé)

    filteredCommunes.forEach(commune => {
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
                <button class="btn-icon" title="Voir détails" onclick="showCommuneDetails('${commune.nom}')">
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
    const tbody = document.getElementById('reportHistoryBody');
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
                <button class="btn-icon" title="Télécharger" onclick="downloadReport('${report.date}')">
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

// Fonctions utilitaires
function loadTabData(tabId) {
    switch(tabId) {
        case 'dashboard':
            updateDashboard();
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
    
    // Mettre à jour les charts pour adapter aux couleurs du thème
    Object.values(charts).forEach(chart => chart.update());
}

function refreshData() {
    // Animation de rotation
    const refreshBtn = document.querySelector('.refresh-btn i');
    refreshBtn.style.animation = 'spin 1s linear infinite';
    
    setTimeout(() => {
        loadData();
        refreshBtn.style.animation = '';
        gsap.from('.kpi-value', { duration: 0.5, opacity: 0, stagger: 0.1 });
    }, 1000);
}

function resetFilters() {
    document.getElementById('communeFilter').selectedIndex = 0;
    document.getElementById('statusFilter').selectedIndex = 0;
    document.getElementById('dateFilter').value = '';
    currentFilters = { commune: '', status: '', date: '' };
    populateCommuneTable();
    createCommunePerformanceChart();  // Updater chart
    createParcelDistributionChart();  // Updater chart
}

function applyFilters() {
    currentFilters.commune = document.getElementById('communeFilter').value;
    currentFilters.status = document.getElementById('statusFilter').value;
    currentFilters.date = document.getElementById('dateFilter').value;
    
    // Appliquer les filtres au tableau et charts
    populateCommuneTable();
    createCommunePerformanceChart();
    createParcelDistributionChart();
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
    
    // Simuler génération et ajouter à l'historique
    const newReport = {
        date: new Date().toLocaleString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
        type: reportType.charAt(0).toUpperCase() + reportType.slice(1),
        format: format.toUpperCase(),
        statut: 'Terminé',
        size: `${Math.floor(Math.random() * 5 + 1)}.${Math.floor(Math.random() * 9)} MB`
    };
    
    dashboardData.reportsHistory.push(newReport);
    populateReportHistory();
    
    alert(`Rapport ${reportType} généré en ${format.toUpperCase()} !`);
}

function showCommuneDetails(communeName) {
    alert(`Détails pour la commune ${communeName} : \n- À implémenter avec modale ou page détaillée.`);
}

function downloadReport(date) {
    alert(`Téléchargement du rapport du ${date} en cours...`);
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
