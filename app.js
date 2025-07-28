// Optimized Dashboard JS for Boundou Land Inventory

const appData = {
  kpi_data: { total_parcelles_brutes: 51799, total_parcelles_sans_doublons: 26134, total_parcelles_post_traitees: 18515, total_parcelles_ok_post_traitement: 4306, total_parcelles_quarantaines: 337, total_jointure_ok: 1385, total_jointure_pas_ok: 2921, total_parcelles_restantes: 5208, total_retour_urm: 2566, total_communes: 11, taux_dedoublonnage: 50.5, taux_post_traitement: 70.8, taux_ok_post_traitement: 82.7, taux_jointure_ok: 32.2 },
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

let charts = {}, filteredData = [...appData.communes_data], currentSort = { column: null, direction: 'asc' }, currentPage = 1, rowsPerPage = 10, searchTerm = '';
const colors = ['#F4E4BC', '#A3BFFA', '#D4A373', '#A3B18A', '#DDA0DD', '#E9B872', '#9BA4B5', '#E0E7E9', '#F5F5F0', '#4A4E69'];

document.addEventListener('DOMContentLoaded', () => {
  if (!Chart) return setTimeout(arguments.callee, 100);
  Chart.register(ChartZoom);
  initializeDashboard();
});

function initializeDashboard() {
  initializeFilters();
  initializeCharts();
  initializeTable();
  initializeTooltips();
  initializeExport();
  initializeModal();
  initializeSidebarToggle();
  initializeDarkMode();
  updateKPIs();
}

function initializeSidebarToggle() {
  const sidebar = document.querySelector('.sidebar'), hamburger = document.createElement('button');
  hamburger.className = 'btn btn--sm hamburger'; hamburger.textContent = '☰';
  sidebar.parentElement.insertBefore(hamburger, sidebar);
  hamburger.addEventListener('click', () => sidebar.classList.toggle('open'));
}

function initializeFilters() {
  const communeFilters = document.getElementById('communeFilters'), seuilSlider = document.getElementById('seuilFilter'), seuilValue = document.getElementById('seuilValue');
  appData.communes_data.forEach(commune => {
    const label = document.createElement('label'); label.className = 'checkbox-label';
    label.innerHTML = `<input type="checkbox" name="commune" value="${commune.commune}"> ${commune.commune}`;
    communeFilters.appendChild(label);
  });
  seuilSlider.addEventListener('input', () => seuilValue.textContent = seuilSlider.value);
  debounceEvent('applyFilters', 'click', applyFilters, 300);
  document.getElementById('resetFilters').addEventListener('click', resetFilters);
}

function applyFilters() {
  const communeCheckboxes = document.querySelectorAll('input[name="commune"]'), selectedCommunes = Array.from(communeCheckboxes).filter(cb => cb.checked).map(cb => cb.value);
  const seuilSlider = document.getElementById('seuilFilter'), performanceFilter = document.getElementById('performanceFilter').value;
  const quarantineFilter = document.getElementById('quarantineFilter').checked, jointureFilter = document.getElementById('jointureFilter').checked;

  filteredData = appData.communes_data.filter(commune => {
    const isCommuneSelected = !selectedCommunes.length || selectedCommunes.includes(commune.commune);
    if (!isCommuneSelected) return false;
    if (commune.parcelles_brutes < parseInt(seuilSlider.value)) return false;
    const taux = commune.taux_jointure_ok;
    if (performanceFilter === 'high' && taux <= 20) return false;
    if (performanceFilter === 'medium' && (taux < 10 || taux > 20)) return false;
    if (performanceFilter === 'low' && taux >= 10) return false;
    if (quarantineFilter && !commune.parcelles_quarantaines) return false;
    if (jointureFilter && !commune.parcelles_jointure_pas_ok) return false;
    return true;
  });

  updateKPIs(); updateCharts(); updateTable();
  showNotification(`Filtres appliqués - ${filteredData.length} commune(s) affichée(s)`, 'info');
}

function resetFilters() {
  document.querySelectorAll('input[name="commune"]').forEach(cb => cb.checked = false);
  document.getElementById('seuilFilter').value = 0; document.getElementById('seuilValue').textContent = '0';
  document.getElementById('performanceFilter').value = 'all'; document.getElementById('quarantineFilter').checked = false;
  document.getElementById('jointureFilter').checked = false;
  filteredData = [...appData.communes_data]; updateKPIs(); updateCharts(); updateTable();
  showNotification('Filtres réinitialisés', 'info');
}

function updateKPIs() {
  const totals = filteredData.reduce((acc, c) => ({
    brutes: acc.brutes + c.parcelles_brutes, sansDoublons: acc.sansDoublons + c.parcelles_sans_doublons,
    postTraitees: acc.postTraitees + c.parcelles_post_traitees, okPostTraitement: acc.okPostTraitement + c.parcelles_ok_post_traitement,
    quarantaines: acc.quarantaines + c.parcelles_quarantaines
  }), { brutes: 0, sansDoublons: 0, postTraitees: 0, okPostTraitement: 0, quarantaines: 0 });
  const { brutes, sansDoublons, postTraitees, okPostTraitement, quarantaines } = totals;
  document.getElementById('kpi-brutes').textContent = formatNumber(brutes);
  document.getElementById('kpi-communes').textContent = filteredData.length;
  document.getElementById('kpi-dedoublonnage').textContent = `${(sansDoublons / brutes * 100 || 0).toFixed(1)}%`;
  document.getElementById('kpi-post-traitement').textContent = `${(postTraitees / sansDoublons * 100 || 0).toFixed(1)}%`;
  document.getElementById('kpi-ok-post-traitement').textContent = `${(okPostTraitement / postTraitees * 100 || 0).toFixed(1)}%`;
  document.getElementById('kpi-quarantaine').textContent = formatNumber(quarantaines);
}

function initializeCharts() { ['pipeline', 'communes', 'performance', 'repartition'].forEach(id => window[`create${id.charAt(0).toUpperCase() + id.slice(1)}Chart`]()); }

function createPipelineChart() {
  const ctx = document.getElementById('pipelineChart').getContext('2d');
  if (charts.pipeline) charts.pipeline.destroy();
  charts.pipeline = new Chart(ctx, { type: 'bar', data: {
    labels: ['Parcelles Brutes', 'Sans Doublons', 'Post-traitées', 'OK Post-traitement', 'Jointure OK'],
    datasets: [{ label: 'Nombre de Parcelles', data: [
      appData.kpi_data.total_parcelles_brutes, appData.kpi_data.total_parcelles_sans_doublons,
      appData.kpi_data.total_parcelles_post_traitees, appData.kpi_data.total_parcelles_ok_post_traitement,
      appData.kpi_data.total_jointure_ok
    ], backgroundColor: colors.slice(0, 5), borderColor: colors.slice(0, 5).map(c => shadeColor(c, -10)), borderWidth: 1 }]
  }, options: {
    responsive: true, maintainAspectRatio: false, aspectRatio: 1.5,
    scales: { y: { beginAtZero: true, ticks: { callback: formatNumber } }, x: { beginAtZero: true } },
    plugins: { zoom: { pan: { enabled: true, mode: 'xy' }, zoom: { wheel: { enabled: true, speed: 0.1 }, pinch: { enabled: true }, mode: 'xy' } } }
  }});
}

function createCommunesChart() {
  const ctx = document.getElementById('communesChart').getContext('2d');
  if (charts.communes) charts.communes.destroy();
  charts.communes = new Chart(ctx, { type: 'bar', data: {
    labels: [], datasets: [
      { label: 'Parcelles Brutes', data: [], backgroundColor: colors[0], borderColor: shadeColor(colors[0], -10), borderWidth: 1 },
      { label: 'Sans Doublons', data: [], backgroundColor: colors[1], borderColor: shadeColor(colors[1], -10), borderWidth: 1 },
      { label: 'Post-traitées', data: [], backgroundColor: colors[2], borderColor: shadeColor(colors[2], -10), borderWidth: 1 }
    ]
  }, options: {
    responsive: true, maintainAspectRatio: false, aspectRatio: 1.5,
    scales: { y: { beginAtZero: true, ticks: { callback: formatNumber } }, x: { beginAtZero: true } },
    plugins: { zoom: { pan: { enabled: true, mode: 'xy' }, zoom: { wheel: { enabled: true, speed: 0.1 }, pinch: { enabled: true }, mode: 'xy' } } }
  }});
  updateCommunesChart();
}

function createPerformanceChart() {
  const ctx = document.getElementById('performanceChart').getContext('2d');
  if (charts.performance) charts.performance.destroy();
  charts.performance = new Chart(ctx, { type: 'radar', data: {
    labels: [], datasets: [{ label: 'Taux de Jointure (%)', data: [], backgroundColor: 'rgba(163, 191, 250, 0.2)', borderColor: colors[1], borderWidth: 2, pointBackgroundColor: colors[1], pointBorderColor: '#fff', pointHoverBackgroundColor: '#fff', pointHoverBorderColor: colors[1] }]
  }, options: {
    responsive: true, maintainAspectRatio: false, aspectRatio: 1,
    scales: { r: { beginAtZero: true, max: 100, ticks: { callback: value => `${value}%` } } },
    plugins: { zoom: { pan: { enabled: true, mode: 'xy' }, zoom: { wheel: { enabled: true, speed: 0.1 }, pinch: { enabled: true }, mode: 'xy' } } }
  }});
  updatePerformanceChart();
}

function createRepartitionChart() {
  const ctx = document.getElementById('repartitionChart').getContext('2d');
  if (charts.repartition) charts.repartition.destroy();
  charts.repartition = new Chart(ctx, { type: 'doughnut', data: {
    labels: ['Jointure OK', 'Jointure PAS OK', 'Quarantaines', 'Restantes'],
    datasets: [{ data: [appData.kpi_data.total_jointure_ok, appData.kpi_data.total_jointure_pas_ok, appData.kpi_data.total_parcelles_quarantaines, appData.kpi_data.total_parcelles_restantes], backgroundColor: colors.slice(0, 4), borderColor: colors.slice(0, 4).map(c => shadeColor(c, -10)), borderWidth: 2 }]
  }, options: {
    responsive: true, maintainAspectRatio: false, aspectRatio: 1,
    plugins: { zoom: { pan: { enabled: true, mode: 'xy' }, zoom: { wheel: { enabled: true, speed: 0.1 }, pinch: { enabled: true }, mode: 'xy' } } }
  }});
}

function updateCharts() { updateCommunesChart(); updatePerformanceChart(); }

function updateCommunesChart() { if (charts.communes && Array.isArray(filteredData)) { charts.communes.data.labels = filteredData.map(c => c.commune); charts.communes.data.datasets[0].data = filteredData.map(c => c.parcelles_brutes); charts.communes.data.datasets[1].data = filteredData.map(c => c.parcelles_sans_doublons); charts.communes.data.datasets[2].data = filteredData.map(c => c.parcelles_post_traitees); charts.communes.update(); } }

function updatePerformanceChart() { if (charts.performance && Array.isArray(filteredData)) { charts.performance.data.labels = filteredData.map(c => c.commune); charts.performance.data.datasets[0].data = filteredData.map(c => c.taux_jointure_ok); charts.performance.update(); } }

document.addEventListener('click', e => {
  if (e.target.classList.contains('chart-btn')) {
    const action = e.target.dataset.action, chartId = e.target.closest('.chart-card').querySelector('canvas').id, chart = charts[chartId.replace('Chart', '')];
    switch (action) {
      case 'zoom-in': chart.zoom(1.2); break;
      case 'zoom-out': chart.zoom(0.8); break;
      case 'reset-zoom': chart.resetZoom(); break;
      case 'fullscreen': openFullscreenChart(chart); break;
      case 'save-image': saveChartAsImage(chart); break;
    }
  }
});

function initializeTable() {
  updateTable();
  debounceEvent('searchTable', 'input', () => { searchTerm = document.getElementById('searchTable').value.toLowerCase(); currentPage = 1; updateTable(); }, 300);
  document.querySelectorAll('.sortable').forEach(header => header.addEventListener('click', () => sortTable(header.dataset.column)));
  document.getElementById('prevPage').addEventListener('click', () => { if (currentPage > 1) { currentPage--; updateTable(); } });
  document.getElementById('nextPage').addEventListener('click', () => { if (currentPage < Math.ceil(getFilteredTableData().length / rowsPerPage)) { currentPage++; updateTable(); } });
}

function getFilteredTableData() { return searchTerm ? filteredData.filter(commune => [commune.commune, commune.parcelles_brutes, commune.parcelles_sans_doublons].some(v => v.toString().toLowerCase().includes(searchTerm))) : filteredData; }

function sortTable(column) {
  const direction = currentSort.column === column && currentSort.direction === 'asc' ? 'desc' : 'asc';
  document.querySelectorAll('.sortable').forEach(h => h.classList.remove('asc', 'desc'));
  document.querySelector(`[data-column="${column}"]`).classList.add(direction);
  filteredData.sort((a, b) => {
    let aValue = a[column], bValue = b[column];
    if (!isNaN(aValue)) { aValue = +aValue; bValue = +bValue; }
    return direction === 'asc' ? aValue - bValue : bValue - aValue;
  });
  currentSort = { column, direction }; updateTable();
  showNotification(`Tableau trié par ${column} (${direction === 'asc' ? 'croissant' : 'décroissant'})`, 'info');
}

function updateTable() {
  const tableBody = document.getElementById('tableBody'), tableData = getFilteredTableData(), start = (currentPage - 1) * rowsPerPage, end = start + rowsPerPage;
  tableBody.innerHTML = tableData.slice(start, end).map(commune => `<tr><td><strong>${commune.commune}</strong></td><td>${formatNumber(commune.parcelles_brutes)}</td><td>${formatNumber(commune.parcelles_sans_doublons)}</td><td>${formatNumber(commune.parcelles_post_traitees)}</td><td>${formatNumber(commune.parcelles_ok_post_traitement)}</td><td>${formatNumber(commune.parcelles_restantes)}</td><td>${formatNumber(commune.parcelles_jointure_ok)}</td><td>${formatNumber(commune.parcelles_jointure_pas_ok)}</td><td>${formatNumber(commune.parcelles_quarantaines)}</td><td><span class="taux-performance ${commune.taux_jointure_ok >= 20 ? 'high' : commune.taux_jointure_ok >= 10 ? 'medium' : 'low'}">${commune.taux_jointure_ok}%</span></td></tr>`).join('');
  const total = tableData.length; document.getElementById('paginationInfo').textContent = `Affichage de ${start + 1} à ${Math.min(end, total)} sur ${total} entrées`;
  updatePaginationControls(total);
}

function updatePaginationControls(total) {
  const pageNumbers = document.getElementById('pageNumbers'); pageNumbers.innerHTML = '';
  Array.from({ length: Math.ceil(total / rowsPerPage) }, (_, i) => {
    const btn = document.createElement('button'); btn.className = `page-btn ${i + 1 === currentPage ? 'active' : ''}`; btn.textContent = i + 1;
    btn.addEventListener('click', () => { currentPage = i + 1; updateTable(); }); pageNumbers.appendChild(btn);
  });
  document.getElementById('prevPage').disabled = currentPage === 1; document.getElementById('nextPage').disabled = currentPage === Math.ceil(total / rowsPerPage);
}

function initializeTooltips() {
  const tooltip = document.getElementById('tooltip');
  document.querySelectorAll('[data-tooltip]').forEach(el => {
    el.addEventListener('mouseenter', e => showTooltip(e, el.dataset.tooltip));
    el.addEventListener('mouseleave', hideTooltip);
    el.addEventListener('mousemove', updateTooltipPosition);
  });
}

function showTooltip(e, text) { document.getElementById('tooltip').textContent = text || 'Tooltip data unavailable'; document.getElementById('tooltip').classList.remove('hidden'); updateTooltipPosition(e); }
function hideTooltip() { document.getElementById('tooltip').classList.add('hidden'); }
function updateTooltipPosition(e) { const tooltip = document.getElementById('tooltip'), rect = tooltip.getBoundingClientRect(); tooltip.style.left = `${e.clientX + 10}px`; tooltip.style.top = `${e.clientY - rect.height - 10}px`; }

function initializeExport() { document.getElementById('exportBtn').addEventListener('click', exportToCSV); }

function exportToCSV() {
  const headers = ['Commune', 'Parcelles Brutes', 'Sans Doublons', 'Post-traitées', 'OK Post-traitement', 'Restantes', 'Jointure OK', 'Jointure PAS OK', 'Quarantaines', 'Taux Jointure'];
  const csv = [headers.join(','), ...filteredData.map(c => [c.commune, c.parcelles_brutes, c.parcelles_sans_doublons, c.parcelles_post_traitees, c.parcelles_ok_post_traitement, c.parcelles_restantes, c.parcelles_jointure_ok, c.parcelles_jointure_pas_ok, c.parcelles_quarantaines, `${c.taux_jointure_ok}%`].join(','))].join('\n');
  const link = document.createElement('a'); link.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv); link.download = `inventaire_foncier_boundou_${new Date().toISOString().split('T')[0]}.csv`; document.body.appendChild(link); link.click(); document.body.removeChild(link);
  showNotification('Données exportées avec succès!', 'success');
}

function initializeModal() {
  const modal = document.getElementById('fullscreenModal'), closeBtn = document.getElementById('closeModal'), overlay = document.querySelector('.modal-overlay');
  [closeBtn, overlay].forEach(el => el.addEventListener('click', closeModal));
  modal.addEventListener('click', e => e.target === modal && closeModal());
  document.addEventListener('keydown', e => e.key === 'Escape' && closeModal());
}

function openFullscreenChart(chart) {
  const modal = document.getElementById('fullscreenModal'), modalTitle = document.getElementById('modalTitle'), fullscreenCanvas = document.getElementById('fullscreenChart');
  if (modal.fullscreenChart) modal.fullscreenChart.destroy();
  modalTitle.textContent = `Graphique en Plein Écran - ${chart.options.plugins?.title?.text || 'Graphique'}`;
  modal.classList.remove('hidden');
  modal.fullscreenChart = new Chart(fullscreenCanvas, {
    type: chart.config.type,
    data: JSON.parse(JSON.stringify(chart.data)),
    options: {
      ...chart.options,
      responsive: true,
      maintainAspectRatio: false,
      aspectRatio: 1.5,
      plugins: { ...chart.options.plugins, title: { display: true, text: modalTitle.textContent } }
    }
  });
  modal.fullscreenChart.update();
}

function closeModal() {
  const modal = document.getElementById('fullscreenModal');
  if (modal.fullscreenChart) { modal.fullscreenChart.destroy(); modal.fullscreenChart = null; }
  modal.classList.add('hidden');
}

function showNotification(message, type = 'info') {
  const notif = document.createElement('div'); notif.className = `notification ${type}`; notif.textContent = message;
  document.getElementById('notifications').appendChild(notif); setTimeout(() => notif.remove(), 3000);
}

function formatNumber(num) { return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','); }

function shadeColor(color, percent) { let [r, g, b] = color.match(/\w\w/g).map(x => parseInt(x, 16)); r = Math.max(0, Math.min(255, r + (r * percent / 100))); g = Math.max(0, Math.min(255, g + (g * percent / 100))); b = Math.max(0, Math.min(255, b + (b * percent / 100))); return `rgb(${r}, ${g}, ${b})`; }

function debounceEvent(id, event, callback, delay) {
  let timeout; document.getElementById(id).addEventListener(event, () => { clearTimeout(timeout); timeout = setTimeout(callback, delay); });
}

function initializeDarkMode() {
  const toggle = document.getElementById('darkModeToggle');
  toggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    toggle.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
    Object.values(charts).forEach(chart => chart.update());
  });
}

function saveChartAsImage(chart) {
  const link = document.createElement('a'); link.href = chart.toBase64Image(); link.download = `chart_${new Date().toISOString().split('T')[0]}.png`; document.body.appendChild(link); link.click(); document.body.removeChild(link);
  showNotification('Graphique sauvegardé avec succès!', 'success');
}
