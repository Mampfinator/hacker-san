import { HackerSan } from "../../hacker-san";
import {IEvent} from "../EventLoader";

export const WelcomeCalenddarEvent = {
    name: "welcome",
    once: true,
    async execute(_: never, _2: never, client: HackerSan) {
        const vtubers = await client.calenddar.vtubers.fetchAll();
        console.log(`Fetched VTubers: ${vtubers.length}`);
    }
} as IEvent;