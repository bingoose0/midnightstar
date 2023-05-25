import { CacheType, Guild, ModalSubmitInteraction, SlashCommandSubcommandBuilder, TextBasedChannel, TextChannel, TextInputStyle } from "discord.js";
import Module from "../Module";
import { ActionRowBuilder, EmbedBuilder, ModalBuilder, TextInputBuilder } from "@discordjs/builders";
import CurrentSale from "../util/CurrentSale";
import { ItemMap } from "../util/Item";
import Sale from "../models/Sale";

export default class Util extends Module {
    name = "Util"
    channel: TextBasedChannel;

    createCommands(): void {
        const module = this;

        this.commands.push(
            // Starts a sale
        )
    }
}