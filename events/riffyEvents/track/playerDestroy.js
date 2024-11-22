const { logger } = require("../../../utils/logger");
const Reconnect = require("../../../schemas/247Connection");
const client = require("../../../Aria");

client.riffy.on("playerDisconnect", async (player) => {
    const data = await Reconnect.findOne({ TextChannelId: player.textChannel });
    logger(`A player got destroyed at (${player.guildId})`, "warn");

    setTimeout( async () => {
        const playerExist = client.riffy.players.get(player.guildId);

        if (data && !playerExist) {
            await client.riffy.createConnection({
                guildId: data.GuildId, 
                voiceChannel: data.VoiceChannelId, 
                textChannel: data.TextChannelId,
                deaf: true
            });
        }
    }, 500);
});