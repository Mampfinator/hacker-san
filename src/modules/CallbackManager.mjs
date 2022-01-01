import EventEmitter from "events";
import {Db} from "mongodb";
import {Guild} from "discord.js";
import uuid from "uuid";
import { Collection } from "@discordjs/collection";
/**
 * @typedef {object} CallbackHelper
 * @prop    {string} name
 * @prop    {function} execute
 * @prop    {function} makeOptions
 */

/**
 * @class
 */
// TODO: Add support for CallbackHelper.buildParameters to streamline slash command creation.
class CallbackManager extends EventEmitter {
    /**
     * @type {Map<string, CallbackHelper>}
     */
    types = new Map();
    /**
     * @param {Db} db - the MongoDB Db object.
     */
    constructor(client) {
        super();
        this.client = client;
        this.db = client.db;
    }
    
    /**
     * @param {object} callback 
     */
    async add(callback) {
        let exists = true, _id;
        while (exists) {
            _id = uuid()
            // make absolutely sure there are no ID overlaps
            exists = await this.db.collection("callbacks").findOne({_id});
        }
        callback._id = _id;

        this.db.collection("callbacks").insertOne(callback);

        return _id;
    }

    addType(name, makeOptions, execute) {
        if (typeof name === "object") ({name, makeOptions, execute} = name);
        this.types.set(name, {name, makeOptions, execute});
    }

    /**
     * @param {Guild} guild
     * @param {object} event - event as received from the API
     * @param {string} vtuber
     */
    async execute(guild, trigger, data, vtubers) {
        let settings = await this.client.settings.fetch(guild.id);
        let callbacks = new Collection();
        for (const callback of settings.get("callbacks")) callbacks.set(callback, true); // construct the Map in the order the settings dictate
        // set the values of the Map
        let dbCallbacks = await this.db.collection("callbacks").find({guild: guild.id, trigger, vtuber: vtubers});
        await dbCallbacks.forEach(callback => {callbacks.set(callback._id, callback)});

        for (const callback of callbacks.filter(v => typeof v !== "boolean").values()) {
            try {await this.types.get(callback.type).execute(this.client, callback, data);}
            catch(error) {
                console.error(error);
            }
        }
    }

    /**
     * 
     * @typedef {object} CallbackManagerFetchOptions 
     * @prop {string} guild
     * @prop {string} vtuber
     * @prop {string} trigger
     */
    /**
     * @param {CallbackManagerFetchOptions} fetchOptions 
     * @returns 
     */
    async fetch(fetchOptions) {
        let order = new Map((await this.client.settings.fetch(fetchOptions.guild)).get("callbacks")?.map(id => [id, true]));
        let pointer = await this.db.collection("callbacks").find(fetchOptions);
        await pointer.forEach(callback => order.set(callback._id, callback));

        return [...order.values()].filter(c => typeof c !== "boolean");
    }

    async remove(_id) {
        let callback = await this.db.collection("callbacks").findOne({_id});
        if (!callback) return false;
        await this.db.collection("callbacks").deleteOne({_id});
        let settings = await this.client.settings.fetch(callback.guild);
        await settings.set("callbacks", settings.get("callbacks")?.filter(id => id !== _id));
        return callback;
    }
}

export default CallbackManager;