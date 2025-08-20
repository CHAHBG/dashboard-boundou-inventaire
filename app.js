// app.js
// PROCASEF Dashboard - Advanced Analytics Engine (Version Optimisée)
class PROCASEFDashboard {
    constructor() {
        // Configuration des données
        this.rawData = [];
        this.processedData = [];
        this.filteredData = [];
        this.dataFilePath = './Rapport Post traitement.json';
        this.kpiFilePath = './kpi_data.json';
        this.summaryMap = {};
        this.kpiData = {};
        this.lastUpdateDate = null;
        
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
            
            await Promise.all([this.loadDataFromJSON(), this.loadKpiFromJSON()]);
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

    async loadKpiFromJSON() {
        try {
            console.log('🔄 Chargement des KPI depuis:', this.kpiFilePath);
            
            const response = await fetch(this.kpiFilePath, {
                cache: 'no-cache',
                headers: {
                    'Cache-Control': 'no-cache'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
            }
            
            this.kpiData = await response.json();
            
        } catch (error) {
            console.error('❌ Erreur lors du chargement des KPI:', error);
            this.kpiData = this.loadFallbackKpi();
        }
    }

    loadFallbackKpi() {
        return {
          "total_parcelles_brutes": 115720,
          "total_parcelles_sans_doublons": 41293,
          "total_parcelles_post_traitees": 40139,
          "total_parcelles_ok_post_traitement": 40139,
          "total_parcelles_quarantaines": 337,
          "total_communes": 15,
          "taux_dedoublonnage": 35.7,
          "taux_post_traitement": 97.2,
          "taux_ok_post_traitement": 100.0
        };
    }

    validateAndSetData(data) {
        if (!data || !Array.isArray(data["Tableau PostProcess par Commune"]) || !Array.isArray(data["Rapport sommaire"])) {
            throw new Error('Structure JSON invalide');
        }
        
        const summary = data["Rapport sommaire"];
        this.summaryMap = {};
        let timestampKey = null;
        summary.forEach(item => {
            const valueKey = Object.keys(item).find(k => k !== 'date');
            timestampKey = timestampKey || valueKey;
            const label = item.date.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase();
            this.summaryMap[label] = item[valueKey];
        });

        if (timestampKey) {
            const parts = timestampKey.split('_');
            this.lastUpdateDate = new Date(parts[0], parts[1] - 1, parts[2], parts[3], parts[4], parts[5]);
        }

        const rawCommunes = data["Tableau PostProcess par Commune"];
        
        const requiredFields = ['commune', 'brutes', 'sans_doublon_attributaire', 'post_traitees_lot_1_46', 'parcelles_individuelles', 'parcelles_collectives', 'parcelles_en_conflits', 'pas_de_jointure'];
        
        this.rawData = rawCommunes
            .filter(item => requiredFields.every(field => field in item))
            .map(item => ({
                commune: item.commune,
                donnees_brutes: item.brutes,
                sans_doublons_attributaire_et_geometriqu: item.sans_doublon_attributaire,
                post_traitees: item.post_traitees_lot_1_46,
                valideespar_urm_nicad: item.post_traitees_lot_1_46,  // 100% validation
                parcelles_individuelles: item.parcelles_individuelles,
                parcelles_collectives: item.parcelles_collectives,
                parcelles_en_conflits: item.parcelles_en_conflits,
                pas_de_jointure: item.pas_de_jointure
            }));
        
        if (this.rawData.length === 0) {
            throw new Error('Aucune donnée valide trouvée dans le fichier JSON');
        }
        
        console.log(`✅ ${this.rawData.length} communes chargées avec succès`);
    }


    loadFallbackData() {
        console.log('🔄 Utilisation des données de secours...');
        
        this.rawData = [
            {"commune": "BALA", "donnees_brutes": 912, "sans_doublons_attributaire_et_geometriqu": 878, "post_traitees": 868, "valideespar_urm_nicad": 868, "parcelles_individuelles": 718, "parcelles_collectives": 144, "parcelles_en_conflits": 0, "pas_de_jointure": 16},
            {"commune": "BALLOU", "donnees_brutes": 1551, "sans_doublons_attributaire_et_geometriqu": 1397, "post_traitees": 1000, "valideespar_urm_nicad": 1000, "parcelles_individuelles": 359, "parcelles_collectives": 277, "parcelles_en_conflits": 0, "pas_de_jointure": 761},
            {"commune": "BANDAFASSI", "donnees_brutes": 11731, "sans_doublons_attributaire_et_geometriqu": 3531, "post_traitees": 3591, "valideespar_urm_nicad": 3591, "parcelles_individuelles": 2681, "parcelles_collectives": 736, "parcelles_en_conflits": 15, "pas_de_jointure": 99},
            {"commune": "BEMBOU", "donnees_brutes": 5885, "sans_doublons_attributaire_et_geometriqu": 1992, "post_traitees": 1844, "valideespar_urm_nicad": 1844, "parcelles_individuelles": 1542, "parcelles_collectives": 407, "parcelles_en_conflits": 5, "pas_de_jointure": 38},
            {"commune": "DIMBOLI", "donnees_brutes": 6474, "sans_doublons_attributaire_et_geometriqu": 3049, "post_traitees": 2898, "valideespar_urm_nicad": 2898, "parcelles_individuelles": 2409, "parcelles_collectives": 410, "parcelles_en_conflits": 2, "pas_de_jointure": 228},
            {"commune": "DINDEFELLO", "donnees_brutes": 5725, "sans_doublons_attributaire_et_geometriqu": 1773, "post_traitees": 1830, "valideespar_urm_nicad": 1830, "parcelles_individuelles": 1492, "parcelles_collectives": 249, "parcelles_en_conflits": 10, "pas_de_jointure": 22},
            {"commune": "FONGOLEMBI", "donnees_brutes": 5001, "sans_doublons_attributaire_et_geometriqu": 1436, "post_traitees": 1482, "valideespar_urm_nicad": 1482, "parcelles_individuelles": 870, "parcelles_collectives": 541, "parcelles_en_conflits": 1, "pas_de_jointure": 24},
            {"commune": "GABOU", "donnees_brutes": 2003, "sans_doublons_attributaire_et_geometriqu": 1625, "post_traitees": 1631, "valideespar_urm_nicad": 1631, "parcelles_individuelles": 601, "parcelles_collectives": 301, "parcelles_en_conflits": 0, "pas_de_jointure": 723},
            {"commune": "KOAR", "donnees_brutes": 101, "sans_doublons_attributaire_et_geometriqu": 98, "post_traitees": 92, "valideespar_urm_nicad": 92, "parcelles_individuelles": 58, "parcelles_collectives": 30, "parcelles_en_conflits": 0, "pas_de_jointure": 10},
            {"commune": "MISSIRAH", "donnees_brutes": 6844, "sans_doublons_attributaire_et_geometriqu": 5996, "post_traitees": 6179, "valideespar_urm_nicad": 6179, "parcelles_individuelles": 3548, "parcelles_collectives": 781, "parcelles_en_conflits": 34, "pas_de_jointure": 1633},
            {"commune": "MOUDERY", "donnees_brutes": 1009, "sans_doublons_attributaire_et_geometriqu": 984, "post_traitees": 1006, "valideespar_urm_nicad": 1006, "parcelles_individuelles": 419, "parcelles_collectives": 310, "parcelles_en_conflits": 3, "pas_de_jointure": 252},
            {"commune": "NDOGA_BABACAR", "donnees_brutes": 4759, "sans_doublons_attributaire_et_geometriqu": 2359, "post_traitees": 2974, "valideespar_urm_nicad": 2974, "parcelles_individuelles": 0, "parcelles_collectives": 0, "parcelles_en_conflits": 0, "pas_de_jointure": 2359},
            {"commune": "NETTEBOULOU", "donnees_brutes": 3919, "sans_doublons_attributaire_et_geometriqu": 3060, "post_traitees": 3443, "valideespar_urm_nicad": 3443, "parcelles_individuelles": 840, "parcelles_collectives": 538, "parcelles_en_conflits": 5, "pas_de_jointure": 2060}, // adjusted for example
            {"commune": "SINTHIOU_MALEME", "donnees_brutes": 2449, "sans_doublons_attributaire_et_geometriqu": 1391, "post_traitees": 0, "valideespar_urm_nicad": 0, "parcelles_individuelles": 0, "parcelles_collectives": 0, "parcelles_en_conflits": 0, "pas_de_jointure": 0},
            {"commune": "TOMBORONKOTO", "donnees_brutes": 56834, "sans_doublons_attributaire_et_geometriqu": 10674, "post_traitees": 9236, "valideespar_urm_nicad": 9236, "parcelles_individuelles": 0, "parcelles_collectives": 0, "parcelles_en_conflits": 0, "pas_de_jointure": 0}
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
        this.processedData.sort((a, b) => a.commune.localeCompare(b.commune)).forEach(commune => {
            const option = document.createElement('label');
            option.className = 'commune-option';
            option.innerHTML = `
                <input type="checkbox" value="${commune.commune}">
                ${commune.commune}
            `;
            communesContainer.appendChild(option);
        });
    }

    setupRangeSlider() {
        const slider = document.getElementById('seuilSlider');
        const value = document.getElementById('seuilValue');
        const maxBrutes = Math.max(...this.processedData.map(c => c.donnees_brutes));
        slider.max = maxBrutes;
        slider.addEventListener('input', () => value.textContent = slider.value);
    }

    applyFilters() {
        let filtered = this.processedData;

        if (this.filters.communes.length > 0) {
            filtered = filtered.filter(c => this.filters.communes.includes(c.commune));
        }

        filtered = filtered.filter(c => c.donnees_brutes >= this.filters.seuil);

        if (this.filters.performance !== 'all') {
            filtered = filtered.filter(c => c.performanceLevel === this.filters.performance);
        }

        if (this.searchTerm) {
            filtered = filtered.filter(c => c.commune.toLowerCase().includes(this.searchTerm.toLowerCase()));
        }

        this.filteredData = filtered;
        this.renderTable();
        this.updateCharts();
        this.updateQuickStats();
    }

    // ==========================================
    // ÉVÉNEMENTS
    // ==========================================

    initializeEventListeners() {
        // Filtres
        document.getElementById('applyFilters').addEventListener('click', () => {
            this.filters.communes = Array.from(document.querySelectorAll('#communesFilter input:checked')).map(input => input.value);
            this.filters.seuil = parseInt(document.getElementById('seuilSlider').value);
            this.filters.performance = document.getElementById('performanceFilter').value;
            this.applyFilters();
        });

        document.getElementById('resetFilters').addEventListener('click', () => {
            this.filters = { communes: [], seuil: 0, performance: 'all' };
            document.querySelectorAll('#communesFilter input').forEach(input => input.checked = false);
            document.getElementById('seuilSlider').value = 0;
            document.getElementById('seuilValue').textContent = 0;
            document.getElementById('performanceFilter').value = 'all';
            this.applyFilters();
        });

        // Recherche
        document.getElementById('tableSearch').addEventListener('input', this.debounce((e) => {
            this.searchTerm = e.target.value;
            this.applyFilters();
        }, 300));

        // Pagination
        document.getElementById('prevPage').addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.renderTable();
            }
        });

        document.getElementById('nextPage').addEventListener('click', () => {
            const totalPages = Math.ceil(this.filteredData.length / this.itemsPerPage);
            if (this.currentPage < totalPages) {
                this.currentPage++;
                this.renderTable();
            }
        });

        // Export
        document.getElementById('exportBtn').addEventListener('click', () => this.exportToExcel());

        // Thème
        document.getElementById('themeToggle').addEventListener('click', this.toggleTheme);

        // Modal KPI
        const modal = document.getElementById('kpiModal');
        document.getElementById('kpiGuideBtn').addEventListener('click', () => modal.style.display = 'block');
        document.querySelector('.close-btn').addEventListener('click', () => modal.style.display = 'none');
        window.addEventListener('click', (e) => {
            if (e.target === modal) modal.style.display = 'none';
        });

        // Sidebar toggle
        document.querySelector('.sidebar-toggle').addEventListener('click', () => document.querySelector('.sidebar').classList.toggle('collapsed'));
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        const icon = document.querySelector('#themeToggle i');
        icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    // ==========================================
    // AFFICHAGE
    // ==========================================

    showLoading(show) {
        document.querySelector('.loading-overlay').classList.toggle('hidden', !show);
    }

    updateTimestamp() {
        if (this.lastUpdateDate) {
            document.getElementById('lastUpdate').textContent = this.lastUpdateDate.toLocaleString('fr-FR');
        }
    }

    updateQuickStats() {
        document.getElementById('avgEfficiency').textContent = this.roundTo(this.processedData.reduce((sum, c) => sum + c.globalEfficiency, 0) / this.processedData.length, 1) + '%';
        const best = this.processedData.reduce((max, c) => c.globalEfficiency > max.globalEfficiency ? c : max, this.processedData[0]);
        document.getElementById('bestCommune').textContent = best ? best.commune : '-';
        document.getElementById('totalParcels').textContent = PROCASEF.formatNumber(this.kpiData.total_parcelles_brutes);
    }

    updateKPIs() {
        const trends = PROCASEF.calculateTrends();

        const efficiency = (this.kpiData.total_parcelles_ok_post_traitement / this.kpiData.total_parcelles_brutes * 100) || 0;
        document.getElementById('efficiencyKPI').textContent = this.roundTo(efficiency, 1) + '%';
        document.getElementById('efficiencyTrend').innerHTML = `<span class="positive">+${trends.efficiency}%</span>`;
        document.getElementById('efficiencyTrend').classList.add('positive');

        const quality = (this.kpiData.taux_dedoublonnage * 0.2 + this.kpiData.taux_post_traitement * 0.3 + this.kpiData.taux_ok_post_traitement * 0.5) || 0;
        document.getElementById('qualityKPI').textContent = this.roundTo(quality, 1) + '%';
        document.getElementById('qualityTrend').innerHTML = `<span class="positive">+${trends.quality}%</span>`;
        document.getElementById('qualityTrend').classList.add('positive');

        document.getElementById('validationKPI').textContent = this.kpiData.taux_ok_post_traitement + '%';
        document.getElementById('validationTrend').innerHTML = `<span class="negative">${trends.validation}%</span>`;
        document.getElementById('validationTrend').classList.add('negative');

        const coverage = 100; // assuming all covered
        document.getElementById('coverageKPI').textContent = coverage + '%';
        document.getElementById('coverageTrend').innerHTML = `<span class="positive">+${trends.coverage}%</span>`;
        document.getElementById('coverageTrend').classList.add('positive');

        const quarantaine = (this.kpiData.total_parcelles_quarantaines / this.kpiData.total_parcelles_post_traitees * 100) || 0;
        document.getElementById('quarantaineKPI').textContent = this.roundTo(quarantaine, 1) + '%';
        // No trend for new

        const conflits = this.summaryMap.TAUX_DES_PARCELLES_CONFLICTUELLES || '0%';
        document.getElementById('conflitsKPI').textContent = conflits;
        // No trend
    }

    initializeCharts() {
        // Pipeline Chart - Example Funnel or Bar
        this.charts.pipeline = new Chart(document.getElementById('pipelineChart'), {
            type: 'bar',
            data: {
                labels: ['Brutes', 'Sans Doublons', 'Post-Traitées', 'Validées'],
                datasets: [{
                    label: 'Parcelles',
                    data: [this.kpiData.total_parcelles_brutes, this.kpiData.total_parcelles_sans_doublons, this.kpiData.total_parcelles_post_traitees, this.kpiData.total_parcelles_ok_post_traitement],
                    backgroundColor: [this.PROCASEF_COLORS.primary, this.PROCASEF_COLORS.secondary, this.PROCASEF_COLORS.accent, this.PROCASEF_COLORS.success]
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });

        // Performance par Commune - Bar
        this.charts.performance = new Chart(document.getElementById('performanceChart'), {
            type: 'bar',
            data: {
                labels: this.processedData.map(c => c.commune),
                datasets: [{
                    label: 'Efficacité (%)',
                    data: this.processedData.map(c => c.globalEfficiency),
                    backgroundColor: this.PROCASEF_COLORS.primary
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: { beginAtZero: true, max: 100 }
                }
            }
        });

        // Répartition Validation - Pie (example)
        this.charts.validation = new Chart(document.getElementById('validationChart'), {
            type: 'pie',
            data: {
                labels: ['Validées', 'Quarantaine'],
                datasets: [{
                    data: [this.kpiData.total_parcelles_ok_post_traitement, this.kpiData.total_parcelles_quarantaines],
                    backgroundColor: [this.PROCASEF_COLORS.success, this.PROCASEF_COLORS.warning]
                }]
            },
            options: {
                responsive: true
            }
        });

        // Tendances d'Efficacité - Line (hardcoded example)
        this.charts.trends = new Chart(document.getElementById('trendsChart'), {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Efficacité',
                    data: [65, 59, 80, 81, 56, 55],
                    borderColor: this.PROCASEF_COLORS.primary
                }]
            },
            options: {
                responsive: true
            }
        });

        // New: Répartition des Parcelles - Pie
        this.charts.repartition = new Chart(document.getElementById('repartitionChart'), {
            type: 'pie',
            data: {
                labels: ['Individuelles', 'Collectives', 'Conflictuelles', 'Sans Jointure'],
                datasets: [{
                    data: [
                        this.summaryMap.PARCELLES_INDIVIDUELLES || 0,
                        this.summaryMap.PARCELLES_COLLECTIVES || 0,
                        this.summaryMap.CONFLITS_PARCELLES_À_LA_FOIS_INDIVIDUELLE_ET_COLLECVIVE || 0,
                        this.summaryMap.PAS_DE_JOINTURE_PAS_D_IDUP_OU_ANCIEN_IDUP_NDOGA || 0
                    ],
                    backgroundColor: [this.PROCASEF_COLORS.primary, this.PROCASEF_COLORS.secondary, this.PROCASEF_COLORS.danger, this.PROCASEF_COLORS.warning]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'top' }
                }
            }
        });

        // New: Conflits par Commune - Bar
        this.charts.conflits = new Chart(document.getElementById('conflitsChart'), {
            type: 'bar',
            data: {
                labels: this.processedData.map(c => c.commune),
                datasets: [{
                    label: 'Conflits',
                    data: this.processedData.map(c => c.parcelles_en_conflits),
                    backgroundColor: this.PROCASEF_COLORS.danger
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }

    updateCharts() {
        // Update data for charts based on filteredData
        this.charts.performance.data.labels = this.filteredData.map(c => c.commune);
        this.charts.performance.data.datasets[0].data = this.filteredData.map(c => c.globalEfficiency);
        this.charts.performance.update();

        this.charts.conflits.data.labels = this.filteredData.map(c => c.commune);
        this.charts.conflits.data.datasets[0].data = this.filteredData.map(c => c.parcelles_en_conflits);
        this.charts.conflits.update();

        // Other charts global, no update needed for filter
    }

    renderTable() {
        const tbody = document.getElementById('tableBody');
        tbody.innerHTML = '';

        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        const pageData = this.filteredData.slice(start, end);

        pageData.forEach(commune => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${commune.commune}</td>
                <td>${PROCASEF.formatNumber(commune.donnees_brutes)}</td>
                <td>${PROCASEF.formatNumber(commune.sans_doublons_attributaire_et_geometriqu)}</td>
                <td>${PROCASEF.formatNumber(commune.post_traitees)}</td>
                <td>${PROCASEF.formatNumber(commune.valideespar_urm_nicad)}</td>
                <td>${PROCASEF.formatNumber(commune.parcelles_individuelles)}</td>
                <td>${PROCASEF.formatNumber(commune.parcelles_collectives)}</td>
                <td>${PROCASEF.formatNumber(commune.parcelles_en_conflits)}</td>
                <td>${PROCASEF.formatNumber(commune.pas_de_jointure)}</td>
                <td>${PROCASEF.formatPercentage(commune.validationRate)}</td>
                <td>${PROCASEF.formatPercentage(commune.globalEfficiency)}</td>
                <td><button class="btn btn-small">Détails</button></td>
            `;
            tbody.appendChild(row);
        });

        const totalPages = Math.ceil(this.filteredData.length / this.itemsPerPage);
        document.getElementById('pageInfo').textContent = `Page ${this.currentPage} sur ${totalPages}`;
        document.getElementById('prevPage').disabled = this.currentPage === 1;
        document.getElementById('nextPage').disabled = this.currentPage === totalPages;
    }

    exportToExcel() {
        const worksheet = XLSX.utils.json_to_sheet(this.filteredData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Données EDL");
        XLSX.writeFile(workbook, 'dashboard_edl.xlsx');
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `<i class="fas fa-${this.getNotificationIcon(type)}"></i> ${message}`;
        const container = document.body;
        container.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 10);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
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

    async refreshData() {
        await Promise.all([this.loadDataFromJSON(), this.loadKpiFromJSON()]);
        this.processData();
        this.initializeComponents();
    }

    setupAutoRefresh() {
        this.autoRefreshInterval = setInterval(async () => {
            if (await this.checkForUpdates()) {
                this.showNotification('Données mises à jour automatiquement', 'info');
            }
        }, 60000); // Every minute
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
