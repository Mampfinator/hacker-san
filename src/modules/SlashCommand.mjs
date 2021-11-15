import { SlashCommandBuilder } from "@discordjs/builders";

class SlashCommand {
    /**
     * @type {string}
     */
    name;
    /**
     * @type {SlashCommandBuilder}
     */
    command;
    /**
     * @type {function}
     * @returns {Promise<boolean>}
     */
    canExecute;
    /**
     * @type {function}
     */
    execute;

    /**
     * @param {string} name 
     * @param {function<boolean>} canExecute
     * @param {function} commandBuilder
     */
    constructor(name, commandBuilder, canExecute, execute) {
        this.name = name;
        this.command = commandBuilder(new SlashCommandBuilder().setName(name));
        this.canExecute = canExecute;
        this.execute = execute;
    }
}

export default SlashCommand;