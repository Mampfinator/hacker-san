import {sequelize} from "./sequelize";
import { Model, DataTypes } from "sequelize";

export class Settings extends Model {
    readonly guildId!: string;
    private modRoles!: string;

    getModRoles() {
        return this.modRoles.split(",").filter(r => r && r !== "");
    }

    private setModRoles(roles: string[]) {
        this.modRoles = roles.join(",");
    }

    removeModRole(roleId: string) {
        this.setModRoles(
            this.getModRoles().filter(role => role !== roleId)
        );
    }

    addModRole(role: string) {
        const roles = new Set([...this.getModRoles(), role]);
        this.setModRoles([...roles]);
    }
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
        }
    }, 
    {
        sequelize, 
        timestamps: false
    }
)