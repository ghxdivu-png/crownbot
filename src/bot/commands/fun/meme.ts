import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("meme")
  .setDescription("Get a random meme from Reddit");

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  await interaction.deferReply();

  const subs = ["memes", "dankmemes", "me_irl", "shitposting", "programmerhumor"];
  const sub = subs[Math.floor(Math.random() * subs.length)];

  try {
    const res = await fetch(`https://www.reddit.com/r/${sub}/random.json?limit=1`, {
      headers: { "User-Agent": "DiscordBot/1.0" },
    });
    const data = await res.json() as [{ data: { children: [{ data: { title: string; url: string; permalink: string; over_18: boolean } }] } }];
    const post = data[0].data.children[0].data;

    if (post.over_18) {
      await interaction.editReply({ content: "⚠️ Fetched an NSFW meme — try again!" });
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(0xff6b6b)
      .setTitle(post.title.slice(0, 256))
      .setURL(`https://reddit.com${post.permalink}`)
      .setImage(post.url)
      .setFooter({ text: `r/${sub}` })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  } catch {
    await interaction.editReply({ content: "😵 Couldn't fetch a meme right now. Reddit might be down." });
  }
}
