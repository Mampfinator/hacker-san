import { getBuilder, getCanExecute, getCommandRegistry, getExecute, getName, ISlashCommand, SlashCommand } from "./SlashCommand";
import { SlashCommandManager } from "./SlashCommandManager";
import { Constructable } from "./SlashCommand";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { RawMessagePayloadData } from "discord.js/typings/rawDataTypes";

export interface SlashCommand {
    name: string;
    execute(interaction: CommandInteraction): Promise<void | string | MessageEmbed | RawMessagePayloadData>;
    canExecute(interaction: CommandInteraction): Promise<boolean> | boolean;
    commandData: SlashCommandBuilder;
}

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
            this.executors.set(constructor, new constructor(this.manager));
            const executor = this.executors.get(constructor);
            const executeField = getExecute(constructor);
            console.log(executor);
            console.log(executeField);

            const name = getName(constructor)

            commands.add({
                name,
                execute: (...args: any[]) => Reflect.apply(constructor.prototype[executeField], executor, args),
                canExecute: getCanExecute(constructor) ?? (() => true),
                commandData: getBuilder(constructor)(new SlashCommandBuilder().setName(name))
            });
        }

        return commands; 
    }
}