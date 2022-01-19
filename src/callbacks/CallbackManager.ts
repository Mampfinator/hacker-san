import { HackerSan } from "../hacker-san";
import { Callback as DbCallback } from "../orm";
import { groupBy } from "ts-prime";
import { Guild, GuildChannel, Snowflake } from "discord.js";
import { Callback, CallbackLoader } from "./CallbackLoader";
import { Notification } from "calenddar-client";

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
            data.set(callback.name, await callback.preExecute(this.client, notification));
        }

        return data;
    }


    async handle(notification: Notification) {
        const {event, vtubers, platform, post, stream } = notification;
        const preExecute = await this.processPreExecute(notification);


    }


    async execute(callback: DbCallback, notification: Notification, preExecuteData?: any) {
        const {type} = callback;
        const callbackType = this.callbacks.get(type);
        if (!callbackType) throw new UnknownCallbackTypeError(type);

        if (callback.delay) return setTimeout(() => {
            callbackType.execute(this.client, notification, callback, preExecuteData);
        }, callback.delay * 1000);
        
        await callbackType.execute(this.client, notification, callback, preExecuteData);
    }
}