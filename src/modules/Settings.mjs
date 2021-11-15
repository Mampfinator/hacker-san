import { Guild } from "discord.js";
import Collection from "@discordjs/collection";
import {Db} from "mongodb";

class SettingsManager {
    cache = new Collection();
    specialOptions = new Map();

    constructor(client) {
        this.client = client;
        /**
         * @type {Db}
         */
        this.db = client.db;
    }

    addSpecial(name, saver, loader) {
        this.specialOptions.set(name, {saver, loader});
    }

    /**
     * @param {Guild|string} guildId 
     * @param {boolean} forceFetch 
     * @returns 
     */
    async fetch(guildId, forceFetch = false) {
        if (guildId?.id) guildId = guildId.id;
        if (forceFetch || !this.cache.get(guildId)) return new Settings(this, {guild: guildId}).fetch();
        else return this.cache.get(guildId);
    }
}

class Settings {
    /**
     * @protected
     * @type {Map<string, any>}
     */
    __settings;
    constructor(manager, data) {

        Object.defineProperty(this, "__settings", {value: new Map()});

        this.manager = manager;
        this.client = manager.client;
        this.db = manager.db;

        this.build(data);
        this.manager.cache.set(this.id, this);
    }

    async fetch() {
        let data = await this.db.collection("settings").findOne({guild: this.id});
        if(!data) {
            await this.db.collection("settings").insertOne({guild: this.id});
            await this.db.collection("settings").findOne({guild: this.id});
        }
        console.log(data);
        this.build(data);
        this.manager.cache.set(this.id, this);
    }

    /**
     * @protected
     * @param {object} data
     */
    build(data) {
        this.id = data.guild;
        for (const [key, value] of Object.entries(data)) {
            this.__settings.set(key, value);
        }
    }

    get(option) {
        let value = this.__settings.get(option);
        if (this.manager.specialOptions.has(option)) value = this.manager.specialOptions.get(option).loader(value);
        return value; 
    }

    async set(option, value, autoSave = true) {
        this.__settings.set(option, value);
        if (autoSave) await this.save();
    }

    async save() {
        let struct = {};
        for (let [option, value] of this.__settings) {
            if (this.manager.specialOptions.has(option)) value = this.manager.specialOptions.get(option).saver(value);
            struct[option] = value; 
        }

        await this.db.collection("settings").updateOne({guild: this.id}, {$set: struct})
    }
}

export {SettingsManager, Settings};