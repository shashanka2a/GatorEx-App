# Turso Database Setup for GatorEx

This guide explains how to set up Turso (SQLite) as the database for GatorEx authentication and user management.

## Why Turso?

- **Fast**: SQLite performance with global edge replication
- **Simple**: No complex database management
- **Cost-effective**: Generous free tier, pay-as-you-scale
- **Edge-native**: Low latency worldwide
- **NextAuth compatible**: Works seamlessly with Prisma adapter

## Local Development Setup

### 1. Install Dependencies

The required dependencies are already included in `package.json`:
- `@prisma/client` - Prisma ORM client
- `@libsql/client` - Turso/LibSQL client
- `@next-auth/prisma-adapter` - NextAuth Prisma adapter

### 2. Setup Local Database

```bash
# Run the automated setup script
npm run setup:turso

# Or manually:
npx prisma generate
npx prisma db push
```

This creates a local `dev.db` SQLite file for development.

### 3. Environment Variables

Your `.env.local` should contain:

```env
# Local SQLite database
DATABASE_URL="file:./dev.db"

# NextAuth configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-local-secret"

# Gmail SMTP for magic links
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
```

### 4. Test the Setup

```bash
# Test authentication system
npm run test:auth

# Start development server
npm run dev

# Open Prisma Studio (optional)
npm run db:studio
```

## Production Setup with Turso Cloud

### 1. Install Turso CLI

```bash
# macOS/Linux
curl -sSfL https://get.tur.so/install.sh | bash

# Or with Homebrew
brew install tursodatabase/tap/turso
```

### 2. Create Turso Account and Database

```bash
# Sign up (opens browser)
turso auth signup

# Login
turso auth login

# Create production database
turso db create gatorex-prod

# Get database URL
turso db show gatorex-prod --url

# Create auth token
turso db tokens create gatorex-prod
```

### 3. Update Production Environment

Update your production environment variables:

```env
# Turso production database
DATABASE_URL="libsql://gatorex-prod-[your-org].turso.io"
TURSO_AUTH_TOKEN="your-auth-token-here"

# Production NextAuth
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-production-secret"
```

### 4. Deploy Schema to Production

```bash
# Push schema to production database
npx prisma db push
```

## Database Schema

The schema includes all necessary tables for NextAuth:

- **users** - User profiles with UF email verification
- **accounts** - OAuth account linking
- **sessions** - User sessions
- **verificationtokens** - Magic link tokens
- **listings** - Marketplace listings
- **images** - Listing images

### Key Features

- **UF Email Restriction**: Only `@ufl.edu` and `@gators.ufl.edu` emails allowed
- **Email Verification**: Magic link authentication via Gmail SMTP
- **Profile Completion**: Multi-step onboarding flow
- **Session Management**: Secure database sessions

## Development Commands

```bash
# Database operations
npm run setup:turso          # Initial Turso setup
npm run db:generate          # Generate Prisma client
npm run db:push              # Push schema changes
npm run db:studio            # Open Prisma Studio

# Testing
npm run test:auth            # Test authentication system
npm run dev                  # Start development server

# Production
npm run build                # Build for production
npm run start                # Start production server
```

## File Structure

```
├── prisma/
│   └── schema.prisma        # Database schema
├── src/lib/db/
│   └── turso.ts            # Database client singleton
├── pages/api/auth/
│   └── [...nextauth].ts    # NextAuth configuration
├── scripts/
│   ├── setup-turso.js      # Automated setup script
│   └── test-auth-system.js # Authentication tests
└── types/
    └── next-auth.d.ts      # NextAuth type extensions
```

## Authentication Flow

1. **Sign In**: User enters UF email on `/verify`
2. **Email Validation**: System checks for `@ufl.edu` or `@gators.ufl.edu`
3. **Magic Link**: Gmail SMTP sends secure sign-in link
4. **Verification**: User clicks link, gets authenticated
5. **Profile Setup**: New users complete profile on `/complete-profile`
6. **Access Control**: Middleware enforces verification for protected routes

## Troubleshooting

### Local Database Issues

```bash
# Reset local database
rm dev.db
npm run setup:turso
```

### Production Connection Issues

```bash
# Test Turso connection
turso db shell gatorex-prod

# Verify auth token
turso auth token
```

### Schema Sync Issues

```bash
# Force schema push
npx prisma db push --force-reset
```

## Security Considerations

- **Email Restriction**: Only UF domains accepted
- **Magic Links**: Expire in 24 hours, single-use
- **Session Security**: Database sessions with secure tokens
- **Rate Limiting**: Email sending rate limits prevent abuse
- **Environment Variables**: Sensitive data in environment only

## Monitoring and Maintenance

### Database Monitoring

```bash
# Check database size and usage
turso db show gatorex-prod

# View recent activity
turso db shell gatorex-prod "SELECT COUNT(*) FROM users;"
```

### Backup Strategy

Turso automatically handles backups and replication. For additional safety:

```bash
# Export database (if needed)
turso db dump gatorex-prod --output backup.sql
```

## Migration from PostgreSQL

If migrating from PostgreSQL/Supabase:

1. Export existing data
2. Update schema for SQLite compatibility
3. Import data to Turso
4. Update connection strings
5. Test authentication flow

## Support

- **Turso Documentation**: https://docs.turso.tech/
- **Prisma with Turso**: https://www.prisma.io/docs/concepts/database-connectors/sqlite
- **NextAuth Documentation**: https://next-auth.js.org/

## Cost Estimation

Turso pricing (as of 2024):
- **Free Tier**: 500 databases, 1GB storage, 1B row reads
- **Pro Tier**: $29/month for higher limits
- **Enterprise**: Custom pricing

For a university marketplace, the free tier should be sufficient initially.