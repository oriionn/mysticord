export async function sendVoice(
    url: string,
    channel: string,
    waveform: string,
    duration: number,
) {
    let formData = new FormData();

    let remoteFile = await fetch(url);
    if (!remoteFile.ok) throw new Error(`File downloading error`);

    formData.append(
        "payload_json",
        JSON.stringify({
            flags: 8192,
            attachments: [
                {
                    id: 0,
                    filename: "voice-message.ogg",
                    waveform,
                    duration_secs: duration,
                },
            ],
        }),
    );

    const blob = await remoteFile.blob();
    const file = new File([blob], "voice-message.ogg", { type: "audio/ogg" });
    formData.append("files[0]", file);

    await fetch(`https://discord.com/api/v10/channels/${channel}/messages`, {
        method: "POST",
        headers: {
            Authorization: `Bot ${process.env.TOKEN!}`,
        },
        body: formData,
    });
}
