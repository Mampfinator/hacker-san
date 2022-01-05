import { suite, test } from "mocha";
import { Interaction } from "discord.js";
import { HackerSan } from "../src/hacker-san";

const client = new HackerSan({intents: []});

suite("Hacker-san Events", () => {

    test("Handles interactionCreate without errors.", async () => {
        client.emit("interactionCreate", {
            isCommand: () => false,
            isAutocomplete: () => false
        } as Interaction);
    });
});