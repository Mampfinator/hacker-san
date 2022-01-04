import "dotenv";
import "reflect-metadata";

// FIXME: ugly stopgap to force TypeScript to emit the import statements.
import { Commands } from "./slash-commands/commands";
console.log(`Loaded ${Commands.length} commands!`);