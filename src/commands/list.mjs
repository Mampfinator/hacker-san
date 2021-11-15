import { SlashCommand } from "../modules/index.mjs";
import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { callbackToString } from "../util/util.mjs";

/**
 * @param {CommandInteraction} interaction 
 * @returns {Promise<MessageEmbed>}
 */
let buildEmbed = async (interaction) => {
    let settings = await interaction.guild.client.settings.fetch(interaction.guild.id);
    let target = interaction.options.getSubcommand();

    let embed = new MessageEmbed().setColor("AQUA");
    switch(target) {
        case "callbacks":
            let fetchOptions = {guild: interaction.guild.id};
            if (interaction.options.get("vtuber")) fetchOptions["vtuber"] = interaction.options.get("vtuber").value;
            if (interaction.options.get("trigger")) fetchOptions["trigger"] = interaction.options.get("trigger").value;
            if (interaction.options.get("type")) fetchOptions["type"] = interaction.options.get("type").value;
            let callbacks = await interaction.client.callbacks.fetch(fetchOptions);
            let description = callbacks.map(callback => callbackToString(callback)).join("\n");
            embed.setDescription(description);
            break;

        default: 
            embed.setDescription(`Could not find list target ${target}. Please contact the bot author.`);
            break;
    }
    return embed;
}

export default new SlashCommand(
    "list", 
    /**
     * @param {SlashCommandBuilder} scb 
     */
    // Stupid bandaid fix because subcommands & subcommand groups are broken in v0.7, while v0.8 doesn't work at all with import statements 
    scb => {
        scb = scb.setDescription("List everything!")
            .addSubcommand(s => s.setName("callbacks").setDescription("List all registered callbacks.")
                .addStringOption(o => o.setName("vtuber").setDescription("Which VTuber's callbacks to retrieve. Defaults to all."))
                .addStringOption(o => o.setName("type").setDescription("Which types to list. Defaults to all.").addChoices([
                    ["echo", "echo"],
                    ["lock", "lock"],
                    ["unlock", "unlock"],
                    ["notify", "notify"],
                    ["rename", "rename"]
                ]))
                .addStringOption(o => o.setName("trigger").setDescription("Which event's callbacks to list. Defaults to all.").addChoices([
                    ["live", "live"],
                    ["offline", "offline"],
                    ["upcoming", "upcoming"],
                    ["moved", "moved"]
                ]))
            );
        
        // fix things here
        //! @discordjs/builders: SlashCommandBuilder#addSubcommand(Group) doesn't properly assign types in v0.7, and is broken for ESModule imports in v0.8^.
        scb.options[0].type = 1;
        
        return scb;
    },
    async () => true,
    /**
     * @param {CommandInteraction} interaction
     */
    async (interaction, command) => {
        let embed = await buildEmbed(interaction);
        await interaction.reply({embeds: [embed]});
    }
);