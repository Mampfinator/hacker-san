import { HackerSan } from "../../hacker-san";
import { Callback } from "../Callback";
import { Callback as DbCallback } from "../../orm";

@Callback({
    name: "echo",
    description: "Send a message!"
})
export class Echo {
    async execute(client: HackerSan, callback: DbCallback): Promise<void> {
        const channel = await client.channels.fetch(callback.channelId);
    }
}