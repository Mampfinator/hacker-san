import { GuildCreateEvent } from "./guildCreate";
import { InteractionCreateEvent } from "./interactionCreate";
import { ReadyEvent } from "./ready";

export const BotEvents = [
    ReadyEvent,
    GuildCreateEvent,
    InteractionCreateEvent
];