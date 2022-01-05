import {suite, test} from "mocha";
import { ClientUser, CommandInteraction, Interaction, MessageEmbed } from "discord.js";
import { beforeEach } from "mocha";
import { HackerSan } from "../src/hacker-san";
import { CanExecute, Execute, getCommandRegistry, removeCommand, SlashCommand } from "../src/slash-commands/SlashCommand";
import { expect } from "chai";
import { CommandNotFoundError } from "../src/slash-commands/SlashCommandManager";

var client!: HackerSan;

beforeEach(done => {
    client = new HackerSan({
        intents: []
    });
    
    // reset command registry
    for (const constructor of getCommandRegistry()) {
        removeCommand(constructor);
    };

    done();
});


suite("Slash Commands", () => {
    test("Finds right execute method.", async () => {
        const expectedReply = "Hi!";

        @SlashCommand({name: "test-command", description: "Test command!"})
        class TestExecuteCommand {
            @Execute()
            async execute(interaction: CommandInteraction) {
                return expectedReply;
            }
        }

        @SlashCommand({name: "non-decorated-execute", description: "Command that'll default to using SlashCommand#execute"})
        class NonDecoratedCommand {
            execute() {
                return expectedReply;
            }
        }

        client.commands.reload();
        await client.commands.handle({
            commandName: "test-command",
            reply(reply: any) {
                expect(reply.content).to.equal(expectedReply);
            },
            isCommand() {return true},
            isAutocomplete() {return false}
        } as unknown as Interaction)


        await client.commands.handle({
            commandName: "non-decorated-execute",
            isCommand: () => true,
            isAutocomplete: () => false,
            reply(reply: any) {
                expect(reply.content).to.equal(expectedReply);
            }
        } as CommandInteraction)
    });

    test("Finds right CanExecute method & calls it. Only calls execute if true.", async () => {
        
        @SlashCommand({name: "can-execute-command", description: "Test command!"})
        class TestCanExecuteCommand {
            @Execute()
            async execute(interaction: CommandInteraction) {
                throw new Error(`@CanExecute method's result is being ignored.`);
            }

            @CanExecute()
            async canExecute(interaction: CommandInteraction) {
                return false;
            }
        }

        client.commands.reload();
        await client.commands.handle({
            commandName: "can-execute-command",
            isCommand() {return true},
            isAutocomplete() {return false}
        } as unknown as Interaction);
    });

    test("Finds the right command to execute between several commands. Throws an error on unknown command.", async () => {
        var hasExecuted = false;

        @SlashCommand({name: "good-command", description: "the command that *should* be executed."})
        class GoodCommand {
            @Execute()
            execute() {
                hasExecuted = true;
            }
        }

        @SlashCommand({name: "bad-command", description: "the command that *should not* be executed"})
        class BadCommand {
            @Execute()
            execute() {
                throw new Error("Wrong command is being executed!");
            }
        }

        client.commands.reload();
        await client.commands.handle({
            commandName: "good-command",
            isCommand() {return true},
            isAutocomplete() {return false}
        } as unknown as Interaction);
        expect(hasExecuted).to.be.true;

        await client.commands.handle({
            commandName: "unknown-command",
            isCommand() {return true},
            isAutocomplete() {return false}
        } as unknown as Interaction).catch(error => {
            if (!(error instanceof CommandNotFoundError)) throw error;
        });
    });

    test("Maps return types of execute method properly.", async () => {
        @SlashCommand({name: "string-command", description: "Command that returns a string."})
        class StringSlashCommand {
            @Execute()
            execute() {
                return "string_return";
            }
        }

        @SlashCommand({name: "embed-command", description: "Command that returns an embed."})
        class EmbedSlashCommand {
            @Execute()
            execute() {
                return new MessageEmbed().setDescription("embed_return");
            }
        }

        @SlashCommand({name: "mixed-command", description: "Command that returns raw payload."})
        class MixedSlashCommand {
            @Execute()
            execute() {
                return {
                    content: "string_content",
                    embeds: [
                        new MessageEmbed().setDescription("embed_content")
                    ]
                };
            }
        }

        client.commands.reload();


        await client.commands.handle({
            commandName: "string-command",
            isCommand() {return true},
            isAutocomplete() {return false},
            reply(payload: any) {
                const {content, embeds} = payload;
                expect(content).to.equal("string_return");
                expect(embeds).to.be.undefined;
            }
        } as unknown as Interaction);

        await client.commands.handle({
            commandName: "embed-command",
            isCommand() {return true},
            isAutocomplete() {return false},
            reply(payload: any) {
                const {content, embeds} = payload;
                expect(content).to.be.undefined;
                expect(embeds).length(1);
                expect(embeds[0].description).to.equal("embed_return");
            }
        } as unknown as Interaction);

        await client.commands.handle({
            commandName: "mixed-command",
            isCommand() {return true},
            isAutocomplete() {return false},
            reply(payload: any) {
                const {content, embeds} = payload;
                expect(content).to.equal("string_content");
                expect(embeds).length(1);
                expect(embeds[0].description).to.equal("embed_content");
            }
        } as unknown as Interaction);
    });

    test("Automatically defers replies if needed.", (done: Mocha.Done) => {
        @SlashCommand({name: "defer", description: "Command with autoDefer", autoDefer: true})
        class DeferCommand {
            @Execute()
            execute() {
                return "dummy return";
            }
        }

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
            editReply(payload: any) {
                done();
            }
        } as CommandInteraction)
    });

    // TODO: actually write autocomplete logic
    test("Handles autocompletes", async () => {
        await client.commands.handle({
            isCommand() {return false},
            isAutocomplete() {return true}
        } as unknown as Interaction)
    });
});