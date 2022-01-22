import {CallbackCommand} from "./CallbackCommand"
import {List} from "./List"
import { TriggerCallback } from "./TriggerCallback"
import { Status } from "./Status"
import { SettingsCommand } from "./Settings"
import { Upcoming } from "./Upcoming"
import { Live } from "./Live"

export const SlashCommands = [
    CallbackCommand,
    List,
    Status,
    TriggerCallback,
    SettingsCommand, 
    Upcoming,
    Live
]