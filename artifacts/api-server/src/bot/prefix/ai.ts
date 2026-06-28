import { Message } from "discord.js";
import { embed } from "./embeds.js";

const FRIENDLY_RESPONSES = [
  (q: string) => `bro I was literally just thinking about that 😭 ${q.length > 20 ? "wild question ngl" : "say more?"}`,
  () => "ngl that's kinda deep for a Discord server 💀",
  () => "idk man I'm just a bot but even I know that's sus 👀",
  () => "LMAOOO okay okay okay... I got nothing 😭",
  () => "based take honestly 🤝",
  () => "bro really just asked that in chat 💀💀",
  () => "fr fr, that's actually a good point tho 🤔",
  () => "no thoughts, head empty, but also same 🫠",
  (q: string) => `okay so about "${q.slice(0, 30)}${q.length > 30 ? "..." : ""}"... honestly I'd need to think about that one`,
  () => "I feel like you already know the answer and just want validation 😭",
  () => "vibes-based answer: yes. logic-based answer: idk 🤷",
  () => "the real answer was the friends we made along the way 🥺",
  () => "I'm Crown Bot but even I'm confused rn 👑💀",
  () => "aight real talk? you're probably right ngl 🔥",
  () => "bestie that's actually lowkey smart 👀",
  () => "W take no cap 🔥👑",
  () => "skill issue on my end, idk 😭",
];

const KEYWORD_RESPONSES: Array<[RegExp, string]> = [
  [/\b(hello|hi|hey|sup|yo|wassup)\b/i, "yo! what's good 😎👑"],
  [/\b(how are you|how you doing|how r u)\b/i, "built different so always good 💪 you though?"],
  [/\b(thanks|thank you|ty|thx)\b/i, "anytime fam 🤝👑"],
  [/\b(who made you|who created you|who are you)\b/i, "I'm Crown Bot 👑 your chill gamer buddy + mod!"],
  [/\b(help)\b/i, "type `>` to see all commands! 💡👑"],
  [/\b(love|like)\b/i, "aww that's wholesome fr fr 🥺💛"],
  [/\b(bored)\b/i, "try `>meme` `>8ball` or just vibe 😌👑"],
  [/\b(game|gaming|play)\b/i, "W gamer spotted 🎮🔥 what you playing rn?"],
  [/\b(food|hungry|eat)\b/i, "bro don't talk about food I literally can't eat 😭"],
  [/\b(good bot|nice bot|best bot)\b/i, "aww you're making me blush 👑🥺 ty fr"],
  [/\b(bad bot|trash bot|worst bot)\b/i, "rude... but fair 💀 I'll improve I promise"],
  [/\b(crown|king|queen)\b/i, "👑 yes that's me! the realest bot in the server 🔥"],
  [/\b(laugh|lol|lmao|haha|lmfao)\b/i, "LMAOOO caught you smiling 😂🔥"],
  [/\b(sad|depressed|unhappy)\b/i, "ayo don't be sad fam 🥺 we got you 💛 type `>hug @yourself`"],
];

export async function runAICommand(cmd: string, args: string[], msg: Message): Promise<boolean> {
  if (cmd !== "ai" && cmd !== "ask") return false;
  const question = args.join(" ");
  if (!question) {
    await msg.reply({ embeds: [embed({ title: "Crown AI 👑", description: "Ask me something! like `>ai how are you` 🤖", color: 0x9B59B6 })] });
    return true;
  }

  for (const [pattern, response] of KEYWORD_RESPONSES) {
    if (pattern.test(question)) {
      await msg.reply({ embeds: [embed({ title: "Crown AI 👑", description: response, color: 0x9B59B6 })] });
      return true;
    }
  }

  const pick = FRIENDLY_RESPONSES[Math.floor(Math.random() * FRIENDLY_RESPONSES.length)]!;
  await msg.reply({ embeds: [embed({ title: "Crown AI 👑", description: pick(question), color: 0x9B59B6 })] });
  return true;
}
