import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ComponentType } from "discord.js";

function generate(): { question: string; answer: number } {
  const ops = ["+", "-", "×", "÷"] as const;
  const op = ops[Math.floor(Math.random() * ops.length)];
  let a: number, b: number, answer: number, question: string;

  switch (op) {
    case "+": a = Math.floor(Math.random() * 100); b = Math.floor(Math.random() * 100); answer = a + b; question = `${a} + ${b}`; break;
    case "-": a = Math.floor(Math.random() * 100); b = Math.floor(Math.random() * a + 1); answer = a - b; question = `${a} - ${b}`; break;
    case "×": a = Math.floor(Math.random() * 12) + 1; b = Math.floor(Math.random() * 12) + 1; answer = a * b; question = `${a} × ${b}`; break;
    default: b = Math.floor(Math.random() * 11) + 2; answer = Math.floor(Math.random() * 10) + 1; a = b * answer; question = `${a} ÷ ${b}`; break;
  }

  return { question, answer };
}

export const data = new SlashCommandBuilder()
  .setName("math")
  .setDescription("Solve a quick math challenge!");

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const { question, answer } = generate();

  const modal = new ModalBuilder()
    .setCustomId("math_answer")
    .setTitle("🔢 Math Challenge")
    .addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId("answer_input")
          .setLabel(`What is: ${question} = ?`)
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
          .setMaxLength(10)
      )
    );

  await interaction.showModal(modal);

  const submitted = await interaction.awaitModalSubmit({ time: 30_000 }).catch(() => null);
  if (!submitted) return;

  const userAnswer = parseInt(submitted.fields.getTextInputValue("answer_input").trim());
  const isCorrect = userAnswer === answer;

  const embed = new EmbedBuilder()
    .setColor(isCorrect ? 0x57f287 : 0xed4245)
    .setTitle(isCorrect ? "✅ Correct!" : "❌ Wrong!")
    .addFields(
      { name: "Question", value: `${question} = ?` },
      { name: "Correct Answer", value: answer.toString(), inline: true },
      { name: "Your Answer", value: isNaN(userAnswer) ? "Invalid" : userAnswer.toString(), inline: true }
    )
    .setTimestamp();

  await submitted.reply({ embeds: [embed] });
}
