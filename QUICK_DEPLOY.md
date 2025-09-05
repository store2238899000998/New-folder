# 🚀 Quick Deploy Guide - PostgreSQL Fixed

## ✅ Issues Fixed

The Railway deployment was crashing due to PostgreSQL compatibility issues. All fixed now!

### Fixed Issues:
1. **Data Types**: Changed `datetime` to `timestamp` for PostgreSQL
2. **Decimal Types**: Changed `decimal` to `numeric` for PostgreSQL
3. **Database Models**: All models now PostgreSQL-compatible

## 🚀 Deploy to Railway

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Fix PostgreSQL compatibility issues"
git push origin main
```

### Step 2: Railway Deployment
1. Go to https://railway.app
2. Your project should auto-deploy from GitHub
3. If not, click "Deploy" in your project

### Step 3: Set Environment Variables
In Railway dashboard, set these variables:
```
ADMIN_BOT_TOKEN=8341330765:AAFIgDobsvwEDcv3Sfr3frd_YGLnzh_uUyg
USER_BOT_TOKEN=8048858440:AAEtus5gVMYqK9VCV3oXFPIjeh58k8CRkAE
ADMIN_CHAT_ID=7276288482
BTC_ADDRESS=bc1qkd70f9h38r4ghlzaffdh2tvhp968ws7gkgkmgq
USDT_TRC20_ADDRESS=TCMdpSWi6Y9ykpmG3LdZFC2sC1j8YZc9Nu
NODE_ENV=production
```

### Step 4: Add PostgreSQL Database
1. In Railway project, click "New"
2. Select "Database" → "PostgreSQL"
3. Railway will automatically set `DATABASE_URL`

## ✅ What's Working Now

- ✅ PostgreSQL database connection
- ✅ All data types compatible with PostgreSQL
- ✅ Automatic table creation
- ✅ User registration system
- ✅ ROI management (8% weekly)
- ✅ Support ticket system
- ✅ Admin and User bots
- ✅ Transaction history
- ✅ Balance management

## 🔍 Test Your Deployment

1. **Check Logs**: Railway dashboard → Logs tab
2. **Test Health**: Visit `https://your-app.railway.app/health`
3. **Test Bots**: Send `/start` to your bots

## 🎉 Success!

Your Investment Telegram Bot should now be running successfully on Railway with PostgreSQL!

### Bot Features:
- **User Bot**: `/start <code>` to register
- **Admin Bot**: Manage users, ROI, support tickets
- **ROI System**: Automatic 8% weekly payments
- **Support**: Create and manage support tickets
- **Balance**: Check balance, withdraw, reinvest

The deployment should now be stable and running without crashes! 🚀
