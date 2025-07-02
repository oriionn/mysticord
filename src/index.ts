import { join } from "path";
import { configure, getConsoleSink, getLogger } from "@logtape/logtape";
import { prettyFormatter } from "@logtape/pretty";
import {
    Client,
    Events,
    GatewayIntentBits,
    Collection,
    MessageFlags,
    type Interaction,
    REST,
    Routes,
} from "discord.js";
import { readdirSync } from "fs";

// Logs
await configure({
    sinks: {
        console: getConsoleSink({ formatter: prettyFormatter }),
    },
    loggers: [
        {
            category: "mysticord",
            sinks: ["console"],
        },
        {
            category: ["logtape", "meta"],
            sinks: [],
        },
    ],
});

const logger = getLogger(["mysticord"]);

const client = new Client({
    // @ts-ignore
    intents: Object.values(GatewayIntentBits).filter((bit) => !isNaN(bit)),
});

// @ts-ignore
client.commands = new Collection();

const foldersPath = join(__dirname, "commands");
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

const rest = new REST().setToken(process.env.TOKEN);

client.once(Events.ClientReady, async (readyClient) => {
    logger.info("Ready! Logged in as {tag}", {
        tag: readyClient.user.tag,
    });

    try {
        const commands = Array.from(
            // @ts-ignore
            client.commands,
            ([name, value]) => value.data,
        );

        logger.info(`Started refreshing {length} application (/) commands.`, {
            // @ts-ignore
            length: commands.length,
        });

        const data = await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
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
});

client.on(Events.InteractionCreate, async (interaction: Interaction) => {
    if (!interaction.isChatInputCommand()) return;

    // @ts-ignore
    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        logger.error(`No command matching {commandName} was found.`, {
            commandName: interaction.commandName,
        });
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({
                content: "There was an error while executing this command!",
                flags: MessageFlags.Ephemeral,
            });
        } else {
            await interaction.reply({
                content: "There was an error while executing this command!",
                flags: MessageFlags.Ephemeral,
            });
        }
    }
});

client.login(process.env.TOKEN);
