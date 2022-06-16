## LN Uptime

Email alerts when your lightning node goes down

### Pieces

- LND Node running on voltage
  - When a user signs up and enters a connection string, this voltage node will add them as a peer
  - Every `x` minutes `/api/ping` gets hit and checks which user's nodes are online
- Supabase for the DB
  - This keeps track of users, and their history of online connection statuses
- Mailgun for email sending
- Next.js
