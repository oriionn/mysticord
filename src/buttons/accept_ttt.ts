import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    type ButtonInteraction,
} from "discord.js";
import { getChatSessions, getContact } from "../utils/chats";
import { Messages } from "../constants";
import db from "../database";
import tables from "../database/tables";

export default async function (interaction: ButtonInteraction) {
    let sessions = await getChatSessions(interaction.user.id);
    if (sessions.length === 0)
        return await interaction.reply(Messages.NO_CHAT_SESSIONS);
    let contact = getContact(sessions, interaction.user.id);

    // Create game on database

    let turn = "first";
    if (sessions[0]?.first === interaction.user.id) {
        turn = "second";
    }

    let game = await db
        .insert(tables.tictactoe)
        // @ts-ignore
        .values({
            first: sessions[0]?.first,
            second: sessions[0]?.second,
            turn,
        })
        .returning();

    let gameId = game[0]?.game_id;

    // Generate TICTACTOE GAME
    let rows: ActionRowBuilder[] = [];

    let k = 0;
    for (let i = 0; i < 3; i++) {
        let row = new ActionRowBuilder();
        for (let j = 0; j < 3; j++) {
            let button = new ButtonBuilder()
                .setCustomId(`ttt_${k.toString()}_${gameId}`)
                .setStyle(ButtonStyle.Primary)
                .setLabel("‎");

            row.addComponents(button);
            k++;
        }
        rows.push(row);
    }

    try {
        let contactUser = interaction.client.users.cache.get(contact!);
        let dm = await contactUser?.createDM();

        let msg = await dm?.send({
            content:
                Messages.ACCEPTED_TTT + "\n:o: | " + Messages.YOUR_TURN_TTT,
            // @ts-ignore
            components: rows,
        });

        await db.update(tables.tictactoe).set({
            [`${turn}_message`]: msg?.id,
            [`${turn}_channel`]: msg?.channel.id,
            [`${turn}_emoji`]: "⭕",
        });
    } catch (e) {
        console.error(e);
        return await interaction.reply(Messages.IMPOSSIBLE_TTT);
    }

    await interaction.reply({
        content:
            Messages.ACCEPTED_TTT_BIS + "\n:o: | " + Messages.OTHER_TURN_TTT,
        // @ts-ignore
        components: rows,
    });

    let other_turn = turn === "first" ? "second" : "first";
    await db.update(tables.tictactoe).set({
        [`${other_turn}_message`]: (await interaction.fetchReply())?.id,
        [`${other_turn}_channel`]: interaction!.channel?.id,
        [`${other_turn}_emoji`]: "❌",
    });

    if (interaction.message.deletable)
        return await interaction.message.delete();
}
