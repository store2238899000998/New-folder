import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { User } from '../models/User';
import { AccessCode } from '../models/AccessCode';
import { InvestmentHistory, TransactionType } from '../models/InvestmentHistory';
import logger from '../config/logger';

export class UserService {
  private userRepository: Repository<User>;
  private accessCodeRepository: Repository<AccessCode>;
  private investmentHistoryRepository: Repository<InvestmentHistory>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.accessCodeRepository = AppDataSource.getRepository(AccessCode);
    this.investmentHistoryRepository = AppDataSource.getRepository(InvestmentHistory);
  }

  // User Management
  async createUser(userData: {
    userId: string;
    name: string;
    email?: string;
    phone?: string;
    country?: string;
    initialBalance: number;
  }): Promise<User> {
    try {
      const user = new User();
      user.user_id = userData.userId;
      user.name = userData.name;
      user.email = userData.email || '';
      user.phone = userData.phone || '';
      user.country = userData.country || '';
      user.initial_balance = userData.initialBalance;
      user.current_balance = userData.initialBalance;
      user.next_roi_date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

      const savedUser = await this.userRepository.save(user);

      // Record initial deposit transaction
      await this.recordTransaction({
        userId: userData.userId,
        type: TransactionType.INITIAL_DEPOSIT,
        amount: userData.initialBalance,
        balanceBefore: 0,
        balanceAfter: userData.initialBalance,
        description: 'Initial deposit',
        metadata: { is_initial: true },
      });

      logger.info(`User created: ${userData.userId}`, { userId: userData.userId, name: userData.name });
      return savedUser;
    } catch (error) {
      logger.error('Error creating user:', error);
      throw error;
    }
  }

  async createUserWithAccessCode(
    accessCode: string,
    userData: {
      userId: string;
      name: string;
      email?: string;
      phone?: string;
      country?: string;
    }
  ): Promise<User> {
    try {
      const code = await this.accessCodeRepository.findOne({
        where: { code: accessCode }
      });

      if (!code) {
        throw new Error('Invalid access code');
      }

      if (!code.isValid()) {
        throw new Error('Access code is already used or expired');
      }

      const user = await this.createUser({
        ...userData,
        initialBalance: code.initial_balance,
      });

      // Mark access code as used
      code.use(userData.userId);
      await this.accessCodeRepository.save(code);

      logger.info(`User created with access code: ${accessCode}`, { userId: userData.userId });
      return user;
    } catch (error) {
      logger.error('Error creating user with access code:', error);
      throw error;
    }
  }

  async getUserByUserId(userId: string): Promise<User | null> {
    try {
      return await this.userRepository.findOne({
        where: { user_id: userId, is_active: true }
      });
    } catch (error) {
      logger.error('Error getting user by ID:', error);
      throw error;
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      return await this.userRepository.find({
        where: { is_active: true },
        order: { created_at: 'DESC' }
      });
    } catch (error) {
      logger.error('Error getting all users:', error);
      throw error;
    }
  }

  // Access Code Management
  async createAccessCode(data: {
    code: string;
    name: string;
    initialBalance: number;
    expiresAt?: Date;
  }): Promise<AccessCode> {
    try {
      const accessCode = new AccessCode();
      accessCode.code = data.code;
      accessCode.name = data.name;
      accessCode.initial_balance = data.initialBalance;
      if (data.expiresAt) {
        accessCode.expires_at = data.expiresAt;
      }

      const savedCode = await this.accessCodeRepository.save(accessCode);
      logger.info(`Access code created: ${data.code}`, { code: data.code });
      return savedCode;
    } catch (error) {
      logger.error('Error creating access code:', error);
      throw error;
    }
  }

  async getAccessCode(code: string): Promise<AccessCode | null> {
    try {
      return await this.accessCodeRepository.findOne({
        where: { code }
      });
    } catch (error) {
      logger.error('Error getting access code:', error);
      throw error;
    }
  }

  // Balance Management
  async creditUserBalance(userId: string, amount: number, description: string, metadata: any = {}): Promise<User> {
    try {
      const user = await this.getUserByUserId(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const balanceBefore = user.current_balance;
      user.current_balance += amount;
      const balanceAfter = user.current_balance;

      const savedUser = await this.userRepository.save(user);

      await this.recordTransaction({
        userId,
        type: TransactionType.ADMIN_CREDIT,
        amount,
        balanceBefore,
        balanceAfter,
        description,
        metadata,
      });

      logger.info(`User balance credited: ${userId}`, { userId, amount, description });
      return savedUser;
    } catch (error) {
      logger.error('Error crediting user balance:', error);
      throw error;
    }
  }

  async debitUserBalance(userId: string, amount: number, description: string, metadata: any = {}): Promise<User> {
    try {
      const user = await this.getUserByUserId(userId);
      if (!user) {
        throw new Error('User not found');
      }

      if (user.current_balance < amount) {
        throw new Error('Insufficient balance');
      }

      const balanceBefore = user.current_balance;
      user.current_balance -= amount;
      const balanceAfter = user.current_balance;

      const savedUser = await this.userRepository.save(user);

      await this.recordTransaction({
        userId,
        type: TransactionType.ADMIN_DEBIT,
        amount,
        balanceBefore,
        balanceAfter,
        description,
        metadata,
      });

      logger.info(`User balance debited: ${userId}`, { userId, amount, description });
      return savedUser;
    } catch (error) {
      logger.error('Error debiting user balance:', error);
      throw error;
    }
  }

  async transferBalance(fromUserId: string, toUserId: string, amount: number, description: string): Promise<void> {
    try {
      const fromUser = await this.getUserByUserId(fromUserId);
      const toUser = await this.getUserByUserId(toUserId);

      if (!fromUser || !toUser) {
        throw new Error('One or both users not found');
      }

      if (fromUser.current_balance < amount) {
        throw new Error('Insufficient balance for transfer');
      }

      // Debit from sender
      await this.debitUserBalance(fromUserId, amount, `Transfer to ${toUser.name}`, {
        transfer_to: toUserId,
        transfer_type: 'outgoing',
      });

      // Credit to receiver
      await this.creditUserBalance(toUserId, amount, `Transfer from ${fromUser.name}`, {
        transfer_from: fromUserId,
        transfer_type: 'incoming',
      });

      logger.info(`Balance transferred: ${fromUserId} -> ${toUserId}`, { fromUserId, toUserId, amount });
    } catch (error) {
      logger.error('Error transferring balance:', error);
      throw error;
    }
  }

  // ROI Management
  async processROIForUser(userId: string): Promise<User> {
    try {
      const user = await this.getUserByUserId(userId);
      if (!user) {
        throw new Error('User not found');
      }

      if (!user.isROIDue()) {
        throw new Error('ROI not due yet');
      }

      const roiAmount = user.getNextROIAmount();
      const balanceBefore = user.current_balance;

      user.updateROICycle();
      const balanceAfter = user.current_balance;

      const savedUser = await this.userRepository.save(user);

      // Record ROI transaction
      await this.recordTransaction({
        userId,
        type: TransactionType.ROI_PAYMENT,
        amount: roiAmount,
        balanceBefore,
        balanceAfter,
        description: `ROI Payment - Cycle ${user.roi_cycles_completed}`,
        metadata: {
          cycle_number: user.roi_cycles_completed,
          roi_percentage: 8,
          is_automatic: true,
        },
      });

      logger.info(`ROI processed for user: ${userId}`, { userId, roiAmount, cycle: user.roi_cycles_completed });
      return savedUser;
    } catch (error) {
      logger.error('Error processing ROI for user:', error);
      throw error;
    }
  }

  async processWeeklyROI(): Promise<{ processed: number; errors: string[] }> {
    try {
      const users = await this.userRepository.find({
        where: { is_active: true }
      });

      let processed = 0;
      const errors: string[] = [];

      for (const user of users) {
        try {
          if (user.isROIDue()) {
            await this.processROIForUser(user.user_id);
            processed++;
          }
        } catch (error) {
          errors.push(`User ${user.user_id}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      logger.info(`Weekly ROI processing completed`, { processed, errors: errors.length });
      return { processed, errors };
    } catch (error) {
      logger.error('Error processing weekly ROI:', error);
      throw error;
    }
  }

  // Transaction History
  async recordTransaction(data: {
    userId: string;
    type: TransactionType;
    amount: number;
    balanceBefore: number;
    balanceAfter: number;
    description: string;
    metadata?: any;
  }): Promise<InvestmentHistory> {
    try {
      const transaction = new InvestmentHistory();
      transaction.user_id = data.userId;
      transaction.transaction_type = data.type;
      transaction.amount = data.amount;
      transaction.balance_before = data.balanceBefore;
      transaction.balance_after = data.balanceAfter;
      transaction.description = data.description;
      transaction.transaction_metadata = data.metadata || {};

      return await this.investmentHistoryRepository.save(transaction);
    } catch (error) {
      logger.error('Error recording transaction:', error);
      throw error;
    }
  }

  async getInvestmentHistory(userId: string, limit: number = 50): Promise<InvestmentHistory[]> {
    try {
      return await this.investmentHistoryRepository.find({
        where: { user_id: userId },
        order: { created_at: 'DESC' },
        take: limit,
      });
    } catch (error) {
      logger.error('Error getting investment history:', error);
      throw error;
    }
  }

  async calculateEarningsProjection(userId: string, weeks: number = 12): Promise<{
    currentBalance: number;
    weeklyROI: number;
    totalProjected: number;
    weeklyBreakdown: Array<{ week: number; amount: number; total: number }>;
  }> {
    try {
      const user = await this.getUserByUserId(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const weeklyROI = user.getNextROIAmount();
      const weeklyBreakdown = [];
      let totalProjected = user.current_balance;

      for (let week = 1; week <= weeks; week++) {
        const weekAmount = weeklyROI;
        totalProjected += weekAmount;
        weeklyBreakdown.push({
          week,
          amount: weekAmount,
          total: totalProjected,
        });
      }

      return {
        currentBalance: user.current_balance,
        weeklyROI,
        totalProjected,
        weeklyBreakdown,
      };
    } catch (error) {
      logger.error('Error calculating earnings projection:', error);
      throw error;
    }
  }
}
