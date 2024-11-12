const { client_id } = require("../../../config");
const { logger } = require("../../../utils/logger");
const Reconnect = require("../../../Schemas/247Connection");
const client = require("../../../Aria");

module.exports = async () => {
    const guilds = client.guilds.cache;

    client.riffy.init(client_id)
    logger(`Successfully Initiate Riffy Events`, "debug");

    for (const guild of guilds.values()) {
        const data = await Reconnect.findOne({ GuildId: guild.id });
    
        if (data) {
            const voiceChannel = guild.channels.cache.get(data.VoiceChannelId);
    
            try {
                await client.riffy.createConnection({
                    guildId: data.GuildId, 
                    voiceChannel: data.VoiceChannelId, 
                    textChannel: data.TextChannelId,
                    deaf: true
                });
        
                logger(`Reconnected to ${voiceChannel.name} in ${guild.name}`, "warn");
        
            } catch (err) {
                logger(`Could not reconnect to voice channel: ${err.message}`, "error");
            }
        }
    }
};