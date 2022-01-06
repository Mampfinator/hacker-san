import { expect } from "chai";
import {suite, test} from "mocha";
import { ObjectID } from "typeorm";
import { CalenddarNotification } from "../src/calenddar/types";
import {Callback, Execute, getCallbackRegistry, removeCallback} from "../src/callbacks/Callback";
import { DbCallback } from "../src/callbacks/DbCallback";
import { HackerSan } from "../src/hacker-san";

var client: HackerSan;

beforeEach((done) => {
    for (const constructor of getCallbackRegistry()) {
        removeCallback(constructor);
    }

    client = new HackerSan({
        intents: []
    });

    done();
})

suite("Callbacks", () => {
    test("Adds & removes callbacks from the registry properly.", async () => {
        @Callback({name: "test", description: "test callback"})
        class TestCallback {
        }

        expect(getCallbackRegistry().size).to.equal(1);

        removeCallback(TestCallback);
        expect(getCallbackRegistry().size).to.equal(0);
    });

    test("Client (un)loads callbacks correctly.", async () => {
        @Callback({name: "test", description: "test callback"})
        class TestCallback {

        }

        client.callbacks.load();
        expect(client.callbacks.callbacks.size).to.equal(1);

        const testCallback = client.callbacks.callbacks.get("test")
        expect(testCallback!.name).to.equal("test");

        removeCallback(TestCallback);
        client.callbacks.load();

        expect(client.callbacks.callbacks.size).to.equal(0);
    });


    test("Client handles callbacks correctly.", (done: Mocha.Done) => {
        @Callback({name: "execute", description: "/"})
        class ExecuteCallback {
            @Execute()
            execute() {
                done();
            }
        }
        client.callbacks.load();
        client.callbacks.execute({
            type: "execute",
            id: "" as unknown as ObjectID,
            channel: "undefined",
            guild: "undefined",
            vtuber: "undefined"
        } as unknown as DbCallback, {} as unknown as CalenddarNotification);
    });

});