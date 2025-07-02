import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const level = sqliteTable("level", {
    discord_id: text(),
    xp: int(),
});
