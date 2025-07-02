import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    type CommandInteraction,
} from "discord.js";
import db from "../database";
import tables from "../database/tables";
import { randomInt } from "../utils/random";
import { and, eq, not, notInArray, or } from "drizzle-orm";
import { Messages } from "../constants";

export default {
    data: {
        name: "roll",
        description: "Roll to chat with a random user",
        integration_types: [1],
        contexts: [1],
    },
    async execute(interaction: CommandInteraction) {
        let currentUser = await db
            .select()
            .from(tables.users)
            .where(eq(tables.users.discord_id, interaction.user.id))
            .limit(1);

        if (currentUser.length === 0) {
            return await interaction.reply(Messages.NOT_REGISTERED);
        }

        let currentUserChats = await db
            .select()
            .from(tables.chats)
            .where(
                or(
                    eq(tables.chats.first, interaction.user.id),
                    eq(tables.chats.second, interaction.user.id),
                ),
            );

        if (currentUserChats.length !== 0) {
            const confirm = new ButtonBuilder()
                .setCustomId("reroll")
                .setLabel("Reroll")
                .setStyle(ButtonStyle.Success);

            const row = new ActionRowBuilder().addComponents(confirm);

            return await interaction.reply({
                content: Messages.REROLL_CONFIRM,
                components: [row],
            });
        }

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
    },
};
