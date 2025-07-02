import { EmbedBuilder, type CommandInteraction } from "discord.js";
import db from "../database";
import tables from "../database/tables";
import { eq } from "drizzle-orm";
import { getLevel, progress_bar } from "../utils/level";

export default {
    data: {
        name: "rank",
        description: "Show your level rank",
        integration_types: [1],
        contexts: [1],
    },
    async execute(interaction: CommandInteraction) {
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

        let {
            level: ln,
            next_threshold,
            current_threshold,
        } = getLevel(level.xp!);
        let percentage =
            ((level.xp! - current_threshold) / next_threshold) * 100;
        let progress = progress_bar(percentage);

        const embed = new EmbedBuilder()
            .setTitle(`${interaction.user.tag}'s level`)
            .setDescription(
                `**Level:** ${ln} / **XP:** ${level.xp! - current_threshold} exp\n\n${progress} **${percentage}%**`,
            )
            .setFooter({
                text: `Mysticord - Level system`,
            })
            .setTimestamp();

        interaction.reply({
            embeds: [embed],
        });
    },
};
