import { SlashCommandBuilder } from "@discordjs/builders"
import { MessageEmbed } from "discord.js";
import uuid from "uuid";
import SlashCommand from "../modules/SlashCommand.mjs"
import { MultipageEmbed } from "../util/MultipageEmbed.mjs"

export default new SlashCommand(
    "multipage",
    /**
     * @param {SlashCommandBuilder} builder 
     */
    builder => 
        builder.setDescription("Test multipage embeds!")
        .addIntegerOption(option => 
            option.setName("per_page").setDescription("Amount of entries per page.").setRequired(true))
        .addIntegerOption(option =>
            option.setName("total").setDescription("Total amount of random-generated entries.").setRequired(true)),
    () => true,
    async interaction => {
        const total = interaction.options.get("total").value;
        const perPage = interaction.options.get("per_page").value;
        
        const multipageEmbed = new MultipageEmbed();

        for (let i = 0; i < Math.ceil(total/perPage); i++) {
            const embed = new MessageEmbed().setDescription("I'm random-generated!")
            for (let j = 0; j < perPage; j++) embed.addField(`Random field ${i+j}`, `Here's a random-generated value: ${uuid.v4()}`);
            multipageEmbed.add(embed)
        }

        await multipageEmbed.send(interaction);
    }
)