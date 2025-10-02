#!/usr/bin/env node

/**
 * O*NET Careers App - Web Server
 * Express.js web application for career guidance based on NACE competencies and course majors
 * 
 * Usage: node server.js
 * Or: npm run web
 */

// Suppress deprecation warnings for cleaner output
process.removeAllListeners('warning');
process.on('warning', (warning) => {
  if (warning.name === 'DeprecationWarning' && warning.message.includes('punycode')) {
    // Suppress punycode deprecation warnings
    return;
  }
  console.warn(warning.name + ': ' + warning.message);
});

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import expressEjsLayouts from 'express-ejs-layouts';

// Import controllers and services
import { initializeApp } from './src/controllers/appController.js';
import competencyService from './src/services/newCompetencyService.js';
import majorService from './src/services/newMajorService.js';
import { testConnection } from './src/database/supabase.js';

// Load environment variables
dotenv.config();

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://cdn.jsdelivr.net", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
      connectSrc: ["'self'"]
    }
  }
}));

app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Use express-ejs-layouts
app.use(expressEjsLayouts);
app.set('layout', 'layout');
app.set('layout extractScripts', true);
app.set('layout extractStyles', true);

// Global variables for templates
app.use((req, res, next) => {
  res.locals.appName = 'O*NET Careers App';
  res.locals.appDescription = 'Discover Your Perfect Career Path';
  next();
});

// Routes

/**
 * Home page - Main landing page
 */
app.get('/', async (req, res) => {
  try {
    // Get statistics for display
    let competencyStats = null;
    let majorStats = null;
    let competencies = [];
    let majors = [];
    
    try {
      competencyStats = await competencyService.getCompetencyMappingStats();
      majorStats = await majorService.getMajorMappingStats();
      competencies = await competencyService.getAllCompetencies();
      majors = await majorService.getAllMajors();
    } catch (dbError) {
      console.log('Database not available, using demo data');
      // Use demo data when database is not available
      competencies = [
        'Communication',
        'Critical Thinking', 
        'Leadership',
        'Teamwork',
        'Technology',
        'Professionalism',
        'Career & Self-Development',
        'Equity & Inclusion'
      ];
      majors = [
        'Arts',
        'Social Sciences',
        'Environmental Studies',
        'Hospitality & Tourism Management',
        'Applied Technology',
        'Business',
        'Communications',
        'Digital Media Arts',
        'Healthcare Administration',
        'Homeland Security',
        'Human Resource Management',
        'Liberal Studies',
        'Public Administration',
        'Technology',
        'Sustainability'
      ];
    }
    
    res.render('index', {
      title: 'Home',
      competencyStats,
      majorStats,
      competencies,
      majors
    });
  } catch (error) {
    console.error('Error loading home page:', error);
    res.render('index', {
      title: 'Home',
      error: 'Failed to load application data'
    });
  }
});

/**
 * Competency search page
 */
app.get('/competencies', async (req, res) => {
  try {
    let competencies = [];
    try {
      competencies = await competencyService.getAllCompetencies();
    } catch (dbError) {
      // Use demo data when database is not available
      competencies = [
        'Communication',
        'Critical Thinking', 
        'Leadership',
        'Teamwork',
        'Technology',
        'Professionalism',
        'Career & Self-Development',
        'Equity & Inclusion'
      ];
    }
    res.render('competencies', {
      title: 'Find Careers by Competencies',
      competencies
    });
  } catch (error) {
    console.error('Error loading competencies page:', error);
    res.render('error', {
      title: 'Error',
      message: 'Failed to load competencies page'
    });
  }
});

/**
 * Major search page
 */
app.get('/majors', async (req, res) => {
  try {
    let majors = [];
    try {
      majors = await majorService.getAllMajors();
    } catch (dbError) {
      // Use demo data when database is not available
      majors = [
        'Arts',
        'Social Sciences',
        'Environmental Studies',
        'Hospitality & Tourism Management',
        'Applied Technology',
        'Business',
        'Communications',
        'Digital Media Arts',
        'Healthcare Administration',
        'Homeland Security',
        'Human Resource Management',
        'Liberal Studies',
        'Public Administration',
        'Technology',
        'Sustainability'
      ];
    }
    res.render('majors', {
      title: 'Find Careers by Major',
      majors
    });
  } catch (error) {
    console.error('Error loading majors page:', error);
    res.render('error', {
      title: 'Error',
      message: 'Failed to load majors page'
    });
  }
});

/**
 * Job details page
 */
app.get('/job/:onetsocCode', async (req, res) => {
  try {
    const { onetsocCode } = req.params;
    const jobDetails = await competencyService.getDetailedJobInfo(onetsocCode);
    
    if (!jobDetails) {
      return res.render('error', {
        title: 'Job Not Found',
        message: 'The requested job could not be found'
      });
    }
    
    res.render('job-details', {
      title: `Job Details - ${jobDetails.title}`,
      job: jobDetails
    });
  } catch (error) {
    console.error('Error loading job details:', error);
    res.render('error', {
      title: 'Error',
      message: 'Failed to load job details'
    });
  }
});

/**
 * Statistics page
 */
app.get('/stats', async (req, res) => {
  try {
    const competencyStats = await competencyService.getCompetencyMappingStats();
    const majorStats = await majorService.getMajorMappingStats();
    
    res.render('stats', {
      title: 'Application Statistics',
      competencyStats,
      majorStats
    });
  } catch (error) {
    console.error('Error loading stats page:', error);
    res.render('error', {
      title: 'Error',
      message: 'Failed to load statistics'
    });
  }
});

/**
 * About page
 */
app.get('/about', (req, res) => {
  res.render('about', {
    title: 'About O*NET Careers App'
  });
});

// API Routes

/**
 * Search careers by competencies
 */
app.post('/api/search/competencies', async (req, res) => {
  try {
    const { competencies } = req.body;
    
    if (!competencies || !Array.isArray(competencies) || competencies.length !== 3) {
      return res.status(400).json({
        error: 'Please select exactly 3 competencies'
      });
    }
    
    const jobs = await competencyService.getJobsByCompetencies(competencies);
    
    res.json({
      success: true,
      jobs,
      count: jobs.length
    });
  } catch (error) {
    console.error('Error in competency search API:', error);
    res.status(500).json({
      error: 'Failed to search careers by competencies'
    });
  }
});

/**
 * Search careers by major
 */
app.post('/api/search/majors', async (req, res) => {
  try {
    const { major } = req.body;
    
    if (!major) {
      return res.status(400).json({
        error: 'Please select a major'
      });
    }
    
    const jobs = await majorService.getJobsByMajor(major);
    
    res.json({
      success: true,
      jobs,
      count: jobs.length
    });
  } catch (error) {
    console.error('Error in major search API:', error);
    res.status(500).json({
      error: 'Failed to search careers by major'
    });
  }
});

/**
 * Get job details
 */
app.get('/api/job/:onetsocCode', async (req, res) => {
  try {
    const { onetsocCode } = req.params;
    const jobDetails = await competencyService.getDetailedJobInfo(onetsocCode);
    
    if (!jobDetails) {
      return res.status(404).json({
        error: 'Job not found'
      });
    }
    
    res.json({
      success: true,
      job: jobDetails
    });
  } catch (error) {
    console.error('Error in job details API:', error);
    res.status(500).json({
      error: 'Failed to load job details'
    });
  }
});

/**
 * Health check endpoint
 */
app.get('/api/health', async (req, res) => {
  try {
    const isConnected = await testConnection();
    const competencyMappingsExist = await competencyService.checkCompetencyMappingsExist();
    const majorMappingsExist = await majorService.checkMajorMappingsExist();
    
    res.json({
      status: 'ok',
      database: isConnected ? 'connected' : 'disconnected',
      competencyMappings: competencyMappingsExist,
      majorMappings: majorMappingsExist,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).render('error', {
    title: 'Server Error',
    message: 'An unexpected error occurred'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).render('error', {
    title: 'Page Not Found',
    message: 'The requested page could not be found'
  });
});

/**
 * Initialize and start the server
 */
async function startServer() {
  try {
    console.log('🚀 Starting O*NET Careers Web App...\n');
    
    // Try to initialize the application (test database connection, check mappings)
    let initialized = false;
    try {
      initialized = await initializeApp();
    } catch (error) {
      console.log('⚠️  Database connection failed, but starting server in demo mode');
      console.log('   The web interface will work, but API calls may fail');
      console.log('   To enable full functionality, ensure database is accessible\n');
    }
    
    // Start the server regardless of database status for demo purposes
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      if (initialized) {
        console.log(`🎯 Application ready for career guidance!\n`);
      } else {
        console.log(`🎯 Application running in demo mode (database not connected)\n`);
      }
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down server gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down server gracefully...');
  process.exit(0);
});

// Start the server
startServer();
