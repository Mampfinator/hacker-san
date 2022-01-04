import "./polyfills";

import {Client, ClientOptions, Intents, Interaction} from "discord.js";
import { SlashCommandManager } from "./slash-commands/SlashCommandManager";
import { EventLoader } from "./events/EventLoader";
import { BotEvents } from "./events/bot-events";
import { Connection, createConnection } from "typeorm";

export class HackerSan extends Client {
    readonly commands: SlashCommandManager;
    readonly settings?: unknown;
    readonly callbacks?: unknown;
    connection?: Connection;
    
    constructor(options: ClientOptions) {
        super(options);
        this.commands = new SlashCommandManager(this);
        // this.settings = new SettingsManager(this);
        // this.callbacks = new CallbacksManager(this);
    }

    async login(token?: string) {
        token = await super.login(token);

        this.connection = await createConnection({
            type: "mongodb",
            database: "hacker-san",
            url: process.env.MONGODB_URI,
        });

        await this.application?.fetch();
        await this.commands.register();
        //await this.settings.sync();

        return token;
    }
}

const client = new HackerSan({
    intents: [
        Intents.FLAGS.GUILDS, 
        Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.GUILD_WEBHOOKS
    ]
});
new EventLoader().load(client, BotEvents, [client]);


client.commands.test({
    isCommand() {return true},
    commandName: "list",
    reply(response: any) {
        console.log("Response: ", response);
    },
    options: {
        getSubcommand() {
            return "callbacks";
        },
        get(option: string) {
            
        }
    }
});

import {CommandLineOptions} from "./command-line-optionts"; 
if (!CommandLineOptions["no-login"]) client.login();