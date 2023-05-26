import { ActionRowBuilder, ButtonBuilder, ButtonStyle, RepliableInteraction } from "discord.js";

const curPages = []

export default async function CreatePaginator(pages: Array<string>, interaction: RepliableInteraction, ephemeral?: boolean) {
    ephemeral = ephemeral || true;

    const lastButton = new ButtonBuilder()
        .setCustomId("paginator-last")
        .setLabel("PREV")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true);
    
    const nextButton = new ButtonBuilder()
        .setCustomId("paginator-next")
        .setLabel("NEXT")
        .setStyle(ButtonStyle.Primary); 

    const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(lastButton, nextButton);
    
    let i = 0;
    let curPage = pages[i];

    const replyData = { embeds: [{ title: `Page ${i}`, description: curPage }], components: [row], ephemeral: ephemeral }
    const message = interaction.replied ? await interaction.followUp(replyData) : await interaction.reply(replyData);

    const col = message.createMessageComponentCollector({
        filter: i => i.user.id == interaction.user.id && curPages.includes(interaction.id)
    })

    curPages.push(interaction.id)

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

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(lastButton, nextButton);

        nextButton.setDisabled(i == pages.length - 1);
        lastButton.setDisabled(i == 0);

        curPage = pages[i].slice(0, 2000);

        const replyData = { embeds: [{ title: `Page ${i}`, description: curPage }], components: [row], ephemeral: ephemeral }
        await int.update(replyData);
    });

    
}