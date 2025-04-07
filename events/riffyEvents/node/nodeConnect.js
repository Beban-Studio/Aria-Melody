const { logger } = require("../../../utils/logger");
const guildData = require("../../../schemas/guild");

module.exports = async (client) => {
    client.riffy.on("nodeConnect", async (node) => {
        const guilds = client.guilds.cache;
        logger(`Successfully connected to ${node.name}`, "debug");

        for (const guild of guilds.values()) {
            const data = await guildData.findOne({ guildId: guild.id });

            if (data && data.reconnect.status) {
                const voiceChannel = guild.channels.cache.get(data.reconnect.voiceChannel);
            
                try {
                    await client.riffy.createConnection({
                        guildId: data.guildId, 
                        voiceChannel: data.reconnect.voiceChannel, 
                        textChannel: data.reconnect.textChannel,
                        deaf: true
                    });
                
                    logger(`Reconnected to ${voiceChannel.name} in ${guild.name}`, "warn");
                
                } catch (err) {
                    logger(`Could not reconnect to voice channel: ${err.message}`, "error");
                }
            }
        }
    });
};