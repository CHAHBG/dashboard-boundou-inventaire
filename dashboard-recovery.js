/**
 * Dashboard Recovery Script
 * This script provides recovery mechanisms for the dashboard when initialization fails.
 * It serves as a safety net when the main application code encounters problems.
 */

(function() {
  console.log('Dashboard Recovery Script loaded');
  
  // Wait for DOM to be ready
  document.addEventListener('DOMContentLoaded', function() {
    console.log('Recovery module: DOM content loaded');
    
    // Check if dashboard global state exists
    if (!window.EDL_DASHBOARD) {
      console.warn('Recovery module: Global state not found, creating it');
      window.EDL_DASHBOARD = {
        loaded: false,
        scriptsLoaded: {},
        ready: false,
        init: null,
        errors: []
      };
    }
    
    // Add recovery button to UI if not already present
    setTimeout(addRecoveryButton, 3000);
    
    // Check dashboard initialization status after a delay
    setTimeout(checkDashboardStatus, 5000);
  });
  
  /**
   * Adds a recovery button to the UI
   */
  function addRecoveryButton() {
    // Only add if dashboard isn't ready and button doesn't already exist
    if ((window.EDL_DASHBOARD && !window.EDL_DASHBOARD.ready) || !window.EDL_DASHBOARD) {
      if (!document.getElementById('dashboard-recovery-btn')) {
        const btn = document.createElement('button');
        btn.id = 'dashboard-recovery-btn';
        btn.innerText = 'Réparer le tableau de bord';
        btn.style.position = 'fixed';
        btn.style.bottom = '20px';
        btn.style.right = '20px';
        btn.style.zIndex = '9999';
        btn.style.padding = '10px 15px';
        btn.style.backgroundColor = '#3B82F6';
        btn.style.color = 'white';
        btn.style.border = 'none';
        btn.style.borderRadius = '5px';
        btn.style.cursor = 'pointer';
        btn.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
        
        btn.addEventListener('click', fixDashboard);
        document.body.appendChild(btn);
        
        console.log('Recovery button added to UI');
      }
    }
  }
  
  /**
   * Checks if the dashboard is properly initialized
   */
  function checkDashboardStatus() {
    console.log('Recovery module: Checking dashboard status');
    
    // Check if content is loaded
    const dashboardContent = document.getElementById('dashboard-content');
    const dataLoaded = window.dashboardData !== null && window.dashboardData !== undefined;
    
    if ((!dashboardContent || !dashboardContent.children.length) && !dataLoaded) {
      console.warn('Recovery module: Dashboard appears to be not initialized properly');
      
      // Add recovery notice
      const notice = document.createElement('div');
      notice.id = 'dashboard-recovery-notice';
      notice.style.position = 'fixed';
      notice.style.top = '20px';
      notice.style.left = '50%';
      notice.style.transform = 'translateX(-50%)';
      notice.style.backgroundColor = '#FEF2F2';
      notice.style.color = '#B91C1C';
      notice.style.padding = '10px 20px';
      notice.style.borderRadius = '5px';
      notice.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
      notice.style.zIndex = '9999';
      notice.style.fontSize = '14px';
      notice.innerHTML = 'Le tableau de bord n\'a pas pu s\'initialiser correctement. <a href="#" id="try-recovery-link" style="color:#2563EB;text-decoration:underline;">Cliquer ici pour essayer de réparer.</a>';
      
      // Only add if not already present
      if (!document.getElementById('dashboard-recovery-notice')) {
        document.body.appendChild(notice);
        document.getElementById('try-recovery-link').addEventListener('click', function(e) {
          e.preventDefault();
          fixDashboard();
        });
      }
    }
  }

  // Function to fix common initialization issues
  window.fixDashboard = function() {
    console.log('Attempting to fix dashboard initialization...');
    
    // First, check if key objects/functions exist
    const diagnostics = {
      dashboardDataExists: typeof dashboardData !== 'undefined',
      initializeDashboardExists: typeof initializeDashboard === 'function' || 
                               typeof window.initializeDashboard === 'function' ||
                               (window.EDL_DASHBOARD && typeof window.EDL_DASHBOARD.init === 'function'),
      kpiGridExists: document.getElementById('kpiGrid') !== null,
      chartsExists: typeof charts !== 'undefined' && charts !== null,
      chartJsExists: typeof Chart !== 'undefined',
      globalStateExists: typeof window.EDL_DASHBOARD !== 'undefined'
    };
    
    console.log('Diagnostics:', diagnostics);
    
    // Create global state if it doesn't exist
    if (!diagnostics.globalStateExists) {
      console.log('Creating global state object');
      window.EDL_DASHBOARD = {
        loaded: false,
        scriptsLoaded: {},
        ready: false,
        init: null,
        errors: []
      };
    }
    
    // Try to fix issues based on diagnostics
    if (!diagnostics.dashboardDataExists) {
      console.log('Creating empty dashboardData object');
      window.dashboardData = [];
    }
    
    if (!diagnostics.chartsExists) {
      console.log('Creating empty charts object');
      window.charts = {};
    }
    
    // Show loading indicator if available
    if (typeof showLoadingIndicator === 'function') {
      showLoadingIndicator('Tentative de réparation du tableau de bord...');
    } else {
      // Create simple loading indicator if the function is not available
      const loader = document.createElement('div');
      loader.id = 'temp-loading-indicator';
      loader.innerText = 'Réparation en cours...';
      loader.style.position = 'fixed';
      loader.style.top = '50%';
      loader.style.left = '50%';
      loader.style.transform = 'translate(-50%, -50%)';
      loader.style.backgroundColor = 'rgba(0,0,0,0.7)';
      loader.style.color = 'white';
      loader.style.padding = '20px';
      loader.style.borderRadius = '5px';
      loader.style.zIndex = '10000';
      document.body.appendChild(loader);
    }
    
    // Try to initialize the dashboard using multiple paths
    console.log('Attempting to initialize dashboard...');
    try {
      // 1. Try using the global state initialization function
      if (window.EDL_DASHBOARD && typeof window.EDL_DASHBOARD.init === 'function') {
        console.log('Recovery: Using global state initialization function');
        window.EDL_DASHBOARD.init();
        return true;
      }
      
      // 2. Try using the global initialization function
      if (typeof window.initializeDashboard === 'function') {
        console.log('Recovery: Using global initializeDashboard function');
        window.initializeDashboard();
        return true;
      }
      
      // 3. Try using the normal function
      if (typeof initializeDashboard === 'function') {
        console.log('Recovery: Using local initializeDashboard function');
        initializeDashboard();
        return true;
      }
      
      // 4. Last resort: reload the page
      console.log('Recovery: No recovery methods available, reloading page');
      setTimeout(() => {
        location.reload();
      }, 1000);
      
      return false;
    } catch (error) {
      console.error('Error during initialization fix:', error);
      return false;
    }
  };
  
  // Function to load dashboard data manually
  window.loadDashboardDataManually = function() {
    console.log('Loading dashboard data manually...');
    
    fetch('dashboard_data_complete.json')
      .then(response => response.json())
      .then(data => {
        console.log('Dashboard data loaded successfully', data.length, 'records');
        window.dashboardData = data;
        return data;
      })
      .catch(error => {
        console.error('Error loading dashboard data:', error);
      });
  };
  
  // Function to check the current state of the dashboard
  window.checkDashboardState = function() {
    const state = {
      dashboardData: typeof dashboardData !== 'undefined' ? 
        { exists: true, length: dashboardData ? dashboardData.length : 0 } : { exists: false },
      charts: typeof charts !== 'undefined' ? 
        { exists: true, count: charts ? Object.keys(charts).length : 0 } : { exists: false },
      initializeDashboard: typeof initializeDashboard === 'function',
      DOM: {
        kpiGrid: Boolean(document.getElementById('kpiGrid')),
        mainContent: Boolean(document.querySelector('.main-content')),
        tabs: document.querySelectorAll('.tab').length
      }
    };
    
    console.log('Dashboard State:', state);
    return state;
  };
  
  // Helper to remove and recreate problematic elements
  window.recreateElement = function(selector, template) {
    const element = document.querySelector(selector);
    if (element) {
      const parent = element.parentNode;
      element.remove();
      
      const newElement = document.createElement('div');
      newElement.innerHTML = template;
      parent.appendChild(newElement.firstElementChild);
      console.log(`Element ${selector} recreated`);
      return true;
    }
    
    console.log(`Element ${selector} not found`);
    return false;
  };
  
  console.log('Recovery functions ready. Use fixDashboard(), loadDashboardDataManually(), or checkDashboardState() to troubleshoot.');
})();
