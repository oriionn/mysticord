import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
    id: int().primaryKey({ autoIncrement: true }),
    discord_id: text().notNull(),
    // registered: int({ mode: "boolean" }),
});
