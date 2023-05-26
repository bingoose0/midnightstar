import { ActionRowBuilder, ButtonBuilder, ButtonStyle, RepliableInteraction } from "discord.js";

const curPages = []

export default async function CreatePaginator(pages: Array<string>, interaction: RepliableInteraction) {
    const lastButton = new ButtonBuilder()
        .setCustomId("paginator-last")
        .setLabel("PREV")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true);
    
    const nextButton = new ButtonBuilder()
        .setCustomId("paginator-next")
        .setLabel("NEXT")
        .setStyle(ButtonStyle.Primary); 

    const row = new ActionRowBuilder()
        .addComponents(lastButton, nextButton);
    
    let i = 0;
    let curPage = pages[i];

    const replyData = { embeds: [{ title: `Page ${i}`, description: curPage, components: [row] }] }
    const message = interaction.replied ? await interaction.reply(replyData) : await interaction.followUp(replyData);

    const col = message.createMessageComponentCollector({
        filter: i => i.user.id == interaction.user.id && curPages[interaction.id]
    })

    curPages.push(interaction.id);

    col.on("collect", async int => {
        if(int.customId == "paginator-last") {
            i--;
        } else {
            i++;
        }
    
        const lastButton = new ButtonBuilder()
            .setCustomId("paginator-last")
            .setLabel("PREV")
            .setStyle(ButtonStyle.Primary);
        
        const nextButton = new ButtonBuilder()
            .setCustomId("paginator-next")
            .setLabel("NEXT")
            .setStyle(ButtonStyle.Primary); 

        const row = new ActionRowBuilder()
            .addComponents(lastButton, nextButton);

        nextButton.setDisabled(i == pages.length);
        lastButton.setDisabled(i == 0);

        curPage = pages[i];

        const replyData = { embeds: [{ title: `Page ${i}`, description: curPage, components: [row] }] }
        message.edit(replyData);
    });

    
}