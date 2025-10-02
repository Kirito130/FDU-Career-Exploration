/**
 * Deployment Configuration for FDU Careers Exploration
 * This file ensures proper configuration for production deployment
 */

import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY', 
  'SUPABASE_SERVICE_ROLE_KEY',
  'DATABASE_URL'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars.join(', '));
  console.error('Please set these variables in your deployment platform.');
  process.exit(1);
}

// Export configuration for use in other files
export const deploymentConfig = {
  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY
  },
  database: {
    url: process.env.DATABASE_URL
  },
  app: {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'production'
  }
};

console.log('✅ Deployment configuration loaded successfully');
console.log(`🌐 Environment: ${deploymentConfig.app.nodeEnv}`);
console.log(`🔗 Supabase URL: ${deploymentConfig.supabase.url}`);
console.log(`🚀 Server will start on port: ${deploymentConfig.app.port}`);

export default deploymentConfig;
