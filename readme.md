# NewsPortal — Backend

REST API for a news portal where users can browse trending news by category, subscribe to categories, and receive notifications. Includes role-based access for regular users, editors (who manage news content), and admins (who manage users, categories, and view analytics).
//UPDATE
- -**IMPORTANT** : PLEASE WAIT FOR 2 -3HRS AFTER REGISTERING/UPDATING PREFERENCES FOR NEWS TO FETCH FROM API 
Built with Node.js, Express, and MongoDB (Mongoose).

demo credentials:
email:"alladiamulya5@gmail.com"
password:"123456"
## Tech Stack

- **Runtime:** Node.js + Express 5
- **Database:** MongoDB via Mongoose
- **Auth:** JWT stored in an httpOnly cookie (`jsonwebtoken`, `cookie-parser`)
- **Passwords:** bcrypt
- **Validation:** Zod / express-validator
- **Email:** Nodemailer (password reset emails)
- **Scheduling:** node-cron (in-process notification scheduler)
- **External data:** NewsAPI (or similar) for ingesting news articles

## Prerequisites

- Node.js (v18+ recommended)
- A MongoDB instance (local or Atlas)
- An SMTP account for sending password-reset emails (e.g. Gmail app password)
- A News API key (for external news ingestion)

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create a `.env` file** in the project root with the following variables:

   ```env
   MONGODB_URI=your_mongodb_connection_string
   ENV=development
   HOST=localhost
   PORT=5000

   SALT_ROUNDS=10
   JWT_SECRET=your_jwt_secret

   SMTP_USER=your_smtp_email
   SMTP_PASS=your_smtp_password

   NEWS_API_KEY=your_news_api_key
   NEWS_API_URL=https://newsdata.io/api/1

   CLIENT_URL=http://localhost:5173
   ```

3. **Run the server**
   ```bash
   npm run dev     # nodemon, auto-restarts on change
   # or
   npm start       # plain node
   ```

   On first run against an empty database, the server automatically seeds itself with an initial batch of news articles.

## Project Structure

```
├── controllers/     # Request handlers (business logic)
├── middleware/       # Auth (isAuthenticated, allowRoles)
├── models/           # Mongoose schemas (User, News, Category, Notification, Preferences)
├── routers/           # Express routers, mounted in app.js
├── services/         # News ingestion, notification scheduler
├── utlis/            # Config loader (env vars) and mailer
├── app.js            # Express app: middleware, CORS, route mounting
└── server.js         # Entry point: DB connection + server start
```

## Authentication

- Login issues a JWT, set as an **httpOnly cookie** (`token`) — not returned in the response body. It expires after 1 hour.
- Protected routes use the `isAuthenticated` middleware, which reads and verifies the cookie.
- Role-gated routes (admin/editor only) additionally use `allowRoles(['admin'])` / `allowRoles(['editor'])`.
- CORS is configured with `credentials: true` and a strict allow-list (`localhost:5173`, the production Netlify domain, and Netlify deploy-preview subdomains) — required for cookie-based auth to work cross-origin.

## API Overview

All routes are prefixed with `/api/v1`.

### Auth — `/auth`
| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/register` | Public | Create a new account |
| POST | `/login` | Public | Log in, sets auth cookie |
| GET | `/me` | Authenticated | Get current user's profile |
| PUT | `/profile` | Authenticated | Update current user's profile |
| POST | `/forgot-password` | Public | Send password reset email |
| POST | `/reset-password/:token` | Public | Reset password with token |
| POST | `/logout` | Authenticated | Clear auth cookie |

### News — `/news`
| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/` | Public | List all news |
| GET | `/search` | Public | Search news |
| GET | `/breaking` | Public | Breaking news |
| GET | `/trending` | Public | Trending news |
| GET | `/category/:category` | Public | News by category |
| GET | `/:id` | Public | Single article (keep this route last — it's a catch-all for IDs) |
| POST | `/fetch-external` | Public* | Triggers external news ingestion (called by an external cron job) |
| POST | `/` | Admin/Editor | Create news article |
| PUT | `/:id` | Admin/Editor | Update news article |
| DELETE | `/:id` | Admin/Editor | Delete news article |

### Categories — `/categories`
| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/` | Public | List all categories |
| POST | `/` | Authenticated | Add category |
| PUT | `/:id` | Authenticated | Update category |
| DELETE | `/:id` | Authenticated | Delete category |

### Preferences — `/preferences`
| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/` | Authenticated | Get subscribed categories & notification settings |
| PUT | `/` | Authenticated | Update preferences |

### Notifications — `/notifications`
| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/` | Authenticated | List notifications |
| PATCH | `/:id/read` | Authenticated | Mark one as read |
| PATCH | `/read-all` | Authenticated | Mark all as read |
| POST | `/send-category` | Authenticated | Send a notification to subscribers of a category |

### Editor — `/editors`
| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/my-news` | Editor | News authored by the current editor |
| GET | `/dashboard` | Editor | Editor dashboard stats |

### Admin — `/admin`
| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/dashboard` | Admin | Overall platform stats |
| GET | `/users` | Admin | List users (search/filter/paginate) |
| GET | `/users/:id` | Admin | Get one user |
| PATCH | `/users/:id/block` | Admin | Block a user |
| PATCH | `/users/:id/unblock` | Admin | Unblock a user |
| DELETE | `/users/:id` | Admin | Delete a user |
| GET | `/analytics/users` | Admin | Registration trend (daily counts) |
| GET | `/analytics/categories` | Admin | Category subscriber counts |
| GET | `/analytics/news` | Admin | News totals |

### Health check
| Method | Route | Description |
|---|---|---|
| GET | `/health` | Lightweight, no-DB endpoint used to keep a free-tier host warm |

## Deployment Notes

- The production build runs on Render's free tier, which spins down on inactivity. `GET /health` is intentionally cheap (no DB call) and meant to be pinged every 5–10 minutes by an external cron service (e.g. cron-job.org) to keep the instance warm.
- News ingestion is triggered externally via `POST /news/fetch-external` on a schedule, rather than running an in-process cron job — this doubles as the "keep-alive" hit. **Do not** also enable an in-process ingestion scheduler at the same time; running both will double your News API request usage and can blow through a free-tier daily limit.