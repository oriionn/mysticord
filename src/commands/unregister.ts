import {
    CommandInteraction,
    SlashCommandBuilder,
    type Interaction,
} from "discord.js";
import db from "../database";
import tables from "../database/tables";
import { eq } from "drizzle-orm";

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
            return interaction.reply(
                `:x: | You are not registered for the random meet.`,
            );
        }

        await db
            .delete(tables.users)
            .where(eq(tables.users.discord_id, interaction.user.id));

        interaction.reply(
            `:white_check_mark: | You are successfully unregistered for the random meet.`,
        );
    },
};
