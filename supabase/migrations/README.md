# Supabase Migrations

This folder contains database schema migrations managed by Supabase CLI.

## 📋 Existing Migrations

## 🚀 How to Use

### Create a New Migration

```bash
npx supabase migration new your_migration_name
```

This creates a new timestamped SQL file in `supabase/migrations/`.

### Apply Migrations to Supabase (Cloud)

**Option 1: Using Supabase Dashboard**

1. Go to your Supabase project → SQL Editor
2. Copy the SQL from the migration file
3. Paste and run

**Option 2: Using Supabase CLI (requires DB password)**

```bash
npx supabase db push
```

### Check Migration Status

```bash
npx supabase migration list
```

## 📝 Migration Naming Convention

Format: `YYYYMMDDHHMMSS_description.sql`

Examples:

- `20241026120000_add_salons_table.sql`
- `20241026130000_add_reviews_table.sql`
- `20241026140000_alter_bookings_add_rating.sql`

## 🎯 Best Practices

1. **One change per migration** - Keep migrations focused
2. **Always include rollback** - Add `DROP` statements if needed
3. **Test locally first** - If using Docker, test before pushing
4. **Never edit existing migrations** - Create new ones instead
5. **Use descriptive names** - Make purpose clear from filename

## 🔄 Common Operations

### Add a New Table

```bash
npx supabase migration new add_salons_table
```

Then edit the file:

```sql
CREATE TABLE salons (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  -- more columns...
);
```

### Modify Existing Table

```bash
npx supabase migration new alter_bookings_add_rating
```

```sql
ALTER TABLE bookings
ADD COLUMN rating INTEGER CHECK (rating >= 1 AND rating <= 5);
```

### Add RLS Policy

```bash
npx supabase migration new add_admin_policies
```

```sql
CREATE POLICY "Admins can view all bookings" ON bookings
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );
```

## 🗑️ Rollback (Manual)

If you need to undo a migration:

1. Create a new migration with reverse operations
2. Or manually run `DROP TABLE`, `DROP POLICY`, etc. in SQL Editor

## 📚 Resources

- [Supabase CLI Docs](https://supabase.com/docs/guides/cli)
- [Database Migrations Guide](https://supabase.com/docs/guides/cli/local-development)
- [SQL Best Practices](https://supabase.com/docs/guides/database/overview)
