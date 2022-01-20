import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";

export type Constructable = {new (...args: any[]): Record<string, any>} & Record<string, any>;

const commandRegistry = new Set<Constructable>();
/**
 * @returns a copy of the private Command Registry. 
 */
 export const getCommandRegistry = () => new Set(commandRegistry);

 /**
  * Will attempt to delete the given `@SlashCommand()` constructor.
  * Keep in mind that this **won't** unregister a command that's been sent to ApplicationCommandManager#register.
  * @returns the name of the command that was removed.
  */
 export const removeCommand = (target: Constructable) => {
     const name = getName(target); 
     commandRegistry.delete(target);
     return name;
 }

/* @SlashCommand */
const nameKey = Symbol("@SlashCommand - name");
const descriptionKey = Symbol("@SlashCommand - description");
const autoDeferKey = Symbol("@SlashCommand - autoDefer")

/**
 * Used to register a new SlashCommand singleton in the registry. 
 * At run time, HackerSan#commands will fetch instantiated commands from the registry 
 * and use their `@Execute()`-marked or `execute` method or to handle incoming slash commands.
 * @param {SlashCommandOptions} options - options for the SlashCommand.
 * @example 
 * \@SlashCommand({name: "example", description: "I'm an example command!"})
 * class ExampleCommand {
 *      \@Execute()
 *      execute(interaction: CommandInteraction) {
 *          return "This is the reply!";
 *      }
 * }
 */
 export const SlashCommand = (options: SlashCommandOptions) => (target: Constructable) => {
    if (!options.name) throw new TypeError("Options.name not found.");
    if (!options.description) throw new TypeError("Options.description not defined.")
    Reflect.defineMetadata(nameKey, options.name.toLowerCase(), target);
    Reflect.defineMetadata(descriptionKey, options.description, target);
    Reflect.defineMetadata(autoDeferKey, options.autoDefer ?? false, target);
    //Reflect.defineMetadata(canExecuteKey, options.canExecute ?? (() => true), target);
    
    commandRegistry.add(target);
}

/**
 * @returns the command's name.
 */
export const getName = (target: Constructable) => Reflect.getMetadata(nameKey, target) as string;

/**
 * @returns the command's description.
 */
export const getDescription = (target: Constructable) => Reflect.getMetadata(descriptionKey, target) as string;

/**
* @returns the command's autoDefer preference. 
*/
export const getAutoDefer = (target: Constructable) => Reflect.getMetadata(autoDeferKey, target) as boolean; 

export interface SlashCommandOptions {
    /**
     * Discord API- and internal name of this command.
     */
    name: string;
    /**
     * Discord API description of this command.
     */
    description: string;
    /**
     * @returns indicates whether a user can execute the command command or not.
     */
    canExecute?: (interaction: CommandInteraction) => Promise<boolean> | boolean
    /**
     * Whether or not the response to a command should be automatically defered beore execution.
     */
    autoDefer?: boolean;
}

/* @Execute */
const executeKey = Symbol("@Execute");
/**
 * Sets this method as main execution method for this command.
 */
// TODO: include CanExecute here!
export const Execute = () => (target: any, name: string) => {
    Reflect.defineMetadata(executeKey, name, target);
}

/**
 * @returns the prototype method that was marked with `@Execute`, or `target.prototype.execute` by default.
 */
export const getExecute = (target: Constructable) => {
    const executeName = Reflect.getMetadata(executeKey, target.prototype);
    return target.prototype[executeName ?? "execute"] as (interaction: CommandInteraction) => void;
}


/* @Builder */
const builderKey = Symbol("@Builder");
export const Builder = () => (target: any, name: string) => {
    Reflect.defineMetadata(builderKey, name, target);
}
/**
 * @returns the prototype method that was marked with `@Builder`, or `target.prototype.buildCommand` by default.
 */
export const getBuilder = (target: Constructable) => {
    // shorter return type definition here since ApplicationCommandsManager#register only takes SlashCommandBuilder and the various subtypes are structurally equal save for some manipulation methods.
    const builderName = Reflect.getMetadata(builderKey, target.prototype) as string;
    return target.prototype[builderName ?? "buildCommand"] as (builder: SlashCommandBuilder) => SlashCommandBuilder | undefined;
}

/* @CanExecute */
const canExecuteKey = Symbol("@CanExecute");
export const CanExecute = () => (target: any, name: string) => {
    Reflect.defineMetadata(canExecuteKey, name, target);
}
/**
 * @returns the canExecute function for this command.
 */
export const getCanExecute = (target: Constructable) => {
    const canExecuteName = Reflect.getMetadata(canExecuteKey, target.prototype);
    return target.prototype[canExecuteName ?? "canExecute"] as (interaction: CommandInteraction) => Promise<boolean> | boolean;
}

export const getSlashCommandOptions = (target: Constructable) => {
    return {
        name: getName(target),
        builder: getBuilder(target),
        canExecute: getCanExecute(target),
        execute: getExecute(target),
        autoDefer: getAutoDefer(target)
    }
}