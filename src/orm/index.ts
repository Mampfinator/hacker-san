import { Callback } from "./Callback";
import { Settings } from "./Settings";
import { ReactionRole } from "./ReactionRole";
import {sequelize, init} from "./sequelize";

// do relation work here
Settings.hasMany(Callback, {foreignKey: "guildId"});
Settings.hasMany(ReactionRole, {foreignKey: "guildId"}); 


export {
    Settings,
    Callback,
    ReactionRole,

    sequelize,
    init
}