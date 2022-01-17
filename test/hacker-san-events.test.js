"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mocha_1 = require("mocha");
const hacker_san_1 = require("../src/hacker-san");
const client = new hacker_san_1.HackerSan({ intents: [] });
(0, mocha_1.suite)("Hacker-san Events", () => {
    (0, mocha_1.test)("Handles interactionCreate without errors.", () => __awaiter(void 0, void 0, void 0, function* () {
        client.emit("interactionCreate", {
            isCommand: () => false,
            isAutocomplete: () => false
        });
    }));
});
