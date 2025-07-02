import { EmbedBuilder, type CommandInteraction } from "discord.js";
import { getLevel } from "../utils/level";
import tables from "../database/tables";
import db from "../database";
import { eq } from "drizzle-orm";

const perks = [
    {
        name: "Attachment",
        level: 3,
        description: "To be able to send attachment",
    },
    {
        name: "Voice messages",
        level: 5,
        description: "To be able to send voice messages",
    },
];

export default {
    data: {
        name: "perks",
        description: "Show level's perks",
        integration_types: [1],
        contexts: [1],
    },
    async execute(interaction: CommandInteraction) {
        const embed = new EmbedBuilder()
            .setTitle("Perks")
            .setFooter({ text: "Level's perks" })
            .setTimestamp();

        let levels = await db
            .select()
            .from(tables.level)
            .where(eq(tables.level.discord_id, interaction.user.id))
            .limit(1);

        let level: typeof tables.level.$inferSelect = {
            discord_id: interaction.user.id,
            xp: 0,
        };

        if (levels.length !== 0)
            level = levels[0] as typeof tables.level.$inferSelect;

        const { level: ln } = getLevel(level.xp!);

        perks.forEach((perk) => {
            embed.addFields({
                name: `${ln >= perk.level ? ":white_check_mark:" : ":x:"} | ${perk.name} - Level ${perk.level}`,
                value: `${perk.description}`,
            });
        });

        await interaction.reply({ embeds: [embed] });
    },
};
