import { CommandInteraction, Interaction, InteractionReplyOptions, MessageEmbed, MessagePayload } from "discord.js";
import { RawMessagePayloadData } from "discord.js/typings/rawDataTypes";
import { HackerSan } from "../hacker-san";
import { SlashCommand, SlashCommandLoader } from "./SlashCommandLoader";

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
        if (this.client.application?.partial) await this.client.application.fetch();
        for (const {commandData} of this.commands.values()) {
            await this.client.application?.commands.create(commandData.toJSON())
        }
    }

    async execute(interaction: CommandInteraction) {
        const {commandName: name} = interaction;
        const command = this.commands.get(name);
        if (!command) return console.error(`no command with name ${name} found. :LutoSweat:`);
        return await command.execute(interaction);
    }

    async handle(interaction: Interaction) {
        if (!interaction.isCommand()) return;
        const result = await this.execute(interaction);
        
        
        if (result && !interaction.replied) {
            let payload: RawMessagePayloadData;
            if (typeof result === "string") payload = {content: result};
            else {
                if (result instanceof MessageEmbed) payload = {embeds: [result.toJSON()]}
                else payload = result;
            } 

            await interaction.reply(payload as unknown as InteractionReplyOptions);
        }


    }

    test(fake: any) {
        this.handle(fake as unknown as Interaction)
    }
}