# Database Management with Supabase & Prisma

This guide covers how to manage your GatorEx database using the provided scripts for Supabase and Prisma.

## 🚀 Quick Start

### 1. Test Your Connection
```bash
npm run db:test-connection
```

### 2. Push Schema Changes
```bash
npm run db:push-supabase
```

### 3. Create a Migration
```bash
npm run db:migrate
```

## 📋 Available Scripts

### Database Operations

| Script | Command | Description |
|--------|---------|-------------|
| **Push to Supabase** | `npm run db:push-supabase` | Push schema changes to Supabase |
| **Test Connection** | `npm run db:test-connection` | Test both pooled and direct connections |
| **Create Migration** | `npm run db:migrate` | Create a new database migration |
| **List Migrations** | `npm run db:migrate-list` | List all existing migrations |
| **Reset Migrations** | `npm run db:migrate-reset` | Reset all migrations (⚠️ dangerous) |

### Standard Prisma Commands

| Script | Command | Description |
|--------|---------|-------------|
| **Generate Client** | `npm run db:generate` | Generate Prisma client |
| **Push Schema** | `npm run db:push` | Push schema directly (no migration) |
| **Database Studio** | `npm run db:studio` | Open Prisma Studio |

## 🔧 Environment Setup

### Required Environment Variables

Create a `.env` file with:

```env
# Pooled connection for queries (recommended for production)
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres"

# Direct connection for migrations
DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-0-us-east-1.connect.supabase.com:5432/postgres"
```

### Getting Your Connection Strings

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **Database**
4. Copy the connection strings:
   - Use **Connection pooling** URL for `DATABASE_URL`
   - Use **Direct connection** URL for `DIRECT_URL`

## 📖 Detailed Script Usage

### 1. Push Database Changes (`push-db-to-supabase.js`)

This is the main script for deploying schema changes to Supabase.

#### Basic Usage
```bash
npm run db:push-supabase
```

#### Advanced Options
```bash
# Force reset database (⚠️ destructive)
node scripts/push-db-to-supabase.js --force

# Skip backup creation
node scripts/push-db-to-supabase.js --skip-backup

# Skip schema validation
node scripts/push-db-to-supabase.js --skip-validation
```

#### What It Does
1. ✅ Validates environment variables
2. 💾 Creates a backup of current schema
3. 🔍 Validates Prisma schema
4. 📝 Generates Prisma client
5. 🔄 Runs migrations (if available)
6. 🚀 Pushes schema to database
7. 🔗 Tests database connection
8. 📊 Shows deployment summary

### 2. Test Connection (`test-supabase-connection.js`)

Tests both pooled and direct connections to diagnose issues.

```bash
npm run db:test-connection
```

#### What It Tests
- Environment variable presence
- Connection string formats
- Pooled connection performance
- Direct connection performance
- Basic query execution
- Table access permissions

### 3. Create Migration (`create-migration.js`)

Creates proper database migrations for version control.

#### Create New Migration
```bash
npm run db:migrate
# or
node scripts/create-migration.js create
```

#### List Existing Migrations
```bash
npm run db:migrate-list
# or
node scripts/create-migration.js list
```

#### Reset All Migrations (⚠️ Dangerous)
```bash
npm run db:migrate-reset
# or
node scripts/create-migration.js reset
```

## 🔄 Typical Workflow

### Making Schema Changes

1. **Modify your schema**
   ```bash
   # Edit prisma/schema.prisma
   vim prisma/schema.prisma
   ```

2. **Test locally**
   ```bash
   npm run db:test-connection
   ```

3. **Create migration** (recommended)
   ```bash
   npm run db:migrate
   ```

4. **Push to Supabase**
   ```bash
   npm run db:push-supabase
   ```

5. **Verify deployment**
   ```bash
   npm run db:studio
   ```

### Emergency Procedures

#### If Connection Fails
1. Check Supabase project status (might be paused)
2. Verify connection strings in `.env`
3. Reset database password if needed
4. Check IP allowlist in Supabase

#### If Migration Fails
1. Review the error message
2. Check schema syntax
3. Resolve conflicts manually
4. Use `--force` flag if necessary (⚠️ destructive)

#### If Database is Corrupted
1. Use backup from `./backups/` directory
2. Reset migrations: `npm run db:migrate-reset`
3. Recreate from schema: `npm run db:push-supabase --force`

## 📁 File Structure

```
scripts/
├── push-db-to-supabase.js     # Main deployment script
├── test-supabase-connection.js # Connection testing
├── create-migration.js        # Migration management
└── ...

backups/                       # Auto-created backups
├── backup-2025-01-15T10-30-00.sql
└── ...

prisma/
├── schema.prisma             # Database schema
└── migrations/               # Migration history
    ├── 20250115103000_init/
    └── 20250115104500_add_user_preferences/
```

## 🚨 Safety Features

### Automatic Backups
- Schema backups created before each deployment
- Stored in `./backups/` directory
- Timestamped for easy identification

### Validation Checks
- Environment variable validation
- Schema syntax validation
- Connection string format validation
- Database connectivity testing

### Rollback Support
- Migration history preserved
- Backup files for manual recovery
- Force reset option for emergencies

## 🔍 Troubleshooting

### Common Issues

#### "Project is paused"
- **Solution**: Visit Supabase dashboard to wake up project
- **Prevention**: Upgrade to paid plan or keep project active

#### "Authentication failed"
- **Solution**: Reset database password in Supabase dashboard
- **Check**: Ensure password is URL-encoded in connection string

#### "Connection timeout"
- **Solution**: Check internet connection and Supabase status
- **Check**: Verify IP is not blocked in Supabase settings

#### "Schema validation failed"
- **Solution**: Fix syntax errors in `prisma/schema.prisma`
- **Tool**: Use `npx prisma format` to auto-format

### Getting Help

1. **Check logs**: Scripts provide detailed error messages
2. **Supabase Dashboard**: Monitor database health and logs
3. **Prisma Studio**: `npm run db:studio` for visual debugging
4. **Community**: Supabase Discord or GitHub issues

## 🎯 Best Practices

### Development
- Always test connections before deploying
- Create migrations for all schema changes
- Use descriptive migration names
- Test locally before production deployment

### Production
- Use pooled connections for better performance
- Monitor database metrics in Supabase dashboard
- Keep backups of critical data
- Plan maintenance windows for major changes

### Security
- Never commit `.env` files
- Use environment-specific connection strings
- Regularly rotate database passwords
- Monitor access logs

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [GatorEx Database Schema](./prisma/schema.prisma)

---

**Need help?** Check the troubleshooting section or run `npm run db:test-connection` for diagnostics.