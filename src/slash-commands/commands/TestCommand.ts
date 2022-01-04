import { CommandInteraction } from "discord.js";
import { ISlashCommand, SlashCommand } from "../SlashCommand";

@SlashCommand({
    name: "test",
    builder: builder => builder.setDescription("Test command to see if my @SlashCommand decorator works.")
})
export class TestCommand implements ISlashCommand {
    constructor() {}

    async execute(interaction: CommandInteraction): Promise<string> {
        interaction.replied = true;
        return this.generateReply("Tested!");
    }


    async generateReply(reply: string) {
        return `Your reply is: ${reply}`;
    }
}