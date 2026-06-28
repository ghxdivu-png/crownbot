import { Message, PermissionFlagsBits, GuildMember } from "discord.js";
import { embed, successEmbed, errorEmbed } from "./embeds.js";
import { getSettings, setSettings } from "./store.js";
import { clearRaidLock } from "./automod.js";

export async function runSettingsCommand(cmd: string, args: string[], msg: Message): Promise<boolean> {
  if (!msg.guild) return false;
  const member = msg.member as GuildMember;
  const isAdmin = member.permissions.has(PermissionFlagsBits.Administrator);

  switch (cmd) {
    case "setmodlog": {
      if (!isAdmin) return reply(msg, errorEmbed("Admins only!"));
      const ch = msg.mentions.channels.first();
      if (!ch) return reply(msg, errorEmbed("Mention a channel!"));
      setSettings(msg.guild.id, { modLogChannel: ch.id });
      await reply(msg, successEmbed(`Mod log channel set to ${ch}!`));
      return true;
    }
    case "setwelcome": {
      if (!isAdmin) return reply(msg, errorEmbed("Admins only!"));
      const ch = msg.mentions.channels.first();
      if (!ch) return reply(msg, errorEmbed("Mention a channel!"));
      setSettings(msg.guild.id, { welcomeChannel: ch.id });
      await reply(msg, successEmbed(`Welcome channel set to ${ch}!`));
      return true;
    }
    case "setgoodbye": {
      if (!isAdmin) return reply(msg, errorEmbed("Admins only!"));
      const ch = msg.mentions.channels.first();
      if (!ch) return reply(msg, errorEmbed("Mention a channel!"));
      setSettings(msg.guild.id, { goodbyeChannel: ch.id });
      await reply(msg, successEmbed(`Goodbye channel set to ${ch}!`));
      return true;
    }
    case "setautorole": {
      if (!isAdmin) return reply(msg, errorEmbed("Admins only!"));
      const role = msg.mentions.roles.first();
      if (!role) return reply(msg, errorEmbed("Mention a role!"));
      setSettings(msg.guild.id, { autoRole: role.id });
      await reply(msg, successEmbed(`Auto role set to ${role}!`));
      return true;
    }
    case "antilink": {
      if (!isAdmin) return reply(msg, errorEmbed("Admins only!"));
      const s = getSettings(msg.guild.id);
      const toggle = !s.antiLink;
      setSettings(msg.guild.id, { antiLink: toggle });
      await reply(msg, successEmbed(`Anti-link is now **${toggle ? "ON 🔒" : "OFF 🔓"}**`));
      return true;
    }
    case "unlockraid": {
      if (!isAdmin) return reply(msg, errorEmbed("Admins only!"));
      clearRaidLock();
      await reply(msg, successEmbed("Anti-raid lock cleared ✅"));
      return true;
    }
    case "settings": {
      if (!isAdmin) return reply(msg, errorEmbed("Admins only!"));
      const s = getSettings(msg.guild.id);
      await reply(msg, embed({
        title: "⚙️ Server Settings",
        fields: [
          { name: "Mod Log", value: s.modLogChannel ? `<#${s.modLogChannel}>` : "Not set", inline: true },
          { name: "Welcome", value: s.welcomeChannel ? `<#${s.welcomeChannel}>` : "Not set", inline: true },
          { name: "Goodbye", value: s.goodbyeChannel ? `<#${s.goodbyeChannel}>` : "Not set", inline: true },
          { name: "Auto Role", value: s.autoRole ? `<@&${s.autoRole}>` : "Not set", inline: true },
          { name: "Anti-Link", value: s.antiLink ? "ON 🔒" : "OFF 🔓", inline: true },
        ],
        color: 0x5865F2,
      }));
      return true;
    }
    default:
      return false;
  }
}

async function reply(msg: Message, e: any): Promise<true> {
  await msg.reply({ embeds: [e] }).catch(() => {});
  return true;
}
