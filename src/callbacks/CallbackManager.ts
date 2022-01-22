import { HackerSan } from "../hacker-san";
import { Callback as DbCallback } from "../orm";
import { groupBy, sortBy, pipe, reverse } from "ts-prime";
import { Collection, Guild, GuildChannel, GuildTextBasedChannel, NonThreadGuildBasedChannel, Snowflake, TextChannel, ThreadChannel } from "discord.js";
import { Callback, CallbackLoader } from "./CallbackLoader";
import { Notification } from "calenddar-client";
import { Constructable } from "../slash-commands/SlashCommand";
import { DAPIErrors, ignore, notificationToInterpolation } from "../util";

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

    private async processPreExecute(notification: Notification) : Promise<Map<string, any>> {
        const data = new Map();
        for (const callback of [...this.callbacks.values()].filter(c => c.preExecute)) {
            data.set(callback.name, await (callback.preExecute && callback.preExecute(this.client, notification)));
        }

        return data;
    }


    async handle(notification: Notification) {
        const {event, vtubers, platform, post, stream } = notification;
        const preExecute = await this.processPreExecute(notification);
        const replacers = notificationToInterpolation(notification);

        const vtuberIds = notification.vtubers.map(v => v.id);

        const allCallbacks = await DbCallback.findAll({where: {
            vtuber: vtuberIds,
            trigger: event,
            // platform: [platform, "any"], //TODO: implement platform filters for callbacks
        }});

        // sorty by guild
        const byGuild = groupBy(allCallbacks, callback => callback.guildId);

        for (const [guildId, guildCallbacks] of Object.entries(byGuild)) {
            const guild = await this.client.guilds.fetch(guildId);

            const byChannel =  pipe(guildCallbacks, 
                //sortBy(callback => callback.priority ?? 0), // order by ascending priority (0 - 100) //FIXME: returns unknown[] for some reason, and makes `callback.channelId` inaccessible
                //reverse, // order by *descending* priority (execution priority; higher priority -> earlier in the list) (100 - 0)
                groupBy(callback => callback.channelId),
            );

            for (const [channelId, callbacks] of Object.entries(byChannel)) {
                const channel = await guild.channels.fetch(channelId).catch();
                if (channel) this.executeByChannel(callbacks, notification, preExecute, guild, channel as TextChannel);
            }
        }
    }

    private async executeByChannel(callbacks: DbCallback[], notification: Notification, preExecute: any, guild: Guild, channel: TextChannel) {
        for (const callback of callbacks) {
            // potential Discord.js type error? Shown to return {threads: Collection<Snowflake, ThreadChannel>, hasMore: boolean} instead of typed ThreadChannel | null.
            const thread = await channel.threads.fetch(callback.threadId).catch();
            const result = await this.execute(callback, notification, {...preExecute, guild, channel: thread && thread.isThread && thread.isThread() ? thread : channel})
                .catch(ignore(DAPIErrors));

            console.log(result);
        }
    }


    async execute(callback: DbCallback, notification: Notification, preExecuteData?: any) {
        const { type } = callback;
        const callbackType = this.callbacks.get(type);
        if (!callbackType) throw new UnknownCallbackTypeError(type);

        // return Promise that resolves whenever the delay is up & execution has finished
        if (callback.delay && callback.delay > 0) {
            console.log(`Got callback delay of ${callback.delay}s.`)
            console.time(`callback_${callback.id}`);
            return new Promise<void>(res => setTimeout(async () => {
                console.timeEnd(`callback_${callback.id}`);
                await callbackType.execute(this.client, notification, callback, preExecuteData).catch();
                res();
            }, callback.delay! * 1000));
        }
        // return after callback has been executed
        await callbackType.execute(this.client, notification, callback, preExecuteData);
    }

    getInstance(source: Constructable | object) {
        if (this.loader.reversedCallbacks.has(source)) return source; // already an instance
        if (this.loader.callbacks.has(source as Constructable)) return this.loader.callbacks.get(source as Constructable); // is a constructor, get its instance
    }
}