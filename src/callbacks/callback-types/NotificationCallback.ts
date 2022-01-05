import { CalenddarNotification } from "../../calenddar/types";
import { HackerSan } from "../../hacker-san";
import { Execute } from "../../slash-commands/SlashCommand";
import { Callback, PreExecute } from "../Callback";
import { DbCallback } from "../DbCallback";

@Callback({
    name: "notify",
    description: "Notification for live streams & posts"
})
export class Notification{
    @Execute()
    execute(client: HackerSan, callback: DbCallback, data: CalenddarNotification<any, any>, customData: string): void | Promise<void> {
        
    }

    @PreExecute()
    passData(client: HackerSan, data: CalenddarNotification<any, any>) {
        return `I'm custom data!`;
    }
}