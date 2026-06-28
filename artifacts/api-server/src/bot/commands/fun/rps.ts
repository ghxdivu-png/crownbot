import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

type Choice = "rock" | "paper" | "scissors";

const BEATS: Record<Choice, Choice> = { rock: "scissors", paper: "rock", scissors: "paper" };
const EMOJI: Record<Choice, string> = { rock: "🪨", paper: "📄", scissors: "✂️" };

export const data = new SlashCommandBuilder()
  .setName("rps")
  .setDescription("Play rock, paper, scissors against the bot")
  .addStringOption((opt) =>
    opt.setName("choice")
      .setDescription("Your choice")
      .setRequired(true)
      .addChoices(
        { name: "🪨 Rock", value: "rock" },
        { name: "📄 Paper", value: "paper" },
        { name: "✂️ Scissors", value: "scissors" },
      )
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const userChoice = interaction.options.getString("choice", true) as Choice;
  const choices: Choice[] = ["rock", "paper", "scissors"];
  const botChoice = choices[Math.floor(Math.random() * 3)];

  let result: string;
  let color: number;

  if (userChoice === botChoice) {
    result = "It's a tie!";
    color = 0x99aab5;
  } else if (BEATS[userChoice] === botChoice) {
    result = "You win! 🎉";
    color = 0x57f287;
  } else {
    result = "You lose! 😞";
    color = 0xed4245;
  }

  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle("🎮 Rock, Paper, Scissors")
    .addFields(
      { name: "Your Choice", value: `${EMOJI[userChoice]} ${userChoice}`, inline: true },
      { name: "Bot's Choice", value: `${EMOJI[botChoice]} ${botChoice}`, inline: true },
      { name: "Result", value: result }
    )
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
