import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    type ButtonInteraction,
} from "discord.js";
import { getChatSessions, stopChatSessions } from "../utils/chats";
import db from "../database";
import tables from "../database/tables";
import { and, eq, not, notInArray } from "drizzle-orm";
import { Messages } from "../constants";
import { randomInt } from "../utils/random";

export default async function (interaction: ButtonInteraction) {
    let sessions = await getChatSessions(interaction.user.id);
    if (sessions.length === 0)
        return await interaction.reply(Messages.NO_CHAT_SESSIONS);
    let session = sessions[0];

    let contact = session!.first;
    if (contact === interaction.user.id) {
        contact = session!.second;
    }

    switch (interaction.customId) {
        case "unregister":
            await stopChatSessions(interaction.user, interaction.client);

            await db
                .delete(tables.users)
                .where(eq(tables.users.discord_id, interaction.user.id));

            if (interaction.message.deletable) interaction.message.delete();

            await interaction.reply(Messages.UNREGISTERED);
            break;
        case "reroll":
            await stopChatSessions(interaction.user, interaction.client);

            if (interaction.message.deletable) interaction.message.delete();

            let chats = await db.select().from(tables.chats);
            const firsts = chats.map((c) => c.first);
            const seconds = chats.map((c) => c.second);

            let users = await db
                .select()
                .from(tables.users)
                .where(
                    and(
                        not(eq(tables.users.discord_id, interaction.user.id)),
                        notInArray(tables.users.discord_id, firsts),
                        notInArray(tables.users.discord_id, seconds),
                    ),
                );

            if (users.length === 0) {
                return await interaction.reply(Messages.NO_USER_AVAILABLE);
            }

            let user = users[randomInt(0, users.length - 1)];
            const chat: typeof tables.chats.$inferInsert = {
                first: interaction.user.id,
                second: user!.discord_id,
            };

            await db.insert(tables.chats).values(chat);
            try {
                let discordUser = interaction.client.users.cache.get(
                    user!.discord_id,
                );

                let dm = await discordUser?.createDM();
                dm?.send(Messages.OTHER_USER_ROLL);

                dm?.send(Messages.OTHER_USER_ROLL_WARNING);

                return await interaction.reply(Messages.USER_ROLL);
            } catch (e) {
                console.error(e);

                await db
                    .delete(tables.chats)
                    .where(eq(tables.chats.first, interaction.user.id));

                return await interaction.reply(Messages.ROLL_ERROR);
            }
            break;
        case "confirm-reveal":
            try {
                let contactUser = interaction.client.users.cache.get(contact!);
                let dm = await contactUser?.createDM();

                let button = new ButtonBuilder()
                    .setCustomId("reveal")
                    .setLabel("Reveal")
                    .setStyle(ButtonStyle.Primary);

                let row = new ActionRowBuilder().addComponents(button);

                await dm?.send({
                    content: Messages.REVEAL,
                    components: [row],
                });

                return await interaction.reply(Messages.REVEAL_SENT);
            } catch (e) {
                console.error(e);
                return await interaction.reply(Messages.REVEAL_IMPOSSIBLE);
            }
            break;
        case "reveal":
            try {
                let contactUser = interaction.client.users.cache.get(contact!);
                let dm = await contactUser?.createDM();

                await dm?.send({
                    content:
                        Messages.REVEALED +
                        interaction.user.tag +
                        "` (<@" +
                        interaction.user.id +
                        ">).",
                });

                return await interaction.reply({
                    content:
                        Messages.REVEALED +
                        contactUser?.tag +
                        "` (<@" +
                        contactUser?.id +
                        ">).",
                });
            } catch (e) {
                console.error(e);
                return await interaction.reply(Messages.REVEAL_IMPOSSIBLE_BIS);
            }
            break;
    }
}
