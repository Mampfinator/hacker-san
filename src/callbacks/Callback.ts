import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { ChannelType } from "discord-api-types";
import { CommandInteraction } from "discord.js";
import { CalenddarNotification } from "../calenddar/types";
import { HackerSan } from "../hacker-san";
import { Constructable } from "../slash-commands/SlashCommand"
import { DbCallback } from "./DbCallback";

const callbackRegistry = new Set<Constructable>();
export const getCallbackRegistry = () => callbackRegistry;

export interface ICallback {
    execute(client: HackerSan, callback: DbCallback, data: CalenddarNotification<any, any>, beforeAllData?: any): void | Promise<void>;
}

export interface BeforeAll {
    beforeAll(client: HackerSan, data: CalenddarNotification<any, any>): any;
}


const nameKey = Symbol("@Callback - name");
const descriptionKey = Symbol("@Callback - description");
const optionTransformerKey = Symbol("@Callback - optionTransformer");
const customTriggersKey = Symbol("@Callback - customTriggers"); 
const customChannelTypesKey = Symbol("@Callback - customChannelTypes");
const customOptionsKey = Symbol("@Callback - customOptions");

export type ChannelOptionChannelTypes = Exclude<ChannelType, ChannelType.DM | ChannelType.GroupDM>;

export interface CallbackOptions {
    name: string;
    description: string;
    optionTransformer?: (interaction: CommandInteraction) => Record<string, any>;
    customTriggers?: string[];
    customChannelTypes?: ChannelOptionChannelTypes[];
    customOptions?: (subcommand: SlashCommandSubcommandBuilder) => SlashCommandSubcommandBuilder
}

export const Callback = (options: CallbackOptions) => (target: Constructable) => {
    if (!options.name) throw new TypeError("Options.name not found.");
    if (!options.description) throw new TypeError("Options.description not defined.");

    Reflect.defineMetadata(nameKey, options.name, target);
    Reflect.defineMetadata(descriptionKey, options.description, target);

    if (options.optionTransformer) Reflect.defineMetadata(optionTransformerKey, options.optionTransformer, target);
    if (options.customTriggers) Reflect.defineMetadata(customTriggersKey, options.customTriggers, target);
    if (options.customChannelTypes) Reflect.defineMetadata(customChannelTypesKey, options.customChannelTypes, target);
    if (options.customOptions) Reflect.defineMetadata(customOptionsKey, options.customOptions, target);

    callbackRegistry.add(target);
}

export const getName = (target: Constructable) => Reflect.getMetadata(nameKey, target) as string;
export const getDescription = (target: Constructable) => Reflect.getMetadata(descriptionKey, target) as string;
export const getOptionTransformer = (target: Constructable) => Reflect.getMetadata(optionTransformerKey, target) as (interaction: CommandInteraction) => Record<string, any>;
export const getCustomTriggers = (target: Constructable) => Reflect.getMetadata(customTriggersKey, target) as string[];
export const getCustomChannelTypes = (target: Constructable) => Reflect.getMetadata(customChannelTypesKey, target) as ChannelOptionChannelTypes[];
export const getCustomOptions = (target: Constructable) => Reflect.getMetadata(customOptionsKey, target) as (subcommand: SlashCommandSubcommandBuilder) => SlashCommandSubcommandBuilder;