import { type CommandInteraction } from "discord.js";
import db from "../database";
import tables from "../database/tables";
import { eq } from "drizzle-orm";
import { Messages } from "../constants";

export default {
    data: {
        name: "username",
        description: "Customize your username on your chat message",
        integration_types: [1],
        contexts: [1],
        options: [
            {
                type: 3,
                name: "username",
                description:
                    "The username that will be displayed when you send a message via chat sessions.",
                required: true,
                min_length: 3,
            },
        ],
    },
    async execute(interaction: CommandInteraction) {
        let username = interaction.options.getString("username");

        let usernames = await db
            .select()
            .from(tables.username)
            .where(eq(tables.username.discord_id, interaction.user.id));

        if (usernames.length === 0) {
            await db.insert(tables.username).values({
                discord_id: interaction.user.id,
                username,
            });
        } else {
            await db.update(tables.username).set({
                username,
            });
        }

        await interaction.reply(Messages.USERNAME_CHANGED + username + "`.");
    },
};
