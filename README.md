# 🎯 PROCASEF Dashboard EDL

Dashboard de suivi en temps réel du post-traitement des données de l'Enquête de Délimitation Locale (EDL) pour la région du Boundou.

## 📋 Table des matières
- [Fonctionnalités](#fonctionnalités)
- [Installation](#installation)
- [Structure des fichiers](#structure-des-fichiers)
- [Utilisation](#utilisation)
- [Configuration](#configuration)
- [API et Intégrations](#api-et-intégrations)
- [Dépannage](#dépannage)

## ✨ Fonctionnalités

### 📊 Indicateurs de Performance (KPI)
- **Efficacité Pipeline** : Rendement global du processus (Validées ÷ Brutes × 100)
- **Qualité Données** : Score composite pondéré des étapes de traitement
- **Taux Validation** : Proportion des données validées par URM/NICAD
- **Couverture** : Exhaustivité géographique du projet

### 📈 Visualisations Interactives
- **Pipeline de Traitement** : Graphique en barres du flux de données
- **Performance par Commune** : Comparaison des efficacités
- **Répartition Validation** : Distribution des niveaux de performance
- **Tendances d'Efficacité** : Radar chart des meilleures communes

### 🎛️ Fonctionnalités Avancées
- Filtrage multi-critères (communes, seuils, performance)
- Recherche en temps réel dans les données
- Tri et pagination du tableau
- Export CSV/Excel des données
- Mode sombre/clair
- Auto-actualisation des données
- Modals plein écran pour les graphiques
- Guide intégré des KPI

## 🚀 Installation

### Prérequis
- Serveur web (Apache, Nginx, ou serveur local)
- Navigateur moderne (Chrome, Firefox, Safari, Edge)

### Installation Simple
1. **Télécharger les fichiers**
   ```bash
   # Cloner ou télécharger les fichiers
   - index.html
   - app.js  
   - style.css (votre fichier CSS personnalisé)
   - EDL_PostTraitement.json
   ```

2. **Placer les fichiers**
   ```
   votre-projet/
   ├── index.html
   ├── app.js
   ├── style.css
   └── EDL_PostTraitement.json
   ```

3. **Lancer le serveur**
   ```bash
   # Option 1: Python
   python -m http.server 8000
   
   # Option 2: Node.js  
   npx serve .
   
   # Option 3: PHP
   php -S localhost:8000
   ```

4. **Accéder au dashboard**
   ```
   http://localhost:8000
   ```

## 📁 Structure des fichiers

```
PROCASEF-Dashboard/
├── index.html                    # Interface principale
├── app.js                       # Logique JavaScript
├── style.css                    # Styles (votre fichier)
├── EDL_PostTraitement.json      # Données source
├── README.md                    # Documentation
└── assets/ (optionnel)
    ├── images/
    └── docs/
```

## 📖 Utilisation

### Interface Principale

#### 🎛️ Barre de Navigation
- **Thème** : Basculer entre mode clair/sombre
- **Export** : Télécharger les données filtrées
- **Actualiser** : Recharger les données depuis le JSON

#### 🔍 Sidebar - Filtres
- **Communes** : Sélection multiple par cases à cocher
- **Seuil** : Curseur pour minimum de données brutes
- **Performance** : Menu déroulant par niveau
- **Actions** : Appliquer/Réinitialiser les filtres

#### 📊 Section KPI
- **Guide des KPI** : Modal explicatif des indicateurs
- Barres de progression animées
- Tendances avec flèches ↗️↘️

#### 📈 Graphiques Interactifs
- **Plein écran** : Icône d'expansion
- **Téléchargement** : Sauvegarde PNG
- **Détails** : Informations complémentaires

#### 📋 Tableau de Données
- **Recherche** : Filtrage textuel en temps réel
- **Tri** : Clic sur les en-têtes de colonnes
- **Pagination** : Navigation par pages
- **Actions** : Bouton détails par commune

### Données d'Entrée

#### Format JSON Requis
```json
[
  {
    "commune": "Nom de la commune",
    "donnees_brutes": 1000,
    "sans_doublons_attributaire_et_geometriqu": 950,
    "post_traitees": 900,
    "valideespar_urm_nicad": 850
  }
]
```

#### Champs Obligatoires
- `commune` : Nom de la commune (string)
- `donnees_brutes` : Parcelles collectées (number)
- `sans_doublons_attributaire_et_geometriqu` : Après dédoublonnage (number)
- `post_traitees` : Après post-traitement (number)
- `valideespar_urm_nicad` : Validées par URM/NICAD (number)

## ⚙️ Configuration

### Personnalisation des Couleurs
```javascript
// Dans app.js, modifier PROCASEF_COLORS
this.PROCASEF_COLORS = {
    primary: '#0072BC',      // Bleu principal
    secondary: '#00A651',    // Vert secondaire
    accent: '#F47920',       // Orange accent
    // ... autres couleurs
};
```

### Ajustement de la Source de Données
```javascript
// Changer le chemin du fichier JSON
dashboard.setDataSource('./nouveau_fichier.json');

// Ou modifier dans le constructeur
this.dataFilePath = './votre_fichier.json';
```

### Configuration Auto-refresh
```javascript
// Modifier l'intervalle (en millisecondes)
// 120000 = 2 minutes
this.autoRefreshInterval = setInterval(async () => {
    await this.checkForUpdates();
}, 120000);
```

## 🔌 API et Intégrations

### Fonctions Publiques Disponibles

#### Dashboard Principal
```javascript
// Actualiser les données
dashboard.refreshData();

// Exporter les données
dashboard.exportToExcel();

// Changer la source
dashboard.setDataSource('nouveau.json');

// Appliquer des filtres
dashboard.filters.communes = ['Bandafassi', 'Kedougou'];
dashboard.applyFilters();
```

#### Utilitaires PROCASEF
```javascript
// Formater des nombres
PROCASEF.formatNumber(1234567); // "1 234 567"

// Générer un rapport
const report = PROCASEF.generateReport(
    dashboard.filteredData, 
    dashboard.filters
);

// Valider l'intégrité des données
const validation = PROCASEF.validateDataIntegrity(data);
```

### Événements Personnalisés
```javascript
// Écouter les changements de données
document.addEventListener('dataUpdated', (e) => {
    console.log('Nouvelles données:', e.detail);
});

// Écouter les changements de filtres
document.addEventListener('filtersChanged', (e) => {
    console.log('Filtres appliqués:', e.detail);
});
```

## 🐛 Dépannage

### Problèmes Courants

#### ❌ "Fichier JSON non trouvé"
```
Solution:
1. Vérifier que EDL_PostTraitement.json est dans le même dossier
2. Utiliser un serveur web (pas file://)
3. Vérifier les permissions de fichier
```

#### ❌ "Graphiques ne s'affichent pas"
```
Solution:
1. Vérifier la console pour erreurs JavaScript
2. S'assurer que Chart.js est chargé
3. Vérifier que les données sont valides
```

#### ❌ "Données non mises à jour"
```
Solution:
1. Forcer actualisation (Ctrl+F5)
2. Vérifier le cache du navigateur
3. Utiliser dashboard.refreshData()
```

#### ❌ "Performance lente"
```
Solution:
1. Réduire le nombre de communes affichées
2. Augmenter l'intervalle d'auto-refresh
3. Optimiser les filtres utilisés
```

### Logs et Debugging

#### Console du Navigateur
```javascript
// Activer les logs détaillés
localStorage.setItem('debug', 'true');

// Vérifier l'état du dashboard  
console.log(dashboard.filteredData);
console.log(dashboard.filters);

// Test des fonctionnalités
dashboard.showNotification('Test', 'info');
```

#### Validation des Données
```javascript
// Tester l'intégrité
const validation = PROCASEF.validateDataIntegrity(dashboard.rawData);
if (!validation.isValid) {
    console.error('Erreurs détectées:', validation.errors);
}
```

## 📞 Support et Contact

### Ressources d'Aide
- **Guide des KPI** : Bouton dans l'interface
- **Console développeur** : F12 dans le navigateur
- **Documentation** : Ce fichier README

### Informations Système
```javascript
// Afficher les infos système
console.table({
    'Version Dashboard': '1.0.0',
    'Chart.js': Chart.version,
    'Communes chargées': dashboard.rawData.length,
    'Données filtrées': dashboard.filteredData.length
});
```

## 🔄 Mises à jour et Maintenance

### Sauvegarde des Données
```bash
# Sauvegarder régulièrement
cp EDL_PostTraitement.json EDL_PostTraitement_$(date +%Y%m%d).json
```

### Monitoring
```javascript
// Ajouter dans app.js pour surveillance
setInterval(() => {
    const errors = PROCASEF.validateDataIntegrity(dashboard.rawData);
    if (!errors.isValid) {
        console.warn('Problèmes détectés:', errors.summary);
    }
}, 300000); // Toutes les 5 minutes
```

---

**Développé pour le Projet PROCASEF - Région du Boundou, Sénégal**  
*Dashboard de suivi EDL - Version 1.0.0*
