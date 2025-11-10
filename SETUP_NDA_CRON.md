# NDA Expiration Email Notifications Setup

## Overview
This system automatically sends email notifications 7 days before NDAs expire, with a one-click extension link.

## Components Created

### Edge Functions
1. **check-expiring-ndas** - Finds NDAs expiring in 7 days and sends emails
2. **extend-nda** - Handles one-click NDA extension from email links

### Database
- `nda_extension_tokens` table stores secure tokens for email extension links

## Setup Instructions

### 1. Enable Required PostgreSQL Extensions

Run this SQL in the Supabase SQL Editor:

```sql
-- Enable pg_cron for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net for making HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;
```

### 2. Schedule Daily NDA Check

Run this SQL to create a cron job that runs daily at 9 AM UTC:

```sql
SELECT cron.schedule(
  'check-expiring-ndas-daily',
  '0 9 * * *', -- Every day at 9 AM UTC
  $$
  SELECT
    net.http_post(
        url:='https://gbjmklhvrmecawaacqeb.supabase.co/functions/v1/check-expiring-ndas',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdiam1rbGh2cm1lY2F3YWFjcWViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MTY1MjQsImV4cCI6MjA2NzQ5MjUyNH0.VBKg2xl8C7m6VdNcZXCOZ5aGSOnMxuHTDGsJso1sNr8"}'::jsonb
    ) as request_id;
  $$
);
```

### 3. Verify Cron Job

Check that the cron job was created successfully:

```sql
SELECT * FROM cron.job;
```

### 4. Test the System

You can manually test the email system from the NDA Management dashboard:
1. Go to `/dashboard/ndas`
2. Click "Send Expiration Reminders" button
3. Check the logs for any NDAs expiring in 7 days

### 5. Monitor Cron Job Execution

View the execution history:

```sql
SELECT * FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'check-expiring-ndas-daily')
ORDER BY start_time DESC 
LIMIT 10;
```

## Email Configuration

The emails are sent via Resend using the `RESEND_API_KEY` secret.

### Email Content
- Professional HTML design with gradient header
- Shows NDA expiration date
- One-click extension button (60 days)
- Fallback text link
- Responsive design

### Extension Process
1. User clicks extension link in email
2. Secure token is validated
3. NDA expiration date is extended by 60 days
4. User sees confirmation page
5. Token is marked as used (one-time use)

## Security Features

- Secure randomly generated tokens (UUID)
- Tokens expire after 7 days
- One-time use only (marked as used after extension)
- Service role authentication required
- RLS policies protect token table

## Customization

### Change Cron Schedule

Modify the cron expression in the schedule command:
- `'0 9 * * *'` - Daily at 9 AM UTC
- `'0 9 * * 1'` - Every Monday at 9 AM UTC
- `'0 */12 * * *'` - Every 12 hours

### Change Extension Period

Edit the `extend-nda` function and modify:
```typescript
const newExpiry = new Date(currentExpiry.getTime() + 60 * 24 * 60 * 60 * 1000);
```
Change `60` to desired number of days.

### Change Warning Period

Edit the `check-expiring-ndas` function:
```typescript
sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
```
Change `7` to desired number of days before expiration.

## Troubleshooting

### Emails Not Sending

1. Check Resend API key is set correctly
2. Verify domain is validated in Resend dashboard
3. Check edge function logs:
   ```
   supabase functions logs check-expiring-ndas
   ```

### Extension Links Not Working

1. Verify `extend-nda` function is deployed
2. Check edge function logs:
   ```
   supabase functions logs extend-nda
   ```
3. Ensure tokens table has proper RLS policies

### Cron Job Not Running

1. Verify pg_cron extension is enabled
2. Check cron job exists: `SELECT * FROM cron.job;`
3. Check execution logs: `SELECT * FROM cron.job_run_details;`
4. Ensure pg_net extension is enabled

## Testing

### Test with Specific Date

Temporarily modify an NDA's expiration date:
```sql
UPDATE company_nda_acceptances 
SET expires_at = NOW() + INTERVAL '7 days'
WHERE id = 'your-nda-id';
```

Then trigger the check manually via the UI or:
```sql
SELECT net.http_post(
    url:='https://gbjmklhvrmecawaacqeb.supabase.co/functions/v1/check-expiring-ndas',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
);
```

## Support

For issues or questions:
1. Check edge function logs
2. Verify Resend configuration
3. Review cron job execution history
4. Test manually from NDA Management dashboard
