// Optimized Dashboard JS for Boundou Land Inventory

async function loadData() {
  try {
    const response = await fetch('dashboard_data_complete.json');
    if (!response.ok) throw new Error('Failed to load data');
    return await response.json();
  } catch (error) {
    console.error('Error loading data:', error);
    showNotification('Erreur lors du chargement des données. Utilisation des données par défaut.', 'error');
    // Fallback to hard-coded data if fetch fails
    return {
      "kpi_data": {
        "total_parcelles_brutes": 115720,
        "total_parcelles_sans_doublons": 41293,
        "total_parcelles_post_traitees": 40139,
        "total_parcelles_ok_post_traitement": 40139,
        "total_parcelles_quarantaines": 337,
        "total_jointure_ok": 23513,
        "total_jointure_pas_ok": 16626,
        "total_parcelles_restantes": 1491,
        "total_retour_urm": 0,
        "total_communes": 15,
        "taux_dedoublonnage": 35.7,
        "taux_post_traitement": 97.2,
        "taux_ok_post_traitement": 100.0,
        "taux_jointure_ok": 58.6
      },
      "communes_data": [
        {
          "Commune": "Bala",
          "parcelles_brutes": 912,
          "parcelles_sans_doublons": 907,
          "parcelles_post_traitees": 842,
          "retour_urm": 0,
          "parcelles_non_traitees": 65,
          "parcelles_intersectees_nicad": 0,
          "parcelles_restantes": 65,
          "parcelles_sans_idup": 0,
          "parcelles_ok_post_traitement": 842,
          "parcelles_jointure_ok": 0,
          "parcelles_jointure_pas_ok": 842,
          "parcelles_quarantaines": 0,
          "taux_dedoublonnage": 99.5,
          "taux_post_traitement": 92.8,
          "taux_ok_post_traitement": 100.0,
          "taux_jointure_ok": 0.0
        },
        {
          "Commune": "Ballou",
          "parcelles_brutes": 1551,
          "parcelles_sans_doublons": 659,
          "parcelles_post_traitees": 1964,
          "retour_urm": 0,
          "parcelles_non_traitees": 0,
          "parcelles_intersectees_nicad": 0,
          "parcelles_restantes": 0,
          "parcelles_sans_idup": 0,
          "parcelles_ok_post_traitement": 1964,
          "parcelles_jointure_ok": 1294,
          "parcelles_jointure_pas_ok": 670,
          "parcelles_quarantaines": 0,
          "taux_dedoublonnage": 42.5,
          "taux_post_traitement": 298.0,
          "taux_ok_post_traitement": 100.0,
          "taux_jointure_ok": 65.9
        },
        {
          "Commune": "Bandafassi",
          "parcelles_brutes": 11731,
          "parcelles_sans_doublons": 3832,
          "parcelles_post_traitees": 4121,
          "retour_urm": 0,
          "parcelles_non_traitees": 0,
          "parcelles_intersectees_nicad": 0,
          "parcelles_restantes": 0,
          "parcelles_sans_idup": 0,
          "parcelles_ok_post_traitement": 4121,
          "parcelles_jointure_ok": 2883,
          "parcelles_jointure_pas_ok": 1238,
          "parcelles_quarantaines": 0,
          "taux_dedoublonnage": 32.7,
          "taux_post_traitement": 107.5,
          "taux_ok_post_traitement": 100.0,
          "taux_jointure_ok": 70.0
        },
        {
          "Commune": "Bembou",
          "parcelles_brutes": 5885,
          "parcelles_sans_doublons": 2083,
          "parcelles_post_traitees": 2024,
          "retour_urm": 0,
          "parcelles_non_traitees": 59,
          "parcelles_intersectees_nicad": 0,
          "parcelles_restantes": 59,
          "parcelles_sans_idup": 0,
          "parcelles_ok_post_traitement": 2024,
          "parcelles_jointure_ok": 1805,
          "parcelles_jointure_pas_ok": 219,
          "parcelles_quarantaines": 0,
          "taux_dedoublonnage": 35.4,
          "taux_post_traitement": 97.2,
          "taux_ok_post_traitement": 100.0,
          "taux_jointure_ok": 89.2
        },
        {
          "Commune": "Dimboli",
          "parcelles_brutes": 6474,
          "parcelles_sans_doublons": 3075,
          "parcelles_post_traitees": 3014,
          "retour_urm": 0,
          "parcelles_non_traitees": 61,
          "parcelles_intersectees_nicad": 0,
          "parcelles_restantes": 61,
          "parcelles_sans_idup": 0,
          "parcelles_ok_post_traitement": 3014,
          "parcelles_jointure_ok": 2852,
          "parcelles_jointure_pas_ok": 162,
          "parcelles_quarantaines": 0,
          "taux_dedoublonnage": 47.5,
          "taux_post_traitement": 98.0,
          "taux_ok_post_traitement": 100.0,
          "taux_jointure_ok": 94.6
        },
        {
          "Commune": "Dindefello",
          "parcelles_brutes": 5725,
          "parcelles_sans_doublons": 1845,
          "parcelles_post_traitees": 2124,
          "retour_urm": 0,
          "parcelles_non_traitees": 0,
          "parcelles_intersectees_nicad": 0,
          "parcelles_restantes": 0,
          "parcelles_sans_idup": 0,
          "parcelles_ok_post_traitement": 2124,
          "parcelles_jointure_ok": 492,
          "parcelles_jointure_pas_ok": 1632,
          "parcelles_quarantaines": 0,
          "taux_dedoublonnage": 32.2,
          "taux_post_traitement": 115.1,
          "taux_ok_post_traitement": 100.0,
          "taux_jointure_ok": 23.2
        },
        {
          "Commune": "Fongolembi",
          "parcelles_brutes": 5001,
          "parcelles_sans_doublons": 1542,
          "parcelles_post_traitees": 1579,
          "retour_urm": 0,
          "parcelles_non_traitees": 0,
          "parcelles_intersectees_nicad": 0,
          "parcelles_restantes": 0,
          "parcelles_sans_idup": 0,
          "parcelles_ok_post_traitement": 1579,
          "parcelles_jointure_ok": 1374,
          "parcelles_jointure_pas_ok": 205,
          "parcelles_quarantaines": 0,
          "taux_dedoublonnage": 30.8,
          "taux_post_traitement": 102.4,
          "taux_ok_post_traitement": 100.0,
          "taux_jointure_ok": 87.0
        },
        {
          "Commune": "Gabou",
          "parcelles_brutes": 1999,
          "parcelles_sans_doublons": 947,
          "parcelles_post_traitees": 1633,
          "retour_urm": 0,
          "parcelles_non_traitees": 0,
          "parcelles_intersectees_nicad": 0,
          "parcelles_restantes": 0,
          "parcelles_sans_idup": 0,
          "parcelles_ok_post_traitement": 1633,
          "parcelles_jointure_ok": 1609,
          "parcelles_jointure_pas_ok": 24,
          "parcelles_quarantaines": 0,
          "taux_dedoublonnage": 47.4,
          "taux_post_traitement": 172.4,
          "taux_ok_post_traitement": 100.0,
          "taux_jointure_ok": 98.5
        },
        {
          "Commune": "Koar",
          "parcelles_brutes": 101,
          "parcelles_sans_doublons": 93,
          "parcelles_post_traitees": 92,
          "retour_urm": 0,
          "parcelles_non_traitees": 1,
          "parcelles_intersectees_nicad": 0,
          "parcelles_restantes": 1,
          "parcelles_sans_idup": 0,
          "parcelles_ok_post_traitement": 92,
          "parcelles_jointure_ok": 0,
          "parcelles_jointure_pas_ok": 92,
          "parcelles_quarantaines": 0,
          "taux_dedoublonnage": 92.1,
          "taux_post_traitement": 98.9,
          "taux_ok_post_traitement": 100.0,
          "taux_jointure_ok": 0.0
        },
        {
          "Commune": "Missirah",
          "parcelles_brutes": 7371,
          "parcelles_sans_doublons": 5383,
          "parcelles_post_traitees": 5905,
          "retour_urm": 0,
          "parcelles_non_traitees": 0,
          "parcelles_intersectees_nicad": 0,
          "parcelles_restantes": 0,
          "parcelles_sans_idup": 0,
          "parcelles_ok_post_traitement": 5905,
          "parcelles_jointure_ok": 3261,
          "parcelles_jointure_pas_ok": 2644,
          "parcelles_quarantaines": 0,
          "taux_dedoublonnage": 73.0,
          "taux_post_traitement": 109.7,
          "taux_ok_post_traitement": 100.0,
          "taux_jointure_ok": 55.2
        },
        {
          "Commune": "Moudery",
          "parcelles_brutes": 1009,
          "parcelles_sans_doublons": 4973,
          "parcelles_post_traitees": 1006,
          "retour_urm": 0,
          "parcelles_non_traitees": 3967,
          "parcelles_intersectees_nicad": 0,
          "parcelles_restantes": 3967,
          "parcelles_sans_idup": 0,
          "parcelles_ok_post_traitement": 1006,
          "parcelles_jointure_ok": 983,
          "parcelles_jointure_pas_ok": 23,
          "parcelles_quarantaines": 0,
          "taux_dedoublonnage": 492.9,
          "taux_post_traitement": 20.2,
          "taux_ok_post_traitement": 100.0,
          "taux_jointure_ok": 97.7
        },
        {
          "Commune": "Ndoga Babacar",
          "parcelles_brutes": 4759,
          "parcelles_sans_doublons": 2451,
          "parcelles_post_traitees": 4035,
          "retour_urm": 0,
          "parcelles_non_traitees": 0,
          "parcelles_intersectees_nicad": 0,
          "parcelles_restantes": 0,
          "parcelles_sans_idup": 0,
          "parcelles_ok_post_traitement": 4035,
          "parcelles_jointure_ok": 2604,
          "parcelles_jointure_pas_ok": 1431,
          "parcelles_quarantaines": 0,
          "taux_dedoublonnage": 51.5,
          "taux_post_traitement": 164.6,
          "taux_ok_post_traitement": 100.0,
          "taux_jointure_ok": 64.5
        },
        {
          "Commune": "Netteboulou",
          "parcelles_brutes": 3919,
          "parcelles_sans_doublons": 1438,
          "parcelles_post_traitees": 2564,
          "retour_urm": 0,
          "parcelles_non_traitees": 0,
          "parcelles_intersectees_nicad": 0,
          "parcelles_restantes": 0,
          "parcelles_sans_idup": 0,
          "parcelles_ok_post_traitement": 2564,
          "parcelles_jointure_ok": 2026,
          "parcelles_jointure_pas_ok": 538,
          "parcelles_quarantaines": 337,
          "taux_dedoublonnage": 36.7,
          "taux_post_traitement": 178.3,
          "taux_ok_post_traitement": 100.0,
          "taux_jointure_ok": 79.0
        },
        {
          "Commune": "Sinthiou Maleme",
          "parcelles_brutes": 2449,
          "parcelles_sans_doublons": 1391,
          "parcelles_post_traitees": 0,
          "retour_urm": 0,
          "parcelles_non_traitees": 1391,
          "parcelles_intersectees_nicad": 0,
          "parcelles_restantes": 1391,
          "parcelles_sans_idup": 0,
          "parcelles_ok_post_traitement": 0,
          "parcelles_jointure_ok": 0,
          "parcelles_jointure_pas_ok": 0,
          "parcelles_quarantaines": 0,
          "taux_dedoublonnage": 56.8,
          "taux_post_traitement": 0.0,
          "taux_ok_post_traitement": 100.0,
          "taux_jointure_ok": 0.0
        },
        {
          "Commune": "Tomboronkoto",
          "parcelles_brutes": 56834,
          "parcelles_sans_doublons": 10674,
          "parcelles_post_traitees": 9236,
          "retour_urm": 0,
          "parcelles_non_traitees": 1438,
          "parcelles_intersectees_nicad": 0,
          "parcelles_restantes": 1438,
          "parcelles_sans_idup": 0,
          "parcelles_ok_post_traitement": 9236,
          "parcelles_jointure_ok": 2330,
          "parcelles_jointure_pas_ok": 6906,
          "parcelles_quarantaines": 0,
          "taux_dedoublonnage": 18.8,
          "taux_post_traitement": 86.5,
          "taux_ok_post_traitement": 100.0,
          "taux_jointure_ok": 25.2
        }
      ],
      "pipeline_data": {
        "labels": [
          "Parcelles Brutes",
          "Sans Doublons",
          "Post-traitées",
          "OK Post-traitement",
          "Jointure OK"
        ],
        "values": [
          115720,
          41293,
          40139,
          40139,
          23513
        ]
      },
      "communes_chart_data": {
        "communes": [
          "Bala",
          "Ballou",
          "Bandafassi",
          "Bembou",
          "Dimboli",
          "Dindefello",
          "Fongolembi",
          "Gabou",
          "Koar",
          "Missirah",
          "Moudery",
          "Ndoga Babacar",
          "Netteboulou",
          "Sinthiou Maleme",
          "Tomboronkoto"
        ],
        "parcelles_brutes": [
          912,
          1551,
          11731,
          5885,
          6474,
          5725,
          5001,
          1999,
          101,
          7371,
          1009,
          4759,
          3919,
          2449,
          56834
        ],
        "parcelles_sans_doublons": [
          907,
          659,
          3832,
          2083,
          3075,
          1845,
          1542,
          947,
          93,
          5383,
          4973,
          2451,
          1438,
          1391,
          10674
        ],
        "parcelles_post_traitees": [
          842,
          1964,
          4121,
          2024,
          3014,
          2124,
          1579,
          1633,
          92,
          5905,
          1006,
          4035,
          2564,
          0,
          9236
        ],
        "parcelles_ok_post_traitement": [
          842,
          1964,
          4121,
          2024,
          3014,
          2124,
          1579,
          1633,
          92,
          5905,
          1006,
          4035,
          2564,
          0,
          9236
        ],
        "parcelles_quarantaines": [
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          337,
          0,
          0
        ],
        "taux_ok_post_traitement": [
          100.0,
          100.0,
          100.0,
          100.0,
          100.0,
          100.0,
          100.0,
          100.0,
          100.0,
          100.0,
          100.0,
          100.0,
          100.0,
          100.0,
          100.0
        ]
      },
      "column_definitions": {
        "parcelles_quarantaines": "Parcelles inventoriées dans la forêt de Gouloumbou à Netteboulou et mises en quarantaine.",
        "parcelles_ok_post_traitement": "Parcelles post-traitées (assumées OK).",
        "parcelles_restantes": "Parcelles envoyées et non post-traitées ou transmises à l'URM.",
        "parcelles_jointure_ok": "Parcelles dont la jointure a réussi (validées par URM/NICAD).",
        "parcelles_jointure_pas_ok": "Parcelles dont la jointure a échoué (enquêtes non soumises ou supprimées par erreur - nécessitent une nouvelle enquête socio-foncière)."
      }
    };
  }
}

let appData;
let filteredData = [];
let charts = {};
let currentPage = 1;
const pageSize = 10;

async function initDashboard() {
  appData = await loadData();
  filteredData = appData.communes_data;
  populateFilters();
  updateKPIs();
  createCharts();
  updateTable();
  initializeEvents();
  initializeDarkMode();
  initializeModal();
}

function populateFilters() {
  const communeSelect = document.getElementById('communeFilter');
  appData.communes_data.forEach(c => {
    const option = document.createElement('option');
    option.value = c.Commune;
    option.textContent = c.Commune;
    communeSelect.appendChild(option);
  });
}

function updateKPIs() {
  const kpi = appData.kpi_data;
  document.getElementById('totalBrutes').textContent = formatNumber(kpi.total_parcelles_brutes);
  document.getElementById('totalCommunes').textContent = kpi.total_communes;
  document.getElementById('tauxDedoublonnage').textContent = `${kpi.taux_dedoublonnage}%`;
  document.getElementById('tauxPostTraitement').textContent = `${kpi.taux_post_traitement}%`;
  document.getElementById('tauxOkPostTraitement').textContent = `${kpi.taux_ok_post_traitement}%`;
  document.getElementById('totalQuarantaines').textContent = formatNumber(kpi.total_parcelles_quarantaines);
}

function createCharts() {
  const pipelineCtx = document.getElementById('pipelineChart').getContext('2d');
  charts.pipeline = new Chart(pipelineCtx, {
    type: 'funnel',
    data: {
      labels: appData.pipeline_data.labels,
      datasets: [{
        data: appData.pipeline_data.values,
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
      }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });

  const communesCtx = document.getElementById('communesChart').getContext('2d');
  charts.communes = new Chart(communesCtx, {
    type: 'bar',
    data: {
      labels: appData.communes_chart_data.communes,
      datasets: [
        { label: 'Brutes', data: appData.communes_chart_data.parcelles_brutes, backgroundColor: '#FF6384' },
        { label: 'Sans Doublons', data: appData.communes_chart_data.parcelles_sans_doublons, backgroundColor: '#36A2EB' },
        { label: 'Post-traitées', data: appData.communes_chart_data.parcelles_post_traitees, backgroundColor: '#FFCE56' }
      ]
    },
    options: { responsive: true, scales: { y: { beginAtZero: true } } }
  });

  const performanceCtx = document.getElementById('performanceChart').getContext('2d');
  charts.performance = new Chart(performanceCtx, {
    type: 'radar',
    data: {
      labels: appData.communes_chart_data.communes,
      datasets: [{
        label: 'Taux OK Post-traitement',
        data: appData.communes_chart_data.taux_ok_post_traitement,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)'
      }]
    },
    options: { responsive: true }
  });

  const repartitionCtx = document.getElementById('repartitionChart').getContext('2d');
  charts.repartition = new Chart(repartitionCtx, {
    type: 'pie',
    data: {
      labels: ['Brutes', 'Sans Doublons', 'Post-traitées', 'Quarantaines'],
      datasets: [{
        data: [
          appData.kpi_data.total_parcelles_brutes,
          appData.kpi_data.total_parcelles_sans_doublons,
          appData.kpi_data.total_parcelles_post_traitees,
          appData.kpi_data.total_parcelles_quarantaines
        ],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#FF9F40']
      }]
    },
    options: { responsive: true }
  });
}

function updateTable() {
  const tbody = document.querySelector('#dataTable tbody');
  tbody.innerHTML = '';
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  const paginatedData = filteredData.slice(start, end);
  paginatedData.forEach(c => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${c.Commune}</td>
      <td>${formatNumber(c.parcelles_brutes)}</td>
      <td>${formatNumber(c.parcelles_sans_doublons)}</td>
      <td>${formatNumber(c.parcelles_post_traitees)}</td>
      <td>${formatNumber(c.parcelles_ok_post_traitement)}</td>
      <td>${formatNumber(c.parcelles_restantes)}</td>
      <td>${formatNumber(c.parcelles_jointure_ok)}</td>
      <td>${formatNumber(c.parcelles_jointure_pas_ok)}</td>
      <td>${formatNumber(c.parcelles_quarantaines)}</td>
      <td><span class="taux-performance ${getPerformanceClass(c.taux_jointure_ok)}">${c.taux_jointure_ok}%</span></td>
    `;
    tbody.appendChild(row);
  });
  document.getElementById('tableInfo').textContent = `Affichage de ${start + 1} à ${Math.min(end, filteredData.length)} sur ${filteredData.length} entrées`;
}

function getPerformanceClass(taux) {
  if (taux > 20) return 'high';
  if (taux >= 10) return 'medium';
  return 'low';
}

function initializeEvents() {
  document.getElementById('applyFilters').addEventListener('click', applyFilters);
  document.getElementById('resetFilters').addEventListener('click', resetFilters);
  document.getElementById('prevPage').addEventListener('click', () => { if (currentPage > 1) { currentPage--; updateTable(); } });
  document.getElementById('nextPage').addEventListener('click', () => { if (currentPage * pageSize < filteredData.length) { currentPage++; updateTable(); } });
  document.querySelectorAll('.fullscreen-btn').forEach(btn => btn.addEventListener('click', () => openFullscreenChart(charts[btn.closest('.chart-card').querySelector('canvas').id])));
  document.querySelectorAll('.download-btn').forEach(btn => btn.addEventListener('click', () => saveChartAsImage(charts[btn.closest('.chart-card').querySelector('canvas').id])));
}

function applyFilters() {
  const selectedCommunes = Array.from(document.getElementById('communeFilter').selectedOptions).map(opt => opt.value);
  const minParcelles = parseInt(document.getElementById('minParcelles').value) || 0;
  const performanceLevel = document.getElementById('performanceLevel').value;
  const quarantainesFilter = document.getElementById('quarantainesFilter').checked;
  const echecsJointureFilter = document.getElementById('echecsJointureFilter').checked;

  filteredData = appData.communes_data.filter(c => {
    if (selectedCommunes.length > 0 && !selectedCommunes.includes(c.Commune)) return false;
    if (c.parcelles_brutes < minParcelles) return false;
    if (performanceLevel !== 'all') {
      if (performanceLevel === 'high' && c.taux_jointure_ok <= 20) return false;
      if (performanceLevel === 'medium' && (c.taux_jointure_ok < 10 || c.taux_jointure_ok > 20)) return false;
      if (performanceLevel === 'low' && c.taux_jointure_ok >= 10) return false;
    }
    if (quarantainesFilter && c.parcelles_quarantaines === 0) return false;
    if (echecsJointureFilter && c.parcelles_jointure_pas_ok === 0) return false;
    return true;
  });
  currentPage = 1;
  updateTable();
  showNotification('Filtres appliqués avec succès!', 'success');
}

function resetFilters() {
  document.getElementById('communeFilter').selectedIndex = -1;
  document.getElementById('minParcelles').value = 0;
  document.getElementById('performanceLevel').value = 'all';
  document.getElementById('quarantainesFilter').checked = false;
  document.getElementById('echecsJointureFilter').checked = false;
  filteredData = appData.communes_data;
  currentPage = 1;
  updateTable();
  showNotification('Filtres réinitialisés!', 'info');
}

function initializeDarkMode() {
  const toggle = document.getElementById('darkModeToggle');
  toggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    toggle.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
    Object.values(charts).forEach(chart => chart.update());
  });
}

function openFullscreenChart(chart) {
  const modal = document.getElementById('fullscreenModal');
  const modalTitle = document.getElementById('modalTitle');
  const fullscreenCanvas = document.getElementById('fullscreenChart');
  if (modal.fullscreenChart) modal.fullscreenChart.destroy();
  modalTitle.textContent = `Graphique en Plein Écran - ${chart.options.plugins.title.text}`;
  modal.classList.remove('hidden');
  modal.fullscreenChart = new Chart(fullscreenCanvas, {
    type: chart.type,
    data: JSON.parse(JSON.stringify(chart.data)),
    options: JSON.parse(JSON.stringify(chart.options))
  });
}

function closeModal() {
  const modal = document.getElementById('fullscreenModal');
  if (modal.fullscreenChart) modal.fullscreenChart.destroy();
  modal.classList.add('hidden');
}

function initializeModal() {
  const modal = document.getElementById('fullscreenModal');
  const closeBtn = document.getElementById('closeModal');
  const overlay = modal.querySelector('.modal-overlay');
  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', closeModal);
}

function saveChartAsImage(chart) {
  const a = document.createElement('a');
  a.href = chart.toBase64Image();
  a.download = 'chart.png';
  a.click();
}

function showNotification(message, type) {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.getElementById('notifications').appendChild(notification);
  setTimeout(() => notification.remove(), 3000);
}

function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

initDashboard();
