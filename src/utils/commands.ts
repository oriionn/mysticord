import type { Client } from "discord.js";
import { readdirSync } from "fs";
import { join } from "path";
import { Logger } from "./log";

const logger = Logger.get("mysticord");

export async function loadCommands(client: Client) {
    const foldersPath = join(__dirname, "..", "commands");
    const commandsFiles = readdirSync(foldersPath);

    for (const file of commandsFiles) {
        const filePath = join(foldersPath, file);
        const command = (await import(filePath)).default;

        if ("data" in command && "execute" in command) {
            // @ts-ignore
            client.commands.set(command.data.name, command);
        } else {
            logger.warn(
                "The command at {filepath} is missing a required {data} or {execute} property.",
                {
                    filepath: filePath,
                    execute: "execute",
                    data: "data",
                },
            );
        }
    }
}
