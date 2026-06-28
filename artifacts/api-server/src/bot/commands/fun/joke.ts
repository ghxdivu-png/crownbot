import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

const JOKES = [
  { setup: "Why don't scientists trust atoms?", punchline: "Because they make up everything!" },
  { setup: "Why did the scarecrow win an award?", punchline: "Because he was outstanding in his field!" },
  { setup: "Why don't eggs tell jokes?", punchline: "Because they'd crack each other up!" },
  { setup: "What do you call a fake noodle?", punchline: "An impasta!" },
  { setup: "Why can't you give Elsa a balloon?", punchline: "Because she'll let it go!" },
  { setup: "What do you call cheese that isn't yours?", punchline: "Nacho cheese!" },
  { setup: "Why did the math book look so sad?", punchline: "Because it had too many problems!" },
  { setup: "What do you call a sleeping dinosaur?", punchline: "A dino-snore!" },
  { setup: "Why did the bicycle fall over?", punchline: "Because it was two-tired!" },
  { setup: "What do you call a bear with no teeth?", punchline: "A gummy bear!" },
  { setup: "Why did the golfer bring an extra pair of pants?", punchline: "In case he got a hole in one!" },
  { setup: "How does a penguin build its house?", punchline: "Igloos it together!" },
  { setup: "What do you call a fish without eyes?", punchline: "A fsh!" },
  { setup: "Why did the tomato turn red?", punchline: "Because it saw the salad dressing!" },
  { setup: "What do you call a lazy kangaroo?", punchline: "A pouch potato!" },
];

export const data = new SlashCommandBuilder()
  .setName("joke")
  .setDescription("Get a random joke");

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const joke = JOKES[Math.floor(Math.random() * JOKES.length)];

  const embed = new EmbedBuilder()
    .setColor(0xfee75c)
    .setTitle("😂 Random Joke")
    .addFields(
      { name: "Setup", value: joke.setup },
      { name: "Punchline", value: `||${joke.punchline}||` }
    )
    .setFooter({ text: "Click the punchline to reveal it!" })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
