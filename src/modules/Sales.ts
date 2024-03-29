import { PermissionFlagsBits, SlashCommandSubcommandBuilder, TextBasedChannel } from "discord.js";
import Module from "../Module";
import { EmbedBuilder } from "@discordjs/builders";
import CurrentSale from "../util/CurrentSale";
import { ItemMap } from "../util/Item";
import Sale from "../models/Sale";

export default class Sales extends Module {
    name = "Sales"
    channel: TextBasedChannel;
    currentSales: Map<String, CurrentSale> = new Map<String, CurrentSale>(); // UserID, 

    createCommands(): void {
        const module = this;

        this.commands.push(
            // Starts a sale
            {
                name: "start",
                builder: new SlashCommandSubcommandBuilder()
                    .setDescription("Starts a new sale"),
                async executor(interaction) {
                    const oldSale = module.currentSales.get(interaction.user.id);
                    if(oldSale) {
                        await interaction.editReply({ content: "**Error!** You already have a current sale going on. Cancel it with /sales cancel." });
                        return;
                    }

                    const sale = new CurrentSale();
                    module.currentSales.set(interaction.user.id, sale);
                    await interaction.editReply({ content: "**Success!** Add items with /sales additem." });
                },
            },
            
            // Adds an item to a sale
            {
                name: "additem",
                builder: new SlashCommandSubcommandBuilder()
                    .setDescription("Adds an item to the current sale, start one with /sales start")
                    .addStringOption(o => o
                        .setName("item")
                        .setDescription("The item to use")
                        .setAutocomplete(true)
                        .setRequired(true)
                    ).addNumberOption(o => o
                        .setName("quantity")
                        .setDescription("The quantity to add")
                        .setMinValue(1)
                        .setMaxValue(15)
                        .setRequired(true)
                    ),
                async executor(interaction) {
                    const sale = module.currentSales.get(interaction.user.id);
                    if(!sale) {
                        await interaction.editReply({ content: "**Error!** No current sale was found. Start one with /sales start." });
                        return;
                    }

                    const itemID = interaction.options.getString("item");
                    const quantity = interaction.options.getNumber("quantity");
                    const item = ItemMap.get(itemID);
                    if(!item) {
                        await interaction.editReply({ content: "**Error!** The item was not found! This should usually never happen, please contact the bot owner!" });
                        return;
                    }

                    const member = interaction.guild.members.cache.get(interaction.user.id);
                    if(!member) {
                        await interaction.editReply({ content: "**Error!** The member could not be found. This is an internal bot issue, please contact the bot owner." });
                        return;
                    }
            
                    if(sale.items.length + quantity > 30 && !member.permissions.has(PermissionFlagsBits.Administrator)) {
                        await interaction.editReply({ content: "**Error!** This amount goes over the order limit (30), please contact an admin to process this order." })
                        return;
                    }
        
                    for (let index = 0; index < quantity; index++) {
                        sale.items.push(item);
                    }

                    await interaction.editReply({ content: `**Success!** Added **${quantity}x ${item.name}** to the sale cart!` });
                },

                async autoComplete(interaction) {
                    const value = interaction.options.getFocused().toLowerCase();
                    let keys = Array.from(ItemMap.values()).filter(
                        ( o ) => o.name.toLowerCase().startsWith(value)
                    );

                    const data = keys.map( o => {
                        return {
                            name: o.name,
                            value: o.id
                        }
                    }).slice(0, 25); // max 25 values

                    await interaction.respond(data)
                },
            },
            
            // Calculates the total price of a sale
            {
                name: "price",
                builder: new SlashCommandSubcommandBuilder()
                    .setDescription("Calculates the total price (with ammo discount)"),
                async executor(interaction) {
                    const sale = module.currentSales.get(interaction.user.id);
                    if(!sale) {
                        await interaction.editReply({ content: "**Error!** No current sale was found. Start one with /sales start." });
                        return;
                    }

                    await interaction.editReply({ content: `The total price of your sale is: **${sale.calculatePrice()}C!**` })
                },
            },
            
            // Cancels a sale
            {
                name: "cancel",
                builder: new SlashCommandSubcommandBuilder()
                    .setDescription("Cancels any current order."),
                async executor(interaction) {
                    const sale = module.currentSales.get(interaction.user.id);
                    if(!sale) {
                        await interaction.editReply({ content: "**Error!** No current sale was found. Start one with /sales start." });
                        return;
                    }

                    module.currentSales.delete(interaction.user.id)
                    await interaction.editReply({ content: "**Success.** Cleared your current sale." });
                }
            },
            
            // Finishes a sale, logging it and saving it in the database
            {
                name: "finish",
                builder: new SlashCommandSubcommandBuilder()
                    .setDescription("Finishes your current order")
                    .addStringOption(o => o
                        .setName("buyername")
                        .setDescription("The buyer's IC name.")
                        .setRequired(true)   
                    )
                    .addStringOption(o => o
                        .setName("buyerguild")
                        .setDescription("The buyer's guild.")
                        .setRequired(false)    
                    ),

                async executor(interaction) {
                    const sale = module.currentSales.get(interaction.user.id);
                    if(!sale) {
                        await interaction.editReply({ content: "**Error!** No current sale was found. Start one with /sales start." });
                        return;
                    }

                    const name = interaction.options.getString("buyername");
                    const guild = interaction.options.getString("buyerguild", false) || "N/A"
                    const member = interaction.guild.members.cache.get(interaction.user.id);
                    const price = sale.calculatePrice();

                    if(price <= 1) {
                        return await interaction.editReply({ content: "**Error!** The price must not be 0 or below."});
                    }

                    const iString = sale.itemString();
                    const date = new Date();
        
                    const embed = new EmbedBuilder()
                        .setTitle(`SALE LOG - ${member.displayName}`)
                        .addFields(
                            { name: "TOTAL", value: `${price.toString()} credits` },
                            { name: "ITEMS", value: iString },
                            { name: "GUILD", value: guild },
                            { name: "BUYER", value: name }
                        )
                        .setColor(0x8934eb)
                        .setFooter({ "text": date.toString() })
                    await module.channel.send({ embeds: [embed] });

                    const saleDB = new Sale({
                        sellerID: interaction.user.id,
                        buyer: name,
                        buyerGuild: guild,
                        items: iString,
                        total: price,
                        timestamp: date
                    });

                    await saleDB.save();
                    await interaction.editReply({ content: "Sale has been logged and saved in the database." });
                    
                    module.currentSales.delete(interaction.user.id);
                }
            },
        )
    }

    async onReady() {
        const newChannel = await this.findChannel(process.env.SALES_CHANNEL_ID);

        if(!newChannel) {
            return this.logger.error("Sales log channel is not valid!");
        }

        if(!newChannel.isTextBased()) {
            return this.logger.error("Sales log channel is not a text channel!");
        }

        this.channel = newChannel
    }
}