#!/usr/bin/env node

/**
 * Deployment Verification Script
 * Tests if CSS is loading correctly on deployed site
 */

import https from 'https';
import http from 'http';

const testUrl = process.argv[2] || 'http://localhost:3000';

console.log('🧪 Testing CSS Loading on Deployed Site\n');
console.log(`🔗 Testing URL: ${testUrl}\n`);

async function testCSSLoading(url) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    
    const req = client.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        // Check if CSS links are present
        const hasMainCSS = data.includes('/css/style.css');
        const hasDeploymentCSS = data.includes('/css/deployment.css');
        
        console.log(`✅ Main CSS link: ${hasMainCSS ? 'Present' : 'Missing'}`);
        console.log(`✅ Deployment CSS link: ${hasDeploymentCSS ? 'Present' : 'Missing'}`);
        
        resolve({ success: true, hasMainCSS, hasDeploymentCSS });
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ Error loading page: ${error.message}`);
      resolve({ success: false, error: error.message });
    });
    
    req.setTimeout(10000, () => {
      console.log(`⏰ Timeout loading page`);
      req.destroy();
      resolve({ success: false, error: 'Timeout' });
    });
  });
}

async function testCSSFile(url, cssPath) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    const cssUrl = url.replace(//$/, '') + cssPath;
    
    const req = client.get(cssUrl, (res) => {
      if (res.statusCode === 200) {
        console.log(`✅ CSS file accessible: ${cssPath}`);
        resolve({ success: true });
      } else {
        console.log(`❌ CSS file not accessible: ${cssPath} (Status: ${res.statusCode})`);
        resolve({ success: false, status: res.statusCode });
      }
    });
    
    req.on('error', (error) => {
      console.log(`❌ CSS file error: ${cssPath} - ${error.message}`);
      resolve({ success: false, error: error.message });
    });
    
    req.setTimeout(5000, () => {
      console.log(`⏰ CSS file timeout: ${cssPath}`);
      req.destroy();
      resolve({ success: false, error: 'Timeout' });
    });
  });
}

async function runTests() {
  console.log('🚀 Starting CSS verification tests...\n');
  
  // Test main page
  const pageTest = await testCSSLoading(testUrl);
  
  if (pageTest.success) {
    // Test CSS files
    await testCSSFile(testUrl, '/css/style.css');
    await testCSSFile(testUrl, '/css/deployment.css');
  }
  
  console.log('\n📊 CSS Verification Complete');
  console.log('============================');
  console.log('If CSS files are accessible but styling is still missing,');
  console.log('check browser developer tools for any CSS loading errors.');
}

runTests().catch(error => {
  console.error('\n❌ Verification error:', error.message);
  process.exit(1);
});
