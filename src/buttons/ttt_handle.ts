import type { ButtonInteraction, DMChannel, Message } from "discord.js";
import db from "../database";
import tables from "../database/tables";
import { eq } from "drizzle-orm";
import { getChatSessions } from "../utils/chats";
import { Messages } from "../constants";

async function _editMessage(
    channel: string,
    message: string,
    content: string,
    components: object,
) {
    let res = await fetch(
        `https://discord.com/api/v10/channels/${channel}/messages/${message}`,
        {
            method: "PATCH",
            body: JSON.stringify({
                content,
                components,
            }),
            headers: {
                Authorization: `Bot ${process.env.TOKEN!}`,
                "Content-Type": "application/json",
            },
        },
    );
}

async function editMessage(
    channel: string,
    message: string,
    player: string,
    other_turn: string,
    first_emoji: string,
    second_emoji: string,
    rows: object[],
) {
    await _editMessage(
        channel,
        message,
        `${other_turn === "first" ? first_emoji : second_emoji} | ${other_turn === player ? Messages.YOUR_TURN_TTT : Messages.OTHER_TURN_TTT}`,
        rows,
    );
}

async function disableAllButtons(
    rows: { components: { disabled: boolean }[] }[],
) {
    rows = rows.map((row) => {
        row.components = row.components?.map(
            (component: { disabled: boolean }) => {
                component.disabled = true;
                return component;
            },
        );
        return row;
    });
}

const values = {
    first: 1,
    second: 4,
    void: 0,
};

export default async function (interaction: ButtonInteraction) {
    let [_, rawPosition, rawGameId] = interaction.customId.split("_");
    let [position, gameId] = [parseInt(rawPosition!), parseInt(rawGameId!)];

    let game = (
        await db
            .select()
            .from(tables.tictactoe)
            .where(eq(tables.tictactoe.game_id, gameId))
            .limit(1)
    )[0];

    if (interaction.user.id !== game![game!.turn!]) {
        return await interaction.reply({
            content: Messages.NOT_YOUR_TURN_TTT,
            ephemeral: true,
        });
    }

    let other_turn = game!.turn! === "first" ? "second" : "first";

    let messages = {
        first: {
            channel: game!.first_channel,
            message: game!.first_message,
        },
        second: {
            channel: game!.second_channel,
            message: game!.second_message,
        },
    };

    game = (
        await db
            .update(tables.tictactoe)
            // @ts-ignore
            .set({ [position.toString()]: game!.turn!, turn: other_turn })
            .where(eq(tables.tictactoe.game_id, gameId))
            .returning()
    )[0];

    let positions_horizontal: Array<Array<number>> = [
        [values[game!["0"]!]!, values[game!["1"]!]!, values[game!["2"]!]!],
        [values[game!["3"]!]!, values[game!["4"]!]!, values[game!["5"]!]!],
        [values[game!["6"]!]!, values[game!["7"]!]!, values[game!["8"]!]!],
    ];

    let positions_vertical: Array<Array<number>> = [
        [values[game!["0"]!]!, values[game!["3"]!]!, values[game!["6"]!]!],
        [values[game!["1"]!]!, values[game!["4"]!]!, values[game!["7"]!]!],
        [values[game!["2"]!]!, values[game!["5"]!]!, values[game!["8"]!]!],
    ];

    const sum_horizontal = positions_horizontal.map((position) =>
        position.reduce((partialSum, p) => partialSum + p, 0),
    );

    const sum_vertical = positions_vertical.map((position) =>
        position.reduce((partialSum, p) => partialSum + p, 0),
    );

    const sum_diagonal = [
        positions_horizontal[0]![0]! +
            positions_horizontal[1]![1]! +
            positions_horizontal[2]![2]!,
        positions_horizontal[2]![0]! +
            positions_horizontal[1]![1]! +
            positions_horizontal[0]![2]!,
    ];

    const sums = [...sum_horizontal, ...sum_vertical, ...sum_diagonal];

    let rows = interaction.message.components.map((c) => c.toJSON());
    let disabledNum = 0;
    for (let i = 0; i < rows.length; i++) {
        // @ts-ignore
        let components = rows[i]!.components;
        for (let j = 0; j < components.length; j++) {
            let component = components[j];
            let [_, rawComponentPosition, rawComponentGameId] =
                component.custom_id.split("_");
            let [componentPosition, componentGameId] = [
                parseInt(rawComponentPosition!),
                parseInt(rawComponentGameId!),
            ];

            // @ts-ignore
            component.disabled = game![componentPosition.toString()] !== "void";
            if (component.disabled) {
                component.emoji = {
                    id: null,
                    // @ts-ignore
                    name: game![`${game![componentPosition.toString()]}_emoji`],
                };

                disabledNum++;
            }

            // @ts-ignore
            rows[i].components[j] = component;
        }
    }

    let sum_first = sums.filter((sum: number) => sum === values.first * 3);
    let sum_second = sums.filter((sum: number) => sum === values.second * 3);

    if (sum_first.length !== 0) {
        // @ts-ignore
        disableAllButtons(rows);

        await _editMessage(
            messages.first.channel!,
            messages.first.message!,
            Messages.WON_TTT,
            rows,
        );

        await _editMessage(
            messages.second.channel!,
            messages.second.message!,
            Messages.LOST_TTT,
            rows,
        );
    } else if (sum_second.length !== 0) {
        // @ts-ignore
        disableAllButtons(rows);

        await _editMessage(
            messages.first.channel!,
            messages.first.message!,
            Messages.LOST_TTT,
            rows,
        );

        await _editMessage(
            messages.second.channel!,
            messages.second.message!,
            Messages.WON_TTT,
            rows,
        );
    } else if (disabledNum >= 9) {
        // @ts-ignore
        disableAllButtons(rows);

        await _editMessage(
            messages.first.channel!,
            messages.first.message!,
            Messages.EQUALITY_TTT,
            rows,
        );

        await _editMessage(
            messages.second.channel!,
            messages.second.message!,
            Messages.EQUALITY_TTT,
            rows,
        );
    } else {
        await editMessage(
            messages.first.channel!,
            messages.first.message!,
            "first",
            other_turn,
            game!.first_emoji!,
            game!.second_emoji!,
            rows,
        );

        await editMessage(
            messages.second.channel!,
            messages.second.message!,
            "second",
            other_turn,
            game!.first_emoji!,
            game!.second_emoji!,
            rows,
        );
    }

    await interaction.deferUpdate();
}
