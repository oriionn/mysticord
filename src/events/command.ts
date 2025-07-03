import { MessageFlags, type CommandInteraction } from "discord.js";
import { Logger } from "../utils/log";
import { Messages } from "../constants";

const logger = Logger.get("discord.js");

export default async function (interaction: CommandInteraction) {
    // @ts-ignore
    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        logger.error(`No command matching {commandName} was found.`, {
            commandName: interaction.commandName,
        });
        return;
    }

    logger.trace("User {user} executed {command}", {
        user: interaction.user.tag,
        command: `/${interaction.commandName}`,
    });

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({
                content: Messages.ERROR_EXECUTING_COMMAND,
                flags: MessageFlags.Ephemeral,
            });
        } else {
            await interaction.reply({
                content: Messages.ERROR_EXECUTING_COMMAND,
                flags: MessageFlags.Ephemeral,
            });
        }
    }
}
