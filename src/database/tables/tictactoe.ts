import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const tictactoe = sqliteTable("tictactoe", {
    game_id: int().primaryKey({ autoIncrement: true }),
    first: text(),
    second: text(),
    first_message: text(),
    second_message: text(),
    first_channel: text(),
    second_channel: text(),
    first_emoji: text(),
    second_emoji: text(),
    "0": text({ enum: ["void", "first", "second"] }).default("void"),
    "1": text({ enum: ["void", "first", "second"] }).default("void"),
    "2": text({ enum: ["void", "first", "second"] }).default("void"),
    "3": text({ enum: ["void", "first", "second"] }).default("void"),
    "4": text({ enum: ["void", "first", "second"] }).default("void"),
    "5": text({ enum: ["void", "first", "second"] }).default("void"),
    "6": text({ enum: ["void", "first", "second"] }).default("void"),
    "7": text({ enum: ["void", "first", "second"] }).default("void"),
    "8": text({ enum: ["void", "first", "second"] }).default("void"),
    turn: text({ enum: ["first", "second"] }),
});
