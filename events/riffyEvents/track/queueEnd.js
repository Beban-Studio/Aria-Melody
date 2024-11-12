const client = require("../../../Aria");

client.riffy.on("queueEnd", async (player) => {
    const channel = client.channels.cache.get(player.textChannel);
    
    if (player.message) await player.message.delete().catch((e) => {});

    if (player.isAutoplay === true) {
        player.autoplay(player)
    } else {
        player.destroy();
        channel.send("\`⌛️\` | Queue has ended.");
    }
});