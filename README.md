# 👑 Crown Bot

A premium all-in-one Discord management bot built with **Discord.js v14**, **TypeScript**, and **MongoDB**.

> Moderation · Tickets · Reaction Roles · Suggestions · Scheduled Messages · RP/Fun · Leveling · AutoMod

---

## 🚀 Quick Start

### 1 — Prerequisites
- **Node.js** ≥ 20
- **pnpm** ≥ 9 → `npm i -g pnpm`
- A **Discord Bot Token** from [discord.com/developers](https://discord.com/developers/applications)
- A **MongoDB URI** (free cluster at [cloud.mongodb.com](https://cloud.mongodb.com))

### 2 — Install
```bash
git clone https://github.com/your-username/crown-bot.git
cd crown-bot
pnpm install
```

### 3 — Configure
```bash
cp .env.example .env
# Fill in DISCORD_TOKEN, DISCORD_CLIENT_ID, MONGODB_URI, PORT, SESSION_SECRET
```

### 4 — Run (development — builds then starts)
```bash
pnpm run build:dev
```

### 5 — Run (production)
```bash
pnpm run build
pnpm run start
```

---

## 📁 Project Structure

```
crown-bot/
├── src/
│   ├── index.ts                   # Entry point — starts HTTP server + bot
│   ├── app.ts                     # Express app setup
│   ├── bot/
│   │   ├── bot.ts                 # Bot startup (login, load commands/events)
│   │   ├── commands/
│   │   │   ├── admin/             # /admin status, stats, sync
│   │   │   ├── config/            # /config, /schedule
│   │   │   ├── fun/               # /8ball, /coinflip, /dice, /joke, /meme…
│   │   │   ├── games/             # /trivia, /math, /hangman
│   │   │   ├── moderation/        # /ban, /kick, /warn, /clear, /lock…
│   │   │   ├── roles/             # /reactionrole (button role panels)
│   │   │   ├── suggestions/       # /suggest, /suggestion approve|reject…
│   │   │   ├── tickets/           # /ticket-setup, /ticket close|claim…
│   │   │   ├── timeout/           # /timeouts, /timeoutinfo
│   │   │   └── utility/           # /ping, /serverinfo, /userinfo, /avatar…
│   │   ├── database/
│   │   │   ├── connection.ts      # Mongoose connect (graceful fallback)
│   │   │   └── models/            # GuildConfig, Ticket, ReactionRole, Suggestion, ScheduledMessage
│   │   ├── events/                # ready, interactionCreate, messageCreate, guildMember*
│   │   ├── handlers/              # commandHandler, eventHandler, registerCommands
│   │   ├── prefix/                # > prefix system: fun, RP/OwO, leveling, AI, automod
│   │   ├── services/              # TicketService, SchedulerService
│   │   ├── tasks/                 # englishReminder
│   │   └── utils/                 # embed helpers
│   ├── lib/
│   │   └── logger.ts              # Pino logger
│   └── routes/                    # REST API routes + /healthz
├── build.mjs                      # esbuild bundler script
├── tsconfig.json
├── package.json
├── railway.json                   # Railway deployment config
├── Procfile                       # Heroku/Railway fallback
└── .env.example
```

---

## 🔑 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DISCORD_TOKEN` | ✅ | Bot token from Discord Developer Portal |
| `DISCORD_CLIENT_ID` | ✅ | Application ID from Discord Developer Portal |
| `MONGODB_URI` | ✅* | `mongodb+srv://user:pass@cluster.mongodb.net/crown-bot` |
| `PORT` | ✅ | HTTP port (Railway sets this automatically) |
| `SESSION_SECRET` | ✅ | Random secret — `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `OWNER_IDS` | optional | Comma-separated user IDs for `/admin sync` |
| `REMINDER_CHANNEL_ID` | optional | Channel ID for auto English-only reminder |

> `*` Without `MONGODB_URI`, database-backed features (tickets, reaction roles, suggestions, config, scheduled messages) show a clear error message. All 40+ other commands work normally.

---

## 🚂 Railway Deployment

1. Push this repo to GitHub
2. [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**
3. Set environment variables in the **Variables** tab
4. Railway auto-detects `railway.json` — no extra config needed

The start command in `railway.json`:
```
pnpm run build && pnpm run start
```

---

## ✨ Commands (53 slash commands)

### 🔨 Moderation
`/ban` `/unban` `/kick` `/timeout` `/untimeout` `/warn` `/warnings`
`/clear` `/lock` `/unlock` `/slowmode` `/softban` `/hackban` `/nuke` `/announce`

### 🎫 Tickets
`/ticket-setup` — creates a button panel in any channel  
`/ticket close|claim|transcript|stats`

### 🎭 Reaction Roles
`/reactionrole create|add-role|delete`

### 💡 Suggestions
`/suggest` `/suggestion approve|reject|consider`

### 📅 Scheduled Messages
`/schedule create|list|pause|resume|delete`

### ⚙️ Server Config
`/config view|mod-log|message-log|member-log|welcome-channel|goodbye-channel|auto-role|suggestion-channel|ticket-log|automod-toggle|automod-setting|blocked-word`

### 🔧 Admin
`/admin status|stats|sync`

### 🎮 Fun & Games
`/8ball` `/coinflip` `/dice` `/joke` `/meme` `/rps` `/choose` `/quote`
`/cat` `/dog` `/trivia` `/math` `/hangman`

### 🛠️ Utility
`/ping` `/serverinfo` `/userinfo` `/avatar` `/roleinfo` `/membercount`
`/channelinfo` `/botinfo` `/uptime` `/invite` `/poll` `/embed` `/snipe`

### 🐾 Prefix Commands (`>`)
```
>hug @user   >kiss @user  >pat @user   >crownslap @user  >cuddle @user
>bite @user  >poke @user  >ship @u1 @u2  >cry  >dance  >slap @user
>rank   >leaderboard   >daily   >ai <question>
>8ball  >joke  >meme   >roll   >coinflip
```

---

## 🗃️ MongoDB Setup (Free)

1. [cloud.mongodb.com](https://cloud.mongodb.com) → Create free M0 cluster
2. Database Access → Add user with password
3. Network Access → Allow `0.0.0.0/0`
4. Connect → Drivers → copy connection string → paste as `MONGODB_URI`

---

## 🏗️ Tech Stack

| | |
|---|---|
| Runtime | Node.js ≥ 20 |
| Language | TypeScript 5.9 |
| Discord | Discord.js v14 |
| Database | MongoDB + Mongoose |
| Build | esbuild |
| HTTP | Express 5 |
| Logging | Pino |

---

*Crown Bot 👑 | Made with love*
