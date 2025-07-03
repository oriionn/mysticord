import type { ButtonInteraction } from "discord.js";
import { getChatSessions, getContact } from "../utils/chats";
import { Messages } from "../constants";

export default async function (interaction: ButtonInteraction) {
    let sessions = await getChatSessions(interaction.user.id);
    if (sessions.length === 0)
        return await interaction.reply(Messages.NO_CHAT_SESSIONS);
    let contact = getContact(sessions, interaction.user.id);

    try {
        let contactUser = interaction.client.users.cache.get(contact!);
        let dm = await contactUser?.createDM();

        await dm?.send({
            content:
                Messages.REVEALED +
                interaction.user.tag +
                "` (<@" +
                interaction.user.id +
                ">).",
        });

        return await interaction.reply({
            content:
                Messages.REVEALED +
                contactUser?.tag +
                "` (<@" +
                contactUser?.id +
                ">).",
        });
    } catch (e) {
        console.error(e);
        return await interaction.reply(Messages.REVEAL_IMPOSSIBLE_BIS);
    }
}
