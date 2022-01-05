import { CommandInteraction } from "discord.js";
import { SlashCommand } from "../SlashCommand";

@SlashCommand({
    name: "test",
    description: "Test Command"
})
export class Test {
    constructor() {}

    async execute(interaction: CommandInteraction): Promise<string> {
        interaction.replied = true;
        return this.generateReply("Tested!");
    }


    async generateReply(reply: string) {
        return `Your reply is: ${reply}`;
    }
}