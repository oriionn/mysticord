import {
    ActionRow,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    type CommandInteraction,
} from "discord.js";
import { getChatSessions, getContact } from "../utils/chats";
import { Messages } from "../constants";

export default {
    data: {
        name: "tictactoe",
        description: "Suggest a tic-tac-toe game to your contact",
        integration_types: [1],
        contexts: [1],
    },
    async execute(interaction: CommandInteraction) {
        let sessions = await getChatSessions(interaction.user.id);
        if (sessions.length === 0)
            return await interaction.reply(Messages.NO_CHAT_SESSIONS);

        let contact = getContact(sessions, interaction.user.id);

        try {
            let contactUser = interaction.client.users.cache.get(contact!);
            let dm = await contactUser?.createDM();

            let button = new ButtonBuilder()
                .setCustomId("accept_ttt")
                .setLabel("Accept")
                .setStyle(ButtonStyle.Success);

            let row = new ActionRowBuilder().addComponents(button);

            await dm?.send({
                content: Messages.ASK_TTT,
                // @ts-ignore
                components: [row],
            });

            return await interaction.reply(Messages.REVEAL_SENT);
        } catch (e) {
            await interaction.reply({ content: Messages.REVEAL_IMPOSSIBLE });
            console.error(e);
        }
    },
};
