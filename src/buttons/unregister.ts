import type { ButtonInteraction } from "discord.js";
import { stopChatSessions } from "../utils/chats";
import tables from "../database/tables";
import { eq } from "drizzle-orm";
import db from "../database";
import { Messages } from "../constants";

export default async function (interaction: ButtonInteraction) {
    await stopChatSessions(interaction.user, interaction.client);

    await db
        .delete(tables.users)
        .where(eq(tables.users.discord_id, interaction.user.id));

    if (interaction.message.deletable) interaction.message.delete();

    await interaction.reply(Messages.UNREGISTERED);
}
