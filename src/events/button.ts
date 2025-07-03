import { type ButtonInteraction } from "discord.js";
import unregister from "../buttons/unregister";
import reveal from "../buttons/reveal";
import reroll from "../buttons/reroll";
import confirmReveal from "../buttons/confirm-reveal";
import { Logger } from "../utils/log";

const ids = {
    unregister: unregister,
    reveal: reveal,
    reroll: reroll,
    "confirm-reveal": confirmReveal,
};

const logger = Logger.get("mysticord");

export default async function (interaction: ButtonInteraction) {
    if (!(interaction.customId in ids))
        return logger.error("Button {customid} has no defined action.", {
            customid: interaction.customId,
        });

    // @ts-ignore
    return await ids[interaction.customId](interaction);
}
