import parseArgs, {OptionDefinition} from "command-line-args";

const definitions : OptionDefinition[] = [
    {name: "no-login", alias: "l", type: Boolean},
    {name: "no-commands", alias: "c", type: Boolean}
];

export const CommandLineOptions = parseArgs(definitions) as {
    "no-login": boolean;
    "no-commands": boolean;
    _unknown: [];
};