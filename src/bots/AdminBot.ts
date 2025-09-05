import { Telegraf, Markup, Context } from 'telegraf';
import { UserService } from '../services/UserService';
import { SupportService } from '../services/SupportService';
import { config } from '../config/config';
import { TransactionType } from '../models/InvestmentHistory';
import { TicketStatus } from '../models/SupportTicket';
import logger from '../config/logger';

export class AdminBot {
  private bot: Telegraf;
  private userService: UserService;
  private supportService: SupportService;
  private adminStates: Map<string, any> = new Map();

  constructor() {
    this.bot = new Telegraf(config.bots.admin.token);
    this.userService = new UserService();
    this.supportService = new SupportService();
    this.setupHandlers();
  }

  private setupHandlers(): void {
    // Start command
    this.bot.start(async (ctx) => {
      if (this.isAdmin(ctx.from.id.toString())) {
        await this.showAdminMenu(ctx);
      } else {
        await ctx.reply('❌ Access denied. This bot is for administrators only.');
      }
    });

    // Admin commands
    this.bot.command('increment_roi', async (ctx) => {
      if (!this.isAdmin(ctx.from.id.toString())) return;
      await this.handleIncrementROI(ctx);
    });

    this.bot.command('debug_db', async (ctx) => {
      if (!this.isAdmin(ctx.from.id.toString())) return;
      await this.handleDebugDB(ctx);
    });

    this.bot.command('roi_status', async (ctx) => {
      if (!this.isAdmin(ctx.from.id.toString())) return;
      await this.handleROIStatus(ctx);
    });

    this.bot.command('catchup_roi', async (ctx) => {
      if (!this.isAdmin(ctx.from.id.toString())) return;
      await this.handleCatchupROI(ctx);
    });

    // Admin menu actions
    this.bot.action('admin_menu', async (ctx) => {
      await this.showAdminMenu(ctx);
    });

    this.bot.action('register_user', async (ctx) => {
      await this.showRegisterUser(ctx);
    });

    this.bot.action('manage_balance', async (ctx) => {
      await this.showManageBalance(ctx);
    });

    this.bot.action('view_tickets', async (ctx) => {
      await this.showSupportTickets(ctx);
    });

    this.bot.action('list_users', async (ctx) => {
      await this.showAllUsers(ctx);
    });

    this.bot.action('roi_management', async (ctx) => {
      await this.showROIManagement(ctx);
    });

    this.bot.action('user_settings', async (ctx) => {
      await this.showUserSettings(ctx);
    });

    // Register user actions
    this.bot.action(/^create_user_(\d+)$/, async (ctx) => {
      await this.handleCreateUser(ctx);
    });

    this.bot.action(/^balance_(\w+)_(\d+)$/, async (ctx) => {
      await this.handleBalanceAction(ctx);
    });

    this.bot.action(/^ticket_(\w+)_(.+)$/, async (ctx) => {
      await this.handleTicketAction(ctx);
    });

    this.bot.action(/^roi_(\w+)_(\d+)$/, async (ctx) => {
      await this.handleROIAction(ctx);
    });

    // Text handlers for admin input
    this.bot.on('text', async (ctx) => {
      const userId = ctx.from.id.toString();
      const state = this.adminStates.get(userId);
      
      if (state) {
        await this.handleAdminInput(ctx, state);
      }
    });

    // Error handling
    this.bot.catch((err, ctx) => {
      logger.error('Admin bot error:', err);
      ctx.reply('An error occurred. Please try again later.');
    });
  }

  private isAdmin(userId: string | undefined): boolean {
    return userId === config.bots.admin.chatId;
  }

  private async showAdminMenu(ctx: Context): Promise<void> {
    if (!ctx.from || !this.isAdmin(ctx.from.id.toString())) return;

    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback('👤 Register New User', 'register_user')],
      [Markup.button.callback('💰 Manage Balance', 'manage_balance')],
      [Markup.button.callback('🎫 View Support Tickets', 'view_tickets')],
      [Markup.button.callback('📊 List All Users', 'list_users')],
      [Markup.button.callback('🔄 ROI Management', 'roi_management')],
      [Markup.button.callback('⚙️ User Settings', 'user_settings')]
    ]);

    await ctx.reply(
      '🔧 Admin Panel\n\n' +
      'Welcome to the Investment Bot Admin Panel.\n' +
      'Select an option to manage the system:',
      keyboard
    );
  }

  private async showRegisterUser(ctx: Context): Promise<void> {
    if (!ctx.from || !this.isAdmin(ctx.from.id.toString())) return;

    await ctx.reply(
      '👤 Register New User\n\n' +
      'Please provide the following information:\n\n' +
      '1. User ID (Telegram ID)\n' +
      '2. Name\n' +
      '3. Initial Balance\n' +
      '4. Email (optional)\n' +
      '5. Phone (optional)\n' +
      '6. Country (optional)\n\n' +
      'Format: /register <user_id> <name> <initial_balance> [email] [phone] [country]\n\n' +
      'Example: /register 123456789 John 1000 john@email.com +1234567890 USA',
      Markup.inlineKeyboard([
        [Markup.button.callback('🏠 Admin Menu', 'admin_menu')]
      ])
    );
  }

  private async showManageBalance(ctx: Context): Promise<void> {
    if (!ctx.from || !this.isAdmin(ctx.from.id.toString())) return;

    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback('➕ Credit User', 'balance_credit_0')],
      [Markup.button.callback('➖ Debit User', 'balance_debit_0')],
      [Markup.button.callback('↔️ Transfer Between Users', 'balance_transfer_0')],
      [Markup.button.callback('🏠 Admin Menu', 'admin_menu')]
    ]);

    await ctx.reply(
      '💰 Balance Management\n\n' +
      'Select an action to manage user balances:',
      keyboard
    );
  }

  private async showSupportTickets(ctx: Context): Promise<void> {
    if (!ctx.from || !this.isAdmin(ctx.from.id.toString())) return;

    try {
      const tickets = await this.supportService.getSupportTickets();
      const stats = await this.supportService.getTicketsStats();

      let ticketsText = '🎫 Support Tickets\n\n';
      ticketsText += `📊 Stats: Total: ${stats.total} | Open: ${stats.open} | In Progress: ${stats.inProgress} | Closed: ${stats.closed}\n\n`;

      if (tickets.length === 0) {
        ticketsText += 'No tickets found.';
      } else {
        tickets.slice(0, 10).forEach(ticket => {
          const status = this.getTicketStatusEmoji(ticket.status);
          const date = ticket.created_at.toLocaleDateString();
          ticketsText += `${status} #${ticket.ticket_id.substring(0, 8)}\n`;
          ticketsText += `User: ${ticket.user?.name || 'Unknown'}\n`;
          ticketsText += `Status: ${ticket.status}\n`;
          ticketsText += `Date: ${date}\n`;
          ticketsText += `Message: ${ticket.message.substring(0, 50)}...\n\n`;
        });
      }

      const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('🔄 Refresh', 'view_tickets')],
        [Markup.button.callback('🏠 Admin Menu', 'admin_menu')]
      ]);

      await ctx.reply(ticketsText, keyboard);
    } catch (error) {
      logger.error('Error showing support tickets:', error);
      await ctx.reply('❌ Error loading support tickets.');
    }
  }

  private async showAllUsers(ctx: Context): Promise<void> {
    if (!ctx.from || !this.isAdmin(ctx.from.id.toString())) return;

    try {
      const users = await this.userService.getAllUsers();
      
      let usersText = '📊 All Users\n\n';
      
      if (users.length === 0) {
        usersText += 'No users found.';
      } else {
        users.forEach((user, index) => {
          usersText += `${index + 1}. ${user.name}\n`;
          usersText += `   ID: ${user.user_id}\n`;
          usersText += `   Balance: $${user.current_balance.toFixed(2)}\n`;
          usersText += `   ROI Cycles: ${user.roi_cycles_completed}/${user.max_roi_cycles}\n`;
          usersText += `   Can Withdraw: ${user.canWithdrawNow() ? 'Yes' : 'No'}\n`;
          usersText += `   Joined: ${user.created_at.toLocaleDateString()}\n\n`;
        });
      }

      const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('🔄 Refresh', 'list_users')],
        [Markup.button.callback('🏠 Admin Menu', 'admin_menu')]
      ]);

      await ctx.reply(usersText, keyboard);
    } catch (error) {
      logger.error('Error showing all users:', error);
      await ctx.reply('❌ Error loading users.');
    }
  }

  private async showROIManagement(ctx: Context): Promise<void> {
    if (!ctx.from || !this.isAdmin(ctx.from.id.toString())) return;

    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback('🔄 Process Weekly ROI', 'roi_process_0')],
      [Markup.button.callback('📊 ROI Status', 'roi_status_0')],
      [Markup.button.callback('⚡ Catchup Missed ROI', 'roi_catchup_0')],
      [Markup.button.callback('🏠 Admin Menu', 'admin_menu')]
    ]);

    await ctx.reply(
      '🔄 ROI Management\n\n' +
      'Manage ROI processing and cycles:',
      keyboard
    );
  }

  private async showUserSettings(ctx: Context): Promise<void> {
    if (!ctx.from || !this.isAdmin(ctx.from.id.toString())) return;

    await ctx.reply(
      '⚙️ User Settings\n\n' +
      'User settings and configuration options:\n\n' +
      '• ROI Percentage: 8%\n' +
      '• Required Cycles: 4\n' +
      '• ROI Interval: 7 days\n' +
      '• Withdrawal Enabled: After 4 cycles\n\n' +
      'Settings are configured in the environment variables.',
      Markup.inlineKeyboard([
        [Markup.button.callback('🏠 Admin Menu', 'admin_menu')]
      ])
    );
  }

  private async handleIncrementROI(ctx: Context): Promise<void> {
    if (!ctx.from || !this.isAdmin(ctx.from.id.toString())) return;

    if (!ctx.message || !('text' in ctx.message)) return;
    const args = ctx.message.text.split(' ');
    if (args.length < 2) {
      await ctx.reply('Usage: /increment_roi <user_id>');
      return;
    }

    const userId = args[1];
    
    try {
      const user = await this.userService.getUserByUserId(userId);
      if (!user) {
        await ctx.reply('❌ User not found.');
        return;
      }

      await this.userService.processROIForUser(userId);
      await ctx.reply(`✅ ROI incremented for user ${user.name} (${userId})`);
    } catch (error) {
      logger.error('Error incrementing ROI:', error);
      await ctx.reply('❌ Error incrementing ROI.');
    }
  }

  private async handleDebugDB(ctx: Context): Promise<void> {
    if (!ctx.from || !this.isAdmin(ctx.from.id.toString())) return;

    try {
      const users = await this.userService.getAllUsers();
      const tickets = await this.supportService.getSupportTickets();
      const stats = await this.supportService.getTicketsStats();

      const debugInfo = `🔍 Database Debug Info\n\n` +
        `Users: ${users.length}\n` +
        `Tickets: ${tickets.length}\n` +
        `Open Tickets: ${stats.open}\n` +
        `Database URL: ${config.database.url}\n` +
        `Database Type: ${config.database.type}\n` +
        `Environment: ${config.app.nodeEnv}`;

      await ctx.reply(debugInfo);
    } catch (error) {
      logger.error('Error getting debug info:', error);
      await ctx.reply('❌ Error getting debug information.');
    }
  }

  private async handleROIStatus(ctx: Context): Promise<void> {
    if (!ctx.from || !this.isAdmin(ctx.from.id.toString())) return;

    try {
      const users = await this.userService.getAllUsers();
      const dueUsers = users.filter(user => user.isROIDue());
      
      let statusText = '📊 ROI Status\n\n';
      statusText += `Total Users: ${users.length}\n`;
      statusText += `ROI Due: ${dueUsers.length}\n\n`;

      if (dueUsers.length > 0) {
        statusText += 'Users with ROI due:\n';
        dueUsers.forEach(user => {
          statusText += `• ${user.name} (${user.user_id})\n`;
          statusText += `  Balance: $${user.current_balance.toFixed(2)}\n`;
          statusText += `  Next ROI: $${user.getNextROIAmount().toFixed(2)}\n\n`;
        });
      }

      await ctx.reply(statusText);
    } catch (error) {
      logger.error('Error getting ROI status:', error);
      await ctx.reply('❌ Error getting ROI status.');
    }
  }

  private async handleCatchupROI(ctx: Context): Promise<void> {
    if (!ctx.from || !this.isAdmin(ctx.from.id.toString())) return;

    try {
      const result = await this.userService.processWeeklyROI();
      
      await ctx.reply(
        `✅ ROI Catchup Completed\n\n` +
        `Processed: ${result.processed} users\n` +
        `Errors: ${result.errors.length}\n\n` +
        (result.errors.length > 0 ? `Errors:\n${result.errors.join('\n')}` : '')
      );
    } catch (error) {
      logger.error('Error catching up ROI:', error);
      await ctx.reply('❌ Error catching up ROI.');
    }
  }

  private async handleCreateUser(ctx: Context): Promise<void> {
    // Placeholder for create user functionality
    await ctx.reply('Create user functionality - to be implemented');
  }

  private async handleBalanceAction(ctx: Context): Promise<void> {
    // Placeholder for balance action functionality
    await ctx.reply('Balance action functionality - to be implemented');
  }

  private async handleTicketAction(ctx: Context): Promise<void> {
    // Placeholder for ticket action functionality
    await ctx.reply('Ticket action functionality - to be implemented');
  }

  private async handleROIAction(ctx: Context): Promise<void> {
    // Placeholder for ROI action functionality
    await ctx.reply('ROI action functionality - to be implemented');
  }

  private async handleAdminInput(ctx: Context, state: any): Promise<void> {
    // Handle various admin input states
    // This would be expanded based on specific admin workflows
    if (!ctx.from) return;
    this.adminStates.delete(ctx.from.id.toString());
    await ctx.reply('Input received. Processing...');
  }

  private getTicketStatusEmoji(status: TicketStatus): string {
    const emojis = {
      [TicketStatus.OPEN]: '🔴',
      [TicketStatus.IN_PROGRESS]: '🟡',
      [TicketStatus.CLOSED]: '🟢',
    };
    return emojis[status] || '⚪';
  }

  public async start(): Promise<void> {
    try {
      await this.bot.launch();
      logger.info('Admin bot started successfully');
    } catch (error) {
      logger.error('Error starting admin bot:', error);
      throw error;
    }
  }

  public async stop(): Promise<void> {
    try {
      this.bot.stop();
      logger.info('Admin bot stopped');
    } catch (error) {
      logger.error('Error stopping admin bot:', error);
      throw error;
    }
  }
}
