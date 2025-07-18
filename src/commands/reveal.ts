import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    CommandInteraction,
} from "discord.js";
import { hasNoChat } from "../utils/chats";
import { Messages } from "../constants";

export default {
    data: {
        name: "reveal",
        description: "Ask to your contact to reveal their identity.",
        integration_types: [1],
        contexts: [1],
    },
    async execute(interaction: CommandInteraction) {
        if (await hasNoChat(interaction.user))
            return await interaction.reply(Messages.NO_CHAT_SESSIONS);

        let button = new ButtonBuilder()
            .setCustomId("confirm-reveal")
            .setLabel("Confirm")
            .setStyle(ButtonStyle.Success);

        let row = new ActionRowBuilder().addComponents(button);

        return await interaction.reply({
            content: Messages.CONFIRM_REVEAL,
            // @ts-ignore
            components: [row],
        });
    },
};
