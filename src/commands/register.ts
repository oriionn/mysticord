import { CommandInteraction } from "discord.js";
import db from "../database";
import tables from "../database/tables";
import { eq } from "drizzle-orm";
import { Messages } from "../constants";

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
            return await interaction.reply(Messages.ALREADY_REGISTERED);
        }

        const user: typeof tables.users.$inferInsert = {
            discord_id: interaction.user.id,
        };

        await db.insert(tables.users).values(user);

        await interaction.reply(Messages.REGISTERED);
    },
};
