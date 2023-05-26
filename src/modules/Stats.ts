import { PermissionFlagsBits, SlashCommandSubcommandBuilder } from "discord.js";
import Module from "../Module";
import Sale from "../models/Sale";
import CreatePaginator from "../util/Pagination";


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

                    let pages = []
                    const result = await Sale.find({ sellerID: user.id }).sort({ timestamp: -1 });
                    
                    for(const key in result) {
                        const element = result[key];
                        pages.push(`
                        **Buyer:** ${element.buyer} (${element.buyerGuild})
                        **Total:** ${element.total}
                        **Items:** ${element.items}
                        `)
                    }

                    await CreatePaginator(pages, interaction, true);
                }
            }
        )
    }
}