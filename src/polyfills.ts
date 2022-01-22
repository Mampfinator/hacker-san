import {config} from "dotenv"; config();
import "reflect-metadata";
import "./slash-commands/commands";
import "./callbacks/callback-types";
import "./autocomplete/autocompletes";


import { writeFile } from "fs";
const writeError = (error: Error) => {
    const fileName = `${error.name}.${error.name}.json`;
    try {
        writeFile(`${__dirname}/../log/${fileName}.log`, `Uncaught exception occured at ${new Date().toISOString()}!\n\n${error}`, () => {
            console.log(`Uncaught exception occured! Check ${fileName} in log directory for more info.`)
        });
    } catch {}
    console.error(error);
}
process.on("uncaughtException", writeError);
process.on("unhandledRejection", writeError);