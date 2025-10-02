#!/usr/bin/env node

/**
 * Deployment CSS Fix Script for FDU Careers Exploration
 * This script identifies and fixes common CSS deployment issues
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 FDU Careers Exploration - CSS Deployment Fix\n');

// Check if CSS file exists and is readable
const cssPath = path.join(__dirname, 'public', 'css', 'style.css');
console.log('📋 Checking CSS file...');

if (!fs.existsSync(cssPath)) {
  console.log('❌ CSS file not found at:', cssPath);
  process.exit(1);
}

console.log('✅ CSS file exists');

// Check CSS file size
const cssStats = fs.statSync(cssPath);
console.log(`📊 CSS file size: ${cssStats.size} bytes`);

if (cssStats.size === 0) {
  console.log('❌ CSS file is empty!');
  process.exit(1);
}

// Check for common CSS issues
console.log('\n🔍 Checking for CSS issues...');

const cssContent = fs.readFileSync(cssPath, 'utf8');

// Check for syntax errors
const syntaxIssues = [];
if (cssContent.includes('{{') || cssContent.includes('}}')) {
  syntaxIssues.push('Template syntax found in CSS');
}

if (cssContent.includes('undefined')) {
  syntaxIssues.push('Undefined values found in CSS');
}

if (syntaxIssues.length > 0) {
  console.log('⚠️  Potential CSS syntax issues:');
  syntaxIssues.forEach(issue => console.log(`   - ${issue}`));
} else {
  console.log('✅ No obvious syntax issues found');
}

// Check for required CSS rules
const requiredRules = [
  '.bg-gradient-primary',
  '.competency-card',
  '.major-card',
  '.hero-section .lead',
  '.form-check-label',
  '.form-text'
];

console.log('\n🎨 Checking for required CSS rules...');
const missingRules = [];

requiredRules.forEach(rule => {
  if (!cssContent.includes(rule)) {
    missingRules.push(rule);
  }
});

if (missingRules.length > 0) {
  console.log('❌ Missing required CSS rules:');
  missingRules.forEach(rule => console.log(`   - ${rule}`));
} else {
  console.log('✅ All required CSS rules found');
}

// Create a deployment-ready CSS file with inline fallbacks
console.log('\n🛠️  Creating deployment-ready CSS file...');

const deploymentCSS = `
/* FDU Careers Exploration - Deployment CSS */
/* This file ensures critical styles are applied even if main CSS fails to load */

/* Critical CSS - Inline fallbacks */
.bg-gradient-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
}

.bg-gradient-success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
}

/* Hero section text visibility */
.hero-section .lead {
  color: rgba(255, 255, 255, 0.95) !important;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3) !important;
}

/* Page header subtitle visibility */
.bg-gradient-primary .lead,
.bg-gradient-success .lead,
.bg-primary .lead,
.bg-gradient-primary p,
.bg-gradient-success p,
.bg-primary p {
  color: rgba(255, 255, 255, 0.95) !important;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3) !important;
}

/* Competency and Major Card Styling */
.competency-card,
.major-card {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%) !important;
  border: 2px solid !important;
  transition: all 0.3s ease !important;
}

.competency-card {
  border-color: #2563eb !important;
}

.major-card {
  border-color: #059669 !important;
}

/* Competency Card Text Styling */
.competency-card .form-check-label {
  color: #2563eb !important;
  font-size: 1.1rem !important;
  font-weight: 600 !important;
}

.competency-card .form-text {
  color: rgba(255, 255, 255, 0.95) !important;
  font-size: 0.9rem !important;
  line-height: 1.4 !important;
}

/* Major Card Text Styling */
.major-card .form-check-label {
  color: #059669 !important;
  font-size: 1.1rem !important;
  font-weight: 600 !important;
}

.major-card .form-text {
  color: rgba(255, 255, 255, 0.95) !important;
  font-size: 0.9rem !important;
  line-height: 1.4 !important;
}

/* Form label visibility */
.form-label {
  color: #374151 !important;
  font-weight: 600 !important;
}

.form-check-label {
  color: #374151 !important;
  font-weight: 500 !important;
}

.form-text {
  color: #6b7280 !important;
  font-size: 0.875rem !important;
}

/* Button visibility */
.btn-outline-light {
  border-color: rgba(255, 255, 255, 0.8) !important;
  color: rgba(255, 255, 255, 0.9) !important;
}

.btn-outline-light:hover {
  background-color: rgba(255, 255, 255, 0.1) !important;
  border-color: white !important;
  color: white !important;
}

/* Footer text visibility */
footer h5,
footer h6 {
  color: #ffffff !important;
}

footer .text-dark {
  color: #ffffff !important;
}

/* Hover effects */
.competency-card:hover,
.major-card:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3) !important;
}

.competency-card:hover {
  border-color: #3b82f6 !important;
  box-shadow: 0 8px 25px rgba(37, 99, 235, 0.3) !important;
}

.major-card:hover {
  border-color: #10b981 !important;
  box-shadow: 0 8px 25px rgba(5, 150, 105, 0.3) !important;
}
`;

// Write the deployment CSS file
const deploymentCSSPath = path.join(__dirname, 'public', 'css', 'deployment.css');
fs.writeFileSync(deploymentCSSPath, deploymentCSS);
console.log('✅ Deployment CSS file created at:', deploymentCSSPath);

// Update layout.ejs to include both CSS files
console.log('\n📝 Updating layout.ejs to include deployment CSS...');

const layoutPath = path.join(__dirname, 'views', 'layout.ejs');
let layoutContent = fs.readFileSync(layoutPath, 'utf8');

// Add deployment CSS link after the main CSS
const cssLink = '    <link href="/css/style.css" rel="stylesheet">';
const deploymentCSSLink = '    <link href="/css/deployment.css" rel="stylesheet">';

if (!layoutContent.includes('deployment.css')) {
  layoutContent = layoutContent.replace(cssLink, cssLink + '\n' + deploymentCSSLink);
  fs.writeFileSync(layoutPath, layoutContent);
  console.log('✅ Layout updated with deployment CSS');
} else {
  console.log('✅ Layout already includes deployment CSS');
}

// Create a deployment verification script
console.log('\n🧪 Creating deployment verification script...');

const verificationScript = `#!/usr/bin/env node

/**
 * Deployment Verification Script
 * Tests if CSS is loading correctly on deployed site
 */

import https from 'https';
import http from 'http';

const testUrl = process.argv[2] || 'http://localhost:3000';

console.log('🧪 Testing CSS Loading on Deployed Site\\n');
console.log(\`🔗 Testing URL: \${testUrl}\\n\`);

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
        
        console.log(\`✅ Main CSS link: \${hasMainCSS ? 'Present' : 'Missing'}\`);
        console.log(\`✅ Deployment CSS link: \${hasDeploymentCSS ? 'Present' : 'Missing'}\`);
        
        resolve({ success: true, hasMainCSS, hasDeploymentCSS });
      });
    });
    
    req.on('error', (error) => {
      console.log(\`❌ Error loading page: \${error.message}\`);
      resolve({ success: false, error: error.message });
    });
    
    req.setTimeout(10000, () => {
      console.log(\`⏰ Timeout loading page\`);
      req.destroy();
      resolve({ success: false, error: 'Timeout' });
    });
  });
}

async function testCSSFile(url, cssPath) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    const cssUrl = url.replace(/\/$/, '') + cssPath;
    
    const req = client.get(cssUrl, (res) => {
      if (res.statusCode === 200) {
        console.log(\`✅ CSS file accessible: \${cssPath}\`);
        resolve({ success: true });
      } else {
        console.log(\`❌ CSS file not accessible: \${cssPath} (Status: \${res.statusCode})\`);
        resolve({ success: false, status: res.statusCode });
      }
    });
    
    req.on('error', (error) => {
      console.log(\`❌ CSS file error: \${cssPath} - \${error.message}\`);
      resolve({ success: false, error: error.message });
    });
    
    req.setTimeout(5000, () => {
      console.log(\`⏰ CSS file timeout: \${cssPath}\`);
      req.destroy();
      resolve({ success: false, error: 'Timeout' });
    });
  });
}

async function runTests() {
  console.log('🚀 Starting CSS verification tests...\\n');
  
  // Test main page
  const pageTest = await testCSSLoading(testUrl);
  
  if (pageTest.success) {
    // Test CSS files
    await testCSSFile(testUrl, '/css/style.css');
    await testCSSFile(testUrl, '/css/deployment.css');
  }
  
  console.log('\\n📊 CSS Verification Complete');
  console.log('============================');
  console.log('If CSS files are accessible but styling is still missing,');
  console.log('check browser developer tools for any CSS loading errors.');
}

runTests().catch(error => {
  console.error('\\n❌ Verification error:', error.message);
  process.exit(1);
});
`;

const verificationPath = path.join(__dirname, 'verify-css.js');
fs.writeFileSync(verificationPath, verificationScript);
console.log('✅ CSS verification script created');

// Update package.json to include the verification script
console.log('\n📦 Updating package.json...');

const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

if (!packageJson.scripts['verify-css']) {
  packageJson.scripts['verify-css'] = 'node verify-css.js';
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('✅ Package.json updated with CSS verification script');
} else {
  console.log('✅ Package.json already has CSS verification script');
}

console.log('\n🎉 CSS Deployment Fix Complete!');
console.log('\n📋 Next Steps:');
console.log('1. Commit and push all changes to GitHub');
console.log('2. Redeploy your application');
console.log('3. Run: npm run verify-css <your-deployed-url>');
console.log('4. Check browser developer tools for any remaining CSS issues');

console.log('\n🔧 Files Created/Updated:');
console.log('- public/css/deployment.css (critical CSS fallback)');
console.log('- views/layout.ejs (updated with deployment CSS)');
console.log('- verify-css.js (CSS verification script)');
console.log('- package.json (updated with verification script)');
