import * as fs from "fs";
import { APIEmbedField, ActionRowBuilder, ButtonBuilder, ButtonStyle, CacheType, EmbedBuilder, Events, ModalBuilder, ModalSubmitInteraction, PermissionFlagsBits, SlashCommandSubcommandBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import Module from "../Module";
import { ItemList } from "../util/Item";

export default class Util extends Module {
    name = "Util"

    createCommands(): void {
        const module = this;

        let joinMessage = "none";
        try {
            const file = fs.readFileSync("JOINMESSAGE", { encoding: "utf-8", flag: "r" });
            joinMessage = file;
        } catch(e) {
            this.logger.error(e);
            this.logger.error("No join message set in JOINMESSAGE!");
        }

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
    
                    await interaction.editReply({ embeds: [embed] })
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
                        return await interaction.editReply({ content: "Invalid channel! The channel **must** be text-based." })
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

    async onModalSubmit(interaction: ModalSubmitInteraction<CacheType>) {
        if(interaction.customId.startsWith("say_")) {
            const message = interaction.fields.getTextInputValue("message");

            const idSplit = interaction.customId.split("say_");
            const channelID = idSplit[1]
            if(!channelID) {
                interaction.editReply({ content: `Channel ID was not valid, please report this to Bingu. In case you needed it, here is your text:\n${message}` })
                return;
            };

            const channel = interaction.guild.channels.cache.get(channelID);
            if(!channel || !channel.isTextBased()) {
                interaction.editReply({ content: `The channel could not be found or is not text-based. In case you needed it, here is your text:\n${message}` })
                return;
            }
    
            channel.send(message);

            await interaction.editReply({ content: "**Success!**" })
        } else if(interaction.customId == "ms-verify") {
            const logChannel = await this.findChannel(process.env.LOGS_CHANNEL_ID);
            if(!logChannel || !logChannel.isTextBased()) {
                this.logger.error("Logs channel is not set/valid! (LOGS_CHANNEL_ID)");
                await interaction.editReply({ content: "Unfortunately the logs channel ID is not configured correctly, please notify the bot developer of this." });
                return;
            }

            const embed = new EmbedBuilder();
            embed.setTitle(`NEW APPLICATION - ${interaction.user.username} (${interaction.user.id})`)
            embed.addFields(
                {
                    name: "What do you want out of Midnight Star?",
                    value: interaction.fields.getTextInputValue("firstInput")
                },
                {
                    name: "What do you want to do within Midnight Star?",
                    value: interaction.fields.getTextInputValue("secondInput")
                }
            )

            const accept = new ButtonBuilder()
                .setCustomId("verifaccept_" + interaction.user.id)
                .setLabel("Accept")
                .setStyle(ButtonStyle.Success);
            
            const deny = new ButtonBuilder()
                .setCustomId("verifdeny_" + interaction.user.id)
                .setLabel("Deny")
                .setStyle(ButtonStyle.Danger);

            const row = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(accept, deny);
            
            await logChannel.send({ embeds: [embed], components: [row] })
            await interaction.editReply({ content: "Success! Please wait for your application to be looked over." })
        }
    }

    onReady(): void {
        // InteractionCreate event
        this.client.on(Events.InteractionCreate, async interaction => {
            if(interaction.isMessageComponent() && interaction.customId == "ms_buttonok") {
                const member = interaction.guild.members.cache.get(interaction.user.id);
                if(!member) {
                    await interaction.reply({ content: "Internal error! Member could not be found, please try again later.", ephemeral: true })
                    return this.logger.error(`Member could not be found for ${interaction.user.username} (${interaction.user.id})!`)
                }

                if(!member.roles.cache.has(process.env.UNASSIGNED_ROLE)) {
                    await interaction.reply({ content: "You're already verified.", ephemeral: true  })
                    return;
                }
    
                const modal = new ModalBuilder()
                    .setCustomId("ms-verify")
                    .setTitle("Form");
                
                const firstInput = new TextInputBuilder()
                    .setCustomId("firstInput")
                    .setLabel("What do you want out of Midnight Star?")
                    .setStyle(TextInputStyle.Paragraph)
                    .setMaxLength(800);
                
                const secondInput = new TextInputBuilder()
                    .setCustomId("secondInput")
                    .setLabel("What do you want to do within Midnight Star?")
                    .setStyle(TextInputStyle.Paragraph)
                    .setMaxLength(800);


                const firstRow = new ActionRowBuilder<TextInputBuilder>().addComponents(firstInput);
                const secondRow = new ActionRowBuilder<TextInputBuilder>().addComponents(secondInput);

                modal.addComponents(firstRow, secondRow);

                await interaction.showModal(modal);
            } else if(interaction.isMessageComponent() && interaction.customId.startsWith("verif")) {
                await interaction.deferReply({"ephemeral": true})
                // Modify message
                const accept = new ButtonBuilder()
                    .setCustomId("_verifaccept")
                    .setLabel("Accept")
                    .setStyle(ButtonStyle.Success)
                    .setDisabled(true);
                
                const deny = new ButtonBuilder()
                    .setCustomId("_verifdeny")
                    .setLabel("Deny")
                    .setStyle(ButtonStyle.Danger)
                    .setDisabled(true);

                const row = new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(accept, deny);
                
                await interaction.message.edit({ content: interaction.customId.startsWith("verifaccept") ? "**Accepted**" : "**Denied**", components: [row] })
                
                // Get member
                const idSplit = interaction.customId.split("_")
                const id = idSplit[1];

                if(!id) {
                    return this.logger.error("Invalid ID provided in verify customID!");
                }

                const member = interaction.guild.members.cache.get(id);
                if(!member) {
                    await interaction.editReply({ content: "This person either left the discord, or does not exist on the bot's cache." })
                    return;
                }

                // CHange user roles
                if(idSplit[0] == "verifaccept") {
                    const entryRoleID = process.env.NEW_ENTRY_ROLE;
                    const unrankedRoleID = process.env.UNASSIGNED_ROLE;

                    if(!member.roles.cache.has(unrankedRoleID) && member.roles.cache.has(entryRoleID)) {
                        return;
                    }

                    await member.roles.remove(unrankedRoleID);
                    await member.roles.add(entryRoleID);

                    await interaction.editReply({ content: `Accepted member ${member}` });
                    try {
                        await member.send("Your application to Midnight Star has been **accepted**! Please contact a Scav Director for training.")
                    } catch(e) {
                        return;
                    }
                } else if (idSplit[0] == "verifdeny") {
                    await interaction.editReply({ content: `Denied member ${member}` });
                    try {
                        await member.send("Hello. Your application to Midnight Star has been **denied**. For further information, contact a director.");
                    } catch(e) {
                        return;
                    }
                }

                await interaction.editReply("Done.")
            }
        })
    }
}