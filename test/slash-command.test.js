"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
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
const discord_js_1 = require("discord.js");
const mocha_2 = require("mocha");
const hacker_san_1 = require("../src/hacker-san");
const SlashCommand_1 = require("../src/slash-commands/SlashCommand");
const chai_1 = require("chai");
const SlashCommandManager_1 = require("../src/slash-commands/SlashCommandManager");
var client;
(0, mocha_2.beforeEach)(done => {
    client = new hacker_san_1.HackerSan({
        intents: []
    });
    // reset command registry
    for (const constructor of (0, SlashCommand_1.getCommandRegistry)()) {
        (0, SlashCommand_1.removeCommand)(constructor);
    }
    ;
    done();
});
(0, mocha_1.suite)("Slash Commands", () => {
    (0, mocha_1.test)("Finds right execute method.", () => __awaiter(void 0, void 0, void 0, function* () {
        const expectedReply = "Hi!";
        let TestExecuteCommand = class TestExecuteCommand {
            execute(interaction) {
                return __awaiter(this, void 0, void 0, function* () {
                    return expectedReply;
                });
            }
        };
        __decorate([
            (0, SlashCommand_1.Execute)(),
            __metadata("design:type", Function),
            __metadata("design:paramtypes", [discord_js_1.CommandInteraction]),
            __metadata("design:returntype", Promise)
        ], TestExecuteCommand.prototype, "execute", null);
        TestExecuteCommand = __decorate([
            (0, SlashCommand_1.SlashCommand)({ name: "test-command", description: "Test command!" })
        ], TestExecuteCommand);
        let NonDecoratedCommand = class NonDecoratedCommand {
            execute() {
                return expectedReply;
            }
        };
        NonDecoratedCommand = __decorate([
            (0, SlashCommand_1.SlashCommand)({ name: "non-decorated-execute", description: "Command that'll default to using SlashCommand#execute" })
        ], NonDecoratedCommand);
        client.commands.reload();
        yield client.commands.handle({
            commandName: "test-command",
            reply(reply) {
                (0, chai_1.expect)(reply.content).to.equal(expectedReply);
            },
            isCommand() { return true; },
            isAutocomplete() { return false; }
        });
        yield client.commands.handle({
            commandName: "non-decorated-execute",
            isCommand: () => true,
            isAutocomplete: () => false,
            reply(reply) {
                (0, chai_1.expect)(reply.content).to.equal(expectedReply);
            }
        });
    }));
    (0, mocha_1.test)("Finds right CanExecute method & calls it. Only calls execute if true.", () => __awaiter(void 0, void 0, void 0, function* () {
        let TestCanExecuteCommand = class TestCanExecuteCommand {
            execute(interaction) {
                return __awaiter(this, void 0, void 0, function* () {
                    throw new Error(`@CanExecute method's result is being ignored.`);
                });
            }
            canExecute(interaction) {
                return __awaiter(this, void 0, void 0, function* () {
                    return false;
                });
            }
        };
        __decorate([
            (0, SlashCommand_1.Execute)(),
            __metadata("design:type", Function),
            __metadata("design:paramtypes", [discord_js_1.CommandInteraction]),
            __metadata("design:returntype", Promise)
        ], TestCanExecuteCommand.prototype, "execute", null);
        __decorate([
            (0, SlashCommand_1.CanExecute)(),
            __metadata("design:type", Function),
            __metadata("design:paramtypes", [discord_js_1.CommandInteraction]),
            __metadata("design:returntype", Promise)
        ], TestCanExecuteCommand.prototype, "canExecute", null);
        TestCanExecuteCommand = __decorate([
            (0, SlashCommand_1.SlashCommand)({ name: "can-execute-command", description: "Test command!" })
        ], TestCanExecuteCommand);
        client.commands.reload();
        yield client.commands.handle({
            commandName: "can-execute-command",
            isCommand() { return true; },
            isAutocomplete() { return false; }
        });
    }));
    (0, mocha_1.test)("Finds the right command to execute between several commands. Throws an error on unknown command.", () => __awaiter(void 0, void 0, void 0, function* () {
        var hasExecuted = false;
        let GoodCommand = class GoodCommand {
            execute() {
                hasExecuted = true;
            }
        };
        __decorate([
            (0, SlashCommand_1.Execute)(),
            __metadata("design:type", Function),
            __metadata("design:paramtypes", []),
            __metadata("design:returntype", void 0)
        ], GoodCommand.prototype, "execute", null);
        GoodCommand = __decorate([
            (0, SlashCommand_1.SlashCommand)({ name: "good-command", description: "the command that *should* be executed." })
        ], GoodCommand);
        let BadCommand = class BadCommand {
            execute() {
                throw new Error("Wrong command is being executed!");
            }
        };
        __decorate([
            (0, SlashCommand_1.Execute)(),
            __metadata("design:type", Function),
            __metadata("design:paramtypes", []),
            __metadata("design:returntype", void 0)
        ], BadCommand.prototype, "execute", null);
        BadCommand = __decorate([
            (0, SlashCommand_1.SlashCommand)({ name: "bad-command", description: "the command that *should not* be executed" })
        ], BadCommand);
        client.commands.reload();
        yield client.commands.handle({
            commandName: "good-command",
            isCommand() { return true; },
            isAutocomplete() { return false; }
        });
        (0, chai_1.expect)(hasExecuted).to.be.true;
        yield client.commands.handle({
            commandName: "unknown-command",
            isCommand() { return true; },
            isAutocomplete() { return false; }
        }).catch(error => {
            if (!(error instanceof SlashCommandManager_1.CommandNotFoundError))
                throw error;
        });
    }));
    (0, mocha_1.test)("Maps return types of execute method properly.", () => __awaiter(void 0, void 0, void 0, function* () {
        let StringSlashCommand = class StringSlashCommand {
            execute() {
                return "string_return";
            }
        };
        __decorate([
            (0, SlashCommand_1.Execute)(),
            __metadata("design:type", Function),
            __metadata("design:paramtypes", []),
            __metadata("design:returntype", void 0)
        ], StringSlashCommand.prototype, "execute", null);
        StringSlashCommand = __decorate([
            (0, SlashCommand_1.SlashCommand)({ name: "string-command", description: "Command that returns a string." })
        ], StringSlashCommand);
        let EmbedSlashCommand = class EmbedSlashCommand {
            execute() {
                return new discord_js_1.MessageEmbed().setDescription("embed_return");
            }
        };
        __decorate([
            (0, SlashCommand_1.Execute)(),
            __metadata("design:type", Function),
            __metadata("design:paramtypes", []),
            __metadata("design:returntype", void 0)
        ], EmbedSlashCommand.prototype, "execute", null);
        EmbedSlashCommand = __decorate([
            (0, SlashCommand_1.SlashCommand)({ name: "embed-command", description: "Command that returns an embed." })
        ], EmbedSlashCommand);
        let MixedSlashCommand = class MixedSlashCommand {
            execute() {
                return {
                    content: "string_content",
                    embeds: [
                        new discord_js_1.MessageEmbed().setDescription("embed_content")
                    ]
                };
            }
        };
        __decorate([
            (0, SlashCommand_1.Execute)(),
            __metadata("design:type", Function),
            __metadata("design:paramtypes", []),
            __metadata("design:returntype", void 0)
        ], MixedSlashCommand.prototype, "execute", null);
        MixedSlashCommand = __decorate([
            (0, SlashCommand_1.SlashCommand)({ name: "mixed-command", description: "Command that returns raw payload." })
        ], MixedSlashCommand);
        client.commands.reload();
        yield client.commands.handle({
            commandName: "string-command",
            isCommand() { return true; },
            isAutocomplete() { return false; },
            reply(payload) {
                const { content, embeds } = payload;
                (0, chai_1.expect)(content).to.equal("string_return");
                (0, chai_1.expect)(embeds).to.be.undefined;
            }
        });
        yield client.commands.handle({
            commandName: "embed-command",
            isCommand() { return true; },
            isAutocomplete() { return false; },
            reply(payload) {
                const { content, embeds } = payload;
                (0, chai_1.expect)(content).to.be.undefined;
                (0, chai_1.expect)(embeds).length(1);
                (0, chai_1.expect)(embeds[0].description).to.equal("embed_return");
            }
        });
        yield client.commands.handle({
            commandName: "mixed-command",
            isCommand() { return true; },
            isAutocomplete() { return false; },
            reply(payload) {
                const { content, embeds } = payload;
                (0, chai_1.expect)(content).to.equal("string_content");
                (0, chai_1.expect)(embeds).length(1);
                (0, chai_1.expect)(embeds[0].description).to.equal("embed_content");
            }
        });
    }));
    (0, mocha_1.test)("Automatically defers replies if needed.", (done) => {
        let DeferCommand = class DeferCommand {
            execute() {
                return "dummy return";
            }
        };
        __decorate([
            (0, SlashCommand_1.Execute)(),
            __metadata("design:type", Function),
            __metadata("design:paramtypes", []),
            __metadata("design:returntype", void 0)
        ], DeferCommand.prototype, "execute", null);
        DeferCommand = __decorate([
            (0, SlashCommand_1.SlashCommand)({ name: "defer", description: "Command with autoDefer", autoDefer: true })
        ], DeferCommand);
        client.commands.reload();
        client.commands.handle({
            commandName: "defer",
            deferred: false,
            isCommand: () => true,
            isAutocomplete: () => false,
            deferReply() {
                this.deferred = true;
                // deferReply sets replied to true as well, since it's *technically* a reply.
                this.replied = true;
            },
            editReply(payload) {
                done();
            }
        });
    });
    // TODO: actually write autocomplete logic
    (0, mocha_1.test)("Handles autocompletes", () => __awaiter(void 0, void 0, void 0, function* () {
        yield client.commands.handle({
            isCommand() { return false; },
            isAutocomplete() { return true; }
        });
    }));
});
