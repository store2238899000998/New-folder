# 🚀 GitHub Setup Guide

Follow these steps to push your Investment Telegram Bot to GitHub:

## Step 1: Install Git

### Windows:
1. Download Git from: https://git-scm.com/download/win
2. Run the installer with default settings
3. Restart your terminal/command prompt

### Verify Installation:
```bash
git --version
```

## Step 2: Configure Git (First Time Only)

```bash
# Set your name and email
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Optional: Set default branch name
git config --global init.defaultBranch main
```

## Step 3: Initialize Git Repository

```bash
# Navigate to your project directory
cd "C:\Users\DEVDRIOD INC\Desktop\New folder"

# Initialize git repository
git init

# Add all files to staging
git add .

# Create initial commit
git commit -m "Initial commit: Investment Telegram Bot System

- Complete TypeScript implementation
- Dual bot system (User + Admin)
- ROI management with 8% weekly returns
- Support ticket system
- Database models with TypeORM
- Automatic scheduling with node-cron
- Comprehensive error handling
- Production-ready deployment configuration"
```

## Step 4: Create GitHub Repository

1. Go to https://github.com
2. Click "New repository" (green button)
3. Repository name: `investment-telegram-bot`
4. Description: `Comprehensive Investment Telegram Bot System with TypeScript`
5. Set to Public or Private (your choice)
6. **DO NOT** initialize with README, .gitignore, or license (we already have these)
7. Click "Create repository"

## Step 5: Connect Local Repository to GitHub

```bash
# Add GitHub remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/investment-telegram-bot.git

# Push to GitHub
git push -u origin main
```

## Step 6: Verify Upload

1. Go to your GitHub repository
2. Verify all files are uploaded
3. Check that the README.md displays properly

## 🎉 Success!

Your Investment Telegram Bot is now on GitHub! 

## Next Steps:

1. **Set up GitHub Actions** for CI/CD
2. **Deploy to Heroku/Railway** using the Procfile
3. **Add collaborators** if working in a team
4. **Create issues** for future enhancements
5. **Set up branch protection** for main branch

## Repository Structure:

```
investment-telegram-bot/
├── src/
│   ├── bots/           # User and Admin bot implementations
│   ├── config/         # Configuration and database setup
│   ├── models/         # TypeORM database models
│   ├── services/       # Business logic services
│   └── scheduler/      # ROI scheduling system
├── dist/               # Compiled JavaScript (auto-generated)
├── package.json        # Dependencies and scripts
├── tsconfig.json       # TypeScript configuration
├── Procfile           # Heroku deployment configuration
├── README.md          # Project documentation
└── .gitignore         # Git ignore rules
```

## Environment Variables:

Remember to set these in your deployment platform:
- `ADMIN_BOT_TOKEN`
- `USER_BOT_TOKEN` 
- `ADMIN_CHAT_ID`
- `DATABASE_URL`
- `BTC_ADDRESS`
- `USDT_TRC20_ADDRESS`

## Support:

If you encounter any issues:
1. Check the README.md for detailed setup instructions
2. Review the error logs
3. Ensure all environment variables are set correctly
4. Verify bot tokens are valid and active
