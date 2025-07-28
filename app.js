// Dashboard JavaScript for Interactive Boundou Land Inventory

// Application data
const appData = {
  kpi_data: {
    total_parcelles_brutes: 51799,
    total_parcelles_sans_doublons: 26134,
    total_parcelles_post_traitees: 18515,
    total_parcelles_ok_post_traitement: 4306,
    total_parcelles_quarantaines: 337,
    total_jointure_ok: 1385,
    total_jointure_pas_ok: 2921,
    total_parcelles_restantes: 5208,
    total_retour_urm: 2566,
    total_communes: 11,
    taux_dedoublonnage: 50.5,
    taux_post_traitement: 70.8,
    taux_ok_post_traitement: 82.7,
    taux_jointure_ok: 32.2
  },
  communes_data: [
    {"commune": "Netteboulou", "parcelles_brutes": 3930, "parcelles_sans_doublons": 3341, "parcelles_post_traitees": 1374, "retour_urm": 306, "parcelles_non_traitees": 1485, "parcelles_intersectees_nicad": 346, "parcelles_restantes": 1139, "parcelles_sans_idup": 157, "parcelles_ok_post_traitement": 982, "parcelles_jointure_ok": 755, "parcelles_jointure_pas_ok": 227, "parcelles_quarantaines": 337, "taux_dedoublonnage": 85.0, "taux_post_traitement": 41.1, "taux_ok_post_traitement": 71.5, "taux_jointure_ok": 76.9},
    {"commune": "Missirah", "parcelles_brutes": 4742, "parcelles_sans_doublons": 3076, "parcelles_post_traitees": 1637, "retour_urm": 169, "parcelles_non_traitees": 1499, "parcelles_intersectees_nicad": 443, "parcelles_restantes": 1056, "parcelles_sans_idup": 489, "parcelles_ok_post_traitement": 567, "parcelles_jointure_ok": 363, "parcelles_jointure_pas_ok": 204, "parcelles_quarantaines": 0, "taux_dedoublonnage": 64.9, "taux_post_traitement": 53.2, "taux_ok_post_traitement": 34.6, "taux_jointure_ok": 64.0},
    {"commune": "Gabou", "parcelles_brutes": 1892, "parcelles_sans_doublons": 1548, "parcelles_post_traitees": 1633, "retour_urm": 19, "parcelles_non_traitees": 110, "parcelles_intersectees_nicad": 0, "parcelles_restantes": 110, "parcelles_sans_idup": 2, "parcelles_ok_post_traitement": 108, "parcelles_jointure_ok": 0, "parcelles_jointure_pas_ok": 108, "parcelles_quarantaines": 0, "taux_dedoublonnage": 81.8, "taux_post_traitement": 105.5, "taux_ok_post_traitement": 6.6, "taux_jointure_ok": 0.0},
    {"commune": "Ballou", "parcelles_brutes": 1552, "parcelles_sans_doublons": 1418, "parcelles_post_traitees": 982, "retour_urm": 58, "parcelles_non_traitees": 407, "parcelles_intersectees_nicad": 0, "parcelles_restantes": 407, "parcelles_sans_idup": 128, "parcelles_ok_post_traitement": 279, "parcelles_jointure_ok": 26, "parcelles_jointure_pas_ok": 253, "parcelles_quarantaines": 0, "taux_dedoublonnage": 91.4, "taux_post_traitement": 69.2, "taux_ok_post_traitement": 28.4, "taux_jointure_ok": 9.3},
    {"commune": "Bandafassi", "parcelles_brutes": 10973, "parcelles_sans_doublons": 3911, "parcelles_post_traitees": 2301, "retour_urm": 472, "parcelles_non_traitees": 1683, "parcelles_intersectees_nicad": 1002, "parcelles_restantes": 681, "parcelles_sans_idup": 8, "parcelles_ok_post_traitement": 673, "parcelles_jointure_ok": 0, "parcelles_jointure_pas_ok": 673, "parcelles_quarantaines": 0, "taux_dedoublonnage": 35.6, "taux_post_traitement": 58.8, "taux_ok_post_traitement": 29.2, "taux_jointure_ok": 0.0},
    {"commune": "Fongolembi", "parcelles_brutes": 4761, "parcelles_sans_doublons": 1545, "parcelles_post_traitees": 1562, "retour_urm": 168, "parcelles_non_traitees": 56, "parcelles_intersectees_nicad": 3, "parcelles_restantes": 53, "parcelles_sans_idup": 23, "parcelles_ok_post_traitement": 30, "parcelles_jointure_ok": 20, "parcelles_jointure_pas_ok": 10, "parcelles_quarantaines": 0, "taux_dedoublonnage": 32.5, "taux_post_traitement": 101.1, "taux_ok_post_traitement": 1.9, "taux_jointure_ok": 66.7},
    {"commune": "DimbolI", "parcelles_brutes": 6474, "parcelles_sans_doublons": 3268, "parcelles_post_traitees": 2951, "retour_urm": 241, "parcelles_non_traitees": 155, "parcelles_intersectees_nicad": 0, "parcelles_restantes": 155, "parcelles_sans_idup": 16, "parcelles_ok_post_traitement": 139, "parcelles_jointure_ok": 63, "parcelles_jointure_pas_ok": 76, "parcelles_quarantaines": 0, "taux_dedoublonnage": 50.5, "taux_post_traitement": 90.3, "taux_ok_post_traitement": 4.7, "taux_jointure_ok": 45.3},
    {"commune": "Bembou", "parcelles_brutes": 5872, "parcelles_sans_doublons": 2070, "parcelles_post_traitees": 1875, "retour_urm": 804, "parcelles_non_traitees": 338, "parcelles_intersectees_nicad": 0, "parcelles_restantes": 338, "parcelles_sans_idup": 33, "parcelles_ok_post_traitement": 305, "parcelles_jointure_ok": 152, "parcelles_jointure_pas_ok": 153, "parcelles_quarantaines": 0, "taux_dedoublonnage": 35.3, "taux_post_traitement": 90.6, "taux_ok_post_traitement": 16.3, "taux_jointure_ok": 49.8},
    {"commune": "Moudery", "parcelles_brutes": 1000, "parcelles_sans_doublons": 995, "parcelles_post_traitees": 732, "retour_urm": 22, "parcelles_non_traitees": 257, "parcelles_intersectees_nicad": 0, "parcelles_restantes": 226, "parcelles_sans_idup": 31, "parcelles_ok_post_traitement": 195, "parcelles_jointure_ok": 1, "parcelles_jointure_pas_ok": 194, "parcelles_quarantaines": 0, "taux_dedoublonnage": 99.5, "taux_post_traitement": 73.6, "taux_ok_post_traitement": 26.6, "taux_jointure_ok": 0.5},
    {"commune": "Dindefello", "parcelles_brutes": 5706, "parcelles_sans_doublons": 1826, "parcelles_post_traitees": 2102, "retour_urm": 16, "parcelles_non_traitees": 60, "parcelles_intersectees_nicad": 0, "parcelles_restantes": 60, "parcelles_sans_idup": 15, "parcelles_ok_post_traitement": 45, "parcelles_jointure_ok": 0, "parcelles_jointure_pas_ok": 45, "parcelles_quarantaines": 0, "taux_dedoublonnage": 32.0, "taux_post_traitement": 115.1, "taux_ok_post_traitement": 2.1, "taux_jointure_ok": 0.0},
    {"commune": "Ndoga Babacar", "parcelles_brutes": 4897, "parcelles_sans_doublons": 3136, "parcelles_post_traitees": 1366, "retour_urm": 291, "parcelles_non_traitees": 2537, "parcelles_intersectees_nicad": 837, "parcelles_restantes": 983, "parcelles_sans_idup": 0, "parcelles_ok_post_traitement": 983, "parcelles_jointure_ok": 5, "parcelles_jointure_pas_ok": 978, "parcelles_quarantaines": 0, "taux_dedoublonnage": 64.0, "taux_post_traitement": 43.6, "taux_ok_post_traitement": 72.0, "taux_jointure_ok": 0.5}
  ]
};

// Global variables
let charts = {};
let filteredData = [...appData.communes_data];
let currentSort = { column: null, direction: 'asc' };
let currentPage = 1;
let rowsPerPage = 10;
let searchTerm = '';

// Color scheme for charts
const colors = ['#0ea5e9', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6', '#ec4899', '#facc15', '#6b7280', '#22c55e', '#3b82f6'];

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', initializeDashboard);

function initializeDashboard() {
  if (typeof Chart === 'undefined') {
    setTimeout(initializeDashboard, 100);
    return;
  }

  Chart.register(ChartZoom);
  initializeFilters();
  initializeCharts();
  initializeTable();
  initializeTooltips();
  initializeExport();
  initializeModal();
  updateKPIs();
  showNotification('Dashboard chargé avec succès!', 'success');
}

// Initialize filters
function initializeFilters() {
  const communeSelect = document.getElementById('communeFilter');
  const seuilSlider = document.getElementById('seuilFilter');
  const seuilValue = document.getElementById('seuilValue');

  appData.communes_data.forEach(commune => {
    const option = document.createElement('option');
    option.value = commune.commune;
    option.textContent = commune.commune;
    communeSelect.appendChild(option);
  });

  seuilSlider.addEventListener('input', () => {
    seuilValue.textContent = seuilSlider.value;
  });

  document.getElementById('applyFilters').addEventListener('click', applyFilters);
  document.getElementById('resetFilters').addEventListener('click', resetFilters);
}

// Apply filters
function applyFilters() {
  const communeSelect = document.getElementById('communeFilter');
  const seuilSlider = document.getElementById('seuilFilter');
  const performanceFilter = document.getElementById('performanceFilter').value;
  const quarantineFilter = document.getElementById('quarantineFilter').checked;
  const jointureFilter = document.getElementById('jointureFilter').checked;

  const selectedCommunes = Array.from(communeSelect.selectedOptions).map(option => option.value);
  const seuilMin = parseInt(seuilSlider.value);

  filteredData = appData.communes_data.filter(commune => {
    if (selectedCommunes.length > 0 && !selectedCommunes.includes(commune.commune) && !selectedCommunes.includes('all')) return false;
    if (commune.parcelles_brutes < seuilMin) return false;
    const taux = commune.taux_jointure_ok;
    if (performanceFilter === 'high' && taux <= 20) return false;
    if (performanceFilter === 'medium' && (taux < 10 || taux > 20)) return false;
    if (performanceFilter === 'low' && taux >= 10) return false;
    if (quarantineFilter && commune.parcelles_quarantaines === 0) return false;
    if (jointureFilter && commune.parcelles_jointure_pas_ok === 0) return false;
    return true;
  });

  updateKPIs();
  updateCharts();
  updateTable();
  showNotification(`Filtres appliqués - ${filteredData.length} commune(s) affichée(s)`, 'info');
}

// Reset filters
function resetFilters() {
  document.getElementById('communeFilter').selectedIndex = -1;
  document.getElementById('seuilFilter').value = 0;
  document.getElementById('seuilValue').textContent = '0';
  document.getElementById('performanceFilter').value = 'all';
  document.getElementById('quarantineFilter').checked = false;
  document.getElementById('jointureFilter').checked = false;

  filteredData = [...appData.communes_data];
  updateKPIs();
  updateCharts();
  updateTable();
  showNotification('Filtres réinitialisés', 'info');
}

// Update KPIs
function updateKPIs() {
  const totalBrutes = filteredData.reduce((sum, c) => sum + c.parcelles_brutes, 0);
  const totalSansDoublons = filteredData.reduce((sum, c) => sum + c.parcelles_sans_doublons, 0);
  const totalPostTraitees = filteredData.reduce((sum, c) => sum + c.parcelles_post_traitees, 0);
  const totalOkPostTraitement = filteredData.reduce((sum, c) => sum + c.parcelles_ok_post_traitement, 0);
  const totalQuarantaines = filteredData.reduce((sum, c) => sum + c.parcelles_quarantaines, 0);

  const tauxDedoublonnage = totalBrutes > 0 ? ((totalSansDoublons / totalBrutes) * 100).toFixed(1) : 0;
  const tauxPostTraitement = totalSansDoublons > 0 ? ((totalPostTraitees / totalSansDoublons) * 100).toFixed(1) : 0;
  const tauxOkPostTraitement = totalPostTraitees > 0 ? ((totalOkPostTraitement / totalPostTraitees) * 100).toFixed(1) : 0;

  document.getElementById('kpi-brutes').textContent = formatNumber(totalBrutes);
  document.getElementById('kpi-communes').textContent = filteredData.length;
  document.getElementById('kpi-dedoublonnage').textContent = `${tauxDedoublonnage}%`;
  document.getElementById('kpi-post-traitement').textContent = `${tauxPostTraitement}%`;
  document.getElementById('kpi-ok-post-traitement').textContent = `${tauxOkPostTraitement}%`;
  document.getElementById('kpi-quarantaine').textContent = formatNumber(totalQuarantaines);
}

// Initialize charts
function initializeCharts() {
  createPipelineChart();
  createCommunesChart();
  createPerformanceChart();
  createRepartitionChart();
}

// Create pipeline chart
function createPipelineChart() {
  const ctx = document.getElementById('pipelineChart').getContext('2d');
  charts.pipeline = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Parcelles Brutes', 'Sans Doublons', 'Post-traitées', 'OK Post-traitement', 'Jointure OK'],
      datasets: [{
        label: 'Nombre de Parcelles',
        data: [
          appData.kpi_data.total_parcelles_brutes,
          appData.kpi_data.total_parcelles_sans_doublons,
          appData.kpi_data.total_parcelles_post_traitees,
          appData.kpi_data.total_parcelles_ok_post_traitement,
          appData.kpi_data.total_jointure_ok
        ],
        backgroundColor: colors.slice(0, 5),
        borderColor: colors.slice(0, 5),
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true, ticks: { callback: formatNumber } }
      },
      plugins: {
        zoom: {
          pan: { enabled: true, mode: 'xy' },
          zoom: { wheel: { enabled: true, speed: 0.1 }, pinch: { enabled: true }, mode: 'xy' }
        }
      }
    }
  });
}

// Create communes chart
function createCommunesChart() {
  const ctx = document.getElementById('communesChart').getContext('2d');
  charts.communes = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: [],
      datasets: [
        { label: 'Parcelles Brutes', data: [], backgroundColor: colors[0], borderColor: colors[0], borderWidth: 1 },
        { label: 'Sans Doublons', data: [], backgroundColor: colors[1], borderColor: colors[1], borderWidth: 1 },
        { label: 'Post-traitées', data: [], backgroundColor: colors[2], borderColor: colors[2], borderWidth: 1 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true, ticks: { callback: formatNumber } }
      },
      plugins: {
        zoom: {
          pan: { enabled: true, mode: 'xy' },
          zoom: { wheel: { enabled: true, speed: 0.1 }, pinch: { enabled: true }, mode: 'xy' }
        }
      }
    }
  });
  updateCommunesChart();
}

// Create performance chart
function createPerformanceChart() {
  const ctx = document.getElementById('performanceChart').getContext('2d');
  charts.performance = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: [],
      datasets: [{
        label: 'Taux de Jointure (%)',
        data: [],
        backgroundColor: 'rgba(14, 165, 233, 0.2)',
        borderColor: colors[0],
        borderWidth: 2,
        pointBackgroundColor: colors[0],
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: colors[0]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: { beginAtZero: true, max: 100, ticks: { callback: value => `${value}%` } }
      },
      plugins: {
        zoom: {
          pan: { enabled: true, mode: 'xy' },
          zoom: { wheel: { enabled: true, speed: 0.1 }, pinch: { enabled: true }, mode: 'xy' }
        }
      }
    }
  });
  updatePerformanceChart();
}

// Create repartition chart
function createRepartitionChart() {
  const ctx = document.getElementById('repartitionChart').getContext('2d');
  charts.repartition = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Jointure OK', 'Jointure PAS OK', 'Quarantaines', 'Restantes'],
      datasets: [{
        data: [
          appData.kpi_data.total_jointure_ok,
          appData.kpi_data.total_jointure_pas_ok,
          appData.kpi_data.total_parcelles_quarantaines,
          appData.kpi_data.total_parcelles_restantes
        ],
        backgroundColor: colors.slice(0, 4),
        borderColor: colors.slice(0, 4),
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        zoom: {
          pan: { enabled: true, mode: 'xy' },
          zoom: { wheel: { enabled: true, speed: 0.1 }, pinch: { enabled: true }, mode: 'xy' }
        }
      }
    }
  });
}

// Update charts
function updateCharts() {
  updateCommunesChart();
  updatePerformanceChart();
}

// Update communes chart
function updateCommunesChart() {
  charts.communes.data.labels = filteredData.map(c => c.commune);
  charts.communes.data.datasets[0].data = filteredData.map(c => c.parcelles_brutes);
  charts.communes.data.datasets[1].data = filteredData.map(c => c.parcelles_sans_doublons);
  charts.communes.data.datasets[2].data = filteredData.map(c => c.parcelles_post_traitees);
  charts.communes.update();
}

// Update performance chart
function updatePerformanceChart() {
  charts.performance.data.labels = filteredData.map(c => c.commune);
  charts.performance.data.datasets[0].data = filteredData.map(c => c.taux_jointure_ok);
  charts.performance.update();
}

// Chart controls
document.addEventListener('click', e => {
  if (e.target.classList.contains('chart-btn')) {
    const action = e.target.dataset.action;
    const chartId = e.target.closest('.chart-card').querySelector('canvas').id;
    const chart = charts[chartId.replace('Chart', '')];

    switch (action) {
      case 'zoom-in': chart.zoom(1.2); break;
      case 'zoom-out': chart.zoom(0.8); break;
      case 'reset-zoom': chart.resetZoom(); break;
      case 'fullscreen': openFullscreenChart(chartId); break;
    }
  }
});

// Initialize table
function initializeTable() {
  updateTable();
  document.getElementById('searchTable').addEventListener('input', function() {
    searchTerm = this.value.toLowerCase();
    currentPage = 1;
    updateTable();
  });

  document.querySelectorAll('.sortable').forEach(header => {
    header.addEventListener('click', () => sortTable(header.dataset.column));
  });

  document.getElementById('prevPage').addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      updateTable();
    }
  });

  document.getElementById('nextPage').addEventListener('click', () => {
    const totalPages = Math.ceil(getFilteredTableData().length / rowsPerPage);
    if (currentPage < totalPages) {
      currentPage++;
      updateTable();
    }
  });
}

// Get filtered table data
function getFilteredTableData() {
  return searchTerm
    ? filteredData.filter(commune =>
        commune.commune.toLowerCase().includes(searchTerm) ||
        commune.parcelles_brutes.toString().includes(searchTerm) ||
        commune.parcelles_sans_doublons.toString().includes(searchTerm))
    : filteredData;
}

// Sort table
function sortTable(column) {
  const direction = currentSort.column === column && currentSort.direction === 'asc' ? 'desc' : 'asc';
  document.querySelectorAll('.sortable').forEach(header => header.classList.remove('asc', 'desc'));
  document.querySelector(`[data-column="${column}"]`).classList.add(direction);

  filteredData.sort((a, b) => {
    let aValue = a[column];
    let bValue = b[column];
    if (typeof aValue === 'number' || !isNaN(aValue)) {
      aValue = parseFloat(aValue);
      bValue = parseFloat(bValue);
    }
    return direction === 'asc' ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
  });

  currentSort = { column, direction };
  updateTable();
  showNotification(`Tableau trié par ${column} (${direction === 'asc' ? 'croissant' : 'décroissant'})`, 'info');
}

// Update table
function updateTable() {
  const tableBody = document.getElementById('tableBody');
  const tableData = getFilteredTableData();
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedData = tableData.slice(startIndex, endIndex);

  tableBody.innerHTML = '';
  paginatedData.forEach(commune => {
    const tauxClass = commune.taux_jointure_ok >= 20 ? 'high' : commune.taux_jointure_ok >= 10 ? 'medium' : 'low';
    tableBody.innerHTML += `
      <tr>
        <td><strong>${commune.commune}</strong></td>
        <td>${formatNumber(commune.parcelles_brutes)}</td>
        <td>${formatNumber(commune.parcelles_sans_doublons)}</td>
        <td>${formatNumber(commune.parcelles_post_traitees)}</td>
        <td>${formatNumber(commune.parcelles_ok_post_traitement)}</td>
        <td>${formatNumber(commune.parcelles_restantes)}</td>
        <td>${formatNumber(commune.parcelles_jointure_ok)}</td>
        <td>${formatNumber(commune.parcelles_jointure_pas_ok)}</td>
        <td>${formatNumber(commune.parcelles_quarantaines)}</td>
        <td><span class="taux-performance ${tauxClass}">${commune.taux_jointure_ok}%</span></td>
      </tr>
    `;
  });

  const totalItems = tableData.length;
  const startItem = startIndex + 1;
  const endItem = Math.min(endIndex, totalItems);
  document.getElementById('paginationInfo').textContent = `Affichage de ${startItem} à ${endItem} sur ${totalItems} entrées`;
  updatePaginationControls(totalItems);
}

// Update pagination controls
function updatePaginationControls(totalItems) {
  const totalPages = Math.ceil(totalItems / rowsPerPage);
  const pageNumbers = document.getElementById('pageNumbers');
  pageNumbers.innerHTML = '';

  for (let i = 1; i <= totalPages; i++) {
    const pageBtn = document.createElement('button');
    pageBtn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
    pageBtn.textContent = i;
    pageBtn.addEventListener('click', () => {
      currentPage = i;
      updateTable();
    });
    pageNumbers.appendChild(pageBtn);
  }

  document.getElementById('prevPage').disabled = currentPage === 1;
  document.getElementById('nextPage').disabled = currentPage === totalPages;
}

// Initialize tooltips
function initializeTooltips() {
  const tooltip = document.getElementById('tooltip');
  document.querySelectorAll('[data-tooltip]').forEach(element => {
    element.addEventListener('mouseenter', e => showTooltip(e, element.dataset.tooltip));
    element.addEventListener('mouseleave', hideTooltip);
    element.addEventListener('mousemove', updateTooltipPosition);
  });
}

// Show tooltip
function showTooltip(e, text) {
  const tooltip = document.getElementById('tooltip');
  tooltip.textContent = text;
  tooltip.classList.remove('hidden');
  updateTooltipPosition(e);
}

// Hide tooltip
function hideTooltip() {
  document.getElementById('tooltip').classList.add('hidden');
}

// Update tooltip position
function updateTooltipPosition(e) {
  const tooltip = document.getElementById('tooltip');
  const rect = tooltip.getBoundingClientRect();
  tooltip.style.left = `${e.clientX + 10}px`;
  tooltip.style.top = `${e.clientY - rect.height - 10}px`;
}

// Initialize export functionality
function initializeExport() {
  document.getElementById('exportBtn').addEventListener('click', exportToCSV);
}

// Export to CSV
function exportToCSV() {
  const headers = [
    'Commune', 'Parcelles Brutes', 'Sans Doublons', 'Post-traitées',
    'OK Post-traitement', 'Restantes', 'Jointure OK', 'Jointure PAS OK',
    'Quarantaines', 'Taux Jointure'
  ];

  let csvContent = 'data:text/csv;charset=utf-8,' + headers.join(',') + '\n';
  filteredData.forEach(commune => {
    csvContent += [
      `"${commune.commune}"`,
      commune.parcelles_brutes,
      commune.parcelles_sans_doublons,
      commune.parcelles_post_traitees,
      commune.parcelles_ok_post_traitement,
      commune.parcelles_restantes,
      commune.parcelles_jointure_ok,
      commune.parcelles_jointure_pas_ok,
      commune.parcelles_quarantaines,
      `${commune.taux_jointure_ok}%`
    ].join(',') + '\n';
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `inventaire_foncier_boundou_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showNotification('Données exportées avec succès!', 'success');
}

// Initialize modal
function initializeModal() {
  const modal = document.getElementById('fullscreenModal');
  document.getElementById('closeModal').addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
}

// Open fullscreen chart
function openFullscreenChart(chartId) {
  const modal = document.getElementById('fullscreenModal');
  const modalTitle = document.getElementById('modalTitle');
  const fullscreenCanvas = document.getElementById('fullscreenChart');
  const originalChart = charts[chartId.replace('Chart', '')];

  modalTitle.textContent = `Graphique en Plein Écran - ${originalChart.options.plugins?.title?.text || 'Graphique'}`;
  modal.classList.remove('hidden');

  modal.fullscreenChart = new Chart(fullscreenCanvas, {
    type: originalChart.config.type,
    data: JSON.parse(JSON.stringify(originalChart.data)),
    options: { ...originalChart.options, responsive: true, maintainAspectRatio: false }
  });

  showNotification('Graphique ouvert en plein écran', 'info');
}

// Close modal
function closeModal() {
  const modal = document.getElementById('fullscreenModal');
  if (modal.fullscreenChart) {
    modal.fullscreenChart.destroy();
    modal.fullscreenChart = null;
  }
  modal.classList.add('hidden');
}

// Show notification
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.getElementById('notifications').appendChild(notification);
  setTimeout(() => notification.remove(), 3000);
}

// Format number
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
