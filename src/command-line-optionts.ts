import parseArgs, {OptionDefinition} from "command-line-args";

const definitions : OptionDefinition[] = [
    {name: "no-login", alias: "l", type: Boolean},
    {name: "no-commands", alias: "c", type: Boolean}
];

var parsedOptions; 
try {
    parsedOptions = parseArgs(definitions); 
} catch {
    parsedOptions = {};
}
export interface HackerSanOptions {
    /**
     * Used to skip HackerSan#login. 
     */
    "no-login"?: boolean;

    /**
     * Skip calling CommandManager#register in HackerSan#login.
     */
    "no-commands"?: boolean;
    _unknown?: [];
};
export const CommandLineOptions = parsedOptions as HackerSanOptions;