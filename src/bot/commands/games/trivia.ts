import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from "discord.js";

interface TriviaQuestion {
  question: string;
  correct: string;
  wrong: string[];
  category: string;
}

const QUESTIONS: TriviaQuestion[] = [
  { question: "What is the capital of France?", correct: "Paris", wrong: ["London", "Berlin", "Madrid"], category: "Geography" },
  { question: "How many planets are in our solar system?", correct: "8", wrong: ["7", "9", "10"], category: "Science" },
  { question: "What is 12 × 12?", correct: "144", wrong: ["122", "132", "164"], category: "Math" },
  { question: "Who wrote Hamlet?", correct: "William Shakespeare", wrong: ["Charles Dickens", "Mark Twain", "Ernest Hemingway"], category: "Literature" },
  { question: "What is the largest ocean on Earth?", correct: "Pacific Ocean", wrong: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean"], category: "Geography" },
  { question: "What year did World War II end?", correct: "1945", wrong: ["1943", "1944", "1946"], category: "History" },
  { question: "What is the chemical symbol for gold?", correct: "Au", wrong: ["Go", "Ag", "Gd"], category: "Science" },
  { question: "How many sides does a hexagon have?", correct: "6", wrong: ["5", "7", "8"], category: "Math" },
  { question: "What is the fastest land animal?", correct: "Cheetah", wrong: ["Lion", "Peregrine Falcon", "Pronghorn Antelope"], category: "Animals" },
  { question: "In what year was the first iPhone released?", correct: "2007", wrong: ["2005", "2006", "2008"], category: "Technology" },
  { question: "What is the longest river in the world?", correct: "Nile", wrong: ["Amazon", "Mississippi", "Yangtze"], category: "Geography" },
  { question: "Who painted the Mona Lisa?", correct: "Leonardo da Vinci", wrong: ["Pablo Picasso", "Michelangelo", "Raphael"], category: "Art" },
  { question: "What is the boiling point of water in Celsius?", correct: "100°C", wrong: ["90°C", "80°C", "120°C"], category: "Science" },
  { question: "What programming language was Discord.js written in?", correct: "JavaScript", wrong: ["Python", "C++", "Rust"], category: "Technology" },
  { question: "How many strings does a standard guitar have?", correct: "6", wrong: ["4", "5", "7"], category: "Music" },
];

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export const data = new SlashCommandBuilder()
  .setName("trivia")
  .setDescription("Answer a random trivia question!");

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const q = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];
  const choices = shuffle([q.correct, ...q.wrong]);
  const letters = ["A", "B", "C", "D"];

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    choices.map((choice, i) =>
      new ButtonBuilder()
        .setCustomId(`trivia_${i}_${choice === q.correct}`)
        .setLabel(`${letters[i]}. ${choice}`)
        .setStyle(ButtonStyle.Primary)
    )
  );

  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle(`🧠 Trivia — ${q.category}`)
    .setDescription(q.question)
    .setFooter({ text: "You have 15 seconds to answer!" });

  const reply = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });

  const collector = reply.createMessageComponentCollector({ componentType: ComponentType.Button, time: 15_000 });

  collector.on("collect", async (btn) => {
    if (btn.user.id !== interaction.user.id) {
      await btn.reply({ content: "❌ This isn't your trivia question!", ephemeral: true });
      return;
    }

    const isCorrect = btn.customId.endsWith("_true");
    collector.stop();

    const resultEmbed = new EmbedBuilder()
      .setColor(isCorrect ? 0x57f287 : 0xed4245)
      .setTitle(isCorrect ? "✅ Correct!" : "❌ Wrong!")
      .addFields(
        { name: "Question", value: q.question },
        { name: "Correct Answer", value: q.correct },
        { name: "Your Answer", value: choices[parseInt(btn.customId.split("_")[1])] }
      );

    await btn.update({ embeds: [resultEmbed], components: [] });
  });

  collector.on("end", async (_, reason) => {
    if (reason === "time") {
      const timeoutEmbed = new EmbedBuilder()
        .setColor(0x99aab5)
        .setTitle("⏰ Time's Up!")
        .addFields(
          { name: "Question", value: q.question },
          { name: "Correct Answer", value: q.correct }
        );
      await interaction.editReply({ embeds: [timeoutEmbed], components: [] });
    }
  });
}
