export function getLevel(xp: number) {
    let start = 1;
    let level = 0;
    let size = 4;

    while (xp >= start + size) {
        start += size;
        level += 1;
        size *= 2;
        if (level == 1) {
            size = 5;
        }
    }

    let next_threshold = start + size;
    return { level, next_threshold, current_threshold: start };
}

export function progress_bar(percentage: number) {
    let num_ascii = Math.trunc(percentage / 5);

    let progress = "";
    for (let i = 0; i < num_ascii; i++) progress += "█";
    for (let i = 0; i < 20 - num_ascii; i++) progress += "░";

    return progress;
}
