import { CacheType, Guild, ModalSubmitInteraction, SlashCommandSubcommandBuilder, TextBasedChannel, TextChannel, TextInputStyle } from "discord.js";
import Module from "../Module";
import { ActionRowBuilder, EmbedBuilder, ModalBuilder, TextInputBuilder } from "@discordjs/builders";
import CurrentSale from "../util/CurrentSale";
import { ItemMap } from "../util/Item";

export default class Sales extends Module {
    name = "Sales"
    channel: TextBasedChannel;
    currentSales: Map<String, CurrentSale> = new Map<String, CurrentSale>(); // UserID, 

    createCommands(): void {
        const module = this;

        this.commands.push(
            {
                name: "start",
                builder: new SlashCommandSubcommandBuilder()
                    .setDescription("Starts a new sale"),
                async executor(interaction) {
                    const oldSale = module.currentSales.get(interaction.user.id);
                    if(oldSale) {
                        await interaction.reply({ content: "**Error!** You already have a current sale going on. Cancel it with /sales cancel.", ephemeral: true });
                        return;
                    }

                    const sale = new CurrentSale();
                    module.currentSales.set(interaction.user.id, sale);
                    await interaction.reply({ content: "Success! Add items with /sales additem.", ephemeral: true });
                },
            },

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
                        await interaction.reply({ content: "**Error!** No current sale was found. Start one with /sales start.", ephemeral: true });
                        return;
                    }

                    const itemID = interaction.options.getString("item");
                    const quantity = interaction.options.getNumber("quantity");
                    const item = ItemMap.get(itemID);
                    if(!item) {
                        await interaction.reply({ content: "**ERROR!** The item was not found! This should usually never happen, please contact the bot owner!!", ephemeral: true });
                        return;
                    }

                    for (let index = 0; index < quantity; index++) {
                        sale.items.push(item);
                    }

                    await interaction.reply({ content: `Success! Added **${quantity}x ${item.name}** to the sale cart!`, ephemeral: true });
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

            {
                name: "price",
                builder: new SlashCommandSubcommandBuilder()
                    .setDescription("Calculates the total price (with ammo discount)"),
                async executor(interaction) {
                    const sale = module.currentSales.get(interaction.user.id);
                    if(!sale) {
                        await interaction.reply({ content: "**Error!** No current sale was found. Start one with /sales start.", ephemeral: true });
                        return;
                    }

                    await interaction.reply({ content: `The total price of your sale is: ${sale.calculatePrice()}C!`, ephemeral: true })
                },
            }
        )
    }

    onReady(): void {
        const newChnl = this.client.channels.cache.get(process.env.SALES_CHANNEL_ID);

        if(!newChnl.isTextBased()) {
            return this.logger.error("Sales log channel is not a text channel!");
        }

        this.channel = newChnl
    }

    async onModalSubmit(interaction: ModalSubmitInteraction<CacheType>): Promise<void> {
        
    }
}