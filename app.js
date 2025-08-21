// Fetch JSON data
async function fetchDashboardData() {
  try {
    const response = await fetch('data/Rapport_Post_traitement.json');
    if (!response.ok) throw new Error('Failed to fetch JSON');
    const data = await response.json();
    return data['Rapport sommaire'].reduce((acc, item) => {
      acc[item.date] = item['2025_08_19_19_17_47'];
      return acc;
    }, {});
  } catch (error) {
    console.error('Error fetching JSON:', error);
    return {};
  }
}

// Utility function to animate value changes
function animateValue(id, start, end, duration) {
  const element = document.getElementById(id);
  if (!element) {
    console.warn(`Element with ID ${id} not found for animation.`);
    return;
  }
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const value = Math.floor(progress * (end - start) + start);
    element.textContent = value;
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}

// Initialize KPI cards dynamically
async function updateKPIs() {
  const summary = await fetchDashboardData();
  const kpiGrid = document.getElementById('kpiGrid');
  if (!kpiGrid) {
    console.error('kpiGrid element not found');
    return;
  }
  kpiGrid.innerHTML = ''; // Clear existing content
  const kpiData = [
    { id: 'kpiFilesProcessed', value: summary['Fichiers traités'], label: 'Fichiers Traités' },
    { id: 'kpiSuccess', value: summary['Succès'], label: 'Succès' },
    { id: 'kpiFailures', value: summary['Échecs'], label: 'Échecs' },
    { id: 'kpiIndividualParcels', value: summary['Parcelles individuelles'], label: 'Parcelles Individuelles' },
    { id: 'kpiCollectiveParcels', value: summary['Parcelles collectives'], label: 'Parcelles Collectives' },
    { id: 'kpiConflicts', value: summary['Conflits (Parcelles à la fois individuelle et collecvive)'], label: 'Conflits' },
    { id: 'kpiNoJoins', value: summary['Pas de Jointure (Pas d\'idup ou ancien Idup Ndoga)'], label: 'Sans Jointure' },
    { id: 'kpiTotalRecords', value: summary['Total enregistrement (Parcelles apres netoyage)'], label: 'Total Enregistrements' },
    { id: 'kpiGlobalConflicts', value: summary['Conflits globaux'], label: 'Conflits Globaux' },
    { id: 'kpiIndividualJoins', value: summary['Fichiers Jointures Individuelles'], label: 'Jointures Individuelles' },
    { id: 'kpiCollectiveJoins', value: summary['Fichiers Jointures Collectives'], label: 'Jointures Collectives' },
    { id: 'kpiSameIDUP', value: summary['Fichiers avec m$eme IDUP individuelle et collective'], label: 'Même IDUP' },
    { id: 'kpiNoJoinFiles', value: summary['Fichiers Sans Jointure'], label: 'Fichiers Sans Jointure' },
    { id: 'kpiIndividualRate', value: summary['Taux des parcelles individuelles'], label: 'Taux Parcelles Individuelles' },
    { id: 'kpiCollectiveRate', value: summary['Taux des parcelles collectives'], label: 'Taux Parcelles Collectives' },
    { id: 'kpiConflictRate', value: summary['Taux des parcelles conflictuelles'], label: 'Taux Conflits' },
    { id: 'kpiNoJoinRate', value: summary['Taux des parcelles sans jointure'], label: 'Taux Sans Jointure' }
  ];

  kpiData.forEach(kpi => {
    const card = document.createElement('div');
    card.className = 'kpi-card shadowed';
    card.innerHTML = `
      <span class="kpi-value" id="${kpi.id}">${kpi.value}</span>
      <span class="kpi-label">${kpi.label}</span>
    `;
    kpiGrid.appendChild(card);
    if (typeof kpi.value === 'number') {
      animateValue(kpi.id, 0, kpi.value, 1000);
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
  animateValue('headerTotalFiles', 0, summary['Fichiers traités'], 1000);
  animateValue('headerTotalParcels', 0, summary['Total enregistrement (Parcelles apres netoyage)'], 1000);
  document.getElementById('headerSuccessRate').textContent = `${(summary['Succès'] / summary['Fichiers traités'] * 100).toFixed(1)}%`;
}

// Initialize Charts
async function initCharts() {
  const summary = await fetchDashboardData();
  const ctxParcel = document.getElementById('parcelDistributionChart')?.getContext('2d');
  const ctxConflict = document.getElementById('conflictTrendChart')?.getContext('2d');
  const ctxCommune = document.getElementById('communePerformanceChart')?.getContext('2d');
  const ctxAnomaly = document.getElementById('communeConflictChart')?.getContext('2d');

  if (!ctxParcel || !ctxConflict || !ctxCommune || !ctxAnomaly) {
    console.error('Chart canvases not found');
    return;
  }

  // Parcel Distribution Chart
  const parcelChart = new Chart(ctxParcel, {
    type: 'doughnut',
    data: {
      labels: ['Individuelles', 'Collectives', 'Conflits', 'Sans Jointure'],
      datasets: [{
        data: [
          summary['Parcelles individuelles'],
          summary['Parcelles collectives'],
          summary['Conflits (Parcelles à la fois individuelle et collecvive)'],
          summary['Pas de Jointure (Pas d\'idup ou ancien Idup Ndoga)']
        ],
        backgroundColor: ['#4CAF50', '#2196F3', '#F44336', '#FF9800']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        tooltip: {
          callbacks: {
            label: (context) => `${context.label}: ${context.raw} (${(context.raw / summary['Total enregistrement (Parcelles apres netoyage)'] * 100).toFixed(1)}%)`
          }
        }
      },
      onClick: (e, elements) => {
        if (elements.length) {
          const label = parcelChart.data.labels[elements[0].index];
          alert(`Filtrer par: ${label}`);
        }
      }
    }
  });

  // Conflict Trend Chart
  const conflictChart = new Chart(ctxConflict, {
    type: 'line',
    data: {
      labels: ['2025-08'],
      datasets: [{
        label: 'Conflits Globaux',
        data: [summary['Conflits globaux']],
        borderColor: '#F44336',
        fill: false
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });

  // Commune Performance Chart
  const communeChart = new Chart(ctxCommune, {
    type: 'bar',
    data: {
      labels: ['Summary'],
      datasets: [
        {
          label: 'Parcelles Individuelles',
          data: [summary['Parcelles individuelles']],
          backgroundColor: '#4CAF50'
        },
        {
          label: 'Parcelles Collectives',
          data: [summary['Parcelles collectives']],
          backgroundColor: '#2196F3'
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      },
      plugins: {
        legend: { position: 'top' }
      }
    }
  });

  // IA Anomaly Chart
  const anomalyChart = new Chart(ctxAnomaly, {
    type: 'bar',
    data: {
      labels: ['Conflits', 'Échecs', 'Même IDUP'],
      datasets: [{
        label: 'Occurrences',
        data: [
          summary['Conflits (Parcelles à la fois individuelle et collecvive)'],
          summary['Échecs'],
          summary['Fichiers avec m$eme IDUP individuelle et collective']
        ],
        backgroundColor: ['#F44336', '#FF9800', '#9C27B0']
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });

  // Update chart type for parcel chart
  document.getElementById('chartTypeSelector')?.addEventListener('change', (e) => {
    parcelChart.config.type = e.target.value;
    parcelChart.update();
  });

  // Update commune chart metric
  document.getElementById('metricSelector')?.addEventListener('change', (e) => {
    const metric = e.target.value;
    communeChart.data.datasets[0].label = metric.charAt(0).toUpperCase() + metric.slice(1);
    communeChart.data.datasets[0].data = [summary[metric]];
    communeChart.update();
  });
}

// Enhanced IA Analysis
async function runAdvancedAnalysis() {
  const summary = await fetchDashboardData();
  const insightsDiv = document.getElementById('iaInsights');
  const anomalyList = document.getElementById('iaAnomalyList');
  if (!insightsDiv || !anomalyList) {
    console.error('IA elements not found');
    return;
  }

  // Clear previous content
  insightsDiv.innerHTML = '';
  anomalyList.innerHTML = '';

  // Anomaly Detection
  const anomalies = [];
  if (summary['Échecs'] > 1) {
    anomalies.push(`Échecs élevés détectés: ${summary['Échecs']} fichiers en erreur. Vérifiez les logs pour plus de détails.`);
  }
  if (summary['Conflits (Parcelles à la fois individuelle et collecvive)'] > 100) {
    anomalies.push(`Conflits élevés: ${summary['Conflits (Parcelles à la fois individuelle et collecvive)']} parcelles en conflit. Priorisez la résolution dans ${summary['Fichier des conflits']}.`);
  }
  if (summary['Fichiers avec m$eme IDUP individuelle et collective'] > 5) {
    anomalies.push(`Duplications IDUP: ${summary['Fichiers avec m$eme IDUP individuelle et collective']} fichiers avec même IDUP. Vérifiez les données sources.`);
  }

  anomalies.forEach(anomaly => {
    const li = document.createElement('li');
    li.textContent = anomaly;
    anomalyList.appendChild(li);
  });

  // Predictive Insights
  const conflictRate = parseFloat(summary['Taux des parcelles conflictuelles'].replace('%', ''));
  const insights = [
    `Taux de conflits actuel: ${conflictRate}%. Si cette tendance se maintient, environ ${Math.round(summary['Total enregistrement (Parcelles apres netoyage)'] * conflictRate / 100)} parcelles supplémentaires pourraient être en conflit dans le prochain lot.`,
    summary['Échecs'] > 0 ? `Recommandation: Analysez le fichier ${summary['Fichier des conflits']} pour identifier les causes des ${summary['Échecs']} échecs.` : 'Aucun échec détecté, traitement stable.',
    `Taux de parcelles sans jointure: ${summary['Taux des parcelles sans jointure']}. Envisagez une mise à jour des IDUP pour réduire les ${summary['Pas de Jointure (Pas d\'idup ou ancien Idup Ndoga)']} parcelles non jointes.`
  ];

  insights.forEach(insight => {
    const p = document.createElement('p');
    p.textContent = insight;
    insightsDiv.appendChild(p);
  });

  // IA Gauges with Dynamic Thresholds
  const gauges = [
    {
      id: 'gaugeValidation',
      value: (summary['Succès'] / summary['Fichiers traités'] * 100),
      label: 'Validation',
      thresholds: { red: 50, yellow: 80, green: 100 }
    },
    {
      id: 'gaugeConsistency',
      value: (1 - summary['Conflits (Parcelles à la fois individuelle et collecvive)'] / summary['Total enregistrement (Parcelles apres netoyage)'] * 100),
      label: 'Cohérence',
      thresholds: { red: 90, yellow: 95, green: 100 }
    },
    {
      id: 'gaugeCritical',
      value: (summary['Échecs'] / summary['Fichiers traités'] * 100),
      label: 'Erreurs Critiques',
      thresholds: { red: 10, yellow: 5, green: 0 }
    },
    {
      id: 'gaugeForecast',
      value: conflictRate,
      label: 'Prévision Conflits',
      thresholds: { red: 1, yellow: 0.5, green: 0 }
    }
  ];

  gauges.forEach(g => {
    const ctx = document.getElementById(g.id)?.getContext('2d');
    if (ctx) {
      const color = g.value <= g.thresholds.red ? '#F44336' : g.value <= g.thresholds.yellow ? '#FF9800' : '#4CAF50';
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
      content: 'Utilisez les onglets en haut pour naviguer entre les vues Tableau de bord, Analyse IA, Communes, Qualité et Rapports. Cliquez sur un onglet pour changer de section.'
    },
    {
      title: 'KPI & Graphiques',
      icon: 'fas fa-chart-bar',
      content: 'Visualisez les indicateurs clés dans la grille KPI. Interagissez avec les graphiques pour explorer les données. Survolez pour des détails ou changez le type de graphique via le sélecteur.'
    },
    {
      title: 'Filtres Avancés',
      icon: 'fas fa-filter',
      content: 'Affinez les données par commune, statut ou période dans l’onglet Communes. Combinez la recherche textuelle et les filtres pour des résultats précis.'
    },
    {
      title: 'Analyse IA',
      icon: 'fas fa-robot',
      content: 'Lancez une analyse IA pour détecter anomalies, tendances et recommandations. Consultez les jauges pour évaluer la qualité des données.'
    },
    {
      title: 'Export & Rapports',
      icon: 'fas fa-file-export',
      content: 'Générez des rapports personnalisés (CSV, JSON) dans l’onglet Rapports. Consultez l’historique pour retélécharger les rapports précédents.'
    },
    {
      title: 'Mode Sombre',
      icon: 'fas fa-moon',
      content: 'Activez le mode sombre via l’icône dans le header pour un meilleur confort visuel, surtout en faible luminosité.'
    },
    {
      title: 'Interactions',
      icon: 'fas fa-mouse-pointer',
      content: 'Cliquez sur les icônes “œil” ou “éditer” dans les tableaux pour voir les détails ou modifier les données (fonctionnalité à venir).'
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

  // Add event listeners for collapsible sections
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

  // Add close button listener
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

// Export Reports
async function generateReport() {
  const summary = await fetchDashboardData();
  const reportType = document.getElementById('reportType')?.value;
  const reportFormat = document.getElementById('reportFormat')?.value;

  if (!reportType || !reportFormat) {
    alert('Veuillez sélectionner un type et un format de rapport.');
    return;
  }

  let data;
  switch (reportType) {
    case 'executive':
      data = {
        'Fichiers traités': summary['Fichiers traités'],
        'Succès': summary['Succès'],
        'Échecs': summary['Échecs'],
        'Parcelles individuelles': summary['Parcelles individuelles'],
        'Parcelles collectives': summary['Parcelles collectives']
      };
      break;
    case 'detailed':
      data = summary;
      break;
    case 'technical':
      data = {
        'Conflits globaux': summary['Conflits globaux'],
        'Jointures Individuelles': summary['Fichiers Jointures Individuelles'],
        'Jointures Collectives': summary['Fichiers Jointures Collectives']
      };
      break;
    case 'quality':
      data = {
        'Taux des parcelles individuelles': summary['Taux des parcelles individuelles'],
        'Taux des parcelles collectives': summary['Taux des parcelles collectives'],
        'Taux des parcelles conflictuelles': summary['Taux des parcelles conflictuelles'],
        'Taux des parcelles sans jointure': summary['Taux des parcelles sans jointure']
      };
      break;
  }

  if (reportFormat === 'csv') {
    let csvContent = 'Metric,Value\n' + Object.entries(data).map(([k, v]) => `"${k.replace(/"/g, '""')}",${v}`).join('\n');
    downloadFile(csvContent, `report_${reportType}.csv`, 'text/csv');
  } else if (reportFormat === 'json') {
    downloadFile(JSON.stringify(data, null, 2), `report_${reportType}.json`, 'application/json');
  }

  // Update report history
  const reportHistoryBody = document.getElementById('reportHistoryBody');
  if (reportHistoryBody) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${new Date().toLocaleString()}</td>
      <td>${reportType}</td>
      <td>${reportFormat}</td>
      <td>Complété</td>
      <td>${(JSON.stringify(data).length / 1024).toFixed(2)} KB</td>
      <td><button onclick="downloadFile('${encodeURIComponent(JSON.stringify(data))}','report_${reportType}.${reportFormat}', 'application/${reportFormat}')">Télécharger</button></td>
    `;
    reportHistoryBody.appendChild(row);
  }
}

// Utility to convert object to CSV
function convertToCSV(obj) {
  if (Array.isArray(obj)) {
    const headers = Object.keys(obj[0]);
    return headers.join(',') + '\n' + obj.map(row => headers.map(h => `"${row[h]?.toString().replace(/"/g, '""')}"`).join(',')).join('\n');
  }
  return Object.entries(obj).map(([k, v]) => `"${k.replace(/"/g, '""')}",${v}`).join('\n');
}

// Utility to download file
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
    });
  });

  document.querySelector('.guide-toggle')?.addEventListener('click', toggleGuide);
  document.querySelector('.refresh-btn')?.addEventListener('click', refreshData);
  document.querySelector('.theme-toggle')?.addEventListener('click', toggleTheme);
}

// Theme Toggle
function toggleTheme() {
  document.body.classList.toggle('dark-mode');
  const icon = document.getElementById('themeIcon');
  if (icon) {
    icon.className = document.body.classList.contains('dark-mode') ? 'fas fa-sun' : 'fas fa-moon';
  }
}

// Refresh Data
function refreshData() {
  initializeDashboard();
}

// DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('kpiGrid')) {
    initializeDashboard();
  } else {
    console.error('Critical element #kpiGrid not found');
  }
});
