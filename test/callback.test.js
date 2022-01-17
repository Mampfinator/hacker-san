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
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const Callback_1 = require("../src/callbacks/Callback");
const hacker_san_1 = require("../src/hacker-san");
var client;
beforeEach((done) => {
    for (const constructor of (0, Callback_1.getCallbackRegistry)()) {
        (0, Callback_1.removeCallback)(constructor);
    }
    client = new hacker_san_1.HackerSan({
        intents: []
    });
    done();
});
(0, mocha_1.suite)("Callbacks", () => {
    (0, mocha_1.test)("Adds & removes callbacks from the registry properly.", () => __awaiter(void 0, void 0, void 0, function* () {
        let TestCallback = class TestCallback {
        };
        TestCallback = __decorate([
            (0, Callback_1.Callback)({ name: "test", description: "test callback" })
        ], TestCallback);
        (0, chai_1.expect)((0, Callback_1.getCallbackRegistry)().size).to.equal(1);
        (0, Callback_1.removeCallback)(TestCallback);
        (0, chai_1.expect)((0, Callback_1.getCallbackRegistry)().size).to.equal(0);
    }));
    (0, mocha_1.test)("Client (un)loads callbacks correctly.", () => __awaiter(void 0, void 0, void 0, function* () {
        let TestCallback = class TestCallback {
        };
        TestCallback = __decorate([
            (0, Callback_1.Callback)({ name: "test", description: "test callback" })
        ], TestCallback);
        client.callbacks.load();
        (0, chai_1.expect)(client.callbacks.callbacks.size).to.equal(1);
        const testCallback = client.callbacks.callbacks.get("test");
        (0, chai_1.expect)(testCallback.name).to.equal("test");
        (0, Callback_1.removeCallback)(TestCallback);
        client.callbacks.load();
        (0, chai_1.expect)(client.callbacks.callbacks.size).to.equal(0);
    }));
    (0, mocha_1.test)("Client handles callbacks correctly.", (done) => {
        let ExecuteCallback = class ExecuteCallback {
            execute() {
                done();
            }
        };
        __decorate([
            (0, Callback_1.Execute)(),
            __metadata("design:type", Function),
            __metadata("design:paramtypes", []),
            __metadata("design:returntype", void 0)
        ], ExecuteCallback.prototype, "execute", null);
        ExecuteCallback = __decorate([
            (0, Callback_1.Callback)({ name: "execute", description: "/" })
        ], ExecuteCallback);
        client.callbacks.load();
        client.callbacks.execute({
            type: "execute",
            id: "",
            channel: "undefined",
            guild: "undefined",
            vtuber: "undefined"
        }, {});
    });
});
