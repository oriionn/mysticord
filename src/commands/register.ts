import {
    CommandInteraction,
    SlashCommandBuilder,
    type Interaction,
} from "discord.js";

export default {
    data: {
        name: "register",
        description: "Register for the random meet",
        integration_types: [1],
        contexts: [1],
    },
    async execute(interaction: CommandInteraction) {
        await interaction.reply("Registered! ");
    },
};
