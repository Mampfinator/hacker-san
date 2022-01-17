import { HackerSan } from "../../hacker-san";
import { Execute } from "../../slash-commands/SlashCommand";
import { Callback, PreExecute } from "../Callback";
import { Callback as DbCallback } from "../../orm";

@Callback({
    name: "notify",
    description: "Notification for live streams & posts"
})
export class Notification{
    @Execute()
    execute(client: HackerSan, callback: DbCallback, data: any, customData: string): void | Promise<void> {
        
    }

    @PreExecute()
    passData(client: HackerSan, data: any) {
        return `I'm custom data!`;
    }
}