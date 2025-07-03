import {
    Client,
    Events,
    GatewayIntentBits,
    Collection,
    type Interaction,
    REST,
    ChannelType,
    Partials,
} from "discord.js";

// Events
import buttonEvent from "./events/button";
import messageEvent from "./events/message";
import readyEvent from "./events/ready";
import commandEvent from "./events/command";

// Utilities
import { Logger } from "./utils/log";
import { loadCommands } from "./utils/commands";
await Logger.init();

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
await loadCommands(client);

client.once(Events.ClientReady, readyEvent);

client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;
    if (message.channel.type !== ChannelType.DM) return;
    return await messageEvent(message);
});

client.on(Events.InteractionCreate, async (interaction: Interaction) => {
    if (!interaction.isChatInputCommand()) return;
    return await commandEvent(interaction);
});

client.on(Events.InteractionCreate, async (interaction: Interaction) => {
    if (!interaction.isButton()) return;
    return await buttonEvent(interaction);
});

client.login(process.env.TOKEN);
