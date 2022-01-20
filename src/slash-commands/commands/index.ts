import {CallbackCommand} from "./CallbackCommand"
import {List} from "./List"
import { TriggerCallback } from "./TriggerCallback"
import { Status } from "./Status"
import { SettingsCommand } from "./Settings"

export const SlashCommands = [
    CallbackCommand,
    List,
    Status,
    TriggerCallback,
    SettingsCommand
]