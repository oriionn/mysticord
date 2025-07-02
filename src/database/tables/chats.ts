import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const chats = sqliteTable("chats", {
    first: text(),
    second: text(),
});
