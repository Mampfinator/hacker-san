import { HackerSan } from "../../hacker-san";
import { Callback, ICallback } from "../Callback";
import { DbCallback } from "../DbCallback";

@Callback({
    name: "echo",
    description: "Send a message!",
    customOptions: command => command.addStringOption(message => message
        .setName("message").setDescription("Message to send")),
    optionTransformer: (interaction) => ({
        message: interaction.options.get("message")?.value
    })
})
export class Echo implements ICallback {
    async execute(client: HackerSan, callback: DbCallback): Promise<void> {
        const channel = await client.channels.fetch(callback.channel);
    }
}