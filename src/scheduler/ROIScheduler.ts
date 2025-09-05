import cron from 'node-cron';
import { UserService } from '../services/UserService';
import logger from '../config/logger';

export class ROIScheduler {
  private userService: UserService;
  private isRunning: boolean = false;

  constructor() {
    this.userService = new UserService();
  }

  public start(): void {
    logger.info('Starting ROI Scheduler...');

    // Run ROI processing every day at 12:00 UTC
    cron.schedule('0 12 * * *', async () => {
      await this.processWeeklyROI();
    });

    // Process missed ROI on startup
    this.processMissedROI();

    logger.info('ROI Scheduler started successfully');
  }

  public async processWeeklyROI(): Promise<void> {
    if (this.isRunning) {
      logger.warn('ROI processing already running, skipping...');
      return;
    }

    this.isRunning = true;
    logger.info('Starting weekly ROI processing...');

    try {
      const result = await this.userService.processWeeklyROI();
      
      logger.info('Weekly ROI processing completed', {
        processed: result.processed,
        errors: result.errors.length,
        errorDetails: result.errors
      });

      if (result.errors.length > 0) {
        logger.warn('Some ROI processing errors occurred:', result.errors);
      }
    } catch (error) {
      logger.error('Error in weekly ROI processing:', error);
    } finally {
      this.isRunning = false;
    }
  }

  public async processMissedROI(): Promise<void> {
    logger.info('Processing missed ROI payments on startup...');

    try {
      const result = await this.userService.processWeeklyROI();
      
      logger.info('Missed ROI processing completed', {
        processed: result.processed,
        errors: result.errors.length
      });
    } catch (error) {
      logger.error('Error processing missed ROI:', error);
    }
  }

  public async processROIForUser(userId: string): Promise<void> {
    try {
      await this.userService.processROIForUser(userId);
      logger.info(`Manual ROI processing completed for user: ${userId}`);
    } catch (error) {
      logger.error(`Error processing ROI for user ${userId}:`, error);
      throw error;
    }
  }

  public getStatus(): { isRunning: boolean } {
    return { isRunning: this.isRunning };
  }
}
