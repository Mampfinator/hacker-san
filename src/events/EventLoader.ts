import {EventEmitter} from "events";

export interface Event {
    name: string;
    execute: (...args: any[]) => void | Promise<void>;
    once?: boolean;
}

type CanListenToEvents = {on: (event: string, listener: (...args: any[]) => void, ...args: any[]) => any, once: (event: string, listener: (...args: any[]) => void, ...args: any[]) => any} | EventEmitter;

export class EventLoader {
    load(target: CanListenToEvents, events: Event[], additionalArgs: any[] = []) {
        for (const event of events) {
            target[event.once ? "once" : "on"](event.name, (...args: any[]) => Reflect.apply(event.execute, undefined, [...args, ...additionalArgs]));
        }
    }
}