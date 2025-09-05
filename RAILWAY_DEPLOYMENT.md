# 🚂 Railway Deployment Guide

This guide covers deploying the Investment Telegram Bot to Railway with PostgreSQL.

## 🚀 Quick Deploy to Railway

### Method 1: GitHub Integration (Recommended)

1. **Push to GitHub** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Investment Telegram Bot for Railway"
   git remote add origin https://github.com/yourusername/investment-telegram-bot.git
   git push -u origin main
   ```

2. **Connect to Railway**:
   - Go to https://railway.app
   - Sign in with GitHub
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Add PostgreSQL Database**:
   - In your Railway project dashboard
   - Click "New" → "Database" → "PostgreSQL"
   - Railway will automatically set the `DATABASE_URL` environment variable

4. **Set Environment Variables**:
   - Go to your service settings
   - Add these environment variables:
     ```
     ADMIN_BOT_TOKEN=your_admin_bot_token
     USER_BOT_TOKEN=your_user_bot_token
     ADMIN_CHAT_ID=your_admin_chat_id
     BTC_ADDRESS=your_btc_address
     USDT_TRC20_ADDRESS=your_usdt_trc20_address
     NODE_ENV=production
     ```

### Method 2: Railway CLI

1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and Deploy**:
   ```bash
   railway login
   railway init
   railway add postgresql
   railway deploy
   ```

3. **Set Environment Variables**:
   ```bash
   railway variables set ADMIN_BOT_TOKEN=your_token
   railway variables set USER_BOT_TOKEN=your_token
   railway variables set ADMIN_CHAT_ID=your_chat_id
   railway variables set BTC_ADDRESS=your_btc_address
   railway variables set USDT_TRC20_ADDRESS=your_usdt_address
   railway variables set NODE_ENV=production
   ```

## 🔧 Railway Configuration

### Environment Variables

Railway automatically provides:
- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - Application port (Railway sets this automatically)

You need to set:
- `ADMIN_BOT_TOKEN` - Your admin bot token from BotFather
- `USER_BOT_TOKEN` - Your user bot token from BotFather  
- `ADMIN_CHAT_ID` - Your Telegram chat ID
- `BTC_ADDRESS` - Bitcoin withdrawal address
- `USDT_TRC20_ADDRESS` - USDT TRC20 withdrawal address
- `NODE_ENV=production`

### Railway.toml (Optional)

Create a `railway.toml` file for advanced configuration:

```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "npm start"
healthcheckPath = "/health"
healthcheckTimeout = 300
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

[environments.production]
variables = { NODE_ENV = "production" }
```

## 🗄️ Database Setup

### Automatic Setup

The application will automatically:
- Create database tables on first run
- Set up relationships between tables
- Initialize with proper indexes

### Manual Database Management

If you need to manage the database manually:

1. **Connect to Railway PostgreSQL**:
   ```bash
   railway connect postgresql
   ```

2. **View Tables**:
   ```sql
   \dt
   ```

3. **Check Data**:
   ```sql
   SELECT * FROM users;
   SELECT * FROM access_codes;
   SELECT * FROM investment_history;
   SELECT * FROM support_tickets;
   ```

## 🔍 Monitoring and Logs

### View Logs

1. **Railway Dashboard**:
   - Go to your service
   - Click "Logs" tab
   - View real-time logs

2. **Railway CLI**:
   ```bash
   railway logs
   railway logs --follow
   ```

### Health Checks

The application provides health check endpoints:
- `GET /health` - Basic health check
- `GET /admin/stats` - Admin statistics

Railway will automatically monitor these endpoints.

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```
   Error: getaddrinfo ENOTFOUND postgres.railway.internal
   ```
   - Check if PostgreSQL service is running
   - Verify DATABASE_URL is set correctly
   - Wait a few minutes for Railway to provision the database

2. **Bot Token Invalid**
   ```
   Error: 401 Unauthorized
   ```
   - Verify bot tokens with BotFather
   - Check token format (should start with numbers)
   - Ensure bots are not running elsewhere

3. **Build Failures**
   ```
   Error: npm run build failed
   ```
   - Check Railway build logs
   - Ensure all dependencies are in package.json
   - Verify TypeScript compilation

4. **Memory Issues**
   ```
   Error: JavaScript heap out of memory
   ```
   - Railway provides 512MB by default
   - Consider upgrading to higher plan
   - Optimize application memory usage

### Debug Mode

Enable debug logging:
```bash
railway variables set NODE_ENV=development
railway variables set LOG_LEVEL=debug
```

## 📊 Performance Optimization

### Railway Limits

- **Free Tier**: 512MB RAM, 1GB storage
- **Pro Tier**: 8GB RAM, 100GB storage
- **Database**: 1GB storage (free), 100GB (pro)

### Optimization Tips

1. **Database Indexing**:
   - The application creates indexes automatically
   - Monitor query performance in Railway dashboard

2. **Memory Usage**:
   - Monitor memory usage in Railway dashboard
   - Consider upgrading if hitting limits

3. **Caching**:
   - Implement Redis for session storage
   - Cache frequently accessed data

## 🔒 Security

### Environment Variables

- Never commit `.env` files
- Use Railway's secure environment variable storage
- Rotate bot tokens regularly

### Database Security

- Railway provides encrypted connections
- Use strong passwords (Railway generates these)
- Enable SSL connections (automatic)

### Bot Security

- Keep bot tokens secret
- Use webhook mode for production
- Implement rate limiting

## 📈 Scaling

### Horizontal Scaling

Railway supports horizontal scaling:
1. Go to service settings
2. Adjust replica count
3. Railway will distribute load automatically

### Database Scaling

- Upgrade to Pro plan for more storage
- Consider read replicas for high traffic
- Monitor database performance

## 🆘 Support

### Railway Support

- Railway Documentation: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Railway Support: support@railway.app

### Application Support

- Check application logs first
- Verify environment variables
- Test database connectivity
- Review error messages

## 📝 Maintenance

### Regular Tasks

1. **Monitor Logs** - Check for errors daily
2. **Database Backups** - Railway handles this automatically
3. **Token Rotation** - Rotate bot tokens monthly
4. **Security Updates** - Keep dependencies updated
5. **Performance Monitoring** - Monitor response times

### Updates

To update your application:
```bash
git add .
git commit -m "Update application"
git push origin main
```

Railway will automatically redeploy your application.

## 🎉 Success!

Your Investment Telegram Bot is now running on Railway with PostgreSQL!

### Next Steps

1. **Test the Bots** - Send messages to your bots
2. **Create Access Codes** - Use the admin bot to create user access codes
3. **Monitor Performance** - Check Railway dashboard regularly
4. **Set Up Monitoring** - Consider external monitoring services
5. **Backup Strategy** - Railway handles database backups automatically
