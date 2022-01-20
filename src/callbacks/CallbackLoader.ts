import { RawMessagePayloadData } from "discord.js/typings/rawDataTypes";
import { Constructable } from "../slash-commands/SlashCommand";
import { getCallbackRegistry, getMakeData, getExecute, getName, getPreExecute } from "./Callback";
import { CallbackManager } from "./CallbackManager";
import { Callback as DbCallback } from "../orm";
import { HackerSan } from "../hacker-san";
import { Notification } from "calenddar-client";
import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";

export interface Callback {
    name: string;
    execute: (client: HackerSan, notification: Notification, callback: DbCallback, preExecuteData?: any) => Promise<RawMessagePayloadData>;
    preExecute?: (client: HackerSan, notification: Notification) => any;
    makeData?: (builder: CommandInteraction) => Record<string, any>;
}

export class CallbackLoader {
    public callbacks = new WeakMap<Constructable, object>();
    public reversedCallbacks = new WeakMap<object, Constructable>(); 

    constructor(
        public readonly manager: CallbackManager
    ) {}

    load() {
        const registry = getCallbackRegistry();
        const callbacks = new Set<Callback>(); 

        for (const constructor of registry) {
            if (!this.callbacks.has(constructor)) {
                const instance = new constructor(this.manager.client);
                this.callbacks.set(constructor, instance);
                this.reversedCallbacks.set(instance, constructor);
            }

            const executor = this.callbacks.get(constructor)!;
            const name = getName(constructor);
            const preExecute = getPreExecute(constructor);
            const execute = getExecute(constructor);
            const makeData = getMakeData(constructor);

            callbacks.add({
                name,
                execute,
                preExecute,
                makeData
            });
        }

        return callbacks;
    }
}