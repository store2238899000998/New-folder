import 'reflect-metadata';
import { initializeDatabase } from './config/database';
import { UserService } from './services/UserService';
import { SupportService } from './services/SupportService';
import { config } from './config/config';
import logger from './config/logger';

async function deployCheck(): Promise<void> {
  try {
    logger.info('🔍 Starting deployment check...');

    // Initialize database
    await initializeDatabase();
    logger.info('✅ Database connection successful');

    // Test services
    const userService = new UserService();
    const supportService = new SupportService();

    // Test user service
    const users = await userService.getAllUsers();
    logger.info(`✅ User service working - Found ${users.length} users`);

    // Test support service
    const tickets = await supportService.getSupportTickets();
    logger.info(`✅ Support service working - Found ${tickets.length} tickets`);

    // Test ROI processing
    const roiResult = await userService.processWeeklyROI();
    logger.info(`✅ ROI processing working - Processed ${roiResult.processed} users`);

    // Environment check
    const requiredEnvVars = [
      'ADMIN_BOT_TOKEN',
      'USER_BOT_TOKEN', 
      'ADMIN_CHAT_ID'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      logger.error(`❌ Missing environment variables: ${missingVars.join(', ')}`);
      process.exit(1);
    }

    logger.info('✅ All environment variables present');

    // Database configuration check
    logger.info(`✅ Database URL: ${config.database.url}`);
    logger.info(`✅ Database Type: ${config.database.type}`);
    logger.info(`✅ Environment: ${config.app.nodeEnv}`);

    // Bot configuration check
    logger.info(`✅ Admin Bot Token: ${config.bots.admin.token ? 'Present' : 'Missing'}`);
    logger.info(`✅ User Bot Token: ${config.bots.user.token ? 'Present' : 'Missing'}`);
    logger.info(`✅ Admin Chat ID: ${config.bots.admin.chatId}`);

    logger.info('🎉 Deployment check completed successfully!');
    logger.info('✅ All systems are operational');
    
    // Start the main application
    const { default: app } = await import('./main');
    
  } catch (error) {
    logger.error('❌ Deployment check failed:', error);
    process.exit(1);
  }
}

// Run deployment check
deployCheck().catch((error) => {
  logger.error('❌ Fatal error during deployment check:', error);
  process.exit(1);
});
