import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  TextChannel,
} from "discord.js";
import { checkModPermission } from "../../utils/permissions.js";
import { checkCooldown } from "../../utils/cooldown.js";
import { successEmbed, errorEmbed } from "../../utils/embeds.js";
import { logModAction } from "../../utils/modlog.js";

export const data = new SlashCommandBuilder()
  .setName("clear")
  .setDescription("Bulk delete messages from a channel")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
  .addIntegerOption((opt) =>
    opt.setName("amount").setDescription("Number of messages to delete (1-100)").setRequired(true).setMinValue(1).setMaxValue(100)
  )
  .addUserOption((opt) =>
    opt.setName("user").setDescription("Only delete messages from this user").setRequired(false)
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!await checkCooldown(interaction, 5)) return;
  if (!await checkModPermission(interaction)) return;

  const amount = interaction.options.getInteger("amount", true);
  const targetUser = interaction.options.getUser("user");
  const channel = interaction.channel as TextChannel;

  await interaction.deferReply({ ephemeral: true });

  const messages = await channel.messages.fetch({ limit: 100 });
  let toDelete = [...messages.values()].slice(0, amount);

  if (targetUser) {
    toDelete = toDelete.filter((m) => m.author.id === targetUser.id).slice(0, amount);
  }

  // Discord only allows bulk delete for messages < 14 days old
  const cutoff = Date.now() - 14 * 24 * 60 * 60 * 1000;
  toDelete = toDelete.filter((m) => m.createdTimestamp > cutoff);

  if (toDelete.length === 0) {
    await interaction.editReply({ embeds: [errorEmbed("Nothing to Delete", "No eligible messages found (messages older than 14 days cannot be bulk-deleted).")] });
    return;
  }

  const deleted = await channel.bulkDelete(toDelete, true);

  await interaction.editReply({
    embeds: [successEmbed("Messages Cleared", `Deleted **${deleted.size}** message(s).${targetUser ? ` (from ${targetUser.tag})` : ""}`)],
  });

  await logModAction(interaction.guild!, {
    action: "clear",
    userId: targetUser?.id ?? interaction.user.id,
    guildId: interaction.guildId!,
    username: targetUser?.tag ?? "channel",
    moderatorId: interaction.user.id,
    moderatorTag: interaction.user.tag,
    reason: `Cleared ${deleted.size} messages`,
  });
}
