import { DataSource } from 'typeorm';
import { config } from './config';
import { User } from '../models/User';
import { AccessCode } from '../models/AccessCode';
import { InvestmentHistory } from '../models/InvestmentHistory';
import { SupportTicket } from '../models/SupportTicket';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: config.database.url,
  entities: [User, AccessCode, InvestmentHistory, SupportTicket],
  synchronize: config.database.synchronize,
  logging: config.database.logging,
  ssl: config.database.ssl,
});

export const initializeDatabase = async (): Promise<void> => {
  try {
    console.log('🔍 Database configuration:', {
      type: config.database.type,
      url: config.database.url ? `${config.database.url.substring(0, 20)}...` : 'undefined',
      synchronize: config.database.synchronize
    });
    
    await AppDataSource.initialize();
    console.log('✅ PostgreSQL database connection established successfully');
  } catch (error) {
    console.error('❌ Error during database initialization:', error);
    
    // If it's a connection error, provide helpful information
    if (error instanceof Error && error.message.includes('ENOTFOUND')) {
      console.error('💡 Database connection failed. Please check:');
      console.error('   - DATABASE_URL environment variable is set correctly');
      console.error('   - Railway PostgreSQL service is running');
      console.error('   - Network connectivity to Railway');
    }
    
    throw error;
  }
};
