# API Reference (example)

This document provides sample endpoints and their expected behavior. Adjust according to your backend implementation (Supabase functions or serverless endpoints).

## Authentication
POST /auth/register
- body: { email, password }
- response: 201, { user }

POST /auth/login
- body: { email, password }
- response: 200, { accessToken, refreshToken }

## Sync
POST /sync
- description: Sends local changes to server and returns latest server state or conflict info
- auth: Bearer token

## Vocabulary
GET /vocab
- params: ?limit=50&offset=0
- returns: list of vocab items

POST /vocab
- body: { word, meaning, example }
- creates a new vocab item (local + remote sync)

Notes:
- Use supabase auth JWT as bearer tokens for protected endpoints.
- For offline sync use a last-updated timestamp + conflict resolution strategy.
