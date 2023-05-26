import { APIEmbedField, ActionRow, ActionRowBuilder, AutoModerationActionExecution, ButtonBuilder, ButtonStyle, EmbedBuilder, Events, InteractionCollector, ModalBuilder, PermissionFlagsBits, SlashCommandSubcommandBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import Module from "../Module";
import { ItemList } from "../util/Item";


export default class Util extends Module {
    name = "Util"

    createCommands(): void {
        const module = this;

        const joinMessage = `
## MIDNIGHT STAR - AN INTRODUCTION

Midnight Star is an arms dealing syndicate run by a mysterious woman known as The Sovereign, with the help of her board of Directors. Midnight Star is known as a community of professional arms dealers, ruthless terrorists, and iconic business owners. Here it is up to you to build a path in this group for your character, be what you want to be. We will give you the basics, and see what you do with them.

## LEGENDS OF THE REBELLION

Midnight Star is home to a multitude of Legends. These people have pulled off insane feats. They go by monikers, probably ones more synonymous than their real names. Stick with us, play your cards right, and carve your own spot as a legend.

## ARMS DEALERS FIRST

Midnight Star primarily focuses on providing a consistent and reliable broker for weapons and other munitions to the rebellion. Whether that be other factions, or solo rebels and little friend groups. After you receive your training you'll be placed as a Scav. What you do from there, whether it be an arms dealer yourself, or buy your way into Nightwatch with the blood on your hands. You keep what you earn, the group does not take cuts in anyway, so you make 100% of the profits from your sales.

## TERRORISM ISN'T SOMETHING WE'RE SHY TO, THOUGH...

If you decide to prove yourself bloodthirsty, where your primary desire is to wreak havoc, raid, and strike fear into the Combine, you may possibly qualify to join Nightwatch. Nightwatch is a team that specializes in coordinated acts of terrorism, as well as special and covert operations. It takes a lot to qualify, but once you're in, you're in. This isn't to say that your position as a Scavenger is free of causing havoc. Scavs will often hunt OTA for loot.

## That about sums up what our group is about...
If you're still interested, we'd love to have ya. We've got an alien empire to burn, and we'd like you to be there to help us.
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
        // InteractionCreate event
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
                const member = interaction.guild.members.cache.get(interaction.user.id);
                if(!member) {
                    await interaction.reply({ content: "Internal error! Member could not be found, please try again later.", ephemeral: true })
                    return this.logger.error(`Member could not be found for ${interaction.user.username} (${interaction.user.id})!`)
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
            } else if(interaction.isModalSubmit() && interaction.customId == "ms-verify") {
                const logChannel = await this.findChannel(process.env.LOGS_CHANNEL_ID);
                if(!logChannel || !logChannel.isTextBased()) {
                    this.logger.error("Logs channel is not set/valid! (LOGS_CHANNEL_ID)");
                    await interaction.reply({ content: "Unfortunately the logs channel ID is not configured correctly, please notify the bot developer of this.", ephemeral: true });
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
                await interaction.reply({ content: "Success! Please wait for your application to be looked over.", ephemeral: true })
            } else if(interaction.isButton() && interaction.customId.startsWith("verif")) {
                // Modify message
                const accept = new ButtonBuilder()
                    .setCustomId("5t4rey54rty4")
                    .setLabel("Accept")
                    .setStyle(ButtonStyle.Success)
                    .setDisabled(true);
                
                const deny = new ButtonBuilder()
                    .setCustomId("45ertyh4uhy")
                    .setLabel("Deny")
                    .setStyle(ButtonStyle.Danger)
                    .setDisabled(true);

                const row = new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(accept, deny);
                
                await interaction.message.edit({ components: [row] })
                
                // Get member
                const idSplit = interaction.customId.split("_")
                const id = idSplit[1];

                if(!id) {
                    return this.logger.error("Invalid ID provided in verify customID!");
                }
        
                const member = interaction.guild.members.cache.get(id);
                if(!member) {
                    await interaction.reply({ content: "This person either left the discord, or does not exist on the bot's cache.", ephemeral: true })
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

                    await interaction.reply({ content: `Accepted member ${member}`, ephemeral: true });
                    try {
                        await member.send("Your application to Midnight Star has been **accepted**! Please contact a Scav Director for training.")
                    } catch(e) {
                        return;
                    }
                } else if (idSplit[1] == "verifdeny") {
                    await interaction.reply({ content: `Denied member ${member}`, ephemeral: true });
                    try {
                        await member.send("Hello. Your application to Midnight Star has been **denied**. For further information, contact a director.");
                    } catch(e) {
                        return;
                    }
                }
            }
        })
    }
}