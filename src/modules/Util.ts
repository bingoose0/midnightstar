import { APIEmbedField, AutoModerationActionExecution, EmbedBuilder, SlashCommandSubcommandBuilder } from "discord.js";
import Module from "../Module";
import { ItemList } from "../util/Item";


export default class Util extends Module {
    name = "Util"

    createCommands(): void {
        const module = this;

        this.commands.push(
            // Retreives the price list. VERY SHITTY CODE, must be optimized
            {
                name: "pricelist",
                builder: new SlashCommandSubcommandBuilder()
                    .setDescription("Shows the price list for Midnight Star"),
                async executor(interaction) {
                    const categories = {
                        weapon: "Weaponry",
                        ammo: "Ammunition",
                        misc: "Miscellaneous"
                        // attachment: "Attachments"
                    }

                    const fields = {};

                    // Add items
                    const embed = new EmbedBuilder();
                    for(const key in ItemList) {
                        const element = ItemList[key];
                        const cat = categories[element.type];
                        const field = fields[element.type];

                        const itemText = element.name + " - " + element.price + "C\n"
                        if(field) {
                            field.value += itemText
                        } else {
                            const newField = {
                                name: cat,
                                value: itemText
                            }

                            fields[element.type] = newField
                        }
                    }

                    const embedFields: Array<APIEmbedField> = []
                    for(const key in fields) {
                        const element = fields[key]
                        embedFields.push(element)
                    }
    
                    // Config embed
                    embed.setTitle("Midnight Star - Prices")
                    embed.addFields(...embedFields)
    
                    await interaction.reply({ embeds: [embed], ephemeral: true })
                }
            }
        )
    }
}