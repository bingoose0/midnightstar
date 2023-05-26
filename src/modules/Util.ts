import { APIEmbedField, ActionRow, ActionRowBuilder, AutoModerationActionExecution, ButtonBuilder, ButtonStyle, EmbedBuilder, Events, InteractionCollector, ModalBuilder, PermissionFlagsBits, SlashCommandSubcommandBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import Module from "../Module";
import { ItemList } from "../util/Item";


export default class Util extends Module {
    name = "Util"

    createCommands(): void {
        const module = this;

        const joinMessage = `
        <insert introduction message here>
        `

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
            },
            {
                name: "setjoinchannel",
                builder: new SlashCommandSubcommandBuilder()
                    .setDescription("Sets the join channel.")
                    .addChannelOption(o => o.setName("channel").setDescription("The channel the message is in, this is required to obtain the message").setRequired(true)),
                permissions: [PermissionFlagsBits.Administrator],
                async executor(interaction) {
                    const channelOpt = interaction.options.getChannel("channel");
                    const channel = interaction.guild.channels.cache.get(channelOpt.id);
                    if(!channel || !channel.isTextBased()) {
                        return await interaction.reply({ content: "Invalid channel! The channel **must** be text-based.", ephemeral: true })
                    }
            
                    const okButton = new ButtonBuilder()
                        .setCustomId("ms_buttonok")
                        .setLabel("OK")
                        .setStyle(ButtonStyle.Success);

                    const row = new ActionRowBuilder<ButtonBuilder>()
                        .addComponents(okButton);

                    await channel.send({
                        content: joinMessage,
                        components: [row]
                    })
                }
            }
        )
    }

    onReady(): void {
        this.client.on(Events.InteractionCreate, async interaction => {
            if(interaction.isModalSubmit() && interaction.customId.startsWith("say_")) {
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
            } else if(interaction.isMessageComponent() && interaction.customId == "ms_buttonok") {
                const role = process.env.UNASSIGNED_ROLE;
                const member = interaction.guild.members.cache.get(interaction.user.id);
                if(!member) {
                    await interaction.reply({ content: "Internal error! Member could not be found, please try again later.", ephemeral: true })
                    return this.logger.error(`Member could not be found for ${interaction.user.username} (${interaction.user.id})!`)
                }

                if(member.roles.cache.has(role)) {
                    await member.roles.remove(role);
                }

                const entryRoleID = process.env.NEW_ENTRY_ROLE;
                if(!entryRoleID) {
                    await interaction.reply({ content: "The bot developer/operator forgot to setup the new entry role, please contact them!", ephemeral: true })
                    return this.logger.error("New entry role is not set!")
                }

                if(!interaction.guild.roles.cache.has(entryRoleID)) {
                    await interaction.reply({ content: "The bot developer/operator entered the wrong new entry role ID, please contact them!", ephemeral: true })
                    return this.logger.error("New entry role is not valid!")
                }
    
                await member.roles.add(entryRoleID);

                interaction.reply({ content: "Welcome!", ephemeral: true })
            }
        })
    }
}