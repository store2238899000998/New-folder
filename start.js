#!/usr/bin/env node

// Simple startup script for the Investment Bot
console.log('🚀 Starting Investment Telegram Bot System...');
console.log('📦 Built with TypeScript and Node.js');
console.log('🤖 Dual Bot System: User Bot + Admin Bot');
console.log('💰 Features: ROI System, Balance Management, Support Tickets');
console.log('');

// Check if dist folder exists
const fs = require('fs');
const path = require('path');

if (!fs.existsSync('./dist')) {
  console.log('❌ Build folder not found. Please run: npm run build');
  process.exit(1);
}

// Check if .env file exists
if (!fs.existsSync('./.env')) {
  console.log('⚠️  .env file not found. Please copy env.example to .env and configure it.');
  console.log('   cp env.example .env');
  console.log('');
}

console.log('✅ Build folder found');
console.log('✅ Starting application...');
console.log('');

// Start the application
require('./dist/main.js');
