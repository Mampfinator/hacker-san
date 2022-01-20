import { AutocompleteInteraction, CommandInteraction, Interaction, InteractionReplyOptions, MessageEmbed, MessagePayload } from "discord.js";
import { RawMessagePayloadData } from "discord.js/typings/rawDataTypes";
import { HackerSan } from "../hacker-san";
import { SlashCommand, SlashCommandLoader } from "./SlashCommandLoader";

export class CommandNotFoundError extends Error {
    public interaction: CommandInteraction;
    constructor(interaction: CommandInteraction) {
        super(`Could not find command with name ${interaction.commandName}`);
        this.interaction = interaction;
    }
}

export class SlashCommandManager {
    private readonly loader: SlashCommandLoader 
    private commands!: Map<string, SlashCommand>;
    constructor(
        private readonly client: HackerSan
    ) {
        this.loader = new SlashCommandLoader(this);
        this.reload();
    }

    public reload() {
        this.commands = new Map([...this.loader.load()].map(command => [command.name, command]));
    }

    async register() {
        console.log(`Registering ${this.commands.size} commands. (${[...this.commands.values()].map(command => command.name).join(", ")})`);

        if (this.client.application?.partial) await this.client.application.fetch();
        if (!this.client.application) throw new Error("Client doesn't have an application! Can't register slash commands!");

        if (process.env.NODE_ENV !== "production" && process.env.DEBUG_GUILD_ID) var guildId = process.env.DEBUG_GUILD_ID;
        for (const {commandData} of this.commands.values()) {
            console.log(`Registering ${commandData.name}.`);
            await this.client.application?.commands.create(commandData.toJSON(), guildId!)
        }
    }

    async execute(interaction: CommandInteraction) {
        const {commandName: name} = interaction;
        const command = this.commands.get(name);
        if (!command) throw new CommandNotFoundError(interaction);
        if (command.autoDefer) await interaction.deferReply();
        
        return await command.execute(interaction);
    }

    async handle(interaction: Interaction) {
        if (interaction.isCommand()) await this.handleCommand(interaction);
        if (interaction.isAutocomplete()) await this.handleAutocomplete(interaction);
    }

    private async handleCommand(interaction: CommandInteraction) {
        const reply = await this.execute(interaction);
        if (!reply) return;

        let payload: RawMessagePayloadData;
        if (typeof reply === "string") {
            payload = {content: reply};
        } else {
            if (reply instanceof MessageEmbed) payload = {embeds: [reply.toJSON()]}
            else payload = reply;
        } 
        
        if (interaction.deferred || interaction.replied) await interaction.editReply(payload as InteractionReplyOptions);
        else interaction.reply(payload as InteractionReplyOptions);
    }

    private async handleAutocomplete(interaction: AutocompleteInteraction) {

    }
}