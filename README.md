# 💰 Investment Telegram Bot System

A comprehensive investment management system built with **TypeScript**, featuring dual Telegram bots for users and administrators, automatic ROI processing, and a complete support system.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Telegram](https://img.shields.io/badge/Telegram-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white)](https://telegram.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/investment-telegram-bot.git
cd investment-telegram-bot

# Install dependencies
npm install

# Set up environment variables
cp env.example .env
# Edit .env with your bot tokens and configuration

# Build the project
npm run build

# Start the application
npm start
```

## Features

### 🤖 Dual Bot System
- **User Bot**: For end-users to manage investments, check balance, withdraw, reinvest
- **Admin Bot**: For administrators to manage users, ROI cycles, support tickets
- Both bots run simultaneously with proper session management

### 👤 User Registration System
- **Access Code System**: Admin creates users with unique access codes
- **User Redemption**: Users redeem codes via `/start <code>` or `/code <code>`
- **User Data**: Name, email, phone, country, initial balance, current balance
- **Authentication**: Users must redeem access code before accessing features

### 📈 ROI System (8% Weekly)
- **Automatic ROI**: Weekly 8% payments based on initial balance
- **ROI Cycles**: 0-4 cycles, withdrawal unlocked at 4 cycles
- **Manual ROI**: Admin can increment ROI cycles with balance addition
- **ROI Calculation**: 8% of initial balance added to current balance
- **Transaction History**: All ROI payments recorded with metadata

### 💰 Balance Management
- **Current Balance**: Tracks user's current available balance
- **Initial Balance**: Fixed reference for ROI calculations
- **Balance Operations**: Credit, debit, transfer between users
- **Withdrawal System**: Enabled after 4 ROI cycles completed

### 📊 Transaction History
- **Transaction Types**: initial_deposit, roi_payment, reinvestment, withdrawal, admin_credit
- **Metadata**: Cycle numbers, ROI percentages, admin actions
- **Balance Tracking**: Before/after balance for each transaction
- **User Queries**: Investment history, earnings calculator, projections

### 🎫 Support System
- **Ticket Creation**: Users can create support tickets with FSM
- **Admin Management**: View, respond to, and manage support tickets
- **Ticket States**: open, closed, in_progress
- **Admin Notifications**: Real-time notifications for new tickets

## Technical Stack

- **Language**: TypeScript
- **Framework**: Telegraf (Telegram Bot Framework)
- **Database**: TypeORM with SQLite/PostgreSQL support
- **Scheduler**: node-cron for automatic ROI processing
- **Web Server**: Express.js for health checks and admin API
- **Logging**: Winston for comprehensive logging

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd investment-bot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   ADMIN_BOT_TOKEN=your_admin_bot_token_here
   USER_BOT_TOKEN=your_user_bot_token_here
   ADMIN_CHAT_ID=your_admin_chat_id_here
   DATABASE_URL=sqlite://./investment_bot.db
   BTC_ADDRESS=your_btc_address_here
   USDT_TRC20_ADDRESS=your_usdt_trc20_address_here
   ```

4. **Build the project**
   ```bash
   npm run build
   ```

5. **Start the application**
   ```bash
   npm start
   ```

## Development

```bash
# Development mode with hot reload
npm run dev

# Development mode with file watching
npm run dev:watch

# Build for production
npm run build
```

## Database Models

### User
- Primary key with autoincrement for SQLite compatibility
- Telegram user ID (BigInteger)
- User information (name, email, phone, country)
- Balance tracking (initial, current)
- ROI cycle management
- Withdrawal permissions

### AccessCode
- Unique access codes for user registration
- Initial balance assignment
- Usage tracking and expiration
- Preassigned user support

### InvestmentHistory
- Complete transaction history
- Transaction types and metadata
- Balance tracking (before/after)
- ROI cycle information

### SupportTicket
- User support ticket system
- Status management (open, in_progress, closed)
- Admin response tracking
- UUID-based ticket identification

## Bot Commands

### User Bot Commands
- `/start <code>` - Register with access code
- `/code <code>` - Alternative registration
- Main menu with balance, earnings, history, withdraw, reinvest, support, referral

### Admin Bot Commands
- `/increment_roi <user_id>` - Manually increment ROI for user
- `/debug_db` - Database debug information
- `/roi_status` - ROI status for all users
- `/catchup_roi` - Process missed ROI payments
- Admin panel with user management, balance management, support tickets

## ROI System

### Automatic Processing
- Runs daily at 12:00 UTC
- Processes all users with due ROI
- 8% of initial balance added to current balance
- Increments ROI cycle counter
- Enables withdrawal after 4 cycles

### Manual Processing
- Admin can manually process ROI for specific users
- Same calculation as automatic processing
- Recorded as admin action in transaction history

## Deployment

### Heroku Deployment
1. Create a new Heroku app
2. Set environment variables in Heroku dashboard
3. Deploy using Git:
   ```bash
   git push heroku main
   ```

### Environment Variables
- `ADMIN_BOT_TOKEN`: Admin bot token from BotFather
- `USER_BOT_TOKEN`: User bot token from BotFather
- `ADMIN_CHAT_ID`: Admin's Telegram chat ID
- `DATABASE_URL`: Database connection string
- `BTC_ADDRESS`: Bitcoin withdrawal address
- `USDT_TRC20_ADDRESS`: USDT TRC20 withdrawal address

### Database Configuration
- **Development**: SQLite (file-based)
- **Production**: PostgreSQL (recommended)
- Automatic migrations and schema synchronization

## Security Features

- Admin-only commands with user ID validation
- User authentication via access codes
- Input validation and sanitization
- SQL injection prevention through TypeORM
- Bot token security through environment variables

## Monitoring and Logging

- Comprehensive Winston logging
- Error tracking and reporting
- Health check endpoints
- Database connection monitoring
- Bot status monitoring

## API Endpoints

- `GET /health` - Health check
- `GET /admin/stats` - Basic statistics (admin only)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions, please contact the development team or create an issue in the repository.
