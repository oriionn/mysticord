import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    CommandInteraction,
    SlashCommandBuilder,
    type Interaction,
} from "discord.js";
import db from "../database";
import tables from "../database/tables";
import { eq, or } from "drizzle-orm";
import { Messages } from "../constants";
import { getChatSessions } from "../utils/chats";

export default {
    data: {
        name: "unregister",
        description: "Unregister for the random meet",
        integration_types: [1],
        contexts: [1],
    },
    async execute(interaction: CommandInteraction) {
        let users = await db
            .select()
            .from(tables.users)
            .where(eq(tables.users.discord_id, interaction.user.id));

        if (users.length === 0) {
            return await interaction.reply(Messages.NOT_REGISTERED);
        }

        let userChats = await getChatSessions(interaction.user.id);

        if (userChats.length !== 0) {
            const confirm = new ButtonBuilder()
                .setCustomId("unregister")
                .setLabel("Unregister")
                .setStyle(ButtonStyle.Danger);

            const row = new ActionRowBuilder().addComponents(confirm);

            return await interaction.reply({
                content: Messages.CONFIRM_REGISTER,
                components: [row],
            });
        }

        await db
            .delete(tables.users)
            .where(eq(tables.users.discord_id, interaction.user.id));

        await interaction.reply(Messages.UNREGISTERED);
    },
};
