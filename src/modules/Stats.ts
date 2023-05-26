import { PermissionFlagsBits, SlashCommandSubcommandBuilder } from "discord.js";
import Module from "../Module";
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

                    let curText = ""
                    const result = await Sale.find({ sellerID: user.id }).sort({ timestamp: -1 });
                    let moneyMade = 0;
                    for (const key in result) {
                        const element = result[key];        
                        moneyMade += element.total;
                
                        const date = new Date(element.timestamp || 0)
                        const text = `
                        ## Sales Log - ${element.buyer} 
                        **TOTAL**: ${element.total}
                        **ITEMS**: ${element.items}
                        **BUYER GUILD**: ${element.buyerGuild}
                        **DATE OF PURCHASE**: ${date}
                        `

                        curText += text
                    }

                    if(curText.length > 2000) {
                        return interaction.reply({ content: "Unfortunately the amount of sales for this user exceeds the text limit for Discord, please try entering a lower time.", ephemeral: true })
                    }
                    await interaction.reply({ content: curText, ephemeral: true })
                }
            }
        )
    }
}