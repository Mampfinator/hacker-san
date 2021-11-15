import {config} from "dotenv";
config();

import {Client, Intents} from "discord.js";
import { MongoClient, Db } from "mongodb";

//import * as configOptions from "./config.json";

import {SlashCommandManager, SettingsManager, CallbackManager, Calenddar} from "./modules/index.mjs";

import {dirname} from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * @typedef {object} CustomClient
 * @property {SlashCommandManager} commands
 * @property {SettingsManager} settings
 * @property {Calenddar} calenddar
 * @property {Db} db
 * @property {CallbackManager} callbacks
 */

/**
 * @type {Client & CustomClient}
 */
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
    client.calenddar = new Calenddar();

    for (const command of Object.values(commands)) {
        client.commands.add(command);
    }

    for (const event of Object.values(events)) {
        client[event.once ? "on" : "once"](event.name, (...args) => {event.execute(...args, client)});
    }

    for (const event of Object.values(calenddarEvents)) {
        client.calenddar.on(event.name, (...args) => {event.execute(...args, client)});
    }

    for (const callback of Object.values(callbacks)) {
        client.callbacks.addType(callback);
    }

})().then(async () => {
    await client.login();
});