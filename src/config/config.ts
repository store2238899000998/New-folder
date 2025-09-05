import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Bot Configuration
  bots: {
    admin: {
      token: process.env.ADMIN_BOT_TOKEN || '',
      chatId: process.env.ADMIN_CHAT_ID || '',
    },
    user: {
      token: process.env.USER_BOT_TOKEN || '',
    },
  },

  // Database Configuration
  database: {
    // Use PostgreSQL from Railway
    url: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/investment_bot',
    type: 'postgres',
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.NODE_ENV === 'development',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  },

  // Application Settings
  app: {
    port: parseInt(process.env.PORT || '3000'),
    nodeEnv: process.env.NODE_ENV || 'development',
    timezone: process.env.TIMEZONE || 'UTC',
  },

  // ROI Configuration
  roi: {
    percentage: parseFloat(process.env.ROI_PERCENTAGE || '8'),
    cyclesRequired: parseInt(process.env.ROI_CYCLES_REQUIRED || '4'),
    intervalDays: parseInt(process.env.ROI_INTERVAL_DAYS || '7'),
  },

  // Withdrawal Addresses
  withdrawal: {
    btc: process.env.BTC_ADDRESS || '',
    usdtTrc20: process.env.USDT_TRC20_ADDRESS || '',
  },
};

// Validation - Only throw error in production
if (process.env.NODE_ENV === 'production') {
  const requiredEnvVars = ['ADMIN_BOT_TOKEN', 'USER_BOT_TOKEN', 'ADMIN_CHAT_ID'];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }
} else {
  // Development mode - warn about missing variables but don't crash
  const requiredEnvVars = ['ADMIN_BOT_TOKEN', 'USER_BOT_TOKEN', 'ADMIN_CHAT_ID'];
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.warn(`⚠️  Warning: Missing environment variable: ${envVar}`);
    }
  }
}
