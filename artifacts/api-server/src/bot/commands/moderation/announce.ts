import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, EmbedBuilder, TextChannel } from "discord.js";
import { checkModPermission } from "../../utils/permissions.js";

export const data = new SlashCommandBuilder()
  .setName("announce")
  .setDescription("Send an announcement to a channel")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
  .addStringOption((opt) => opt.setName("message").setDescription("Announcement content").setRequired(true))
  .addChannelOption((opt) => opt.setName("channel").setDescription("Channel to announce in").setRequired(true))
  .addBooleanOption((opt) => opt.setName("ping_everyone").setDescription("Ping @everyone").setRequired(false));

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!await checkModPermission(interaction)) return;

  const message = interaction.options.getString("message", true);
  const channel = interaction.options.getChannel("channel", true) as TextChannel;
  const pingEveryone = interaction.options.getBoolean("ping_everyone") ?? false;

  const embed = new EmbedBuilder()
    .setColor(0xf0a500)
    .setTitle("📢 Announcement")
    .setDescription(message)
    .setAuthor({ name: interaction.guild!.name, iconURL: interaction.guild!.iconURL() ?? undefined })
    .setFooter({ text: `Announced by ${interaction.user.tag}` })
    .setTimestamp();

  await channel.send({ content: pingEveryone ? "@everyone" : undefined, embeds: [embed] });
  await interaction.reply({ content: `✅ Announcement sent to ${channel}!`, ephemeral: true });
}
