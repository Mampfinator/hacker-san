import { Sequelize } from "sequelize";
import { HackerSan } from "../hacker-san";

export const sequelize = new Sequelize("sqlite:hacker-san.sqlite", {logging: false});
export const init = async (client: HackerSan) => {
    client.sequelize = sequelize;
    await sequelize.sync();
}