import { CommandInteraction, EmbedBuilder } from "discord.js";

export default {
    data: {
        name: "help",
        description: "Show the bot's help menu",
        integration_types: [1],
        contexts: [1],
    },
    async execute(interaction: CommandInteraction) {
        let embed = new EmbedBuilder()
            .setTitle("Help menu")
            .setFooter({
                text: `Mysticord's help menu`,
            })
            .setTimestamp();

        // @ts-ignore
        let commands = interaction.client.commands.map((c: any) => c);

        commands.forEach(
            (command: { data: { name: string; description: string } }) => {
                embed.addFields({
                    name: `/${command.data.name}`,
                    value: command.data.description,
                });
            },
        );

        await interaction.reply({
            embeds: [embed],
        });
    },
};
