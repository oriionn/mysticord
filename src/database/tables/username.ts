import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const username = sqliteTable("username", {
    discord_id: text(),
    username: text(),
});
