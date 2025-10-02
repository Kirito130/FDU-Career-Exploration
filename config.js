/**
 * Configuration file for O*NET Supabase Uploader
 * Copy this file to config.js and fill in your Supabase credentials
 */

export const config = {
  // Supabase Configuration
  supabase: {
    url: process.env.SUPABASE_URL || 'https://haqlioealqupvbnzbnqt.supabase.co',
    anonKey: process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhcWxpb2VhbHF1cHZibnpibnF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNDMxODIsImV4cCI6MjA3MjkxOTE4Mn0.TzY9c1L5RFyB6HBaFmxjn7qlz_4PBpPZf9nUQmU8vHk',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhcWxpb2VhbHF1cHZibnpibnF0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM0MzE4MiwiZXhwIjoyMDcyOTE5MTgyfQ.y3HreDT2p5WJleSuQCbQnkl38Klxx-a5GQBuip5Y-Iw'
  },
  
  // Database Configuration
  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:[iNDOJIN#130]@db.haqlioealqupvbnzbnqt.supabase.co:5432/postgres'
  },
  
  // Upload Configuration
  upload: {
    batchSize: parseInt(process.env.BATCH_SIZE) || 1000,
    maxRetries: parseInt(process.env.MAX_RETRIES) || 3,
    retryDelay: parseInt(process.env.RETRY_DELAY) || 1000
  },
  
  // File paths
  paths: {
    dataDirectory: './onet_db',
    tableCreationScript: './create-tables.js',
    uploadScript: './upload-data.js'
  }
};

export default config;
