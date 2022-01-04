import { SlashCommandBuilder, SlashCommandSubcommandBuilder, SlashCommandSubcommandGroupBuilder, SlashCommandSubcommandsOnlyBuilder } from "@discordjs/builders";
import { CommandInteraction, Interaction, MessageEmbed, MessagePayload } from "discord.js";

export type Constructable = {new (...args: any[]): Record<string, any>} & Record<string, any>;

const commandRegistry = new Set<Constructable>();

const builderKey = Symbol("@SlashCommand - builder");
const nameKey = Symbol("@SlashCommand - name");
const canExecuteKey = Symbol("@SlashCommand - canExecute");
const executeKey = Symbol("@Execute"); 


export interface SlashCommandOptions {
    name: string;
    builder: (builder: SlashCommandBuilder) => SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder | SlashCommandSubcommandGroupBuilder | SlashCommandSubcommandBuilder;
    canExecute?: (interaction: CommandInteraction) => Promise<boolean> | boolean
}

export interface ISlashCommand {
    execute(interaction: CommandInteraction): Promise<void> | Promise<MessageEmbed> | Promise<string> | Promise<MessagePayload>
}

export const SlashCommand = (options: SlashCommandOptions) => (target: Constructable) => {
    if (!options.name) throw new TypeError("Options.name not found.");
    if (!options.builder) throw new TypeError("Options.builder not found.");

    Reflect.defineMetadata(builderKey, options.builder, target);
    Reflect.defineMetadata(nameKey, options.name, target);
    if (options.canExecute) Reflect.defineMetadata(canExecuteKey, options.canExecute, target);

    commandRegistry.add(target);
}

export const Execute = () => (target: Constructable, name: string) => {
    Reflect.defineMetadata(executeKey, name, target);
}

export const getBuilder = (target: Constructable) => Reflect.getMetadata(builderKey, target);
export const getName = (target: Constructable) => Reflect.getMetadata(nameKey, target);
export const getCanExecute = (target: Constructable) => Reflect.getMetadata(canExecuteKey, target);
export const getExecute = (target: Constructable) => Reflect.getMetadata(executeKey, target) as string ?? "execute";


export const getCommandRegistry = () => commandRegistry;