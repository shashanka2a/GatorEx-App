# GatorEx Deployment Guide with Turso

This guide explains how to deploy GatorEx with Turso database integration.

## 🗄️ Database Setup Complete

Your Turso database is configured with these credentials:

- **Database URL**: `libsql://gatorex-shashanka2a.aws-us-east-2.turso.io`
- **Auth Token**: `eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9...` (stored in environment variables)

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)

1. **Connect Repository**
   ```bash
   # Push to GitHub if not already done
   git add .
   git commit -m "Add Turso database integration"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure environment variables (see below)

3. **Environment Variables for Vercel**
   ```env
   # Database
   DATABASE_URL=libsql://gatorex-shashanka2a.aws-us-east-2.turso.io
   TURSO_AUTH_TOKEN=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NTY2NDM5NzQsImlkIjoiZDM0MTIzZDMtM2ViYS00ZmQ4LTkxNzgtMzNhYmQ1MzAxNDkwIiwicmlkIjoiZGMxYjc0N2MtODI3Ny00NjhjLTg4ZGMtYzEzZjg0OWVjZGU0In0.5MH058xbQG0x0Fgicn6BDZJ3yP0goRQ0obkj0M1hbQAbX8xB7Eq8jux2mJlAY3f5lj1XJr8t8ry2YEBnOZyMAA

   # App Configuration
   NEXTAUTH_URL=https://your-app-name.vercel.app
   NEXTAUTH_SECRET=your-production-secret-key-here
   NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app

   # Email (Gmail SMTP)
   SMTP_USER=gatorex.shop@gmail.com
   SMTP_PASS=npicbczewjrefvht
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587

   # Other services (if needed)
   OPENAI_API_KEY=your-openai-key
   CLOUDINARY_CLOUD_NAME=gatorex
   CLOUDINARY_API_KEY=545624727647286
   CLOUDINARY_API_SECRET=YPjIuy0ierEwLnckb31oQsF8fzs
   ```

### Option 2: Netlify

1. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `.next`

2. **Environment Variables**
   Use the same environment variables as Vercel above.

### Option 3: Railway

1. **Deploy from GitHub**
   - Connect your repository
   - Railway will auto-detect Next.js

2. **Environment Variables**
   Add the same variables as above in Railway dashboard.

## 🔧 Production Configuration

### Database Schema Deployment

The database schema needs to be created in your Turso database. You have two options:

#### Option A: Manual Schema Creation (Recommended)

Use the Turso CLI to create tables:

```bash
# Install Turso CLI (if not already installed)
curl -sSfL https://get.tur.so/install.sh | bash

# Login to Turso
turso auth login

# Connect to your database
turso db shell gatorex-shashanka2a

# Create tables (copy-paste the SQL from scripts/push-schema-to-turso.js)
```

#### Option B: Automated Schema Push

```bash
# Run the schema push script
npm run push:schema
```

### Environment Variables Explanation

| Variable | Purpose | Required |
|----------|---------|----------|
| `DATABASE_URL` | Turso database connection | ✅ |
| `TURSO_AUTH_TOKEN` | Turso authentication | ✅ |
| `NEXTAUTH_URL` | Your app's URL | ✅ |
| `NEXTAUTH_SECRET` | Session encryption key | ✅ |
| `SMTP_USER` | Gmail for magic links | ✅ |
| `SMTP_PASS` | Gmail app password | ✅ |
| `OPENAI_API_KEY` | AI features | Optional |
| `CLOUDINARY_*` | Image uploads | Optional |

## 🧪 Testing Production Deployment

1. **Test Authentication Flow**
   - Visit `/verify`
   - Enter a UF email address
   - Check email for magic link
   - Complete sign-in process

2. **Test Database Connection**
   - Sign in successfully
   - Complete profile setup
   - Verify data is stored in Turso

3. **Test Protected Routes**
   - Access `/buy` (should work after sign-in)
   - Access `/sell` (should require verification)
   - Access `/me` (should show profile)

## 🔒 Security Checklist

- [ ] `NEXTAUTH_SECRET` is a strong, unique value
- [ ] Database credentials are in environment variables only
- [ ] SMTP credentials are secure (use app passwords)
- [ ] UF email restriction is working
- [ ] Magic links expire properly (24 hours)
- [ ] Protected routes require authentication

## 📊 Monitoring

### Turso Database Monitoring

```bash
# Check database usage
turso db show gatorex-shashanka2a

# View database size
turso db shell gatorex-shashanka2a "SELECT COUNT(*) as users FROM users;"
```

### Application Monitoring

- Monitor sign-in success rates
- Track UF email verification rates
- Watch for authentication errors
- Monitor database connection health

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify `TURSO_AUTH_TOKEN` is correct
   - Check if database URL is accessible
   - Ensure tables exist in Turso database

2. **Authentication Not Working**
   - Verify `NEXTAUTH_URL` matches your domain
   - Check `NEXTAUTH_SECRET` is set
   - Confirm SMTP credentials are correct

3. **UF Email Restriction Issues**
   - Test with `@ufl.edu` and `@gators.ufl.edu` emails
   - Check email validation logic
   - Verify magic link generation

### Debug Commands

```bash
# Test authentication system
npm run test:auth

# Check database connection
npm run db:studio

# View application logs
vercel logs your-app-name
```

## 📈 Scaling Considerations

### Database Scaling
- Turso automatically handles scaling
- Monitor row reads/writes in dashboard
- Consider upgrading plan if needed

### Application Scaling
- Vercel handles auto-scaling
- Monitor response times
- Consider edge functions for better performance

## 🔄 Updates and Maintenance

### Database Schema Updates

1. Update `prisma/schema.prisma`
2. Test locally: `npm run db:push`
3. Deploy schema to production
4. Deploy application updates

### Environment Variable Updates

1. Update in deployment platform
2. Restart application
3. Test functionality

## 📞 Support

- **Turso Issues**: [Turso Discord](https://discord.gg/turso)
- **NextAuth Issues**: [NextAuth Docs](https://next-auth.js.org/)
- **Deployment Issues**: Check platform-specific documentation

## 🎯 Next Steps

1. Deploy to your chosen platform
2. Set up custom domain (optional)
3. Configure monitoring and alerts
4. Test with real UF students
5. Monitor usage and performance

Your GatorEx application is now ready for production with Turso database integration! 🐊