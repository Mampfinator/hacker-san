import { getAutoDefer, getBuilder, getCanExecute, getCommandRegistry, getDescription, getExecute, getName, SlashCommand } from "./SlashCommand";
import { SlashCommandManager } from "./SlashCommandManager";
import { Constructable } from "./SlashCommand";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { RawMessagePayloadData } from "discord.js/typings/rawDataTypes";

export interface SlashCommand {
    name: string;
    execute(interaction: CommandInteraction): Promise<void | string | MessageEmbed | RawMessagePayloadData>;
    commandData: SlashCommandBuilder;
    autoDefer?: boolean;
}

const returnTrue = () => true;

/**
 * Loads slash command singletons from the registry.
 */
export class SlashCommandLoader {
    private readonly executors = new WeakMap<Constructable, object>()

    constructor(
        private readonly manager: SlashCommandManager
    ) {}

    /**
     * @returns Constructed slash commands ready for use.
     */
    load() {
        const registry = getCommandRegistry();
        const commands = new Set<SlashCommand>();
        for (const constructor of registry) {
            // create instances
            if (!this.executors.has(constructor)) this.executors.set(constructor, new constructor(this.manager));
            const executor = this.executors.get(constructor)!
            
            const name = getName(constructor)
            const description = getDescription(constructor);

            // bind functions here to ensure right this context
            const builder = getBuilder(constructor)?.bind(executor);
            const canExecute = getCanExecute(constructor)?.bind(executor) ?? returnTrue;
            const execute = getExecute(constructor).bind(executor);

            commands.add({
                name,
                execute: async (interaction: CommandInteraction) => {
                    if (!(await canExecute(interaction))) return;
                    return execute(interaction);
                },
                commandData: (() => {
                    const command = new SlashCommandBuilder().setName(name).setDescription(description);
                    return builder ? builder(command)! : command // TODO: investiage if calling toJSON here is fine already
                })(),
                autoDefer: getAutoDefer(constructor)
            });
        }

        return commands; 
    }
}