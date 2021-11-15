import fetch from "node-fetch";
import WebSocket from "ws";
import EventEmitter from "events";

/**
 * @param {object} caller 
 * @param {Function} func 
 * @returns {Function}
 */
let wrap = (caller, func) => (...args) => func.apply(caller, args);
let wrapObject = (caller, obj) => {
    let newObj = {};
    for (const [key, func] of Object.entries(obj)) newObj[key] = wrap(caller, func);
    return newObj;
}

/**
 * Calenddar API Client.
 */
export default class Calenddar extends EventEmitter {
    constructor(options) {
        super();
        /**
         * @private
         */
        this.__baseUrl = `api.calenddar.de/`;

        this.__prereadyTasks = [];
        this.__prereadyTasks.push(new Promise(res => this.on("welcome", res)));

        /**
         * @type {WebSocket}
         */
        this.ws = new WebSocket(`${this.__makeUrl("ws", {parameters: options?.wsParameters, protocol: "wss"})}`);

        //FIXME: Fix client not attempting to reconnect when the server silently closes the connection.
        this.ws.on("message", (d, isBinary) => {
            let message = JSON.parse(d);

            let {event, data} = message;
            let [platform, eventName] = event.split(":").map(entry => entry.toLowerCase());
            // in the case of system messages
            if (!eventName) {
                eventName = platform;
                platform = undefined;
            }
            eventName.replaceAll("_", "-");


            this.emit(eventName, {platform, ...data});
        });

        // TODO: find better way of doing this
        this.vtubers = wrapObject(this, Calenddar.vtubers);
        this.youtube = wrapObject(this, Calenddar.youtube);
    }

    /**
     * Returns a request string for use with a REST-like API
     * @param {string} path
     * @param {object} options
     * @param {object?} options.parameters
     * @param {string?} options.protocol
     * @returns {string} - the formatted request string
     */
    __makeUrl(path, options = {}) {
        let base = ((options.protocol ?? "https") + "://") + this.__baseUrl + path.replace(/^[/\\]|[/\\]$/, "");
        let {parameters} = options; 
        let params = typeof parameters === "object" ? [...Object.entries(parameters)] : [];
        if (params.length == 0) return base;
        
        let [i, j] = params.shift();
        let req = `${base}?${i}=${j}`;
    
    
        for (const [param, value] of params) {
            req += `&${param}=${value}`;
        }
    
        return req;
    }

    /**
     * @param {string} url 
     * @returns {object}
     */
    async fetch(url) {
        return (await fetch(url)).json();
    }
    
    /**
     * @private
     */
    static vtubers = {
        /**
         * @param {string} id 
         * @returns 
         */
        async get(id) {
            return this.fetch(this.__makeUrl(`vtubers`, {parameters: {id}})); 
        },
        async findByName(name) {
            return this.fetch(this.__makeUrl(`vtubers/find`, {parameters: {name}}));
        },
        async findByYoutubeId(id) {
            return this.fetch(this.__makeUrl(`vtubers/find`, {parameters: {youtube: id}}));
        },
        async findByTwitchId(id) {
            return this.fetch(this.__makeUrl(`vtubers/find`), {parameters: {twitch: id}});
        }
    }
    /**
     * @private
     */
    static youtube = {
        async getChannel(id) {
            return this.fetch(this.__makeUrl(`youtube/channel`, {parameters: {id}}));
        },
        async getVideo(id) {
            return this.fetch(this.__makeUrl(`youtube/video`, {parameters: {id}}));
        }
    }

    async initialize() {
        await Promise.all(this.__prereadyTasks);
        delete this.__prereadyTasks;

        this.emit("ready", this);
    }
}