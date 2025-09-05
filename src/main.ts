import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { initializeDatabase } from './config/database';
import { UserBot } from './bots/UserBot';
import { AdminBot } from './bots/AdminBot';
import { ROIScheduler } from './scheduler/ROIScheduler';
import { config } from './config/config';
import logger from './config/logger';

class InvestmentBotApp {
  private userBot: UserBot;
  private adminBot: AdminBot;
  private roiScheduler: ROIScheduler;
  private app: express.Application;

  constructor() {
    this.app = express();
    this.userBot = new UserBot();
    this.adminBot = new AdminBot();
    this.roiScheduler = new ROIScheduler();
    this.setupExpress();
  }

  private setupExpress(): void {
    // Security middleware
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Health check endpoint
    this.app.get('/health', (req: express.Request, res: express.Response) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: config.app.nodeEnv,
        version: '1.0.0'
      });
    });

    // Admin API endpoints
    this.app.get('/admin/stats', async (req: express.Request, res: express.Response) => {
      try {
        // Basic stats endpoint for monitoring
        res.json({
          status: 'ok',
          timestamp: new Date().toISOString(),
          environment: config.app.nodeEnv
        });
      } catch (error) {
        logger.error('Error in stats endpoint:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    // Error handling middleware
    this.app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      logger.error('Express error:', err);
      res.status(500).json({ error: 'Internal server error' });
    });
  }

  public async start(): Promise<void> {
    try {
      logger.info('Starting Investment Bot Application...');

      // Initialize database
      await initializeDatabase();
      logger.info('✅ Database initialized');

      // Start ROI scheduler
      this.roiScheduler.start();
      logger.info('✅ ROI Scheduler started');

      // Start bots
      await this.userBot.start();
      logger.info('✅ User bot started');

      await this.adminBot.start();
      logger.info('✅ Admin bot started');

      // Start Express server
      this.app.listen(config.app.port, () => {
        logger.info(`✅ Express server started on port ${config.app.port}`);
      });

      logger.info('🚀 Investment Bot Application started successfully!');
      
      // Graceful shutdown handlers
      this.setupGracefulShutdown();
      
    } catch (error) {
      logger.error('❌ Error starting application:', error);
      process.exit(1);
    }
  }

  private setupGracefulShutdown(): void {
    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Starting graceful shutdown...`);
      
      try {
        // Stop bots
        await this.userBot.stop();
        await this.adminBot.stop();
        
        // Close database connection
        // Note: TypeORM doesn't have a direct close method in newer versions
        // The connection will be closed when the process exits
        
        logger.info('✅ Graceful shutdown completed');
        process.exit(0);
      } catch (error) {
        logger.error('❌ Error during shutdown:', error);
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGUSR2', () => shutdown('SIGUSR2')); // For nodemon
  }

  public async stop(): Promise<void> {
    try {
      await this.userBot.stop();
      await this.adminBot.stop();
      logger.info('Application stopped');
    } catch (error) {
      logger.error('Error stopping application:', error);
      throw error;
    }
  }
}

// Start the application
const app = new InvestmentBotApp();

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the app
app.start().catch((error) => {
  logger.error('Failed to start application:', error);
  process.exit(1);
});

export default app;
