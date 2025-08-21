// Variables globales
let dashboardData = null;
let charts = {};
let currentTheme = 'light';
let currentFilters = { commune: '', status: '', date: '' };
let reportHistory = []; // Liste dynamique pour l'historique des rapports

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

// Hardcoded data as fallback (sans données fictives pour reportsHistory)
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
    cleaningRate: 9.93,
    jointuresIndividuelles: 14,
    jointuresCollectives: 14,
    memeIDUP: 9
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
    consistency: 92.87,
    completude: 92.1,
    precision: 87.5,
    integrite: 91.3
  },
  reportsHistory: [], // Données fictives supprimées
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
      validation: 93.3,
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
    const jsonData = await response.json();
    const summary = jsonData['Rapport sommaire'].reduce((acc, item) => {
      const key = item.date.toLowerCase().replace(/ /g, '_');
      let value = item['2025_08_19_19_17_47'];
      if (typeof value === 'string' && value.includes('%')) {
        value = parseFloat(value.replace('%', '')) || 0;
      }
      acc[key] = value;
      return acc;
    }, {});
    return {
      summary: {
        ...realData.summary,
        totalFiles: summary['fichiers_traités'] || realData.summary.totalFiles,
        success: summary['succès'] || realData.summary.success,
        failures: summary['échecs'] || realData.summary.failures,
        globalConflicts: summary['conflits_globaux'] || realData.summary.globalConflicts,
        totalParcels: summary['total_enregistrement_(parcelles_apres_netoyage)'] || realData.summary.totalParcels,
        indivParcels: summary['parcelles_individuelles'] || realData.summary.indivParcels,
        collParcels: summary['parcelles_collectives'] || realData.summary.collParcels,
        conflictParcels: summary['conflits_(parcelles_à_la_fois_individuelle_et_collecvive)'] || realData.summary.conflictParcels,
        noJoinParcels: summary['pas_de_jointure_(pas_d\'idup_ou_ancien_idup_ndoga)'] || realData.summary.noJoinParcels,
        indivRate: summary['taux_des_parcelles_individuelles'] || realData.summary.indivRate,
        collRate: summary['taux_des_parcelles_collectives'] || realData.summary.collRate,
        conflictRate: summary['taux_des_parcelles_conflictuelles'] || realData.summary.conflictRate,
        noJoinRate: summary['taux_des_parcelles_sans_jointure'] || realData.summary.noJoinRate,
        jointuresIndividuelles: summary['fichiers_jointures_individuelles'] || realData.summary.jointuresIndividuelles,
        jointuresCollectives: summary['fichiers_jointures_collectives'] || realData.summary.jointuresCollectives,
        memeIDUP: summary['fichiers_avec_même_idup_individuelle_et_collective'] || realData.summary.memeIDUP,
        successRate: summary['succès'] ? (summary['succès'] / summary['fichiers_traités'] * 100).toFixed(1) : realData.summary.successRate
      },
      ...realData
    };
  } catch (error) {
    console.error('Error fetching JSON, using fallback data:', error);
    return realData;
  }
}

// Utility function to animate value changes
function animateValue(id, start, end, duration, suffix = '') {
  const element = document.getElementById(id);
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

// Initialize KPI cards with grouped categories
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

  // Grouped KPI data for better organization
  const kpiGroups = [
    {
      category: 'Traitement des Fichiers',
      kpis: [
        { id: 'kpiFilesProcessed', value: summary.totalFiles, label: 'Fichiers Traités', icon: 'files' },
        { id: 'kpiFilesSuccess', value: `${summary.success} succès / ${summary.failures} échecs`, label: 'Succès/Échecs', icon: 'quality' },
        { id: 'kpiSuccessRate', value: summary.successRate, label: 'Taux de Succès', icon: 'quality', suffix: '%' }
      ]
    },
    {
      category: 'Parcelles',
      kpis: [
        { id: 'kpiTotalParcels', value: summary.totalParcels, label: 'Total Parcelles', icon: 'parcels' },
        { id: 'kpiIndivParcels', value: summary.indivParcels, label: 'Parcelles Individuelles', icon: 'parcels' },
        { id: 'kpiCollParcels', value: summary.collParcels, label: 'Parcelles Collectives', icon: 'parcels' },
        { id: 'kpiNoJoinParcels', value: summary.noJoinParcels, label: 'Sans Jointure', icon: 'quality' }
      ]
    },
    {
      category: 'Taux',
      kpis: [
        { id: 'kpiIndivRate', value: summary.indivRate, label: 'Taux Individuelles', icon: 'parcels', suffix: '%' },
        { id: 'kpiCollRate', value: summary.collRate, label: 'Taux Collectives', icon: 'parcels', suffix: '%' },
        { id: 'kpiNoJoinRate', value: summary.noJoinRate, label: 'Taux Sans Jointure', icon: 'quality', suffix: '%' }
      ]
    },
    {
      category: 'Conflits et Jointures',
      kpis: [
        { id: 'kpiGlobalConflicts', value: summary.globalConflicts, label: 'Conflits Globaux', icon: 'conflicts' },
        { id: 'kpiConflictParcels', value: summary.conflictParcels, label: 'Parcelles en Conflit', icon: 'conflicts' },
        { id: 'kpiConflictRate', value: summary.conflictRate, label: 'Taux Conflits', icon: 'conflicts', suffix: '%' },
        { id: 'kpiJointuresIndividuelles', value: summary.jointuresIndividuelles, label: 'Jointures Individuelles', icon: 'files' },
        { id: 'kpiJointuresCollectives', value: summary.jointuresCollectives, label: 'Jointures Collectives', icon: 'files' },
        { id: 'kpiMemeIDUP', value: summary.memeIDUP, label: 'Même IDUP Indiv/Coll', icon: 'conflicts' }
      ]
    }
  ];

  kpiGroups.forEach(group => {
    const categoryDiv = document.createElement('div');
    categoryDiv.className = 'kpi-category';
    const categoryHeader = document.createElement('h3');
    categoryHeader.className = 'kpi-category-header';
    categoryHeader.textContent = group.category;
    categoryDiv.appendChild(categoryHeader);
    const groupGrid = document.createElement('div');
    groupGrid.className = 'kpi-group-grid';
    group.kpis.forEach(kpi => {
      const card = document.createElement('div');
      card.className = `kpi-card kpi-icon-${kpi.icon}`;
      card.innerHTML = `
        <div class="kpi-header">
          <span class="kpi-icon ${kpi.icon}"><i class="fas fa-${kpi.icon === 'files' ? 'file-alt' : kpi.icon === 'parcels' ? 'map' : kpi.icon === 'conflicts' ? 'exclamation-triangle' : 'check-circle'}"></i></span>
          <button class="kpi-menu-btn"><i class="fas fa-ellipsis-v"></i></button>
        </div>
        <div class="kpi-title">${kpi.label}</div>
        <div class="kpi-value" id="${kpi.id}">${typeof kpi.value === 'string' ? kpi.value : formatNumber(kpi.value)}${kpi.suffix || ''}</div>
      `;
      groupGrid.appendChild(card);
      if (typeof kpi.value === 'number') {
        animateValue(kpi.id, 0, kpi.value, 1000, kpi.suffix || '');
      }
    });
    categoryDiv.appendChild(groupGrid);
    kpiGrid.appendChild(categoryDiv);
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
  const canvases = {
    parcel: document.getElementById('parcelDistributionChart')?.getContext('2d'),
    commune: document.getElementById('communePerformanceChart')?.getContext('2d'),
    quality: document.getElementById('qualityMetricsChart')?.getContext('2d'),
    anomaly: document.getElementById('communeConflictChart')?.getContext('2d')
  };

  // Log canvas availability for debugging
  console.log('Canvas availability:', canvases);

  // Parcel Distribution Chart
  if (canvases.parcel) {
    if (charts.parcelDistribution) charts.parcelDistribution.destroy();
    charts.parcelDistribution = new Chart(canvases.parcel, {
      type: document.getElementById('chartTypeSelector')?.value || 'doughnut',
      data: {
        labels: ['Individuelles', 'Collectives', 'Conflits', 'Sans Jointure'],
        datasets: [{
          data: [summary.indivParcels, summary.collParcels, summary.conflictParcels, summary.noJoinParcels],
          backgroundColor: [
            createGradient(canvases.parcel, themeColors.gradients.primary),
            createGradient(canvases.parcel, themeColors.gradients.secondary),
            createGradient(canvases.parcel, themeColors.gradients.warning),
            createGradient(canvases.parcel, themeColors.gradients.success)
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
        animation: { animateRotate: true, duration: 1000 }
      }
    });
  } else {
    console.warn('Parcel distribution canvas not found');
  }

  // Commune Performance Chart
  if (canvases.commune) {
    if (charts.communePerformance) charts.communePerformance.destroy();
    const communes = data.communes.map(c => c.nom);
    const metric = document.getElementById('metricSelector')?.value || 'individuelles';
    charts.communePerformance = new Chart(canvases.commune, {
      type: 'bar',
      data: {
        labels: communes,
        datasets: [{
          label: getMetricLabel(metric),
          data: data.communes.map(c => c[metric]),
          backgroundColor: communes.map(() => createGradient(canvases.commune, themeColors.gradients.primary)),
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
  } else {
    console.warn('Commune performance canvas not found');
  }

  // Quality Metrics Chart
  if (canvases.quality) {
    if (charts.qualityMetrics) charts.qualityMetrics.destroy();
    charts.qualityMetrics = new Chart(canvases.quality, {
      type: 'radar',
      data: {
        labels: ['Validation', 'Cohérence', 'Complétude', 'Précision', 'Intégrité'],
        datasets: [{
          label: 'Score de qualité',
          data: [data.quality.validationRate, data.quality.consistency, data.quality.completude, data.quality.precision, data.quality.integrite],
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
  } else {
    console.warn('Quality metrics canvas not found');
  }

  // IA Anomaly Chart
  if (canvases.anomaly) {
    if (charts.anomalyChart) charts.anomalyChart.destroy();
    charts.anomalyChart = new Chart(canvases.anomaly, {
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
            createGradient(canvases.anomaly, themeColors.gradients.warning),
            createGradient(canvases.anomaly, themeColors.gradients.success),
            createGradient(canvases.anomaly, themeColors.gradients.primary)
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
  } else {
    console.warn('Anomaly chart canvas not found');
  }

  // Event listeners for chart updates
  const chartTypeSelector = document.getElementById('chartTypeSelector');
  if (chartTypeSelector) {
    chartTypeSelector.addEventListener('change', () => {
      if (charts.parcelDistribution) {
        charts.parcelDistribution.config.type = chartTypeSelector.value;
        charts.parcelDistribution.options.cutout = chartTypeSelector.value === 'doughnut' ? '60%' : 0;
        charts.parcelDistribution.update();
      }
    });
  }

  const metricSelector = document.getElementById('metricSelector');
  if (metricSelector) {
    metricSelector.addEventListener('change', () => {
      if (charts.communePerformance) {
        const metric = metricSelector.value;
        charts.communePerformance.data.datasets[0].label = getMetricLabel(metric);
        charts.communePerformance.data.datasets[0].data = data.communes.map(c => c[metric]);
        charts.communePerformance.update();
      }
    });
  }
}

// Enhanced IA Analysis
async function runAdvancedAnalysis() {
  const data = await fetchDashboardData();
  dashboardData = data;
  const insightsDiv = document.getElementById('iaInsights');
  const anomalyList = document.getElementById('iaAnomalyList');
  if (!insightsDiv || !anomalyList) {
    console.warn('IA elements not found, skipping IA analysis');
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
    if (summary.memeIDUP > 5) anomalies.push(`Nombre élevé de fichiers avec même IDUP: ${summary.memeIDUP}.`);

    anomalies.forEach(anomaly => {
      const li = document.createElement('li');
      li.textContent = anomaly;
      anomalyList.appendChild(li);
    });

    // Insights
    insightsDiv.innerHTML = `
      <h3>Insights IA</h3>
      <p><strong>Corrélation brutes-conflits</strong>: ${analysis.correlation.brutes_conflits.toFixed(3)} (faible impact des parcelles brutes sur les conflits).</p>
      <p><strong>Corrélation individuelles-conflits</strong>: ${analysis.correlation.indiv_conflits.toFixed(3)} (corrélation modérée).</p>
      <p><strong>Corrélation collectives-conflits</strong>: ${analysis.correlation.coll_conflits.toFixed(3)} (forte relation entre parcelles collectives et conflits).</p>
      <p><strong>Régression pour conflits vs brutes</strong>: Slope = ${analysis.regression.slope.toFixed(6)}, R-value = ${analysis.regression.r_value.toFixed(3)} (faible prédiction linéaire).</p>
      <p><strong>Prévision conflits</strong>: ${analysis.forecast.toFixed(2)} conflits estimés pour 10,000 parcelles.</p>
      <p><strong>Qualité</strong>: Validation = ${summary.successRate}%, Cohérence = ${analysis.quality.consistency.toFixed(2)}%, Erreurs critiques = ${analysis.quality.critical}.</p>
    `;

    // IA Gauges
    const gauges = [
      { id: 'gaugeValidation', value: summary.successRate, label: 'Validation', max: 100 },
      { id: 'gaugeConsistency', value: analysis.quality.consistency, label: 'Cohérence', max: 100 },
      { id: 'gaugeCritical', value: summary.failures, label: 'Erreurs Critiques', max: 20 },
      { id: 'gaugeForecast', value: analysis.forecast, label: 'Prévision Conflits', max: 50 }
    ];

    gauges.forEach(g => {
      const ctx = document.getElementById(g.id)?.getContext('2d');
      if (ctx) {
        if (charts[g.id]) charts[g.id].destroy();
        const color = g.value > g.max * 0.8 ? themeColors.procasf.rouge : g.value > g.max * 0.5 ? themeColors.procasf.jaune : themeColors.procasf.vert;
        charts[g.id] = new Chart(ctx, {
          type: 'doughnut',
          data: {
            datasets: [{
              data: [g.value, g.max - g.value],
              backgroundColor: [color, '#e0e0e0'],
              borderWidth: 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
              legend: { display: false },
              tooltip: { enabled: false },
              title: {
                display: true,
                text: `${Math.round(g.value)}%`,
                position: 'bottom',
                color: color,
                font: { size: 14, weight: 'bold' }
              }
            }
          }
        });
      } else {
        console.warn(`Gauge canvas ${g.id} not found`);
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
  if (!tbody) return;

  tbody.innerHTML = '';
  reportHistory.forEach(report => {
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
        'Parcelles collectives': data.summary.collParcels,
        'Jointures Individuelles': data.summary.jointuresIndividuelles,
        'Jointures Collectives': data.summary.jointuresCollectives,
        'Même IDUP': data.summary.memeIDUP
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
        'Complétude': data.quality.completude,
        'Précision': data.quality.precision,
        'Intégrité': data.quality.integrite,
        'Erreurs critiques': data.quality.criticalErrors
      };
      break;
    case 'full':
      reportData = data;
      break;
  }

  if (reportFormat === 'csv') {
    const csvContent = convertToCSV(reportData);
    downloadFile(csvContent, `report_${reportType}.csv`, 'text/csv');
  } else if (reportFormat === 'json') {
    downloadFile(JSON.stringify(reportData, null, 2), `report_${reportType}.json`, 'application/json');
  } else if (reportFormat === 'pdf') {
    generatePDFReport(data, reportType);
    return;
  } else {
    alert(`Format ${reportFormat} non supporté pour le moment.`);
    return;
  }

  // Update report history for non-PDF formats
  const reportSize = (JSON.stringify(reportData).length / 1024).toFixed(2) + ' KB';
  reportHistory.push({
    date: new Date().toLocaleString(),
    type: reportType.charAt(0).toUpperCase() + reportType.slice(1),
    format: reportFormat.toUpperCase(),
    statut: 'Terminé',
    size: reportSize
  });
  populateReportHistory();
}

// Generate PDF Report
async function generatePDFReport(data, reportType) {
  const { jsPDF } = window.jspdf;
  if (!jsPDF) {
    console.error('jsPDF library not loaded');
    alert('Erreur : la bibliothèque jsPDF n\'est pas chargée.');
    return;
  }

  const doc = new jsPDF();
  const margin = 10;
  let y = 10;

  // Helper function to add text with word wrapping
  function addText(text, x, y, fontSize = 12, isBold = false, maxWidth = 190) {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    const splitText = doc.splitTextToSize(text, maxWidth);
    doc.text(splitText, x, y);
    return y + splitText.length * (fontSize * 0.4);
  }

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  y = addText(`Rapport ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} - Enquête Foncière`, margin, y, 16, true);
  y = addText(`Date: ${new Date().toLocaleString('fr-FR')}`, margin, y + 5, 12);
  y = addText('Par PROCASF & BET-PLUS SA', margin, y + 5, 12);
  y += 10;

  if (reportType === 'full' || reportType === 'executive') {
    // Executive Summary
    y = addText('Résumé Exécutif', margin, y, 14, true);
    const summary = data.summary;
    const summaryItems = [
      `Fichiers Traités: ${formatNumber(summary.totalFiles)}`,
      `Succès/Échecs: ${summary.success} succès / ${summary.failures} échecs`,
      `Total Parcelles: ${formatNumber(summary.totalParcels)}`,
      `Conflits Globaux: ${formatNumber(summary.globalConflicts)}`,
      `Parcelles Individuelles: ${formatNumber(summary.indivParcels)} (${summary.indivRate}%)`,
      `Parcelles Collectives: ${formatNumber(summary.collParcels)} (${summary.collRate}%)`,
      `Parcelles en Conflit: ${formatNumber(summary.conflictParcels)} (${summary.conflictRate}%)`,
      `Parcelles Sans Jointure: ${formatNumber(summary.noJoinParcels)} (${summary.noJoinRate}%)`,
      `Jointures Individuelles: ${formatNumber(summary.jointuresIndividuelles)}`,
      `Jointures Collectives: ${formatNumber(summary.jointuresCollectives)}`,
      `Même IDUP Indiv/Coll: ${formatNumber(summary.memeIDUP)}`
    ];
    summaryItems.forEach(item => {
      y = addText(`• ${item}`, margin + 5, y + 5, 10);
    });
    y += 10;
  }

  if (reportType === 'full' || reportType === 'communes') {
    // Commune Analysis
    y = addText('Analyse par Commune', margin, y, 14, true);
    const communes = data.communes.slice(0, 5); // Limit to 5 for brevity
    doc.autoTable({
      startY: y,
      head: [['Commune', 'Brutes', 'Individuelles', 'Collectives', 'Conflits', 'Qualité', 'Statut']],
      body: communes.map(c => [
        c.nom,
        formatNumber(c.brutes),
        formatNumber(c.individuelles),
        formatNumber(c.collectives),
        formatNumber(c.conflits),
        `${c.qualite}%`,
        c.statut
      ]),
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: themeColors.procasf.bleu }
    });
    y = doc.lastAutoTable.finalY + 10;
  }

  if (reportType === 'full' || reportType === 'quality') {
    // Quality Metrics
    y = addText('Métriques de Qualité', margin, y, 14, true);
    const quality = data.quality;
    const qualityItems = [
      `Validation (${quality.validationRate}%): Taux de fichiers traités avec succès.`,
      `Cohérence (${quality.consistency}%): Mesure de la cohérence des données.`,
      `Complétude (${quality.completude}%): Proportion des données complètes.`,
      `Précision (${quality.precision}%): Exactitude des données.`,
      `Intégrité (${quality.integrite}%): Intégrité structurelle des données.`,
      `Erreurs critiques (${quality.criticalErrors}): Nombre d'erreurs critiques détectées.`
    ];
    qualityItems.forEach(item => {
      y = addText(`• ${item}`, margin + 5, y + 5, 10);
    });
    y += 10;
  }

  if (reportType === 'full' || reportType === 'analysis') {
    // IA Analysis
    y = addText('Analyse IA', margin, y, 14, true);
    const iaAnalysis = data.iaAnalysis;
    y = addText('Corrélations', margin + 5, y + 5, 12, true);
    const correlationItems = [
      `Brutes-Conflits: ${iaAnalysis.correlation.brutes_conflits.toFixed(3)} (faible impact).`,
      `Individuelles-Conflits: ${iaAnalysis.correlation.indiv_conflits.toFixed(3)} (corrélation modérée).`,
      `Collectives-Conflits: ${iaAnalysis.correlation.coll_conflits.toFixed(3)} (forte relation).`
    ];
    correlationItems.forEach(item => {
      y = addText(`• ${item}`, margin + 10, y + 5, 10);
    });
    y = addText('Régression', margin + 5, y + 5, 12, true);
    const regressionItems = [
      `Slope: ${iaAnalysis.regression.slope.toFixed(6)}`,
      `R-value: ${iaAnalysis.regression.r_value.toFixed(3)}`,
      `P-value: ${iaAnalysis.regression.p_value.toFixed(3)}`
    ];
    regressionItems.forEach(item => {
      y = addText(`• ${item}`, margin + 10, y + 5, 10);
    });
    y = addText(`Prévision: ${iaAnalysis.forecast.toFixed(2)} conflits estimés pour 10,000 parcelles.`, margin + 5, y + 5, 10);
    y = addText('Qualité IA', margin + 5, y + 5, 12, true);
    const iaQualityItems = [
      `Validation: ${iaAnalysis.quality.validation.toFixed(2)}%`,
      `Cohérence: ${iaAnalysis.quality.consistency.toFixed(2)}%`,
      `Erreurs Critiques: ${iaAnalysis.quality.critical}`
    ];
    iaQualityItems.forEach(item => {
      y = addText(`• ${item}`, margin + 10, y + 5, 10);
    });
    y += 10;
  }

  if (reportType === 'full' || reportType === 'reports') {
    // Report History
    y = addText('Historique des Rapports', margin, y, 14, true);
    doc.autoTable({
      startY: y,
      head: [['Date', 'Type', 'Format', 'Statut', 'Taille']],
      body: reportHistory.map(r => [r.date, r.type, r.format, r.statut, r.size]),
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: themeColors.procasf.bleu }
    });
    y = doc.lastAutoTable.finalY + 10;
  }

  // Save PDF
  doc.save(`dashboard_${reportType}_report.pdf`);

  // Update report history
  reportHistory.push({
    date: new Date().toLocaleString(),
    type: reportType.charAt(0).toUpperCase() + reportType.slice(1),
    format: 'PDF',
    statut: 'Terminé',
    size: '~'
  });
  populateReportHistory();
}

// Convert to CSV
function convertToCSV(obj) {
  if (Array.isArray(obj)) {
    const headers = Object.keys(obj[0]);
    return headers.join(',') + '\n' + obj.map(row => headers.map(h => `"${row[h]?.toString().replace(/"/g, '""')}"`).join(',')).join('\n');
  }
  return 'Metric,Value\n' + Object.entries(obj).map(([k, v]) => `"${k.replace(/"/g, '""')}",${v}`).join('\n');
}

// Download File
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
  document.getElementById('generateReportBtn')?.addEventListener('click', generateReport);
}

function loadTabData(tabId) {
  switch (tabId) {
    case 'dashboard':
      updateKPIs();
      initCharts();
      break;
    case 'analysis':
      runAdvancedAnalysis();
      initCharts();
      break;
    case 'communes':
      populateCommuneTable();
      break;
    case 'quality':
      initCharts();
      document.getElementById('qualityAnalysis')?.classList.add('active');
      break;
    case 'reports':
      populateReportHistory();
      break;
  }
}

function toggleTheme() {
  currentTheme = currentTheme === 'light' ? 'dark' : 'light';
  document.documentElement.dataset.theme = currentTheme;
  localStorage.setItem('dashboard-theme', currentTheme);
  const icon = document.getElementById('themeIcon');
  if (icon) {
    icon.className = currentTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
  }
}

function refreshData() {
  const refreshBtn = document.querySelector('.refresh-btn i');
  if (refreshBtn) {
    refreshBtn.style.animation = 'spin 1s linear infinite';
    setTimeout(() => {
      initializeDashboard();
      refreshBtn.style.animation = '';
    }, 1000);
  }
}

function resetFilters() {
  const communeFilter = document.getElementById('communeFilter');
  const statusFilter = document.getElementById('statusFilter');
  const dateFilter = document.getElementById('dateFilter');
  if (communeFilter) communeFilter.selectedIndex = 0;
  if (statusFilter) statusFilter.selectedIndex = 0;
  if (dateFilter) dateFilter.value = '';
  currentFilters = { commune: '', status: '', date: '' };
  populateCommuneTable();
}

function applyFilters() {
  currentFilters.commune = document.getElementById('communeFilter')?.value || '';
  currentFilters.status = document.getElementById('statusFilter')?.value || '';
  currentFilters.date = document.getElementById('dateFilter')?.value || '';
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
  const savedTheme = localStorage.getItem('dashboard-theme') || 'light';
  currentTheme = savedTheme;
  document.documentElement.dataset.theme = savedTheme;
  const icon = document.getElementById('themeIcon');
  if (icon) {
    icon.className = savedTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
  }
  if (document.getElementById('kpiGrid')) {
    initializeDashboard();
  } else {
    console.error('Critical element #kpiGrid not found');
  }
});
