import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, PermissionFlagsBits } from "discord.js";

const EMOJI_NUMBERS = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];

export const data = new SlashCommandBuilder()
  .setName("poll")
  .setDescription("Create a poll")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
  .addStringOption((opt) => opt.setName("question").setDescription("The poll question").setRequired(true))
  .addStringOption((opt) => opt.setName("option1").setDescription("Option 1").setRequired(true))
  .addStringOption((opt) => opt.setName("option2").setDescription("Option 2").setRequired(true))
  .addStringOption((opt) => opt.setName("option3").setDescription("Option 3 (optional)"))
  .addStringOption((opt) => opt.setName("option4").setDescription("Option 4 (optional)"))
  .addStringOption((opt) => opt.setName("option5").setDescription("Option 5 (optional)"));

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const question = interaction.options.getString("question", true);
  const options = [1, 2, 3, 4, 5]
    .map((n) => interaction.options.getString(`option${n}`))
    .filter(Boolean) as string[];

  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle(`📊 ${question}`)
    .setDescription(options.map((opt, i) => `${EMOJI_NUMBERS[i]} ${opt}`).join("\n\n"))
    .setFooter({ text: `Poll created by ${interaction.user.tag}` })
    .setTimestamp();

  const msg = await interaction.reply({ embeds: [embed], fetchReply: true });
  for (let i = 0; i < options.length; i++) {
    await msg.react(EMOJI_NUMBERS[i]);
  }
}
