# 🚀 Deployment Guide

This guide covers multiple deployment options for the Investment Telegram Bot System.

## 📋 Prerequisites

- Node.js 18+ installed
- Git installed
- Environment variables configured
- Bot tokens from BotFather

## 🔧 Environment Variables

Create a `.env` file with the following variables:

```env
# Bot Configuration
ADMIN_BOT_TOKEN=your_admin_bot_token_here
USER_BOT_TOKEN=your_user_bot_token_here
ADMIN_CHAT_ID=your_admin_chat_id_here

# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database
# OR for SQLite: DATABASE_URL=sqlite://./investment_bot.db

# Withdrawal Addresses
BTC_ADDRESS=your_btc_address_here
USDT_TRC20_ADDRESS=your_usdt_trc20_address_here

# Application Settings
NODE_ENV=production
PORT=3000
TIMEZONE=UTC

# ROI Configuration
ROI_PERCENTAGE=8
ROI_CYCLES_REQUIRED=4
ROI_INTERVAL_DAYS=7
```

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)

```bash
# Clone the repository
git clone https://github.com/yourusername/investment-telegram-bot.git
cd investment-telegram-bot

# Create .env file with your configuration
cp env.example .env
# Edit .env with your values

# Start the application
docker-compose up -d

# View logs
docker-compose logs -f investment-bot
```

### Using Docker Build

```bash
# Build the image
docker build -t investment-bot .

# Run the container
docker run -d \
  --name investment-bot \
  --env-file .env \
  -p 3000:3000 \
  investment-bot
```

## ☁️ Cloud Deployment

### Heroku

1. **Install Heroku CLI**
   ```bash
   # Download from https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Login and Create App**
   ```bash
   heroku login
   heroku create your-app-name
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set ADMIN_BOT_TOKEN=your_token
   heroku config:set USER_BOT_TOKEN=your_token
   heroku config:set ADMIN_CHAT_ID=your_chat_id
   heroku config:set DATABASE_URL=your_database_url
   heroku config:set BTC_ADDRESS=your_btc_address
   heroku config:set USDT_TRC20_ADDRESS=your_usdt_address
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

### Railway

1. **Connect GitHub Repository**
   - Go to https://railway.app
   - Connect your GitHub account
   - Select your repository

2. **Set Environment Variables**
   - In Railway dashboard, go to Variables tab
   - Add all required environment variables

3. **Deploy**
   - Railway will automatically deploy on push to main branch

### DigitalOcean App Platform

1. **Create New App**
   - Go to https://cloud.digitalocean.com/apps
   - Click "Create App"
   - Connect your GitHub repository

2. **Configure Environment**
   - Set environment variables
   - Configure build settings:
     - Build Command: `npm run build`
     - Run Command: `npm start`

3. **Deploy**
   - Click "Create Resources"

## 🗄️ Database Setup

### PostgreSQL (Recommended for Production)

1. **Create Database**
   ```sql
   CREATE DATABASE investment_bot;
   CREATE USER bot_user WITH PASSWORD 'secure_password';
   GRANT ALL PRIVILEGES ON DATABASE investment_bot TO bot_user;
   ```

2. **Update DATABASE_URL**
   ```
   DATABASE_URL=postgresql://bot_user:secure_password@host:5432/investment_bot
   ```

### SQLite (Development Only)

```env
DATABASE_URL=sqlite://./investment_bot.db
```

## 🔍 Health Checks

The application includes health check endpoints:

- **Health Check**: `GET /health`
- **Admin Stats**: `GET /admin/stats`

## 📊 Monitoring

### Logs

```bash
# View application logs
docker-compose logs -f investment-bot

# View specific service logs
docker-compose logs -f postgres
```

### Database Monitoring

```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U postgres -d investment_bot

# View tables
\dt

# Check users
SELECT * FROM users;
```

## 🔧 Troubleshooting

### Common Issues

1. **Bot Token Invalid**
   - Verify tokens with BotFather
   - Check token format
   - Ensure bots are not already running elsewhere

2. **Database Connection Failed**
   - Check DATABASE_URL format
   - Verify database server is running
   - Check network connectivity

3. **Build Failures**
   - Ensure Node.js 18+ is installed
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and reinstall

4. **Memory Issues**
   - Increase container memory limits
   - Monitor memory usage
   - Consider upgrading server resources

### Debug Mode

```bash
# Enable debug logging
NODE_ENV=development npm start

# View detailed logs
DEBUG=* npm start
```

## 🔒 Security Considerations

1. **Environment Variables**
   - Never commit .env files
   - Use secure password generation
   - Rotate tokens regularly

2. **Database Security**
   - Use strong passwords
   - Enable SSL connections
   - Restrict database access

3. **Bot Security**
   - Keep bot tokens secret
   - Use webhook mode for production
   - Implement rate limiting

## 📈 Scaling

### Horizontal Scaling

```yaml
# docker-compose.yml
services:
  investment-bot:
    deploy:
      replicas: 3
    environment:
      - NODE_ENV=production
```

### Load Balancing

Use nginx or similar to distribute load:

```nginx
upstream investment_bot {
    server investment-bot-1:3000;
    server investment-bot-2:3000;
    server investment-bot-3:3000;
}

server {
    listen 80;
    location / {
        proxy_pass http://investment_bot;
    }
}
```

## 🆘 Support

For deployment issues:

1. Check the logs first
2. Verify environment variables
3. Test database connectivity
4. Review the README.md
5. Check GitHub issues

## 📝 Maintenance

### Regular Tasks

1. **Monitor Logs** - Check for errors daily
2. **Database Backups** - Schedule regular backups
3. **Token Rotation** - Rotate bot tokens monthly
4. **Security Updates** - Keep dependencies updated
5. **Performance Monitoring** - Monitor response times

### Backup Strategy

```bash
# Database backup
pg_dump investment_bot > backup_$(date +%Y%m%d).sql

# Restore backup
psql investment_bot < backup_20240101.sql
```
