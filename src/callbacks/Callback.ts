import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { ChannelType } from "discord-api-types";
import { CommandInteraction } from "discord.js";
import { HackerSan } from "../hacker-san";
import { Constructable } from "../slash-commands/SlashCommand"
import { Callback as DbCallback } from "../orm";
import { RawMessagePayloadData } from "discord.js/typings/rawDataTypes";

const callbackRegistry = new Set<Constructable>();
export const getCallbackRegistry = () => callbackRegistry;
export const removeCallback = (target: Constructable) => {
    const name = getName(target);
    callbackRegistry.delete(target);
    return name;
} 
// TODO: pull methods out from @Callback and put them into separate method decorators.

/* @Callback */


const nameKey = Symbol("@Callback - name");
const descriptionKey = Symbol("@Callback - description");
const optionTransformerKey = Symbol("@Callback - optionTransformer");
const customTriggersKey = Symbol("@Callback - customTriggers"); 
const customChannelTypesKey = Symbol("@Callback - customChannelTypes");
const customOptionsKey = Symbol("@Callback - customOptions");

export type ChannelOptionChannelTypes = Exclude<ChannelType, ChannelType.DM | ChannelType.GroupDM>;

export interface CallbackOptions {
    /**
     * name of the callback
     */
    name: string;
    /**
     * the callback's description.
     */
    description: string;
    /**
     * Restrict the callback's execution to certain Calenddar events.
     * If empty array is provided, will skip automatic `trigger` argument generation.
     */
    customTriggers?: string[];
    /**
     * Restrict the callback's channel to certain channel types (for example, configure a `lock` callback to exclude execution on threads.)
     */
    customChannelTypes?: ChannelOptionChannelTypes[];
    /**
     * Add custom options to the `/callback add` command.
     */
    customOptions?: (subcommand: SlashCommandSubcommandBuilder) => SlashCommandSubcommandBuilder
}

export const Callback = (options: CallbackOptions) => (target: Constructable) => {
    if (!options.name) throw new TypeError("Options.name not found.");
    if (!options.description) throw new TypeError("Options.description not defined.");

    Reflect.defineMetadata(nameKey, options.name, target);
    Reflect.defineMetadata(descriptionKey, options.description, target);
    if (options.customTriggers) Reflect.defineMetadata(customTriggersKey, options.customTriggers, target);
    if (options.customChannelTypes) Reflect.defineMetadata(customChannelTypesKey, options.customChannelTypes, target);
    if (options.customOptions) Reflect.defineMetadata(customOptionsKey, options.customOptions, target);

    callbackRegistry.add(target);
}


/**
 * @returns the callback's name.
 */
export const getName = (target: Constructable) => Reflect.getMetadata(nameKey, target) as string;
/**
 * @returns the callback's description.
 */
export const getDescription = (target: Constructable) => Reflect.getMetadata(descriptionKey, target) as string;
/**
 * @returns 
 */
export const getOptionTransformer = (target: Constructable) => Reflect.getMetadata(optionTransformerKey, target) as (interaction: CommandInteraction) => Record<string, any>;
export const getCustomTriggers = (target: Constructable) => Reflect.getMetadata(customTriggersKey, target) as string[];
export const getCustomChannelTypes = (target: Constructable) => Reflect.getMetadata(customChannelTypesKey, target) as ChannelOptionChannelTypes[];
export const getCustomOptions = (target: Constructable) => Reflect.getMetadata(customOptionsKey, target) as (subcommand: SlashCommandSubcommandBuilder) => SlashCommandSubcommandBuilder;

/* @Execute */
const executeKey = Symbol("@Execute");
/**
 * Used to mark the main execution method for a callback. If not set, will default to trying `Callback#execute`.
 */
export const Execute = () => (target: any, name: string) => {
    Reflect.defineMetadata(executeKey, name, target);
}
export const getExecute = (target: Constructable) => target.prototype[Reflect.getMetadata(executeKey, target.prototype) ?? "execute"] as (client: HackerSan, notification: any, callback: DbCallback, preExecuteData?: any) => Promise<RawMessagePayloadData>;


/* @PreExecute */
const preExecuteKey = Symbol("@PreExecute");
/**
 * Used to process Calenddar notifications before the execution method is triggered. 
 * Fetch more info from APIs here, for example, or do some pre-processing here.
 * 
 * @example
 * \@Callback(...)
 * class ExampleCallback {
 *      execute(client: HackerSan, callback: DbCallback, notification: CalenddarNotifcation, vtuber: CalenddarVTuber[]) {
 *          console.log("No matter which guild or channel this callback triggers in, I've got the vtubers right here: ", vtubers);
 *      }
 * 
 *      \@PreExecute()
 *      async fetchVtubers(client: HackerSan, notification: CalenddarNotification>) {
 *          return Promise.all(notification.vtubers.map(id => client.calenddar.vtubers.fetch(id)));
 *      }
 * }
 */
export const PreExecute = () => (target: any, name: string) => {
    Reflect.defineMetadata(preExecuteKey, name, target);
}
export const getPreExecute = (target: Constructable) => target.prototype[Reflect.getMetadata(preExecuteKey, target.prototype) ?? "preExecute"] as (client: HackerSan, notification: any) => any;