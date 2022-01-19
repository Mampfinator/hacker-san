import "./polyfills";

import { Intents } from "discord.js";
import { HackerSan } from "./hacker-san";
import { BotEvents } from "./events/bot-events";
import { CommandLineOptions } from "./command-line-optionts";
import { EventLoader } from "./events/EventLoader";
import { CalenddarEvents } from "./events/calenddar-events";

const client = new HackerSan({
    intents: [
        Intents.FLAGS.GUILDS, 
        Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.GUILD_WEBHOOKS
    ]
});
new EventLoader()
    .load(client, BotEvents, [client])
    .load(client.calenddar, CalenddarEvents, [client]);


if (!CommandLineOptions["no-login"]) client.login();