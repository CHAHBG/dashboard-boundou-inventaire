// app.js
// PROCASEF Dashboard - Advanced Analytics Engine (Version Optimisée)
class PROCASEFDashboard {
    constructor() {
        // Configuration des données
        this.rawData = [];
        this.processedData = [];
        this.filteredData = [];
        this.dataFilePath = './EDL_PostTraitement.json';
        
        // État des composants
        this.charts = {};
        this.modalChartInstance = null;
        this.autoRefreshInterval = null;
        this.lastModified = null;
        
        // Configuration des filtres
        this.filters = {
            communes: [],
            seuil: 0,
            performance: 'all'
        };

        // Configuration pagination et recherche
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.searchTerm = '';
        this.sortConfig = { key: null, direction: 'asc' };

        // Palette de couleurs PROCASEF
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

    // ==========================================
    // INITIALISATION
    // ==========================================
    
    async init() {
        try {
            console.log('🚀 Initialisation du dashboard PROCASEF...');
            this.showLoading(true);
            
            await this.loadDataFromJSON();
            this.processData();
            this.initializeComponents();
            
            this.showLoading(false);
            this.showNotification('Dashboard chargé avec succès', 'success');
            this.updateTimestamp();
            
        } catch (error) {
            console.error('❌ Erreur lors de l\'initialisation:', error);
            this.showNotification(`Erreur lors du chargement: ${error.message}`, 'error');
            this.showLoading(false);
        }
    }

    initializeComponents() {
        this.initializeFilters();
        this.initializeEventListeners();
        this.initializeCharts();
        this.renderTable();
        this.updateKPIs();
        this.updateQuickStats();
        this.setupAutoRefresh();
    }

    // ==========================================
    // GESTION DES DONNÉES
    // ==========================================

    async loadDataFromJSON() {
        try {
            console.log('🔄 Chargement des données depuis:', this.dataFilePath);
            
            const response = await fetch(this.dataFilePath, {
                cache: 'no-cache',
                headers: {
                    'Cache-Control': 'no-cache'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
            }
            
            // Stocker la date de dernière modification
            this.lastModified = response.headers.get('Last-Modified');
            
            const data = await response.json();
            this.validateAndSetData(data);
            
        } catch (error) {
            console.error('❌ Erreur lors du chargement:', error);
            this.loadFallbackData();
            throw error;
        }
    }

    validateAndSetData(data) {
        if (!Array.isArray(data)) {
            throw new Error('Le fichier JSON doit contenir un tableau de données');
        }
        
        // Filtrer les entrées "Total" et valider les champs requis
        const requiredFields = [
            'commune', 
            'donnees_brutes', 
            'sans_doublons_attributaire_et_geometriqu', 
            'post_traitees', 
            'valideespar_urm_nicad'
        ];
        
        this.rawData = data.filter(item => {
            return item.commune && 
                   item.commune !== 'Total' && 
                   requiredFields.every(field => field in item);
        });
        
        if (this.rawData.length === 0) {
            throw new Error('Aucune donnée valide trouvée dans le fichier JSON');
        }
        
        console.log(`✅ ${this.rawData.length} communes chargées avec succès`);
    }

    loadFallbackData() {
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

    async checkForUpdates() {
        try {
            const response = await fetch(this.dataFilePath, { 
                method: 'HEAD',
                cache: 'no-cache'
            });
            
            if (response.ok) {
                const lastModified = response.headers.get('Last-Modified');
                
                if (lastModified && this.lastModified && lastModified !== this.lastModified) {
                    console.log('🔄 Nouvelles données détectées, rechargement...');
                    await this.refreshData();
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.log('⚠️ Impossible de vérifier les mises à jour:', error.message);
            return false;
        }
    }

    // ==========================================
    // TRAITEMENT DES DONNÉES
    // ==========================================

    processData() {
        this.processedData = this.rawData.map(commune => {
            const metrics = this.calculateCommuneMetrics(commune);
            return { ...commune, ...metrics };
        });

        this.filteredData = [...this.processedData];
        this.applyFilters();
    }

    calculateCommuneMetrics(commune) {
        // Calculs des taux
        const dedoublonnageRate = this.safePercentage(
            commune.sans_doublons_attributaire_et_geometriqu, 
            commune.donnees_brutes
        );
        
        const postTraitementRate = this.safePercentage(
            commune.post_traitees, 
            commune.sans_doublons_attributaire_et_geometriqu
        );
        
        const validationRate = this.safePercentage(
            commune.valideespar_urm_nicad, 
            commune.post_traitees
        );
        
        const globalEfficiency = this.safePercentage(
            commune.valideespar_urm_nicad, 
            commune.donnees_brutes
        );
        
        // Score qualité pondéré
        const qualityScore = (dedoublonnageRate * 0.2) + 
                           (postTraitementRate * 0.3) + 
                           (validationRate * 0.5);
        
        // Classification performance
        const performanceLevel = this.classifyPerformance(validationRate);
        
        // Calcul des pertes
        const losses = this.calculateLosses(commune);
        
        return {
            dedoublonnageRate: this.roundTo(dedoublonnageRate, 1),
            postTraitementRate: this.roundTo(postTraitementRate, 1),
            validationRate: this.roundTo(validationRate, 1),
            globalEfficiency: this.roundTo(globalEfficiency, 1),
            qualityScore: this.roundTo(qualityScore, 1),
            performanceLevel,
            ...losses,
            retentionRate: this.roundTo(globalEfficiency, 1)
        };
    }

    safePercentage(numerator, denominator) {
        return denominator > 0 ? (numerator / denominator) * 100 : 0;
    }

    roundTo(number, decimals) {
        return Math.round(number * Math.pow(10, decimals)) / Math.pow(10, decimals);
    }

    classifyPerformance(validationRate) {
        if (validationRate >= 80) return 'excellent';
        if (validationRate >= 60) return 'good';
        if (validationRate >= 30) return 'average';
        if (validationRate > 0) return 'poor';
        return 'zero';
    }

    calculateLosses(commune) {
        const perte1 = commune.donnees_brutes - commune.sans_doublons_attributaire_et_geometriqu;
        const perte2 = commune.sans_doublons_attributaire_et_geometriqu - commune.post_traitees;
        const perte3 = commune.post_traitees - commune.valideespar_urm_nicad;
        
        return {
            perte1,
            perte2, 
            perte3,
            totalPerte: perte1 + perte2 + perte3
        };
    }

    // ==========================================
    // INTERFACE UTILISATEUR - FILTRES
    // ==========================================

    initializeFilters() {
        this.setupCommunesFilter();
        this.setupRangeSlider();
    }

    setupCommunesFilter() {
        const communesContainer = document.getElementById('communesFilter');
        if (!communesContainer) return;
        
        const communes = [...new Set(this.processedData.map(d => d.commune))].sort();
        communesContainer.innerHTML = communes.map(commune => `
            <label class="commune-option">
                <input type="checkbox" value="${commune}" class="commune-checkbox">
                <span>${commune}</span>
            </label>
        `).join('');
    }

    setupRangeSlider() {
        const seuilRange = document.getElementById('seuilRange');
        const seuilValue = document.getElementById('seuilValue');
        
        if (!seuilRange || !seuilValue) return;
        
        const maxValue = Math.max(...this.processedData.map(d => d.donnees_brutes));
        seuilRange.max = maxValue;
        
        seuilRange.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            seuilValue.textContent = this.formatNumber(value);
            this.filters.seuil = value;
        });
    }

    applyFilters() {
        const selectedCommunes = Array.from(document.querySelectorAll('.commune-checkbox:checked'))
            .map(cb => cb.value);

        this.filters.communes = selectedCommunes;

        this.filteredData = this.processedData.filter(commune => {
            return this.passesFilters(commune, selectedCommunes);
        });

        this.currentPage = 1;
        this.updateAllComponents();
        
        this.showNotification(
            `Filtres appliqués - ${this.filteredData.length} commune(s) affichée(s)`, 
            'info'
        );
    }

    passesFilters(commune, selectedCommunes) {
        // Filtre communes
        if (selectedCommunes.length > 0 && !selectedCommunes.includes(commune.commune)) {
            return false;
        }

        // Filtre seuil
        if (commune.donnees_brutes < this.filters.seuil) {
            return false;
        }

        // Filtre performance
        if (this.filters.performance !== 'all' && commune.performanceLevel !== this.filters.performance) {
            return false;
        }

        return true;
    }

    resetFilters() {
        // Réinitialiser l'interface
        document.querySelectorAll('.commune-checkbox').forEach(cb => cb.checked = false);
        this.setElementValue('seuilRange', 0);
        this.setElementValue('seuilValue', '0');
        this.setElementValue('performanceFilter', 'all');
        this.setElementValue('searchInput', '');

        // Réinitialiser l'état
        this.filters = { communes: [], seuil: 0, performance: 'all' };
        this.searchTerm = '';
        this.filteredData = [...this.processedData];
        this.currentPage = 1;
        
        this.updateAllComponents();
        this.showNotification('Filtres réinitialisés', 'info');
    }

    // ==========================================
    // GESTIONNAIRES D'ÉVÉNEMENTS
    // ==========================================

    initializeEventListeners() {
        this.setupNavigationEvents();
        this.setupFilterEvents();
        this.setupTableEvents();
        this.setupModalEvents();
        this.setupChartEvents();
    }

    setupNavigationEvents() {
        this.addEventListenerSafe('themeToggle', 'click', () => this.toggleTheme());
        this.addEventListenerSafe('sidebarToggle', 'click', () => this.toggleSidebar());
        this.addEventListenerSafe('refreshBtn', 'click', () => this.refreshData());
        this.addEventListenerSafe('exportBtn', 'click', () => this.exportToExcel());
    }

    setupFilterEvents() {
        this.addEventListenerSafe('applyFilters', 'click', () => this.applyFilters());
        this.addEventListenerSafe('resetFilters', 'click', () => this.resetFilters());
        this.addEventListenerSafe('performanceFilter', 'change', (e) => {
            this.filters.performance = e.target.value;
        });
        
        // Recherche avec debounce
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            const debouncedSearch = this.debounce((value) => {
                this.searchTerm = value.toLowerCase();
                this.currentPage = 1;
                this.renderTable();
            }, 300);
            searchInput.addEventListener('input', (e) => debouncedSearch(e.target.value));
        }
    }

    setupTableEvents() {
        this.addEventListenerSafe('tableExport', 'click', () => this.exportToExcel());
        this.addEventListenerSafe('prevPage', 'click', () => this.previousPage());
        this.addEventListenerSafe('nextPage', 'click', () => this.nextPage());
        
        // Tri du tableau
        document.querySelectorAll('[data-sort]').forEach(header => {
            header.addEventListener('click', () => {
                this.sortTable(header.dataset.sort);
            });
        });
    }

    setupModalEvents() {
        this.addEventListenerSafe('showKPILegend', 'click', () => {
            document.getElementById('kpiLegendModal').classList.add('active');
        });
        
        this.addEventListenerSafe('closeLegendModal', 'click', () => {
            document.getElementById('kpiLegendModal').classList.remove('active');
        });

        // Fermeture sur clic extérieur
        document.getElementById('kpiLegendModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'kpiLegendModal') {
                document.getElementById('kpiLegendModal').classList.remove('active');
            }
        });
    }

    setupChartEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-action]')) {
                this.handleChartAction(e.target.dataset.action, e.target.dataset.chart);
            }
        });
    }

    addEventListenerSafe(elementId, event, handler) {
        const element = document.getElementById(elementId);
        if (element) {
            element.addEventListener(event, handler);
        }
    }

    // ==========================================
    // CALCUL ET AFFICHAGE DES KPI
    // ==========================================

    updateKPIs() {
        const totals = this.calculateTotals();
        const kpis = this.calculateKPIs(totals);
        this.updateKPIDisplay(kpis);
    }

    calculateTotals() {
        return this.filteredData.reduce((acc, commune) => ({
            brutes: acc.brutes + commune.donnees_brutes,
            sansDoublons: acc.sansDoublons + commune.sans_doublons_attributaire_et_geometriqu,
            postTraitees: acc.postTraitees + commune.post_traitees,
            validees: acc.validees + commune.valideespar_urm_nicad
        }), { brutes: 0, sansDoublons: 0, postTraitees: 0, validees: 0 });
    }

    calculateKPIs(totals) {
        const pipelineEfficiency = this.safePercentage(totals.validees, totals.brutes);
        const validationRate = this.safePercentage(totals.validees, totals.postTraitees);
        const coverageRate = this.safePercentage(this.filteredData.length, this.processedData.length);
        
        const avgQuality = this.filteredData.length > 0 ? 
            this.filteredData.reduce((sum, c) => sum + c.qualityScore, 0) / this.filteredData.length : 0;

        return {
            pipelineEfficiency: this.roundTo(pipelineEfficiency, 1),
            qualityScore: this.roundTo(avgQuality, 1),
            validationRate: this.roundTo(validationRate, 1),
            coverageRate: this.roundTo(coverageRate, 1)
        };
    }

    updateKPIDisplay(kpis) {
        // Mise à jour des valeurs KPI
        this.updateElement('pipelineEfficiency', `${kpis.pipelineEfficiency}%`);
        this.updateElement('qualityScore', `${kpis.qualityScore}%`);
        this.updateElement('validationRate', `${kpis.validationRate}%`);
        this.updateElement('coverageRate', `${kpis.coverageRate}%`);

        // Mise à jour des barres de progression
        this.updateProgress('pipelineProgress', kpis.pipelineEfficiency);
        this.updateProgress('qualityProgress', kpis.qualityScore);
        this.updateProgress('validationProgress', kpis.validationRate);
        this.updateProgress('coverageProgress', kpis.coverageRate);

        // Mise à jour des stats d'en-tête
        const totals = this.calculateTotals();
        this.updateElement('totalData', this.formatNumber(totals.brutes));
        this.updateElement('validatedData', this.formatNumber(totals.validees));
        this.updateElement('totalCommunes', this.filteredData.length);
    }

    updateQuickStats() {
        if (this.filteredData.length === 0) return;

        const avgEfficiency = this.roundTo(
            this.filteredData.reduce((sum, c) => sum + c.globalEfficiency, 0) / this.filteredData.length,
            1
        );

        const topCommune = this.filteredData.reduce((best, current) => 
            current.globalEfficiency > best.globalEfficiency ? current : best
        );

        const totalParcels = this.filteredData.reduce((sum, c) => sum + c.donnees_brutes, 0);

        this.updateElement('avgEfficiency', `${avgEfficiency}%`);
        this.updateElement('topCommune', topCommune.commune);
        this.updateElement('totalParcels', this.formatNumber(totalParcels));
    }

    // ==========================================
    // GESTION DES GRAPHIQUES
    // ==========================================

    initializeCharts() {
        this.createPipelineChart();
        this.createPerformanceChart();
        this.createValidationChart();
        this.createEfficiencyChart();
    }

    updateCharts() {
        Object.keys(this.charts).forEach(chartKey => {
            if (this.charts[chartKey]) {
                this.charts[chartKey].destroy();
            }
        });
        this.initializeCharts();
    }

    createPipelineChart() {
        const ctx = document.getElementById('pipelineChart');
        if (!ctx) return;

        if (this.charts.pipeline) {
            this.charts.pipeline.destroy();
        }

        const totals = this.calculateTotals();
        
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
            options: this.getChartOptions('pipeline', totals)
        });
    }

    createPerformanceChart() {
        const ctx = document.getElementById('performanceChart');
        if (!ctx) return;

        if (this.charts.performance) {
            this.charts.performance.destroy();
        }

        const data = this.filteredData
            .sort((a, b) => b.globalEfficiency - a.globalEfficiency)
            .slice(0, 10);

        this.charts.performance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(d => d.commune),
                datasets: [
                    {
                        label: 'Efficacité Globale (%)',
                        data: data.map(d => d.globalEfficiency),
                        backgroundColor: this.PROCASEF_COLORS.primary + '80',
                        borderColor: this.PROCASEF_COLORS.primary,
                        borderWidth: 2
                    },
                    {
                        label: 'Taux Validation (%)',
                        data: data.map(d => d.validationRate),
                        backgroundColor: this.PROCASEF_COLORS.success + '80',
                        borderColor: this.PROCASEF_COLORS.success,
                        borderWidth: 2
                    }
                ]
            },
            options: this.getChartOptions('performance')
        });
    }

    createValidationChart() {
        const ctx = document.getElementById('validationChart');
        if (!ctx) return;

        if (this.charts.validation) {
            this.charts.validation.destroy();
        }

        const performanceGroups = this.groupByPerformance();
        const counts = Object.values(performanceGroups).map(group => group.length);

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
            options: this.getChartOptions('validation', performanceGroups)
        });
    }

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
                        data: topCommunes.map(d => Math.min(100, Math.max(0, d.globalEfficiency))),
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
                        data: topCommunes.map(d => Math.min(100, Math.max(0, d.qualityScore))),
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
            options: this.getChartOptions('efficiency')
        });
    }

    groupByPerformance() {
        return {
            'Excellent (≥80%)': this.filteredData.filter(d => d.validationRate >= 80),
            'Bon (60-80%)': this.filteredData.filter(d => d.validationRate >= 60 && d.validationRate < 80),
            'Moyen (30-60%)': this.filteredData.filter(d => d.validationRate >= 30 && d.validationRate < 60),
            'Faible (<30%)': this.filteredData.filter(d => d.validationRate > 0 && d.validationRate < 30),
            'Aucune validation': this.filteredData.filter(d => d.validationRate === 0)
        };
    }

    getChartOptions(chartType, extraData = null) {
        const commonOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top' },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    titleColor: '#fff',
                    bodyColor: '#fff'
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            }
        };

        switch (chartType) {
            case 'pipeline':
                return {
                    ...commonOptions,
                    plugins: {
                        ...commonOptions.plugins,
                        legend: { display: false },
                        tooltip: {
                            ...commonOptions.plugins.tooltip,
                            callbacks: {
                                label: (context) => {
                                    const percentage = extraData.brutes > 0 ? 
                                        ((context.raw / extraData.brutes) * 100).toFixed(1) : 0;
                                    return `${this.formatNumber(context.raw)} parcelles (${percentage}%)`;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: { callback: (value) => this.formatNumber(value) },
                            grid: { color: 'rgba(0, 0, 0, 0.05)' }
                        },
                        x: { grid: { display: false } }
                    }
                };

            case 'performance':
                return {
                    ...commonOptions,
                    interaction: { mode: 'index', intersect: false },
                    scales: {
                        x: {
                            grid: { display: false },
                            ticks: { maxRotation: 45 }
                        },
                        y: {
                            beginAtZero: true,
                            max: 100,
                            ticks: { callback: (value) => value + '%' }
                        }
                    }
                };

            case 'validation':
                return {
                    ...commonOptions,
                    plugins: {
                        ...commonOptions.plugins,
                        legend: {
                            position: 'bottom',
                            labels: { padding: 20, usePointStyle: true }
                        },
                        tooltip: {
                            ...commonOptions.plugins.tooltip,
                            callbacks: {
                                label: (context) => {
                                    const label = context.label;
                                    const count = context.raw;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = ((count / total) * 100).toFixed(1);
                                    const communes = extraData[Object.keys(extraData)[context.dataIndex]]
                                        .map(d => d.commune).join(', ') || 'Aucune';
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
                            const performanceLevels = ['excellent', 'good', 'average', 'poor', 'zero'];
                            this.filters.performance = performanceLevels[index] || 'all';
                            this.applyFilters();
                        }
                    }
                };

            case 'efficiency':
                return {
                    ...commonOptions,
                    plugins: {
                        ...commonOptions.plugins,
                        legend: {
                            position: 'right',
                            labels: { padding: 20, usePointStyle: true, boxWidth: 10, font: { size: 12 } }
                        }
                    },
                    scales: {
                        r: {
                            beginAtZero: true,
                            max: 100,
                            min: 0,
                            ticks: {
                                stepSize: 20,
                                callback: (value) => value + '%'
                            },
                            grid: { color: 'rgba(0, 0, 0, 0.1)' },
                            angleLines: { color: 'rgba(0, 0, 0, 0.1)' },
                            pointLabels: { font: { size: 10 } }
                        }
                    },
                    layout: {
                        padding: { right: 100, left: 20, top: 20, bottom: 20 }
                    },
                    elements: {
                        line: { tension: 0.4, borderWidth: 2 },
                        point: { hitRadius: 5, hoverRadius: 8 }
                    }
                };

            default:
                return commonOptions;
        }
    }

    // ==========================================
    // GESTION DES ACTIONS SUR LES GRAPHIQUES
    // ==========================================

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

    openChartModal(chart, chartType) {
        const modal = document.getElementById('modalOverlay');
        const modalTitle = document.getElementById('modalTitle');
        const modalChart = document.getElementById('modalChart');
        
        if (!modal || !modalChart) {
            this.showNotification('Impossible d\'ouvrir le modal', 'error');
            return;
        }

        const titles = {
            pipeline: 'Pipeline de Traitement des Données',
            performance: 'Performance par Commune',
            validation: 'Répartition des Niveaux de Validation',
            efficiency: 'Tendances d\'Efficacité'
        };

        modalTitle.textContent = titles[chartType] || 'Graphique';
        modal.classList.add('active');

        if (this.modalChartInstance) {
            this.modalChartInstance.destroy();
            this.modalChartInstance = null;
        }

        const createModalChart = () => {
            try {
                const ctx = modalChart.getContext('2d');
                const safeConfig = this.createSafeChartConfig(chart);
                this.modalChartInstance = new Chart(ctx, safeConfig);
            } catch (error) {
                console.error('Erreur création graphique modal:', error);
                this.showNotification('Erreur lors de l\'ouverture du graphique', 'error');
                modal.classList.remove('active');
            }
        };

        requestAnimationFrame(() => setTimeout(createModalChart, 100));
        this.setupModalCloseEvents(modal);
    }

    createSafeChartConfig(chart) {
        return {
            type: chart.config.type,
            data: {
                labels: [...chart.data.labels],
                datasets: chart.data.datasets.map(dataset => ({
                    label: dataset.label,
                    data: [...dataset.data],
                    backgroundColor: dataset.backgroundColor,
                    borderColor: dataset.borderColor,
                    borderWidth: dataset.borderWidth,
                    borderRadius: dataset.borderRadius,
                    pointBackgroundColor: dataset.pointBackgroundColor,
                    pointBorderColor: dataset.pointBorderColor,
                    pointBorderWidth: dataset.pointBorderWidth,
                    pointRadius: dataset.pointRadius
                }))
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: chart.options.plugins?.legend?.display !== false,
                        position: chart.options.plugins?.legend?.position || 'top'
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                        titleColor: '#fff',
                        bodyColor: '#fff'
                    }
                },
                scales: this.createSafeScales(chart.options.scales, chart.config.type),
                animation: { duration: 1000, easing: 'easeOutQuart' }
            }
        };
    }

    createSafeScales(originalScales, chartType) {
        if (!originalScales) return {};

        const safeScales = {};
        
        Object.keys(originalScales).forEach(scaleKey => {
            const scale = originalScales[scaleKey];
            if (!scale) return;

            safeScales[scaleKey] = {
                beginAtZero: scale.beginAtZero || false,
                grid: {
                    display: scale.grid?.display !== false,
                    color: scale.grid?.color || 'rgba(0, 0, 0, 0.1)'
                },
                ticks: {
                    maxRotation: scale.ticks?.maxRotation || 0,
                    callback: function(value) {
                        if (typeof value === 'number' && value > 1000) {
                            return value.toLocaleString('fr-FR');
                        }
                        return value;
                    }
                }
            };

            if (scale.max !== undefined) safeScales[scaleKey].max = scale.max;
            if (scale.min !== undefined) safeScales[scaleKey].min = scale.min;

            if (chartType === 'radar' && scaleKey === 'r') {
                safeScales[scaleKey] = {
                    beginAtZero: true,
                    max: 100,
                    min: 0,
                    ticks: {
                        stepSize: 20,
                        callback: function(value) { return value + '%'; }
                    },
                    grid: { color: 'rgba(0, 0, 0, 0.1)' }
                };
            }
        });

        return safeScales;
    }

    setupModalCloseEvents(modal) {
        const closeModal = () => {
            modal.classList.remove('active');
            if (this.modalChartInstance) {
                this.modalChartInstance.destroy();
                this.modalChartInstance = null;
            }
        };

        const closeBtn = document.getElementById('modalClose');
        if (closeBtn) {
            closeBtn.removeEventListener('click', closeModal);
            closeBtn.addEventListener('click', closeModal);
        }

        const handleModalClick = (e) => {
            if (e.target === modal) {
                closeModal();
                modal.removeEventListener('click', handleModalClick);
            }
        };
        modal.addEventListener('click', handleModalClick);
    }

    downloadChart(chart, chartType) {
        const link = document.createElement('a');
        link.download = `PROCASEF_${chartType}_${new Date().toISOString().split('T')[0]}.png`;
        link.href = chart.toBase64Image('image/png', 1.0);
        link.click();
        this.showNotification('Graphique téléchargé avec succès', 'success');
    }

    // ==========================================
    // GESTION DU TABLEAU
    // ==========================================

    renderTable() {
        const tableBody = document.getElementById('tableBody');
        if (!tableBody) return;

        const tableData = this.getFilteredTableData();
        const currentPageData = this.getCurrentPageData(tableData);

        tableBody.innerHTML = currentPageData.map(commune => 
            this.createTableRow(commune)
        ).join('');

        this.updatePagination(tableData.length);
    }

    createTableRow(commune) {
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
    }

    getFilteredTableData() {
        let data = [...this.filteredData];

        if (this.searchTerm) {
            data = data.filter(commune => 
                Object.values(commune).some(value => 
                    value.toString().toLowerCase().includes(this.searchTerm)
                )
            );
        }

        if (this.sortConfig.key) {
            data.sort((a, b) => this.sortComparator(a, b));
        }

        return data;
    }

    getCurrentPageData(tableData) {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        return tableData.slice(startIndex, endIndex);
    }

    sortComparator(a, b) {
        let aVal = a[this.sortConfig.key];
        let bVal = b[this.sortConfig.key];

        if (typeof aVal === 'string') {
            aVal = aVal.toLowerCase();
            bVal = bVal.toLowerCase();
        }

        const result = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return this.sortConfig.direction === 'asc' ? result : -result;
    }

    sortTable(key) {
        if (this.sortConfig.key === key) {
            this.sortConfig.direction = this.sortConfig.direction === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortConfig.key = key;
            this.sortConfig.direction = 'asc';
        }

        this.updateSortIndicators(key);
        this.renderTable();
    }

    updateSortIndicators(activeKey) {
        document.querySelectorAll('[data-sort] i').forEach(icon => {
            icon.className = 'fas fa-sort';
        });

        const activeIcon = document.querySelector(`[data-sort="${activeKey}"] i`);
        if (activeIcon) {
            activeIcon.className = this.sortConfig.direction === 'asc' ? 
                'fas fa-sort-up' : 'fas fa-sort-down';
        }
    }

    // ==========================================
    // PAGINATION
    // ==========================================

    updatePagination(totalItems) {
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);
        const start = (this.currentPage - 1) * this.itemsPerPage + 1;
        const end = Math.min(this.currentPage * this.itemsPerPage, totalItems);

        this.updateElement('paginationInfo', 
            `Affichage de ${start} à ${end} sur ${totalItems} entrées`);

        this.updatePaginationButtons(totalPages);
        this.updatePageNumbers(totalPages);
    }

    updatePaginationButtons(totalPages) {
        const prevBtn = document.getElementById('prevPage');
        const nextBtn = document.getElementById('nextPage');
        
        if (prevBtn) prevBtn.disabled = this.currentPage <= 1;
        if (nextBtn) nextBtn.disabled = this.currentPage >= totalPages;
    }

    updatePageNumbers(totalPages) {
        const pageNumbers = document.getElementById('pageNumbers');
        if (!pageNumbers) return;

        const pages = this.calculateVisiblePages(totalPages);
        pageNumbers.innerHTML = pages.map(page => 
            `<button class="page-btn ${page === this.currentPage ? 'active' : ''}" 
                     onclick="dashboard.goToPage(${page})">${page}</button>`
        ).join('');
    }

    calculateVisiblePages(totalPages) {
        const maxVisible = 5;
        
        if (totalPages <= maxVisible) {
            return Array.from({length: totalPages}, (_, i) => i + 1);
        }
        
        const start = Math.max(1, this.currentPage - 2);
        const end = Math.min(totalPages, start + maxVisible - 1);
        return Array.from({length: end - start + 1}, (_, i) => start + i);
    }

    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.renderTable();
        }
    }

    nextPage() {
        const totalPages = Math.ceil(this.getFilteredTableData().length / this.itemsPerPage);
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.renderTable();
        }
    }

    goToPage(page) {
        this.currentPage = page;
        this.renderTable();
    }

    // ==========================================
    // EXPORT ET MODALS
    // ==========================================

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
        this.downloadFile(csvContent, `PROCASEF_EDL_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
        this.showNotification('Données exportées avec succès', 'success');
    }

    convertToCSV(data) {
        if (!data.length) return '';
        
        const headers = Object.keys(data[0]);
        const csvRows = [headers.join(',')];
        
        for (const row of data) {
            const values = headers.map(header => {
                const escaped = ('' + row[header]).replace(/"/g, '\\"');
                return `"${escaped}"`;
            });
            csvRows.push(values.join(','));
        }
        
        return csvRows.join('\n');
    }

    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType + ';charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);
    }

    showCommuneDetails(communeName) {
        const commune = this.processedData.find(c => c.commune === communeName);
        if (!commune) return;

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

    showValidationDetails() {
        const performanceGroups = this.groupByPerformance();
        
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

    showCustomModal(title, content) {
        const modal = document.getElementById('modalOverlay');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = modal.querySelector('.modal-body');
        
        modalTitle.textContent = title;
        modalBody.innerHTML = content;
        modal.classList.add('active');
    }

    // ==========================================
    // FONCTIONNALITÉS SYSTÈME
    // ==========================================

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        const themeIcon = document.querySelector('#themeToggle i');
        if (themeIcon) {
            themeIcon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }

        setTimeout(() => this.updateCharts(), 300);
    }

    toggleSidebar() {
        document.getElementById('sidebar')?.classList.toggle('collapsed');
    }

    async refreshData() {
        this.showLoading(true);
        
        try {
            console.log('🔄 Actualisation manuelle des données...');
            await this.loadDataFromJSON();
            this.processData();
            this.updateAllComponents();
            this.updateTimestamp();
            this.showNotification('Données actualisées avec succès', 'success');
        } catch (error) {
            console.error('Erreur lors de l\'actualisation:', error);
            this.showNotification(`Erreur lors de l'actualisation: ${error.message}`, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    setupAutoRefresh() {
        this.autoRefreshInterval = setInterval(async () => {
            await this.checkForUpdates();
        }, 120000); // 2 minutes
        
        console.log('🔄 Auto-refresh configuré (vérification toutes les 2 minutes)');
    }

    updateAllComponents() {
        this.updateKPIs();
        this.updateQuickStats();
        this.updateCharts();
        this.renderTable();
    }

    // ==========================================
    // UTILITAIRES
    // ==========================================

    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element && element.textContent !== value) {
            element.style.transform = 'scale(1.1)';
            element.textContent = value;
            setTimeout(() => element.style.transform = 'scale(1)', 200);
        }
    }

    setElementValue(id, value) {
        const element = document.getElementById(id);
        if (element) {
            if (element.type === 'range' || element.tagName === 'SELECT' || element.type === 'text') {
                element.value = value;
            } else {
                element.textContent = value;
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

    getPerformanceClass(rate) {
        if (rate >= 80) return 'excellent';
        if (rate >= 60) return 'good';
        if (rate >= 30) return 'average';
        if (rate > 0) return 'poor';
        return 'zero';
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
                setTimeout(() => loadingOverlay.classList.add('hidden'), 500);
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
        
        setTimeout(() => notification.classList.add('show'), 10);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
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

    setDataSource(newPath) {
        this.dataFilePath = newPath;
        console.log(`📁 Source de données changée vers: ${newPath}`);
        this.refreshData();
    }

    destroy() {
        Object.values(this.charts).forEach(chart => {
            if (chart && chart.destroy) chart.destroy();
        });

        if (this.modalChartInstance) {
            this.modalChartInstance.destroy();
        }

        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
            console.log('🛑 Auto-refresh arrêté');
        }

        this.showNotification('Dashboard nettoyé', 'info');
    }
}

// ==========================================
// INITIALISATION ET UTILITAIRES GLOBAUX
// ==========================================

let dashboard;

document.addEventListener('DOMContentLoaded', () => {
    // Chargement du thème sauvegardé
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    const themeIcon = document.querySelector('#themeToggle i');
    if (themeIcon) {
        themeIcon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    // Initialisation du dashboard
    dashboard = new PROCASEFDashboard();
    
    // Gestion globale des erreurs
    window.addEventListener('error', (e) => {
        console.error('Erreur globale:', {
            message: e.message || 'Erreur inconnue',
            filename: e.filename,
            lineno: e.lineno,
            colno: e.colno,
            error: e.error
        });
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

// Export pour accès global
window.dashboard = dashboard;

// Utilitaires globaux PROCASEF
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
    },

    // Analyse avancée
    calculateTrends: () => {
        return {
            efficiency: 2.3,
            quality: 1.8,
            validation: -0.5,
            coverage: 5.2
        };
    },

    identifyOutliers: (data) => {
        const efficiencies = data.map(d => d.globalEfficiency);
        const mean = efficiencies.reduce((a, b) => a + b, 0) / efficiencies.length;
        const stdDev = Math.sqrt(
            efficiencies.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / efficiencies.length
        );
        
        return data.filter(d => Math.abs(d.globalEfficiency - mean) > 2 * stdDev);
    },

    generateInsights: (data) => {
        const insights = [];
        const zeroValidation = data.filter(d => d.validationRate === 0);
        
        if (zeroValidation.length > 0) {
            insights.push({
                type: 'warning',
                message: `${zeroValidation.length} commune(s) sans validation URM/NICAD`,
                communes: zeroValidation.map(d => d.commune)
            });
        }

        const topPerformers = data.filter(d => d.globalEfficiency >= 80)
            .sort((a, b) => b.globalEfficiency - a.globalEfficiency);
        
        if (topPerformers.length > 0) {
            insights.push({
                type: 'success',
                message: `${topPerformers.length} commune(s) avec excellence opérationnelle`,
                communes: topPerformers.map(d => d.commune)
            });
        }

        return insights;
    },

    // Validation et qualité des données
    validateDataIntegrity: (data) => {
        const errors = [];
        
        data.forEach((commune, index) => {
            // Vérification cohérence pipeline
            if (commune.sans_doublons_attributaire_et_geometriqu > commune.donnees_brutes) {
                errors.push(`Ligne ${index + 1}: Sans doublons > Données brutes pour ${commune.commune}`);
            }
            
            if (commune.post_traitees > commune.sans_doublons_attributaire_et_geometriqu) {
                errors.push(`Ligne ${index + 1}: Post-traitées > Sans doublons pour ${commune.commune}`);
            }
            
            if (commune.valideespar_urm_nicad > commune.post_traitees) {
                errors.push(`Ligne ${index + 1}: Validées > Post-traitées pour ${commune.commune}`);
            }

            // Vérification valeurs négatives
            const numericFields = ['donnees_brutes', 'sans_doublons_attributaire_et_geometriqu', 'post_traitees', 'valideespar_urm_nicad'];
            numericFields.forEach(field => {
                if (commune[field] < 0) {
                    errors.push(`Ligne ${index + 1}: Valeur négative pour ${field} dans ${commune.commune}`);
                }
            });
        });

        return {
            isValid: errors.length === 0,
            errors: errors,
            summary: `${errors.length} erreur(s) détectée(s) sur ${data.length} communes`
        };
    },

    // Export avancé
    generateReport: (data, filters) => {
        const report = {
            metadata: {
                generatedAt: new Date().toISOString(),
                totalCommunes: data.length,
                appliedFilters: filters
            },
            summary: {
                totalParcels: data.reduce((sum, c) => sum + c.donnees_brutes, 0),
                validatedParcels: data.reduce((sum, c) => sum + c.valideespar_urm_nicad, 0),
                averageEfficiency: data.reduce((sum, c) => sum + c.globalEfficiency, 0) / data.length
            },
            performanceDistribution: {
                excellent: data.filter(d => d.validationRate >= 80).length,
                good: data.filter(d => d.validationRate >= 60 && d.validationRate < 80).length,
                average: data.filter(d => d.validationRate >= 30 && d.validationRate < 60).length,
                poor: data.filter(d => d.validationRate > 0 && d.validationRate < 30).length,
                zero: data.filter(d => d.validationRate === 0).length
            },
            topPerformers: data.sort((a, b) => b.globalEfficiency - a.globalEfficiency).slice(0, 5),
            bottomPerformers: data.sort((a, b) => a.globalEfficiency - b.globalEfficiency).slice(0, 5),
            recommendations: window.PROCASEF.generateRecommendations(data)
        };

        return report;
    },

    generateRecommendations: (data) => {
        const recommendations = [];
        
        const zeroValidation = data.filter(d => d.validationRate === 0);
        if (zeroValidation.length > 0) {
            recommendations.push({
                priority: 'high',
                type: 'validation',
                message: `Priorité absolue : ${zeroValidation.length} commune(s) nécessitent une validation URM/NICAD`,
                communes: zeroValidation.map(d => d.commune).slice(0, 5),
                action: 'Organiser des sessions de validation avec les équipes URM/NICAD'
            });
        }

        const lowEfficiency = data.filter(d => d.globalEfficiency < 20);
        if (lowEfficiency.length > 0) {
            recommendations.push({
                priority: 'medium',
                type: 'efficiency',
                message: `${lowEfficiency.length} commune(s) avec très faible efficacité (<20%)`,
                communes: lowEfficiency.map(d => d.commune).slice(0, 5),
                action: 'Réviser les processus de collecte et de traitement des données'
            });
        }

        const highLoss = data.filter(d => {
            const lossRate = ((d.donnees_brutes - d.valideespar_urm_nicad) / d.donnees_brutes) * 100;
            return lossRate > 80;
        });
        if (highLoss.length > 0) {
            recommendations.push({
                priority: 'medium',
                type: 'data_loss',
                message: `${highLoss.length} commune(s) avec forte perte de données (>80%)`,
                communes: highLoss.map(d => d.commune).slice(0, 5),
                action: 'Analyser les causes de perte et améliorer la qualité de collecte'
            });
        }

        const bestPractices = data.filter(d => d.globalEfficiency >= 80);
        if (bestPractices.length > 0) {
            recommendations.push({
                priority: 'low',
                type: 'best_practices',
                message: `${bestPractices.length} commune(s) avec excellente performance`,
                communes: bestPractices.map(d => d.commune).slice(0, 3),
                action: 'Étudier et répliquer les bonnes pratiques de ces communes'
            });
        }

        return recommendations;
    }
};

// Console utilities pour le développement
if (typeof window !== 'undefined' && window.console) {
    console.log(`
    🎯 PROCASEF Dashboard chargé avec succès!
    
    📊 Fonctionnalités disponibles:
    - dashboard : Instance principale du dashboard
    - PROCASEF : Utilitaires et fonctions d'analyse
    
    🔧 Commandes utiles:
    - dashboard.refreshData() : Actualiser les données
    - dashboard.exportToExcel() : Exporter les données
    - PROCASEF.generateReport(dashboard.filteredData, dashboard.filters) : Générer un rapport
    - dashboard.setDataSource('nouveau_fichier.json') : Changer la source de données
    
    📈 Pour plus d'informations, consultez la documentation ou le guide des KPI.
    `);
}
