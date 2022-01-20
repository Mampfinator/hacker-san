import { Notification } from "calenddar-client";
import { DiscordAPIError } from "discord.js";
import { getCallbackRegistry, getName } from "../callbacks/Callback"

export const makeCallbackTypeList = () => {
    const callbacks = getCallbackRegistry();
    return [...callbacks].map(callback => getName(callback));
}

export const interpolate = (target: string, values: Record<string, string>): string => {
    let result = target;
    for (const [replace, replacer] of Object.entries(values)) {
        result = result.replaceAll(`{{${replace}}}`, replacer);
    }
    
    return result;
}

export const notificationToInterpolation = (notification: Notification) => {
    const {stream, post, vtubers} = notification;

    const values: Record<string, string> = {};

    values["vtuberName"] = vtubers[0].name;
    values["vtuberOriginalName"] = vtubers[0].originalName!;
    vtubers.forEach((vtuber, index) => {
        values[`vtuberName.${index+1}`] = vtuber.name;
        values[`vtuberOriginalName.${index + 1}`] = vtuber.originalName!;
    });

    if (stream) {
        let streamLink: string;
        switch(stream.platform) {
            case "youtube":
                streamLink = `https://youtube.com/watch?v=${stream.id}`; break;
            case "twitter":
                streamLink = `https://twitter.com/i/spaces/${stream.id}`; break;
            case "twitcasting":
                streamLink = `https://twitcasting.tv/videos/${stream.id}`; break;
            // TODO
            case "twitch":
                //streamLink = `https://twitch.tv/${vtubers[0].twitch.name}`; break;
        }
        values["streamLink"] = streamLink!

        if (stream.scheduledFor) values["startHammertime"] = `${stream.scheduledFor.valueOf()/1000}`;
    }

    return values;
}

export const ignore = (...functions: ((error: Error) => boolean | undefined)[]) => {
    return (error: Error) => {
        let caught = false;
        for (const func of functions) {
            if (func(error)) {
                caught = true;
                break;
            }
        }

        if (!caught) console.error(error);
    }
}

export const DAPIErrors = (error: Error) => {
    if (error instanceof DiscordAPIError) return true;
}

export const CalenddarErrors = (error: Error) => {
    //if (error instanceof CalenddarError) return true;
}