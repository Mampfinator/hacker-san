import { Client, ClientOptions } from "discord.js";
import { SlashCommandManager } from "./slash-commands/SlashCommandManager";
import { Connection, createConnection } from "typeorm";
import { CallbackManager } from "./callbacks/CallbackManager";
import type { HackerSanOptions } from "./command-line-optionts"; 

export class HackerSan extends Client {
    readonly commands: SlashCommandManager;
    readonly settings?: unknown;
    readonly callbacks: CallbackManager;
    connection?: Connection;
    
    private readonly noCommands?: boolean;


    constructor(options: ClientOptions & HackerSanOptions) {
        super(options);
        this.commands = new SlashCommandManager(this);
        this.callbacks = new CallbackManager(this);
        // this.settings = new SettingsManager(this);
        this.on("interactionCreate", interaction => {
            this.commands.handle(interaction);
        });

        this.noCommands = options["no-commands"];
    }

    async login(token?: string) {
        token = await super.login(token);

        this.connection = await createConnection({
            type: "mongodb",
            database: "hacker-san",
            url: process.env.MONGODB_URI,
        });

        await this.application?.fetch();
        if (!this.noCommands) await this.commands.register();
        //await this.settings.sync();

        return token;
    }
}