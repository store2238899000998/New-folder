import { DataSource } from 'typeorm';
import { config } from './config';
import { User } from '../models/User';
import { AccessCode } from '../models/AccessCode';
import { InvestmentHistory } from '../models/InvestmentHistory';
import { SupportTicket } from '../models/SupportTicket';

export const AppDataSource = new DataSource({
  type: config.database.type as any,
  url: config.database.url,
  entities: [User, AccessCode, InvestmentHistory, SupportTicket],
  synchronize: config.database.synchronize,
  logging: config.database.logging,
  ssl: config.database.ssl,
});

export const initializeDatabase = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connection established successfully');
  } catch (error) {
    console.error('❌ Error during database initialization:', error);
    throw error;
  }
};
