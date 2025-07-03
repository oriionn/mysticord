import { AttachmentBuilder, type Message } from "discord.js";
import db from "../database";
import tables from "../database/tables";
import { eq, or } from "drizzle-orm";
import { Messages } from "../constants";
import { getLevel } from "../utils/level";
import { sendVoice } from "../utils/voice";

export default async function (message: Message) {
    let sessions = await db
        .select()
        .from(tables.chats)
        .where(
            or(
                eq(tables.chats.first, message.author.id),
                eq(tables.chats.second, message.author.id),
            ),
        );

    if (sessions.length === 0) return message.reply(Messages.NO_CHAT_SESSIONS);

    if (message.content.length > 1900)
        return message.reply({
            content: Messages.MESSAGE_TOO_LONG,
        });

    let session = sessions[0];

    let contact = session!.first;
    if (session!.first === message.author.id) {
        contact = session!.second;
    }

    let discordContact = message.client.users.cache.get(contact!);

    let usernames = await db
        .select()
        .from(tables.username)
        .where(eq(tables.username.discord_id, message.author.id))
        .limit(1);

    let username = "Anonymous";
    if (usernames.length !== 0) {
        username = usernames[0]?.username!;
    }

    let levels = await db
        .select()
        .from(tables.level)
        .where(eq(tables.level.discord_id, message.author.id))
        .limit(1);

    if (levels.length === 0) {
        const l: typeof tables.level.$inferInsert = {
            discord_id: message.author.id,
            xp: 0,
        };

        await db.insert(tables.level).values(l);
        levels.push(l);
    }

    let level = levels[0];
    // @ts-ignore
    let cooldown = message.client.cooldown.get(message.author.id);
    if (
        !cooldown ||
        (cooldown && new Date().getTime() - cooldown.getTime() >= 5000)
    ) {
        level!.xp! += 1;
        await db
            .update(tables.level)
            .set({ xp: level!.xp })
            .where(eq(tables.level.discord_id, message.author.id));

        // @ts-ignore
        message.client.cooldown.set(message.author.id, new Date());
    }

    let attachments: AttachmentBuilder[] = [];
    if (getLevel(level!.xp!).level >= 3) {
        attachments = message.attachments.map(
            (a) =>
                new AttachmentBuilder(a.attachment, {
                    name: a.name,
                    description: a.description,
                    spoiler: a.spoiler,
                }),
        );
    }

    try {
        let dm = await discordContact!.createDM();

        if (message.flags.bitfield === 8192) {
            if (getLevel(level!.xp!).level >= 5) {
                dm?.send({
                    content: `**${username}:**`,
                });

                const ass = message.attachments.map((a) => a);
                const a = ass[0];
                return sendVoice(a?.url!, dm.id, a?.waveform!, a?.duration!);
            } else {
                return await message.reply(Messages.VOICE_MESSAGE_NOT_LEVEL);
            }
        }

        dm?.send({
            content: `**${username}:** ${message.content}`,
            files: attachments,
        });
    } catch (e) {
        console.error(e);
        message.reply(Messages.MESSAGE_ERROR_OCCURED);
    }
}
