import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    CommandInteraction,
} from "discord.js";
import db from "../database";
import tables from "../database/tables";
import { eq } from "drizzle-orm";
import { Messages } from "../constants";
import { hasChat } from "../utils/chats";

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

        if (!(await hasChat(interaction.user))) {
            const confirm = new ButtonBuilder()
                .setCustomId("unregister")
                .setLabel("Unregister")
                .setStyle(ButtonStyle.Danger);

            const row = new ActionRowBuilder().addComponents(confirm);

            return await interaction.reply({
                content: Messages.CONFIRM_REGISTER,
                // @ts-ignore
                components: [row],
            });
        }

        await db
            .delete(tables.users)
            .where(eq(tables.users.discord_id, interaction.user.id));

        await interaction.reply(Messages.UNREGISTERED);
    },
};
