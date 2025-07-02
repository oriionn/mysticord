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
        name: "register",
        description: "Register for the random meet",
        integration_types: [1],
        contexts: [1],
    },
    async execute(interaction: CommandInteraction) {
        let users = await db
            .select()
            .from(tables.users)
            .where(eq(tables.users.discord_id, interaction.user.id));

        if (users.length !== 0) {
            return await interaction.reply(
                `:x: | You are already registered for the random meet.`,
            );
        }

        const user: typeof tables.users.$inferInsert = {
            discord_id: interaction.user.id,
        };

        await db.insert(tables.users).values(user);

        await interaction.reply(
            `:white_check_mark: | You are successfully registered for the random meet.`,
        );
    },
};
