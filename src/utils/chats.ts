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
        let session = sessions[0];

        await db
            .delete(tables.chats)
            .where(
                or(
                    eq(tables.chats.first, user.id),
                    eq(tables.chats.second, user.id),
                ),
            );

        let contact = session!.first;
        if (contact === user.id) {
            contact = session!.second;
        }

        try {
            let contactUser = client.users.cache.get(contact!);
            let dm = await contactUser?.createDM();

            dm?.send(Messages.CHAT_SESSION_STOP);
        } catch (e) {
            console.log(e);
        }
    }
}
