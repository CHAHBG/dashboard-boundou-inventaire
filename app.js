// Dashboard EDL Post-Traitement - Application JavaScript

// Données EDL Post-Traitement (chargées depuis le fichier JSON)
const EDL_DATA = [
  {"commune": "Bala", "donnees_brutes": 912, "sans_doublons_attributaire_et_geometriqu": 907, "post_traitees": 842, "valideespar_urm_nicad": 0},
  {"commune": "Ballou", "donnees_brutes": 1551, "sans_doublons_attributaire_et_geometriqu": 659, "post_traitees": 1964, "valideespar_urm_nicad": 1294},
  {"commune": "Bandafassi", "donnees_brutes": 11731, "sans_doublons_attributaire_et_geometriqu": 3832, "post_traitees": 4121, "valideespar_urm_nicad": 2883},
  {"commune": "Bembou", "donnees_brutes": 5885, "sans_doublons_attributaire_et_geometriqu": 2083, "post_traitees": 2024, "valideespar_urm_nicad": 1805},
  {"commune": "Dimboli", "donnees_brutes": 6474, "sans_doublons_attributaire_et_geometriqu": 3075, "post_traitees": 3014, "valideespar_urm_nicad": 2852},
  {"commune": "Dindefello", "donnees_brutes": 5725, "sans_doublons_attributaire_et_geometriqu": 1845, "post_traitees": 2124, "valideespar_urm_nicad": 492},
  {"commune": "Fongolembi", "donnees_brutes": 5001, "sans_doublons_attributaire_et_geometriqu": 1542, "post_traitees": 1579, "valideespar_urm_nicad": 1374},
  {"commune": "Gabou", "donnees_brutes": 1999, "sans_doublons_attributaire_et_geometriqu": 947, "post_traitees": 1633, "valideespar_urm_nicad": 1609},
  {"commune": "Koar", "donnees_brutes": 101, "sans_doublons_attributaire_et_geometriqu": 93, "post_traitees": 92, "valideespar_urm_nicad": 0},
  {"commune": "Missirah", "donnees_brutes": 7371, "sans_doublons_attributaire_et_geometriqu": 5383, "post_traitees": 5905, "valideespar_urm_nicad": 3261},
  {"commune": "Moudery", "donnees_brutes": 1009, "sans_doublons_attributaire_et_geometriqu": 4973, "post_traitees": 1006, "valideespar_urm_nicad": 983},
  {"commune": "Ndoga Babacar", "donnees_brutes": 4759, "sans_doublons_attributaire_et_geometriqu": 2451, "post_traitees": 4035, "valideespar_urm_nicad": 2604},
  {"commune": "Netteboulou", "donnees_brutes": 3919, "sans_doublons_attributaire_et_geometriqu": 1775, "post_traitees": 2564, "valideespar_urm_nicad": 2026},
  {"commune": "Sinthiou Maleme", "donnees_brutes": 2449, "sans_doublons_attributaire_et_geometriqu": 1391, "post_traitees": 0, "valideespar_urm_nicad": 0},
  {"commune": "Tomboronkoto", "donnees_brutes": 56834, "sans_doublons_attributaire_et_geometriqu": 10674, "post_traitees": 9236, "valideespar_urm_nicad": 2330}
];

// Constantes de l'application
const QUARANTINE_PARCELS = 337; // Parcelles en quarantaine à Netteboulou
const COLORS = {
  primary: '#2E8B57',
  secondary: '#4682B4',
  accent: '#CD853F',
  success: '#228B22',
  warning: '#FF8C00',
  error: '#DC143C',
  info: '#1E90FF',
  chart: ['#2E8B57', '#4682B4', '#CD853F', '#228B22', '#FF8C00', '#DC143C', '#1E90FF', '#32CD32', '#FF6347', '#9370DB']
};

// Variables globales
let charts = {};
let filteredData = [...EDL_DATA];
let currentSort = { column: null, direction: 'asc' };
let currentPage = 1;
let rowsPerPage = 10;
let searchTerm = '';

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', function() {
  // Vérifier si Chart.js est chargé
  if (typeof Chart === 'undefined') {
    console.error('Chart.js n\'est pas chargé');
    setTimeout(() => window.location.reload(), 1000);
    return;
  }

  // Enregistrer les plugins Chart.js
  try {
    Chart.register(ChartZoom);
  } catch (error) {
    console.warn('Plugin ChartZoom non disponible:', error);
  }

  // Initialiser le dashboard
  initializeDashboard();
});

/**
 * Initialisation principale du dashboard
 */
function initializeDashboard() {
  try {
    // Traitement des données
    processData();
    
    // Initialisation des composants
    initializeFilters();
    initializeCharts();
    initializeTable();
    initializeTooltips();
    initializeModal();
    initializeEventHandlers();
    initializeDarkMode();
    initializeMobileMenu();
    
    // Mise à jour initiale
    updateAllComponents();
    
    // Mise à jour de la date
    updateLastUpdateTime();
    
    showNotification('Dashboard initialisé avec succès!', 'success');
    
  } catch (error) {
    console.error('Erreur lors de l\'initialisation:', error);
    showNotification('Erreur lors du chargement du dashboard', 'error');
  }
}

/**
 * Traitement et enrichissement des données
 */
function processData() {
  filteredData = EDL_DATA.filter(commune => commune.commune !== 'Total').map(commune => {
    // Calcul des taux
    const taux_dedoublonnage = commune.donnees_brutes > 0 ? 
      (commune.sans_doublons_attributaire_et_geometriqu / commune.donnees_brutes * 100) : 0;
    
    const taux_post_traitement = commune.sans_doublons_attributaire_et_geometriqu > 0 ? 
      (commune.post_traitees / commune.sans_doublons_attributaire_et_geometriqu * 100) : 0;
    
    const taux_validation = commune.post_traitees > 0 ? 
      (commune.valideespar_urm_nicad / commune.post_traitees * 100) : 0;

    // Ajout des quarantaines pour Netteboulou
    const sans_doublons_ajuste = commune.commune === 'Netteboulou' ? 
      commune.sans_doublons_attributaire_et_geometriqu - QUARANTINE_PARCELS : 
      commune.sans_doublons_attributaire_et_geometriqu;

    const quarantaines = commune.commune === 'Netteboulou' ? QUARANTINE_PARCELS : 0;

    return {
      ...commune,
      sans_doublons_ajuste,
      quarantaines,
      taux_dedoublonnage: Math.round(taux_dedoublonnage * 10) / 10,
      taux_post_traitement: Math.round(taux_post_traitement * 10) / 10,
      taux_validation: Math.round(taux_validation * 10) / 10
    };
  });
}

/**
 * Initialisation des filtres
 */
function initializeFilters() {
  const communeFilters = document.getElementById('communeFilters');
  const seuilSlider = document.getElementById('seuilFilter');
  const seuilValue = document.getElementById('seuilValue');

  // Création des checkboxes pour les communes
  if (communeFilters) {
    communeFilters.innerHTML = '';
    filteredData.forEach(commune => {
      const label = document.createElement('label');
      label.className = 'checkbox-label';
      label.innerHTML = `
        <input type="checkbox" name="commune" value="${commune.commune}">
        ${commune.commune}
      `;
      communeFilters.appendChild(label);
    });
  }

  // Événement pour le slider de seuil
  if (seuilSlider && seuilValue) {
    seuilSlider.addEventListener('input', () => {
      seuilValue.textContent = formatNumber(parseInt(seuilSlider.value));
    });
  }

  // Événements pour les boutons de filtrage
  const applyFiltersBtn = document.getElementById('applyFilters');
  const resetFiltersBtn = document.getElementById('resetFilters');

  if (applyFiltersBtn) {
    applyFiltersBtn.addEventListener('click', debounce(applyFilters, 300));
  }

  if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener('click', resetFilters);
  }
}

/**
 * Application des filtres
 */
function applyFilters() {
  const communeCheckboxes = document.querySelectorAll('input[name="commune"]:checked');
  const selectedCommunes = Array.from(communeCheckboxes).map(cb => cb.value);
  
  const seuilSlider = document.getElementById('seuilFilter');
  const performanceFilter = document.getElementById('performanceFilter');
  const quarantineFilter = document.getElementById('quarantineFilter');
  const noValidationFilter = document.getElementById('noValidationFilter');

  const seuil = seuilSlider ? parseInt(seuilSlider.value) : 0;
  const performance = performanceFilter ? performanceFilter.value : 'all';
  const showQuarantine = quarantineFilter ? quarantineFilter.checked : false;
  const showNoValidation = noValidationFilter ? noValidationFilter.checked : false;

  // Application des filtres
  const originalData = EDL_DATA.filter(commune => commune.commune !== 'Total').map(commune => {
    const taux_validation = commune.post_traitees > 0 ? 
      (commune.valideespar_urm_nicad / commune.post_traitees * 100) : 0;
    
    return {
      ...commune,
      taux_validation: Math.round(taux_validation * 10) / 10,
      quarantaines: commune.commune === 'Netteboulou' ? QUARANTINE_PARCELS : 0
    };
  });

  filteredData = originalData.filter(commune => {
    // Filtre par commune sélectionnée
    if (selectedCommunes.length > 0 && !selectedCommunes.includes(commune.commune)) {
      return false;
    }

    // Filtre par seuil de données brutes
    if (commune.donnees_brutes < seuil) {
      return false;
    }

    // Filtre par performance
    const taux = commune.taux_validation;
    switch (performance) {
      case 'high':
        if (taux <= 70) return false;
        break;
      case 'medium':
        if (taux < 30 || taux > 70) return false;
        break;
      case 'low':
        if (taux >= 30) return false;
        break;
      case 'zero':
        if (taux > 0) return false;
        break;
    }

    // Filtre par quarantaines
    if (showQuarantine && commune.quarantaines === 0) {
      return false;
    }

    // Filtre par absence de validation
    if (showNoValidation && commune.valideespar_urm_nicad > 0) {
      return false;
    }

    return true;
  });

  // Réinitialiser la pagination
  currentPage = 1;

  // Mettre à jour les composants
  updateAllComponents();

  showNotification(`Filtres appliqués - ${filteredData.length} commune(s) affichée(s)`, 'info');
}

/**
 * Réinitialisation des filtres
 */
function resetFilters() {
  // Décocher toutes les communes
  document.querySelectorAll('input[name="commune"]').forEach(cb => cb.checked = false);
  
  // Réinitialiser les autres filtres
  const seuilSlider = document.getElementById('seuilFilter');
  const seuilValue = document.getElementById('seuilValue');
  const performanceFilter = document.getElementById('performanceFilter');
  const quarantineFilter = document.getElementById('quarantineFilter');
  const noValidationFilter = document.getElementById('noValidationFilter');

  if (seuilSlider) seuilSlider.value = 0;
  if (seuilValue) seuilValue.textContent = '0';
  if (performanceFilter) performanceFilter.value = 'all';
  if (quarantineFilter) quarantineFilter.checked = false;
  if (noValidationFilter) noValidationFilter.checked = false;

  // Réinitialiser les données
  processData();
  currentPage = 1;
  searchTerm = '';

  // Vider la recherche
  const searchInput = document.getElementById('searchTable');
  if (searchInput) searchInput.value = '';

  updateAllComponents();
  showNotification('Filtres réinitialisés', 'info');
}

/**
 * Initialisation des graphiques
 */
function initializeCharts() {
  createPipelineChart();
  createCommunesChart();
  createValidationChart();
  createEfficaciteChart();
}

/**
 * Création du graphique de pipeline de traitement
 */
function createPipelineChart() {
  const canvas = document.getElementById('pipelineChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  
  // Détruire le graphique existant
  if (charts.pipeline) {
    charts.pipeline.destroy();
  }

  // Calcul des totaux
  const totals = filteredData.reduce((acc, commune) => ({
    brutes: acc.brutes + commune.donnees_brutes,
    sansDoublons: acc.sansDoublons + commune.sans_doublons_attributaire_et_geometriqu,
    postTraitees: acc.postTraitees + commune.post_traitees,
    validees: acc.validees + commune.valideespar_urm_nicad
  }), { brutes: 0, sansDoublons: 0, postTraitees: 0, validees: 0 });

  const data = [
    totals.brutes,
    totals.sansDoublons,
    totals.postTraitees,
    totals.validees
  ];

  charts.pipeline = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['📋 Données Brutes', '🔄 Sans Doublons', '⚙️ Post-traitées', '✅ Validées URM/NICAD'],
      datasets: [{
        label: 'Nombre de parcelles',
        data: data,
        backgroundColor: COLORS.chart.slice(0, 4),
        borderColor: COLORS.chart.slice(0, 4).map(color => darkenColor(color, 20)),
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 1000,
        easing: 'easeOutQuart'
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: 'white',
          bodyColor: 'white',
          borderColor: COLORS.primary,
          borderWidth: 1,
          cornerRadius: 8,
          callbacks: {
            label: function(context) {
              const percentage = data[0] > 0 ? (context.raw / data[0] * 100).toFixed(1) : '0';
              return `${formatNumber(context.raw)} parcelles (${percentage}%)`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(46, 139, 87, 0.1)'
          },
          ticks: {
            callback: function(value) {
              return formatNumber(value);
            }
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      }
    }
  });
}

/**
 * Création du graphique de comparaison par commune
 */
function createCommunesChart() {
  const canvas = document.getElementById('communesChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  
  if (charts.communes) {
    charts.communes.destroy();
  }

  const communes = filteredData.map(c => c.commune);
  const donneesData = filteredData.map(c => c.donnees_brutes);
  const sansDoublonsData = filteredData.map(c => c.sans_doublons_attributaire_et_geometriqu);
  const postTraiteesData = filteredData.map(c => c.post_traitees);
  const valideesData = filteredData.map(c => c.valideespar_urm_nicad);

  charts.communes = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: communes,
      datasets: [
        {
          label: '📋 Données Brutes',
          data: donneesData,
          backgroundColor: COLORS.chart[0] + '80',
          borderColor: COLORS.chart[0],
          borderWidth: 1
        },
        {
          label: '🔄 Sans Doublons',
          data: sansDoublonsData,
          backgroundColor: COLORS.chart[1] + '80',
          borderColor: COLORS.chart[1],
          borderWidth: 1
        },
        {
          label: '⚙️ Post-traitées',
          data: postTraiteesData,
          backgroundColor: COLORS.chart[2] + '80',
          borderColor: COLORS.chart[2],
          borderWidth: 1
        },
        {
          label: '✅ Validées',
          data: valideesData,
          backgroundColor: COLORS.chart[3] + '80',
          borderColor: COLORS.chart[3],
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 1000,
        easing: 'easeOutQuart'
      },
      plugins: {
        legend: {
          position: 'top'
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: 'white',
          bodyColor: 'white',
          borderColor: COLORS.primary,
          borderWidth: 1,
          cornerRadius: 8,
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: ${formatNumber(context.raw)}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          stacked: false,
          grid: {
            color: 'rgba(46, 139, 87, 0.1)'
          },
          ticks: {
            callback: function(value) {
              return formatNumber(value);
            }
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            maxRotation: 45
          }
        }
      }
    }
  });
}

/**
 * Création du graphique des taux de validation
 */
function createValidationChart() {
  const canvas = document.getElementById('validationChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  
  if (charts.validation) {
    charts.validation.destroy();
  }

  const communes = filteredData.map(c => c.commune);
  const tauxValidation = filteredData.map(c => c.taux_validation || 0);

  // Couleurs selon le taux de validation
  const backgroundColors = tauxValidation.map(taux => {
    if (taux >= 70) return COLORS.success + '80';
    if (taux >= 30) return COLORS.warning + '80';
    if (taux > 0) return COLORS.error + '80';
    return '#808080' + '80';
  });

  const borderColors = tauxValidation.map(taux => {
    if (taux >= 70) return COLORS.success;
    if (taux >= 30) return COLORS.warning;
    if (taux > 0) return COLORS.error;
    return '#808080';
  });

  charts.validation = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: communes,
      datasets: [{
        data: tauxValidation,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 2,
        hoverBorderWidth: 3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 1000,
        easing: 'easeOutQuart'
      },
      plugins: {
        legend: {
          position: 'right',
          labels: {
            generateLabels: function(chart) {
              const data = chart.data;
              return data.labels.map((label, i) => ({
                text: `${label}: ${data.datasets[0].data[i].toFixed(1)}%`,
                fillStyle: data.datasets[0].backgroundColor[i],
                strokeStyle: data.datasets[0].borderColor[i],
                lineWidth: 2,
                hidden: false,
                index: i
              }));
            }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: 'white',
          bodyColor: 'white',
          borderColor: COLORS.primary,
          borderWidth: 1,
          cornerRadius: 8,
          callbacks: {
            label: function(context) {
              return `${context.label}: ${context.raw.toFixed(1)}%`;
            }
          }
        }
      }
    }
  });
}

/**
 * Création du graphique d'efficacité du traitement
 */
function createEfficaciteChart() {
  const canvas = document.getElementById('efficaciteChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  
  if (charts.efficacite) {
    charts.efficacite.destroy();
  }

  const communes = filteredData.map(c => c.commune);
  const efficacite = filteredData.map(commune => {
    // Efficacité = (Validées / Données brutes) * 100
    return commune.donnees_brutes > 0 ? 
      (commune.valideespar_urm_nicad / commune.donnees_brutes * 100) : 0;
  });

  charts.efficacite = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: communes,
      datasets: [{
        label: 'Efficacité Globale (%)',
        data: efficacite,
        backgroundColor: COLORS.primary + '20',
        borderColor: COLORS.primary,
        borderWidth: 2,
        pointBackgroundColor: COLORS.primary,
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: COLORS.primary,
        pointRadius: 6,
        pointHoverRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 1000,
        easing: 'easeOutQuart'
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: 'white',
          bodyColor: 'white',
          borderColor: COLORS.primary,
          borderWidth: 1,
          cornerRadius: 8,
          callbacks: {
            label: function(context) {
              return `${context.label}: ${context.raw.toFixed(1)}%`;
            }
          }
        }
      },
      scales: {
        r: {
          angleLines: {
            color: 'rgba(46, 139, 87, 0.2)'
          },
          grid: {
            color: 'rgba(46, 139, 87, 0.2)'
          },
          pointLabels: {
            font: {
              size: 11
            }
          },
          ticks: {
            beginAtZero: true,
            max: 100,
            stepSize: 20,
            callback: function(value) {
              return value + '%';
            }
          }
        }
      }
    }
  });
}

/**
 * Mise à jour de tous les composants
 */
function updateAllComponents() {
  updateKPIs();
  updateCharts();
  updateTable();
}

/**
 * Mise à jour des KPIs
 */
function updateKPIs() {
  const totals = filteredData.reduce((acc, commune) => ({
    brutes: acc.brutes + commune.donnees_brutes,
    sansDoublons: acc.sansDoublons + commune.sans_doublons_attributaire_et_geometriqu,
    postTraitees: acc.postTraitees + commune.post_traitees,
    validees: acc.validees + commune.valideespar_urm_nicad
  }), { brutes: 0, sansDoublons: 0, postTraitees: 0, validees: 0 });

  // Calcul des taux
  const tauxDedoublonnage = totals.brutes > 0 ? (totals.sansDoublons / totals.brutes * 100) : 0;
  const tauxPostTraitement = totals.sansDoublons > 0 ? (totals.postTraitees / totals.sansDoublons * 100) : 0;
  const tauxValidation = totals.postTraitees > 0 ? (totals.validees / totals.postTraitees * 100) : 0;

  // Mise à jour des éléments DOM
  updateElement('kpi-brutes', formatNumber(totals.brutes));
  updateElement('kpi-communes', filteredData.length.toString());
  updateElement('kpi-dedoublonnage', `${tauxDedoublonnage.toFixed(1)}%`);
  updateElement('kpi-post-traitement', `${tauxPostTraitement.toFixed(1)}%`);
  updateElement('kpi-validation', `${tauxValidation.toFixed(1)}%`);
  updateElement('kpi-quarantaine', QUARANTINE_PARCELS.toString());
}

/**
 * Mise à jour des graphiques
 */
function updateCharts() {
  createPipelineChart();
  createCommunesChart();
  createValidationChart();
  createEfficaciteChart();
}

/**
 * Initialisation du tableau
 */
function initializeTable() {
  const searchInput = document.getElementById('searchTable');
  if (searchInput) {
    searchInput.addEventListener('input', debounce(() => {
      searchTerm = searchInput.value.toLowerCase();
      currentPage = 1;
      updateTable();
    }, 300));
  }

  // Événements de tri
  document.querySelectorAll('.sortable').forEach(header => {
    header.addEventListener('click', () => {
      sortTable(header.dataset.column);
    });
  });

  // Événements de pagination
  const prevBtn = document.getElementById('prevPage');
  const nextBtn = document.getElementById('nextPage');

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        updateTable();
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const totalPages = Math.ceil(getFilteredTableData().length / rowsPerPage);
      if (currentPage < totalPages) {
        currentPage++;
        updateTable();
      }
    });
  }

  updateTable();
}

/**
 * Obtention des données filtrées pour le tableau
 */
function getFilteredTableData() {
  if (!searchTerm) return filteredData;
  
  return filteredData.filter(commune => {
    return Object.values(commune).some(value => 
      value.toString().toLowerCase().includes(searchTerm)
    );
  });
}

/**
 * Tri du tableau
 */
function sortTable(column) {
  const direction = (currentSort.column === column && currentSort.direction === 'asc') ? 'desc' : 'asc';
  
  // Mise à jour visuelle des en-têtes
  document.querySelectorAll('.sortable').forEach(header => {
    header.classList.remove('asc', 'desc');
  });
  
  const currentHeader = document.querySelector(`[data-column="${column}"]`);
  if (currentHeader) {
    currentHeader.classList.add(direction);
  }

  // Tri des données
  filteredData.sort((a, b) => {
    let aValue = a[column];
    let bValue = b[column];

    // Conversion en nombre si possible
    if (!isNaN(aValue) && !isNaN(bValue)) {
      aValue = parseFloat(aValue);
      bValue = parseFloat(bValue);
    }

    if (direction === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  currentSort = { column, direction };
  updateTable();
  
  showNotification(`Tableau trié par ${column} (${direction === 'asc' ? 'croissant' : 'décroissant'})`, 'info');
}

/**
 * Mise à jour du tableau
 */
function updateTable() {
  const tableBody = document.getElementById('tableBody');
  if (!tableBody) return;

  const tableData = getFilteredTableData();
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentData = tableData.slice(startIndex, endIndex);

  // Génération des lignes du tableau
  tableBody.innerHTML = currentData.map(commune => {
    const tauxValidationClass = getPerformanceClass(commune.taux_validation);
    const quarantaineDisplay = commune.quarantaines > 0 ? 
      `<span class="quarantine-indicator">${commune.quarantaines}</span>` : 
      commune.quarantaines;

    return `
      <tr>
        <td><strong>${commune.commune}</strong></td>
        <td>${formatNumber(commune.donnees_brutes)}</td>
        <td>${formatNumber(commune.sans_doublons_attributaire_et_geometriqu)}</td>
        <td>${formatNumber(commune.post_traitees)}</td>
        <td>${formatNumber(commune.valideespar_urm_nicad)}</td>
        <td><span class="taux-performance ${getPerformanceClass(commune.taux_dedoublonnage)}">${commune.taux_dedoublonnage}%</span></td>
        <td><span class="taux-performance ${tauxValidationClass}">${commune.taux_validation}%</span></td>
        <td>${quarantaineDisplay}</td>
      </tr>
    `;
  }).join('');

  // Mise à jour de l'info de pagination
  updatePaginationInfo(tableData.length, startIndex, Math.min(endIndex, tableData.length));
  
  // Mise à jour des contrôles de pagination
  updatePaginationControls(tableData.length);
}

/**
 * Classification de performance selon le taux
 */
function getPerformanceClass(taux) {
  if (taux >= 70) return 'high';
  if (taux >= 30) return 'medium';
  if (taux > 0) return 'low';
  return 'zero';
}

/**
 * Mise à jour de l'information de pagination
 */
function updatePaginationInfo(total, start, end) {
  const paginationInfo = document.getElementById('paginationInfo');
  if (paginationInfo) {
    paginationInfo.textContent = `Affichage de ${start + 1} à ${end} sur ${total} entrées`;
  }
}

/**
 * Mise à jour des contrôles de pagination
 */
function updatePaginationControls(totalItems) {
  const totalPages = Math.ceil(totalItems / rowsPerPage);
  const pageNumbers = document.getElementById('pageNumbers');
  const prevBtn = document.getElementById('prevPage');
  const nextBtn = document.getElementById('nextPage');

  // Mise à jour des boutons précédent/suivant
  if (prevBtn) prevBtn.disabled = currentPage <= 1;
  if (nextBtn) nextBtn.disabled = currentPage >= totalPages;

  // Génération des numéros de page
  if (pageNumbers) {
    pageNumbers.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
      const button = document.createElement('button');
      button.className = `page-btn ${i === currentPage ? 'active' : ''}`;
      button.textContent = i;
      button.addEventListener('click', () => {
        currentPage = i;
        updateTable();
      });
      pageNumbers.appendChild(button);
    }
  }
}

/**
 * Initialisation des tooltips
 */
function initializeTooltips() {
  const tooltip = document.getElementById('tooltip');
  if (!tooltip) return;

  document.querySelectorAll('[data-tooltip]').forEach(element => {
    element.addEventListener('mouseenter', (e) => {
      showTooltip(e, element.dataset.tooltip);
    });
    
    element.addEventListener('mouseleave', hideTooltip);
    element.addEventListener('mousemove', updateTooltipPosition);
  });
}

/**
 * Affichage du tooltip
 */
function showTooltip(e, text) {
  const tooltip = document.getElementById('tooltip');
  if (!tooltip) return;
  
  tooltip.textContent = text;
  tooltip.classList.remove('hidden');
  updateTooltipPosition(e);
}

/**
 * Masquage du tooltip
 */
function hideTooltip() {
  const tooltip = document.getElementById('tooltip');
  if (tooltip) {
    tooltip.classList.add('hidden');
  }
}

/**
 * Mise à jour de la position du tooltip
 */
function updateTooltipPosition(e) {
  const tooltip = document.getElementById('tooltip');
  if (!tooltip) return;

  const rect = tooltip.getBoundingClientRect();
  tooltip.style.left = `${e.clientX + 10}px`;
  tooltip.style.top = `${e.clientY - rect.height - 10}px`;
}

/**
 * Initialisation de la modal
 */
function initializeModal() {
  const modal = document.getElementById('fullscreenModal');
  const closeBtn = document.getElementById('closeModal');
  const overlay = document.querySelector('.modal-overlay');

  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  if (overlay) {
    overlay.addEventListener('click', closeModal);
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  // Fermeture avec Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}

/**
 * Ouverture de la modal en plein écran
 */
function openFullscreenChart(chartInstance, title) {
  const modal = document.getElementById('fullscreenModal');
  const modalTitle = document.getElementById('modalTitle');
  const fullscreenCanvas = document.getElementById('fullscreenChart');

  if (!modal || !modalTitle || !fullscreenCanvas) return;

  // Nettoyer le graphique existant
  if (modal.fullscreenChart) {
    modal.fullscreenChart.destroy();
    modal.fullscreenChart = null;
  }

  modalTitle.textContent = title || 'Graphique en Plein Écran';
  modal.classList.remove('hidden');

  // Créer le nouveau graphique
  setTimeout(() => {
    const ctx = fullscreenCanvas.getContext('2d');
    modal.fullscreenChart = new Chart(ctx, {
      type: chartInstance.config.type,
      data: JSON.parse(JSON.stringify(chartInstance.data)),
      options: {
        ...chartInstance.options,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          ...chartInstance.options.plugins,
          title: {
            display: true,
            text: title,
            font: {
              size: 18,
              weight: 'bold'
            },
            padding: 20
          }
        }
      }
    });
  }, 100);
}

/**
 * Fermeture de la modal
 */
function closeModal() {
  const modal = document.getElementById('fullscreenModal');
  if (!modal) return;

  // Nettoyer le graphique
  if (modal.fullscreenChart) {
    modal.fullscreenChart.destroy();
    modal.fullscreenChart = null;
  }

  modal.classList.add('hidden');
}

/**
 * Initialisation des gestionnaires d'événements
 */
function initializeEventHandlers() {
  // Gestionnaire pour les boutons de contrôle des graphiques
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('chart-btn')) {
      handleChartButtonClick(e.target);
    }
  });

  // Gestionnaire pour l'export CSV
  const exportBtn = document.getElementById('exportBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', exportToCSV);
  }

  // Gestionnaire pour l'actualisation
  const refreshBtn = document.getElementById('refreshBtn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      processData();
      updateAllComponents();
      showNotification('Données actualisées!', 'success');
    });
  }
}

/**
 * Gestion des clics sur les boutons de contrôle des graphiques
 */
function handleChartButtonClick(button) {
  const action = button.dataset.action;
  const chartType = button.dataset.chart;
  const chart = charts[chartType];

  if (!chart) return;

  switch (action) {
    case 'zoom-in':
      if (chart.zoom) chart.zoom(1.2);
      break;
    case 'zoom-out':
      if (chart.zoom) chart.zoom(0.8);
      break;
    case 'reset-zoom':
      if (chart.resetZoom) chart.resetZoom();
      break;
    case 'fullscreen':
      const chartTitles = {
        pipeline: '🔄 Pipeline de Traitement des Données',
        communes: '🏘️ Performance par Commune',
        validation: '🎯 Taux de Validation URM/NICAD',
        efficacite: '⚡ Efficacité du Traitement'
      };
      openFullscreenChart(chart, chartTitles[chartType]);
      break;
    case 'save-image':
      saveChartAsImage(chart, chartType);
      break;
  }
}

/**
 * Sauvegarde d'un graphique comme image
 */
function saveChartAsImage(chart, chartType) {
  try {
    const link = document.createElement('a');
    link.href = chart.toBase64Image('image/png', 1.0);
    link.download = `EDL_${chartType}_${new Date().toISOString().split('T')[0]}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Graphique sauvegardé avec succès!', 'success');
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
    showNotification('Erreur lors de la sauvegarde du graphique', 'error');
  }
}

/**
 * Export des données en CSV
 */
function exportToCSV() {
  try {
    const headers = [
      'Commune',
      'Données Brutes',
      'Sans Doublons',
      'Post-traitées', 
      'Validées URM/NICAD',
      'Taux Dédoublonnage (%)',
      'Taux Post-traitement (%)',
      'Taux Validation (%)',
      'Quarantaines'
    ];

    const csvData = filteredData.map(commune => [
      commune.commune,
      commune.donnees_brutes,
      commune.sans_doublons_attributaire_et_geometriqu,
      commune.post_traitees,
      commune.valideespar_urm_nicad,
      commune.taux_dedoublonnage.toFixed(1),
      commune.taux_post_traitement.toFixed(1),
      commune.taux_validation.toFixed(1),
      commune.quarantaines
    ]);

    const csv = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const link = document.createElement('a');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    link.href = URL.createObjectURL(blob);
    link.download = `EDL_PostTraitement_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showNotification('Données exportées avec succès!', 'success');
  } catch (error) {
    console.error('Erreur lors de l\'export:', error);
    showNotification('Erreur lors de l\'export des données', 'error');
  }
}

/**
 * Initialisation du mode sombre
 */
function initializeDarkMode() {
  const toggle = document.getElementById('darkModeToggle');
  if (!toggle) return;

  // Charger la préférence sauvegardée ou utiliser la préférence système
  const savedMode = localStorage.getItem('darkMode');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const shouldUseDark = savedMode === 'true' || (savedMode === null && systemPrefersDark);

  if (shouldUseDark) {
    document.body.classList.add('dark-mode');
    toggle.textContent = '☀️';
  }

  toggle.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark-mode');
    toggle.textContent = isDark ? '☀️' : '🌙';
    localStorage.setItem('darkMode', isDark.toString());

    // Mettre à jour les graphiques pour s'adapter au nouveau thème
    setTimeout(() => {
      Object.values(charts).forEach(chart => {
        if (chart && chart.update) chart.update();
      });
    }, 100);

    showNotification(`Mode ${isDark ? 'sombre' : 'clair'} activé`, 'info');
  });
}

/**
 * Initialisation du menu mobile
 */
function initializeMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const sidebar = document.querySelector('.sidebar');

  if (!hamburger || !sidebar) return;

  hamburger.addEventListener('click', () => {
    sidebar.classList.toggle('open');
  });

  // Fermer le menu en cliquant à l'extérieur
  document.addEventListener('click', (e) => {
    if (!sidebar.contains(e.target) && !hamburger.contains(e.target)) {
      sidebar.classList.remove('open');
    }
  });
}

/**
 * Affichage des notifications
 */
function showNotification(message, type = 'info', duration = 3000) {
  const notificationsContainer = document.getElementById('notifications');
  if (!notificationsContainer) return;

  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;

  notificationsContainer.appendChild(notification);

  // Animation d'entrée
  setTimeout(() => {
    notification.style.opacity = '1';
    notification.style.transform = 'translateX(0)';
  }, 10);

  // Suppression automatique
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, duration);
}

/**
 * Mise à jour de l'heure de dernière actualisation
 */
function updateLastUpdateTime() {
  const lastUpdateElement = document.getElementById('lastUpdate');
  if (lastUpdateElement) {
    const now = new Date();
    const dateStr = now.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const timeStr = now.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
    lastUpdateElement.textContent = `${dateStr} à ${timeStr}`;
  }
}

/**
 * Mise à jour d'un élément DOM
 */
function updateElement(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = value;
  }
}

/**
 * Formatage des nombres avec séparateurs de milliers
 */
function formatNumber(num) {
  if (num === null || num === undefined) return '0';
  return parseInt(num).toLocaleString('fr-FR');
}

/**
 * Assombrissement d'une couleur
 */
function darkenColor(color, percent) {
  // Conversion hex vers RGB
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Assombrissement
  const newR = Math.max(0, Math.floor(r * (1 - percent / 100)));
  const newG = Math.max(0, Math.floor(g * (1 - percent / 100)));
  const newB = Math.max(0, Math.floor(b * (1 - percent / 100)));

  // Conversion RGB vers hex
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

/**
 * Fonction de debounce pour limiter les appels répétés
 */
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

/**
 * Détection des changements de données (pour mise à jour automatique)
 */
function setupAutoRefresh() {
  // Vérifier les changements toutes les 30 secondes (à adapter selon vos besoins)
  setInterval(() => {
    // Ici vous pourriez implémenter la logique pour recharger le fichier JSON
    // Par exemple, via fetch() si le fichier est accessible via HTTP
    checkForDataUpdates();
  }, 30000);
}

/**
 * Vérification des mises à jour de données
 */
function checkForDataUpdates() {
  // Cette fonction peut être implémentée pour vérifier
  // si le fichier EDL_PostTraitement.json a été mis à jour
  // et recharger les données automatiquement
  
  // Exemple d'implémentation :
  /*
  fetch('EDL_PostTraitement.json')
    .then(response => response.json())
    .then(newData => {
      if (JSON.stringify(newData) !== JSON.stringify(EDL_DATA)) {
        // Données mises à jour détectées
        EDL_DATA = newData;
        processData();
        updateAllComponents();
        updateLastUpdateTime();
        showNotification('Nouvelles données détectées et chargées!', 'success');
      }
    })
    .catch(error => {
      console.warn('Impossible de vérifier les mises à jour:', error);
    });
  */
}

/**
 * Gestion des erreurs globales
 */
window.addEventListener('error', (e) => {
  console.error('Erreur globale:', e.error);
  showNotification('Une erreur inattendue s\'est produite', 'error');
});

/**
 * Gestion des promesses rejetées
 */
window.addEventListener('unhandledrejection', (e) => {
  console.error('Promesse rejetée:', e.reason);
  showNotification('Erreur de traitement des données', 'error');
});

/**
 * Nettoyage lors du déchargement de la page
 */
window.addEventListener('beforeunload', () => {
  // Nettoyer les graphiques
  Object.values(charts).forEach(chart => {
    if (chart && chart.destroy) {
      chart.destroy();
    }
  });
});

// Démarrage de l'actualisation automatique (optionnel)
// setupAutoRefresh();
