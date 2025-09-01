/**
 * EDL Dashboard Recovery Script
 * This script provides functions to diagnose and fix common dashboard initialization issues
 */

(function() {
  console.log('Dashboard Recovery Script loaded');

  // Function to fix common initialization issues
  window.fixDashboard = function() {
    console.log('Attempting to fix dashboard initialization...');
    
    // First, check if key objects/functions exist
    const diagnostics = {
      dashboardDataExists: typeof dashboardData !== 'undefined',
      initializeDashboardExists: typeof initializeDashboard === 'function' || 
                                 typeof window.initializeDashboard === 'function' ||
                                 (window.dashboardInitFunctions && typeof window.dashboardInitFunctions.initialize === 'function') ||
                                 typeof window.initializeDashboardImpl === 'function',
      kpiGridExists: document.getElementById('kpiGrid') !== null,
      chartsExists: typeof charts !== 'undefined' && charts !== null,
      chartJsExists: typeof Chart !== 'undefined'
    };
    
    console.log('Diagnostics:', diagnostics);
    
    // Try to fix issues based on diagnostics
    if (!diagnostics.dashboardDataExists) {
      console.log('Creating empty dashboardData object');
      window.dashboardData = [];
    }
    
    if (!diagnostics.chartsExists) {
      console.log('Creating empty charts object');
      window.charts = {};
    }
    
    if (!diagnostics.initializeDashboardExists && typeof window.initializeDashboard === 'function') {
      console.log('Exposing initializeDashboard from window object');
      initializeDashboard = window.initializeDashboard;
    }
    
    // Try to initialize the dashboard
    console.log('Attempting to initialize dashboard...');
    try {
      if (typeof window.initializeDashboard === 'function') {
        window.initializeDashboard();
        console.log('Dashboard initialization completed');
        return true;
      } else if (typeof initializeDashboard === 'function') {
        initializeDashboard();
        console.log('Dashboard initialization completed');
        return true;
      } else if (window.dashboardInitFunctions && typeof window.dashboardInitFunctions.initialize === 'function') {
        window.dashboardInitFunctions.initialize();
        console.log('Dashboard initialization completed using backup reference');
        return true;
      } else if (typeof window.initializeDashboardImpl === 'function') {
        window.initializeDashboardImpl();
        console.log('Dashboard initialization completed using implementation function');
        return true;
      } else {
        console.error('Could not find initialization function');
        return false;
      }
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
