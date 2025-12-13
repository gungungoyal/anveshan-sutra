# Supabase Setup Guide for Drivya.AI

## ✅ What's Done
- Database tables created in Supabase ✓
- Mock data inserted (10 focus areas, 1 organization, users, workspaces) ✓
- RLS policies configured for authenticated users ✓
- Prisma schema updated to PostgreSQL ✓
- .env template updated with Supabase placeholder ✓

## 🔧 Next Steps: Connect Your App to Supabase

### Step 1: Get Your Supabase Connection String

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click your **Drivya.AI** project
3. Click **Settings** (bottom-left) → **Database**
4. Find **"Connection string"** section
5. Select **"URI"** tab
6. Copy the full connection string (looks like: `postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres`)

### Step 2: Update Your .env File

1. Open `.env` in your project root
2. Replace this line:
   ```
   DATABASE_URL="postgresql://postgres:[YOUR_PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"
   ```
   With your actual Supabase connection string from Step 1.

**Example:**
```
DATABASE_URL="postgresql://postgres:AbCdEf1234@db.fpkijxrtsphftsldng.supabase.co:5432/postgres"
```

### Step 3: Regenerate Prisma Client

Open your terminal and run:
```bash
pnpm prisma:generate
```

This will generate the Prisma client to work with PostgreSQL instead of SQLite.

### Step 4: Test the Connection

Run a quick test:
```bash
pnpm prisma studio
```

This opens **Prisma Studio** in your browser. If it loads without errors, your connection is working! You can browse all your data:
- 10 Focus Areas
- 1 Organization (Pratham)
- 1 User (admin@drivya.ai)
- 1 Workspace (Drivya Workspace)
- And more...

Close Prisma Studio with `Ctrl+C`.

### Step 5: Update Your App's Database Client

In your application code (e.g., `client/lib/supabase.ts` or your API calls):

**Old way (SQLite + Prisma Client):**
```typescript
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
```

**New way (PostgreSQL + Supabase):**
Same code works! Prisma automatically uses the PostgreSQL connection from your .env `DATABASE_URL`.

If you're using Supabase client directly:
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);
```

Get these keys from: **Supabase Dashboard → Settings → API**

### Step 6: Start Your Dev Server

```bash
pnpm dev
```

Your app should now connect to Supabase! Test by:
- Viewing organizations
- Searching by focus area
- Creating saved lists
- Any feature that reads/writes to the database

## 🔐 Security Notes

- **RLS is enabled** on all tables (Row Level Security)
- Only authenticated users (with valid Supabase JWT token) can read/write
- The `.env` file contains sensitive credentials — never commit it to git
- Add `.env` to `.gitignore` if not already there

## 📊 Database Structure

Your Supabase database now has these tables:

| Table | Purpose | Rows |
|-------|---------|------|
| `focus_areas` | NGO focus areas (Education, Health, etc.) | 10 |
| `organizations` | NGOs, CSRs, Incubators | 1 (Pratham) |
| `organization_focus_areas` | Links orgs to focus areas | 3 |
| `users` | User accounts | 1 (admin) |
| `workspaces` | Team workspaces | 1 |
| `workspace_members` | User workspace memberships | 1 |
| `ngo_data` | NGO-specific details | 1 |
| `verification_data` | Credibility scores, compliance | 1 |
| `saved_lists` | User's saved organization lists | 0 |
| `saved_list_items` | Items in saved lists | 0 |
| `notes` | User notes on orgs | 0 |
| `proposals` | NGO-CSR match proposals | 0 |
| `programs` | CSR programs/calls | 0 |
| `grants_table` | Available grants | 0 |
| `fit_score_cache` | Pre-calculated match scores | 0 |
| And more... | | |

## 🆘 Troubleshooting

### "connection refused" error
- Check your DATABASE_URL has the correct password
- Verify the host is correct (should contain `.supabase.co`)
- Make sure Supabase project is active (not paused)

### "permission denied" error
- Ensure you're using the correct database password (not auth token)
- Check RLS policies allow authenticated users

### "table does not exist" error
- Run the SQL setup script again from `database/drivya_supabase_schema.sql`
- Or verify tables in Supabase Dashboard → Table Editor

## 📝 Files Changed

- `prisma/schema.prisma` — Changed from SQLite to PostgreSQL
- `.env` — Updated DATABASE_URL placeholder
- `database/drivya_supabase_schema.sql` — Full schema + RLS policies + mock data
- `database/verify_supabase_data.sql` — Verification queries

## ✨ You're All Set!

Your Drivya.AI app is now connected to Supabase. Start building features with confidence!

For questions, check:
- [Prisma Docs](https://www.prisma.io/docs/)
- [Supabase Docs](https://supabase.com/docs)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
