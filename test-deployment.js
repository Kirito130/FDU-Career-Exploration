#!/usr/bin/env node

/**
 * Deployment Test Script for FDU Careers Exploration
 * Tests the deployed application to ensure all functionality works
 */

import https from 'https';
import http from 'http';

const testUrl = process.argv[2] || 'http://localhost:3000';

console.log('🧪 Testing FDU Careers Exploration Deployment\n');
console.log(`🔗 Testing URL: ${testUrl}\n`);

// Test functions
async function testEndpoint(url, description) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    
    const req = client.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log(`✅ ${description} - Status: ${res.statusCode}`);
          resolve({ success: true, data });
        } else {
          console.log(`❌ ${description} - Status: ${res.statusCode}`);
          resolve({ success: false, status: res.statusCode });
        }
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ ${description} - Error: ${error.message}`);
      resolve({ success: false, error: error.message });
    });
    
    req.setTimeout(10000, () => {
      console.log(`⏰ ${description} - Timeout`);
      req.destroy();
      resolve({ success: false, error: 'Timeout' });
    });
  });
}

// Run tests
async function runTests() {
  console.log('🚀 Starting deployment tests...\n');
  
  // Test main page
  const homeTest = await testEndpoint(`${testUrl}/`, 'Home Page');
  
  // Test health endpoint
  const healthTest = await testEndpoint(`${testUrl}/api/health`, 'Health Check');
  
  // Test competencies page
  const competenciesTest = await testEndpoint(`${testUrl}/competencies`, 'Competencies Page');
  
  // Test majors page
  const majorsTest = await testEndpoint(`${testUrl}/majors`, 'Majors Page');
  
  // Test about page
  const aboutTest = await testEndpoint(`${testUrl}/about`, 'About Page');
  
  // Test contact page
  const contactTest = await testEndpoint(`${testUrl}/contact`, 'Contact Page');
  
  // Test API endpoints
  const competencyApiTest = await testEndpoint(`${testUrl}/api/competencies`, 'Competencies API');
  const majorsApiTest = await testEndpoint(`${testUrl}/api/majors`, 'Majors API');
  
  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  
  const tests = [
    { name: 'Home Page', result: homeTest },
    { name: 'Health Check', result: healthTest },
    { name: 'Competencies Page', result: competenciesTest },
    { name: 'Majors Page', result: majorsTest },
    { name: 'About Page', result: aboutTest },
    { name: 'Contact Page', result: contactTest },
    { name: 'Competencies API', result: competencyApiTest },
    { name: 'Majors API', result: majorsApiTest }
  ];
  
  const passedTests = tests.filter(test => test.result.success).length;
  const totalTests = tests.length;
  
  tests.forEach(test => {
    const status = test.result.success ? '✅' : '❌';
    console.log(`${status} ${test.name}`);
  });
  
  console.log(`\n📈 Overall: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 All tests passed! Your deployment is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check your deployment configuration.');
  }
  
  // Check health data if available
  if (healthTest.success && healthTest.data) {
    try {
      const healthData = JSON.parse(healthTest.data);
      console.log('\n🔍 Health Check Details:');
      console.log(`   Status: ${healthData.status}`);
      console.log(`   Database: ${healthData.database}`);
      console.log(`   Competency Mappings: ${healthData.competencyMappings}`);
      console.log(`   Major Mappings: ${healthData.majorMappings}`);
    } catch (error) {
      console.log('\n⚠️  Could not parse health check data');
    }
  }
}

// Run the tests
runTests().catch(error => {
  console.error('\n❌ Test runner error:', error.message);
  process.exit(1);
});
