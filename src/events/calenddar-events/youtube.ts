import { Notification } from "calenddar-client";
import { HackerSan } from "../../hacker-san";
import {IEvent} from "../EventLoader";

export const AnyYouTube = {
    name: "*.youtube",
    once: false,
    async execute(notification: Notification, client: HackerSan) {
        client.callbacks.handle(notification);
    }
} as IEvent;