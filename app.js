// app.js
// PROCASEF Dashboard - Advanced Analytics Engine
class PROCASEFDashboard {
    constructor() {
        // Data will be loaded from JSON file
        this.rawData = [];
        this.processedData = [];
        this.filteredData = [];
        this.dataFilePath = './EDL_PostTraitement.json'; // Path to JSON file
        this.charts = {};
        this.modalChartInstance = null;
        this.filters = {
            communes: [],
            seuil: 0,
            performance: 'all'
        };

        // Pagination & Search
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.searchTerm = '';
        this.sortConfig = { key: null, direction: 'asc' };

        // Constants
        this.PROCASEF_COLORS = {
            primary: '#0072BC',
            secondary: '#00A651', 
            accent: '#F47920',
            danger: '#E31E24',
            navy: '#1B365D',
            lightBlue: '#4A90A4',
            gold: '#FFB81C',
            success: '#10B981',
            warning: '#F59E0B',
            error: '#EF4444',
            info: '#3B82F6'
        };

        this.init();
    }

    // Initialize dashboard
    async init() {
        try {
            this.showLoading(true);
            
            // Load data from JSON file
            await this.loadDataFromJSON();
            
            // Process data with advanced analytics
            this.processData();
            
            // Initialize UI components
            this.initializeFilters();
            this.initializeEventListeners();
            this.initializeCharts();
            this.renderTable();
            this.updateKPIs();
            this.updateQuickStats();
            
            // Setup auto-refresh
            this.setupAutoRefresh();
            
            this.showLoading(false);
            this.showNotification('Dashboard chargé avec succès', 'success');
            
            // Update timestamp
            this.updateTimestamp();
            
        } catch (error) {
            console.error('Erreur lors de l\'initialisation:', error);
            this.showNotification(`Erreur lors du chargement: ${error.message}`, 'error');
            this.showLoading(false);
        }
    }

    // Load data from JSON file
    async loadDataFromJSON() {
        try {
            console.log('🔄 Chargement des données depuis:', this.dataFilePath);
            
            const response = await fetch(this.dataFilePath);
            
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Validate data structure
            if (!Array.isArray(data)) {
                throw new Error('Le fichier JSON doit contenir un tableau de données');
            }
            
            // Filter out "Total" entries if present
            this.rawData = data.filter(item => item.commune && item.commune !== 'Total');
            
            if (this.rawData.length === 0) {
                throw new Error('Aucune donnée valide trouvée dans le fichier JSON');
            }
            
            console.log(`✅ ${this.rawData.length} communes chargées avec succès`);
            
            // Validate required fields
            const requiredFields = [
                'commune', 
                'donnees_brutes', 
                'sans_doublons_attributaire_et_geometriqu', 
                'post_traitees', 
                'valideespar_urm_nicad'
            ];
            
            const isValidData = this.rawData.every(item => 
                requiredFields.every(field => field in item)
            );
            
            if (!isValidData) {
                throw new Error('Structure de données invalide. Champs requis: ' + requiredFields.join(', '));
            }
            
        } catch (error) {
            console.error('❌ Erreur lors du chargement des données:', error);
            
            // Fallback: use hardcoded data if JSON fails
            console.log('🔄 Utilisation des données de secours...');
            this.rawData = [
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
            
            this.showNotification('Données de secours chargées - Vérifiez le fichier JSON', 'warning');
        }
    }

    // Check if JSON file has been updated
    async checkForUpdates() {
        try {
            const response = await fetch(this.dataFilePath, { 
                method: 'HEAD',
                cache: 'no-cache'
            });
            
            if (response.ok) {
                const lastModified = response.headers.get('Last-Modified');
                const currentModified = this.lastModified;
                
                if (lastModified && currentModified && lastModified !== currentModified) {
                    console.log('🔄 Nouvelles données détectées, rechargement...');
                    this.lastModified = lastModified;
                    await this.loadDataFromJSON();
                    this.processData();
                    this.updateAllComponents();
                    this.updateTimestamp();
                    this.showNotification('Données mises à jour automatiquement', 'success');
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.log('⚠️ Impossible de vérifier les mises à jour:', error.message);
            return false;
        }
    }

    // Advanced data processing with calculated metrics
    processData() {
        this.processedData = this.rawData.map(commune => {
            // Calculate advanced metrics
            const dedoublonnageRate = commune.donnees_brutes > 0 ? 
                (commune.sans_doublons_attributaire_et_geometriqu / commune.donnees_brutes) * 100 : 0;
            
            const postTraitementRate = commune.sans_doublons_attributaire_et_geometriqu > 0 ? 
                (commune.post_traitees / commune.sans_doublons_attributaire_et_geometriqu) * 100 : 0;
            
            const validationRate = commune.post_traitees > 0 ? 
                (commune.valideespar_urm_nicad / commune.post_traitees) * 100 : 0;
            
            const globalEfficiency = commune.donnees_brutes > 0 ? 
                (commune.valideespar_urm_nicad / commune.donnees_brutes) * 100 : 0;
            
            // Data quality score (weighted average)
            const qualityScore = (dedoublonnageRate * 0.2) + (postTraitementRate * 0.3) + (validationRate * 0.5);
            
            // Performance classification
            let performanceLevel = 'zero';
            if (validationRate >= 80) performanceLevel = 'excellent';
            else if (validationRate >= 60) performanceLevel = 'good';
            else if (validationRate >= 30) performanceLevel = 'average';
            else if (validationRate > 0) performanceLevel = 'poor';
            
            // Data loss at each step
            const perte1 = commune.donnees_brutes - commune.sans_doublons_attributaire_et_geometriqu;
            const perte2 = commune.sans_doublons_attributaire_et_geometriqu - commune.post_traitees;
            const perte3 = commune.post_traitees - commune.valideespar_urm_nicad;
            
            return {
                ...commune,
                // Rates
                dedoublonnageRate: Math.round(dedoublonnageRate * 10) / 10,
                postTraitementRate: Math.round(postTraitementRate * 10) / 10,
                validationRate: Math.round(validationRate * 10) / 10,
                globalEfficiency: Math.round(globalEfficiency * 10) / 10,
                qualityScore: Math.round(qualityScore * 10) / 10,
                // Performance
                performanceLevel,
                // Data loss
                perte1, perte2, perte3,
                totalPerte: perte1 + perte2 + perte3,
                // Additional metrics
                retentionRate: commune.donnees_brutes > 0 ? 
                    Math.round((commune.valideespar_urm_nicad / commune.donnees_brutes) * 1000) / 10 : 0
            };
        });

        this.filteredData = [...this.processedData];
        this.applyFilters();
    }

    // Initialize filter components
    initializeFilters() {
        const communesContainer = document.getElementById('communesFilter');
        if (communesContainer) {
            const communes = [...new Set(this.processedData.map(d => d.commune))].sort();
            communesContainer.innerHTML = communes.map(commune => `
                <label class="commune-option">
                    <input type="checkbox" value="${commune}" class="commune-checkbox">
                    <span>${commune}</span>
                </label>
            `).join('');
        }

        // Range slider setup
        const seuilRange = document.getElementById('seuilRange');
        const seuilValue = document.getElementById('seuilValue');
        
        if (seuilRange && seuilValue) {
            const maxValue = Math.max(...this.processedData.map(d => d.donnees_brutes));
            seuilRange.max = maxValue;
            
            seuilRange.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                seuilValue.textContent = this.formatNumber(value);
                this.filters.seuil = value;
            });
        }
    }

    // Event listeners setup
    initializeEventListeners() {
        // Theme toggle
        document.getElementById('themeToggle')?.addEventListener('click', () => {
            this.toggleTheme();
        });

        // Sidebar toggle
        document.getElementById('sidebarToggle')?.addEventListener('click', () => {
            document.getElementById('sidebar')?.classList.toggle('collapsed');
        });

        // Filter controls
        document.getElementById('applyFilters')?.addEventListener('click', () => {
            this.applyFilters();
        });

        document.getElementById('resetFilters')?.addEventListener('click', () => {
            this.resetFilters();
        });

        // Performance filter
        document.getElementById('performanceFilter')?.addEventListener('change', (e) => {
            this.filters.performance = e.target.value;
        });

        // Search functionality with debounce
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            const debouncedSearch = this.debounce((value) => {
                this.searchTerm = value.toLowerCase();
                this.currentPage = 1;
                this.renderTable();
            }, 300);
            searchInput.addEventListener('input', (e) => debouncedSearch(e.target.value));
        }

        // Export buttons
        document.getElementById('exportBtn')?.addEventListener('click', () => {
            this.exportToExcel();
        });

        document.getElementById('tableExport')?.addEventListener('click', () => {
            this.exportTableData();
        });

        // Refresh button
        document.getElementById('refreshBtn')?.addEventListener('click', () => {
            this.refreshData();
        });

        // Table sorting
        document.querySelectorAll('[data-sort]').forEach(header => {
            header.addEventListener('click', () => {
                this.sortTable(header.dataset.sort);
            });
        });

        // Pagination
        document.getElementById('prevPage')?.addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.renderTable();
            }
        });

        document.getElementById('nextPage')?.addEventListener('click', () => {
            const maxPage = Math.ceil(this.getFilteredTableData().length / this.itemsPerPage);
            if (this.currentPage < maxPage) {
                this.currentPage++;
                this.renderTable();
            }
        });

        // Chart actions
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-action]')) {
                this.handleChartAction(e.target.dataset.action, e.target.dataset.chart);
            }
        });

        // KPI card interactions
        document.querySelectorAll('[data-kpi]').forEach(card => {
            card.addEventListener('click', () => {
                this.highlightKPIRelatedData(card.dataset.kpi);
            });
        });
    }

    // Apply filters to data
    applyFilters() {
        const selectedCommunes = Array.from(document.querySelectorAll('.commune-checkbox:checked'))
            .map(cb => cb.value);

        this.filters.communes = selectedCommunes;

        this.filteredData = this.processedData.filter(commune => {
            // Commune filter
            if (selectedCommunes.length > 0 && !selectedCommunes.includes(commune.commune)) {
                return false;
            }

            // Seuil filter
            if (commune.donnees_brutes < this.filters.seuil) {
                return false;
            }

            // Performance filter
            if (this.filters.performance !== 'all' && commune.performanceLevel !== this.filters.performance) {
                return false;
            }

            return true;
        });

        this.currentPage = 1;
        this.updateAllComponents();
        
        this.showNotification(
            `Filtres appliqués - ${this.filteredData.length} commune(s) affichée(s)`, 
            'info'
        );
    }

    // Reset all filters
    resetFilters() {
        document.querySelectorAll('.commune-checkbox').forEach(cb => cb.checked = false);
        document.getElementById('seuilRange').value = 0;
        document.getElementById('seuilValue').textContent = '0';
        document.getElementById('performanceFilter').value = 'all';

        this.filters = { communes: [], seuil: 0, performance: 'all' };
        this.searchTerm = '';
        document.getElementById('searchInput').value = '';
        
        this.filteredData = [...this.processedData];
        this.currentPage = 1;
        this.updateAllComponents();
        
        this.showNotification('Filtres réinitialisés', 'info');
    }

    // Update all dashboard components
    updateAllComponents() {
        this.updateKPIs();
        this.updateQuickStats();
        this.updateCharts();
        this.renderTable();
    }

    // Calculate and update KPIs
    updateKPIs() {
        const totals = this.filteredData.reduce((acc, commune) => ({
            brutes: acc.brutes + commune.donnees_brutes,
            sansDoublons: acc.sansDoublons + commune.sans_doublons_attributaire_et_geometriqu,
            postTraitees: acc.postTraitees + commune.post_traitees,
            validees: acc.validees + commune.valideespar_urm_nicad
        }), { brutes: 0, sansDoublons: 0, postTraitees: 0, validees: 0 });

        // Pipeline efficiency
        const pipelineEfficiency = totals.brutes > 0 ? 
            Math.round((totals.validees / totals.brutes) * 1000) / 10 : 0;

        // Quality score (average of all commune quality scores)
        const avgQuality = this.filteredData.length > 0 ? 
            Math.round(this.filteredData.reduce((sum, c) => sum + c.qualityScore, 0) / this.filteredData.length * 10) / 10 : 0;

        // Validation rate
        const validationRate = totals.postTraitees > 0 ? 
            Math.round((totals.validees / totals.postTraitees) * 1000) / 10 : 0;

        // Coverage rate (communes with data vs total communes)
        const coverageRate = Math.round((this.filteredData.length / this.processedData.length) * 1000) / 10;

        // Update DOM elements
        this.updateElement('pipelineEfficiency', `${pipelineEfficiency}%`);
        this.updateElement('qualityScore', `${avgQuality}%`);
        this.updateElement('validationRate', `${validationRate}%`);
        this.updateElement('coverageRate', `${coverageRate}%`);

        // Update header stats
        this.updateElement('totalData', this.formatNumber(totals.brutes));
        this.updateElement('validatedData', this.formatNumber(totals.validees));
        this.updateElement('totalCommunes', this.filteredData.length);

        // Update progress bars
        this.updateProgress('pipelineProgress', pipelineEfficiency);
        this.updateProgress('qualityProgress', avgQuality);
        this.updateProgress('validationProgress', validationRate);
        this.updateProgress('coverageProgress', coverageRate);
    }

    // Update quick stats in sidebar
    updateQuickStats() {
        if (this.filteredData.length === 0) return;

        const avgEfficiency = Math.round(
            this.filteredData.reduce((sum, c) => sum + c.globalEfficiency, 0) / this.filteredData.length * 10
        ) / 10;

        const topCommune = this.filteredData.reduce((best, current) => 
            current.globalEfficiency > best.globalEfficiency ? current : best
        );

        const totalParcels = this.filteredData.reduce((sum, c) => sum + c.donnees_brutes, 0);

        this.updateElement('avgEfficiency', `${avgEfficiency}%`);
        this.updateElement('topCommune', topCommune.commune);
        this.updateElement('totalParcels', this.formatNumber(totalParcels));
    }

    // Initialize all charts
    initializeCharts() {
        this.createPipelineChart();
        this.createPerformanceChart();
        this.createValidationChart();
        this.createEfficiencyChart();
    }

    // Update all charts
    updateCharts() {
        Object.keys(this.charts).forEach(chartKey => {
            if (this.charts[chartKey]) {
                this.charts[chartKey].destroy();
            }
        });
        this.initializeCharts();
    }

    // Pipeline funnel chart
    createPipelineChart() {
        const ctx = document.getElementById('pipelineChart');
        if (!ctx) return;

        if (this.charts.pipeline) {
            this.charts.pipeline.destroy();
        }

        const totals = this.filteredData.reduce((acc, commune) => ({
            brutes: acc.brutes + commune.donnees_brutes,
            sansDoublons: acc.sansDoublons + commune.sans_doublons_attributaire_et_geometriqu,
            postTraitees: acc.postTraitees + commune.post_traitees,
            validees: acc.validees + commune.valideespar_urm_nicad
        }), { brutes: 0, sansDoublons: 0, postTraitees: 0, validees: 0 });

        this.charts.pipeline = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Données Collectées', 'Sans Doublons', 'Post-traitées', 'Validées URM/NICAD'],
                datasets: [{
                    label: 'Nombre de parcelles',
                    data: [totals.brutes, totals.sansDoublons, totals.postTraitees, totals.validees],
                    backgroundColor: [
                        this.PROCASEF_COLORS.info,
                        this.PROCASEF_COLORS.primary,
                        this.PROCASEF_COLORS.warning,
                        this.PROCASEF_COLORS.success
                    ],
                    borderRadius: 8,
                    borderSkipped: false,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: this.PROCASEF_COLORS.primary,
                        borderWidth: 1,
                        cornerRadius: 8,
                        callbacks: {
                            label: (context) => {
                                const percentage = totals.brutes > 0 ? 
                                    ((context.raw / totals.brutes) * 100).toFixed(1) : 0;
                                return `${this.formatNumber(context.raw)} parcelles (${percentage}%)`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => this.formatNumber(value)
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: { display: false }
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeOutQuart'
                }
            }
        });
    }

    // Performance comparison chart
    createPerformanceChart() {
        const ctx = document.getElementById('performanceChart');
        if (!ctx) return;

        if (this.charts.performance) {
            this.charts.performance.destroy();
        }

        const data = this.filteredData.slice(0, 10); // Top 10 communes
        const communes = data.map(d => d.commune);
        const efficiency = data.map(d => d.globalEfficiency);
        const validation = data.map(d => d.validationRate);

        this.charts.performance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: communes,
                datasets: [
                    {
                        label: 'Efficacité Globale (%)',
                        data: efficiency,
                        backgroundColor: this.PROCASEF_COLORS.primary + '80',
                        borderColor: this.PROCASEF_COLORS.primary,
                        borderWidth: 2
                    },
                    {
                        label: 'Taux Validation (%)',
                        data: validation,
                        backgroundColor: this.PROCASEF_COLORS.success + '80',
                        borderColor: this.PROCASEF_COLORS.success,
                        borderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    legend: {
                        position: 'top'
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                        titleColor: '#fff',
                        bodyColor: '#fff'
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: {
                            maxRotation: 45
                        }
                    },
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: (value) => value + '%'
                        }
                    }
                }
            }
        });
    }

    // Validation distribution pie chart
    createValidationChart() {
        const ctx = document.getElementById('validationChart');
        if (!ctx) return;

        if (this.charts.validation) {
            this.charts.validation.destroy();
        }

        // Store commune names for each performance group
        const performanceGroups = {
            'Excellent (≥80%)': this.filteredData.filter(d => d.validationRate >= 80),
            'Bon (60-80%)': this.filteredData.filter(d => d.validationRate >= 60 && d.validationRate < 80),
            'Moyen (30-60%)': this.filteredData.filter(d => d.validationRate >= 30 && d.validationRate < 60),
            'Faible (<30%)': this.filteredData.filter(d => d.validationRate > 0 && d.validationRate < 30),
            'Aucune validation': this.filteredData.filter(d => d.validationRate === 0)
        };

        // Extract counts and commune names for chart data
        const counts = Object.values(performanceGroups).map(group => group.length);
        const communeNames = Object.values(performanceGroups).map(group => group.map(d => d.commune));

        this.charts.validation = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(performanceGroups),
                datasets: [{
                    data: counts,
                    backgroundColor: [
                        this.PROCASEF_COLORS.success,
                        this.PROCASEF_COLORS.primary,
                        this.PROCASEF_COLORS.warning,
                        this.PROCASEF_COLORS.accent,
                        this.PROCASEF_COLORS.error
                    ],
                    borderWidth: 3,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        callbacks: {
                            label: (context) => {
                                const label = context.label;
                                const count = context.raw;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((count / total) * 100).toFixed(1);
                                const communes = communeNames[context.dataIndex].join(', ') || 'Aucune';
                                return [
                                    `${label}: ${count} commune(s) (${percentage}%)`,
                                    `Communes: ${communes}`
                                ];
                            }
                        }
                    }
                },
                onClick: (event, elements) => {
                    if (elements.length > 0) {
                        const index = elements[0].index;
                        const performanceLevel = Object.keys(performanceGroups)[index].toLowerCase().split(' ')[0];
                        this.filters.performance = performanceLevel;
                        this.applyFilters();
                        this.showNotification(`Filtrage par niveau de performance: ${Object.keys(performanceGroups)[index]}`, 'info');
                    }
                },
                animation: {
                    animateRotate: true,
                    duration: 1000
                }
            }
        });
    }

    // Efficiency trends radar chart
    createEfficiencyChart() {
        const ctx = document.getElementById('efficiencyChart');
        if (!ctx) return;

        if (this.charts.efficiency) {
            this.charts.efficiency.destroy();
        }

        const topCommunes = this.filteredData
            .sort((a, b) => b.globalEfficiency - a.globalEfficiency)
            .slice(0, 8);

        this.charts.efficiency = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: topCommunes.map(d => d.commune),
                datasets: [
                    {
                        label: 'Efficacité Globale (%)',
                        data: topCommunes.map(d => d.globalEfficiency),
                        backgroundColor: this.PROCASEF_COLORS.primary + '20',
                        borderColor: this.PROCASEF_COLORS.primary,
                        borderWidth: 3,
                        pointBackgroundColor: this.PROCASEF_COLORS.primary,
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 6
                    },
                    {
                        label: 'Score Qualité (%)',
                        data: topCommunes.map(d => d.qualityScore),
                        backgroundColor: this.PROCASEF_COLORS.success + '20',
                        borderColor: this.PROCASEF_COLORS.success,
                        borderWidth: 3,
                        pointBackgroundColor: this.PROCASEF_COLORS.success,
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            stepSize: 20,
                            callback: (value) => value + '%'
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        angleLines: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeOutQuart'
                }
            }
        });
    }

    // Render data table
    renderTable() {
        const tableBody = document.getElementById('tableBody');
        if (!tableBody) return;

        const tableData = this.getFilteredTableData();
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const currentPageData = tableData.slice(startIndex, endIndex);

        tableBody.innerHTML = currentPageData.map(commune => {
            const performanceClass = this.getPerformanceClass(commune.validationRate);
            const efficiencyClass = this.getPerformanceClass(commune.globalEfficiency);

            return `
                <tr class="fade-in">
                    <td><strong>${commune.commune}</strong></td>
                    <td>${this.formatNumber(commune.donnees_brutes)}</td>
                    <td>${this.formatNumber(commune.sans_doublons_attributaire_et_geometriqu)}</td>
                    <td>${this.formatNumber(commune.post_traitees)}</td>
                    <td>${this.formatNumber(commune.valideespar_urm_nicad)}</td>
                    <td>
                        <span class="performance-badge ${performanceClass}">
                            ${commune.validationRate}%
                        </span>
                    </td>
                    <td>
                        <span class="performance-badge ${efficiencyClass}">
                            ${commune.globalEfficiency}%
                        </span>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-outline" onclick="dashboard.showCommuneDetails('${commune.commune}')">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        this.updatePagination(tableData.length);
    }

    // Get filtered table data with search
    getFilteredTableData() {
        let data = [...this.filteredData];

        // Apply search filter
        if (this.searchTerm) {
            data = data.filter(commune => 
                Object.values(commune).some(value => 
                    value.toString().toLowerCase().includes(this.searchTerm)
                )
            );
        }

        // Apply sorting
        if (this.sortConfig.key) {
            data.sort((a, b) => {
                let aVal = a[this.sortConfig.key];
                let bVal = b[this.sortConfig.key];

                if (typeof aVal === 'string') {
                    aVal = aVal.toLowerCase();
                    bVal = bVal.toLowerCase();
                }

                if (this.sortConfig.direction === 'asc') {
                    return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
                } else {
                    return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
                }
            });
        }

        return data;
    }

    // Sort table by column
    sortTable(key) {
        if (this.sortConfig.key === key) {
            this.sortConfig.direction = this.sortConfig.direction === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortConfig.key = key;
            this.sortConfig.direction = 'asc';
        }

        // Update sort indicators
        document.querySelectorAll('[data-sort] i').forEach(icon => {
            icon.className = 'fas fa-sort';
        });

        const currentHeader = document.querySelector(`[data-sort="${key}"] i`);
        if (currentHeader) {
            currentHeader.className = this.sortConfig.direction === 'asc' ? 
                'fas fa-sort-up' : 'fas fa-sort-down';
        }

        this.renderTable();
    }

    // Update pagination controls
    updatePagination(totalItems) {
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);
        const start = (this.currentPage - 1) * this.itemsPerPage + 1;
        const end = Math.min(this.currentPage * this.itemsPerPage, totalItems);

        // Update pagination info
        this.updateElement('paginationInfo', 
            `Affichage de ${start} à ${end} sur ${totalItems} entrées`);

        // Update page buttons
        const prevBtn = document.getElementById('prevPage');
        const nextBtn = document.getElementById('nextPage');
        
        if (prevBtn) prevBtn.disabled = this.currentPage <= 1;
        if (nextBtn) nextBtn.disabled = this.currentPage >= totalPages;

        // Generate page numbers
        const pageNumbers = document.getElementById('pageNumbers');
        if (pageNumbers) {
            let pages = [];
            const maxVisible = 5;
            
            if (totalPages <= maxVisible) {
                pages = Array.from({length: totalPages}, (_, i) => i + 1);
            } else {
                const start = Math.max(1, this.currentPage - 2);
                const end = Math.min(totalPages, start + maxVisible - 1);
                pages = Array.from({length: end - start + 1}, (_, i) => start + i);
            }

            pageNumbers.innerHTML = pages.map(page => 
                `<button class="page-btn ${page === this.currentPage ? 'active' : ''}" 
                         onclick="dashboard.goToPage(${page})">${page}</button>`
            ).join('');
        }
    }

    // Navigate to specific page
    goToPage(page) {
        this.currentPage = page;
        this.renderTable();
    }

    // Get performance class for styling
    getPerformanceClass(rate) {
        if (rate >= 80) return 'excellent';
        if (rate >= 60) return 'good';
        if (rate >= 30) return 'average';
        if (rate > 0) return 'poor';
        return 'zero';
    }

    // Handle chart actions
    handleChartAction(action, chartType) {
        const chart = this.charts[chartType];
        if (!chart && action !== 'details') return;

        switch (action) {
            case 'fullscreen':
                this.openChartModal(chart, chartType);
                break;
            case 'download':
                this.downloadChart(chart, chartType);
                break;
            case 'details':
                if (chartType === 'validation') {
                    this.showValidationDetails();
                }
                break;
        }
    }

    // Open chart in modal
    openChartModal(chart, chartType) {
        const modal = document.getElementById('modalOverlay');
        const modalTitle = document.getElementById('modalTitle');
        const modalChart = document.getElementById('modalChart');
        
        if (!modal || !modalChart) return;

        const titles = {
            pipeline: 'Pipeline de Traitement des Données',
            performance: 'Performance par Commune',
            validation: 'Répartition des Niveaux de Validation',
            efficiency: 'Tendances d\'Efficacité'
        };

        modalTitle.textContent = titles[chartType] || 'Graphique';
        modal.classList.add('active');

        // Destroy existing chart on modal canvas if it exists
        if (this.modalChartInstance) {
            this.modalChartInstance.destroy();
            this.modalChartInstance = null;
        }

        // Create full-screen chart
        setTimeout(() => {
            const ctx = modalChart.getContext('2d');
            this.modalChartInstance = new Chart(ctx, {
                type: chart.config.type,
                data: chart.data,
                options: chart.options
            });
        }, 100);

        // Close modal events
        const closeModal = () => {
            modal.classList.remove('active');
            // Destroy modal chart when closing
            if (this.modalChartInstance) {
                this.modalChartInstance.destroy();
                this.modalChartInstance = null;
            }
        };

        document.getElementById('modalClose')?.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    // Download chart as image
    downloadChart(chart, chartType) {
        const link = document.createElement('a');
        link.download = `PROCASEF_${chartType}_${new Date().toISOString().split('T')[0]}.png`;
        link.href = chart.toBase64Image('image/png', 1.0);
        link.click();
        
        this.showNotification('Graphique téléchargé avec succès', 'success');
    }

    // Export data to Excel
    exportToExcel() {
        const data = this.filteredData.map(commune => ({
            'Commune': commune.commune,
            'Données Brutes': commune.donnees_brutes,
            'Sans Doublons': commune.sans_doublons_attributaire_et_geometriqu,
            'Post-traitées': commune.post_traitees,
            'Validées URM/NICAD': commune.valideespar_urm_nicad,
            'Taux Dédoublonnage (%)': commune.dedoublonnageRate,
            'Taux Post-traitement (%)': commune.postTraitementRate,
            'Taux Validation (%)': commune.validationRate,
            'Efficacité Globale (%)': commune.globalEfficiency,
            'Score Qualité (%)': commune.qualityScore,
            'Niveau Performance': commune.performanceLevel
        }));

        const csvContent = this.convertToCSV(data);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `PROCASEF_EDL_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();

        this.showNotification('Données exportées avec succès', 'success');
    }

    // Export table data
    exportTableData() {
        this.exportToExcel();
    }

    // Convert data to CSV
    convertToCSV(data) {
        if (!data.length) return '';
        
        const headers = Object.keys(data[0]);
        const csvRows = [];
        
        // Add headers
        csvRows.push(headers.join(','));
        
        // Add data rows
        for (const row of data) {
            const values = headers.map(header => {
                const escaped = ('' + row[header]).replace(/"/g, '\\"');
                return `"${escaped}"`;
            });
            csvRows.push(values.join(','));
        }
        
        return csvRows.join('\n');
    }

    // Show commune details modal
    showCommuneDetails(communeName) {
        const commune = this.processedData.find(c => c.commune === communeName);
        if (!commune) return;

        // Create detailed modal content
        const modalContent = `
            <div class="commune-details">
                <h3>${commune.commune}</h3>
                <div class="details-grid">
                    <div class="detail-item">
                        <label>Données Brutes:</label>
                        <span>${this.formatNumber(commune.donnees_brutes)}</span>
                    </div>
                    <div class="detail-item">
                        <label>Sans Doublons:</label>
                        <span>${this.formatNumber(commune.sans_doublons_attributaire_et_geometriqu)}</span>
                    </div>
                    <div class="detail-item">
                        <label>Post-traitées:</label>
                        <span>${this.formatNumber(commune.post_traitees)}</span>
                    </div>
                    <div class="detail-item">
                        <label>Validées:</label>
                        <span>${this.formatNumber(commune.valideespar_urm_nicad)}</span>
                    </div>
                    <div class="detail-item">
                        <label>Efficacité Globale:</label>
                        <span class="performance-badge ${this.getPerformanceClass(commune.globalEfficiency)}">
                            ${commune.globalEfficiency}%
                        </span>
                    </div>
                    <div class="detail-item">
                        <label>Score Qualité:</label>
                        <span>${commune.qualityScore}%</span>
                    </div>
                </div>
            </div>
        `;

        this.showCustomModal('Détails de la Commune', modalContent);
    }

    // Show validation details modal
    showValidationDetails() {
        const performanceGroups = {
            'Excellent (≥80%)': this.filteredData.filter(d => d.validationRate >= 80),
            'Bon (60-80%)': this.filteredData.filter(d => d.validationRate >= 60 && d.validationRate < 80),
            'Moyen (30-60%)': this.filteredData.filter(d => d.validationRate >= 30 && d.validationRate < 60),
            'Faible (<30%)': this.filteredData.filter(d => d.validationRate > 0 && d.validationRate < 30),
            'Aucune validation': this.filteredData.filter(d => d.validationRate === 0)
        };

        const modalContent = `
            <div class="validation-details">
                <h3>Répartition des Niveaux de Validation</h3>
                <div class="details-grid">
                    ${Object.entries(performanceGroups).map(([level, communes]) => `
                        <div class="detail-item">
                            <label>${level}:</label>
                            <span>${communes.length} commune(s) - ${communes.map(c => c.commune).join(', ') || 'Aucune'}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        this.showCustomModal('Détails de Validation', modalContent);
    }

    // Show custom modal
    showCustomModal(title, content) {
        const modal = document.getElementById('modalOverlay');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = modal.querySelector('.modal-body');
        
        modalTitle.textContent = title;
        modalBody.innerHTML = content;
        modal.classList.add('active');
    }

    // Highlight KPI related data
    highlightKPIRelatedData(kpiType) {
        // Add visual highlighting based on KPI type
        // This could filter/highlight related charts or table rows
        this.showNotification(`Focus sur: ${kpiType}`, 'info');
    }

    // Toggle theme
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        const themeIcon = document.querySelector('#themeToggle i');
        if (themeIcon) {
            themeIcon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }

        // Update charts for theme change
        setTimeout(() => {
            this.updateCharts();
        }, 300);
    }

    // Refresh data from JSON file
    async refreshData() {
        this.showLoading(true);
        
        try {
            console.log('🔄 Actualisation manuelle des données...');
            await this.loadDataFromJSON();
            this.processData();
            this.updateAllComponents();
            this.updateTimestamp();
            this.showLoading(false);
            this.showNotification('Données actualisées avec succès', 'success');
        } catch (error) {
            console.error('Erreur lors de l\'actualisation:', error);
            this.showLoading(false);
            this.showNotification(`Erreur lors de l'actualisation: ${error.message}`, 'error');
        }
    }

    // Setup auto-refresh to check for JSON updates
    setupAutoRefresh() {
        // Check for updates every 2 minutes
        this.autoRefreshInterval = setInterval(async () => {
            await this.checkForUpdates();
        }, 120000); // 2 minutes
        
        console.log('🔄 Auto-refresh configuré (vérification toutes les 2 minutes)');
    }

    // Method to change data source path if needed
    setDataSource(newPath) {
        this.dataFilePath = newPath;
        console.log(`📁 Source de données changée vers: ${newPath}`);
        this.refreshData(); // Reload with new source
    }

    // Utility functions
    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            if (element.textContent !== value) {
                element.style.transform = 'scale(1.1)';
                element.textContent = value;
                setTimeout(() => {
                    element.style.transform = 'scale(1)';
                }, 200);
            }
        }
    }

    updateProgress(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.style.width = `${Math.min(value, 100)}%`;
        }
    }

    formatNumber(num) {
        if (num === null || num === undefined) return '0';
        return parseInt(num).toLocaleString('fr-FR');
    }

    updateTimestamp() {
        const now = new Date();
        const timestamp = now.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        this.updateElement('lastUpdate', timestamp);
    }

    showLoading(show) {
        const loadingOverlay = document.getElementById('loading');
        if (loadingOverlay) {
            if (show) {
                loadingOverlay.classList.remove('hidden');
            } else {
                setTimeout(() => {
                    loadingOverlay.classList.add('hidden');
                }, 500);
            }
        }
    }

    showNotification(message, type = 'info', duration = 4000) {
        const container = document.getElementById('notifications');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;

        container.appendChild(notification);

        // Show animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        // Auto remove
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    // Advanced Analytics Methods
    calculateTrends() {
        // Calculate month-over-month trends (simulated)
        return {
            efficiency: 2.3,
            quality: 1.8,
            validation: -0.5,
            coverage: 5.2
        };
    }

    identifyOutliers() {
        // Identify statistical outliers in the data
        const efficiencies = this.processedData.map(d => d.globalEfficiency);
        const mean = efficiencies.reduce((a, b) => a + b, 0) / efficiencies.length;
        const stdDev = Math.sqrt(
            efficiencies.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / efficiencies.length
        );
        
        return this.processedData.filter(d => 
            Math.abs(d.globalEfficiency - mean) > 2 * stdDev
        );
    }

    generateInsights() {
        const insights = [];
        const outliers = this.identifyOutliers();
        
        if (outliers.length > 0) {
            insights.push({
                type: 'outlier',
                message: `${outliers.length} commune(s) présentent des performances atypiques`,
                communes: outliers.map(d => d.commune)
            });
        }

        const zeroValidation = this.processedData.filter(d => d.validationRate === 0);
        if (zeroValidation.length > 0) {
            insights.push({
                type: 'warning',
                message: `${zeroValidation.length} commune(s) sans validation URM/NICAD`,
                communes: zeroValidation.map(d => d.commune)
            });
        }

        const topPerformers = this.processedData
            .filter(d => d.globalEfficiency >= 80)
            .sort((a, b) => b.globalEfficiency - a.globalEfficiency);
        
        if (topPerformers.length > 0) {
            insights.push({
                type: 'success',
                message: `${topPerformers.length} commune(s) avec excellence opérationnelle`,
                communes: topPerformers.map(d => d.commune)
            });
        }

        return insights;
    }

    // Performance optimization
    debounce(func, wait) {
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

    // Error handling
    handleError(error, context = 'général') {
        console.error(`Erreur ${context}:`, error);
        this.showNotification(`Erreur ${context}: ${error.message}`, 'error');
    }

    // Cleanup methods
    destroy() {
        // Clean up charts
        Object.values(this.charts).forEach(chart => {
            if (chart && chart.destroy) {
                chart.destroy();
            }
        });

        if (this.modalChartInstance) {
            this.modalChartInstance.destroy();
        }

        // Clear auto-refresh interval
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
            console.log('🛑 Auto-refresh arrêté');
        }

        // Remove event listeners
        // (In a real application, you'd store references and remove them)
        
        this.showNotification('Dashboard nettoyé', 'info');
    }
}

// Initialize dashboard when DOM is loaded
let dashboard;

document.addEventListener('DOMContentLoaded', () => {
    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    const themeIcon = document.querySelector('#themeToggle i');
    if (themeIcon) {
        themeIcon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    // Initialize dashboard
    dashboard = new PROCASEFDashboard();
    
    // Global error handling
    window.addEventListener('error', (e) => {
        console.error('Erreur globale:', e.message || 'Erreur inconnue', e);
        if (dashboard) {
            dashboard.showNotification('Une erreur inattendue s\'est produite', 'error');
        }
    });

    window.addEventListener('unhandledrejection', (e) => {
        console.error('Promise rejetée:', e.reason);
        if (dashboard) {
            dashboard.showNotification('Erreur de traitement des données', 'error');
        }
    });
});

// Export for global access
window.dashboard = dashboard;

// Additional utility functions for global use
window.PROCASEF = {
    formatNumber: (num) => {
        if (num === null || num === undefined) return '0';
        return parseInt(num).toLocaleString('fr-FR');
    },
    
    formatPercentage: (num, decimals = 1) => {
        return parseFloat(num).toFixed(decimals) + '%';
    },
    
    formatCurrency: (num, currency = 'XOF') => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: currency
        }).format(num);
    },
    
    exportToClipboard: (data) => {
        navigator.clipboard.writeText(JSON.stringify(data, null, 2))
            .then(() => {
                if (window.dashboard) {
                    window.dashboard.showNotification('Données copiées dans le presse-papiers', 'success');
                }
            })
            .catch(err => {
                console.error('Erreur de copie:', err);
            });
    }
};
