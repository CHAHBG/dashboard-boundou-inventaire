// Variables globales
let dashboardData = null;
let charts = {};
let currentTheme = 'light';
let currentFilters = { commune: '', status: '', date: '' };

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

// Hardcoded data as fallback
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

// Fetch JSON data
async function fetchDashboardData() {
  try {
    const response = await fetch('data/Rapport_Post_traitement.json');
    if (!response.ok) throw new Error('Failed to fetch JSON');
    const data = await response.json();
    const summary = data['Rapport sommaire'].reduce((acc, item) => {
      acc[item.date] = item['2025_08_19_19_17_47'];
      return acc;
    }, {});
    return { summary, ...realData }; // Merge JSON summary with realData
  } catch (error) {
    console.error('Error fetching JSON, using fallback data:', error);
    return realData; // Fallback to hardcoded data
  }
}

// Utility function to animate value changes
function animateValue(id, start, end, duration, suffix = '') {
  const element = document.getElementById(id);
  if (!element) {
    console.warn(`Element with ID ${id} not found for animation.`);
    return;
  }
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

// Initialize KPI cards dynamically
async function updateKPIs() {
  const data = await fetchDashboardData();
  dashboardData = data;
  const kpiGrid = document.getElementById('kpiGrid');
  if (!kpiGrid) {
    console.error('kpiGrid element not found');
    return;
  }
  kpiGrid.innerHTML = ''; // Clear existing content
  const summary = data.summary;
  const kpiData = [
    { id: 'kpiFilesProcessed', value: summary.totalFiles, label: 'Fichiers Traités', icon: 'files' },
    { id: 'kpiFilesSuccess', value: `${summary.success} succès / ${summary.failures} échecs`, label: 'Succès/Échecs', icon: 'quality' },
    { id: 'kpiTotalParcels', value: summary.totalParcels, label: 'Total Parcelles', icon: 'parcels' },
    { id: 'kpiGlobalConflicts', value: summary.globalConflicts, label: 'Conflits Globaux', icon: 'conflicts' },
    { id: 'kpiIndivParcels', value: summary.indivParcels, label: 'Parcelles Individuelles', icon: 'parcels' },
    { id: 'kpiCollParcels', value: summary.collParcels, label: 'Parcelles Collectives', icon: 'parcels' },
    { id: 'kpiConflictParcels', value: summary.conflictParcels, label: 'Parcelles en Conflit', icon: 'conflicts' },
    { id: 'kpiNoJoinParcels', value: summary.noJoinParcels, label: 'Sans Jointure', icon: 'quality' },
    { id: 'kpiIndivRate', value: summary.indivRate, label: 'Taux Individuelles', icon: 'parcels', suffix: '%' },
    { id: 'kpiCollRate', value: summary.collRate, label: 'Taux Collectives', icon: 'parcels', suffix: '%' },
    { id: 'kpiConflictRate', value: summary.conflictRate, label: 'Taux Conflits', icon: 'conflicts', suffix: '%' },
    { id: 'kpiNoJoinRate', value: summary.noJoinRate, label: 'Taux Sans Jointure', icon: 'quality', suffix: '%' },
    { id: 'kpiCleaningRate', value: summary.cleaningRate, label: 'Taux de Nettoyage', icon: 'quality', suffix: '%' }
  ];

  kpiData.forEach(kpi => {
    const card = document.createElement('div');
    card.className = `kpi-card shadowed kpi-icon-${kpi.icon}`;
    card.innerHTML = `
      <div class="kpi-header">
        <span class="kpi-icon ${kpi.icon}"><i class="fas fa-${kpi.icon === 'files' ? 'file-alt' : kpi.icon === 'parcels' ? 'map' : kpi.icon === 'conflicts' ? 'exclamation-triangle' : 'check-circle'}"></i></span>
        <button class="kpi-menu-btn"><i class="fas fa-ellipsis-v"></i></button>
      </div>
      <div class="kpi-title">${kpi.label}</div>
      <div class="kpi-value" id="${kpi.id}">${typeof kpi.value === 'string' ? kpi.value : formatNumber(kpi.value)}${kpi.suffix || ''}</div>
      <div class="kpi-trend ${kpi.value > 0 ? 'trend-positive' : 'trend-neutral'}">
        <i class="fas fa-arrow-up"></i> Tendance
      </div>
    `;
    kpiGrid.appendChild(card);
    if (typeof kpi.value === 'number') {
      animateValue(kpi.id, 0, kpi.value, 1000, kpi.suffix || '');
    }
  });

  // Animate KPI cards
  gsap.from('.kpi-card', {
    duration: 0.6,
    y: 30,
    opacity: 0,
    stagger: 0.1,
    ease: 'power2.out'
  });

  // Update header stats
  animateValue('headerTotalFiles', 0, summary.totalFiles, 1000);
  animateValue('headerTotalParcels', 0, summary.totalParcels, 1000);
  animateValue('headerSuccessRate', 0, summary.successRate, 1000, '%');
}

// Initialize Charts
async function initCharts() {
  const data = await fetchDashboardData();
  dashboardData = data;
  const summary = data.summary;
  const ctxParcel = document.getElementById('parcelDistributionChart')?.getContext('2d');
  const ctxMonthly = document.getElementById('monthlyTrendChart')?.getContext('2d');
  const ctxCommune = document.getElementById('communePerformanceChart')?.getContext('2d');
  const ctxQuality = document.getElementById('qualityMetricsChart')?.getContext('2d');
  const ctxAnomaly = document.getElementById('communeConflictChart')?.getContext('2d');

  if (!ctxParcel || !ctxMonthly || !ctxCommune || !ctxQuality || !ctxAnomaly) {
    console.error('Chart canvases not found');
    return;
  }

  // Parcel Distribution Chart
  if (charts.parcelDistribution) charts.parcelDistribution.destroy();
  charts.parcelDistribution = new Chart(ctxParcel, {
    type: document.getElementById('chartTypeSelector')?.value || 'doughnut',
    data: {
      labels: ['Individuelles', 'Collectives', 'Conflits', 'Sans Jointure'],
      datasets: [{
        data: [summary.indivParcels, summary.collParcels, summary.conflictParcels, summary.noJoinParcels],
        backgroundColor: [
          createGradient(ctxParcel, themeColors.gradients.primary),
          createGradient(ctxParcel, themeColors.gradients.secondary),
          createGradient(ctxParcel, themeColors.gradients.warning),
          createGradient(ctxParcel, themeColors.gradients.success)
        ],
        borderWidth: 0,
        hoverOffset: 10
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { padding: 20, usePointStyle: true, font: { size: 12 } } },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#fff',
          bodyColor: '#fff',
          callbacks: {
            label: (context) => `${context.label}: ${formatNumber(context.raw)} (${(context.raw / summary.totalParcels * 100).toFixed(1)}%)`
          }
        }
      },
      cutout: '60%',
      animation: { animateRotate: true, duration: 1000 },
      onClick: (e, elements) => {
        if (elements.length) {
          const label = charts.parcelDistribution.data.labels[elements[0].index];
          alert(`Filtrer par: ${label}`);
          currentFilters.commune = label.toLowerCase();
          filterTable();
        }
      }
    }
  });

  // Monthly Trend Chart
  if (charts.monthlyTrend) charts.monthlyTrend.destroy();
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'];
  const monthlyData = months.map(() => Math.floor(Math.random() * 1000) + 500); // Mock data
  charts.monthlyTrend = new Chart(ctxMonthly, {
    type: 'line',
    data: {
      labels: months,
      datasets: [{
        label: 'Parcelles traitées',
        data: monthlyData,
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
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, border: { display: false } },
        y: { beginAtZero: true, grid: { color: 'rgba(0, 0, 0, 0.1)', drawBorder: false }, border: { display: false } }
      },
      animation: { duration: 1000, easing: 'easeInOutQuart' }
    }
  });

  // Commune Performance Chart
  if (charts.communePerformance) charts.communePerformance.destroy();
  const communes = data.communes.map(c => c.nom);
  const metric = document.getElementById('metricSelector')?.value || 'individuelles';
  charts.communePerformance = new Chart(ctxCommune, {
    type: 'bar',
    data: {
      labels: communes,
      datasets: [{
        label: getMetricLabel(metric),
        data: data.communes.map(c => c[metric]),
        backgroundColor: communes.map(() => createGradient(ctxCommune, themeColors.gradients.primary)),
        borderRadius: 8,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, border: { display: false } },
        y: { beginAtZero: true, grid: { color: 'rgba(0, 0, 0, 0.1)', drawBorder: false }, border: { display: false } }
      },
      animation: { duration: 1000, delay: (context) => context.dataIndex * 100 }
    }
  });

  // Quality Metrics Chart
  if (charts.qualityMetrics) charts.qualityMetrics.destroy();
  charts.qualityMetrics = new Chart(ctxQuality, {
    type: 'radar',
    data: {
      labels: ['Validation', 'Cohérence', 'Complétude', 'Précision', 'Intégrité'],
      datasets: [{
        label: 'Score de qualité',
        data: [data.quality.validationRate, data.quality.consistency, 92.1, 87.5, 91.3],
        backgroundColor: `${themeColors.procasf.vert}40`,
        borderColor: themeColors.procasf.vert,
        borderWidth: 2,
        pointBackgroundColor: themeColors.procasf.vert
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { r: { beginAtZero: true, max: 100, grid: { color: 'rgba(0, 0, 0, 0.1)' } } }
    }
  });

  // IA Anomaly Chart
  if (charts.anomalyChart) charts.anomalyChart.destroy();
  charts.anomalyChart = new Chart(ctxAnomaly, {
    type: 'bar',
    data: {
      labels: ['Conflits', 'Échecs', 'Corrélation Collectives-Conflits'],
      datasets: [{
        label: 'Occurrences',
        data: [
          summary.conflictParcels,
          summary.failures,
          data.iaAnalysis.correlation.coll_conflits * 100
        ],
        backgroundColor: [
          createGradient(ctxAnomaly, themeColors.gradients.warning),
          createGradient(ctxAnomaly, themeColors.gradients.success),
          createGradient(ctxAnomaly, themeColors.gradients.primary)
        ],
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { y: { beginAtZero: true } }
    }
  });

  // Event listeners for chart updates
  document.getElementById('chartTypeSelector')?.addEventListener('change', () => {
    charts.parcelDistribution.config.type = document.getElementById('chartTypeSelector').value;
    charts.parcelDistribution.options.cutout = document.getElementById('chartTypeSelector').value === 'doughnut' ? '60%' : 0;
    charts.parcelDistribution.update();
  });

  document.getElementById('metricSelector')?.addEventListener('change', () => {
    const metric = document.getElementById('metricSelector').value;
    charts.communePerformance.data.datasets[0].label = getMetricLabel(metric);
    charts.communePerformance.data.datasets[0].data = data.communes.map(c => c[metric]);
    charts.communePerformance.update();
  });
}

// Enhanced IA Analysis
async function runAdvancedAnalysis() {
  const data = await fetchDashboardData();
  dashboardData = data;
  const insightsDiv = document.getElementById('iaInsights');
  const anomalyList = document.getElementById('iaAnomalyList');
  if (!insightsDiv || !anomalyList) {
    console.error('IA elements not found');
    return;
  }

  insightsDiv.innerHTML = '<div class="spinner"></div><p>Analyse IA en cours...</p>';
  anomalyList.innerHTML = '';

  setTimeout(() => {
    const analysis = data.iaAnalysis;
    const summary = data.summary;

    // Anomaly Detection
    const anomalies = [];
    if (summary.failures > 1) anomalies.push(`Échecs élevés: ${summary.failures} fichiers en erreur.`);
    if (summary.conflictParcels > 100) anomalies.push(`Conflits élevés: ${summary.conflictParcels} parcelles en conflit.`);
    if (analysis.correlation.coll_conflits > 0.5) anomalies.push(`Forte corrélation entre parcelles collectives et conflits: ${analysis.correlation.coll_conflits.toFixed(3)}.`);

    anomalies.forEach(anomaly => {
      const li = document.createElement('li');
      li.textContent = anomaly;
      anomalyList.appendChild(li);
    });

    // Insights
    insightsDiv.innerHTML = `
      <h3>Insights IA</h3>
      <p>Corrélation brutes-conflits: ${analysis.correlation.brutes_conflits.toFixed(3)}</p>
      <p>Corrélation individuelles-conflits: ${analysis.correlation.indiv_conflits.toFixed(3)}</p>
      <p>Corrélation collectives-conflits: ${analysis.correlation.coll_conflits.toFixed(3)}</p>
      <p>Régression pour conflits vs brutes: Slope = ${analysis.regression.slope.toFixed(6)}, R-value = ${analysis.regression.r_value.toFixed(3)}</p>
      <p>Prévision conflits pour 10,000 parcelles: ${analysis.forecast.toFixed(2)}</p>
      <p>Qualité: Validation = ${summary.successRate}%, Cohérence = ${analysis.quality.consistency.toFixed(2)}%</p>
    `;

    // IA Gauges
    const gauges = [
      { id: 'gaugeValidation', value: summary.successRate, label: 'Validation', thresholds: { red: 50, yellow: 80, green: 100 } },
      { id: 'gaugeConsistency', value: analysis.quality.consistency, label: 'Cohérence', thresholds: { red: 90, yellow: 95, green: 100 } },
      { id: 'gaugeCritical', value: summary.failures, label: 'Erreurs Critiques', thresholds: { red: 10, yellow: 5, green: 0 } },
      { id: 'gaugeForecast', value: analysis.forecast, label: 'Prévision Conflits', thresholds: { red: 20, yellow: 10, green: 0 } }
    ];

    gauges.forEach(g => {
      const ctx = document.getElementById(g.id)?.getContext('2d');
      if (ctx) {
        const color = g.value <= g.thresholds.red ? themeColors.procasf.rouge : g.value <= g.thresholds.yellow ? themeColors.procasf.jaune : themeColors.procasf.vert;
        new Chart(ctx, {
          type: 'gauge',
          data: {
            datasets: [{ value: g.value, backgroundColor: [color, '#ccc'] }]
          },
          options: {
            needle: { radiusPercentage: 2, widthPercentage: 3.2 },
            valueLabel: { display: true, formatter: () => `${Math.round(g.value)}%` }
          }
        });
      }
    });

    // Animate IA section
    gsap.from('.ia-gauge-card, .ia-insights, .ia-anomaly-list', {
      duration: 0.8,
      y: 20,
      opacity: 0,
      stagger: 0.2,
      ease: 'power2.out'
    });
  }, 1500);
}

// Dynamic User Guide
function renderGuide() {
  const guide = document.querySelector('.dashboard-guide');
  if (!guide) {
    console.error('Guide element not found');
    return;
  }

  const guideData = [
    {
      title: 'Navigation',
      icon: 'fas fa-compass',
      content: 'Utilisez les onglets en haut pour naviguer entre les vues Tableau de bord, Analyse IA, Communes, Qualité et Rapports.'
    },
    {
      title: 'KPI & Graphiques',
      icon: 'fas fa-chart-bar',
      content: 'Visualisez les KPI dans la grille et interagissez avec les graphiques. Changez le type de graphique via le sélecteur.'
    },
    {
      title: 'Filtres Avancés',
      icon: 'fas fa-filter',
      content: 'Filtrez par commune, statut ou période dans l’onglet Communes. Utilisez la recherche textuelle pour affiner.'
    },
    {
      title: 'Analyse IA',
      icon: 'fas fa-robot',
      content: 'Lancez une analyse IA pour détecter anomalies et obtenir des recommandations. Consultez les jauges pour la qualité.'
    },
    {
      title: 'Export & Rapports',
      icon: 'fas fa-file-export',
      content: 'Générez des rapports CSV/JSON dans l’onglet Rapports. Consultez l’historique pour retélécharger.'
    },
    {
      title: 'Mode Sombre',
      icon: 'fas fa-moon',
      content: 'Activez le mode sombre via l’icône dans le header pour un meilleur confort visuel.'
    }
  ];

  guide.innerHTML = `
    <div class="guide-header">
      <h2><i class="fas fa-info-circle"></i> Guide d'utilisation</h2>
      <button class="guide-close"><i class="fas fa-times"></i></button>
    </div>
    <div class="guide-content"></div>
  `;

  const guideContent = guide.querySelector('.guide-content');
  guideData.forEach((section, index) => {
    const sectionElement = document.createElement('div');
    sectionElement.className = 'guide-section';
    sectionElement.innerHTML = `
      <div class="guide-section-header" data-section="${index}">
        <i class="${section.icon}"></i>
        <span>${section.title}</span>
        <i class="fas fa-chevron-down guide-toggle-icon"></i>
      </div>
      <div class="guide-section-content" id="guide-section-${index}">
        <p>${section.content}</p>
      </div>
    `;
    guideContent.appendChild(sectionElement);
  });

  document.querySelectorAll('.guide-section-header').forEach(header => {
    header.addEventListener('click', () => {
      const sectionId = header.dataset.section;
      const content = document.getElementById(`guide-section-${sectionId}`);
      const icon = header.querySelector('.guide-toggle-icon');
      if (content.style.display === 'block') {
        gsap.to(content, {
          height: 0,
          opacity: 0,
          duration: 0.3,
          ease: 'power2.in',
          onComplete: () => {
            content.style.display = 'none';
            icon.className = 'fas fa-chevron-down guide-toggle-icon';
          }
        });
      } else {
        content.style.display = 'block';
        gsap.fromTo(content,
          { height: 0, opacity: 0 },
          { height: 'auto', opacity: 1, duration: 0.3, ease: 'power2.out' }
        );
        icon.className = 'fas fa-chevron-up guide-toggle-icon';
      }
    });
  });

  guide.querySelector('.guide-close').addEventListener('click', toggleGuide);
}

// Toggle User Guide
function toggleGuide() {
  const guide = document.querySelector('.dashboard-guide');
  if (!guide) return;

  if (guide.classList.contains('active')) {
    gsap.to(guide, {
      x: '100%',
      opacity: 0,
      duration: 0.5,
      ease: 'power2.in',
      onComplete: () => {
        guide.classList.remove('active');
        guide.style.display = 'none';
      }
    });
  } else {
    guide.style.display = 'block';
    guide.classList.add('active');
    gsap.fromTo(guide,
      { x: '100%', opacity: 0 },
      { x: '0%', opacity: 1, duration: 0.5, ease: 'power2.out' }
    );
  }
}

// Populate Commune Table
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
      <td><span class="status-badge ${commune.statut.toLowerCase()}">${commune.statut}</span></td>
      <td>
        <button class="btn-icon" title="Voir détails"><i class="fas fa-eye"></i></button>
        <button class="btn-icon" title="Modifier"><i class="fas fa-edit"></i></button>
      </td>
    `;
    tbody.appendChild(row);
  });

  // Populate commune filter
  const communeFilter = document.getElementById('communeFilter');
  if (communeFilter) {
    communeFilter.innerHTML = '<option value="">Toutes les communes</option>';
    dashboardData.communes.forEach(commune => {
      const option = document.createElement('option');
      option.value = commune.nom;
      option.textContent = commune.nom;
      communeFilter.appendChild(option);
    });
  }
}

// Populate Report History
function populateReportHistory() {
  const tbody = document.getElementById('reportHistoryBody');
  if (!tbody || !dashboardData) return;

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
        <button class="btn-icon" title="Télécharger"><i class="fas fa-download"></i></button>
        <button class="btn-icon" title="Partager"><i class="fas fa-share"></i></button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// Export Reports
async function generateReport() {
  const reportType = document.getElementById('reportType')?.value;
  const reportFormat = document.getElementById('reportFormat')?.value;

  if (!reportType || !reportFormat) {
    alert('Veuillez sélectionner un type et un format de rapport.');
    return;
  }

  const data = await fetchDashboardData();
  let reportData;
  switch (reportType) {
    case 'executive':
      reportData = {
        'Fichiers traités': data.summary.totalFiles,
        'Succès': data.summary.success,
        'Échecs': data.summary.failures,
        'Parcelles individuelles': data.summary.indivParcels,
        'Parcelles collectives': data.summary.collParcels
      };
      break;
    case 'detailed':
      reportData = data.summary;
      break;
    case 'technical':
      reportData = {
        'Conflits globaux': data.summary.globalConflicts,
        'Parcelles en conflit': data.summary.conflictParcels,
        'Corrélation collectives-conflits': data.iaAnalysis.correlation.coll_conflits
      };
      break;
    case 'quality':
      reportData = {
        'Taux de validation': data.summary.successRate,
        'Cohérence': data.quality.consistency,
        'Erreurs critiques': data.quality.criticalErrors
      };
      break;
  }

  if (reportFormat === 'csv') {
    const csvContent = convertToCSV(reportData);
    downloadFile(csvContent, `report_${reportType}.csv`, 'text/csv');
  } else if (reportFormat === 'json') {
    downloadFile(JSON.stringify(reportData, null, 2), `report_${reportType}.json`, 'application/json');
  } else {
    alert(`Format ${reportFormat} non supporté pour le moment.`);
    return;
  }

  // Update report history
  const reportHistoryBody = document.getElementById('reportHistoryBody');
  if (reportHistoryBody) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${new Date().toLocaleString()}</td>
      <td>${reportType}</td>
      <td>${reportFormat}</td>
      <td><span class="status-badge completed">Terminé</span></td>
      <td>${(JSON.stringify(reportData).length / 1024).toFixed(2)} KB</td>
      <td>
        <button class="btn-icon" title="Télécharger"><i class="fas fa-download"></i></button>
        <button class="btn-icon" title="Partager"><i class="fas fa-share"></i></button>
      </td>
    `;
    reportHistoryBody.appendChild(row);
  }
}

function convertToCSV(obj) {
  if (Array.isArray(obj)) {
    const headers = Object.keys(obj[0]);
    return headers.join(',') + '\n' + obj.map(row => headers.map(h => `"${row[h]?.toString().replace(/"/g, '""')}"`).join(',')).join('\n');
  }
  return 'Metric,Value\n' + Object.entries(obj).map(([k, v]) => `"${k.replace(/"/g, '""')}",${v}`).join('\n');
}

function downloadFile(content, fileName, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

// Initialize Dashboard
async function initializeDashboard() {
  await updateKPIs();
  await initCharts();
  await runAdvancedAnalysis();
  renderGuide();
  populateCommuneTable();
  populateReportHistory();
  setupEventListeners();
}

// Event Listeners
function setupEventListeners() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).classList.add('active');
      loadTabData(btn.dataset.tab);
    });
  });

  document.querySelector('.guide-toggle')?.addEventListener('click', toggleGuide);
  document.querySelector('.refresh-btn')?.addEventListener('click', refreshData);
  document.querySelector('.theme-toggle')?.addEventListener('click', toggleTheme);
  document.getElementById('communeSearch')?.addEventListener('input', debounce(filterTable, 300));
  document.getElementById('communeFilter')?.addEventListener('change', applyFilters);
  document.getElementById('statusFilter')?.addEventListener('change', applyFilters);
  document.getElementById('dateFilter')?.addEventListener('change', applyFilters);
  document.getElementById('exportCommuneTableBtn')?.addEventListener('click', () => {
    const csvContent = convertToCSV(dashboardData.communes);
    downloadFile(csvContent, 'commune_data.csv', 'text/csv');
  });
}

function loadTabData(tabId) {
  switch (tabId) {
    case 'dashboard':
      updateKPIs();
      initCharts();
      break;
    case 'analysis':
      runAdvancedAnalysis();
      break;
    case 'communes':
      populateCommuneTable();
      break;
    case 'quality':
      initCharts();
      break;
    case 'reports':
      populateReportHistory();
      break;
  }
}

function toggleTheme() {
  currentTheme = currentTheme === 'light' ? 'dark' : 'light';
  document.body.dataset.theme = currentTheme;
  localStorage.setItem('dashboard-theme', currentTheme);
  const icon = document.getElementById('themeIcon');
  if (icon) {
    icon.className = currentTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
  }
}

function refreshData() {
  const refreshBtn = document.querySelector('.refresh-btn i');
  refreshBtn.style.animation = 'spin 1s linear infinite';
  setTimeout(() => {
    initializeDashboard();
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
  filterTable();
}

function filterTable() {
  const searchTerm = document.getElementById('communeSearch')?.value.toLowerCase() || '';
  const rows = document.querySelectorAll('#communeTableBody tr');

  rows.forEach(row => {
    const communeName = row.cells[0]?.textContent.toLowerCase() || '';
    const status = row.cells[6]?.textContent.toLowerCase() || '';
    const matchesSearch = communeName.includes(searchTerm);
    const matchesStatus = !currentFilters.status || status.includes(currentFilters.status.toLowerCase());
    const matchesCommune = !currentFilters.commune || communeName.includes(currentFilters.commune.toLowerCase());
    row.style.display = matchesSearch && matchesStatus && matchesCommune ? '' : 'none';
  });
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

// DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('kpiGrid')) {
    initializeDashboard();
  } else {
    console.error('Critical element #kpiGrid not found');
  }
});
