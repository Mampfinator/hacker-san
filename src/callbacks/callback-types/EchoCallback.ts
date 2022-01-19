import { HackerSan } from "../../hacker-san";
import { Callback } from "../Callback";
import { Callback as DbCallback } from "../../orm";
import { Builder, Execute } from "../../slash-commands/SlashCommand";
import { SlashCommandBuilder } from "@discordjs/builders";

@Callback({
    name: "echo",
    description: "Send a message!"
})
export class Echo {
    @Execute()
    async execute(client: HackerSan, callback: DbCallback): Promise<void> {
        const channel = await client.channels.fetch(callback.channelId);
    }

    @Builder()
    extendOptions(builder: SlashCommandBuilder) {
        return builder.addStringOption(message => message
            .setName("message")
            .setDescription("Message to be sent to the channel.")    
        )
    }
}