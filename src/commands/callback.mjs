import {SlashCommand} from "../modules/index.mjs";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { SlashCommandBuilder, SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { callbackToString } from "../util/util.mjs";
export default new SlashCommand(
    "callback",
    /**
     * @param {SlashCommandBuilder} builder
     */
    builder => {
        builder = builder.setDescription("Add & modify callbacks")
        .addSubcommandGroup(subGroup => {
            // Set parent options shared among all callbacks.
            /**
             * @param {SlashCommandSubcommandBuilder} sub 
             */
            let setDefaultOptions = (sub => sub.addStringOption(option => 
                option.setName("trigger").setDescription("Event this action should trigger on.").setRequired(true)
                .addChoices([
                    ["live", "live"],
                    ["offline", "offline"],
                    ["upcoming", "upcoming"],
                    ["upload", "upload"],
                    ["moved", "moved"]
                ]))
            .addStringOption(option => {
                //! @discordjs/builders - SlashCommandBuilder doesn't support autocomplete in the version I have to rely on thanks to improper ES module import config on their part. So manual adding is required.
                option = option.setName("vtuber").setDescription("VTuber this action should trigger on.").setRequired(true)
                option.autocomplete = true;
                return option;
            })
            .addChannelOption(option => option.setName("channel").setDescription("Channel this callback operates on/in.").setRequired(true)))


            subGroup.setName("add").setDescription("Add a new callback.");
                /* echo command */
            subGroup.addSubcommand(echo => 
                    setDefaultOptions(echo).setName("echo").setDescription("Send a message to the target channel.")
                    .addStringOption(option => option.setName("message").setDescription("The message to send. Allows interpolated strings. Check help for details.").setRequired(true)))
                /* lock command */
                .addSubcommand(lock => 
                    setDefaultOptions(lock).setName("lock").setDescription("Lock the target channel (disable VIEW_CHANNEL for @everyone)."))
                /* unlock command */
                .addSubcommand(unlock => 
                    setDefaultOptions(unlock).setName("unlock").setDescription("Unlock the target channel (set VIEW_CHANNEL to neutral/inherit for @everyone)."))
                /* notify command */
                .addSubcommand(notify => 
                    setDefaultOptions(notify).setName("notify").setDescription("Generates a stream notification.")
                    .addRoleOption(option => option.setName("pingrole").setDescription("The role to be pinged. Leave blank for no ping and just a message."))
                    .addStringOption(option => option.setName("custom_message").setDescription("Custom message to put after the role ping on a new line.")))
                /* rename command */
                .addSubcommand(rename => 
                    setDefaultOptions(rename).setName("rename").setDescription("Rename the target channel.")
                    .addStringOption(option => option.setName("name").setDescription("The channel's new name."))
            )
            return subGroup;
        })
        .addSubcommand(sub => 
            sub.setName("remove").setDescription("Remove one or more callbacks.")
            .addStringOption(i => i.setName("id").setDescription("Callback ID you want to remove. Supports comma-separation for multiple IDs.").setRequired(true))
        )

        //! command-fixing fuckery explained in src/commands/list.mjs
        builder.options[0].type = 2;
        builder.options[0].options[0].type = 1;
        builder.options[0].options[1].type = 1;
        builder.options[0].options[2].type = 1;
        builder.options[0].options[3].type = 1;
        builder.options[0].options[4].type = 1;
        builder.options[1].type = 1;

        return builder;
    },
    /**
     * @param {CommandInteraction} interaction
     */
    async (interaction) => {
        // check if admin, mod or configured mod role
        if (interaction.member.permissions.any([
            "MANAGE_GUILD", "BAN_MEMBERS", "MANAGE_ROLES"
        ])) return true;
        
        let settings = await interaction.client.settings.fetch(interaction.guildId);
        let modRoles = settings.get("mod_roles");
        if (!modRoles || modRoles.length == 0) return false;
        return interaction.member.roles.some(r => modRoles.includes(r));
    },
    /**
     * @param {CommandInteraction} interaction
     */
    async (interaction) => {
        let {options} = interaction;
        let subcommand = options.getSubcommand();
        let subcommandGroup;
        if (subcommand !== "remove") subcommandGroup = options.getSubcommandGroup();
        
        // ugly convenience fix but lazy
        if (!subcommandGroup) subcommandGroup = subcommand;

        let {client} = interaction;
        let {callbacks} = client;

        if (subcommandGroup === "add") {
            await interaction.deferReply();

            let vtuber = options.get("vtuber").value;
            if (!(await client.calenddar.getVtuberById(vtuber)) && !(await client.calenddar.search(vtuber, 1))) return await interaction.reply(`Could not find VTuber ${vtuber} anywhere on Calenddar. Contact the bot author to add it.`);

            let trigger = options.get("trigger").value;
            let channel = options.get("channel").channel;

            let {makeOptions} = callbacks.types.get(subcommand) ?? {};
            console.log(makeOptions);
            let restOptions = makeOptions ? makeOptions(interaction) : {};

            let callback = {type: subcommand, trigger, vtuber, channel: channel.id, guild: interaction.guildId, ...restOptions};

            let _id = await callbacks.add(callback);
            let settings = await client.settings.fetch(interaction.guildId);
            let dbCallbacks = settings.get("callbacks") ?? [];
            dbCallbacks.push(_id);
            await settings.set("callbacks", dbCallbacks);

            await interaction.editReply({embeds: [
                new MessageEmbed()
                    .setTitle("Successfully added new callback!")
                    .setDescription(callbackToString(callback))
                    .setColor("GREEN")
            ]});

        } else if (subcommandGroup === "remove") {
            let ids = options.get("id").value.split(",");

            let success = [], failed = [];

            for (const id of ids) {
                let removed = await client.callbacks.remove(id);
                if (removed) success.push(removed);
                else failed.push(id);
            }

            let embed = new MessageEmbed().setColor(success.length > 0 && failed.length == 0 ? "GREEN" : "RED");
            if (success.length > 0) embed.addField("Successfully removed: ", success.map(c => callbackToString(c)).join("\n"));
            if (failed.length > 0) embed.addField("Failed removing: ", failed.join("\n"));

            await interaction.reply({embeds: [
                embed
            ]});
        }
    }
);