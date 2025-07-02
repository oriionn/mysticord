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
    AttachmentBuilder,
} from "discord.js";
import { readdirSync } from "fs";
import db from "./database";
import tables from "./database/tables";
import { and, eq, not, notInArray, or } from "drizzle-orm";
import { Messages } from "./constants";
import { getChatSessions, stopChatSessions } from "./utils/chats";
import { randomInt } from "./utils/random";
import { getLevel } from "./utils/level";
import { log } from "console";
import { sendVoice } from "./utils/voice";
import { getFileSink } from "@logtape/file";

// Logs
await configure({
    sinks: {
        console: getConsoleSink({ formatter: prettyFormatter }),
        file: getFileSink("mysticord.log", {
            lazy: true,
        }),
    },
    loggers: [
        {
            category: "mysticord",
            sinks: ["console", "file"],
        },
        {
            category: "discord.js",
            sinks: ["console", "file"],
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
// @ts-ignore
client.cooldown = new Collection();

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

    let usernames = await db
        .select()
        .from(tables.username)
        .where(eq(tables.username.discord_id, message.author.id))
        .limit(1);

    let username = "Anonymous";
    if (usernames.length !== 0) {
        username = usernames[0]?.username!;
    }

    let levels = await db
        .select()
        .from(tables.level)
        .where(eq(tables.level.discord_id, message.author.id))
        .limit(1);

    if (levels.length === 0) {
        const l: typeof tables.level.$inferInsert = {
            discord_id: message.author.id,
            xp: 0,
        };

        await db.insert(tables.level).values(l);
        levels.push(l);
    }

    let level = levels[0];
    // @ts-ignore
    let cooldown = client.cooldown.get(message.author.id);
    if (
        !cooldown ||
        (cooldown && new Date().getTime() - cooldown.getTime() >= 5000)
    ) {
        level!.xp! += 1;
        await db
            .update(tables.level)
            .set({ xp: level!.xp })
            .where(eq(tables.level.discord_id, message.author.id));

        // @ts-ignore
        client.cooldown.set(message.author.id, new Date());
    }

    let attachments = [];
    if (getLevel(level!.xp!).level >= 3) {
        attachments = message.attachments.map(
            (a) =>
                new AttachmentBuilder(a.attachment, {
                    name: a.name,
                    description: a.description,
                    spoiler: a.spoiler,
                }),
        );
    }

    try {
        let dm = await discordContact!.createDM();

        if (message.flags.bitfield === 8192) {
            if (getLevel(level!.xp!).level >= 5) {
                dm?.send({
                    content: `**${username}:**`,
                });

                const ass = message.attachments.map((a) => a);
                const a = ass[0];
                return sendVoice(a?.url!, dm.id, a?.waveform!, a?.duration!);
            } else {
                return await message.reply(Messages.VOICE_MESSAGE_NOT_LEVEL);
            }
        }

        dm?.send({
            content: `**${username}:** ${message.content}`,
            files: attachments,
        });
    } catch (e) {
        console.error(e);
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

    let loggerr = getLogger(["discord.js"]);
    loggerr.trace("User {user} executed {command}", {
        user: interaction.user.tag,
        command: `/${interaction.commandName}`,
    });

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
