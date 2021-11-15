import {interpolateString} from "../util/util.mjs";

export default {
    name: "notify",
    async execute(client, callback, data) {
        
        console.log(data);
        let channel = await client.channels.fetch(callback.channel);
        let substitutions = {
            channel: channel.toString(),
            channelid: channel.id
        };
        switch (data.platform) {
            case "youtube":
                substitutions["streamlink"] = `https://www.youtube.com/watch?v=${data.id}`;
                substitutions["channellink"] = `https://www.youtube.com/channel/${data.channel_id}`;
                break;
            case "twitch":
                break;
        }

        if (callback.custom_message) interpolateString(callback.custom_message, substitutions);

        let message = `${callback.pingrole ? "<@&" + callback.pingrole + ">\n" : ""}${callback.custom_message ? callback.custom_message + "\n" : ""}${substitutions.streamlink}`
        
        await channel.send(message);
    },
    makeOptions(interaction) {
        return {
            pingrole: interaction.options.get("pingrole")?.role?.id,
            custom_message: interaction.options.get("custom_message")?.value
        }
    }
}