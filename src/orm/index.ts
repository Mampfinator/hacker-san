import { Callback } from "./Callback";
import { Settings } from "./Settings";
import { ReactionRole } from "./ReactionRole";
import {sequelize, init} from "./sequelize";
import { Autoreact } from "./Autoreact";

// do relation work here
Settings.hasMany(Callback, {foreignKey: "guildId"});
Settings.hasMany(ReactionRole, {foreignKey: "guildId"}); 
Settings.hasMany(Autoreact, {foreignKey: "guildId"});

export {
    Settings,
    Callback,
    ReactionRole,

    sequelize,
    init
}