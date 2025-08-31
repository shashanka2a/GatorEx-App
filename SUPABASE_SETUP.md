# Supabase Database Setup Guide

## 🔍 **Current Issue**
The database connection is failing, likely due to an incorrect project reference or connection string.

## 📋 **Steps to Fix**

### 1. **Get Correct Connection String**
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **Database**
4. Look for **Connection string** section
5. Copy the **URI** format connection string

### 2. **Expected Format**
```
postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

### 3. **Common Issues & Solutions**

#### **Issue: Project Reference Wrong**
- Your current ref: `wfvltwja2kfk6levogj00w`
- **Solution**: Get the correct project reference from your Supabase dashboard URL
- Dashboard URL format: `https://supabase.com/dashboard/project/[PROJECT-REF]`

#### **Issue: Project Paused**
- **Solution**: Go to your project dashboard and resume it if paused

#### **Issue: Network Restrictions**
- **Solution**: Go to **Settings** → **Database** → **Network restrictions**
- Add your IP address or allow all IPs for testing

#### **Issue: Wrong Password**
- Your current password: `sb_secret_qSIqK-cUzJC0QoLbnEJ_ZA_f5E0HybXu`
- **Solution**: This should be your database password, not the service role key

### 4. **Alternative: Use Service Role Key**
If you want to use the service role key instead:
```env
# Use this format with your service role key
DATABASE_URL="postgresql://postgres:sb_secret_qSIqK-cUzJC0QoLbnEJ_ZA_f5E0HybXu@db.[CORRECT-PROJECT-REF].supabase.co:5432/postgres"
```

### 5. **Test Connection**
After updating the connection string:
```bash
npm run db:push
# or
node test-db.js
```

## 🎯 **What You Need to Provide**
1. **Correct Project Reference** (from your Supabase dashboard URL)
2. **Verify the password** is correct
3. **Check project status** (not paused)

## 🔧 **Quick Fix**
1. Go to your Supabase project dashboard
2. Copy the exact connection string from **Settings** → **Database**
3. Replace the `DATABASE_URL` in `.env.local`
4. Run `npm run db:push` to test

The connection string format you're using looks correct, but the project reference might be wrong.