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
    ChannelType,
    Partials,
    ButtonInteraction,
} from "discord.js";
import { readdirSync } from "fs";
import db from "./database";
import tables from "./database/tables";
import { and, eq, not, notInArray, or } from "drizzle-orm";
import { Messages } from "./constants";
import { getChatSessions, stopChatSessions } from "./utils/chats";
import { randomInt } from "./utils/random";

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
    // @ts-ignore
    partials: Object.values(Partials).filter((bit) => !isNaN(bit)),
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

client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;
    if (message.channel.type !== ChannelType.DM) return;

    let sessions = await db
        .select()
        .from(tables.chats)
        .where(
            or(
                eq(tables.chats.first, message.author.id),
                eq(tables.chats.second, message.author.id),
            ),
        );

    if (sessions.length === 0) return message.reply(Messages.NO_CHAT_SESSIONS);

    if (message.content.length > 1900)
        return message.reply({
            content: Messages.MESSAGE_TOO_LONG,
        });

    let session = sessions[0];

    let contact = session!.first;
    if (session!.first === message.author.id) {
        contact = session!.second;
    }

    let discordContact = client.users.cache.get(contact!);

    try {
        let dm = await discordContact!.createDM();
        dm?.send(`**Anonymous:** ${message.content}`);
    } catch (e) {
        message.reply(Messages.MESSAGE_ERROR_OCCURED);
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

client.on(Events.InteractionCreate, async (interaction: ButtonInteraction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === "unregister") {
        await stopChatSessions(interaction.user, interaction.client);

        await db
            .delete(tables.users)
            .where(eq(tables.users.discord_id, interaction.user.id));

        if (interaction.message.deletable) interaction.message.delete();

        await interaction.reply(Messages.UNREGISTERED);
    } else if (interaction.customId === "reroll") {
        await stopChatSessions(interaction.user, interaction.client);

        if (interaction.message.deletable) interaction.message.delete();

        let chats = await db.select().from(tables.chats);
        const firsts = chats.map((c) => c.first);
        const seconds = chats.map((c) => c.second);

        let users = await db
            .select()
            .from(tables.users)
            .where(
                and(
                    not(eq(tables.users.discord_id, interaction.user.id)),
                    notInArray(tables.users.discord_id, firsts),
                    notInArray(tables.users.discord_id, seconds),
                ),
            );

        if (users.length === 0) {
            return await interaction.reply(Messages.NO_USER_AVAILABLE);
        }

        let user = users[randomInt(0, users.length - 1)];
        const chat: typeof tables.chats.$inferInsert = {
            first: interaction.user.id,
            second: user!.discord_id,
        };

        await db.insert(tables.chats).values(chat);
        try {
            let discordUser = interaction.client.users.cache.get(
                user!.discord_id,
            );

            let dm = await discordUser?.createDM();
            dm?.send(Messages.OTHER_USER_ROLL);

            dm?.send(Messages.OTHER_USER_ROLL_WARNING);

            return await interaction.reply(Messages.USER_ROLL);
        } catch (e) {
            console.error(e);

            await db
                .delete(tables.chats)
                .where(eq(tables.chats.first, interaction.user.id));

            return await interaction.reply(Messages.ROLL_ERROR);
        }
    }
});

client.login(process.env.TOKEN);
