import { APIEmbedField, AutoModerationActionExecution, EmbedBuilder, PermissionFlagsBits, PermissionsBitField, SlashCommandSubcommandBuilder } from "discord.js";
import Module from "../Module";
import { ItemList } from "../util/Item";
import Sale from "../models/Sale";


export default class Stats extends Module {
    name = "Stats"

    createCommands(): void {
        const module = this;

        this.commands.push(
            {
                name: "lookup",
                permissions: [PermissionFlagsBits.Administrator],
                builder: new SlashCommandSubcommandBuilder()
                    .setDescription("Looks up the user's sales.")
                    .addUserOption(o => o.setName("user").setDescription("The user to lookup").setRequired(true)),
                async executor(interaction) {
                    const user = interaction.options.getUser("user", true);

                    const exists = await Sale.exists({ sellerID: user.id });
                    if(!exists) {
                        return interaction.reply({ content: "User has made no logged sales.", ephemeral: true });
                    }

                    const embed = new EmbedBuilder();
                    const result = await Sale.find({ sellerID: user.id }).sort({ timestamp: -1 });
                    let moneyMade = 0;
                    for (const key in result) {
                        const element = result[key];        
                        moneyMade += element.total;
                
                        const date = new Date(element.timestamp || 0)
                        embed.addFields({
                            name: "Sales Log - " + element.buyer,
                            value: "**TOTAL**: " + element.total
                                + `\n**ITEMS**: ${element.items}`
                                + `\n**BUYER GUILD**: ${element.buyerGuild}`
                                + `\n**DATE OF PURCHASE**: ${date}`
                        })
                    }

                    embed.setDescription(`**TOTAL MADE**: ${moneyMade}C`);
                    embed.setFooter({ text: `Data generated at ${new Date()}`})
                    await interaction.reply({ embeds: [embed], ephemeral: true })
                }
            }
        )
    }
}