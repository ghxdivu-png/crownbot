import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

const RESPONSES = [
  { text: "It is certain.", emoji: "✅" },
  { text: "It is decidedly so.", emoji: "✅" },
  { text: "Without a doubt.", emoji: "✅" },
  { text: "Yes, definitely.", emoji: "✅" },
  { text: "You may rely on it.", emoji: "✅" },
  { text: "As I see it, yes.", emoji: "✅" },
  { text: "Most likely.", emoji: "✅" },
  { text: "Outlook good.", emoji: "✅" },
  { text: "Yes.", emoji: "✅" },
  { text: "Signs point to yes.", emoji: "✅" },
  { text: "Reply hazy, try again.", emoji: "🔄" },
  { text: "Ask again later.", emoji: "🔄" },
  { text: "Better not tell you now.", emoji: "🔄" },
  { text: "Cannot predict now.", emoji: "🔄" },
  { text: "Concentrate and ask again.", emoji: "🔄" },
  { text: "Don't count on it.", emoji: "❌" },
  { text: "My reply is no.", emoji: "❌" },
  { text: "My sources say no.", emoji: "❌" },
  { text: "Outlook not so good.", emoji: "❌" },
  { text: "Very doubtful.", emoji: "❌" },
];

export const data = new SlashCommandBuilder()
  .setName("8ball")
  .setDescription("Ask the magic 8-ball a question")
  .addStringOption((opt) =>
    opt.setName("question").setDescription("Your question").setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const question = interaction.options.getString("question", true);
  const response = RESPONSES[Math.floor(Math.random() * RESPONSES.length)];

  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle("🎱 Magic 8-Ball")
    .addFields(
      { name: "Question", value: question },
      { name: "Answer", value: `${response.emoji} ${response.text}` }
    )
    .setFooter({ text: `Asked by ${interaction.user.tag}` })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
