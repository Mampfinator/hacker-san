import {config} from "dotenv";
config();

import {Client, Intents} from "discord.js";
import { MongoClient, Db } from "mongodb";

import {SlashCommandManager, SettingsManager, CallbackManager, CalenddarClient} from "./modules/index.mjs";

import {dirname} from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));

const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_WEBHOOKS]
});

import * as commands from "./commands/index.mjs";
import * as events from "./events/index.mjs";
import * as callbacks from "./callbacks/index.mjs";
import * as calenddarEvents from "./events/calenddar/index.mjs";
(async () => {
    client.db = (await new MongoClient(process.env.DATABASE_CONNECTION_STRING).connect()).db("hacker-san");

    client.commands = new SlashCommandManager(client);
    client.settings = new SettingsManager(client);
    client.callbacks = new CallbackManager(client);
    client.calenddar = new CalenddarClient();

    // add slash commands
    for (const command of Object.values(commands)) {
        client.commands.add(command);
    }

    // add client event listeners
    for (const event of Object.values(events)) {
        client[event.once ? "on" : "once"](event.name, (...args) => {event.execute(...args, client)});
    }

    // add calenddar event listeners
    for (const event of Object.values(calenddarEvents)) {
        client.calenddar.on(event.name, (...args) => {event.execute(client, ...args)});
    }

    // add callback types
    for (const callback of Object.values(callbacks)) {
        client.callbacks.addType(callback);
    }

})().then(async () => {
    await client.login();
});