import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from "discord.js";

const WORDS = [
  "javascript", "typescript", "discord", "moderation", "keyboard", "programming",
  "elephant", "strawberry", "umbrella", "telephone", "mountain", "butterfly",
  "champion", "database", "network", "security", "universe", "adventure",
];

const HANGMAN_STAGES = [
  "```\n  +---+\n  |   |\n      |\n      |\n      |\n      |\n=========```",
  "```\n  +---+\n  |   |\n  O   |\n      |\n      |\n      |\n=========```",
  "```\n  +---+\n  |   |\n  O   |\n  |   |\n      |\n      |\n=========```",
  "```\n  +---+\n  |   |\n  O   |\n /|   |\n      |\n      |\n=========```",
  "```\n  +---+\n  |   |\n  O   |\n /|\\  |\n      |\n      |\n=========```",
  "```\n  +---+\n  |   |\n  O   |\n /|\\  |\n /    |\n      |\n=========```",
  "```\n  +---+\n  |   |\n  O   |\n /|\\  |\n / \\  |\n      |\n=========```",
];

export const data = new SlashCommandBuilder()
  .setName("hangman")
  .setDescription("Play a game of Hangman!");

function buildDisplay(word: string, guessed: Set<string>): string {
  return word.split("").map((c) => (guessed.has(c) ? `**${c.toUpperCase()}**` : "\\_")).join(" ");
}

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const word = WORDS[Math.floor(Math.random() * WORDS.length)];
  const guessed = new Set<string>();
  let wrong = 0;
  const maxWrong = 6;
  const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");

  function buildEmbed(): EmbedBuilder {
    const display = buildDisplay(word, guessed);
    const wrongLetters = alphabet.filter((l) => guessed.has(l) && !word.includes(l));
    const won = word.split("").every((c) => guessed.has(c));

    return new EmbedBuilder()
      .setColor(won ? 0x57f287 : wrong >= maxWrong ? 0xed4245 : 0xf0a500)
      .setTitle("🪢 Hangman")
      .addFields(
        { name: "Word", value: display },
        { name: "Gallows", value: HANGMAN_STAGES[wrong] },
        { name: "Wrong Guesses", value: wrongLetters.length > 0 ? wrongLetters.join(", ").toUpperCase() : "None", inline: true },
        { name: "Remaining", value: `${maxWrong - wrong} lives`, inline: true },
      );
  }

  function buildRows(disabled = false): ActionRowBuilder<ButtonBuilder>[] {
    const rows: ActionRowBuilder<ButtonBuilder>[] = [];
    for (let r = 0; r < 3; r++) {
      const row = new ActionRowBuilder<ButtonBuilder>();
      const slice = alphabet.slice(r * 9, r * 9 + (r === 2 ? 8 : 9));
      row.addComponents(
        slice.map((letter) =>
          new ButtonBuilder()
            .setCustomId(`hm_${letter}`)
            .setLabel(letter.toUpperCase())
            .setStyle(guessed.has(letter) ? (word.includes(letter) ? ButtonStyle.Success : ButtonStyle.Danger) : ButtonStyle.Secondary)
            .setDisabled(disabled || guessed.has(letter))
        )
      );
      rows.push(row);
    }
    return rows;
  }

  const reply = await interaction.reply({ embeds: [buildEmbed()], components: buildRows(), fetchReply: true });
  const collector = reply.createMessageComponentCollector({ componentType: ComponentType.Button, time: 120_000 });

  collector.on("collect", async (btn) => {
    if (btn.user.id !== interaction.user.id) { await btn.reply({ content: "❌ This isn't your game!", ephemeral: true }); return; }

    const letter = btn.customId.replace("hm_", "");
    guessed.add(letter);
    if (!word.includes(letter)) wrong++;

    const won = word.split("").every((c) => guessed.has(c));
    const lost = wrong >= maxWrong;

    if (won || lost) {
      collector.stop();
      const finalEmbed = buildEmbed()
        .setTitle(won ? "🎉 You Won!" : "💀 Game Over!")
        .addFields({ name: "The Word Was", value: `**${word.toUpperCase()}**` });
      await btn.update({ embeds: [finalEmbed], components: buildRows(true) });
    } else {
      await btn.update({ embeds: [buildEmbed()], components: buildRows() });
    }
  });

  collector.on("end", async (_, reason) => {
    if (reason === "time") {
      const timeoutEmbed = buildEmbed().setTitle("⏰ Game Timed Out").addFields({ name: "The Word Was", value: `**${word.toUpperCase()}**` });
      await interaction.editReply({ embeds: [timeoutEmbed], components: buildRows(true) });
    }
  });
}
