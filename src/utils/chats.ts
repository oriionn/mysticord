import { eq, or } from "drizzle-orm";
import db from "../database";
import tables from "../database/tables";
import { Client, User } from "discord.js";
import { Messages } from "../constants";

export async function getChatSessions(userId: string) {
    return await db
        .select()
        .from(tables.chats)
        .where(
            or(eq(tables.chats.first, userId), eq(tables.chats.second, userId)),
        );
}

export async function stopChatSessions(user: User, client: Client) {
    let sessions = await getChatSessions(user.id);
    if (sessions.length !== 0) {
        let contact = getContact(sessions, user.id);

        await db
            .delete(tables.chats)
            .where(
                or(
                    eq(tables.chats.first, user.id),
                    eq(tables.chats.second, user.id),
                ),
            );

        try {
            let contactUser = client.users.cache.get(contact!);
            let dm = await contactUser?.createDM();

            dm?.send(Messages.CHAT_SESSION_STOP);
        } catch (e) {
            console.log(e);
        }
    }
}

export function getContact(
    sessions: (typeof tables.chats.$inferSelect)[],
    userId: string,
) {
    let session = sessions[0];
    let contact = session!.first;
    if (contact === userId) {
        contact = session!.second;
    }

    return contact;
}
