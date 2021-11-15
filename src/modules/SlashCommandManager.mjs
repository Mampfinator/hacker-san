import { Client, CommandInteraction } from "discord.js";

/**
 * @typedef {object} Command
 * @prop    {string} name
 * @prop    {function} canExecute
 * @prop    {function} execute
 */
class SlashCommandManager {
    /**
     * @type {Client}
     */
    client;
    /**
     * @type {Map<string, object>}
     */
    commands;

    /**
     * 
     * @param {Client} client 
     */
    constructor(client) {
        Object.defineProperty(this, "client", {value: client});
        this.commands = new Map();
    }

    /**
     * 
     * @param  {...Command} commands 
     */
    add(...commands) {
        for (const command of commands) {
            this.commands.set(command.name, command);
        }
    }

    /**
     * 
     * @param {string} [guildId] 
     */
    async register(guildId) {
        let {commands} = guildId ? await this.client.guilds.fetch(guildId) : this.client.application
        await commands.fetch();

        for (const [, command] of commands.cache.filter(c => !this.commands.get(c.name))) {
            await command.delete();
        }

        

        for (const [, command] of this.commands) {
            if (commands.cache.get(command.name)) await commands.get(command.name)?.edit(command.command);
            else command.applicationCommand = await commands.create(command.command);
        }
    }

    /**
     * @param {CommandInteraction} interaction
     */
    async handle(interaction) {
        if (!interaction.isApplicationCommand()) return false;

        let command = this.commands.get(interaction.commandName);
        if (command.autoDefer === true) await interaction.deferReply();

        // Do I even need to fetch the guild? Probably not.
        if (interaction.guild.partial) await interaction.guild.fetch();
        interaction.guild.settings = await this.client.settings.fetch(interaction.guild.id);

        if (await command.canExecute(interaction)) command.execute(interaction, command);
        else {
            // TODO: Add option to SlashCommandManager to set a default command execution denied message
            // TODO: Add a permission denied hint to `SlashCommand` somewhere. 
            await (interaction.replied ? interaction.editReply("You don't have the permissions to do that!") : interaction.reply("You don't have the permissions to do that!"));
        }
    }
}

export default SlashCommandManager;