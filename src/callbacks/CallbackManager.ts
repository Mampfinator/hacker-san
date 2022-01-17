import { HackerSan } from "../hacker-san";
import { Callback as DbCallback } from "../orm";
import { entries, groupBy, pipe, values } from "ts-prime";
import { Channel, Guild, GuildChannel, Snowflake } from "discord.js";
import { getCallbackRegistry } from "./Callback";
import { Callback, CallbackLoader } from "./CallbackLoader";

export class UnknownCallbackTypeError extends Error {
    constructor(type: string) {
        super(`Could not find callback with type ${type}.`);
    }
}

interface SortedCallbacks {
    guild: Guild;
    sortedCallbacks: Map<Snowflake, {channel: GuildChannel, callbacks: DbCallback[]}>
}

export class CallbackManager {
    
    public callbacks = new Map<string, Callback>(); 

    public readonly loader: CallbackLoader;
    constructor(
        public readonly client: HackerSan
    ) {
        this.loader = new CallbackLoader(this);
    }


    load() {
        const callbacks = this.loader.load();
        this.callbacks = new Map([...callbacks].map(callback => [callback.name, callback]));
    }

    private async processPreExecute(notification: any) : Promise<Map<string, any>> {
        const data = new Map();
        for (const callback of [...this.callbacks.values()].filter(c => c.preExecute)) {
            data.set(callback.name, await callback.preExecute(this.client, notification));
        }

        return data;
    }


    async handle(notification: any) {
        const {event, vtubers, platform, data} = notification;

        const callbacks = await DbCallback.findAll({where: {trigger: event, vtuber: vtubers}});
        const sorted = await Promise.all(Object.entries(groupBy(callbacks, item => item.guildId)).map(([guildId, guildCallbacks]) => 
            new Promise(async (resolve: (sorted: SortedCallbacks) => void) => {
                const final = {} as SortedCallbacks;

                // fetch the guild *once* and store it.
                final.guild = await this.client.guilds.fetch(guildId); 
                // TODO: update callbacks to be able to store thread IDs.

                // fetch all channels once and store them.
                const channels = [];
                const byChannels = groupBy(guildCallbacks, (callback) => callback.channelId);
                for (const channelId of Object.keys(byChannels)) {
                    channels.push(await final.guild.channels.fetch(channelId));
                }

                final.sortedCallbacks = new Map();
                for (const channel of channels.filter(channel => channel !== null)) {
                    final.sortedCallbacks.set(channel!.id, {
                        callbacks: byChannels[channel!.id],
                        channel: channel as Exclude<typeof channel, null>
                    })
                }
                resolve(final);
            })
        ));

        await this.executeInSequence(sorted, notification);
    }

    async executeInSequence(preSorted: SortedCallbacks[], notifcation: any) {
        const preExecuteData = await this.processPreExecute(notifcation);
        
        for (const {guild, sortedCallbacks} of preSorted) {
            // TODO: sort sortedCallbacks by execution preference in settings
            const executionPreference = new Map(/* get order from settings; map to callbackId => undefined */);


            for (const [guildId, {channel, callbacks}] of sortedCallbacks) {
                for (const callback of callbacks) {
                    executionPreference.set(callback.id, callback);
                }
            }

            for (const callback of [...executionPreference.values()]) {
                await this.execute(callback, notifcation, preExecuteData.get(callback.name));
            }
        }
    }


    async execute(callback: DbCallback, notification: any, preExecuteData?: any) {
        const {type} = callback;
        const callbackType = this.callbacks.get(type);
        if (!callbackType) throw new UnknownCallbackTypeError(type);

        await callbackType.execute(this.client, notification, callback, preExecuteData);

    }
}