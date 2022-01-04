import { CalenddarNotification } from "../../calenddar/types";
import { HackerSan } from "../../hacker-san";
import { BeforeAll, Callback, ICallback } from "../Callback";
import { DbCallback } from "../DbCallback";

@Callback({
    name: "notify",
    description: "Notification for live streams & posts",
})
export class NotificationCallback implements ICallback, BeforeAll{
    execute(client: HackerSan, callback: DbCallback, data: CalenddarNotification<any, any>, beforeAllData?: any): void | Promise<void> {
        
    }

    beforeAll(client: HackerSan, data: CalenddarNotification<any, any>) {
        /*return Promise.all(
            data.vtubers.map(id => client.calenddar.vtubers.fetch(id))
        )*/
    }
}