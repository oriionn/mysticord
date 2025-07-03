import { REST, Routes, type Client } from "discord.js";
import { Logger } from "../utils/log";

const logger = Logger.get("mysticord");
const rest = new REST().setToken(process.env.TOKEN!);

export default async function (readyClient: Client) {
    logger.info("Ready! Logged in as {tag}", {
        tag: readyClient?.user?.tag,
    });

    try {
        const commands = Array.from(
            // @ts-ignore
            readyClient.commands,
            ([name, value]) => value.data,
        );

        logger.info(`Started refreshing {length} application (/) commands.`, {
            // @ts-ignore
            length: commands.length,
        });

        const data = await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID!),
            // @ts-ignore
            { body: commands },
        );

        logger.info(
            `Successfully reloaded {length} application (/) commands.`,
            {
                length: commands.length,
            },
        );
    } catch (e) {
        console.error(e);
    }
}
