import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
  AttachmentBuilder,
  GuildMember,
  Collection,
  Snowflake,
} from "discord.js";
import { checkModPermission } from "../../utils/permissions.js";
import { Colors, errorEmbed } from "../../utils/embeds.js";

/** Fetch all guild members via paginated REST (no opcode-8 gateway rate limit). */
async function fetchAllMembers(interaction: ChatInputCommandInteraction): Promise<Collection<Snowflake, GuildMember>> {
  const guild = interaction.guild!;
  let all: Collection<Snowflake, GuildMember> = new Collection();
  let after: Snowflake = "0";

  while (true) {
    const batch = await guild.members.list({ limit: 1000, after });
    all = all.concat(batch);
    if (batch.size < 1000) break;
    after = batch.last()!.id;
  }

  return all;
}

export const data = new SlashCommandBuilder()
  .setName("timeouts")
  .setDescription("List all currently timed-out members")
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .addSubcommand((sub) =>
    sub.setName("list").setDescription("List all currently timed-out members")
  )
  .addSubcommand((sub) =>
    sub.setName("export").setDescription("Export the list as a CSV file")
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!await checkModPermission(interaction)) return;

  await interaction.deferReply();

  const allMembers = await fetchAllMembers(interaction);

  const timedOut = allMembers
    .filter((m) => m.isCommunicationDisabled())
    .sort((a, b) => a.communicationDisabledUntil!.getTime() - b.communicationDisabledUntil!.getTime());

  const subcommand = interaction.options.getSubcommand();

  if (subcommand === "list") {
    if (timedOut.size === 0) {
      await interaction.editReply({
        embeds: [{ color: Colors.success as number, title: "✅ No Active Timeouts", description: "There are no currently timed-out members." }],
      });
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(Colors.timeout as number)
      .setTitle(`⏱️ Active Timeouts — ${timedOut.size} member${timedOut.size === 1 ? "" : "s"}`)
      .setTimestamp();

    timedOut.first(10).forEach((member) => {
      const expiry = member.communicationDisabledUntil!;
      const ts = Math.floor(expiry.getTime() / 1000);
      embed.addFields({
        name: member.user.tag,
        value: `**ID:** ${member.id}\n**Expires:** <t:${ts}:R> (<t:${ts}:f>)`,
        inline: true,
      });
    });

    if (timedOut.size > 10) {
      embed.setFooter({ text: `Showing 10 of ${timedOut.size}. Use /timeouts export for the full list.` });
    }

    await interaction.editReply({ embeds: [embed] });

  } else if (subcommand === "export") {
    if (timedOut.size === 0) {
      await interaction.editReply({ embeds: [errorEmbed("No Active Timeouts", "There are no active timeouts to export.")] });
      return;
    }

    const header = "User ID,Username,Expires At\n";
    const rows = timedOut.map((m) =>
      `${m.id},"${m.user.tag}",${m.communicationDisabledUntil!.toISOString()}`
    ).join("\n");

    const buffer = Buffer.from(header + rows, "utf-8");
    const attachment = new AttachmentBuilder(buffer, { name: `timeouts-${Date.now()}.csv` });

    await interaction.editReply({
      content: `📥 Exported **${timedOut.size}** active timeout(s).`,
      files: [attachment],
    });
  }
}
