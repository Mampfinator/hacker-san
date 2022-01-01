import WebSocket from "ws";
import EventEmitter from "events";
import {GraphQLClient} from "graphql-request"

/**
 * [Calenddar](https://github.com/Mampfinator/calenddar) API Client.
 */
export default class CalenddarClient extends EventEmitter {
    constructor(options) {
        super();
        /**
         * @private
         */

        this.__prereadyTasks = [];
        this.__prereadyTasks.push(new Promise(res => this.on("welcome", res)));

        /**
         * @type {WebSocket}
         */
        this.ws = new WebSocket("wss://api.calenddar.de");
        this.gql = new GraphQLClient("https://api.calenddar.de/graphql");
        
        this.ws.on("message", message => {
            try {
                message = JSON.parse(message);
            } catch (error) {
                return console.error(error);
            }

            const {event, vtubers, platform, data} = message;
            this.emit(event, data, {vtubers, platform});
        });
    }

    async search(text, limit, fields = ["id", "name", "originalName", "youtubeId", "twitchId"]) {
        if (!text) return [];
        const query = `
        query {
            vtubers:search(text:"${text}") {
                ${fields.join("\n")}
            }
        }`

        const response = (await this.gql.request(query)).vtubers;

        if (!limit) return response;
        else return response.slice(0, limit);
    }

    async getVtuberById(id, fields = ["id", "name", "originalName", "youtubeId", "twitchId"]) {
        const query = `
            query {
                vtuber(id:"${id}") {
                    ${fields.join("\n")}
                }
            }
        `
        return (await this.gql.request(query)).vtuber;
    }


    async initialize() {
        await Promise.all(this.__prereadyTasks);
        delete this.__prereadyTasks;

        this.emit("ready", this);
    }
}