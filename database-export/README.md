# Database Export

This directory contains exported data from the NovaPush MongoDB database.

## Files:
- `users.json` - User accounts (passwords excluded for security)
- `templates.json` - Notification templates
- `notification-logs.json` - Notification history
- `preferences.json` - User preferences
- `importDatabase.js` - Script to import this data

## Security Note:
⚠️ User passwords are NOT included in this export for security reasons.
After importing, users will need to:
1. Sign up again, OR
2. Use password reset functionality

## To Import:
1. Copy this entire folder to your backend directory
2. Run: `node database-export/importDatabase.js`

## Generated: 2025-11-09T17:55:27.228Z
