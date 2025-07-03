import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    type ButtonInteraction,
} from "discord.js";
import { getChatSessions, stopChatSessions } from "../utils/chats";
import db from "../database";
import tables from "../database/tables";
import { and, eq, not, notInArray } from "drizzle-orm";
import { Messages } from "../constants";
import { randomInt } from "../utils/random";
import unregister from "../buttons/unregister";
import reveal from "../buttons/reveal";
import reroll from "../buttons/reroll";
import confirmReveal from "../buttons/confirm-reveal";
import { getLogger } from "@logtape/logtape";

const ids = {
    unregister: unregister,
    reveal: reveal,
    reroll: reroll,
    "confirm-reveal": confirmReveal,
};

const logger = getLogger(["mysticord"]);

export default async function (interaction: ButtonInteraction) {
    if (!(interaction.customId in ids))
        return logger.error("Button {customid} has no defined action.", {
            customid: interaction.customId,
        });

    // @ts-ignore
    return await ids[interaction.customId](interaction);
}
