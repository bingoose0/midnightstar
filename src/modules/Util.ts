import { APIEmbedField, ActionRow, ActionRowBuilder, AutoModerationActionExecution, EmbedBuilder, Events, InteractionCollector, ModalBuilder, PermissionFlagsBits, SlashCommandSubcommandBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
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
            },
            {
                name: "say",
                builder: new SlashCommandSubcommandBuilder()
                    .setDescription("Says something via the bot")
                    .addChannelOption(o => o.setName("channel").setDescription("Channel to send to").setRequired(true)),
                permissions: [PermissionFlagsBits.Administrator],
                async executor(interaction) {
                    const channel = interaction.options.getChannel("channel")
                    const modal = new ModalBuilder()
                        .setCustomId(`say_${channel.id}`)
                        .setTitle("Message");
                    
                    const input = new TextInputBuilder()
                        .setCustomId("message")
                        .setLabel("Message to print")
                        .setStyle(TextInputStyle.Paragraph);
                    
                    const row = new ActionRowBuilder<TextInputBuilder>().addComponents(input)
        
                    modal.addComponents(row);
                    await interaction.showModal(modal);
                }
            }
        )
    }

    onReady(): void {
        this.client.on(Events.InteractionCreate, interaction => {
            if(!interaction.isModalSubmit() || !interaction.customId.startsWith("say_")) return;
            const message = interaction.fields.getTextInputValue("message");

            const idSplit = interaction.customId.split("say_");
            const channelID = idSplit[1]
            if(!channelID) {
                interaction.reply({ content: `Channel ID was not valid, please report this to Bingu. In case you needed it, here is your text:\n${message}`, ephemeral: true })
                return;
            };

            const channel = interaction.guild.channels.cache.get(channelID);
            if(!channel || !channel.isTextBased()) {
                interaction.reply({ content: `The channel could not be found or is not text-based. In case you needed it, here is your text:\n${message}`, ephemeral: true })
                return;
            }
    
            channel.send(message);

            interaction.reply({ content: "**Success!**", ephemeral: true })
        })
    }
}