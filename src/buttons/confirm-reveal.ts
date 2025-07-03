import { ButtonStyle, type ButtonInteraction } from "discord.js";
import { Messages } from "../constants";
import { getChatSessions } from "../utils/chats";
import { ActionRowBuilder, ButtonBuilder } from "@discordjs/builders";

export default async function (interaction: ButtonInteraction) {
    let sessions = await getChatSessions(interaction.user.id);
    if (sessions.length === 0)
        return await interaction.reply(Messages.NO_CHAT_SESSIONS);
    let session = sessions[0];

    let contact = session!.first;
    if (contact === interaction.user.id) {
        contact = session!.second;
    }

    try {
        let contactUser = interaction.client.users.cache.get(contact!);
        let dm = await contactUser?.createDM();

        let button = new ButtonBuilder()
            .setCustomId("reveal")
            .setLabel("Reveal")
            .setStyle(ButtonStyle.Primary);

        let row = new ActionRowBuilder().addComponents(button);

        await dm?.send({
            content: Messages.REVEAL,
            // @ts-ignore
            components: [row],
        });

        return await interaction.reply(Messages.REVEAL_SENT);
    } catch (e) {
        console.error(e);
        return await interaction.reply(Messages.REVEAL_IMPOSSIBLE);
    }
}
