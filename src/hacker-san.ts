import { Client, ClientOptions } from "discord.js";
import { SlashCommandManager } from "./slash-commands/SlashCommandManager";
import { CallbackManager } from "./callbacks/CallbackManager";
import type { HackerSanOptions } from "./command-line-optionts"; 
import { Sequelize } from "sequelize/dist";
import { init } from "./orm";

export class HackerSan extends Client {
    readonly commands: SlashCommandManager;
    readonly settings?: unknown;
    readonly callbacks: CallbackManager;
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
    }

    async login(token?: string) {
        await init(this);

        token = await super.login(token ?? process.env.DISCORD_TOKEN);

        await this.application?.fetch();
        if (!this.noCommands) await this.commands.register();

        return token;
    }
}