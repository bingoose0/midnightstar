import { SlashCommandSubcommandBuilder } from "discord.js";
import Module from "../Module";

export default class Sales extends Module {
    name = "Sales"
    
    createCommands(): void {
        this.commands.push({
            name: "log",
            builder: new SlashCommandSubcommandBuilder().setDescription("Logs a sale"),
            executor(interaction) {
                interaction.reply("hi");
            },
        })
    }
}