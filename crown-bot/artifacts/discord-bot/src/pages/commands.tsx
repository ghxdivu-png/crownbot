import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Wrench, Smile, Gamepad2, Clock, Search } from "lucide-react";

const COMMAND_CATEGORIES = [
  {
    name: "Moderation",
    icon: Shield,
    color: "text-red-600",
    bg: "bg-red-50",
    badge: "bg-red-100 text-red-700",
    commands: [
      { name: "ban", description: "Ban a member from the server", usage: "/ban <user> [reason] [delete_days]" },
      { name: "unban", description: "Unban a previously banned user", usage: "/unban <userid> [reason]" },
      { name: "kick", description: "Kick a member from the server", usage: "/kick <user> [reason]" },
      { name: "warn", description: "Issue a warning to a member", usage: "/warn <user> <reason>" },
      { name: "warnings", description: "View warnings for a member", usage: "/warnings <user>" },
      { name: "clear", description: "Bulk delete messages in a channel", usage: "/clear <amount>" },
      { name: "lock", description: "Lock a channel (prevent messages)", usage: "/lock [channel] [reason]" },
      { name: "unlock", description: "Unlock a previously locked channel", usage: "/unlock [channel]" },
      { name: "slowmode", description: "Set slowmode on a channel", usage: "/slowmode <seconds> [channel]" },
      { name: "softban", description: "Ban then unban to purge messages", usage: "/softban <user> [reason] [delete_days]" },
      { name: "hackban", description: "Ban a user by ID (not in server)", usage: "/hackban <userid> [reason]" },
      { name: "nuke", description: "Delete and recreate a channel", usage: '/nuke <confirm:"CONFIRM">' },
      { name: "announce", description: "Send an announcement to a channel", usage: "/announce <message> <channel> [ping_everyone]" },
    ],
  },
  {
    name: "Timeouts",
    icon: Clock,
    color: "text-purple-600",
    bg: "bg-purple-50",
    badge: "bg-purple-100 text-purple-700",
    commands: [
      { name: "timeout", description: "Timeout a member for a duration", usage: "/timeout <user> <duration> [reason]" },
      { name: "untimeout", description: "Remove a timeout from a member", usage: "/untimeout <user> [reason]" },
      { name: "timeouts list", description: "List all currently timed-out members", usage: "/timeouts list" },
      { name: "timeouts export", description: "Export active timeouts as CSV", usage: "/timeouts export" },
      { name: "timeoutinfo", description: "Get timeout info for a specific user", usage: "/timeoutinfo <user>" },
    ],
  },
  {
    name: "Utility",
    icon: Wrench,
    color: "text-blue-600",
    bg: "bg-blue-50",
    badge: "bg-blue-100 text-blue-700",
    commands: [
      { name: "ping", description: "Check bot latency and API response time", usage: "/ping" },
      { name: "serverinfo", description: "Display information about the server", usage: "/serverinfo" },
      { name: "userinfo", description: "Display information about a user", usage: "/userinfo [user]" },
      { name: "avatar", description: "Get a user's avatar", usage: "/avatar [user]" },
      { name: "roleinfo", description: "Display information about a role", usage: "/roleinfo <role>" },
      { name: "membercount", description: "Show total member count", usage: "/membercount" },
      { name: "channelinfo", description: "Get information about a channel", usage: "/channelinfo [channel]" },
      { name: "botinfo", description: "Display bot statistics", usage: "/botinfo" },
      { name: "uptime", description: "Check how long the bot has been online", usage: "/uptime" },
      { name: "invite", description: "Get a link to invite the bot", usage: "/invite" },
      { name: "poll", description: "Create a poll with up to 5 options", usage: "/poll <question> <option1> <option2> ..." },
      { name: "embed", description: "Send a custom embed message", usage: "/embed <title> <description> [color] [channel]" },
      { name: "say", description: "Make the bot say something", usage: "/say <message>" },
      { name: "snipe", description: "Show the last deleted message", usage: "/snipe" },
    ],
  },
  {
    name: "Fun",
    icon: Smile,
    color: "text-amber-600",
    bg: "bg-amber-50",
    badge: "bg-amber-100 text-amber-700",
    commands: [
      { name: "8ball", description: "Ask the magic 8-ball a question", usage: "/8ball <question>" },
      { name: "coinflip", description: "Flip a coin", usage: "/coinflip" },
      { name: "dice", description: "Roll one or more dice", usage: "/dice [sides] [count]" },
      { name: "joke", description: "Get a random joke", usage: "/joke" },
      { name: "rps", description: "Play rock, paper, scissors vs the bot", usage: "/rps <choice>" },
      { name: "choose", description: "Choose between comma-separated options", usage: "/choose <options>" },
      { name: "reverse", description: "Reverse any text", usage: "/reverse <text>" },
      { name: "quote", description: "Get a random inspirational quote", usage: "/quote" },
      { name: "cat", description: "Get a random cat image", usage: "/cat" },
      { name: "dog", description: "Get a random dog image", usage: "/dog" },
      { name: "meme", description: "Get a random meme from Reddit", usage: "/meme" },
    ],
  },
  {
    name: "Games",
    icon: Gamepad2,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    badge: "bg-emerald-100 text-emerald-700",
    commands: [
      { name: "trivia", description: "Answer a random trivia question", usage: "/trivia" },
      { name: "hangman", description: "Play a game of hangman", usage: "/hangman" },
      { name: "math", description: "Solve a quick math challenge", usage: "/math" },
    ],
  },
];

export default function Commands() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const totalCommands = COMMAND_CATEGORIES.reduce((sum, c) => sum + c.commands.length, 0);

  const filtered = COMMAND_CATEGORIES
    .map((cat) => ({
      ...cat,
      commands: cat.commands.filter(
        (cmd) =>
          (!activeCategory || cat.name === activeCategory) &&
          (!search || cmd.name.includes(search.toLowerCase()) || cmd.description.toLowerCase().includes(search.toLowerCase()))
      ),
    }))
    .filter((cat) => cat.commands.length > 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Commands</h1>
        <p className="text-sm text-muted-foreground mt-1">{totalCommands} slash commands across {COMMAND_CATEGORIES.length} categories</p>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search commands…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-lg bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${!activeCategory ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"}`}
          >
            All
          </button>
          {COMMAND_CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(activeCategory === cat.name ? null : cat.name)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${activeCategory === cat.name ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Command Categories */}
      <div className="space-y-6">
        {filtered.map((category) => {
          const Icon = category.icon;
          return (
            <div key={category.name}>
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-7 h-7 rounded-lg ${category.bg} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${category.color}`} />
                </div>
                <h2 className="text-sm font-semibold text-foreground">{category.name}</h2>
                <span className="text-xs text-muted-foreground">({category.commands.length})</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {category.commands.map((cmd) => (
                  <Card key={cmd.name} className="border-border shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${category.badge}`}>
                          /{cmd.name}
                        </span>
                      </div>
                      <p className="text-sm text-foreground mb-2">{cmd.description}</p>
                      <code className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded block truncate">
                        {cmd.usage}
                      </code>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
