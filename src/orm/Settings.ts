import {sequelize} from "./sequelize";
import { Model, DataTypes } from "sequelize";

class ArrayManager {    
    constructor(
        public readonly settings: Settings,
        private readonly getter: (settings: Settings) => string,
        private readonly setter: (settings: Settings, value: string) => void
    ) {}
    
    get() {
        return this.getter(this.settings).split(",").filter(e => e && e !== "");
    }

    set(elements: string[]) {
        this.setter(this.settings, elements.join(","));
    }

    remove(element: string) {
        this.set(
            this.get().filter(e => e !== element)
        )
    }

    add(element: string) {
        this.set([...new Set([...this.get(), element])])
    }
}

class SettingsModRoles extends ArrayManager {
    constructor(
        settings: Settings
    ) {
        super(
            settings,
            (settings) => settings.modRoles,
            (settings, value) => {settings.modRoles = value}
        )
    }
}

class SettingsGuildMainVTubers extends ArrayManager {
    constructor(
        settings: Settings
    ) {
        super(
            settings,
            (settings) => settings.mainVtubers,
            (settings, value) => settings.mainVtubers = value
        )
    }
} 

export class Settings extends Model {
    public readonly roles: SettingsModRoles; 
    public readonly vtubers: SettingsGuildMainVTubers;

    constructor(values?: any, options?: any) {
        super(values, options);
        this.roles = new SettingsModRoles(this);
        this.vtubers = new SettingsGuildMainVTubers(this);
    }
    readonly guildId!: string;
    /**
     * @internal
     */
    public modRoles!: string;
    /**
     * @internal
     */
    public mainVtubers!: string;
}

Settings.init(
    {
        guildId: {
            primaryKey: true,
            unique: true,
            type: DataTypes.STRING
        },
        modRoles: {
            type: DataTypes.STRING, 
            defaultValue: ""
        },
        mainVtubers: {
            type: DataTypes.STRING,
            defaultValue: ""
        }
    }, 
    {
        sequelize, 
        timestamps: false
    }
)