const { logger } = require("../../../utils/logger");
const guild = require("../../../schemas/guild");

module.exports = async (client) => {
    client.riffy.on("playerDisconnect", async (player) => {
        const data = await guild.findOne({ guildId: player.guildId });
        logger(`A player got destroyed at (${player.guildId})`, "warn");

        setTimeout( async () => {
            const playerExist = client.riffy.players.get(player.guildId);
            if (data && data.reconnect.status && !playerExist) {
                
                const voiceChannel = data.reconnect.voiceChannel;
                const textChannel = data.reconnect.textChannel;

                const voiceChannelObj = client.channels.cache.get(voiceChannel);
                const textChannelObj = client.channels.cache.get(textChannel);

                if (voiceChannelObj && textChannelObj) {
                    try {
                        await client.riffy.createConnection({
                            guildId: player.guildId,
                            voiceChannel: voiceChannel, 
                            textChannel: textChannel,
                            deaf: true
                        });
                        logger(`Reconnected to voice channel ${voiceChannelObj.name} in guild ${player.guildId}`, "info");
                    } catch (err) {
                        logger(`Could not reconnect to voice channel: ${err.message}`, "error");
                    }
                } else {
                    logger(`Voice channel or text channel not found for guild ${player.guildId}`, "warn");
                }
            }
        }, 500);
    });
};