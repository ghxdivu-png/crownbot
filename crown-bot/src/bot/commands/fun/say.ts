import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, TextChannel, NewsChannel, ThreadChannel } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("say")
  .setDescription("Make the bot say something")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
  .addStringOption((opt) =>
    opt.setName("message").setDescription("What to say").setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const message = interaction.options.getString("message", true);
  const channel = interaction.channel as TextChannel | NewsChannel | ThreadChannel | null;
  if (!channel) { await interaction.reply({ content: "❌ Cannot send here.", ephemeral: true }); return; }
  await channel.send(message);
  await interaction.reply({ content: "✅ Message sent!", ephemeral: true });
}
