import { Client, ClientOptions } from "discord.js";
import { Client as CalenddarClient } from "calenddar-client";
import { SlashCommandManager } from "./slash-commands/SlashCommandManager";
import { CallbackManager } from "./callbacks/CallbackManager";
import type { HackerSanOptions } from "./command-line-optionts"; 
import { Sequelize } from "sequelize";
import { init } from "./orm";

export class HackerSan extends Client {
    readonly commands: SlashCommandManager;
    readonly settings?: unknown;
    readonly callbacks: CallbackManager;
    readonly calenddar: CalenddarClient;
    sequelize?: Sequelize;
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
        this.calenddar = new CalenddarClient();
    }

    async login(token?: string) {
        await init(this);
        await this.application?.fetch();
        
        await this.calenddar.start();
        this.callbacks.load();

        token = await super.login(token ?? process.env.DISCORD_TOKEN);
        if (!this.noCommands) await this.commands.register();
        return token;
    }
}