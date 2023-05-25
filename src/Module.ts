import { Client, ModalSubmitInteraction, SlashCommandBuilder } from "discord.js";
import { Logger } from "./util/Logger";
import Command from "./util/Command";

export default class Module {
    name: string;
    logger: Logger;
    client: Client<true>;
    commands: Array<Command> = new Array<Command>();
    
    initialize(client: Client<true>) {
        this.logger = new Logger(this.name);
        this.client = client;
        
        this.createCommands();
        this.onReady()
    }

    // Empty functions
    createCommands() {}
    onReady() { }
    onModalSubmit(interaction: ModalSubmitInteraction) { };

    // Creates the SlashCommandBuilder
    createCommand() {
        const command = new SlashCommandBuilder();
        command.setName(this.name.toLowerCase());
        command.setDescription(`The ${this.name} module command containing all subcommands`);

        for(const key in this.commands) {
            const subCmd = this.commands[key];
            subCmd.builder.setName(subCmd.name.toLowerCase());
            command.addSubcommand(subCmd.builder);
        }

        return command;
    }
}