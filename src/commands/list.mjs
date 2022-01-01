import { SlashCommand } from "../modules/index.mjs";
import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { callbackToString } from "../util/util.mjs";
import { MultipageEmbed } from "../util/MultipageEmbed.mjs";

/**
 * @param {CommandInteraction} interaction 
 * @returns {Promise<MultipageEmbed>}
 */
let buildEmbed = async (interaction) => {
    //let settings = await interaction.guild.client.settings.fetch(interaction.guild.id);
    let target = interaction.options.getSubcommand();

    let embed = new MultipageEmbed();
    switch(target) {
        case "callbacks":
            const perPage = 5;
            const fetchOptions = {};
            const fillIfExists = (field) => {
                if (interaction.options.get(field)) fetchOptions[field] = interaction.options.get(field).value; 
            }

            fillIfExists("vtuber");
            fillIfExists("trigger");
            fillIfExists("type");
            fetchOptions.guild = interaction.guild.id;

            const callbacks = await interaction.client.callbacks.fetch(fetchOptions);

            const pages = [];

            callbacks.forEach((callback, index) => {
                const page = Math.floor(index/perPage)
                if (!pages[page]) pages[page] = new MessageEmbed().setColor("AQUA").setTitle(`Callbacks - ${page+1}/${Math.ceil(callbacks.length/perPage)}`);
                pages[page].addField(
                    `Callback #${index+1}`,
                    callbackToString(callback)
                );
            });
            embed.add(...pages);
            break;

        default: 
            embed.add(new MessageEmbed().setDescription(`Could not find list target ${target}. Please contact the bot author.`));
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
                .addStringOption(o => {
                    o = o.setName("vtuber").setDescription("Which VTuber's callbacks to retrieve. Defaults to all.")
                    o.autocomplete = true;
                    return o;
                })
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
        await embed.send(interaction);
    }
);