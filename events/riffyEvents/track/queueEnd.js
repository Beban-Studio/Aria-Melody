const { parseTimeString } = require("../../../utils/parseTimeString");
const { EmbedBuilder } = require("discord.js");
const config = require("../../../config");

module.exports = async (client) => {
    client.riffy.on("queueEnd", async (player) => {
        const embed = new EmbedBuilder().setColor(config.clientOptions.embedColor);
        const channel = client.channels.cache.get(player.textChannel);
        
        if (player.message) await player.message.delete().catch((err) => {});

        if (player.isAutoplay === true) {
            player.autoplay(player);
        } else {
            player.destroy();
            await channel.send({embeds: [embed.setDescription("The queue is empty. You can make the bot stays by using \`247\` command.")]});
            
            setTimeout(() => {
                message.delete().catch((err) => {});
            }, parseTimeString("30s"));
        }
    });
};