import { RawMessagePayloadData } from "discord.js/typings/rawDataTypes";
import { Constructable } from "../slash-commands/SlashCommand";
import { getCallbackRegistry, getDescription, getExecute, getName, getPreExecute } from "./Callback";
import { CallbackManager } from "./CallbackManager";
import { Callback as DbCallback } from "../orm";
import { HackerSan } from "../hacker-san";
import { Notification } from "calenddar-client";

export interface Callback {
    name: string;
    execute: (client: HackerSan, notification: Notification, callback: DbCallback, preExecuteData?: any) => Promise<RawMessagePayloadData>;
    preExecute: (client: HackerSan, notification: Notification) => any;
}

export class CallbackLoader {
    private callbacks = new WeakMap<Constructable, object>();

    constructor(
        public readonly manager: CallbackManager
    ) {}

    load() {
        const registry = getCallbackRegistry();
        const callbacks = new Set<Callback>(); 

        for (const constructor of registry) {
            if (!this.callbacks.has(constructor)) this.callbacks.set(constructor, new constructor(this));
            const executor = this.callbacks.get(constructor)!;
            const name = getName(constructor);
            
            const preExecute = getPreExecute(constructor);
            const execute = getExecute(constructor);

            callbacks.add({
                name,
                execute,
                preExecute
            });
        }

        return callbacks;
    }
}