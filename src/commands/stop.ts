import { type CommandInteraction } from "discord.js";
import { Messages } from "../constants";
import { hasChat, stopChatSessions } from "../utils/chats";

export default {
    data: {
        name: "stop",
        description: "Stop your chat session",
        integration_types: [1],
        contexts: [1],
    },
    async execute(interaction: CommandInteraction) {
        if (await hasChat(interaction.user)) {
            return await interaction.reply(Messages.NO_CHAT_SESSIONS);
        }

        await stopChatSessions(interaction.user, interaction.client);
        await interaction.reply(Messages.CHAT_SESSION_STOP_SELF);
    },
};
