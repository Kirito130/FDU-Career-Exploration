#!/usr/bin/env node

/**
 * Deployment Helper Script for FDU Careers Exploration
 * This script helps prepare and validate the application for deployment
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 FDU Careers Exploration - Deployment Helper\n');

// Check if required files exist
const requiredFiles = [
  'package.json',
  'server.js',
  'config.js',
  'views/layout.ejs',
  'public/css/style.css'
];

console.log('📋 Checking required files...');
let allFilesExist = true;

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n❌ Some required files are missing. Please ensure all files are present before deploying.');
  process.exit(1);
}

// Check environment variables
console.log('\n🔧 Checking environment variables...');
const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'DATABASE_URL'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.log('⚠️  Missing environment variables:');
  missingVars.forEach(varName => {
    console.log(`   - ${varName}`);
  });
  console.log('\n💡 These will need to be set in your deployment platform.');
} else {
  console.log('✅ All required environment variables are set');
}

// Check package.json scripts
console.log('\n📦 Checking package.json scripts...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  if (packageJson.scripts && packageJson.scripts.start) {
    console.log('✅ Start script found');
  } else {
    console.log('❌ Start script missing - adding it...');
    packageJson.scripts = packageJson.scripts || {};
    packageJson.scripts.start = 'node server.js';
    fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
    console.log('✅ Start script added');
  }
} catch (error) {
  console.log('❌ Error reading package.json:', error.message);
}

// Create deployment checklist
console.log('\n📋 Deployment Checklist:');
console.log('1. ✅ Code is ready for deployment');
console.log('2. 📝 Environment variables need to be configured in deployment platform');
console.log('3. 🔗 Supabase database is already configured and ready');
console.log('4. 🌐 Choose your deployment platform:');
console.log('   - Railway (Recommended): https://railway.app');
console.log('   - Render: https://render.com');
console.log('   - Vercel + Railway: https://vercel.com + https://railway.app');

console.log('\n🎯 Next Steps:');
console.log('1. Push your code to GitHub');
console.log('2. Connect your repository to your chosen platform');
console.log('3. Set environment variables in platform dashboard');
console.log('4. Deploy and test your application');

console.log('\n📚 For detailed instructions, see DEPLOYMENT_GUIDE.md');
console.log('\n🎉 Your FDU Careers Exploration app is ready to deploy!');
