"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventLoader = void 0;
class EventLoader {
    load(target, events, additionalArgs = []) {
        for (const event of events) {
            target[event.once ? "once" : "on"](event.name, (...args) => Reflect.apply(event.execute, undefined, [...args, ...additionalArgs]));
        }
    }
}
exports.EventLoader = EventLoader;
