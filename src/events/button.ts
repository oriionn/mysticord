import { type ButtonInteraction } from "discord.js";
import unregister from "../buttons/unregister";
import reveal from "../buttons/reveal";
import reroll from "../buttons/reroll";
import confirmReveal from "../buttons/confirm-reveal";
import { Logger } from "../utils/log";
import accept_ttt from "../buttons/accept_ttt";
import ttt_handle from "../buttons/ttt_handle";

const ids = {
    unregister: unregister,
    reveal: reveal,
    reroll: reroll,
    "confirm-reveal": confirmReveal,
    accept_ttt: accept_ttt,
};

const logger = Logger.get("discord.js");

export default async function (interaction: ButtonInteraction) {
    if (
        !(interaction.customId in ids) &&
        !interaction.customId.startsWith("ttt_")
    )
        return logger.error("Button {customid} has no defined action.", {
            customid: interaction.customId,
        });

    logger.trace("User {tag} clicked on {customId}", {
        tag: interaction.user.tag,
        customId: interaction.customId,
    });

    if (interaction.customId.startsWith("ttt_")) {
        return await ttt_handle(interaction);
    }
    // @ts-ignore
    return await ids[interaction.customId](interaction);
}
