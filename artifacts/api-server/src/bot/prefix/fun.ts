import { Message } from "discord.js";
import { embed, randColor } from "./embeds.js";

// ─── GIF ARRAYS ───────────────────────────────────────────────────────────────

const GIFS: Record<string, string[]> = {
  hug: [
    "https://media.tenor.com/ub5SvmMDzFsAAAAC/hug-anime.gif",
    "https://media.tenor.com/5d1MrVKqMioAAAAC/glomp-hug.gif",
    "https://media.tenor.com/L9rvOxSxVfUAAAAC/cute-hug.gif",
    "https://media.tenor.com/OXIJWS3EOMIAAAAC/anime-hug.gif",
  ],
  kiss: [
    "https://media.tenor.com/qMZpMDzF7LYAAAAC/anime-kiss.gif",
    "https://media.tenor.com/ZWxd7gkfKe4AAAAC/kawaii-anime-kiss.gif",
    "https://media.tenor.com/nMtCHf-TcnoAAAAC/anime-love.gif",
    "https://media.tenor.com/9Zp2MTFQXZIAAAAC/kiss-anime.gif",
  ],
  pat: [
    "https://media.tenor.com/wMfPR5TalLoAAAAC/head-pat.gif",
    "https://media.tenor.com/r2oeRLWrjrEAAAAC/anime-pat.gif",
    "https://media.tenor.com/MiMxXxKBTBIAAAAC/patting-head.gif",
    "https://media.tenor.com/oO9hcCNWkdUAAAAC/head-pat-anime.gif",
  ],
  slap: [
    "https://media.tenor.com/GG6HFywFUGQAAAAC/anime-slap.gif",
    "https://media.tenor.com/K13MyEVSXFkAAAAC/slap-anime.gif",
    "https://media.tenor.com/qfg0SbBT8woAAAAC/slap.gif",
    "https://media.tenor.com/0ANtLoE93TUAAAAC/slap-anime-girl.gif",
  ],
  kill: [
    "https://media.tenor.com/9Lezl0SdpH8AAAAC/anime-fight.gif",
    "https://media.tenor.com/N_2-Dkm8y7QAAAAC/anime-die.gif",
    "https://media.tenor.com/P7PBEalFDGgAAAAC/anime-kill.gif",
    "https://media.tenor.com/y5gZ-lfWHhwAAAAC/fight-anime.gif",
  ],
  cry: [
    "https://media.tenor.com/FBzZh6wjHbkAAAAC/anime-cry.gif",
    "https://media.tenor.com/0oZJAhFxz3IAAAAC/crying-anime.gif",
    "https://media.tenor.com/6Np8ND3LcfkAAAAC/cry-sad.gif",
    "https://media.tenor.com/6p_Y-Kq6n-EAAAAC/tears-sad-anime.gif",
  ],
  dance: [
    "https://media.tenor.com/mf4WdHCBp9AAAAAC/anime-dance.gif",
    "https://media.tenor.com/9JhpMNMb4KEAAAAC/anime-girl-dance.gif",
    "https://media.tenor.com/4HS4-OVJ3KEAAAAC/dance-cute.gif",
    "https://media.tenor.com/C6DXHD6mAzAAAAAC/anime-dancing.gif",
  ],
  bite: [
    "https://media.tenor.com/CUr0RUU36e8AAAAC/anime-bite.gif",
    "https://media.tenor.com/mRf_O7h_r4QAAAAC/bite-anime.gif",
    "https://media.tenor.com/zqnVVQkjGEAAAAAC/anime-bite-neck.gif",
    "https://media.tenor.com/jRVv8gbMJHwAAAAC/chomp-anime.gif",
  ],
  poke: [
    "https://media.tenor.com/6sHqKHOm0ikAAAAC/poke-anime.gif",
    "https://media.tenor.com/4D9tExqalHEAAAAC/anime-poke.gif",
    "https://media.tenor.com/EiZ3ACK5pPkAAAAC/poke-shy.gif",
    "https://media.tenor.com/fJBRcO3-rIYAAAAC/poke-cute.gif",
  ],
  cuddle: [
    "https://media.tenor.com/NyRsXGMQV0MAAAAC/cuddle-anime.gif",
    "https://media.tenor.com/dVkv5nEyFsUAAAAC/anime-cuddle.gif",
    "https://media.tenor.com/QxQp-r6OQZEAAAAC/cuddling-snuggle.gif",
    "https://media.tenor.com/lVLvC-O-sXkAAAAC/anime-cozy.gif",
  ],
  ship: [
    "https://media.tenor.com/YN8Fib8MxgkAAAAC/anime-love.gif",
    "https://media.tenor.com/ZoHNhUxlbIMAAAAC/couple-anime-love.gif",
    "https://media.tenor.com/LM8-NVFZMOEAAAAC/anime-kiss-love.gif",
    "https://media.tenor.com/jtPQNpUBfbQAAAAC/anime-couple.gif",
  ],
  welcome: [
    "https://media.tenor.com/n1yB1jWnjRUAAAAC/welcome-anime.gif",
    "https://media.tenor.com/FfQ8tBgXHooAAAAC/welcome-hi.gif",
    "https://media.tenor.com/S8fkV8-TgNsAAAAC/welcome-in.gif",
  ],
  goodbye: [
    "https://media.tenor.com/B6h_nEoYN1MAAAAC/goodbye-anime.gif",
    "https://media.tenor.com/qVqKkiIBYpEAAAAC/anime-bye.gif",
    "https://media.tenor.com/VEHCjI9wYMoAAAAC/sayonara-goodbye.gif",
  ],
  meme: [],
};

function gif(key: string): string {
  const arr = GIFS[key] ?? [];
  return arr[Math.floor(Math.random() * arr.length)] ?? "";
}

// ─── STATIC ARRAYS ────────────────────────────────────────────────────────────

const EIGHT_BALL = [
  "Absolutely yes! 🔥","No way lol 💀","Maybe... 🤔","100% bro 😤","Not a chance ❌",
  "Signs point to yes ✨","Ask again later ⏳","Definitely not 😬","Without a doubt! 💪",
  "Bro I have no idea 😭","The vibes say yes 🌊","Hard no fr 🚫","Could be! 🎯","Nah ✌️",
];

const JOKES = [
  "Why don't scientists trust atoms? Because they make up everything! 😂",
  "I told my wife she was drawing her eyebrows too high. She looked surprised. 🤨",
  "Why did the scarecrow win an award? He was outstanding in his field! 🌾",
  "I'm on a seafood diet. I see food and I eat it. 🍕",
  "Why don't eggs tell jokes? They'd crack each other up! 🥚",
  "What do you call a fish without eyes? A fsh. 😭",
  "Why did the math book look so sad? Too many problems. 😔",
  "I tried to write a joke about clocks… but it was too time-consuming. ⏰",
];

// ─── RP HELPERS ───────────────────────────────────────────────────────────────

type RPTemplate = (actor: string, target: string) => string;

function rpEmbed(
  msg: Message,
  key: string,
  title: string,
  lines: RPTemplate[],
  actor: string,
  target: string
) {
  const line = lines[Math.floor(Math.random() * lines.length)]!(actor, target);
  const g = gif(key);
  return embed({ title, description: line, image: g || undefined, color: randColor() });
}

// ─── COMMAND ROUTER ───────────────────────────────────────────────────────────

export async function runFunCommand(cmd: string, args: string[], msg: Message): Promise<boolean> {
  const a = `**${msg.author.username}**`;

  switch (cmd) {

    // ── Classic ──
    case "8ball": {
      const q = args.join(" ");
      if (!q) { await msg.reply({ embeds: [embed({ description: "Ask me a question first! 🎱" })] }); return true; }
      const ans = EIGHT_BALL[Math.floor(Math.random() * EIGHT_BALL.length)]!;
      await msg.reply({ embeds: [embed({ title: "🎱 Magic 8-Ball", description: `**Q:** ${q}\n**A:** ${ans}` })] });
      return true;
    }
    case "joke": {
      const j = JOKES[Math.floor(Math.random() * JOKES.length)]!;
      await msg.reply({ embeds: [embed({ title: "😂 Here's a joke!", description: j })] });
      return true;
    }
    case "meme": {
      try {
        const res = await fetch("https://meme-api.com/gimme");
        const data = await res.json() as any;
        if (data?.url) {
          await msg.reply({ embeds: [embed({ title: data.title ?? "Random Meme 😂", image: data.url, color: randColor() })] });
        } else {
          await msg.reply({ embeds: [embed({ description: "Couldn't fetch a meme rn 😭 try again!" })] });
        }
      } catch {
        await msg.reply({ embeds: [embed({ description: "Meme API is down rn 😭" })] });
      }
      return true;
    }
    case "roll": {
      const sides = parseInt(args[0] ?? "6");
      const s = isNaN(sides) || sides < 2 ? 6 : sides;
      const result = Math.floor(Math.random() * s) + 1;
      await msg.reply({ embeds: [embed({ title: "🎲 Dice Roll", description: `You rolled a **${result}** (out of ${s})!` })] });
      return true;
    }
    case "coinflip": {
      const result = Math.random() < 0.5 ? "Heads 🪙" : "Tails 🦅";
      await msg.reply({ embeds: [embed({ title: "🪙 Coin Flip", description: `It's **${result}**!` })] });
      return true;
    }

    // ── RP / OwO ──
    case "hug": {
      const t = msg.mentions.users.first();
      if (!t) { await msg.reply({ embeds: [embed({ description: "Mention someone to hug! 🫂" })] }); return true; }
      await msg.reply({ embeds: [rpEmbed(msg, "hug", "🤗 Huggies!", [
        (a, t) => `${a} wrapped ${t} in the warmest hug! 🤗💛`,
        (a, t) => `${a} sneaked up and bear-hugged ${t}! aww 🥺`,
        (a, t) => `${a} gave ${t} a big ol' cozy hug! 🫂💕`,
      ], a, `**${t.username}**`)] });
      return true;
    }
    case "kiss": {
      const t = msg.mentions.users.first();
      if (!t) { await msg.reply({ embeds: [embed({ description: "Mention someone to kiss! 💋" })] }); return true; }
      await msg.reply({ embeds: [rpEmbed(msg, "kiss", "💋 Mwah!", [
        (a, t) => `${a} gave ${t} a sweet little kiss! 💋😳`,
        (a, t) => `${a} kissed ${t} on the cheek! 🌸 how cute!!`,
        (a, t) => `${a} planted a big kiss on ${t}! 💏🥰`,
      ], a, `**${t.username}**`)] });
      return true;
    }
    case "pat": {
      const t = msg.mentions.users.first();
      if (!t) { await msg.reply({ embeds: [embed({ description: "Mention someone to pat! 🤚" })] }); return true; }
      await msg.reply({ embeds: [rpEmbed(msg, "pat", "🫶 Headpats!", [
        (a, t) => `${a} gently pats ${t} on the head! good vibes only 🤚✨`,
        (a, t) => `${a} gives ${t} the best headpats! 🥺💛`,
        (a, t) => `${a} patpat ${t}~ you're doing great! 🌟`,
      ], a, `**${t.username}**`)] });
      return true;
    }
    case "crownslap":
    case "slap": {
      const t = msg.mentions.users.first();
      if (!t) { await msg.reply({ embeds: [embed({ description: "Mention someone to slap! 👑💥" })] }); return true; }
      const isCrown = cmd === "crownslap";
      await msg.reply({ embeds: [rpEmbed(msg, "slap", isCrown ? "👑💥 Crown Slap!" : "👋 Slap!", [
        (a, t) => `${a} ${isCrown ? "👑 ROYAL" : ""} slapped ${t} into next week! 💥`,
        (a, t) => `${a} yeeted a ${isCrown ? "golden crown 👑" : "slipper"} at ${t}! LMAOOO 😭`,
        (a, t) => `${a} slapped ${t} so hard the whole server shook! ${isCrown ? "👑💥" : "💢"}`,
      ], a, `**${t.username}**`)] });
      return true;
    }
    case "kill": {
      const t = msg.mentions.users.first();
      if (!t) { await msg.reply({ embeds: [embed({ description: "Mention someone for the 'kill'! ☠️ (it's just RP!)" })] }); return true; }
      await msg.reply({ embeds: [rpEmbed(msg, "kill", "☠️ Eliminated!", [
        (a, t) => `${a} launched a nuke at ${t}... missed by a mile. ${t} is fine lol 💀`,
        (a, t) => `${a} tried to fight ${t} but tripped and fell. F in chat for ${a} 😭`,
        (a, t) => `${a} defeated ${t}! ...in Mario Kart. skill issue ngl 🎮`,
        (a, t) => `${a} pointed a gun at ${t} but it was a banana. both died laughing 🍌💀`,
      ], a, `**${t.username}**`)] });
      return true;
    }
    case "cry": {
      await msg.reply({ embeds: [embed({
        title: "😭 Uwaaah!",
        description: `${a} is crying rn... someone give them a hug!! 😭💧`,
        image: gif("cry"),
        color: 0x3498DB,
      })] });
      return true;
    }
    case "dance": {
      await msg.reply({ embeds: [embed({
        title: "💃 Get it!",
        description: `${a} hit the dance floor! 🔥🎵 get it bestie!!`,
        image: gif("dance"),
        color: 0xEB459E,
      })] });
      return true;
    }
    case "bite": {
      const t = msg.mentions.users.first();
      if (!t) { await msg.reply({ embeds: [embed({ description: "Mention someone to bite! 😬" })] }); return true; }
      await msg.reply({ embeds: [rpEmbed(msg, "bite", "😬 Chomp!", [
        (a, t) => `${a} bit ${t}!! ow?? 😳 vampires are real I guess`,
        (a, t) => `${a} chomped ${t} like a snack!! 😤🍬`,
        (a, t) => `${a} sneaky-bit ${t}! didn't even see it coming 👀`,
      ], a, `**${t.username}**`)] });
      return true;
    }
    case "poke": {
      const t = msg.mentions.users.first();
      if (!t) { await msg.reply({ embeds: [embed({ description: "Mention someone to poke! 👉" })] }); return true; }
      await msg.reply({ embeds: [rpEmbed(msg, "poke", "👉 Poke!", [
        (a, t) => `${a} poked ${t}! *poke poke* 👉👈`,
        (a, t) => `${a} keeps poking ${t}... they won't stop 😭`,
        (a, t) => `${a} poked ${t} in the cheek! 🥺`,
      ], a, `**${t.username}**`)] });
      return true;
    }
    case "cuddle": {
      const t = msg.mentions.users.first();
      if (!t) { await msg.reply({ embeds: [embed({ description: "Mention someone to cuddle! 🛌💕" })] }); return true; }
      await msg.reply({ embeds: [rpEmbed(msg, "cuddle", "🛌 Snuggle Time!", [
        (a, t) => `${a} cuddled up with ${t}! so cozy 🛌💕`,
        (a, t) => `${a} and ${t} are cuddling... don't disturb them 🥺✨`,
        (a, t) => `${a} wrapped ${t} like a burrito and cuddled them! 🌯💛`,
      ], a, `**${t.username}**`)] });
      return true;
    }
    case "ship": {
      const u1 = msg.mentions.users.first();
      const u2 = msg.mentions.users.at(1) ?? msg.author;
      if (!u1) { await msg.reply({ embeds: [embed({ description: "Mention at least one person to ship! 💘" })] }); return true; }
      const hash = (u1.id + u2.id).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
      const pct = hash % 101;
      const bar = "█".repeat(Math.floor(pct / 10)) + "░".repeat(10 - Math.floor(pct / 10));
      const verdict = pct > 85 ? "SOULMATES FR 💍🔥" : pct > 65 ? "Pretty good match! 💕" : pct > 40 ? "Could work... 🤔" : pct > 20 ? "Meh, idk 😬" : "Yikes, not it 💔";
      await msg.reply({ embeds: [embed({
        title: "💘 Crown Ship-o-Meter 👑",
        description: `**${u1.username}** 💞 **${u2.username}**\n\n\`${bar}\` **${pct}%**\n\n${verdict}`,
        image: gif("ship"),
        color: 0xEB459E,
      })] });
      return true;
    }

    default:
      return false;
  }
}

export { gif, GIFS };
