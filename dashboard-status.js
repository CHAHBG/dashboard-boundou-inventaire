/**
 * Status Check Tool for Dashboard Boundou Inventaire
 * This file helps determine if the dashboard is functioning correctly
 */

(function() {
  // Check if document is loaded
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    runChecks();
  } else {
    document.addEventListener('DOMContentLoaded', runChecks);
  }
  
  function runChecks() {
    const results = {
      timeStamp: new Date().toISOString(),
      htmlElementsPresent: checkHtmlElements(),
      scriptsLoaded: checkScripts(),
      globalVariables: checkGlobalVariables(),
      functionsAvailable: checkFunctions(),
      browserInfo: getBrowserInfo()
    };
    
    console.log('Dashboard Status Check Results:', results);
    displayResults(results);
  }
  
  function checkHtmlElements() {
    const elements = {
      kpiGrid: Boolean(document.getElementById('kpiGrid')),
      mainContent: Boolean(document.querySelector('.main-content')),
      charts: document.querySelectorAll('canvas').length,
      tabs: document.querySelectorAll('.tab').length,
      tables: document.querySelectorAll('table').length
    };
    return elements;
  }
  
  function checkScripts() {
    return {
      chartJs: typeof Chart !== 'undefined',
      gsap: typeof gsap !== 'undefined',
      jsPDF: typeof window.jspdf !== 'undefined' || typeof window.jsPDF !== 'undefined'
    };
  }
  
  function checkGlobalVariables() {
    return {
      dashboardData: typeof dashboardData !== 'undefined',
      charts: typeof charts !== 'undefined',
      currentTheme: typeof currentTheme !== 'undefined',
      currentFilters: typeof currentFilters !== 'undefined'
    };
  }
  
  function checkFunctions() {
    return {
      initializeDashboard: typeof initializeDashboard === 'function' || typeof window.initializeDashboard === 'function',
      updateKPIs: typeof updateKPIs === 'function',
      showInsightBanner: typeof showInsightBanner === 'function',
      fixDashboard: typeof window.fixDashboard === 'function'
    };
  }
  
  function getBrowserInfo() {
    return {
      userAgent: navigator.userAgent,
      cookiesEnabled: navigator.cookieEnabled,
      platform: navigator.platform,
      language: navigator.language,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height
    };
  }
  
  function displayResults(results) {
    // Only display if this is the status check page
    if (window.location.search.includes('status=check')) {
      const container = document.createElement('div');
      container.style.cssText = 'position:fixed;top:10px;right:10px;background:#fff;padding:15px;border:1px solid #ddd;border-radius:5px;box-shadow:0 2px 10px rgba(0,0,0,0.1);z-index:9999;max-width:400px;font-family:monospace;font-size:12px;';
      
      // Create header
      const header = document.createElement('h3');
      header.textContent = 'Dashboard Status Check';
      header.style.margin = '0 0 10px 0';
      container.appendChild(header);
      
      // Check overall status
      const overallStatus = document.createElement('div');
      const isOk = results.htmlElementsPresent.kpiGrid && 
                   results.scriptsLoaded.chartJs &&
                   results.functionsAvailable.initializeDashboard;
                   
      overallStatus.style.cssText = `padding:5px;margin-bottom:10px;background:${isOk ? '#d4edda' : '#f8d7da'};color:${isOk ? '#155724' : '#721c24'};border-radius:3px;`;
      overallStatus.textContent = isOk ? '✓ Dashboard functioning correctly' : '✗ Dashboard has issues';
      container.appendChild(overallStatus);
      
      // Add sections
      addSection('HTML Elements', results.htmlElementsPresent);
      addSection('Scripts', results.scriptsLoaded);
      addSection('Global Variables', results.globalVariables);
      addSection('Functions', results.functionsAvailable);
      
      // Add close button
      const closeBtn = document.createElement('button');
      closeBtn.textContent = 'Close';
      closeBtn.style.cssText = 'margin-top:10px;padding:5px 10px;';
      closeBtn.onclick = function() {
        container.remove();
      };
      container.appendChild(closeBtn);
      
      document.body.appendChild(container);
      
      function addSection(title, data) {
        const section = document.createElement('div');
        section.style.marginBottom = '10px';
        
        const sectionTitle = document.createElement('div');
        sectionTitle.textContent = title;
        sectionTitle.style.fontWeight = 'bold';
        section.appendChild(sectionTitle);
        
        const list = document.createElement('ul');
        list.style.margin = '5px 0';
        list.style.paddingLeft = '20px';
        
        for (const key in data) {
          const item = document.createElement('li');
          const isPresent = Boolean(data[key]);
          item.innerHTML = `${key}: <span style="color:${isPresent ? 'green' : 'red'}">${isPresent ? '✓' : '✗'}</span>`;
          list.appendChild(item);
        }
        
        section.appendChild(list);
        container.appendChild(section);
      }
    }
  }
})();
