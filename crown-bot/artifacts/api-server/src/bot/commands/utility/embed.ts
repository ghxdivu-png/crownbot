import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, PermissionFlagsBits, TextChannel } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("embed")
  .setDescription("Send a custom embed message to a channel")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
  .addStringOption((opt) => opt.setName("title").setDescription("Embed title").setRequired(true))
  .addStringOption((opt) => opt.setName("description").setDescription("Embed description").setRequired(true))
  .addStringOption((opt) =>
    opt.setName("color").setDescription("Hex color (e.g. #5865F2)").setRequired(false)
  )
  .addChannelOption((opt) =>
    opt.setName("channel").setDescription("Channel to send to (defaults to current)")
  );

function hexToInt(hex: string): number {
  return parseInt(hex.replace(/^#/, ""), 16);
}

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const title = interaction.options.getString("title", true);
  const description = interaction.options.getString("description", true);
  const colorHex = interaction.options.getString("color") ?? "#5865F2";
  const targetChannel = (interaction.options.getChannel("channel") ?? interaction.channel) as TextChannel;

  const color = hexToInt(colorHex);
  if (isNaN(color)) {
    await interaction.reply({ content: "❌ Invalid hex color. Use format `#RRGGBB`.", ephemeral: true });
    return;
  }

  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(title)
    .setDescription(description)
    .setFooter({ text: `Sent by ${interaction.user.tag}` })
    .setTimestamp();

  await targetChannel.send({ embeds: [embed] });
  await interaction.reply({ content: `✅ Embed sent to ${targetChannel}!`, ephemeral: true });
}
