# Demo User Credentials

This document contains the email addresses and passwords for all demo users in the MoonWhale Voice-Over application.

| User ID | Email | Password |
|---------|-------|----------|
| demo1 | demo1@mw.com | A7k$9mX2nP4qW8vZ |
| demo2 | demo2@mw.com | B9p#5rY7sL3uE6tR |
| demo3 | demo3@mw.com | C4w@8nM1oQ9kI2xV |
| demo4 | demo4@mw.com | D6z%3fH5gJ7bN0cF |
| demo5 | demo5@mw.com | E8t!1dA4hK6yU9sG |
| demo6 | demo6@mw.com | F2m&7vB9jL4wO5pQ |
| demo7 | demo7@mw.com | G5x$4cC8kM1zT6rE |
| demo8 | demo8@mw.com | H9q#2eD7lN3aS8uY |
| demo9 | demo9@mw.com | I3v@6fF0mP5bR1oW |
| demo10 | demo10@mw.com | J7y%9gG4nQ8cL2iX |

## Usage Limits

Each demo user has a limit of 3 voice generations. After reaching this limit, users will need to wait for an admin to reset their usage.

## Reset Instructions

To reset usage for demo users, an admin can:

1. Go to the `/admin` page
2. Enter the admin password
3. Click "Reset Demo Users Only" button

Alternatively, the usage can be reset using the API endpoint:

```
POST /api/auth/reset-demo-users
{
  "adminPassword": "your-admin-password"
}
```

## Password Update Instructions

If you need to update the password hashes in the database, use the SQL commands in the `docs/update-passwords.sql` file. 