# 🤖 Telegram Bot Troubleshooting Guide

## Issue: Bots Not Working

If your Investment Telegram Bot application is running but the Telegram bots are not responding, follow this guide.

## 🔍 Step 1: Check Railway Logs

1. Go to your Railway project dashboard
2. Click on "Logs" tab
3. Look for these error messages:

### Common Error Messages:

```
❌ Error starting user bot: 401 Unauthorized
❌ Error starting admin bot: 401 Unauthorized
Missing required environment variable: ADMIN_BOT_TOKEN
Missing required environment variable: USER_BOT_TOKEN
Invalid ADMIN_BOT_TOKEN format
Invalid USER_BOT_TOKEN format
```

## 🔧 Step 2: Set Environment Variables

In Railway dashboard:

1. Go to your project
2. Click on "Variables" tab
3. Add these environment variables:

```
ADMIN_BOT_TOKEN=8341330765:AAFIgDobsvwEDcv3Sfr3frd_YGLnzh_uUyg
USER_BOT_TOKEN=8048858440:AAEtus5gVMYqK9VCV3oXFPIjeh58k8CRkAE
ADMIN_CHAT_ID=7276288482
BTC_ADDRESS=bc1qkd70f9h38r4ghlzaffdh2tvhp968ws7gkgkmgq
USDT_TRC20_ADDRESS=TCMdpSWi6Y9ykpmG3LdZFC2sC1j8YZc9Nu
NODE_ENV=production
```

## 🔍 Step 3: Verify Bot Tokens

### Check Bot Tokens with BotFather:

1. Open Telegram
2. Search for @BotFather
3. Send `/mybots`
4. Select your bot
5. Click "API Token"
6. Copy the token

### Token Format:
- Should look like: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`
- Must contain a colon (:)
- Should be around 45-50 characters long

## 🔍 Step 4: Check Bot Status

### Test Bot Tokens:

1. **User Bot Test**:
   - Open Telegram
   - Search for your user bot username
   - Send `/start`
   - Should respond with welcome message

2. **Admin Bot Test**:
   - Open Telegram
   - Search for your admin bot username
   - Send `/start`
   - Should respond with admin panel

## 🔧 Step 5: Common Fixes

### Fix 1: Restart Railway Service
1. Go to Railway dashboard
2. Click "Deployments"
3. Click "Redeploy" on latest deployment

### Fix 2: Check Bot Permissions
1. Go to @BotFather
2. Select your bot
3. Click "Bot Settings"
4. Make sure bot is not disabled

### Fix 3: Verify Admin Chat ID
1. Send a message to @userinfobot
2. Copy your chat ID
3. Use this as ADMIN_CHAT_ID

### Fix 4: Check Bot Commands
1. Go to @BotFather
2. Select your bot
3. Click "Edit Bot"
4. Click "Edit Commands"
5. Add these commands:

**User Bot Commands:**
```
start - Start the bot and register
code - Register with access code
balance - Check your balance
withdraw - Request withdrawal
support - Create support ticket
```

**Admin Bot Commands:**
```
start - Open admin panel
increment_roi - Increment ROI for user
debug_db - Database debug info
roi_status - Check ROI status
catchup_roi - Process missed ROI
```

## 🔍 Step 6: Debug Mode

Add these environment variables for debugging:

```
LOG_LEVEL=debug
NODE_ENV=development
```

This will show more detailed logs.

## 🔍 Step 7: Test Health Endpoint

1. Go to your Railway app URL
2. Visit `/health` endpoint
3. Should return:
```json
{
  "status": "healthy",
  "timestamp": "2025-09-05T16:37:40.795Z",
  "environment": "production",
  "version": "1.0.0"
}
```

## 🔍 Step 8: Check Database Connection

Look for these logs:
```
✅ PostgreSQL database connection established successfully
✅ Database tables created/verified successfully
```

If you see database errors, the bots won't start.

## 🚨 Emergency Fix

If nothing works, try this:

1. **Delete and recreate bots**:
   - Go to @BotFather
   - Delete old bots
   - Create new bots
   - Get new tokens
   - Update Railway environment variables

2. **Reset Railway database**:
   - Go to Railway dashboard
   - Delete PostgreSQL service
   - Add new PostgreSQL service
   - Redeploy application

## ✅ Success Indicators

When working correctly, you should see:

```
✅ PostgreSQL database connection established successfully
✅ ROI Scheduler started
✅ User bot started
✅ Admin bot started
✅ Express server started on port 3000
🚀 Investment Bot Application started successfully!
```

## 🆘 Still Not Working?

1. **Check Railway logs** for specific error messages
2. **Verify all environment variables** are set correctly
3. **Test bot tokens** with @BotFather
4. **Check bot permissions** and status
5. **Restart Railway service** completely

## 📞 Support

If you're still having issues:

1. Share the Railway logs
2. Confirm environment variables are set
3. Verify bot tokens are correct
4. Check if bots respond manually in Telegram

The most common issue is missing or incorrect environment variables in Railway! 🔧
