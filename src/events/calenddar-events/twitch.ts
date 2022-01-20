import { Notification } from "calenddar-client";
import { HackerSan } from "../../hacker-san";
import { IEvent } from "../EventLoader";

export const AnyTwitch = {
    name: "*.twitch",
    once: false,
    async execute(notification: Notification, client: HackerSan) {
        console.log("Got a Twitch event!");
        client.callbacks.handle(notification);
    }
} as IEvent;