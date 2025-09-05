import { Telegraf, Markup, Context } from 'telegraf';
import { UserService } from '../services/UserService';
import { SupportService } from '../services/SupportService';
import { config } from '../config/config';
import { TransactionType } from '../models/InvestmentHistory';
import logger from '../config/logger';

export class UserBot {
  private bot: Telegraf;
  private userService: UserService;
  private supportService: SupportService;
  private supportStates: Map<string, 'waiting_for_message'> = new Map();

  constructor() {
    this.bot = new Telegraf(config.bots.user.token);
    this.userService = new UserService();
    this.supportService = new SupportService();
    this.setupHandlers();
  }

  private setupHandlers(): void {
    // Start command with access code
    this.bot.start(async (ctx) => {
      const args = ctx.message.text.split(' ');
      if (args.length > 1) {
        await this.handleAccessCode(ctx, args[1]);
      } else {
        await this.showWelcome(ctx);
      }
    });

    // Code command
    this.bot.command('code', async (ctx) => {
      const args = ctx.message.text.split(' ');
      if (args.length > 1) {
        await this.handleAccessCode(ctx, args[1]);
      } else {
        await ctx.reply('Please provide an access code: /code <your_code>');
      }
    });

    // Main menu
    this.bot.action('main_menu', async (ctx) => {
      await this.showMainMenu(ctx);
    });

    // Balance
    this.bot.action('balance', async (ctx) => {
      await this.showBalance(ctx);
    });

    // Earnings Calculator
    this.bot.action('earnings_calculator', async (ctx) => {
      await this.showEarningsCalculator(ctx);
    });

    // Investment History
    this.bot.action('investment_history', async (ctx) => {
      await this.showInvestmentHistory(ctx);
    });

    // Withdraw
    this.bot.action('withdraw', async (ctx) => {
      await this.showWithdraw(ctx);
    });

    // Reinvest
    this.bot.action('reinvest', async (ctx) => {
      await this.showReinvest(ctx);
    });

    // Support
    this.bot.action('support', async (ctx) => {
      await this.showSupport(ctx);
    });

    // Referral
    this.bot.action('referral', async (ctx) => {
      await this.showReferral(ctx);
    });

    // Support message handler
    this.bot.on('text', async (ctx) => {
      const userId = ctx.from.id.toString();
      
      if (this.supportStates.has(userId)) {
        await this.handleSupportMessage(ctx);
      }
    });

    // Error handling
    this.bot.catch((err, ctx) => {
      logger.error('User bot error:', err);
      ctx.reply('An error occurred. Please try again later.');
    });
  }

  private async handleAccessCode(ctx: Context, code: string): Promise<void> {
    try {
      if (!ctx.from) return;
      const userId = ctx.from.id.toString();
      const user = await this.userService.getUserByUserId(userId);

      if (user) {
        await ctx.reply('You are already registered!', Markup.inlineKeyboard([
          [Markup.button.callback('🏠 Main Menu', 'main_menu')]
        ]));
        return;
      }

      const accessCode = await this.userService.getAccessCode(code);
      if (!accessCode || !accessCode.isValid()) {
        await ctx.reply('❌ Invalid or expired access code. Please contact support.');
        return;
      }

      const userData = {
        userId,
        name: (ctx.from.first_name || '') + (ctx.from.last_name ? ` ${ctx.from.last_name}` : ''),
        email: undefined,
        phone: undefined,
        country: undefined,
      };

      await this.userService.createUserWithAccessCode(code, userData);

      await ctx.reply(
        `🎉 Welcome to Investment Bot!\n\n` +
        `✅ Access code redeemed successfully\n` +
        `💰 Initial Balance: $${accessCode.initial_balance.toFixed(2)}\n` +
        `📈 Weekly ROI: 8% ($${(accessCode.initial_balance * 0.08).toFixed(2)})\n\n` +
        `Your investment journey starts now!`,
        Markup.inlineKeyboard([
          [Markup.button.callback('🏠 Main Menu', 'main_menu')]
        ])
      );

      logger.info(`User registered with access code: ${userId}`, { userId, code });
    } catch (error) {
      logger.error('Error handling access code:', error);
      await ctx.reply('❌ An error occurred while processing your access code. Please try again.');
    }
  }

  private async showWelcome(ctx: Context): Promise<void> {
    if (!ctx.from) return;
    const userId = ctx.from.id.toString();
    const user = await this.userService.getUserByUserId(userId);

    if (user) {
      await this.showMainMenu(ctx);
    } else {
      await ctx.reply(
        '👋 Welcome to Investment Bot!\n\n' +
        'To get started, you need an access code.\n' +
        'Please contact an administrator to get your access code.\n\n' +
        'Once you have your code, use:\n' +
        '• /start <code> - to register\n' +
        '• /code <code> - alternative registration'
      );
    }
  }

  private async showMainMenu(ctx: Context): Promise<void> {
    if (!ctx.from) return;
    const userId = ctx.from.id.toString();
    const user = await this.userService.getUserByUserId(userId);

    if (!user) {
      await this.showWelcome(ctx);
      return;
    }

    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback('💰 Balance', 'balance')],
      [Markup.button.callback('📈 Earnings Calculator', 'earnings_calculator')],
      [Markup.button.callback('📊 Investment History', 'investment_history')],
      [Markup.button.callback('💸 Withdraw', 'withdraw')],
      [Markup.button.callback('🔄 Reinvest', 'reinvest')],
      [Markup.button.callback('🎫 Support', 'support')],
      [Markup.button.callback('👥 Referral', 'referral')]
    ]);

    await ctx.reply(
      '🏠 Main Menu\n\n' +
      `Welcome back, ${user.name}!\n` +
      `Current Balance: $${user.current_balance.toFixed(2)}\n` +
      `ROI Cycles: ${user.roi_cycles_completed}/${user.max_roi_cycles}`,
      keyboard
    );
  }

  private async showBalance(ctx: Context): Promise<void> {
    if (!ctx.from) return;
    const userId = ctx.from.id.toString();
    const user = await this.userService.getUserByUserId(userId);

    if (!user) {
      await this.showWelcome(ctx);
      return;
    }

    const nextROIDate = user.next_roi_date ? user.next_roi_date.toLocaleDateString() : 'Not set';
    const canWithdraw = user.canWithdrawNow() ? '✅ Yes' : '❌ No (Complete 4 ROI cycles)';

    await ctx.reply(
      '💰 Your Balance\n\n' +
      `💵 Current Balance: $${user.current_balance.toFixed(2)}\n` +
      `🏦 Initial Balance: $${user.initial_balance.toFixed(2)}\n` +
      `📈 ROI Cycles Completed: ${user.roi_cycles_completed}/${user.max_roi_cycles}\n` +
      `📅 Next ROI Date: ${nextROIDate}\n` +
      `💸 Can Withdraw: ${canWithdraw}\n\n` +
      `📊 Weekly ROI: $${user.getNextROIAmount().toFixed(2)} (8%)`,
      Markup.inlineKeyboard([
        [Markup.button.callback('🏠 Main Menu', 'main_menu')]
      ])
    );
  }

  private async showEarningsCalculator(ctx: Context): Promise<void> {
    if (!ctx.from) return;
    const userId = ctx.from.id.toString();
    const user = await this.userService.getUserByUserId(userId);

    if (!user) {
      await this.showWelcome(ctx);
      return;
    }

    try {
      const projection = await this.userService.calculateEarningsProjection(userId, 12);
      
      let breakdown = '📈 12-Week Earnings Projection\n\n';
      breakdown += `Current Balance: $${projection.currentBalance.toFixed(2)}\n`;
      breakdown += `Weekly ROI: $${projection.weeklyROI.toFixed(2)}\n\n`;

      projection.weeklyBreakdown.slice(0, 8).forEach(week => {
        breakdown += `Week ${week.week}: +$${week.amount.toFixed(2)} → $${week.total.toFixed(2)}\n`;
      });

      if (projection.weeklyBreakdown.length > 8) {
        breakdown += `...\n`;
        const lastWeek = projection.weeklyBreakdown[projection.weeklyBreakdown.length - 1];
        breakdown += `Week ${lastWeek.week}: +$${lastWeek.amount.toFixed(2)} → $${lastWeek.total.toFixed(2)}\n`;
      }

      breakdown += `\n💰 Total Projected: $${projection.totalProjected.toFixed(2)}`;

      await ctx.reply(breakdown, Markup.inlineKeyboard([
        [Markup.button.callback('🏠 Main Menu', 'main_menu')]
      ]));
    } catch (error) {
      logger.error('Error showing earnings calculator:', error);
      await ctx.reply('❌ Error calculating earnings. Please try again.');
    }
  }

  private async showInvestmentHistory(ctx: Context): Promise<void> {
    if (!ctx.from) return;
    const userId = ctx.from.id.toString();
    const user = await this.userService.getUserByUserId(userId);

    if (!user) {
      await this.showWelcome(ctx);
      return;
    }

    try {
      const history = await this.userService.getInvestmentHistory(userId, 10);
      
      if (history.length === 0) {
        await ctx.reply(
          '📊 Investment History\n\nNo transactions found.',
          Markup.inlineKeyboard([
            [Markup.button.callback('🏠 Main Menu', 'main_menu')]
          ])
        );
        return;
      }

      let historyText = '📊 Recent Investment History\n\n';
      
      history.forEach(transaction => {
        const date = transaction.created_at.toLocaleDateString();
        const type = this.getTransactionTypeEmoji(transaction.transaction_type);
        const amount = transaction.amount > 0 ? `+$${transaction.amount.toFixed(2)}` : `-$${Math.abs(transaction.amount).toFixed(2)}`;
        
        historyText += `${type} ${date}\n`;
        historyText += `${amount} - ${transaction.description}\n`;
        historyText += `Balance: $${transaction.balance_after.toFixed(2)}\n\n`;
      });

      await ctx.reply(historyText, Markup.inlineKeyboard([
        [Markup.button.callback('🏠 Main Menu', 'main_menu')]
      ]));
    } catch (error) {
      logger.error('Error showing investment history:', error);
      await ctx.reply('❌ Error loading history. Please try again.');
    }
  }

  private async showWithdraw(ctx: Context): Promise<void> {
    if (!ctx.from) return;
    const userId = ctx.from.id.toString();
    const user = await this.userService.getUserByUserId(userId);

    if (!user) {
      await this.showWelcome(ctx);
      return;
    }

    if (!user.canWithdrawNow()) {
      await ctx.reply(
        '💸 Withdrawal\n\n' +
        '❌ Withdrawal is not available yet.\n' +
        `You need to complete ${user.max_roi_cycles - user.roi_cycles_completed} more ROI cycles.\n\n` +
        `Current Progress: ${user.roi_cycles_completed}/${user.max_roi_cycles}`,
        Markup.inlineKeyboard([
          [Markup.button.callback('🏠 Main Menu', 'main_menu')]
        ])
      );
      return;
    }

    await ctx.reply(
      '💸 Withdrawal\n\n' +
      `Available Balance: $${user.current_balance.toFixed(2)}\n\n` +
      'To request a withdrawal, please contact support with:\n' +
      '• Your withdrawal amount\n' +
      '• Your preferred withdrawal method (BTC/USDT)\n' +
      '• Your withdrawal address\n\n' +
      'Withdrawal addresses:\n' +
      `BTC: ${config.withdrawal.btc}\n` +
      `USDT (TRC20): ${config.withdrawal.usdtTrc20}`,
      Markup.inlineKeyboard([
        [Markup.button.callback('🎫 Contact Support', 'support')],
        [Markup.button.callback('🏠 Main Menu', 'main_menu')]
      ])
    );
  }

  private async showReinvest(ctx: Context): Promise<void> {
    if (!ctx.from) return;
    const userId = ctx.from.id.toString();
    const user = await this.userService.getUserByUserId(userId);

    if (!user) {
      await this.showWelcome(ctx);
      return;
    }

    if (user.current_balance <= 0) {
      await ctx.reply(
        '🔄 Reinvest\n\n' +
        '❌ No balance available for reinvestment.',
        Markup.inlineKeyboard([
          [Markup.button.callback('🏠 Main Menu', 'main_menu')]
        ])
      );
      return;
    }

    await ctx.reply(
      '🔄 Reinvest\n\n' +
      `Current Balance: $${user.current_balance.toFixed(2)}\n\n` +
      'Reinvesting will add your current balance to your initial balance for higher ROI calculations.\n\n' +
      '⚠️ This action cannot be undone. Are you sure?',
      Markup.inlineKeyboard([
        [Markup.button.callback('✅ Yes, Reinvest', 'confirm_reinvest')],
        [Markup.button.callback('❌ Cancel', 'main_menu')]
      ])
    );
  }

  private async showSupport(ctx: Context): Promise<void> {
    if (!ctx.from) return;
    const userId = ctx.from.id.toString();
    const user = await this.userService.getUserByUserId(userId);

    if (!user) {
      await this.showWelcome(ctx);
      return;
    }

    await ctx.reply(
      '🎫 Support\n\n' +
      'How can we help you today?\n\n' +
      'Please describe your issue or question:',
      Markup.inlineKeyboard([
        [Markup.button.callback('❌ Cancel', 'main_menu')]
      ])
    );

    this.supportStates.set(userId, 'waiting_for_message');
  }

  private async handleSupportMessage(ctx: Context): Promise<void> {
    if (!ctx.from || !ctx.message || !('text' in ctx.message)) return;
    const userId = ctx.from.id.toString();
    const message = ctx.message.text;

    if (!this.supportStates.has(userId)) {
      return;
    }

    try {
      await this.supportService.createSupportTicket(userId, message);
      this.supportStates.delete(userId);

      await ctx.reply(
        '✅ Support ticket created successfully!\n\n' +
        'We will review your message and respond as soon as possible.\n' +
        'You can check your ticket status in the main menu.',
        Markup.inlineKeyboard([
          [Markup.button.callback('🏠 Main Menu', 'main_menu')]
        ])
      );
    } catch (error) {
      logger.error('Error creating support ticket:', error);
      await ctx.reply('❌ Error creating support ticket. Please try again.');
    }
  }

  private async showReferral(ctx: Context): Promise<void> {
    if (!ctx.from) return;
    const userId = ctx.from.id.toString();
    const user = await this.userService.getUserByUserId(userId);

    if (!user) {
      await this.showWelcome(ctx);
      return;
    }

    const referralLink = `https://t.me/${this.bot.botInfo?.username}?start=${userId}`;

    await ctx.reply(
      '👥 Referral System\n\n' +
      'Invite friends and earn together!\n\n' +
      'Your referral link:\n' +
      `${referralLink}\n\n` +
      'Share this link with friends. When they register using your link, you both benefit!\n\n' +
      'Referral benefits coming soon! 🚀',
      Markup.inlineKeyboard([
        [Markup.button.callback('🏠 Main Menu', 'main_menu')]
      ])
    );
  }

  private getTransactionTypeEmoji(type: TransactionType): string {
    const emojis = {
      [TransactionType.INITIAL_DEPOSIT]: '💰',
      [TransactionType.ROI_PAYMENT]: '📈',
      [TransactionType.REINVESTMENT]: '🔄',
      [TransactionType.WITHDRAWAL]: '💸',
      [TransactionType.ADMIN_CREDIT]: '➕',
      [TransactionType.ADMIN_DEBIT]: '➖',
      [TransactionType.TRANSFER_IN]: '↗️',
      [TransactionType.TRANSFER_OUT]: '↘️',
    };
    return emojis[type] || '📊';
  }

  public async start(): Promise<void> {
    try {
      await this.bot.launch();
      logger.info('User bot started successfully');
    } catch (error) {
      logger.error('Error starting user bot:', error);
      throw error;
    }
  }

  public async stop(): Promise<void> {
    try {
      this.bot.stop();
      logger.info('User bot stopped');
    } catch (error) {
      logger.error('Error stopping user bot:', error);
      throw error;
    }
  }
}
