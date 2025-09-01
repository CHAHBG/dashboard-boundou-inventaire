// Ensure we're in a browser environment
if (typeof window !== 'undefined') {
  // Fix for Favicon 404 error
  const link = document.createElement('link');
  link.rel = 'shortcut icon';
  link.href = 'data:image/x-icon;,';
  document.head.appendChild(link);
}

// Variables globales
let dashboardData = null;
let charts = {};
let currentTheme = 'light';
let currentFilters = { commune: '', status: '', date: '', period: 'all' };
let reportHistory = []; // Liste dynamique pour l'historique des rapports
let insightData = {}; // Données pour les insights IA

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
  dashboard: {
    primary: '#3B82F6',
    secondary: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#6366F1',
    dark: '#1F2937',
    light: '#F3F4F6',
    yellow: '#FBBF24',
    orange: '#F97316',
    teal: '#14B8A6',
    indigo: '#6366F1'
  },
  gradients: {
    primary: ['#1E40AF', '#3B82F6'],
    secondary: ['#047857', '#10B981'],
    warning: ['#D97706', '#F59E0B'],
    danger: ['#B91C1C', '#EF4444'],
    success: ['#15803D', '#22C55E']
  },
  charts: {
    pieColors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#6366F1', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#84CC16'],
    lineColors: {
      primary: '#3B82F6',
      secondary: '#10B981',
      warning: '#F59E0B',
      danger: '#EF4444'
    }
  }
};

// Options par défaut pour les charts
const chartDefaults = {
  animation: {
    duration: 1000,
    easing: 'easeOutQuart'
  },
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        boxWidth: 12,
        padding: 15,
        font: {
          size: 11
        }
      }
    },
    tooltip: {
      backgroundColor: 'rgba(17, 24, 39, 0.8)',
      titleFont: {
        size: 13,
        weight: 'bold'
      },
      bodyFont: {
        size: 12
      },
      padding: 12,
      cornerRadius: 4,
      boxPadding: 6
    }
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
  },
  communes: [
    {nom: 'BANDAFASSI', brutes: 3900, individuelles: 2735, collectives: 753, conflits: 12, qualite: 92.3, statut: 'Complété'},
    {nom: 'DIMBOLI', brutes: 3268, individuelles: 2401, collectives: 532, conflits: 15, qualite: 91.6, statut: 'Complété'},
    {nom: 'DINDEFELLO', brutes: 1845, individuelles: 1378, collectives: 380, conflits: 15, qualite: 93.4, statut: 'Complété'},
    {nom: 'NETTEBOULOU', brutes: 3382, individuelles: 2313, collectives: 677, conflits: 70, qualite: 90.7, statut: 'Complété'},
    {nom: 'BALLOU', brutes: 1417, individuelles: 1109, collectives: 242, conflits: 45, qualite: 98.5, statut: 'Complété'},
    {nom: 'MISSIRAH', brutes: 6446, individuelles: 4216, collectives: 230, conflits: 0, qualite: 92.1, statut: 'Complété'},
    {nom: 'TOMBORONKOTO', brutes: 10688, individuelles: 8235, collectives: 549, conflits: 12, qualite: 88.6, statut: 'Complété'},
    {nom: 'SINTHIOU_MALEME', brutes: 1700, individuelles: 3535, collectives: 1021, conflits: 26, qualite: 90.9, statut: 'Complété'},
    {nom: 'FONGOLEMBI', brutes: 1546, individuelles: 1282, collectives: 139, conflits: 15, qualite: 90.4, statut: 'Complété'},
    {nom: 'BALA', brutes: 911, individuelles: 800, collectives: 97, conflits: 5, qualite: 94.2, statut: 'Complété'},
    {nom: 'BEMBOU', brutes: 2083, individuelles: 1867, collectives: 125, conflits: 0, qualite: 94.8, statut: 'Complété'},
    {nom: 'GABOU', brutes: 1662, individuelles: 1441, collectives: 210, conflits: 0, qualite: 95.9, statut: 'Complété'},
    {nom: 'KOAR', brutes: 101, individuelles: 87, collectives: 10, conflits: 4, qualite: 96.3, statut: 'Complété'},
    {nom: 'MOUDERY', brutes: 1004, individuelles: 900, collectives: 100, conflits: 4, qualite: 98.0, statut: 'Complété'},
    {nom: 'NDOGA_BABACAR', brutes: 3157, individuelles: 2790, collectives: 350, conflits: 17, qualite: 71.2, statut: 'En cours'}
  ],
  issues: [
    {type: 'Doublons IDUP', count: 4280, impact: 'Élevé', status: 'Résolu'},
    {type: 'Parcelles conflictuelles', count: 211, impact: 'Moyen', status: 'Résolu'},
    {type: 'Pas de jointure', count: 7475, impact: 'Moyen', status: 'En cours'},
    {type: 'Erreurs de géométrie', count: 157, impact: 'Faible', status: 'En cours'},
    {type: 'Attributs manquants', count: 2103, impact: 'Faible', status: 'En attente'}
  ],
  problematicParcels: [
    {idup: '1312010100259', commune: 'BANDAFASSI', issue: 'Conflit individuelle/collective', status: 'Résolu'},
    {idup: '1312020100056', commune: 'DIMBOLI', issue: 'Doublon', status: 'Résolu'},
    {idup: '0512030103277', commune: 'BALLOU', issue: 'Conflit individuelle/collective', status: 'Résolu'},
    {idup: '0512030103276', commune: 'BALLOU', issue: 'Conflit individuelle/collective', status: 'Résolu'},
    {idup: '0512030103274', commune: 'BALLOU', issue: 'Conflit individuelle/collective', status: 'En cours'}
  ],
  activityLog: [
    {date: '2025-08-19', action: 'Nettoyage doublons', commune: 'BANDAFASSI', user: 'Système'},
    {date: '2025-08-19', action: 'Jointure parcelles', commune: 'BANDAFASSI', user: 'Système'},
    {date: '2025-08-19', action: 'Export données', commune: 'Toutes', user: 'admin'},
    {date: '2025-08-18', action: 'Import fichiers bruts', commune: 'NDOGA_BABACAR', user: 'technicien1'},
    {date: '2025-08-17', action: 'Correction conflits', commune: 'BALLOU', user: 'technicien2'}
  ]
};

// Fetch JSON data from data folder with robust error handling and UI error banner
async function fetchDashboardData() {
  // List of all JSON files to load
  const files = [
    'Rapport_Post_traitement.json',
    'communes_data.json',
    'dashboard_data_complete.json',
    'dashboard_kpis.json',
    'duplicate_removal_log.json',
    'duplicate_removal_summary.json',
    'nettoyage_doublon_idup.json',
    'parcel_join_conflicts.json',
    'problematic_parcels_summary.json',
    'rapport_jointure.json'
  ];

  const dataMap = {};
  const failedFiles = [];
  let hadError = false;

  // Fetch all files in parallel, log which fail
  const responses = await Promise.all(files.map(async (f) => {
    try {
      const res = await fetch('data/' + f);
      if (!res.ok) {
        failedFiles.push(f);
        hadError = true;
        return null;
      }
      return await res.json();
    } catch (err) {
      failedFiles.push(f);
      hadError = true;
      return null;
    }
  }));

  files.forEach((f, i) => {
    dataMap[f.replace('.json', '')] = responses[i];
  });

  // Example: extract summary from Rapport_Post_traitement.json if available
  let summary = {};
  if (dataMap['Rapport_Post_traitement'] && dataMap['Rapport_Post_traitement']['Rapport sommaire']) {
    summary = dataMap['Rapport_Post_traitement']['Rapport sommaire'].reduce((acc, item) => {
      const key = item.date?.toLowerCase().replace(/ /g, '_');
      let value = item['2025_08_19_19_17_47'];
      if (typeof value === 'string' && value.includes('%')) {
        value = parseFloat(value.replace('%', '')) || 0;
      }
      if (key) acc[key] = value;
      return acc;
    }, {});
  }

  // Merge all data into one object for dashboard use, fallback to partial data
  const merged = {
    summary: {
      ...realData.summary,
      ...summary
    },
    communes_data: dataMap['communes_data'],
    dashboard_data_complete: dataMap['dashboard_data_complete'],
    dashboard_kpis: dataMap['dashboard_kpis'],
    duplicate_removal_log: dataMap['duplicate_removal_log'],
    duplicate_removal_summary: dataMap['duplicate_removal_summary'],
    nettoyage_doublon_idup: dataMap['nettoyage_doublon_idup'],
    parcel_join_conflicts: dataMap['parcel_join_conflicts'],
    problematic_parcels_summary: dataMap['problematic_parcels_summary'],
    rapport_jointure: dataMap['rapport_jointure'],
    ...realData
  };

  // Show error banner if any file failed
  if (hadError) {
    showErrorBanner('Certains fichiers de données n\'ont pas pu être chargés :<br>' + failedFiles.map(f => `<b>${f}</b>`).join(', ') + '<br>Le tableau de bord utilise les données disponibles.');
    console.error('Fichiers JSON manquants ou non chargés:', failedFiles);
  } else {
    removeErrorBanner();
  }
  return merged;
}

// Show a visible error banner at the top of the dashboard
function showErrorBanner(message) {
  let banner = document.getElementById('dashboardErrorBanner');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'dashboardErrorBanner';
    banner.style.background = '#ffcccc';
    banner.style.color = '#a4161a';
    banner.style.padding = '16px';
    banner.style.fontWeight = 'bold';
    banner.style.textAlign = 'center';
    banner.style.position = 'sticky';
    banner.style.top = '0';
    banner.style.zIndex = '9999';
    document.body.prepend(banner);
  }
  banner.innerHTML = '<i class="fas fa-exclamation-triangle"></i> ' + message;
}

function removeErrorBanner() {
  const banner = document.getElementById('dashboardErrorBanner');
  if (banner) banner.remove();
}

// Utility function to animate value changes with fade-in effect for visual polish
function animateValue(id, start, end, duration, suffix = '') {
  const element = document.getElementById(id);
  if (!element) return;
  const range = end - start;
  const startTime = performance.now();
  element.style.opacity = 0;
  function updateValue(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const current = Math.floor(start + range * easeOutCubic(progress));
    element.textContent = formatNumber(current) + suffix;
    element.style.opacity = progress;
    if (progress < 1) {
      requestAnimationFrame(updateValue);
    } else {
      element.style.opacity = 1;
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

  // Update header stats
  document.getElementById('headerTotalFiles').textContent = formatNumber(summary.totalFiles);
  document.getElementById('headerTotalParcels').textContent = formatNumber(summary.totalParcels);
  document.getElementById('headerSuccessRate').textContent = `${summary.successRate}%`;

  // Create KPI Categories
  const kpiCategories = [
    {
      name: 'Parcelles',
      icon: 'fa-map-marker-alt',
      kpis: [
        { label: 'Total', value: summary.totalParcels, color: 'primary' },
        { label: 'Individuelles', value: summary.indivParcels, color: 'success', percentage: summary.indivRate },
        { label: 'Collectives', value: summary.collParcels, color: 'info', percentage: summary.collRate },
        { label: 'Conflictuelles', value: summary.conflictParcels, color: 'warning', percentage: summary.conflictRate },
        { label: 'Sans jointure', value: summary.noJoinParcels, color: 'danger', percentage: summary.noJoinRate }
      ]
    },
    {
      name: 'Qualité',
      icon: 'fa-check-circle',
      kpis: [
        { label: 'Score global', value: `${summary.dataQuality}%`, color: 'success' },
        { label: 'Taux de nettoyage', value: `${summary.cleaningRate}%`, color: 'info' },
        { label: 'Validation', value: `${summary.quality.validation}%`, color: 'primary' },
        { label: 'Problèmes critiques', value: summary.quality.critical, color: 'danger' }
      ]
    },
    {
      name: 'Traitement',
      icon: 'fa-cogs',
      kpis: [
        { label: 'Fichiers traités', value: summary.totalFiles, color: 'primary' },
        { label: 'Succès', value: summary.success, color: 'success', percentage: summary.successRate },
        { label: 'Jointures individuelles', value: summary.jointuresIndividuelles, color: 'info' },
        { label: 'Jointures collectives', value: summary.jointuresCollectives, color: 'warning' }
      ]
    }
  ];

  // Create KPI cards grouped by category
  kpiCategories.forEach(category => {
    const categoryDiv = document.createElement('div');
    categoryDiv.className = 'kpi-category';
    
    // Create category header
    const categoryHeader = document.createElement('div');
    categoryHeader.className = 'category-header';
    categoryHeader.innerHTML = `
      <div class="category-icon"><i class="fas ${category.icon}"></i></div>
      <h3>${category.name}</h3>
    `;
    categoryDiv.appendChild(categoryHeader);
    
    // Create KPI cards container
    const kpiCardsDiv = document.createElement('div');
    kpiCardsDiv.className = 'kpi-cards';
    
    // Add individual KPI cards
    category.kpis.forEach(kpi => {
      const kpiCard = document.createElement('div');
      kpiCard.className = `kpi-card ${kpi.color}`;
      let percentageHTML = '';
      
      if (kpi.percentage !== undefined) {
        const icon = kpi.percentage > 0 ? 'fa-arrow-up' : 'fa-arrow-down';
        const percentClass = kpi.percentage > 0 ? 'positive' : 'negative';
        percentageHTML = `<span class="kpi-percent ${percentClass}"><i class="fas ${icon}"></i> ${Math.abs(kpi.percentage).toFixed(1)}%</span>`;
      }
      
      kpiCard.innerHTML = `
        <div class="kpi-content">
          <span class="kpi-label">${kpi.label}</span>
          <span class="kpi-value">${formatNumber(kpi.value)}</span>
          ${percentageHTML}
        </div>
      `;
      kpiCardsDiv.appendChild(kpiCard);
    });
    
    categoryDiv.appendChild(kpiCardsDiv);
    kpiGrid.appendChild(categoryDiv);
  });

// Create gradient for chart backgrounds (for Chart.js)
function createGradient(ctx, colors) {
  if (!ctx) return colors[0];
  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, colors[0]);
  gradient.addColorStop(1, colors[1] || colors[0]);
  return gradient;
}

// Initialize and update all charts with performance optimizations (data slicing, lazy loading)
async function initCharts() {
  const data = await fetchDashboardData();
  if (!data) return;
  
  // Limit data for better performance
  dashboardData = data;
  const summary = data.summary;
  
  // Slice communes data to avoid overloading charts (use only top 10 communes)
  const limitedCommunes = data.communes ? data.communes.slice(0, 10) : [];
  
  // Prepare chart canvases
  const canvases = {
    parcelDistribution: document.getElementById('parcelDistributionChart'),
    commune: document.getElementById('communePerformanceChart'),
    trend: document.getElementById('trendChart'),
    duplicate: document.getElementById('duplicateChart'),
    join: document.getElementById('joinChart'),
    heatmap: document.getElementById('heatmapChart'),
    problemPie: document.getElementById('problemPieChart'),
    topUnjoined: document.getElementById('topUnjoinedChart'),
    topDuplicate: document.getElementById('topDuplicateChart')
  };
  // --- NEW: Heatmap for duplicate rates by commune ---
  if (canvases.heatmap && data.dashboard_kpis && data.dashboard_kpis.top_communes) {
    if (charts.heatmap) charts.heatmap.destroy();
    const labels = data.dashboard_kpis.top_communes.by_duplicate_rate.map(c => c.commune);
    const values = data.dashboard_kpis.top_communes.by_duplicate_rate.map(c => c.value);
    charts.heatmap = new Chart(canvases.heatmap, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Taux de doublons (%)',
          data: values,
          backgroundColor: labels.map(() => createGradient(canvases.heatmap, themeColors.gradients.warning)),
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
          y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.1)' }, border: { display: false } }
        },
        animation: { duration: 1200 }
      }
    });
  }

  // --- NEW: Pie chart for problematic/unjoined/conflicted parcels ---
  if (canvases.problemPie && data.dashboard_kpis) {
    if (charts.problemPie) charts.problemPie.destroy();
    const kpi = data.dashboard_kpis.kpi_summary;
    charts.problemPie = new Chart(canvases.problemPie, {
      type: 'pie',
      data: {
        labels: ['Parcelles Problématiques', 'Parcelles Sans Jointure', 'Parcelles Conflituelles'],
        datasets: [{
          data: [kpi.problematic_parcels.value, kpi.unjoined_parcels.value, kpi.problematic_parcels.value],
          backgroundColor: ['#F44336', '#9CA3AF', '#FFC107'],
          borderWidth: 2,
          borderColor: '#FFFFFF'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } }
      }
    });
  }

  // --- NEW: Top communes by unjoined parcels ---
  if (canvases.topUnjoined && data.dashboard_kpis && data.dashboard_kpis.top_communes) {
    if (charts.topUnjoined) charts.topUnjoined.destroy();
    const labels = data.dashboard_kpis.top_communes.by_unjoined_parcels.map(c => c.commune);
    const values = data.dashboard_kpis.top_communes.by_unjoined_parcels.map(c => c.value);
    charts.topUnjoined = new Chart(canvases.topUnjoined, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Parcelles sans jointure',
          data: values,
          backgroundColor: labels.map(() => createGradient(canvases.topUnjoined, themeColors.gradients.danger)),
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
          y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.1)' }, border: { display: false } }
        },
        animation: { duration: 1200 }
      }
    });
  }

  // --- NEW: Top communes by duplicate rate ---
  if (canvases.topDuplicate && data.dashboard_kpis && data.dashboard_kpis.top_communes) {
    if (charts.topDuplicate) charts.topDuplicate.destroy();
    const labels = data.dashboard_kpis.top_communes.by_duplicate_rate.map(c => c.commune);
    const values = data.dashboard_kpis.top_communes.by_duplicate_rate.map(c => c.value);
    charts.topDuplicate = new Chart(canvases.topDuplicate, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Taux de doublons (%)',
          data: values,
          backgroundColor: labels.map(() => createGradient(canvases.topDuplicate, themeColors.gradients.warning)),
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
          y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.1)' }, border: { display: false } }
        },
        animation: { duration: 1200 }
      }
    });
  }
  
  // Update total parcels count in the UI
  if (document.getElementById('totalParcelsCount')) {
    document.getElementById('totalParcelsCount').textContent = formatNumber(summary.totalParcels);
  }
  
  // Parcel Distribution Chart
  if (canvases.parcelDistribution) {
    if (charts.parcelDistribution) charts.parcelDistribution.destroy();
    
    const chartType = document.getElementById('chartTypeSelector')?.value || 'doughnut';
    const labels = ['Individuelles', 'Collectives', 'Conflictuelles', 'Sans jointure'];
    const values = [summary.indivParcels, summary.collParcels, summary.conflictParcels, summary.noJoinParcels];
    
    // Colors for the different parcel types
    const backgroundColors = chartType === 'bar' ? 
      [createGradient(canvases.parcelDistribution, themeColors.gradients.secondary),
       createGradient(canvases.parcelDistribution, themeColors.gradients.primary),
       createGradient(canvases.parcelDistribution, themeColors.gradients.warning),
       createGradient(canvases.parcelDistribution, ['#9CA3AF', '#6B7280'])] :
      ['#4CAF50', '#1E40AF', '#F44336', '#9CA3AF'];
      
    charts.parcelDistribution = new Chart(canvases.parcelDistribution, {
      type: chartType,
      data: {
        labels: labels,
        datasets: [{
          label: 'Parcelles',
          data: values,
          backgroundColor: backgroundColors,
          borderWidth: chartType === 'bar' ? 0 : 2,
          borderColor: '#FFFFFF',
          borderRadius: chartType === 'bar' ? 8 : 0,
          borderSkipped: false,
          hoverOffset: 10
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: chartType === 'doughnut' ? '60%' : undefined,
        plugins: {
          legend: {
            position: chartType === 'bar' ? 'top' : 'bottom',
            labels: {
              font: { family: 'Inter, sans-serif' },
              padding: 15
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                let label = context.label || '';
                let value = context.raw;
                let percentage = Math.round(value / summary.totalParcels * 1000) / 10;
                return `${label}: ${formatNumber(value)} (${percentage}%)`;
              }
            }
          }
        },
        scales: chartType === 'bar' ? {
          x: { grid: { display: false }, border: { display: false } },
          y: { beginAtZero: true, grid: { color: 'rgba(0, 0, 0, 0.1)' }, border: { display: false } }
        } : undefined
      }
    });
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
        animation: { duration: 1000 }
      }
    });
  }
  
  // Trend Chart - Shows evolution over time
  if (canvases.trend) {
    if (charts.trend) charts.trend.destroy();
    
    // Sample data for trend over time
    const dates = ['05/19', '05/26', '06/02', '06/09', '06/16', '06/23', '06/30', '07/07', '07/14', '07/21', '07/28', '08/04', '08/11', '08/19'];
    const totalProgress = [5000, 8500, 12000, 15500, 19000, 21500, 24000, 26500, 28000, 31000, 33500, 36000, 39500, 43110];
    const cleanedData = [4800, 8000, 11000, 14000, 17500, 19800, 22000, 24000, 25500, 28000, 30500, 32800, 35500, 38830];
    
    charts.trend = new Chart(canvases.trend, {
      type: 'line',
      data: {
        labels: dates,
        datasets: [
          {
            label: 'Données brutes',
            data: totalProgress,
            borderColor: '#1E40AF',
            backgroundColor: 'rgba(30, 64, 175, 0.1)',
            borderWidth: 2,
            tension: 0.3,
            fill: true
          },
          {
            label: 'Données nettoyées',
            data: cleanedData,
            borderColor: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.05)',
            borderWidth: 2,
            tension: 0.3,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { grid: { display: false }, border: { display: false } },
          y: { 
            beginAtZero: true,
            grid: { color: 'rgba(0, 0, 0, 0.05)' },
            border: { display: false },
            ticks: {
              callback: function(value) {
                if (value >= 1000) {
                  return (value / 1000) + 'k';
                }
                return value;
              }
            }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                let value = context.raw;
                return `${label}: ${formatNumber(value)} parcelles`;
              }
            }
          }
        },
        animation: { duration: 2000 },
        interaction: { mode: 'index', intersect: false }
      }
    });
  }
  
  // Duplicate Chart - Shows duplicate analysis
  if (canvases.duplicate && data.summary.duplicateRemoval) {
    if (charts.duplicate) charts.duplicate.destroy();
    
    // Get data from duplicate removal summary
    const dupData = data.summary.duplicateRemoval;
    const fileStats = dupData.file_statistics || [];
    
    let labels, values, colors;
    
    // Check if we have chart_data or need to extract from file_statistics
    if (dupData.chart_data && dupData.chart_data.labels) {
      labels = dupData.chart_data.labels;
      values = dupData.chart_data.duplicate_rates;
      colors = labels.map(() => {
        const r = Math.floor(Math.random() * 100) + 100;
        const g = Math.floor(Math.random() * 100) + 100;
        const b = Math.floor(Math.random() * 150) + 50;
        return `rgb(${r}, ${g}, ${b})`;
      });
    } else {
      // Extract from file_statistics
      labels = fileStats.map(f => f.input_file.replace('_SANS_DOUBLON.gpkg', ''));
      values = fileStats.map(f => f.removal_rate);
      colors = labels.map(() => {
        const r = Math.floor(Math.random() * 100) + 100;
        const g = Math.floor(Math.random() * 100) + 100;
        const b = Math.floor(Math.random() * 150) + 50;
        return `rgb(${r}, ${g}, ${b})`;
      });
    }
    
    charts.duplicate = new Chart(canvases.duplicate, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Taux de doublons (%)',
          data: values,
          backgroundColor: colors,
          borderRadius: 6,
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { 
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `Taux de doublons: ${context.raw.toFixed(2)}%`;
              }
            }
          }
        },
        scales: {
          x: { grid: { display: false }, border: { display: false } },
          y: { 
            beginAtZero: true,
            grid: { color: 'rgba(0, 0, 0, 0.05)' },
            border: { display: false },
            ticks: {
              callback: function(value) {
                return value + '%';
              }
            }
          }
        }
      }
    });
    
    // Update duplicate rate display
    const duplicateRateElement = document.getElementById('duplicateRate');
    if (duplicateRateElement) {
      duplicateRateElement.textContent = `${dupData.summary?.overall_duplicate_removal_rate || '9.93'}%`;
    }
  }
  
  // Join Chart - Shows parcel join analysis
  if (canvases.join) {
    if (charts.join) charts.join.destroy();
    
    // Parcel join data
    const joinData = {
      labels: ['Individuelle', 'Collective', 'Conflit', 'Sans jointure'],
      data: [summary.indivParcels, summary.collParcels, summary.conflictParcels, summary.noJoinParcels]
    };
    
    charts.join = new Chart(canvases.join, {
      type: 'pie',
      data: {
        labels: joinData.labels,
        datasets: [{
          data: joinData.data,
          backgroundColor: ['#4CAF50', '#1E40AF', '#F44336', '#9CA3AF'],
          borderWidth: 2,
          borderColor: '#FFFFFF'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                const value = context.raw;
                const total = joinData.data.reduce((sum, val) => sum + val, 0);
                const percentage = Math.round(value / total * 1000) / 10;
                return `${formatNumber(value)} parcelles (${percentage}%)`;
              }
            }
          }
        }
      }
    });
    
    // Update join rate display
    const joinRateElement = document.getElementById('joinRate');
    if (joinRateElement) {
      const joinedParcels = summary.indivParcels + summary.collParcels + summary.conflictParcels;
      const joinRate = (joinedParcels / summary.totalParcels * 100).toFixed(2);
      joinRateElement.textContent = `${joinRate}%`;
    }
  }
  
  // Add lazy loading for heavy visualizations
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      if (btn.dataset.tab === 'analysis') {
        setTimeout(runAdvancedAnalysis, 300); // Lazy load analysis charts
      }
    });
  });
}

// Get label for metrics
function getMetricLabel(metric) {
  const labels = {
    'individuelles': 'Parcelles individuelles',
    'collectives': 'Parcelles collectives',
    'conflits': 'Parcelles conflictuelles',
    'qualite': 'Qualité des données (%)',
    'brutes': 'Parcelles brutes'
  };
  return labels[metric] || metric;
}

// Populate issues table
function populateIssuesTable() {
  const tbody = document.getElementById('issuesTableBody');
  if (!tbody || !dashboardData) return;

  tbody.innerHTML = '';
  dashboardData.issues.forEach(issue => {
    const row = document.createElement('tr');
    const impactClass = issue.impact === 'Élevé' ? 'high' : issue.impact === 'Moyen' ? 'medium' : 'low';
    const statusClass = issue.status === 'Résolu' ? 'success' : issue.status === 'En cours' ? 'warning' : 'danger';
    
    row.innerHTML = `
      <td>${issue.type}</td>
      <td>${formatNumber(issue.count)}</td>
      <td><span class="impact-badge ${impactClass}">${issue.impact}</span></td>
      <td><span class="status-badge ${statusClass.toLowerCase()}">${issue.status}</span></td>
    `;
    tbody.appendChild(row);
  });
}

// Populate problematic parcels table
function populateProblematicParcelsTable() {
  const tbody = document.getElementById('problematicParcelsTableBody');
  if (!tbody || !dashboardData) return;

  tbody.innerHTML = '';
  dashboardData.problematicParcels.forEach(parcel => {
    const row = document.createElement('tr');
    const statusClass = parcel.status === 'Résolu' ? 'success' : parcel.status === 'En cours' ? 'warning' : 'danger';
    
    row.innerHTML = `
      <td>${parcel.idup}</td>
      <td>${parcel.commune}</td>
      <td>${parcel.issue}</td>
      <td><span class="status-badge ${statusClass.toLowerCase()}">${parcel.status}</span></td>
      <td>
        <button class="btn-icon" title="Voir détails"><i class="fas fa-eye"></i></button>
        <button class="btn-icon" title="Éditer"><i class="fas fa-edit"></i></button>
        <button class="btn-icon" title="Résoudre"><i class="fas fa-check-circle"></i></button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// Populate activity table
function populateActivityTable() {
  const tbody = document.getElementById('activityTableBody');
  if (!tbody || !dashboardData) return;

  tbody.innerHTML = '';
  dashboardData.activityLog.forEach(activity => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${activity.date}</td>
      <td>${activity.action}</td>
      <td>${activity.commune}</td>
      <td>${activity.user}</td>
    `;
    tbody.appendChild(row);
  });
}

// Populate Commune Table
function populateCommuneTable() {
  const tbody = document.getElementById('communeTableBody');
  if (!tbody || !dashboardData) return;

  tbody.innerHTML = '';
  
  // Get commune data from the appropriate location
  const communeData = dashboardData.summary.communes || dashboardData.communes || [];
  
  communeData.forEach(commune => {
    // Handle both old and new data structure
    const communeNom = commune.nom || commune.name || commune.commune;
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><strong>${communeNom}</strong></td>
      <td>${formatNumber(commune.brutes || commune.original_records || 0)}</td>
      <td>${formatNumber(commune.individuelles || commune.individual_parcels || 0)}</td>
      <td>${formatNumber(commune.collectives || commune.collective_parcels || 0)}</td>
      <td>${formatNumber(commune.conflits || commune.conflict_parcels || 0)}</td>
      <td>${commune.qualite || commune.quality || commune.data_quality || 0}%</td>
      <td><span class="status-badge ${(commune.statut || 'normal').toLowerCase()}">${commune.statut || 'Normal'}</span></td>
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
    // Use the same commune data source as above
    const communeData = dashboardData.summary.communes || dashboardData.communes || [];
    communeData.forEach(commune => {
      const communeNom = commune.nom || commune.name || commune.commune;
      const option = document.createElement('option');
      option.value = communeNom;
      option.textContent = communeNom;
      communeFilter.appendChild(option);
    });
  }
}

// Populate files grid
function populateFilesGrid() {
  const filesGrid = document.getElementById('filesGrid');
  if (!filesGrid) return;

  filesGrid.innerHTML = '';
  
  const fileTypes = [
    { name: 'BALA_SANS_DOUBLON.gpkg', type: 'gpkg', size: '2.3 MB', date: '19/08/2025' },
    { name: 'BALLOU_SANS_DOUBLON.gpkg', type: 'gpkg', size: '3.1 MB', date: '19/08/2025' },
    { name: 'BANDAFASSI_SANS_DOUBLON.gpkg', type: 'gpkg', size: '8.7 MB', date: '19/08/2025' },
    { name: 'dashboard_kpis.json', type: 'json', size: '4.2 KB', date: '19/08/2025' },
    { name: 'communes_data.json', type: 'json', size: '15.6 KB', date: '19/08/2025' },
    { name: 'duplicate_analysis.json', type: 'json', size: '24.3 KB', date: '19/08/2025' },
    { name: 'parcels_shapefile.shp', type: 'shp', size: '45.2 MB', date: '18/08/2025' },
    { name: 'Rapport Jointure.docx', type: 'docx', size: '1.5 MB', date: '19/08/2025' }
  ];
  
  fileTypes.forEach(file => {
    let icon;
    switch(file.type) {
      case 'gpkg': icon = 'fa-database'; break;
      case 'json': icon = 'fa-code'; break;
      case 'shp': icon = 'fa-map'; break;
      case 'docx': icon = 'fa-file-word'; break;
      default: icon = 'fa-file'; break;
    }
    
    const fileCard = document.createElement('div');
    fileCard.className = 'file-card';
    fileCard.innerHTML = `
      <div class="file-icon">
        <i class="fas ${icon}"></i>
      </div>
      <div class="file-info">
        <div class="file-name">${file.name}</div>
        <div class="file-meta">
          <span>${file.size}</span>
          <span>${file.date}</span>
        </div>
      </div>
      <div class="file-actions">
        <button class="btn-icon" title="Télécharger"><i class="fas fa-download"></i></button>
        <button class="btn-icon" title="Supprimer"><i class="fas fa-trash-alt"></i></button>
      </div>
    `;
    filesGrid.appendChild(fileCard);
  });
}

// Populate reports list
function populateReportHistory() {
  const reportsList = document.getElementById('reportsList');
  if (!reportsList) return;

  reportsList.innerHTML = '';
  
  // Generate some sample reports
  if (reportHistory.length === 0) {
    reportHistory = [
      { id: 'R2025081901', name: 'Rapport sommaire - Toutes communes', type: 'summary', date: '19/08/2025', size: '1.2 MB' },
      { id: 'R2025081902', name: 'Rapport détaillé - BANDAFASSI', type: 'detailed', date: '19/08/2025', size: '3.4 MB' },
      { id: 'R2025081903', name: 'Rapport d\'anomalies - Doublons', type: 'anomaly', date: '19/08/2025', size: '850 KB' },
      { id: 'R2025081801', name: 'Rapport sommaire - Toutes communes', type: 'summary', date: '18/08/2025', size: '1.2 MB' },
      { id: 'R2025081701', name: 'Rapport détaillé - TOMBORONKOTO', type: 'detailed', date: '17/08/2025', size: '4.1 MB' },
      { id: 'R2025081601', name: 'Rapport d\'anomalies - Jointures', type: 'anomaly', date: '16/08/2025', size: '720 KB' }
    ];
  }
  
  reportHistory.forEach(report => {
    let icon;
    switch(report.type) {
      case 'summary': icon = 'fa-file-alt'; break;
      case 'detailed': icon = 'fa-file-contract'; break;
      case 'anomaly': icon = 'fa-exclamation-circle'; break;
      default: icon = 'fa-file'; break;
    }
    
    const reportItem = document.createElement('div');
    reportItem.className = 'report-item';
    reportItem.dataset.id = report.id;
    reportItem.innerHTML = `
      <div class="report-icon">
        <i class="fas ${icon}"></i>
      </div>
      <div class="report-info">
        <div class="report-name">${report.name}</div>
        <div class="report-meta">
          <span>${report.date}</span>
          <span>${report.size}</span>
          <span class="report-type ${report.type}">${report.type}</span>
        </div>
      </div>
    `;
    reportsList.appendChild(reportItem);
    
    // Add click event to show report preview
    reportItem.addEventListener('click', () => showReportPreview(report));
  });
}

// Show report preview
function showReportPreview(report) {
  const previewEl = document.getElementById('reportPreview');
  if (!previewEl) return;
  
  // Remove placeholder
  previewEl.innerHTML = '';
  
  // Create preview content
  const previewContent = document.createElement('div');
  previewContent.className = 'preview-document';
  previewContent.innerHTML = `
    <div class="document-header">
      <h2>${report.name}</h2>
      <div class="document-meta">
        <span><i class="fas fa-calendar"></i> ${report.date}</span>
        <span><i class="fas fa-file-alt"></i> ${report.type}</span>
        <span><i class="fas fa-weight"></i> ${report.size}</span>
      </div>
    </div>
    <div class="document-content">
      <div class="document-section">
        <h3>Résumé</h3>
        <p>Ce rapport présente ${report.type === 'summary' ? 'un résumé' : report.type === 'detailed' ? 'une analyse détaillée' : 'les anomalies'} 
           des données foncières ${report.name.includes('Toutes') ? 'pour toutes les communes' : `pour la commune de ${report.name.split('-')[1].trim()}`}.</p>
      </div>
      <div class="document-section">
        <h3>Statistiques principales</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-value">38,830</span>
            <span class="stat-label">Parcelles traitées</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">90.07%</span>
            <span class="stat-label">Qualité des données</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">4,280</span>
            <span class="stat-label">Doublons supprimés</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">15/15</span>
            <span class="stat-label">Communes traitées</span>
          </div>
        </div>
      </div>
      <div class="document-section">
        <h3>Graphiques</h3>
        <div class="document-placeholder">
          [Graphiques du rapport]
        </div>
      </div>
      <div class="document-section">
        <h3>Détails</h3>
        <div class="document-placeholder">
          [Contenu détaillé du rapport]
        </div>
      </div>
    </div>
    <div class="document-footer">
      <p>Rapport généré automatiquement le ${report.date} à 14:25</p>
      <p>PROCASEF & BET-PLUS SA - Confidentiel</p>
    </div>
  `;
  previewEl.appendChild(previewContent);
  
  // Add active class to selected report
  document.querySelectorAll('.report-item').forEach(item => {
    item.classList.toggle('active', item.dataset.id === report.id);
  });
}

// Generate and display chart gauges
function runAdvancedAnalysis() {
  setTimeout(() => {
    // Create gauge charts
    const gauges = [
      { id: 'qualityGauge', value: 90.07, color: '#10B981', maxValue: 100 }
    ];
    
    gauges.forEach(g => {
      const canvas = document.getElementById(g.id);
      if (canvas) {
        new Chart(canvas, {
          type: 'doughnut',
          data: {
            datasets: [{
              data: [g.value, g.maxValue - g.value],
              backgroundColor: [g.color, '#E5E7EB'],
              borderWidth: 0,
              cutout: '80%'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            circumference: 270,
            rotation: -135,
            plugins: { tooltip: { enabled: false }, legend: { display: false } }
          }
        });
      } else {
        console.warn(`Gauge canvas ${g.id} not found`);
      }
    });

    // Set up progress bars
    document.getElementById('cleaningProgress').style.width = "90.07%";
    document.getElementById('cleaningValue').textContent = "90.07%";
    document.getElementById('joiningProgress').style.width = "80.75%";
    document.getElementById('joiningValue').textContent = "80.75%";
    document.getElementById('validationProgress').style.width = "93.3%";
    document.getElementById('validationValue').textContent = "93.3%";

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

// Download functions
function downloadFile(content, filename, contentType) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Generate sample report
function generateReport(reportType, format) {
  const reportData = {
    type: reportType,
    date: new Date().toLocaleDateString('fr-FR'),
    summary: dashboardData.summary,
    communes: dashboardData.communes,
    duplicateRemoval: dashboardData.duplicateRemoval
  };
  
  // Add to report history
  const newReport = {
    id: 'R' + new Date().toISOString().slice(0,10).replace(/-/g,'') + Math.floor(Math.random() * 100),
    name: `Rapport ${reportType === 'summary' ? 'sommaire' : reportType === 'detailed' ? 'détaillé' : 'anomalies'} - Toutes communes`,
    type: reportType,
    date: new Date().toLocaleDateString('fr-FR', {day: '2-digit', month: '2-digit', year: 'numeric'}).replace(/\//g, '/'),
    size: (Math.random() * 3 + 0.5).toFixed(1) + ' MB'
  };
  
  reportHistory.unshift(newReport);
  
  // Update UI
  populateReportHistory();
  showReportPreview(newReport);
  
  // Return generated data
  if (format === 'json') {
    downloadFile(JSON.stringify(reportData, null, 2), `report_${reportType}.json`, 'application/json');
  } else {
    alert(`Rapport de type "${reportType}" généré au format ${format.toUpperCase()}`);
  }
  
  return reportData;
}

// Initialize Dashboard with enhancements
async function initializeDashboard() {
  try {
    // showLoadingOverlay('Chargement du tableau de bord...');
    // Show dashboard insights for user guidance
    showDashboardInsights();
    // Charger les données principales et mettre à jour le dashboard
    await updateKPIs();
    await initCharts();
    showInsightBanner();
    // Peupler les tableaux et listes
    populateCommuneTable();
    populateReportHistory();
    populateIssuesTable();
    populateProblematicParcelsTable();
    populateActivityTable();
    // Configurer les interactions
    setupEventListeners();
    setupAdvancedInteractions();
    // hideLoadingOverlay();
    // Legacy welcome message
    showWelcomeMessage();
  } catch (error) {
    console.error('Erreur lors de l\'initialisation du tableau de bord:', error);
    // hideLoadingOverlay();
    // showErrorMessage('Impossible de charger le tableau de bord. Veuillez réessayer.');
  }
}

// Explicitly make the function globally available
window.initializeDashboard = initializeDashboard;

// Show a random dashboard insight for user guidance
function showDashboardInsights() {
  const insights = [
    "Astuce : Cliquez sur une commune pour voir le détail.",
    "Recommandation : Analysez les doublons pour améliorer la qualité.",
    "Info : Les taux de validation supérieurs à 90% sont excellents !",
    "Conseil : Utilisez les filtres pour explorer les données par statut.",
    "Saviez-vous ? Vous pouvez exporter les rapports en PDF ou CSV."
  ];
  const banner = document.createElement('div');
  banner.className = 'ia-insights';
  banner.style.background = 'linear-gradient(90deg, #FBBF24 0%, #3B82F6 100%)';
  banner.style.color = '#1F2937';
  banner.style.fontWeight = 'bold';
  banner.style.textAlign = 'center';
  banner.style.padding = '12px';
  banner.style.marginBottom = '18px';
  banner.style.borderRadius = '12px';
  banner.innerHTML = '<i class="fas fa-lightbulb"></i> ' + insights[Math.floor(Math.random() * insights.length)];
  const main = document.querySelector('.main-content');
  if (main) main.prepend(banner);
}

// Show insight banner at the top of the dashboard
function showInsightBanner() {
  if (document.getElementById('insightBanner')) return;
  const banner = document.createElement('div');
  banner.id = 'insightBanner';
  banner.className = 'insight-banner';
  banner.innerHTML = `
    <div class="insight-banner-content">
      <i class="fas fa-lightbulb"></i>
      <span><strong>Progression:</strong> 78% des parcelles traitées, <strong>9.93%</strong> de doublons éliminés, <strong>211</strong> parcelles conflictuelles à surveiller. <span class="insight-tip">Survolez les graphiques pour plus de détails.</span></span>
    <button class="insight-close"><i class="fas fa-times"></i></button>
  </div>
  `;
  document.querySelector('.main-content').prepend(banner);
  
  // Add close button functionality
  banner.querySelector('.insight-close').addEventListener('click', function() {
    banner.remove();
  });
}

// Show welcome message and insights
function showWelcomeMessage() {
  `;
  document.body.prepend(banner);
  banner.querySelector('.insight-close').addEventListener('click', () => banner.remove());
}
  const welcomeEl = document.createElement('div');
  welcomeEl.className = 'welcome-toast';
  welcomeEl.innerHTML = `
    <div class="welcome-toast-header">
      <i class="fas fa-info-circle"></i>
      <h3>Tableau de bord actualisé</h3>
      <button class="toast-close"><i class="fas fa-times"></i></button>
    </div>
    <div class="welcome-toast-body">
      <p><strong>3 insights importants:</strong></p>
      <ul>
        <li>Traitement de 78% des parcelles complété</li>
        <li>Réduction de 9.1% des anomalies ce mois-ci</li>
        <li>La commune de Ballou maintient le score de qualité le plus élevé</li>
      </ul>
    </div>
  `;
  
  document.body.appendChild(welcomeEl);
  setTimeout(() => welcomeEl.classList.add('show'), 300);
  
  welcomeEl.querySelector('.toast-close').addEventListener('click', () => {
    welcomeEl.classList.remove('show');
    setTimeout(() => welcomeEl.remove(), 300);
  });
  
  setTimeout(() => {
    if (document.body.contains(welcomeEl)) {
      welcomeEl.classList.remove('show');
      setTimeout(() => welcomeEl.remove(), 300);
    }
  }, 8000);
}

// Event Listeners pour les fonctionnalités de base
function setupEventListeners() {
  // Navigation par onglets
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
      document.getElementById(btn.dataset.tab + 'Tab').classList.add('active');
      
      // Analytics tracking
      trackUserAction('tab_change', { tab: btn.dataset.tab });
    });
  });
  
  // Basculer le thème clair/sombre
  const themeToggle = document.querySelector('.theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }
  
  // Filtres de période pour les graphiques
  document.querySelectorAll('.period-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilters.period = btn.dataset.period;
      updateChartsForPeriod(currentFilters.period);
      
      // Analytics tracking
      trackUserAction('filter_change', { type: 'period', value: btn.dataset.period });
    });
  });
  
  // Types de graphiques
  document.querySelectorAll('.chart-type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const chartType = btn.dataset.chartType;
      const parent = btn.closest('.chart-card');
      const chartId = parent.querySelector('canvas').id;
      
      // Mettre à jour l'apparence des boutons
      parent.querySelectorAll('.chart-type-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Mettre à jour le type de graphique
      updateChartType(chartId, chartType);
      
      // Analytics tracking
      trackUserAction('chart_type_change', { chartId, type: chartType });
    });
  });
  
  // Filtres de commune pour les métriques de qualité
  const communeSelect = document.getElementById('qualitySelectCommune');
  if (communeSelect) {
    communeSelect.addEventListener('change', () => {
      updateQualityMetricsForCommune(communeSelect.value);
      
      // Analytics tracking
      trackUserAction('commune_filter_change', { value: communeSelect.value });
    });
  }
  
  // Recherche
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', debounce(() => {
      const query = searchInput.value.trim().toLowerCase();
      if (query.length >= 2) {
        searchAcrossData(query);
        trackUserAction('search', { query });
      }
    }, 300));
  }
  
  // Boutons d'exportation
  document.querySelectorAll('.export-btn, button[data-action="exportData"]').forEach(btn => {
    btn.addEventListener('click', () => exportDashboardData());
  });
  
  // Boutons de génération de rapports
  document.querySelectorAll('button[data-action="generateReport"]').forEach(btn => {
    btn.addEventListener('click', () => generateReport());
  });
}

// Configuration des interactions avancées
function setupAdvancedInteractions() {
  // Toggle pour les séries dans le graphique temporel
  document.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const series = btn.dataset.series;
      btn.classList.toggle('active');
      toggleChartSeries('timeSeriesChart', series);
    });
  });
  
  // Boutons d'action pour les anomalies
  document.querySelectorAll('.btn-action').forEach(btn => {
    btn.addEventListener('click', function() {
      const actionItem = this.closest('.anomaly-item, .recommendation-item');
      const itemTitle = actionItem.querySelector('h4').textContent;
      
      showActionModal(itemTitle);
    });
  });
  
  // Interaction avec les insights
  document.querySelectorAll('.insight-item').forEach(item => {
    item.addEventListener('click', function() {
      const insightText = this.querySelector('p').textContent;
      showInsightDetail(insightText);
    });
  });
  
  // Boutons d'expansion des graphiques
  document.querySelectorAll('.btn-expand').forEach(btn => {
    btn.addEventListener('click', function() {
      const chartCard = this.closest('.chart-card');
      const chartId = chartCard.querySelector('canvas').id;
      expandChart(chartId, chartCard.querySelector('h3').textContent);
    });
  });
}

// Affiche un modal pour les actions
function showActionModal(title) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-container">
      <div class="modal-header">
        <h3>${title}</h3>
        <button class="modal-close"><i class="fas fa-times"></i></button>
      </div>
      <div class="modal-body">
        <p>Êtes-vous sûr de vouloir commencer cette action?</p>
        <p>Cela va créer une nouvelle tâche dans la file de traitement.</p>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary">Annuler</button>
        <button class="btn-primary">Confirmer</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  setTimeout(() => modal.classList.add('show'), 50);
  
  modal.querySelector('.modal-close').addEventListener('click', () => closeModal(modal));
  modal.querySelector('.btn-secondary').addEventListener('click', () => closeModal(modal));
  modal.querySelector('.btn-primary').addEventListener('click', () => {
    // Simuler une action
    showToast('Action ajoutée à la file de traitement', 'success');
    closeModal(modal);
  });
}

// Ferme un modal
function closeModal(modal) {
  modal.classList.remove('show');
  setTimeout(() => modal.remove(), 300);
}

// Affiche un toast de notification
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div class="toast-icon">
      <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i>
    </div>
    <div class="toast-message">${message}</div>
    <button class="toast-close"><i class="fas fa-times"></i></button>
  `;
  
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 50);
  
  toast.querySelector('.toast-close').addEventListener('click', () => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  });
  
  setTimeout(() => {
    if (document.body.contains(toast)) {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }
  }, 5000);
}

// Met à jour le type de graphique
function updateChartType(chartId, newType) {
  if (!charts[chartId]) return;
  
  const chartInstance = charts[chartId];
  const chartData = chartInstance.data;
  
  // Détruire l'instance existante
  chartInstance.destroy();
  
  // Adapter les options en fonction du type
  const options = { ...chartDefaults };
  
  if (newType === 'bar') {
    options.plugins.legend.display = false;
    options.scales = {
      y: {
        beginAtZero: true
      }
    };
  } else if (newType === 'treemap') {
    // Utiliser un graphique de type doughnut comme fallback pour treemap
    newType = 'doughnut';
    options.plugins.legend.position = 'right';
  }
  
  // Créer une nouvelle instance avec le même canvas
  const ctx = document.getElementById(chartId).getContext('2d');
  charts[chartId] = new Chart(ctx, {
    type: newType,
    data: chartData,
    options: options
  });
}

// Fonction helper pour debounce
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

// Suivi des actions utilisateur (analytics)
function trackUserAction(action, data = {}) {
  console.log(`User Action: ${action}`, data);
  // Implémenter une fonction d'analytics réelle ici
}
  
  // Metric selector
  const metricSelector = document.getElementById('metricSelector');
  if (metricSelector) {
    metricSelector.addEventListener('change', () => initCharts());
  }
  
  // Theme toggle
  const themeToggle = document.querySelector('.theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const icon = document.getElementById('themeIcon');
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      document.documentElement.dataset.theme = newTheme;
      if (icon) icon.className = newTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
      localStorage.setItem('dashboard-theme', newTheme);
      currentTheme = newTheme;
    });
  }
  
  // Filter events
  const filterInputs = document.querySelectorAll('#communeFilter, #statusFilter, #dateFilter');
  filterInputs.forEach(input => {
    input.addEventListener('change', applyFilters);
  });
  
  document.getElementById('resetFilters')?.addEventListener('click', resetFilters);
  
  // Refresh button
  document.querySelector('.refresh-btn')?.addEventListener('click', async () => {
    const refreshIcon = document.querySelector('.refresh-btn i');
    refreshIcon.classList.add('rotating');
    await initializeDashboard();
    setTimeout(() => refreshIcon.classList.remove('rotating'), 1000);
  });
  
  // Report modal
  document.getElementById('generateReportBtn')?.addEventListener('click', () => {
    document.getElementById('reportModal').classList.add('active');
  });
  
  document.querySelector('.close-btn')?.addEventListener('click', () => {
    document.getElementById('reportModal').classList.remove('active');
  });
  
  document.getElementById('cancelReportBtn')?.addEventListener('click', () => {
    document.getElementById('reportModal').classList.remove('active');
  });
  
  document.getElementById('generateReportConfirmBtn')?.addEventListener('click', () => {
    const reportType = document.getElementById('reportType').value;
    const reportFormat = document.getElementById('reportFormat').value;
    document.getElementById('reportModal').classList.remove('active');
    generateReport(reportType, reportFormat);
  });
  
  // Run analysis button
  document.getElementById('runAnalysisBtn')?.addEventListener('click', async () => {
    const btn = document.getElementById('runAnalysisBtn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyse en cours...';
    btn.disabled = true;
    
    await runAdvancedAnalysis();
    await initCharts();
    
    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.disabled = false;
      alert('Analyse complétée !');
    }, 2000);
  });
}

// Filter functions
function applyFilters() {
  const communeFilter = document.getElementById('communeFilter').value;
  const statusFilter = document.getElementById('statusFilter').value;
  const dateFilter = document.getElementById('dateFilter').value;
  
  currentFilters = { commune: communeFilter, status: statusFilter, date: dateFilter };
  
  const rows = document.querySelectorAll('#communeTableBody tr');
  rows.forEach(row => {
    const communeName = row.querySelector('td:first-child strong').textContent;
    const status = row.querySelector('.status-badge').textContent;
    
    let visible = true;
    if (communeFilter && communeName !== communeFilter) visible = false;
    if (statusFilter && status !== statusFilter) visible = false;
    
    row.style.display = visible ? '' : 'none';
  });
}

function resetFilters() {
  document.getElementById('communeFilter').value = '';
  document.getElementById('statusFilter').value = '';
  document.getElementById('dateFilter').value = '';
  
  currentFilters = { commune: '', status: '', date: '' };
  
  document.querySelectorAll('#communeTableBody tr').forEach(row => {
    row.style.display = '';
  });
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
    // Make sure we have access to the function
    if (typeof window.initializeDashboard === 'function') {
      window.initializeDashboard();
    } else if (typeof initializeDashboard === 'function') {
      initializeDashboard();
    } else {
      console.error('Dashboard initialization function not found');
    }
  } else {
    console.error('Critical element #kpiGrid not found');
  }
  
  // Add final validation check
  setTimeout(() => {
    if (typeof dashboardData === 'undefined' || !dashboardData) {
      console.warn('Dashboard data not loaded after DOMContentLoaded - attempting recovery');
      if (typeof loadRecoveryScript === 'function') {
        loadRecoveryScript().then(() => {
          if (typeof window.fixDashboard === 'function') {
            window.fixDashboard();
          }
        });
      }
    }
  }, 2000);
});

// Add fallback definitions for critical functions
if (typeof showInsightBanner !== 'function') {
  window.showInsightBanner = function() {
    console.warn('Using fallback showInsightBanner function');
    if (document.getElementById('insightBanner')) return;
    const banner = document.createElement('div');
    banner.id = 'insightBanner';
    banner.className = 'insight-banner';
    banner.innerHTML = `
      <div class="insight-banner-content">
        <i class="fas fa-lightbulb"></i>
        <span><strong>Progression:</strong> 78% des parcelles traitées, <strong>9.93%</strong> de doublons éliminés, <strong>211</strong> parcelles conflictuelles à surveiller.</span>
        <button class="insight-close"><i class="fas fa-times"></i></button>
      </div>
    `;
    const mainContent = document.querySelector('.main-content');
    if (mainContent) mainContent.prepend(banner);
    
    const closeBtn = banner.querySelector('.insight-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function() {
        banner.remove();
      });
    }
  };
}

// Ensure the dashboard initializes even if there are issues with DOMContentLoaded
window.addEventListener('load', function() {
  console.log('Window load event fired, checking if dashboard is initialized...');
  setTimeout(() => {
    try {
      if (!dashboardData) {
        console.log('Dashboard not initialized by DOMContentLoaded, initializing now...');
        if (typeof window.initializeDashboard === 'function') {
          window.initializeDashboard();
        } else if (typeof initializeDashboard === 'function') {
          initializeDashboard();
        } else {
          console.error('Could not find initializeDashboard function');
          alert('Dashboard initialization failed. Please refresh the page or check console for errors.');
        }
      }
    } catch (error) {
      console.error('Error during backup initialization:', error);
    }
  }, 500);
});
